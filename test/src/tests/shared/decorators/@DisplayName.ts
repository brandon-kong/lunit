import { BeforeAll, DisplayName, NegativeTest, Tag, Test } from "@rbxts/lunit";

@DisplayName("@DisplayName Decorator")
@Tag("Decorator")
class TestDecoratorUnitTests {
	@Test
	@DisplayName("should diplay this custom name")
	emptyMethod() {}

	@Test
	shouldNotDisplayCustomName() {}

	@BeforeAll
	beforeAll() {
		error();
	}
}

export = TestDecoratorUnitTests;
