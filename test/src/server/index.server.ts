import { TestRunner } from "@rbxts/lunit";
import { ReplicatedStorage } from "@rbxts/services";

const annotationTestRunner = new TestRunner([ReplicatedStorage.Tests.server, ReplicatedStorage.Tests.shared]);

const decoratorTestRunner = new TestRunner([ReplicatedStorage.Tests.server, ReplicatedStorage.Tests.shared]);

//annotationTestRunner.run()
decoratorTestRunner.run({
	tags: ["Decorator"],
});
