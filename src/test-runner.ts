import { Annotation, Constructor, Metadata, TestMethod, DEFAULT_ORDER, Scope } from "./common";

import StringBuilder from "./utils/string-builder";
import { flatten } from "./utils/array-utils";
import { getDescendantsOfType } from "./utils/instance-utils";
import { getAnnotation, getClassMetadata, hasMetadata } from "./utils/metadata";

type TestClassInstance = Record<string, Callback>;
type TestClassConstructor = Constructor<TestClassInstance>;

const RUN_SERVICE = game.GetService("RunService");
const IS_CLIENT = RUN_SERVICE.IsClient();

type TestClassType = {
	[Metadata.TestList]: Map<string, TestMethod>;
	setUp?: Callback;
	beforeAll?: Callback;
	beforeEach?: Callback;
	afterAll?: Callback;
	afterEach?: Callback;

	[key: string]: unknown;
};

interface TestCaseResult {
	readonly passed: boolean;
	readonly errorMessage?: string;
	readonly timeElapsed: number;
	readonly skipped: boolean;
}

export class TestRunner {
	private readonly testClasses: [TestClassConstructor, TestClassInstance][];
	private results: Map<TestClassConstructor, Map<TestMethod, TestCaseResult>>;

	private failedTests: number;
	private passedTests: number;
	private skippedTests: number;

	public constructor(roots: Instance[], _?: object) {
		this.testClasses = new Array<[TestClassConstructor, TestClassInstance]>();
		this.results = new Map<TestClassConstructor, Map<TestMethod, TestCaseResult>>();
		this.failedTests = 0;
		this.passedTests = 0;
		this.skippedTests = 0;

		const modules = flatten(roots.map((root) => getDescendantsOfType(root, "ModuleScript")));
		for (const module of modules) {
			const testClass = <Constructor>require(module);
			this.addClass(testClass);
		}
	}

	private addClass(ctor: Constructor): void {
		if (ctor === undefined || (ctor as unknown as { new: unknown }).new === undefined) return;

		const testClass = <TestClassConstructor>ctor;
		const newClass = <TestClassInstance>new ctor();

		if (newClass.setUp !== undefined) {
			newClass.setUp(newClass);
		}

		this.testClasses.push([testClass, newClass]);
	}

	public async run(): Promise<void> {
		const start = os.clock();

		const promisesToResolve: Promise<void>[] = [];

		for (const [testClass, testClassInstance] of this.testClasses) {
			// run beforeAll here

			try {
				const beforeAllCallbacks = getAnnotation(testClass, Annotation.BeforeAll);
				beforeAllCallbacks.forEach((callback) => callback());
			} finally {
				const runClass = this.runTestClass(testClass, testClassInstance);

				runClass.forEach((promise) => {
					promisesToResolve.push(promise);
				});
			}
		}

		await Promise.all(promisesToResolve).then(() => {
			const elapsedTime = os.clock() - start;
			print(this.generateOutput(elapsedTime));
		});
	}

	private getTestsFromTestClass(testClass: TestClassConstructor): ReadonlyArray<TestMethod> {
		if (hasMetadata(testClass, Metadata.TestList) === false) return [];

		const list: Map<string, TestMethod> = (testClass as unknown as TestClassType)[Metadata.TestList];

		const res = new Array<TestMethod>();
		list.forEach((val) => {
			// make sure each TestMethod isATest
			if (val.options.isATest === true) {
				res.push(val);
			}
		});

		// Order the tests by the order where the default order is 999
		res.sort((a, b) => {
			return (
				(a.options.order !== undefined ? a.options.order : DEFAULT_ORDER) <=
				(b.options.order !== undefined ? b.options.order : DEFAULT_ORDER)
			);
		});

		return res;
	}

	private runTestClass(testClass: TestClassConstructor, testClassInstance: TestClassInstance): Promise<void>[] {
		const addResult = (test: TestMethod, result: TestCaseResult) => {
			let classResults = this.results.get(testClass);
			if (classResults === undefined) {
				const newMap = new Map<TestMethod, TestCaseResult>();
				this.results.set(testClass, newMap);
				classResults = newMap;
			}

			classResults.set(test, result);
		};

		const fail = (
			exception: unknown,
			test: TestMethod,
			results: Omit<TestCaseResult, "errorMessage" | "skipped" | "passed">,
		): void => {
			this.failedTests++;
			addResult(test, {
				passed: false,
				errorMessage: tostring(exception),
				timeElapsed: results.timeElapsed,
				skipped: false,
			});
		};

		const pass = (test: TestMethod, results: Omit<TestCaseResult, "errorMessage" | "skipped" | "passed">): void => {
			this.passedTests++;
			addResult(test, {
				passed: true,
				timeElapsed: results.timeElapsed,
				skipped: false,
			});
		};

		const skip = (test: TestMethod, results: Omit<TestCaseResult, "errorMessage" | "skipped" | "passed">): void => {
			this.skippedTests++;
			addResult(test, {
				passed: false,
				timeElapsed: results.timeElapsed,
				skipped: true,
			});
		};

		const runTestCase = async (callback: Callback, test: TestMethod): Promise<void> => {
			const start = os.clock();
			try {
				await callback();
			} catch (e) {
				const timeElapsed = os.clock() - start;
				fail(e, test, { timeElapsed });
				return Promise.resolve();
			}

			const timeElapsed = os.clock() - start;
			pass(test, { timeElapsed });
			return Promise.resolve();
		};

		const testList = this.getTestsFromTestClass(testClass);

		const testPromises = testList.map(async (test) => {
			await Promise.try(() => {
				const beforeEachCallbacks = getAnnotation(testClass, Annotation.BeforeEach);
				beforeEachCallbacks.forEach((callback) => callback(testClassInstance));
			});

			// skip the test before it can be executed
			if (test.options.disabled?.value === true) {
				skip(test, { timeElapsed: 0 });
				return Promise.resolve();
			}

			if (test.options.scope !== undefined) {
				const testScope = test.options.scope;
				if (
					(IS_CLIENT === false && testScope === Scope.Client) ||
					(IS_CLIENT === true && testScope === Scope.Server)
				) {
					skip(test, { timeElapsed: 0 });
					return Promise.resolve();
				}
			}

			const callback = <Callback>(testClass as unknown as TestClassType)[test.name];
			const res = runTestCase(() => callback(testClassInstance), test);

			const afterEachCallback = getAnnotation(testClass, Annotation.AfterEach);
			afterEachCallback.forEach((cb) => cb(testClassInstance));

			return res;
		});

		const afterAllCallback = getAnnotation(testClass, Annotation.AfterAll);
		afterAllCallback.forEach((callback) => callback(testClassInstance));

		return testPromises;
	}

	private generateOutput(elapsedTime: number): string {
		const results = new StringBuilder("\n\n");

		const getSymbol = (passed: boolean, skipped?: boolean) => (skipped === true ? "-" : passed ? "+" : "x");

		const totalTestsRan = this.failedTests + this.passedTests + this.skippedTests;

		if (totalTestsRan === 0) {
			results.appendLine("No tests ran.");
			return results.toString();
		}

		const formatTestResult = (testResult: [TestMethod, TestCaseResult], isLast: boolean) => {
			const [testCaseMetadata, testCase] = testResult;

			const passed = testCase.passed;
			const skipped = testCase.skipped;
			const failed = !(passed || skipped);

			const isDisabled = testCaseMetadata.options.disabled?.value || false;
			const disabledMessage = testCaseMetadata.options.disabled?.message ?? "";

			const timeElapsed = testCase.timeElapsed;

			results.append(" │");

			results.appendLine(
				`\t${isLast ? "└" : "├"}── [${getSymbol(passed, skipped)}] ${testCaseMetadata.options.displayName ?? testCaseMetadata.name} (${math.round(timeElapsed * 1000)}ms) ${passed ? "PASSED" : failed ? "FALED" : isDisabled ? `SKIPPED${disabledMessage.size() > 0 ? ` (${disabledMessage})` : ""}` : `SKIPPED${testCaseMetadata.options.scope !== undefined ? ` (not running on ${testCaseMetadata.options.scope})` : ""}`}`,
			);
		};

		this.results.forEach((testResultsRecord, testClass) => {
			const testClassMetadata = getClassMetadata(testClass);
			const className = testClassMetadata?.displayName ?? (testClass as unknown as string);

			const testResults: [TestMethod, TestCaseResult][] = [];
			testResultsRecord.forEach((value, key) => {
				testResults.push([key, value]);
			});

			const allTestsPassed = testResults.every(([_, cases]) => cases.errorMessage === undefined);
			const totalTimeElapsed = testResults.map(([_, val]) => val.timeElapsed).reduce((sum, n) => sum + n);

			results.appendLine(
				`[${getSymbol(allTestsPassed)}] ${className} (${math.round(totalTimeElapsed * 1000)}ms)`,
			);

			testResults.forEach((testResult, index) => {
				formatTestResult(testResult, index === testResults.size() - 1);
			});

			results.appendLine("");
		});

		if (this.failedTests > 0) {
			results.appendLine("Failures:");

			let failureIndex = 0;

			for (const [className, testResults] of pairs(this.results)) {
				for (const [testCaseName, { errorMessage }] of pairs(testResults)) {
					if (errorMessage === undefined) continue;
					results.appendLine(`${++failureIndex}. ${className}.${testCaseName}`);

					const errorDisplay = tostring(errorMessage)
						.split("\n")
						.map((line) => "   " + line)
						.join("\n\t");
					results.appendLine(errorDisplay);
					results.appendLine("");
				}
			}
		}

		const totalTests = this.passedTests + this.failedTests;
		results.appendLine("");
		results.appendLine(`\tRan ${totalTests} tests in ${math.round(elapsedTime * 1000)}ms`);
		results.appendLine(`\t\tPassed: ${this.passedTests}`);
		results.appendLine(`\t\tFailed: ${this.failedTests}`);
		results.appendLine(`\t\tSkipped: ${this.skippedTests}`);
		results.appendLine("");

		return results.toString();
	}
}
