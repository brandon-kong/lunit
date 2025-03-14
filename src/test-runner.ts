import {
	Annotation,
	Constructor,
	Metadata,
	TestMethod,
	DEFAULT_ORDER,
	Environment,
	TestRunOptions,
	TestCaseResult,
	TestClassConstructor,
} from "./common";
import { arrayToString, flatten, sharesOneElement } from "./utils/array-utils";
import { getDescendantsOfType } from "./utils/instance-utils";
import StringBuilder from "./utils/string-builder";
import { getAnnotation, getClassMetadata, hasMetadata } from "./utils/metadata";

type TestClassInstance = Record<string, Callback>;

const RUN_SERVICE = game.GetService("RunService");
const IS_CLIENT = RUN_SERVICE.IsClient();

type TestClassType = {
	[Metadata.TestList]: Map<string, TestMethod>;
	[key: string]: unknown;
};

export class TestRunner {
	private readonly testClasses: [TestClassConstructor, TestClassInstance][];
	private results: Map<TestClassConstructor, Map<TestMethod, TestCaseResult>>;

	private failedTests: number = 0;
	private passedTests: number = 0;
	private skippedTests: number = 0;

	private options: TestRunOptions;

	private resetResults(): void {
		this.results.clear();
		this.failedTests = 0;
		this.passedTests = 0;
		this.skippedTests = 0;
	}

	public constructor(roots: Instance[], options?: TestRunOptions) {
		this.testClasses = new Array<[TestClassConstructor, TestClassInstance]>();
		this.results = new Map<TestClassConstructor, Map<TestMethod, TestCaseResult>>();

		this.options = options || {};

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

	public async run(): Promise<Map<TestClassConstructor, Map<TestMethod, TestCaseResult>>> {
		// multiple runs don't accumulate total tests
		this.resetResults();

		const start = os.clock();

		const promisesToResolve: Promise<void>[] = [];

		this.options.reporter?.onRunStart(this.testClasses.size());

		for (const [testClass, testClassInstance] of this.testClasses) {
			const runClass = await this.runTestClass(testClass, testClassInstance);

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

		await Promise.all(promisesToResolve).then(() => {
			const elapsedTime = os.clock() - start;

			this.options.reporter?.onRunEnd(elapsedTime);
			print(this.generateOutput(elapsedTime));
		});

		return Promise.resolve(this.results);
	}

	private getTestsFromTestClass(testClass: TestClassConstructor): ReadonlyArray<TestMethod> {
		if (hasMetadata(testClass, Metadata.TestList) === false) return [];
		const classMetadata = getClassMetadata(testClass);

		const classTags = classMetadata?.tags ?? [];

		const list: Map<string, TestMethod> = (testClass as unknown as TestClassType)[Metadata.TestList];

		const res = new Array<TestMethod>();
		list.forEach((val) => {
			// Without this, any function with a decorator is marked as a test, even if @Test was not applied
			if (val.options.isATest === true) {
				if (this.options.filterTags !== undefined) {
					if (val.options.tags !== undefined || classTags.size() > 0) {
						let shouldAdd = false;

						if (sharesOneElement(this.options.filterTags, classTags)) {
							shouldAdd = true;
						}

						// add the test if the METHOD is marked as tag
						if (shouldAdd === false) {
							if (sharesOneElement(this.options.filterTags, val.options.tags ?? [])) {
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
			return (a.options.order ?? DEFAULT_ORDER) <= (b.options.order ?? DEFAULT_ORDER);
		});

		return res;
	}

	private async runTestClass(
		testClass: TestClassConstructor,
		testClassInstance: TestClassInstance,
	): Promise<Promise<void>[]> {
		const testClassMetadata = getClassMetadata(testClass);

		const addResult = (test: TestMethod, result: TestCaseResult) => {
			let classResults = this.results.get(testClass);
			if (classResults === undefined) {
				const newMap = new Map<TestMethod, TestCaseResult>();
				this.results.set(testClass, newMap);
				classResults = newMap;
			}

			classResults.set(test, result);

			this.options.reporter?.onTestEnd(test.options.displayName ?? test.name, {
				passed: true,
				timeElapsed: result.timeElapsed,
				skipped: false,
				className: testClassMetadata?.displayName ?? tostring(testClass),
				classInstance: testClassInstance,
			});
		};

		const fail = (
			exception: unknown,
			test: TestMethod,
			results: Omit<TestCaseResult, "errorMessage" | "skipped" | "passed" | "className" | "classInstance">,
		): void => {
			this.failedTests++;
			addResult(test, {
				passed: false,
				errorMessage: tostring(exception),
				timeElapsed: results.timeElapsed,
				skipped: false,
				className: testClassMetadata?.displayName ?? tostring(testClass),
				classInstance: testClassInstance,
			});
			this.options.reporter?.onTestFailed(test.options.displayName ?? test.name, tostring(exception));
		};

		const pass = (
			test: TestMethod,
			results: Omit<TestCaseResult, "errorMessage" | "skipped" | "passed" | "className" | "classInstance">,
		): void => {
			this.passedTests++;
			addResult(test, {
				passed: true,
				timeElapsed: results.timeElapsed,
				skipped: false,
				className: testClassMetadata?.displayName ?? tostring(testClass),
				classInstance: testClassInstance,
			});
			this.options.reporter?.onTestPassed(test.options.displayName ?? test.name);
		};

		const skip = (
			test: TestMethod,
			results: Omit<TestCaseResult, "errorMessage" | "skipped" | "passed" | "className" | "classInstance">,
		): void => {
			this.skippedTests++;
			addResult(test, {
				passed: false,
				timeElapsed: results.timeElapsed,
				skipped: true,
				className: testClassMetadata?.displayName ?? tostring(testClass),
				classInstance: testClassInstance,
			});
			this.options.reporter?.onTestSkipped(
				test.options.displayName ?? test.name,
				test.options.disabled?.value === true && test.options.disabled?.message !== undefined
					? test.options.disabled?.message
					: test.options.environment !== undefined && this.testIsOnRightEnvironment(test.options.environment)
						? `Test needs to run on ${test.options.environment} environment`
						: `Test was skipped`,
			);
		};

		const runTestCase = async (callback: Callback, test: TestMethod): Promise<void> => {
			const start = os.clock();

			this.options.reporter?.onTestStart(test.options.displayName ?? test.name);

			if (test.options.timeout !== undefined) {
				const timeOutSeconds = test.options.timeout / 1000;
				try {
					await Promise.try(callback).timeout(timeOutSeconds);
					const timeElapsed = os.clock() - start;
					pass(test, { timeElapsed });
				} catch (e) {
					const timeElapsed = os.clock() - start;
					fail(`Timeout of ${test.options.timeout}ms exceeded`, test, {
						timeElapsed,
					});
				}
				return;
			}

			try {
				await callback();
			} catch (e) {
				const timeElapsed = os.clock() - start;

				if (test.options.isNegativeTest === true) {
					// pass the test if it is negative
					pass(test, { timeElapsed });
				} else {
					fail(e, test, { timeElapsed });
				}
				return;
			}

			const timeElapsed = os.clock() - start;

			if (test.options.isNegativeTest === true) {
				// fail the test if it is negative
				fail(`Test was marked as a negative test and unexpectedly did not error`, test, { timeElapsed });
			} else {
				pass(test, { timeElapsed });
			}
		};

		const testList = this.getTestsFromTestClass(testClass);

		await Promise.try(async () => {
			const beforeAllCallbacks = getAnnotation(testClass, Annotation.BeforeAll);
			for (const callback of beforeAllCallbacks) {
				await Promise.try(() => callback(testClassInstance)).catch(() => {});
			}
		}).catch(() => {});

		const testPromises: Promise<void>[] = [];
		for (const test of testList) {
			await Promise.try(async () => {
				const beforeEachCallbacks = getAnnotation(testClass, Annotation.BeforeEach);
				for (const callback of beforeEachCallbacks) {
					await Promise.try(() => callback(testClassInstance)).catch(() => {});
				}
			}).catch(() => {});

			if (test.options.disabled?.value === true) {
				skip(test, { timeElapsed: 0 });
				continue;
			}

			// If the function should run on either the client or server, skip it if it's ran on another boundary
			if (test.options.environment !== undefined) {
				const testEnvironment = test.options.environment;
				if (!this.testIsOnRightEnvironment(testEnvironment)) {
					skip(test, { timeElapsed: 0 });
					continue;
				}
			}

			const callback = <Callback>(testClass as unknown as TestClassType)[test.name];
			await runTestCase(() => callback(testClassInstance), test).catch(() => {});

			await Promise.try(async () => {
				const afterEachCallback = getAnnotation(testClass, Annotation.AfterEach);
				for (const cb of afterEachCallback) {
					await Promise.try(() => cb(testClassInstance)).catch(() => {});
				}
			}).catch(() => {});

			await Promise.try(async () => {
				const afterAllCallback = getAnnotation(testClass, Annotation.AfterAll);
				for (const callback of afterAllCallback) {
					await Promise.try(() => callback(testClassInstance)).catch(() => {});
				}
			}).catch(() => {});
		}

		return testPromises;
	}

	private generateOutput(elapsedTime: number): string {
		const results = new StringBuilder("\n\n");

		const getSymbol = (passed: boolean, skipped?: boolean) => (skipped === true ? "-" : passed ? "+" : "x");

		const totalTestsRan = this.failedTests + this.passedTests + this.skippedTests;

		if (this.options.filterTags !== undefined) {
			results.appendLine(`Ran filtered tests on the following tags: ${arrayToString(this.options.filterTags)}`);
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
				`\t${isLast ? "└" : "├"}── [${getSymbol(passed, skipped)}] ${testCaseMetadata.options.displayName ?? testCaseMetadata.name} (${math.round(timeElapsed * 1000)}ms) ${passed ? "PASSED" : failed ? "FAILED" : isDisabled ? `SKIPPED${disabledMessage.size() > 0 ? ` (${disabledMessage})` : ""}` : `SKIPPED${testCaseMetadata.options.environment !== undefined ? ` (not running on ${testCaseMetadata.options.environment})` : ""}`}`,
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

	private testIsOnRightEnvironment(environment: Environment): boolean {
		return (
			(IS_CLIENT === true && environment === Environment.Client) ||
			(IS_CLIENT === false && environment === Environment.Server)
		);
	}
}
