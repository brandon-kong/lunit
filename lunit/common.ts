export type TestMethod = {
	name: string;
	options: TestMetadataOptions;
};

export enum Annotation {
	BeforeEach = "BeforeEach",
	BeforeAll = "BeforeAll",
	AfterEach = "AfterEach",
	AfterAll = "AfterAll",
}

export const enum Metadata {
	TestList = "lmunit:testList",
	Annotations = "lmunit:annotations",
	ClassMetadata = "lmunit:classMetadata",
}

export type Constructor<T = object> = new (...args: never[]) => T;
export type AbstractConstructor<T = object> = abstract new (...args: never[]) => T;

export enum Environment {
	Server = "Server",
	Client = "Client",
}

export type TestMetadataOptions = {
	negated?: boolean;
	tags?: string[];
	isATest?: boolean;
	displayName?: string;
	environment?: Environment;
	disabled?: {
		value: boolean;
		message?: string;
	};
	timeout?: number;
	order?: number;
};

export type DecoratorOptions = {
	annotation?: Annotation;
	options?: TestMetadataOptions;
};

export interface TestCaseResult {
	readonly passed: boolean;
	readonly errorMessage?: string;
	readonly timeElapsed: number;
	readonly skipped: boolean;
	readonly className: string;
	readonly classInstance: object;
}

export type TestRunOptions = {
	tags?: string[];
	reporter?: Reporter;
};

export interface Reporter {
	onSuiteStart?(suiteName: string, totalTests: number): void;
	onSuiteEnd?(suiteName: string, elapsedTime: number): void;

	onRunStart(totalTests: number): void;
	onRunEnd(elapsedTime: number): void;

	onTestStart(testName: string): void;
	onTestEnd(testName: string, result: TestCaseResult): void;

	onTestPassed(testName: string): void;
	onTestSkipped(testName: string, reason?: string): void;
	onTestFailed(testName: string, error?: string): void;

	getReport(): string;
}

export type TestClassInstance = Record<string, Callback>;
export type TestClassConstructor = Constructor<TestClassInstance>;

export const DEFAULT_ORDER: number = 999;
