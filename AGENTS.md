# AGENTS.md

This file provides guidance to agents when working with code in this repository.

- Settings View Pattern: When working on `SettingsView`, inputs must bind to the local `cachedState`, NOT the live `useExtensionState()`. The `cachedState` acts as a buffer for user edits, isolating them from the `ContextProxy` source-of-truth until the user explicitly clicks "Save". Wiring inputs directly to the live state causes race conditions.

## Test Placement Guidance

Prefer the narrowest test layer that proves the behavior. This follows standard test-pyramid guidance: keep most coverage in fast, focused tests; add integration tests for cross-module contracts; reserve end-to-end tests for full workflow confidence.

- Use package-local unit tests for pure logic, parsing, state transitions, validation, serialization, request construction, retry decisions, and error handling.
- Use integration tests when behavior depends on multiple internal modules working together, but does not require the real VS Code extension host or browser/webview runtime.
- Use `webview-ui` tests for React rendering, hooks, component state, forms, validation, and webview UI wiring.
- Use `apps/vscode-e2e` only when the behavior depends on the real VS Code extension host, VS Code workspace APIs, extension activation, webview/extension messaging, file watcher behavior, or a complete user workflow.
- Keep e2e tests focused on high-value smoke coverage across boundaries. Avoid placing detailed protocol, parsing, storage, retry, or edge-case assertions in e2e when they can be covered reliably at a lower layer.
- When fixing a regression, add the regression test at the lowest layer that would have failed for the bug. Add an e2e test only if lower-level tests cannot represent the failure mode.

## Local VSIX Release and Installation

Use the repository-pinned Node.js 20.20.2 and pnpm 10.8.1 versions.

1. Increment the SemVer value in `src/package.json` and add the same version to `CHANGELOG.md`. The extension bundle copies the root changelog into `src/CHANGELOG.md`.
2. Install locked dependencies with `pnpm install --frozen-lockfile`.
3. Build required workspace packages with `pnpm --filter @roo-code/build build` and `pnpm --filter @roo-code/vscode-webview build`.
4. Package the extension with `pnpm --filter ./src vsix`. The output is `bin/azikaban-q-code-<version>.vsix`.
5. Install it with `node scripts/install-vsix.js -y --editor=code`. This uninstalls the existing `Azikaban.azikaban-q-code` extension before installing the new VSIX.
6. Verify the installed version with `code --list-extensions --show-versions`, then restart or reload VS Code.

Use `--editor=cursor` or `--editor=code-insiders` when targeting those editors. Do not publish to a marketplace or create a Git tag as part of a local installation.
