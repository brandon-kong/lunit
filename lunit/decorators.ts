import { Annotation, DEFAULT_ORDER, Environment } from "./common";
import { createDecorator, createAnnotation } from "./utils/decorator-utils";
/**
 * Marks a method as a test case.
 * @example
 * ```typescript
 * @Test
 * public myTest() {
 *   // test code here
 * }
 * ```
 */
export const Test = createDecorator({ options: { isATest: true } });

/**
 * Disables a test case or test class.
 * @param message - An optional message explaining why the test is disabled.
 * @example
 * ```typescript
 * @Disabled("This test is temporarily disabled")
 * public myTest() {
 *   // test code here
 * }
 * ```
 */
export const Disabled = (message?: string) => createDecorator({ options: { disabled: { value: true, message } } });

/**
 * Sets a display name for a test case or test class.
 * @param name - The display name to use.
 * @example
 * ```typescript
 * @DisplayName("My Custom Test Name")
 * public myTest() {
 *   // test code here
 * }
 * ```
 */
export const DisplayName = (name: string) => createDecorator({ options: { displayName: name } });

/**
 * Sets a timeout for a test case.
 * @param timeInMilliseconds - The timeout duration in milliseconds.
 * @example
 * ```typescript
 * @Timeout(1000)
 * public myTest() {
 *   // test code here
 * }
 * ```
 */
export const Timeout = (timeInMilliseconds: number) => createDecorator({ options: { timeout: timeInMilliseconds } });

/**
 * Sets the order in which a test case should be run.
 * @param order - The order index.
 * @example
 * ```typescript
 * @Order(1)
 * public myTest() {
 *   // test code here
 * }
 * ```
 */
export const Order = (order: number) => createDecorator({ options: { order } });

/**
 * Specifies that a test case should run on the server.
 * @example
 * ```typescript
 * @Server
 * public myTest() {
 *   // test code here
 * }
 * ```
 */
export const Server = createDecorator({ options: { environment: Environment.Server } });

/**
 * Specifies that a test case should run on the client.
 * @example
 * ```typescript
 * @Client
 * public myTest() {
 *   // test code here
 * }
 * ```
 */
export const Client = createDecorator({ options: { environment: Environment.Client } });

/**
 * Marks a method to be run before each test case.
 * @example
 * ```typescript
 * @BeforeEach
 * public setup() {
 *   // setup code here
 * }
 * ```
 */
export const BeforeEach = createAnnotation(Annotation.BeforeEach);

/**
 * Marks a method to be run before each test case.
 * @example
 * ```typescript
 * @Before
 * public setup() {
 *   // setup code here
 * }
 * ```
 */
export const Before = createAnnotation(Annotation.BeforeEach);

/**
 * Marks a method to be run before all test cases.
 * @example
 * ```typescript
 * @BeforeAll
 * public setupAll() {
 *   // setup code here
 * }
 * ```
 */
export const BeforeAll = createAnnotation(Annotation.BeforeAll);

/**
 * Marks a method to be run after each test case.
 * @example
 * ```typescript
 * @After
 * public teardown() {
 *   // teardown code here
 * }
 * ```
 */
export const After = createAnnotation(Annotation.AfterEach);

/**
 * Marks a method to be run after each test case.
 * @example
 * ```typescript
 * @AfterEach
 * public teardown() {
 *   // teardown code here
 * }
 * ```
 */
export const AfterEach = createAnnotation(Annotation.AfterEach);

/**
 * Marks a method to be run after all test cases.
 * @example
 * ```typescript
 * @AfterAll
 * public teardownAll() {
 *   // teardown code here
 * }
 * ```
 */
export const AfterAll = createAnnotation(Annotation.AfterAll);

/**
 * Assigns one or more tags to a test case or test class for filtering and categorization.
 *
 * Tags allow selective execution of test cases, making it easier to run specific groups of tests
 * (e.g., regression, smoke, or critical tests).
 *
 * @param tags - One or more string tags associated with the test.
 *
 * @example
 * ```typescript
 * @Tag("Regression")
 * public myTest() {
 *   // This test belongs to the "Regression" category
 * }
 *
 * @Tag("Smoke", "Critical")
 * public anotherTest() {
 *   // This test belongs to both "Smoke" and "Critical" categories
 * }
 * ```
 */
export const Tag = (...args: string[]) => createDecorator({ options: { tags: args } });

/**
 * Flips the result of a test case. If the test case would normally pass, it will be marked as failed, and if it would normally fail, it will be marked as passed.
 *
 * This is useful for testing the behavior of test runners and reporters.
 * @example
 * ```typescript
 * @Test
 * @Negated
 * public myTest() {
 *   // test code here
 * }
 * ```
 */
export const Negated = createDecorator({
	options: { negated: true },
});

/**
 * Conditionally skips a test case or test class.
 * @param condition - A boolean condition to determine if the test should be skipped.
 * @param message - An optional message explaining why the test is skipped.
 * @example
 * ```typescript
 * @Skip(process.env.NODE_ENV === 'production', "Skip in production environment")
 * public myTest() {
 *   // test code here
 * }
 * ```
 */
export const Skip = (condition: boolean, message?: string) =>
	createDecorator({ options: { disabled: { value: condition, message } } });

export default {
	// Test property decorators
	Test,
	Disabled,
	DisplayName,
	Timeout,
	Order,
	Server,
	Client,
	Tag,
	Negated,
	Skip,

	// Test execution lifecycle decorators
	Before,
	BeforeAll,
	BeforeEach,
	After,
	AfterEach,
	AfterAll,
};
