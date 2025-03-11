import { Annotation, Scope, DEFAULT_ORDER } from "./common";
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
export const Test = createDecorator({ options: { isATest: true, order: DEFAULT_ORDER } });

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
export const Server = createDecorator({ options: { scope: Scope.Server } });

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
export const Client = createDecorator({ options: { scope: Scope.Client } });

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

export default {
	Test,
	Disabled,
	DisplayName,
	Timeout,
	Order,
	Server,
	Client,
	Before,
	BeforeAll,
	BeforeEach,
	After,
	AfterEach,
	AfterAll,
};
