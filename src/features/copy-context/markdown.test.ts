import { beforeEach, describe, expect, it, vi } from "vitest";
import * as config from "../../config";
import {
	applyTemplate,
	formatBinaryAsMarkdown,
	formatCodeAsMarkdown,
} from "./markdown";

vi.mock("../../config");

describe("Markdown Formatting", () => {
	beforeEach(() => {
		vi.mocked(config.getSettings).mockReturnValue({
			excludeGlobs: [],
			includeGlobs: [],
			maxContentSize: 500000,
			respectGitIgnore: false,
			respectVSCodeExplorerExclude: true,
			template: "// {path}\n{content}",
		});
	});

	describe("formatCodeAsMarkdown", () => {
		it("should format JavaScript files correctly", () => {
			const result = formatCodeAsMarkdown(
				"src/test.js",
				'console.log("hello");',
			);

			expect(result).toContain("```javascript");
			expect(result).toContain("// src/test.js");
			expect(result).toContain('console.log("hello");');
			expect(result).toContain("```");
		});

		it("should format TypeScript files correctly", () => {
			const result = formatCodeAsMarkdown(
				"src/utils.ts",
				"const x: number = 42;",
			);

			expect(result).toContain("```typescript");
			expect(result).toContain("// src/utils.ts");
			expect(result).toContain("const x: number = 42;");
		});

		it("should handle unknown file extensions", () => {
			const result = formatCodeAsMarkdown("README.xyz", "Some content");

			expect(result).toContain("```plaintext");
			expect(result).toContain("// README.xyz");
			expect(result).toContain("Some content");
		});

		it("should detect language from various extensions", () => {
			const testCases = [
				{ expectedLang: "python", file: "test.py" },
				{ expectedLang: "java", file: "test.java" },
				{ expectedLang: "cpp", file: "test.cpp" },
				{ expectedLang: "json", file: "test.json" },
				{ expectedLang: "html", file: "test.html" },
				{ expectedLang: "css", file: "test.css" },
			];

			testCases.forEach(({ file, expectedLang }) => {
				const result = formatCodeAsMarkdown(file, "content");
				expect(result).toContain(`\`\`\`${expectedLang}`);
			});
		});
	});

	describe("formatBinaryAsMarkdown", () => {
		it("should format binary file metadata", () => {
			const meta = { mime: "image/png", size: 2048 };
			const result = formatBinaryAsMarkdown("assets/logo.png", meta);

			expect(result).toContain("```plaintext");
			expect(result).toContain("// assets/logo.png");
			expect(result).toContain("- size: 2.0 KB");
			expect(result).toContain("- mime: image/png");
		});

		it("should format binary file without mime type", () => {
			const meta = { size: 1024 };
			const result = formatBinaryAsMarkdown("data.bin", meta);

			expect(result).toContain("- size: 1.0 KB");
			expect(result).not.toContain("- mime:");
		});

		it("should handle very small files", () => {
			const meta = { size: 500 };
			const result = formatBinaryAsMarkdown("tiny.bin", meta);

			expect(result).toContain("- size: 0.5 KB");
		});
	});

	describe("applyTemplate", () => {
		it("should apply default template correctly", () => {
			const vars = {
				content: 'console.log("test");',
				language: "javascript",
				path: "src/test.js",
			};

			const result = applyTemplate(vars);

			expect(result).toContain("```javascript");
			expect(result).toContain("// src/test.js");
			expect(result).toContain('console.log("test");');
			expect(result).toContain("```");
		});

		it("should handle custom template", () => {
			vi.mocked(config.getSettings).mockReturnValue({
				excludeGlobs: [],
				includeGlobs: [],
				maxContentSize: 500000,
				respectGitIgnore: false,
				respectVSCodeExplorerExclude: true,
				template: "File: {path}\\n\\n{content}",
			});

			const vars = {
				content: "Hello world",
				language: "plaintext",
				path: "test.txt",
			};

			const result = applyTemplate(vars);

			expect(result).toContain("File: test.txt");
			expect(result).toContain("Hello world");
		});

		it("should handle newlines in template", () => {
			vi.mocked(config.getSettings).mockReturnValue({
				excludeGlobs: [],
				includeGlobs: [],
				maxContentSize: 500000,
				respectGitIgnore: false,
				respectVSCodeExplorerExclude: true,
				template: "{path}\\n\\n{content}",
			});

			const result = applyTemplate({
				content: "content",
				language: "plaintext",
				path: "test.txt",
			});

			expect(result).toContain("test.txt\n\ncontent");
		});
	});
});
