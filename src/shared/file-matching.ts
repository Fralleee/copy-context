import minimatch from "minimatch";

export function shouldIncludeFile(
	relPath: string,
	includeGlobs: string[],
	excludeGlobs: string[],
): boolean {
	console.log("shouldIncludeFile", relPath, includeGlobs);
	const included = includeGlobs.some((glob) =>
		minimatch(relPath, glob, { dot: true }),
	);
	if (!included) {
		console.log("not included", relPath);
		return false;
	}

	const excluded = excludeGlobs.some((glob) =>
		minimatch(relPath, glob, { dot: true }),
	);
	if (excluded) {
		console.log("excluded", relPath);
		return false;
	}

	console.log("included", relPath);
	return true;
}

export function shouldExclude(relPath: string, globs: string[]): boolean {
	return globs.some((glob) => minimatch(relPath, glob));
}
