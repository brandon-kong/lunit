import { TestRunner } from "@rbxts/lunit";
import { ReplicatedStorage } from "@rbxts/services";

const testRunner = new TestRunner([ReplicatedStorage.Tests.server, ReplicatedStorage.Tests.shared], {
	filterTags: ["Decorator"],
});

testRunner.run().then((results) => {
	print(results.size(), "test suites finished");
});
