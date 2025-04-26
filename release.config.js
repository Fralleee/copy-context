module.exports = {
	branches: ["main"],
	plugins: [
		"@semantic-release/commit-analyzer",
		"@semantic-release/release-notes-generator",
		[
			"@semantic-release/changelog",
			{
				changelogFile: "CHANGELOG.md",
			},
		],
		[
			"@semantic-release/exec",
			{
				prepareCmd: [
					"npm version ${nextRelease.version} --no-git-tag-version",
					"npx vsce package --out copy-code-context.vsix",
				].join(" && "),
			},
		],
		[
			"@semantic-release/git",
			{
				assets: ["package.json", "CHANGELOG.md", "copy-code-context.vsix"],
				message:
					"chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
			},
		],
		[
			"@semantic-release/github",
			{
				assets: [
					{
						path: "copy-code-context.vsix",
						label: "VS Code Extension",
					},
				],
			},
		],
	],
};
