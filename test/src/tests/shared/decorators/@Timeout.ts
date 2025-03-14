import { DisplayName, NegativeTest, Tag, Test, Timeout } from "@rbxts/lunit";

@DisplayName("@Timeout Decorator")
@Tag("Decorator")
class TestTimeoutUnitTests {
    @Test
    @Timeout(1 * 1000) // 1 seconds
    @DisplayName("should fail the test after timeout exceeded")
    emptyMethod() {
        task.wait(5)
    }
}

export = TestTimeoutUnitTests;
