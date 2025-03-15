import { TestRunner } from "@rbxts/lunit";
import { ReplicatedStorage } from "@rbxts/services";

const annotationTestRunner = new TestRunner([ReplicatedStorage.Tests.server, ReplicatedStorage.Tests.shared], {
	filterTags: ["Annotation"],
});

const decoratorTestRunner = new TestRunner([ReplicatedStorage.Tests.server, ReplicatedStorage.Tests.shared], {
	filterTags: ["Decorator"],
});

//annotationTestRunner.run()
decoratorTestRunner.run()