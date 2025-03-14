import { DisplayName, NegativeTest, Test } from "@rbxts/lunit";

@DisplayName("@Test Decorator")
class TestDecoratorUnitTests {
	@Test
	@DisplayName("should pass in an empty method")
	emptyMethod() {}

	@Test
	@DisplayName("should fail test")
	@NegativeTest
	emptyMethod2() {
		error()
	}
}

export = TestDecoratorUnitTests