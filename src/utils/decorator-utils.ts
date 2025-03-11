import { Annotation, DecoratorOptions } from "../common";
import { addTest, addAnnotations, addClassMetadata } from "./metadata";

export function createDecorator<T extends object>({ annotation, options = {} }: DecoratorOptions) {
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

export function createAnnotation(annotation: Annotation) {
	return createDecorator({ annotation });
}
