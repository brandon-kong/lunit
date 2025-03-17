import { Disabled, DisplayName, Tag, Test } from "@rbxts/lunit";

@DisplayName("@Disabled Decorator")
@Tag("Decorator")
class TestDecoratorUnitTests {
	@Test
	@Disabled()
	@DisplayName("should skip this test with no message")
	emptyMethod() {}

	@Test
	@Disabled("skip message")
	@DisplayName("should skip this test with message")
	emptyMethod2() {}
}

export = TestDecoratorUnitTests;
