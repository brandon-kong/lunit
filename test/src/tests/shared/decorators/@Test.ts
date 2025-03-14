import { DisplayName, Test } from "@rbxts/lunit";

@DisplayName("@Test Decorator")
class TestDecoratorUnitTests {
	@Test
	@DisplayName("should pass in an empty method")
	emptyMethod() {}
}

export = TestDecoratorUnitTests