# Copy Context

![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/Fralle.copy-code-context)
![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/Fralle.copy-code-context)
![Visual Studio Marketplace Last Updated](https://img.shields.io/visual-studio-marketplace/last-updated/Fralle.copy-code-context)
  
Copy files or folder trees into your clipboard as Markdown. Ready to paste into AI, chats, docs, or code reviews.

---

## 🚀 Usage

1. **Explorer**
   - Select one or more **files or folders** → right-click → **Copy Content**
   - Select one or more **files or folders** → right-click → **Copy Tree**

2. **Editor Tab**
   - Right-click a tab title → **Copy Content (This Tab)** or **… (All Open Tabs)**.

3. **Paste** anywhere and your Markdown snippet or tree is on the clipboard

---

## ✨ Features

### Copy Content

- _Explorer_: grab paths + syntax-highlighted code blocks for selected files/folders
- _Tabs_: copy the active file or all open files at once (_Unsaved buffers (Untitled)_ are skipped)
- Respects include/exclude globs, VS Code Explorer excludes & (opt-in) `.gitignore`

**Copy Content (Explorer)**

![copy-context](https://github.com/user-attachments/assets/5a1a14bd-0fd8-4792-a1a2-00530503c6cf)

**Copy Content (Tabs)**

![copy-context-tabs](https://github.com/user-attachments/assets/2483793c-b0ec-4c96-a633-74c5a5fcea8f)

### Copy Tree

- Generates a Markdown tree of your selected files/folders
- If you select specific files, only those file paths are included
- If you select folders, the full folder tree and contents are included
- Respects the same filters (globs, Explorer excludes, `.gitignore`)

**Copy Tree**

![copy-tree](https://github.com/user-attachments/assets/d30c0f79-c978-4e4d-980d-ca55fa2e0fda)

---

## 🔧 Settings

### Global Settings

| Setting                                   | Default    | Description                                                                                           |
| ----------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| `copyContext.excludeGlobs`                | `[]`       | **Global exclude** patterns applied to all commands. Command-specific excludes will be merged with these. |
| `copyContext.includeGlobs`                | `[]`       | **Global include** patterns applied to all commands. Command-specific includes will be merged with these. |
| `copyContext.includeEmojis`               | `true`     | Include emojis in the output (📁 for folders, 📄 for files).                                          |
| `copyContext.maxContentSize`              | `500000`   | Max total size (bytes) of all file contents to copy.                                                  |
| `copyContext.respectVSCodeExplorerExclude`| `true`     | Skip files/folders hidden by your VS Code `files.exclude` settings.                                    |
| `copyContext.respectGitIgnore`            | `false`    | Skip files matching your project's `.gitignore` (opt-in).                                              |

### Command-Specific Settings

You can override filters for specific commands. These are **merged** with the global settings.

| Setting                                   | Default    | Description                                                                                           |
| ----------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| `copyContext.copyContent.excludeGlobs`    | `[]`       | Additional exclude patterns for **Copy Content** only.                                                |
| `copyContext.copyContent.includeGlobs`    | `[]`       | Additional include patterns for **Copy Content** only.                                                |
| `copyContext.copyTree.excludeGlobs`       | `[]`       | Additional exclude patterns for **Copy Tree** only.                                                   |
| `copyContext.copyTree.includeGlobs`       | `[]`       | Additional include patterns for **Copy Tree** only.                                                   |

**Example:** Exclude test files globally, but include them when copying content:
```json
{
  "copyContext.excludeGlobs": ["**/*.test.ts"],
  "copyContext.copyContent.includeGlobs": ["**/*.test.ts"]
}
```

---

## 📜 License

This extension is released under the [MIT License](./LICENSE).
