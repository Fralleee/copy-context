import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		setupFiles: ["./vitest.setup.js"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
		},
	},
});
