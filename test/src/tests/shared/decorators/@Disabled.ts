import { Disabled, DisplayName, NegativeTest, Tag, Test } from "@rbxts/lunit";

@DisplayName("@Test Decorator")
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
