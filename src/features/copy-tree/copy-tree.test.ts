/** biome-ignore-all lint/suspicious/noExplicitAny: allow any for tests */
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";
import type { FileTreeNode } from "../../shared/file-tree";
import * as fileTreeModule from "../../shared/file-tree";
import * as filterModule from "../../shared/make-filter-context";
import { buildAsciiLines } from "./build-ascii-lines";
import { copyTree } from "./copy-tree";

vi.mock("../../shared/file-tree");
vi.mock("../../shared/make-filter-context");

const mockTree: FileTreeNode[] = [
	{
		children: [
			{
				fullPath: "/project/src/index.ts",
				isDirectory: false,
				name: "index.ts",
				relativePath: "src/index.ts",
			},
			{
				children: [
					{
						fullPath: "/project/src/utils/helpers.ts",
						isDirectory: false,
						name: "helpers.ts",
						relativePath: "src/utils/helpers.ts",
					},
				],
				fullPath: "/project/src/utils",
				isDirectory: true,
				name: "utils",
				relativePath: "src/utils",
			},
		],
		fullPath: "/project/src",
		isDirectory: true,
		name: "src",
		relativePath: "src",
	},
	{
		fullPath: "/project/README.md",
		isDirectory: false,
		name: "README.md",
		relativePath: "README.md",
	},
];

const filterContext = {
	excludeGlobs: [],
	gitIgnore: null,
	includeGlobs: [],
	vscodeExcludes: [],
};

describe("buildAsciiLines", () => {
	it("produces expected ASCII lines and calls progress", async () => {
		const progress = vi.fn();
		const lines = await buildAsciiLines(
			mockTree,
			"",
			{ isCancellationRequested: false } as vscode.CancellationToken,
			progress,
		);

		expect(lines).toEqual([
			"├── 📁 src",
			"│   ├── 📄 index.ts",
			"│   └── 📁 utils",
			"│       └── 📄 helpers.ts",
			"└── 📄 README.md",
		]);
		expect(progress).toHaveBeenCalledTimes(5);
	});
});

describe("copyTree", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(filterModule.makeFilterContext).mockResolvedValue(filterContext);
		vi.mocked(fileTreeModule.fileTree).mockResolvedValue(mockTree);
		(vscode.workspace as any).fs = {
			stat: vi.fn().mockResolvedValue({ type: vscode.FileType.Directory }),
		};
	});

	it("writes folder structure to clipboard and reports progress", async () => {
		const progress = { report: vi.fn() };
		vi.mocked(vscode.window.withProgress).mockImplementation(
			async (_opts, cb) => {
				return await cb(
					progress as any,
					{ isCancellationRequested: false } as vscode.CancellationToken,
				);
			},
		);

		await copyTree([vscode.Uri.file("/project")]);

		const expectedBlock = [
			"```plaintext",
			"📁 /",
			"├── 📁 src",
			"│   ├── 📄 index.ts",
			"│   └── 📁 utils",
			"│       └── 📄 helpers.ts",
			"└── 📄 README.md",
			"```",
		].join("\n");

		expect(vscode.env.clipboard.writeText).toHaveBeenCalledWith(expectedBlock);
		expect(progress.report).toHaveBeenCalledTimes(1);
	});
});
