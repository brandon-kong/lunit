/**
 * Represents a generic exception with a message.
 */
export interface Exception {
	/**
	 * The message describing the exception.
	 */
	readonly message: string;

	/**
	 * Converts the exception to a string representation.
	 * @returns A string representation of the exception.
	 */
	toString(): string;
}

/**
 * Represents an exception that is thrown when an assertion fails.
 */
export class AssertionFailedException implements Exception {
	/**
	 * The message describing the exception.
	 */
	public readonly message: string;

	/**
	 * Constructs a new `AssertionFailedException`.
	 * @param fallbackMessage - The fallback message to use if no message is provided.
	 * @param message - An optional message describing the exception.
	 */
	public constructor(fallbackMessage: string, message?: string) {
		this.message = fallbackMessage ?? message;
		error(this.toString(), 5);
	}

	/**
	 * Converts the exception to a string representation.
	 * @returns A string representation of the exception.
	 */
	public toString(): string {
		return this.message;
	}
}
