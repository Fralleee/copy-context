import { PostHog } from "posthog-node";
import * as vscode from "vscode";
import { randomUUID } from 'node:crypto';

const POSTHOG_API_KEY = 'phc_aGLAZHuUP5ifMnNdd7AyVtAoCbLJCnEXgpvrmkKp3oJ'; // public API key
const POSTHOG_HOST = 'https://eu.i.posthog.com';

let posthog: PostHog | null = null;
let userId: string | null = null;
let context: vscode.ExtensionContext | null = null;

export async function initAnalytics(extensionContext: vscode.ExtensionContext) {
    context = extensionContext;
    
    const config = vscode.workspace.getConfiguration('copyContext');
    const enabled = config.get<boolean>('enableAnalytics', true);    
    if (!enabled) return;

    try {
        const { PostHog } = await import('posthog-node');
        posthog = new PostHog(POSTHOG_API_KEY, { host: POSTHOG_HOST })
        userId = getOrCreateUserId();
        
        track('extension_activated', {
            version: extensionContext.extension.packageJSON.version,
            vscode_version: vscode.version,
        });
    } catch { }
}

export function track(event: string, properties?: Record<string, any>) {
    const config = vscode.workspace.getConfiguration('copyContext');
    const enabled = config.get<boolean>('enableAnalytics', true);
    if (!enabled || !posthog) return;

    posthog.capture({
        distinctId: userId || 'anonymous-user',
        event,
        properties: {
            ...sanitizeProperties(properties),
            platform: process.platform,
            vscode_version: vscode.version,
            ui_kind: vscode.env.uiKind === vscode.UIKind.Desktop ? 'desktop' : 'web',
        }
    });
}

export async function shutdown() {
    if (posthog) {
        await posthog.shutdown();
    }
}

function getOrCreateUserId(): string {
    if (!context) throw new Error('Analytics not initialized');
    
    const key = 'copyContext.userId';
    let id = context.globalState.get<string>(key);
    
    if (!id) {
        id = randomUUID();
        context.globalState.update(key, id);
    }
    
    return id;
}

function sanitizeProperties(props?: Record<string, any>): Record<string, any> {
    if (!props) return {};
    
    const safe: Record<string, any> = {};
    const blockedKeys = ['path', 'filename', 'content', 'uri', 'workspace', 'name'];
    
    for (const [key, value] of Object.entries(props)) {
        if (!blockedKeys.some(blocked => key.toLowerCase().includes(blocked))) {
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                safe[key] = value;
            }
        }
    }
    
    return safe;
}