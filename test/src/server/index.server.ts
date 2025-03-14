import { TestRunner } from "@rbxts/lunit";
import { ReplicatedStorage } from "@rbxts/services";
import { StringReporter } from "shared/reporter";

const reporter = new StringReporter();

const testRunner = new TestRunner([
    ReplicatedStorage.Tests.server,
    ReplicatedStorage.Tests.shared
], {
    reporter
})

testRunner.run().then(() => {
    print(reporter.getReport())
})
