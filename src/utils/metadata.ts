import { Annotation, Metadata, TestMethod, TestMetadataOptions } from "../common";

export function hasMetadata<T extends object>(ctor: T, data: Metadata): boolean {
	const ctorCast = <{ [key: string]: unknown }>ctor;
	return ctorCast[data] !== undefined;
}

export function setMetadata<T extends object, U>(ctor: T, data: Metadata, value: U): void {
	const ctorCast = <{ [key: string]: unknown }>ctor;
	ctorCast[data] = value;
}

export function addTest<T extends object>(ctor: T, testName: string, options: TestMetadataOptions): void {
	const ctorCast = <{ [key: string]: unknown }>ctor;
	if (ctorCast[Metadata.TestList] !== undefined) {
		const map = <Map<string, TestMethod>>ctorCast[Metadata.TestList];

		// make sure that if the test already exists in metadata, don't override it, only add to it

		const foundOptions = map.get(testName);

		if (foundOptions !== undefined && foundOptions?.options === undefined) {
			foundOptions.options = {};
		}

		if (foundOptions !== undefined) {
			const foundOptionsRecord = foundOptions as { options?: Record<string, unknown> };
			// create combined options
			(options as Map<string, unknown>).forEach((value, key) => {
				if (foundOptionsRecord.options !== undefined && foundOptionsRecord.options[key] === undefined) {
					foundOptionsRecord.options[key] = value;
				}
			});

			map.set(testName, foundOptions);
		} else
			map.set(testName, {
				name: testName,
				options,
			});
	} else {
		ctorCast[Metadata.TestList] = {
			[testName]: {
				name: testName,
				options,
			},
		};
	}
}

export function getTestMetadata<T extends object>(ctor: T, testName: string): TestMetadataOptions | undefined {
	const ctorCast = <{ [key: string]: unknown }>ctor;
	if (ctorCast[Metadata.TestList] !== undefined) {
		const map = <Map<string, TestMethod>>ctorCast[Metadata.TestList];

		if (map !== undefined) {
			return map.get(testName)?.options;
		}
	}

	return undefined;
}

export function addAnnotations<T extends object>(ctor: T, functionName: string, annotation: Annotation): void {
	const ctorCast = <{ [key: string]: unknown }>ctor;
	if (ctorCast[Metadata.Annotations] !== undefined) {
		const map = <Map<Annotation, Callback[]>>ctorCast[Metadata.Annotations];
		const gottenAnnotations = map.get(annotation);

		if (gottenAnnotations !== undefined) {
			gottenAnnotations.push(ctorCast[functionName] as Callback);
		} else {
			map.set(annotation, [ctorCast[functionName] as Callback]);
		}
	} else {
		// add it here
		ctorCast[Metadata.Annotations] = {
			[annotation]: [ctorCast[functionName] as Callback],
		};
	}
}

export function getAnnotation<T extends object>(ctor: T, annotation: Annotation): Callback[] {
	const ctorCast = <{ [key: string]: unknown }>ctor;
	if (ctorCast[Metadata.Annotations] === undefined) return [];

	const map = <Map<Annotation, Callback[]>>(ctorCast[Metadata.Annotations] as unknown);
	const gottenAnnotations = map.get(annotation);

	return gottenAnnotations || [];
}

export function addClassMetadata<T extends object>(ctor: T, options: TestMetadataOptions): void {
	const ctorCast = <{ [Metadata.ClassMetadata]: TestMetadataOptions }>ctor;
	if (ctorCast[Metadata.ClassMetadata] === undefined) {
		ctorCast[Metadata.ClassMetadata] = {};
	}

	const ctorAsMap = ctorCast[Metadata.ClassMetadata] as Map<string, unknown>;
	const optionsAsMap = options as Map<string, unknown>;

	optionsAsMap.forEach((val, key) => {
		ctorAsMap.set(key, val);
	});
}

export function getClassMetadata<T extends object>(ctor: T): TestMetadataOptions | undefined {
	const ctorCast = <{ [Metadata.ClassMetadata]?: TestMetadataOptions }>ctor;
	return ctorCast[Metadata.ClassMetadata];
}
