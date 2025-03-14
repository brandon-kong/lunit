import { TestRunner, StringReporter } from "@rbxts/lunit";
import { ReplicatedStorage } from "@rbxts/services";

const reporter = new StringReporter();

const testRunner = new TestRunner([
    ReplicatedStorage.Tests.server,
    ReplicatedStorage.Tests.shared
], {
    reporter
})

testRunner.run();

print(reporter.getReport())