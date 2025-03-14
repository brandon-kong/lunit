import { Reporter, TestCaseResult } from "@rbxts/lunit/out/common";
import { getValuesFromMap } from "@rbxts/lunit/out/utils/array-utils";

export class StringReporter implements Reporter {
	private passedTests = 0;
	private failedTests = 0;
	private skippedTests = 0;
	private results = new Map<LuaTuple<[string, object]>, Map<string, TestCaseResult>>();
	private startTime = 0;
	private outputBuffer: string[] = []; // Stores output instead of logging

	onRunStart(totalTests: number): void {
		this.startTime = os.clock();
		this.outputBuffer.push(`\nRunning ${totalTests} tests...\n`);
	}

	onRunEnd(): void {
		const elapsedTime = os.clock() - this.startTime;
		this.outputBuffer.push(this.generateOutput(elapsedTime));
	}

	onTestStart(testName: string): void {
		this.outputBuffer.push(`⏳ Running test: ${testName}`);
	}

	onTestEnd(testName: string, result: TestCaseResult): void {
		const key = <LuaTuple<[string, object]>>[result.className, result.classInstance];

		if (!this.results.has(key)) {
			this.results.set(key, new Map());
		}
		this.results.get(key)?.set(testName, result);

		if (result.passed) {
			this.passedTests++;
		} else if (result.skipped) {
			this.skippedTests++;
		} else {
			this.failedTests++;
		}
	}

	onTestPassed(testName: string): void {
		this.outputBuffer.push(`✅ ${testName} PASSED`);
	}

	onTestSkipped(testName: string, reason: string): void {
		this.outputBuffer.push(`⚠️ ${testName} SKIPPED: ${reason}`);
	}

	onTestFailed(testName: string, errorMessage: string): void {
		this.outputBuffer.push(`❌ ${testName} FAILED: ${errorMessage}`);
	}

	/**
	 * Generates a formatted test report.
	 * @param elapsedTime Time taken to run the tests (in seconds).
	 * @returns Formatted report as a string.
	 */
	private generateOutput(elapsedTime: number): string {
		let output = "\n\n";

		const getSymbol = (passed: boolean, skipped?: boolean) => (skipped === true ? "-" : passed ? "+" : "x");

		const totalTestsRan = this.failedTests + this.passedTests + this.skippedTests;

		if (totalTestsRan === 0) {
			output += "No tests ran.\n";
			return output;
		}

		this.results.forEach((testCases, [className]) => {
			const allTestsPassed = getValuesFromMap(testCases).every((test) => test.passed);
			const totalTimeElapsed = getValuesFromMap(testCases).reduce((sum, test) => sum + test.timeElapsed, 0);

			output += `[${getSymbol(allTestsPassed)}] ${className} (${math.round(totalTimeElapsed * 1000)}ms)\n`;

			testCases.forEach((testCase, testName) => {
				const passed = testCase.passed;
				const skipped = testCase.skipped;
				const failed = !passed && !skipped;
				const timeElapsed = testCase.timeElapsed;

				output += ` │\t[${getSymbol(passed, skipped)}] ${testName} (${math.round(timeElapsed * 1000)}ms) `;
				output += passed ? "PASSED" : failed ? "FAILED" : "SKIPPED";
				output += "\n";
			});

			output += "\n";
		});

		if (this.failedTests > 0) {
			output += "Failures:\n";

			let failureIndex = 0;
			this.results.forEach((testCases, className) => {
				testCases.forEach((testCase, testName) => {
					if (testCase.errorMessage === undefined) return;
					output += `${++failureIndex}. ${className}.${testName}\n`;
					output += `   ${testCase.errorMessage.split("\n").join("\n   ")}\n\n`;
				});
			});
		}

		output += `\n\tRan ${totalTestsRan} tests in ${math.round(elapsedTime * 1000)}ms\n`;
		output += `\t\tPassed: ${this.passedTests}\n`;
		output += `\t\tFailed: ${this.failedTests}\n`;
		output += `\t\tSkipped: ${this.skippedTests}\n\n`;

		return output;
	}

	/**
	 * Retrieves the test report as a formatted string.
	 * @returns The formatted test results.
	 */
	public getReport(): string {
		return this.outputBuffer.join("\n");
	}

	/**
	 * Retrieves the test report as JSON.
	 * @returns The test results in JSON format.
	 */
	public getReportObject() {
		const resultsArray = new Array<{ className: object; tests: object[] }>();

		this.results.forEach((testCases, className) => {
			const testsArray = new Array<{
				testName: string;
				passed: boolean;
				skipped: boolean;
				errorMessage: string | undefined;
				timeElapsed: number;
			}>();

			testCases.forEach((result, testName) => {
				testsArray.push({
					testName,
					passed: result.passed,
					skipped: result.skipped,
					errorMessage: result.errorMessage,
					timeElapsed: result.timeElapsed,
				});
			});

			resultsArray.push({ className, tests: testsArray });
		});

		return {
			passedTests: this.passedTests,
			failedTests: this.failedTests,
			skippedTests: this.skippedTests,
			totalTests: this.passedTests + this.failedTests + this.skippedTests,
			results: resultsArray,
		};
	}
}
