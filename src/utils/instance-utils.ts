export function getDescendantsOfType<T extends keyof Instances, I extends Instances[T] = Instances[T]>(
	root: Instance,
	...classNames: T[]
): I[] {
	const res: I[] = [];

	for (const className of classNames) {
		for (const descendant of root.GetDescendants()) {
			if (descendant.ClassName === className) {
				res.push(descendant as I);
			}
		}
	}

	return res;
}
