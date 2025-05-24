/** biome-ignore-all lint/suspicious/noTemplateCurlyInString: uses specific templating */
module.exports = {
	branches: ["main"],
	plugins: [
		[
			"@semantic-release/commit-analyzer",
			{
				preset: "conventionalcommits",
				releaseRules: [{ release: "patch", type: "chore" }],
			},
		],
		[
			"@semantic-release/release-notes-generator",
			{
				preset: "conventionalcommits",
				presetConfig: {
					types: [
						{ section: "Features", type: "feat" },
						{ section: "Bug Fixes", type: "fix" },
						{ section: "Chores", type: "chore" },
					],
				},
			},
		],
		["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],
		[
			"@semantic-release/exec",
			{ prepareCmd: "npm version ${nextRelease.version} --no-git-tag-version" },
		],
		[
			"@semantic-release/git",
			{
				assets: ["package.json", "CHANGELOG.md"],
				message:
					"chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
			},
		],
		"@semantic-release/github",
	],
};
