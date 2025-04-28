import minimatch from "minimatch";
import type { FilterContext } from "./make-filter-context";

export function shouldIncludePath(
	relPath: string,
	{ includeGlobs, excludeGlobs, gitIgnore, vscodeExcludes }: FilterContext,
): boolean {
	if (excludeGlobs.some((g) => minimatch(relPath, g, { dot: true }))) {
		return false;
	}

	if (includeGlobs.some((g) => minimatch(relPath, g, { dot: true }))) {
		return true;
	}

	if (gitIgnore?.ignores(relPath)) {
		return false;
	}

	if (vscodeExcludes.some((g) => minimatch(relPath, g, { dot: true }))) {
		return false;
	}

	return true;
}
