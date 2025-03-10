import { Annotation, TestMetadataOptions, Scope, DEFAULT_ORDER } from "./common";
import { addTest, addAnnotations, addClassMetadata } from "./utils";

type DecoratorOptions = {
	annotation?: Annotation;
	options?: TestMetadataOptions;
};

function createDecorator<T extends object>({ annotation, options = {} }: DecoratorOptions) {
	return function (ctor: T, propertyKey?: string): void {
		if (ctor === undefined) throw "Target cannot be null";
		if (annotation) {
			addAnnotations(ctor, propertyKey!, annotation);
		} else {
			if (propertyKey !== undefined) {
				addTest(ctor, propertyKey, options);
			} else {
				// Handle class-level decorator
				addClassMetadata(ctor, options);
			}
		}
	};
}

function createAnnotation(annotation: Annotation) {
	return createDecorator({ annotation });
}

export const Test = createDecorator({ options: { isATest: true, order: DEFAULT_ORDER } });
export const Disabled = (message?: string) => createDecorator({ options: { disabled: { value: true, message } } });
export const DisplayName = (name: string) => createDecorator({ options: { displayName: name } });
export const Timeout = (timeInMilliseconds: number) => createDecorator({ options: { timeout: timeInMilliseconds } });
export const Order = (order: number) => createDecorator({ options: { order } });
export const EnableInScope = (scope: Scope) => createDecorator({ options: { scope } });

export const BeforeEach = createAnnotation(Annotation.BeforeEach);
export const Before = createAnnotation(Annotation.BeforeEach);
export const BeforeAll = createAnnotation(Annotation.BeforeAll);
export const After = createAnnotation(Annotation.AfterEach);
export const AfterEach = createAnnotation(Annotation.AfterEach);
export const AfterAll = createAnnotation(Annotation.AfterAll);

export default {
	Test,
	Disabled,
	DisplayName,
	Timeout,
	Order,
	EnableInScope,
	Before,
	BeforeAll,
	BeforeEach,
	After,
	AfterEach,
	AfterAll,
};
