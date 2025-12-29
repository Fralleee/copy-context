import { describe, expect, it, vi } from "vitest";
import {
	applyTemplate,
	formatBinaryAsMarkdown,
	formatCodeAsMarkdown,
} from "./markdown";

vi.mock("../../config");

describe("Markdown Formatting", () => {
	describe("formatCodeAsMarkdown", () => {
		it("should format JavaScript files correctly", () => {
			const result = formatCodeAsMarkdown(
				"src/test.js",
				'console.log("hello");',
			);

			expect(result).toContain("```js");
			expect(result).toContain("// src/test.js");
			expect(result).toContain('console.log("hello");');
			expect(result).toContain("```");
		});

		const result = formatCodeAsMarkdown(
			"src/utils.ts",
			"const x: number = 42;",
		);

		expect(result).toContain("```ts");
		expect(result).toContain("// src/utils.ts");
		expect(result).toContain("const x: number = 42;");
	});

	it("should use hash header for Python files", () => {
		const result = formatCodeAsMarkdown("src/app.py", "print('hi')");

		expect(result).toContain("```python");
		expect(result).toContain("# src/app.py");
		expect(result).toContain("print('hi')");
	});

	it("should use HTML comment header for HTML files", () => {
		const result = formatCodeAsMarkdown("index.html", "<div></div>");

		expect(result).toContain("```html");
		expect(result).toContain("<!-- index.html -->");
		expect(result).toContain("<div></div>");
	});

	it("should handle unknown file extensions", () => {
		const result = formatCodeAsMarkdown("README.xyz", "Some content");

		expect(result).toContain("```plaintext");
		expect(result).toContain("README.xyz");
		expect(result).toContain("Some content");
	});

	it("should allow path outside the code fence", () => {
		const result = formatCodeAsMarkdown(
			"src/app.ts",
			"const foo = 'bar';",
			true,
		);

		expect(result.startsWith("src/app.ts\n```ts\n")).toBe(true);
		expect(result).toContain("const foo = 'bar';");
		expect(result).not.toContain("// src/app.ts");
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
		expect(result).toContain("assets/logo.png");
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

	it("should place binary path outside the code fence", () => {
		const meta = { size: 1024 };
		const result = formatBinaryAsMarkdown("data.bin", meta, true);

		expect(result.startsWith("data.bin\n```plaintext\n")).toBe(true);
		expect(result).not.toContain("// data.bin");
	});
});

describe("applyTemplate", () => {
	it("should apply default template correctly", () => {
		const vars = {
			content: 'console.log("test");',
			language: "js",
			path: "src/test.js",
		};

		const result = applyTemplate(vars);

		expect(result).toContain("```js");
		expect(result).toContain("// src/test.js");
		expect(result).toContain('console.log("test");');
		expect(result).toContain("```");
	});

	it("should place path above the code fence when requested", () => {
		const result = applyTemplate({
			content: "body",
			language: "js",
			path: "src/test.js",
			pathOutsideCodeBlock: true,
		});

		expect(result.startsWith("src/test.js\n```js\n")).toBe(true);
		expect(result).not.toContain("// src/test.js");
	});
});
