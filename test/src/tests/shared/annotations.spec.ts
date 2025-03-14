import { Assert, BeforeAll, BeforeEach, DisplayName, Order, Tag, Test } from "@rbxts/lunit";

@DisplayName("Annotation Tests")
@Tag("Annotation", "Decorator")
class TestDecoratorUnitTests {
	private something = false;

	@Test
	@Order(1)
	async testShouldPass() {
		Assert.true(this.something);
        await Promise.delay(5)
        print("1st");

	}

	@Test
	@Order(2)
	testShouldPass2() {
		Assert.true(this.something);
		print("2nd");
	}

	@Test
	@Order(3)
	testShouldPass3() {
		Assert.true(this.something);
		print("3rd");
	}

	@BeforeAll
	async beforeAllShouldBeOkay() {
		print("This prints before the FIRST TEST");
	}

	@BeforeAll
	beforeAllShouldErrorAndBeOkay() {
		error();
	}

	@BeforeEach
	async beforeEachShouldBeOkay() {
		this.something = false;
		print("This prints before EACH test");
		this.something = true;
	}

	@BeforeEach
	beforeEachShouldErrorAndBeOkay() {
		error();
	}
}

export = TestDecoratorUnitTests;
