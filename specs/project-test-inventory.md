# DeskPet M0/M1 Project Test Inventory

Scope: M0 Base Validation and M1 Safety-Clean App Shell only. M2 asset integration and full Phase 1 are out of scope.

## Source Requirements

| ID | Source | Requirement |
| --- | --- | --- |
| REQ-M0-01 | `.omx/plans/adr-base-selection-deskpet-phase1.md`, `docs/pawpal-source-audit.md` | PawPal base must be imported from `v0.1.3` / `7cb44da708f2488d9587140554c486173145907a`, with MIT source license and asset license risk recorded. |
| REQ-M0-02 | `package.json`, `pnpm-lock.yaml`, `docs/dependency-audit.md` | Dependencies and install scripts must be audited before trusting the base. |
| REQ-M0-03 | `package.json` | Windows build must prefer portable/zip artifacts. NSIS can exist only as explicit secondary packaging. |
| REQ-M1-01 | `src/main/main.ts`, `src/shared/types.ts`, `src/shared/constants.ts` | Automatic focus/distraction detection must be removed or hard-disabled. |
| REQ-M1-02 | `src/main/main.ts`, `src/preload/index.ts`, `src/renderer/src/components/SettingsView.tsx` | Manual focus must behave only as a user-started timer. |
| REQ-M1-03 | `src/main/main.ts`, `src/renderer/src/components/PetView.tsx` | Transparent always-on-top pet window must launch on Windows. |
| REQ-M1-04 | `src/main/main.ts`, `src/main/trayIcon.ts` | Tray menu must expose show/hide, manual focus, settings, and quit. |
| REQ-M1-05 | `src/main/main.ts`, `src/renderer/src/components/SettingsView.tsx` | Rest and hydration reminder states must remain usable after safety cleanup. |
| REQ-M1-06 | `package.json`, `build/entitlements.mac.plist`, `.github/workflows/release.yml` | No default auto-start, auto-update, elevation, hidden service, telemetry, input hook, screenshot/OCR, or foreground app/window/process monitoring path may remain. |
| REQ-M1-07 | `specs/deskpet-phase1.md` | M0/M1 entry points, flows, failure paths, verification, and known risks must be documented. |

## Product Entry Inventory

| Entry ID | Entry | Source | Priority | Observed Evidence |
| --- | --- | --- | --- | --- |
| ENTRY-CLI-01 | Install dependencies | `package.json`, `pnpm-lock.yaml` | P0 | `pnpm install --frozen-lockfile` passed; `electron-winstaller` build script ignored. |
| ENTRY-CLI-02 | Audit dependency advisories | `pnpm-lock.yaml` | P0 | `pnpm audit --json` reported 0 vulnerabilities across 431 dependencies. |
| ENTRY-CLI-03 | Type/build/smoke check | `package.json` scripts | P0 | `pnpm typecheck`, `pnpm dist:win`, and `pnpm smoke:m1` are the M1 verification commands. |
| ENTRY-CLI-04 | Safety grep over source/config | `src`, `package.json`, `build`, `.github`, `scripts/smoke-m1.mjs` | P0 | `pnpm smoke:m1` scans source/config; `rg` and `git grep --cached` remain staged review checks. |
| ENTRY-WIN-01 | Dev runtime launch | `pnpm dev`, `src/main/main.ts` | P0 | Dev smoke observed pet window `220x340 TopMost=True` and settings window `760x680 TopMost=False`. |
| ENTRY-WIN-02 | Packaged runtime launch | `dist/win-unpacked/DeskPet.exe`, `scripts/smoke-m1.mjs` | P0 | `pnpm smoke:m1` launches the packaged app and checks pet window `220x340 TopMost=True`. |
| ENTRY-UI-01 | Pet click/context menu/drag surface | `src/renderer/src/components/PetView.tsx`, `src/main/main.ts` | P1 | Context menu and drag IPC paths exist; drag is manual-only. Full mouse drag remains manual-only. |
| ENTRY-UI-02 | Settings view | `src/renderer/src/components/SettingsView.tsx` | P0 | Dev smoke observed settings window; settings controls map to `settings:update`. |
| ENTRY-STATE-01 | Rest reminder | `triggerBreakReminder`, `handleBubbleAction` in `src/main/main.ts`, `scripts/smoke-m1.mjs` | P0 | `pnpm smoke:m1` produces `blockingMode=break`, `petState=breakPrompt`, then snooze returns to `null`. |
| ENTRY-STATE-02 | Hydration reminder | `triggerHydrationReminder`, `handleBubbleAction` in `src/main/main.ts`, `scripts/smoke-m1.mjs` | P0 | `pnpm smoke:m1` produces `blockingMode=hydration`, `petState=hydrationPrompt`, then snooze returns to `null`. |
| ENTRY-STATE-03 | Manual focus timer | `startFocusMode`, `stopFocusMode` in `src/main/main.ts`, `scripts/smoke-m1.mjs` | P0 | `pnpm smoke:m1` checks `focusActive=false -> true -> false`, `petState=focusGuard`, with numeric `focusEndsAt`. |
| ENTRY-STATE-04 | Local settings and stats | `electron-store`, `src/shared/constants.ts`, `src/main/main.ts`, `scripts/smoke-m1.mjs` | P1 | Defaults and snapshot shape verified through packaged CDP; `pnpm smoke:m1` verifies settings persistence across packaged restart with isolated userData. |
| ENTRY-PKG-01 | Portable executable | `package.json` build target | P0 | `dist/DeskPet 0.1.0-m1.exe` exists after `pnpm dist:win`; `pnpm smoke:m1` checks it has no `elevate.exe` marker. |
| ENTRY-PKG-02 | Zip package | `package.json` build target | P0 | `dist/DeskPet-0.1.0-m1-win.zip` exists after `pnpm dist:win`; `pnpm smoke:m1` checks 0 `elevate.exe` entries. |
| ENTRY-PKG-03 | NSIS secondary installer | `package.json` `dist:win:installer` | P1 | NSIS is not the default target; `allowElevation=false`, `perMachine=false`, and `packElevateHelper=false`. Installer artifact was not built in M0/M1. |
| ENTRY-DOC-01 | Source and license record | `docs/pawpal-source-audit.md`, `ASSET_LICENSE.md` | P0 | Source repo, tag, SHA, MIT license, and asset risk documented. |
| ENTRY-DOC-02 | M0/M1 feature spec | `specs/deskpet-phase1.md` | P0 | Entry points, flows, failure paths, checks, verification evidence, and risks documented. |

## Existing Test Surface

| Surface | Real File / Command | Current Status | Notes |
| --- | --- | --- | --- |
| TypeScript compile check | `pnpm typecheck` | Existing command, passing | Proves type safety, not runtime behavior. |
| Production build and Windows package | `pnpm dist:win` | Existing command, passing | Produces artifacts and reruns `pnpm build`. |
| M1 packaged smoke | `pnpm smoke:m1` | Committed command | Checks safety scan, artifacts, zip/portable helper absence, resource filters, packaged window, focus timer, reminders, settings persistence after restart, and process cleanup. |
| Dependency audit | `pnpm audit --json` | Existing command, passing | Advisory scan only; not a supply-chain proof. |
| Safety grep | `rg`, `git grep --cached` | Existing command, passing | Keyword-based boundary check; paired with source inspection. |
| Dev runtime smoke | PowerShell process/window probe | Manual smoke, passing | Evidence recorded in `specs/deskpet-phase1.md`; not yet a committed test script. |
| Packaged runtime smoke | `scripts/smoke-m1.mjs` | Committed smoke, passing after build | Evidence recorded in `specs/deskpet-phase1.md`. |

## Product Gaps And Assumptions

| Gap ID | Gap / Assumption | Impact | Linked Cases |
| --- | --- | --- | --- |
| GAP-01 | No full desktop UI/E2E runner exists yet. | Runtime smoke is automated, but tray, visual, drag, and settings persistence checks still need manual QA or future automation. | TC-M1-004, TC-M1-005, TC-M1-008, TC-M1-013 |
| GAP-02 | Tray icon click behavior cannot be fully proven through CDP alone. | Requires Windows desktop observation. | TC-M1-005 |
| GAP-03 | Mouse drag, multi-monitor, and DPI behavior are not covered by deterministic tests. | Visual placement bugs may remain. | TC-M1-013 |
| GAP-04 | PawPal bundled GIF redistribution rights are not fully proven. | Public distribution remains blocked until assets are replaced or cleared. | TC-M0-003, TC-M1-014 |
| GAP-05 | `dist/win-unpacked` staging includes unused `resources/elevate.exe`; default zip/portable artifacts are checked clean. | Do not publish the unpacked staging directory directly without re-review. | TC-M1-012 |
