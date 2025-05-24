import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	test: {
		coverage: {
			exclude: [
				"node_modules/",
				"out/",
				"src/**/*.test.ts",
				"src/**/*.spec.ts",
			],
			provider: "v8",
			reporter: ["text", "json", "html"],
		},
		environment: "node",
		exclude: ["node_modules", "out", ".vscode-test"],
		globals: true,
		include: ["src/**/*.{test,spec}.{js,ts}"],
		setupFiles: ["./src/test/setup.ts"],
	},
});
