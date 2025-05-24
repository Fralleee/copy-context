/** biome-ignore-all lint/suspicious/noConsole: necessary logs */
const esbuild = require("esbuild");

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

console.log(`[esbuild] ${production ? "production" : "development"} mode`);

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: "esbuild-problem-matcher",

	setup(build) {
		build.onStart(() => {
			console.log("[esbuild] build started");
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(
					`    ${location.file}:${location.line}:${location.column}:`,
				);
			});
			console.log("[esbuild] build finished");
		});
	},
};

async function main() {
	const ctx = await esbuild.context({
		bundle: true,
		define: {
			"process.env.NODE_ENV": production ? '"production"' : '"development"',
		},
		entryPoints: ["src/extension.ts"],
		external: ["vscode"],
		format: "cjs",
		logLevel: "silent",
		minify: production,
		outfile: "out/extension.js",
		platform: "node",
		plugins: [esbuildProblemMatcherPlugin],
		sourcemap: !production,
		sourcesContent: false,
	});

	if (watch) {
		await ctx.watch();
	} else {
		await ctx.rebuild();
		await ctx.dispose();
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
