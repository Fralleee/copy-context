import minimatch from "minimatch";

export function shouldIncludeFile(
	relPath: string,
	includeGlobs: string[],
	excludeGlobs: string[],
): boolean {
	const included = includeGlobs.some((glob) => minimatch(relPath, glob));
	if (!included) {
		return false;
	}

	const excluded = excludeGlobs.some((glob) => minimatch(relPath, glob));
	if (excluded) {
		return false;
	}

	return true;
}

export function shouldExclude(relPath: string, globs: string[]): boolean {
	return globs.some((glob) => minimatch(relPath, glob));
}
