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

export type Scope = "Client" | "Server" | "Both";

export type TestMetadataOptions = {
	isATest?: boolean;
	displayName?: string;
	scope?: Scope;
	disabled?: {
		value: true;
		message?: string;
	};
	timeout?: number;
	order?: number;
};

export const DEFAULT_ORDER: number = 999;
