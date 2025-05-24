import { vi } from 'vitest';

const mockVscode = {
  workspace: {
    getConfiguration: vi.fn(() => ({
      get: vi.fn((key: string, defaultValue?: any) => {
        const defaults: Record<string, any> = {
          'includeGlobs': [],
          'excludeGlobs': [],
          'respectGitIgnore': false,
          'respectVSCodeExplorerExclude': true,
          'maxContentSize': 500000,
          'template': '// {path}\n{content}',
          'enableAnalytics': false,
        };
        return defaults[key] ?? defaultValue;
      }),
    })),
    workspaceFolders: [],
    getWorkspaceFolder: vi.fn(),
  },
  window: {
    showErrorMessage: vi.fn(),
    showInformationMessage: vi.fn(),
    createOutputChannel: vi.fn(() => ({
      appendLine: vi.fn(),
      show: vi.fn(),
    })),
    setStatusBarMessage: vi.fn(),
    withProgress: vi.fn(),
    activeTextEditor: null,
    tabGroups: {
      all: [],
    },
  },
  env: {
    clipboard: {
      writeText: vi.fn(),
    },
    machineId: 'test-machine-id',
    sessionId: 'test-session-id',
    language: 'en',
    uiKind: 1,
  },
  commands: {
    registerCommand: vi.fn(),
  },
  Uri: {
    parse: vi.fn((path: string) => ({ fsPath: path, scheme: 'file' })),
    file: vi.fn((path: string) => ({ fsPath: path, scheme: 'file' })),
  },
  FileType: {
    Directory: 2,
    File: 1,
  },
  ProgressLocation: {
    Notification: 15,
  },
  UIKind: {
    Desktop: 1,
    Web: 2,
  },
  CancellationToken: {
    isCancellationRequested: false,
  },
};

vi.mock('vscode', () => mockVscode);

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  stat: vi.fn(),
  readdir: vi.fn(),
}));

vi.mock('file-type', () => ({
  fromFile: vi.fn(),
}));

vi.mock('istextorbinary', () => ({
  isText: vi.fn(() => true),
}));

vi.mock('posthog-node', () => ({
  PostHog: vi.fn(() => ({
    capture: vi.fn(),
    shutdown: vi.fn(),
  })),
}));