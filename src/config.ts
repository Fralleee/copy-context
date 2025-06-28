import * as vscode from "vscode";

export function getSettings() {
	const config = vscode.workspace.getConfiguration("copyContext");
	return {
		enableAnalytics: config.get<boolean>("enableAnalytics", true),
		excludeGlobs: config.get<string[]>("excludeGlobs", []),
		includeGlobs: config.get<string[]>("includeGlobs", []),
		maxContentSize: config.get<number>("maxContentSize", 500_000),
		respectGitIgnore: config.get<boolean>("respectGitIgnore", false),
		respectVSCodeExplorerExclude: config.get<boolean>(
			"respectVSCodeExplorerExclude",
			true,
		),
		// biome-ignore lint/style/noNonNullAssertion: settings uses default
		template: config.get<string>("template")!,
	};
}
