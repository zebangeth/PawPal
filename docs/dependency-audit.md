# Dependency And Packaging Audit

## Commands Run

```text
pnpm install --frozen-lockfile
pnpm audit --json
rg -n "preinstall|postinstall|install:" package.json pnpm-lock.yaml
rg -n "uiohook|robotjs|active-win|node-window-manager|screenshot|desktop|ocr|ffi|auto-launch|electron-updater|window" node_modules/.pnpm
```

## Install Result

- `pnpm install --frozen-lockfile` completed successfully.
- Lockfile was already up to date.
- Lifecycle scripts actually run by install:
  - `electron postinstall`: `node install.js`
  - `esbuild@0.27.7 postinstall`: `node install.js`
  - `esbuild@0.25.12 postinstall`: `node install.js`
- pnpm ignored `electron-winstaller@5.4.0` build scripts because it is not in `pnpm.onlyBuiltDependencies`.

## Direct Dependencies

Runtime:

- `electron-store` `10.1.0`
- `react` `19.2.5`
- `react-dom` `19.2.5`

Development/build:

- `electron` `39.8.9`
- `electron-builder` `26.8.1`
- `electron-vite` `4.0.1`
- `typescript` `5.9.3`
- `vite` `7.3.2`
- React/Node type packages and Vite React plugin

## Script Audit

`package.json` has no `preinstall`, `install`, or `postinstall` script.

Project scripts are limited to:

- `dev`
- `build`
- `typecheck`
- `dist`
- `dist:mac`
- `dist:win`
- `dist:win:installer`

## Native / Sensitive Dependency Audit

No active phase M0/M1 dependency was found for:

- foreground app or window title reading
- process scanning for focus detection
- screenshot or OCR capture
- keyboard/mouse hooks
- input automation
- telemetry/analytics SDKs
- auto-start helpers
- auto-update packages

Search notes:

- `@electron/windows-sign`, `electron-builder-squirrel-windows`, Rollup Windows binaries, and esbuild Windows binaries are build tooling, not runtime monitoring.
- `electron-winstaller` and `node-gyp` are transitive development/build dependencies through `electron-builder`; they are not production dependencies.
- `http-proxy-agent`, `https-proxy-agent`, and `http2-wrapper` appear in the lockfile through builder/download tooling.
- `electron-store` writes local config under the user data directory; that is local persistence, not a portable no-trace mode.

## Audit Result

`pnpm audit --json` reported:

```json
{
  "low": 0,
  "moderate": 0,
  "high": 0,
  "critical": 0,
  "dependencies": 431
}
```

## Packaging Decision

Windows build targets now prefer green-style artifacts:

- `portable`
- `zip`
- `nsis` only through explicit `pnpm dist:win:installer`

NSIS guardrails in `package.json`:

- `oneClick: false`
- `perMachine: false`
- `allowElevation: false`
- `packElevateHelper: false`
- no default desktop shortcut
- no auto-start config
- no auto-update config

M0/M1 distribution recommendation: use `dist/*.zip` first. Treat NSIS as optional and secondary.

`electron-builder` still places `resources/elevate.exe` in the `dist/win-unpacked` staging directory. Current observed file:

- path: `dist/win-unpacked/resources/elevate.exe`
- size: `107520` bytes
- SHA256: `9B1FBF0C11C520AE714AF8AA9AF12CFD48503EEDECD7398D8992EE94D1B4DC37`

DeskPet does not call it, does not configure update/self-start behavior, and does not require administrator launch in M0/M1 checks. The default distributables are now guarded by repeatable smoke checks:

- `pnpm smoke:m1` asserts `nsis.packElevateHelper=false`.
- `pnpm smoke:m1` asserts the zip artifact has `0` `elevate.exe` entries; latest audit output: `143` entries, `1` executable entry, no `elevate.exe`.
- `pnpm smoke:m1` asserts the portable artifact does not contain the ASCII marker `elevate.exe`.

Do not publish `dist/win-unpacked` itself as a green package without a fresh helper-binary review. Use the zip artifact first, with portable as the secondary green artifact.

The inherited macOS entitlement for Apple Events automation has been removed from `build/entitlements.mac.plist`; Windows M0/M1 does not rely on macOS automation permissions.

## Packaging Blocker Found And Mitigated

Initial `pnpm dist:win` failed while electron-builder tried to extract `winCodeSign-2.6.0.7z`:

```text
ERROR: Cannot create symbolic link ... libcrypto.dylib
ERROR: Cannot create symbolic link ... libssl.dylib
```

This was not an app runtime permission request; it was a build-cache extraction failure on Windows. The default M0/M1 Windows build now sets `win.signAndEditExecutable: false` and defaults to portable/zip targets, avoiding the code-sign/edit tool path for the green package check.
