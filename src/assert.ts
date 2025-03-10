import { AssertionFailedException } from "./exceptions";

type MessageType = string | (() => string);

type ClassType<T = object, Args extends unknown[] = never[]> = {
	new (...args: Args): T;
};

/**
 * Container for all assert statements for unit testing
 *
 * Go to specific function declarations to see statement usage
 *
 * ### List of Assert Statements
 * ---
 * ---
 * #### Logical Assertions
 * - `Assert.equal()`
 * - `Assert.notEqual()`
 * - `Assert.true()`
 * - `Assert.false()`
 * - `Assert.defined()`
 * - `Assert.notDefined()`
 *
 * #### Numerical Assertions
 * - `Assert.greaterThan()`
 * - `Assert.greaterThanOrEqual()`
 * - `Assert.lessThan()`
 * - `Assert.lessThanOrEqual()`
 * - `Assert.between()`
 *
 * #### Array Assertions
 * - `Assert.empty()`
 * - `Assert.notEmpty()`
 * - `Assert.contains()`
 * - `Assert.doesNotContain()`
 *
 * #### Control Assertions
 * - `Assert.throws()`
 * - `Assert.doesNotThrow()`
 *
 * #### Promise Assertions
 * - `Assert.resolves()`
 * - `Assert.rejects()`
 * - `Assert.timeout()`
 */
export abstract class Assert {
	// Helper functions
	private static resolveMessageOrCallback(message: MessageType): string {
		if (typeOf(message) === "string") {
			return message as string;
		} else {
			return (message as () => string)();
		}
	}

	private static throwAssertionFailedException(fallbackMessage: string, message?: MessageType): void {
		throw new AssertionFailedException(
			message !== undefined ? Assert.resolveMessageOrCallback(message) : fallbackMessage,
		);
	}

	/**
	 * Asserts that two values are equal.
	 * @param actual The actual value.
	 * @param expected The expected value.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.equal(1, 1); // Passes
	 * Assert.equal(1, 2); // Fails
	 */
	public static equal<T>(actual: T, expected: T): void;
	public static equal<T>(actual: T, expected: T, message?: string): void;
	public static equal<T>(actual: T, expected: T, message?: () => string): void;
	public static equal<T>(actual: T, expected: T, message?: MessageType): void {
		if (actual !== expected) {
			Assert.throwAssertionFailedException(`Expected: ${expected}, Actual: ${actual}`, message);
		}
	}

	/**
	 * Asserts that two values are not equal.
	 * @param actual The actual value.
	 * @param expected The expected value.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.notEqual(1, 2); // Passes
	 * Assert.notEqual(1, 1); // Fails
	 */
	public static notEqual<T>(actual: T, expected: T): void;
	public static notEqual<T>(actual: T, expected: T, message?: string): void;
	public static notEqual<T>(actual: T, expected: T, message?: () => string): void;
	public static notEqual<T>(actual: T, expected: T, message?: MessageType): void {
		if (actual === expected) {
			Assert.throwAssertionFailedException(`Expected ${actual} to not equal ${expected}`, message);
		}
	}

	/**
	 * Asserts that a value is true.
	 * @param actual The actual value.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.true(true); // Passes
	 * Assert.true(false); // Fails
	 */
	public static true(actual: boolean): void;
	public static true(actual: boolean, message?: string): void;
	public static true(actual: boolean, message?: () => string): void;
	public static true(actual: boolean, message?: MessageType): void {
		if (actual !== true) {
			Assert.throwAssertionFailedException(`Expected ${actual} to be true`, message);
		}
	}

	/**
	 * Asserts that a value is false.
	 * @param actual The actual value.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.false(false); // Passes
	 * Assert.false(true); // Fails
	 */
	public static false(actual: boolean): void;
	public static false(actual: boolean, message?: string): void;
	public static false(actual: boolean, message?: () => string): void;
	public static false(actual: boolean, message?: MessageType): void {
		if (actual === true) {
			Assert.throwAssertionFailedException(`Expected ${actual} to be false`, message);
		}
	}

	/**
	 * Asserts that a value is undefined.
	 * @param actual The actual value.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.undefined(undefined); // Passes
	 * Assert.undefined(1); // Fails
	 */
	public static undefined(actual: unknown): void;
	public static undefined(actual: unknown, message?: string): void;
	public static undefined(actual: unknown, message?: () => string): void;
	public static undefined(actual: unknown, message?: MessageType): void {
		if (actual !== undefined) {
			Assert.throwAssertionFailedException(`Expected ${actual} to be undefined`, message);
		}
	}

	/**
	 * Asserts that a value is not undefined.
	 * @param actual The actual value.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.notUndefined(1); // Passes
	 * Assert.notUndefined(undefined); // Fails
	 */
	public static notUndefined(actual: unknown): void;
	public static notUndefined(actual: unknown, message?: string): void;
	public static notUndefined(actual: unknown, message?: () => string): void;
	public static notUndefined(actual: unknown, message?: MessageType): void {
		if (actual === undefined) {
			Assert.throwAssertionFailedException(`Expected ${actual} to be defined`, message);
		}
	}

	/**
	 * Asserts that a number is greater than another number.
	 * @param num1 The actual number.
	 * @param num2 The number to compare against.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.greaterThan(2, 1); // Passes
	 * Assert.greaterThan(1, 2); // Fails
	 */
	public static greaterThan(num1: number, num2: number): void;
	public static greaterThan(num1: number, num2: number, message?: string): void;
	public static greaterThan(num1: number, num2: number, message?: () => string): void;
	public static greaterThan(num1: number, num2: number, message?: MessageType): void {
		if (num1 <= num2) {
			Assert.throwAssertionFailedException(`Expected ${num1} to be greater than ${num2}`, message);
		}
	}

	/**
	 * Asserts that a number is greater than or equal to another number.
	 * @param num1 The actual number.
	 * @param num2 The number to compare against.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.greaterThanOrEqual(2, 1); // Passes
	 * Assert.greaterThanOrEqual(1, 2); // Fails
	 */
	public static greaterThanOrEqual(num1: number, num2: number): void;
	public static greaterThanOrEqual(num1: number, num2: number, message?: string): void;
	public static greaterThanOrEqual(num1: number, num2: number, message?: () => string): void;
	public static greaterThanOrEqual(num1: number, num2: number, message?: MessageType): void {
		if (num1 < num2) {
			Assert.throwAssertionFailedException(`Expected ${num1} to be greater than or equal to ${num2}`, message);
		}
	}

	/**
	 * Asserts that a number is less than another number.
	 * @param num1 The actual number.
	 * @param num2 The number to compare against.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.lessThan(1, 2); // Passes
	 * Assert.lessThan(2, 1); // Fails
	 */
	public static lessThan(num1: number, num2: number): void;
	public static lessThan(num1: number, num2: number, message?: string): void;
	public static lessThan(num1: number, num2: number, message?: () => string): void;
	public static lessThan(num1: number, num2: number, message?: MessageType): void {
		if (num1 >= num2) {
			Assert.throwAssertionFailedException(`Expected ${num1} to be less than ${num2}`, message);
		}
	}

	/**
	 * Asserts that a number is less than or equal to another number.
	 * @param num1 The actual number.
	 * @param num2 The number to compare against.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.lessThanOrEqual(1, 2); // Passes
	 * Assert.lessThanOrEqual(2, 1); // Fails
	 */
	public static lessThanOrEqual(num1: number, num2: number): void;
	public static lessThanOrEqual(num1: number, num2: number, message?: string): void;
	public static lessThanOrEqual(num1: number, num2: number, message?: () => string): void;
	public static lessThanOrEqual(num1: number, num2: number, message?: MessageType): void {
		if (num1 > num2) {
			Assert.throwAssertionFailedException(`Expected ${num1} to be less than or equal to ${num2}`, message);
		}
	}

	/**
	 * Asserts that a number is between two other numbers.
	 * @param actual The actual number.
	 * @param min The minimum number.
	 * @param max The maximum number.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.between(2, 1, 3); // Passes
	 * Assert.between(4, 1, 3); // Fails
	 */
	public static between(actual: number, min: number, max: number): void;
	public static between(actual: number, min: number, max: number, message?: string): void;
	public static between(actual: number, min: number, max: number, message?: () => string): void;
	public static between(actual: number, min: number, max: number, message?: MessageType): void {
		if (actual > max || actual < min) {
			Assert.throwAssertionFailedException(`Expected ${actual} to be between ${min}-${max}`, message);
		}
	}

	/**
	 * Asserts that a method throws an exception.
	 * @param method The method to test.
	 * @param exception Optional exception to check for.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.throws(() => { throw new Error("Test"); }); // Passes
	 * Assert.throws(() => {}); // Fails
	 */
	public static throws(method: () => void): void;
	public static throws(method: () => void, exception: string): void;
	public static throws(method: () => void, exception?: string | ClassType): void;
	public static throws(method: () => void, exception?: string | ClassType, message?: string): void;
	public static throws(method: () => void, exception?: string | ClassType, message?: () => string): void;
	public static throws(method: () => void, exception?: string | ClassType, message?: MessageType): void {
		let thrown: unknown = undefined;

		try {
			method();
		} catch (e) {
			thrown = e;
			if (exception !== undefined) {
				if (e === exception) return;
				if (exception instanceof <ClassType>exception) return;
			} else {
				return;
			}
		}

		this.throwAssertionFailedException(
			`Expected method to throw${exception !== undefined ? ' "' + tostring(exception) + `", threw "${thrown}"` : ""}`,
			message,
		);
	}

	/**
	 * Asserts that a method does not throw an exception.
	 * @param method The method to test.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.doesNotThrow(() => {}); // Passes
	 * Assert.doesNotThrow(() => { throw new Error("Test"); }); // Fails
	 */
	public static doesNotThrow(method: () => void): void;
	public static doesNotThrow(method: () => void, message?: string): void;
	public static doesNotThrow(method: () => void, message?: () => string): void;
	public static doesNotThrow(method: () => void, message?: MessageType): void {
		try {
			method();
		} catch (e) {
			this.throwAssertionFailedException(`Expected method not to throw, threw:\n${e}`, message);
		}
	}

	/**
	 * Asserts that an array contains an element.
	 * @param expectedElement The element to check for.
	 * @param array The array to check.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.contains(1, [1, 2, 3]); // Passes
	 * Assert.contains(4, [1, 2, 3]); // Fails
	 */
	public static contains<T extends defined>(expectedElement: T, array: T[]): void;
	public static contains<T extends defined>(expectedElement: T, array: T[], message?: string): void;
	public static contains<T extends defined>(expectedElement: T, array: T[], message?: () => string): void;
	public static contains<T extends defined>(expectedElement: T, array: T[], message?: MessageType): void;
	public static contains<T extends defined>(array: T[], predicate: (element: T) => boolean): void;
	public static contains<T extends defined>(array: T[], predicate: (element: T) => boolean, message?: string): void;
	public static contains<T extends defined>(
		array: T[],
		predicate: (element: T) => boolean,
		message?: () => string,
	): void;
	public static contains<T extends defined>(
		array: T[],
		predicate: (element: T) => boolean,
		message?: MessageType,
	): void;
	public static contains<T extends defined>(
		array: T[] | T,
		predicate: T[] | ((element: T) => boolean),
		message?: MessageType,
	): void {
		if (typeOf(predicate) === "function") {
			if (!(<T[]>array).some(<(element: T) => boolean>predicate)) {
				this.throwAssertionFailedException(`Expected array to contain elements matching predicate`, message);
			}
		} else {
			if (!(<T[]>predicate).includes(<T>array)) {
				this.throwAssertionFailedException(`Expected array to contain elements matching predicate`, message);
			}
		}
	}

	/**
	 * Asserts that an array does not contain an element.
	 * @param expectedElement The element to check for.
	 * @param array The array to check.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.doesNotContain(4, [1, 2, 3]); // Passes
	 * Assert.doesNotContain(1, [1, 2, 3]); // Fails
	 */
	public static doesNotContain<T extends defined>(expectedElement: T, array: T[]): void;
	public static doesNotContain<T extends defined>(expectedElement: T, array: T[], message?: string): void;
	public static doesNotContain<T extends defined>(expectedElement: T, array: T[], message?: () => string): void;
	public static doesNotContain<T extends defined>(expectedElement: T, array: T[], message?: MessageType): void;
	public static doesNotContain<T extends defined>(array: T[], predicate: (element: T) => boolean): void;
	public static doesNotContain<T extends defined>(
		array: T[],
		predicate: (element: T) => boolean,
		message?: string,
	): void;
	public static doesNotContain<T extends defined>(
		array: T[],
		predicate: (element: T) => boolean,
		message?: () => string,
	): void;
	public static doesNotContain<T extends defined>(
		array: T[],
		predicate: (element: T) => boolean,
		message?: MessageType,
	): void;
	public static doesNotContain<T extends defined>(
		array: T[] | T,
		predicate: T[] | ((element: T) => boolean),
		message?: MessageType,
	): void {
		if (typeOf(predicate) === "function") {
			if ((<T[]>array).some(<(element: T) => boolean>predicate)) {
				this.throwAssertionFailedException(`Expected array to contain elements matching predicate`, message);
			}
		} else {
			if ((<T[]>predicate).includes(<T>array)) {
				this.throwAssertionFailedException(`Expected array to contain elements matching predicate`, message);
			}
		}
	}

	/**
	 * Asserts that an array is empty.
	 * @param array The array to check.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.empty([]); // Passes
	 * Assert.empty([1, 2, 3]); // Fails
	 */
	public static empty<T extends defined>(array: T[]): void;
	public static empty<T extends defined>(array: T[], message?: string): void;
	public static empty<T extends defined>(array: T[], message?: () => string): void;
	public static empty<T extends defined>(array: T[], message?: MessageType): void {
		const size = array.size();
		if (size !== 0) {
			this.throwAssertionFailedException(`Expected array to be empty. Got ${array}`, message);
		}
	}

	/**
	 * Asserts that an array is not empty.
	 * @param array The array to check.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.notEmpty([1, 2, 3]); // Passes
	 * Assert.notEmpty([]); // Fails
	 */
	public static notEmpty<T extends defined>(array: T[]): void;
	public static notEmpty<T extends defined>(array: T[], message?: string): void;
	public static notEmpty<T extends defined>(array: T[], message?: () => string): void;
	public static notEmpty<T extends defined>(array: T[], message?: MessageType): void {
		const size = array.size();
		if (size === 0) {
			this.throwAssertionFailedException(`Expected array to not be empty. Got ${array}`, message);
		}
	}

	/**
	 * Asserts that a promise resolves.
	 * @param promise The promise to check.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.resolves(Promise.resolve()); // Passes
	 * Assert.resolves(Promise.reject()); // Fails
	 */
	public static resolves<T>(promise: Promise<T>): void;
	public static resolves<T>(promise: Promise<T>, string?: string): void;
	public static resolves<T>(promise: Promise<T>, string?: () => string): void;
	public static resolves<T>(promise: Promise<T>, message?: MessageType): void {
		const [status] = promise.awaitStatus();
		if (status !== "Resolved") {
			this.throwAssertionFailedException(`Expected Promise to resolve, instead it ${status}`, message);
		}
	}

	/**
	 * Asserts that a promise rejects.
	 * @param promise The promise to check.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.rejects(Promise.reject()); // Passes
	 * Assert.rejects(Promise.resolve()); // Fails
	 */
	public static rejects<T>(promise: Promise<T>): void;
	public static rejects<T>(promise: Promise<T>, string?: string): void;
	public static rejects<T>(promise: Promise<T>, string?: () => string): void;
	public static rejects<T>(promise: Promise<T>, message?: MessageType): void {
		const [status] = promise.awaitStatus();
		if (status !== "Rejected") {
			this.throwAssertionFailedException(`Expected Promise to reject, instead it ${status}`, message);
		}
	}

	/**
	 * Asserts that a promise resolves within a specified duration.
	 * @param promise The promise to check.
	 * @param durationInMilliseconds The duration in milliseconds.
	 * @param message Optional message to display on failure. Can be a string or a lazy callback to a string.
	 * @example
	 * Assert.timeout(Promise.delay(1), 2000); // Passes
	 * Assert.timeout(Promise.delay(3000), 2000); // Fails
	 */
	public static async timeout<T>(promise: Promise<T>, durationInMilliseconds: number): Promise<void>;
	public static async timeout<T>(
		promise: Promise<T>,
		durationInMilliseconds: number,
		message?: string,
	): Promise<void>;
	public static async timeout<T>(
		promise: Promise<T>,
		durationInMilliseconds: number,
		message?: () => string,
	): Promise<void>;
	public static async timeout<T>(
		promise: Promise<T>,
		durationInMilliseconds: number,
		message?: MessageType,
	): Promise<void> {
		const [status] = promise.timeout(durationInMilliseconds).awaitStatus();

		if (status !== "Resolved") {
			this.throwAssertionFailedException(
				`Expected Promise to resolve within ${durationInMilliseconds}ms`,
				message,
			);
		}
	}
}
