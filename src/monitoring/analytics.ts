import type { PostHog } from "posthog-node";
import * as vscode from "vscode";
import { getSettings } from "../config";

const POSTHOG_API_KEY = "phc_aGLAZHuUP5ifMnNdd7AyVtAoCbLJCnEXgpvrmkKp3oJ"; // public API key
const POSTHOG_HOST = "https://eu.i.posthog.com";

let posthog: PostHog | null = null;
const settings = getSettings();

export async function initAnalytics(extensionContext: vscode.ExtensionContext) {
	if (!settings.enableAnalytics) return;

	try {
		const { PostHog } = await import("posthog-node");
		posthog = new PostHog(POSTHOG_API_KEY, {
			disableGeoip: false,
			host: POSTHOG_HOST,
		});
		posthog.identify({
			distinctId: vscode.env.machineId,
			properties: {
				language: vscode.env.language,
				platform: process.platform,
				settings,
			},
		});

		track("extension_activated", {
			version: extensionContext.extension.packageJSON.version,
			vscode_version: vscode.version,
		});
	} catch {}
}

export function track(event: string, properties?: Record<string, unknown>) {
	if (!settings.enableAnalytics || !posthog) return;

	posthog.capture({
		distinctId: vscode.env.machineId || "anonymous-user",
		event,
		properties: {
			...sanitizeProperties(properties),
			platform: process.platform,
			session_id: vscode.env.sessionId,
			ui_kind: vscode.env.uiKind === vscode.UIKind.Desktop ? "desktop" : "web",
			vscode_version: vscode.version,
		},
	});
}

export async function shutdown() {
	if (posthog) {
		await posthog.shutdown();
	}
}

function sanitizeProperties(
	props?: Record<string, unknown>,
): Record<string, unknown> {
	if (!props) return {};

	const safe: Record<string, unknown> = {};
	const blockedKeys = [
		"path",
		"filename",
		"content",
		"uri",
		"workspace",
		"name",
	];

	for (const [key, value] of Object.entries(props)) {
		if (!blockedKeys.some((blocked) => key.toLowerCase().includes(blocked))) {
			if (
				typeof value === "string" ||
				typeof value === "number" ||
				typeof value === "boolean"
			) {
				safe[key] = value;
			}
		}
	}

	return safe;
}
