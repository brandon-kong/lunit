import { Annotation, Constructor, Metadata, TestMethod, DEFAULT_ORDER, Scope } from "./common";

import StringBuilder from "./utils/string-builder";
import { arrayToString, flatten } from "./utils/array-utils";
import { getDescendantsOfType } from "./utils/instance-utils";
import { getAnnotation, getClassMetadata, hasMetadata } from "./utils/metadata";

type TestClassInstance = Record<string, Callback>;
type TestClassConstructor = Constructor<TestClassInstance>;

const RUN_SERVICE = game.GetService("RunService");
const IS_CLIENT = RUN_SERVICE.IsClient();

type TestClassType = {
	[Metadata.TestList]: Map<string, TestMethod>;
	[key: string]: unknown;
};

type TestRunOptions = {
	filterTags?: string[];
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

	public async run(options?: TestRunOptions): Promise<void> {
		const start = os.clock();

		const promisesToResolve: Promise<void>[] = [];

		for (const [testClass, testClassInstance] of this.testClasses) {
			// Run all beforeAll callbacks before running the tests
			try {
				const beforeAllCallbacks = getAnnotation(testClass, Annotation.BeforeAll);
				beforeAllCallbacks.forEach((callback) => callback());
			} finally {
				const runClass = this.runTestClass(testClass, testClassInstance, options);

				await Promise.all(runClass).then(() => {
					runClass.forEach((promise) => {
						promisesToResolve.push(promise);
					});

					Promise.try(() => {
						const afterAllCallbacks = getAnnotation(testClass, Annotation.AfterAll);
						afterAllCallbacks.forEach((callback) => callback());
					});
				});
			}
		}

		await Promise.all(promisesToResolve).then(() => {
			const elapsedTime = os.clock() - start;
			print(this.generateOutput(elapsedTime, options));
		});
	}

	private getTestsFromTestClass(testClass: TestClassConstructor, filterTags?: string[]): ReadonlyArray<TestMethod> {
		if (hasMetadata(testClass, Metadata.TestList) === false) return [];

		const list: Map<string, TestMethod> = (testClass as unknown as TestClassType)[Metadata.TestList];

		const res = new Array<TestMethod>();
		list.forEach((val) => {
			// Without this, any function with a decorator is marked as a test, even if @Test was not applied
			if (val.options.isATest === true) {
				if (filterTags !== undefined) {
					if (val.options.tags !== undefined) {
						let shouldAdd = false;

						for (const tag of val.options.tags) {
							if (filterTags.includes(tag)) {
								shouldAdd = true;
							}
						}

						if (shouldAdd === true) {
							res.push(val);
						}
					}
				} else {
					res.push(val);
				}
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

	private runTestClass(
		testClass: TestClassConstructor,
		testClassInstance: TestClassInstance,
		options?: TestRunOptions,
	): Promise<void>[] {
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

			if (test.options.timeout !== undefined) {
				const timeOutSeconds = test.options.timeout / 1000;
				const promise = Promise.try(callback)
					.timeout(timeOutSeconds)
					.then(() => {
						const timeElapsed = os.clock() - start;
						pass(test, { timeElapsed });
					})
					.catch(() => {
						const timeElapsed = os.clock() - start;
						fail(`Timeout of ${test.options.timeout}ms exceeded`, test, { timeElapsed });
					});
				return promise;
			}

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

		const testList = this.getTestsFromTestClass(testClass, options?.filterTags);

		const testPromises = testList.map(async (test) => {
			await Promise.try(() => {
				const beforeEachCallbacks = getAnnotation(testClass, Annotation.BeforeEach);
				beforeEachCallbacks.forEach((callback) => callback(testClassInstance));
			});

			// Skip the test before it can be executed
			if (test.options.disabled?.value === true) {
				skip(test, { timeElapsed: 0 });
				return Promise.resolve();
			}

			// If the function should run on either the client or server, skip it if it's ran on another boundary
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

	private generateOutput(elapsedTime: number, options?: TestRunOptions): string {
		const results = new StringBuilder("\n\n");

		const getSymbol = (passed: boolean, skipped?: boolean) => (skipped === true ? "-" : passed ? "+" : "x");

		const totalTestsRan = this.failedTests + this.passedTests + this.skippedTests;

		if (options?.filterTags !== undefined) {
			results.appendLine(`Ran filtered tests on the following tags: ${arrayToString(options.filterTags)}`);
			results.appendLine("");
		}

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
				`\t${isLast ? "└" : "├"}── [${getSymbol(passed, skipped)}] ${testCaseMetadata.options.displayName ?? testCaseMetadata.name} (${math.round(timeElapsed * 1000)}ms) ${passed ? "PASSED" : failed ? "FAILED" : isDisabled ? `SKIPPED${disabledMessage.size() > 0 ? ` (${disabledMessage})` : ""}` : `SKIPPED${testCaseMetadata.options.scope !== undefined ? ` (not running on ${testCaseMetadata.options.scope})` : ""}`}`,
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
					results.appendLine(`${++failureIndex}. ${className}.${testCaseName.name}`);

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
