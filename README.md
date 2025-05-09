# Copy Code Context

Copy files or folder trees into your clipboard as Markdown—ready to paste into chats, docs, or code reviews.

---

## 🚀 Usage

1. **Explorer**  
   - Select one or more **files or folders** → right-click → **Copy Code Context**  
   - Select a root **folder** → right-click → **Copy Folder Structure**

2. **Editor Tab**  
   - Right-click a tab title → **Copy Code Context (This Tab)** or **… (All Open Tabs)**.

3. **Paste** anywhere and your Markdown snippet or tree is on the clipboard

---

## ✨ Features

### 📄 Copy Code Context  

- _Explorer_: grab paths + syntax-highlighted code blocks  
- _Tabs_: copy the active file or all open files at once (_Unsaved buffers (Untitled)_ are skipped)
- Respects include/exclude globs, VS Code Explorer excludes & (opt-in) `.gitignore` 

**Copy Code (Explorer)**

![copy-code-explorer](https://github.com/user-attachments/assets/9c2bb633-b1dc-4585-97ab-76edd61e1e87)

**Copy Code (Tabs)**

![copy-code-editor](https://github.com/user-attachments/assets/f011e5e8-6776-4b27-bad5-bd24caa40383)

### 📂 Copy Folder Structure

- Generates a Markdown tree of your folder’s contents  
- Respects the same filters (globs, Explorer excludes, `.gitignore`)

**Copy Folder Structure**

![copy-folder-structure](https://github.com/user-attachments/assets/860a0ad7-22af-46b2-85b6-cb06b873769d)


---

## 🔧 Settings

| Setting                                   | Default    | Description                                                                                           |
| ----------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| `copyContext.template`                    | <code>//&nbsp;{path}\n{content}</code> | Markdown template for text files (`{path}`, `{content}`).               |
| `copyContext.excludeGlobs`                | `[]`       | **Always exclude** these glob patterns (highest priority).                                             |
| `copyContext.includeGlobs`                | `[]`       | **Always include** these glob patterns, even if Explorer or `.gitignore` would skip them.             |
| `copyContext.maxContentSize`              | `500000`   | Max total size (bytes) of all file contents to copy.                                                  |
| `copyContext.respectVSCodeExplorerExclude`| `true`     | Skip files/folders hidden by your VS Code `files.exclude` settings.                                    |
| `copyContext.respectGitIgnore`            | `false`    | Skip files matching your project’s `.gitignore` (opt-in).                                              |

---

## 🔍 Filtering Behavior

1. **excludeGlobs** — highest priority, always skipped  
2. **includeGlobs** — next, always kept (unless excluded above)  
3. **Explorer excludes** (`files.exclude`) — on by default  
4. **.gitignore** — off by default (opt-in via setting)

---

## 📜 License

This extension is released under the [MIT License](./LICENSE).
