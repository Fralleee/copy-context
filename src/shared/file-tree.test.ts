import type { Dirent } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fileTree } from "./file-tree";
import type { FilterContext } from "./make-filter-context";

vi.mock("node:fs/promises", () => ({
	readdir: vi.fn(),
}));

vi.mock("./filter", () => ({
	shouldIncludePath: vi.fn(() => true),
}));

type ReadDirEntry = Dirent & {
	name: string;
	isDirectory: () => boolean;
	isFile: () => boolean;
};

describe("fileTree", () => {
	const mockFilterContext: FilterContext = {
		excludeGlobs: [],
		gitIgnore: null,
		includeGlobs: [],
		vscodeExcludes: [],
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should build a simple file tree", async () => {
		const { readdir } = await import("node:fs/promises");
		const mockReaddir = vi.mocked(readdir);

		// Mock directory structure:
		// /root
		//   ├── file1.txt
		//   ├── file2.js
		//   └── subfolder/
		//       └── nested.ts

		mockReaddir
			.mockResolvedValueOnce([
				{
					isDirectory: () => false,
					isFile: () => true,
					name: "file1.txt",
				} as ReadDirEntry,
				{
					isDirectory: () => false,
					isFile: () => true,
					name: "file2.js",
				} as ReadDirEntry,
				{
					isDirectory: () => true,
					isFile: () => false,
					name: "subfolder",
				} as ReadDirEntry,
			])
			.mockResolvedValueOnce([
				{
					isDirectory: () => false,
					isFile: () => true,
					name: "nested.ts",
				} as ReadDirEntry,
			]);

		const result = await fileTree("/root", "/root", mockFilterContext);

		expect(result).toHaveLength(3);

		expect(result[0].name).toBe("subfolder");
		expect(result[0].isDirectory).toBe(true);
		expect(result[0].children).toHaveLength(1);
		expect(result[0].children?.[0].name).toBe("nested.ts");

		expect(result[1].name).toBe("file1.txt");
		expect(result[1].isDirectory).toBe(false);

		expect(result[2].name).toBe("file2.js");
		expect(result[2].isDirectory).toBe(false);
	});

	it("should handle empty directories", async () => {
		const { readdir } = await import("node:fs/promises");
		const mockReaddir = vi.mocked(readdir);

		mockReaddir.mockResolvedValueOnce([]);

		const result = await fileTree("/empty", "/root", mockFilterContext);

		expect(result).toHaveLength(0);
	});

	it("should handle directory read errors", async () => {
		const { readdir } = await import("node:fs/promises");
		const mockReaddir = vi.mocked(readdir);

		mockReaddir.mockRejectedValueOnce(new Error("Permission denied"));

		const result = await fileTree("/forbidden", "/root", mockFilterContext);

		expect(result).toHaveLength(0);
	});

	it("should filter out excluded paths", async () => {
		const { readdir } = await import("node:fs/promises");
		const mockReaddir = vi.mocked(readdir);
		const { shouldIncludePath } = await import("./filter");
		const mockShouldIncludePath = vi.mocked(shouldIncludePath);

		mockShouldIncludePath.mockImplementation((path: string) => {
			return !path.includes("node_modules");
		});

		mockReaddir.mockResolvedValueOnce([
			{
				isDirectory: () => true,
				isFile: () => false,
				name: "src",
			} as ReadDirEntry,
			{
				isDirectory: () => true,
				isFile: () => false,
				name: "node_modules",
			} as ReadDirEntry,
			{
				isDirectory: () => false,
				isFile: () => true,
				name: "package.json",
			} as ReadDirEntry,
		]);

		mockReaddir.mockResolvedValueOnce([]);

		const result = await fileTree("/project", "/project", mockFilterContext);

		expect(result).toHaveLength(1);
		expect(result.find((node) => node.name === "node_modules")).toBeUndefined();
		expect(result.find((node) => node.name === "src")).toBeUndefined();
		expect(result.find((node) => node.name === "package.json")).toBeDefined();
	});
});
