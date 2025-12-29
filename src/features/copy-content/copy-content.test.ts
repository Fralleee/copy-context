/** biome-ignore-all lint/suspicious/noExplicitAny: allow any for tests */

import * as fs from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";
import type { FileTreeNode } from "../../shared/file-tree";
import * as fileTreeModule from "../../shared/file-tree";
import * as filterModule from "../../shared/make-filter-context";
import { copyCode } from "./copy-content";
import * as detectBinaryModule from "./detect-binary";
import { applyTemplate, formatCodeAsMarkdown } from "./markdown";

vi.mock("../../shared/file-tree");
vi.mock("../../shared/make-filter-context");
vi.mock("./detect-binary");
vi.mock("../../config");

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
				fullPath: "/project/src/utils.ts",
				isDirectory: false,
				name: "utils.ts",
				relativePath: "src/utils.ts",
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

const fileContents: Record<string, string> = {
	"/project/README.md": "# README",
	"/project/src/index.ts": "console.log('index');",
	"/project/src/utils.ts": "console.log('utils');",
};

describe("copyCode integration", () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(filterModule.makeFilterContext).mockResolvedValue(filterContext);
		vi.mocked(fileTreeModule.fileTree).mockResolvedValue(mockTree);
		vi.mocked(detectBinaryModule.detectBinary).mockResolvedValue(false as any);
		const { getSettings } = await import("../../config");
		vi.mocked(getSettings).mockReturnValue({
			maxContentSize: 500_000,
			pathOutsideCodeBlock: false,
		} as any);

		(fs.readFile as any).mockImplementation((p: string) =>
			Promise.resolve(fileContents[p]),
		);

		(vscode.workspace as any).fs = {
			stat: vi.fn((uri: vscode.Uri) => {
				if (uri.fsPath === "/project") {
					return { type: vscode.FileType.Directory };
				}
				return { type: vscode.FileType.File };
			}),
		};
	});

	it("writes formatted file contents to clipboard", async () => {
		const progress = { report: vi.fn() };
		vi.mocked(vscode.window.withProgress).mockImplementation(
			async (_opts, cb) =>
				cb(
					progress as any,
					{ isCancellationRequested: false } as vscode.CancellationToken,
				),
		);

		await copyCode([vscode.Uri.file("/project")]);

		const expected = (
			applyTemplate({
				content: fileContents["/project/src/index.ts"],
				language: "ts",
				path: "src/index.ts",
			}) +
			applyTemplate({
				content: fileContents["/project/src/utils.ts"],
				language: "ts",
				path: "src/utils.ts",
			}) +
			applyTemplate({
				content: fileContents["/project/README.md"],
				language: "markdown",
				path: "README.md",
			})
		).trim();

		expect(vscode.env.clipboard.writeText).toHaveBeenCalledWith(expected);
		expect(progress.report).toHaveBeenCalledTimes(1);
	});

	it("respects pathOutsideCodeBlock setting", async () => {
		const progress = { report: vi.fn() };
		const { getSettings } = await import("../../config");
		vi.mocked(getSettings).mockReturnValue({
			maxContentSize: 500_000,
			pathOutsideCodeBlock: true,
		} as any);

		vi.mocked(vscode.window.withProgress).mockImplementation(
			async (_opts, cb) =>
				cb(
					progress as any,
					{ isCancellationRequested: false } as vscode.CancellationToken,
				),
		);

		await copyCode([vscode.Uri.file("/project")]);

		const expected = (
			formatCodeAsMarkdown("src/index.ts", fileContents["/project/src/index.ts"], true) +
			formatCodeAsMarkdown("src/utils.ts", fileContents["/project/src/utils.ts"], true) +
			formatCodeAsMarkdown("README.md", fileContents["/project/README.md"], true)
		).trim();

		expect(vscode.env.clipboard.writeText).toHaveBeenCalledWith(expected);
	});
});
