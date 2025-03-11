export class StringBuilder {
	private parts: string[];

	constructor(initialValue: string = "") {
		this.parts = [initialValue];
	}

	append(value: string): this {
		this.parts.push(value);
		return this;
	}

	appendLine(value: string = ""): this {
		this.parts.push(value + "\n");
		return this;
	}

	toString(): string {
		return this.parts.join("");
	}
}

export default StringBuilder;
