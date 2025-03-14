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
