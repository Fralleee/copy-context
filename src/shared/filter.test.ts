import ignore from "ignore";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as config from "../config";
import { shouldIncludePath } from "./filter";
import type { FilterContext } from "./make-filter-context";

describe("shouldIncludePath()", () => {
	let cfgStub: ReturnType<typeof vi.spyOn>;
	const filterContext: FilterContext = {
		excludeGlobs: [],
		gitIgnore: null,
		includeGlobs: [],
		vscodeExcludes: [],
	};

	beforeEach(() => {
		filterContext.includeGlobs = [];
		filterContext.excludeGlobs = [];
		filterContext.gitIgnore = null;
		filterContext.vscodeExcludes = [];

		cfgStub = vi.spyOn(config, "getSettings");
	});

	afterEach(() => {
		cfgStub.mockRestore();
	});

	it("excludes anything matching excludeGlobs first", () => {
		filterContext.includeGlobs = ["**/*.txt"];
		filterContext.excludeGlobs = ["**/secret/**"];

		expect(shouldIncludePath("foo/secret/data.txt", filterContext)).toBe(false);
		expect(shouldIncludePath("foo/public/data.txt", filterContext)).toBe(true);
	});

	it("always includes includeGlobs even if gitignore or vscode exclude match", () => {
		filterContext.includeGlobs = ["**/*.log"];
		filterContext.gitIgnore = ignore().add("**/*.log");
		filterContext.vscodeExcludes = ["**/*.log"];

		expect(shouldIncludePath("error.log", filterContext)).toBe(true);
	});

	it("respects gitignore when enabled", () => {
		filterContext.gitIgnore = ignore().add("**/build/**");
		cfgStub.mockReturnValue({
			maxContentSize: 0,
			respectGitIgnore: true,
			respectVSCodeExplorerExclude: false,
		});

		expect(shouldIncludePath("build/index.js", filterContext)).toBe(false);
		expect(shouldIncludePath("src/index.js", filterContext)).toBe(true);
	});

	it("respects VS Code explorer excludes when enabled", () => {
		filterContext.vscodeExcludes = ["**/*.secret"];
		cfgStub.mockReturnValue({
			maxContentSize: 0,
			respectGitIgnore: false,
			respectVSCodeExplorerExclude: true,
		});

		expect(shouldIncludePath("notes.secret", filterContext)).toBe(false);
		expect(shouldIncludePath("notes.txt", filterContext)).toBe(true);
	});

	it("defaults to include everything else", () => {
		expect(shouldIncludePath("anything/you/want.txt", filterContext)).toBe(
			true,
		);
	});
});
