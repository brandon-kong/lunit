import { Decorators } from "@rbxts/lunit";

@Decorators.DisplayName("@Timeout Decorator")
@Decorators.Tag("Decorator")
class TestTimeoutUnitTests {
	@Decorators.Test
	@Decorators.Timeout(1 * 1000) // 1 seconds
	@Decorators.Negated
	@Decorators.DisplayName("should fail the test after timeout exceeded")
	emptyMethod() {
		task.wait(5);
	}
}

export = TestTimeoutUnitTests;
