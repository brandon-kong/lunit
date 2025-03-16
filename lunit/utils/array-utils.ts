export function flatten<T extends defined>(arr: (T | T[])[]): T[] {
	const result: T[] = [];
	for (const item of arr) {
		if (typeIs(item, "table")) {
			const flattenedItem = flatten(item as T[]);
			for (const subItem of flattenedItem) {
				result.push(subItem);
			}
		} else {
			result.push(item);
		}
	}
	return result;
}

export function arrayToString<T extends defined>(arr: T[]): string {
	return arr.join(", ");
}

export function getKeysFromMap<K extends defined>(map: Map<K, unknown>): K[] {
	const res: K[] = [];

	map.forEach((_, key) => {
		res.push(key);
	});
	return res;
}

export function getValuesFromMap<V extends defined>(map: Map<unknown, V>): V[] {
	const res: V[] = [];

	map.forEach((val, _) => {
		res.push(val);
	});
	return res;
}

export function sharesOneElement<T>(arr1: T[], arr2: T[]): boolean {
	if (arr1.size() > arr2.size()) {
		[arr1, arr2] = [arr2, arr1];
	}

	const set = new Set(arr1);
	for (const element of arr2) {
		if (set.has(element)) {
			return true;
		}
	}
	return false;
}
