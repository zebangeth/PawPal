# DeskPet Phase 1 Feature Spec

This spec currently covers M0/M1 only. M2 asset integration and full Phase 1 are intentionally out of scope.

## Affected Entry Points

- `pnpm install --frozen-lockfile`
- `pnpm dev`
- `pnpm typecheck`
- `pnpm build`
- `pnpm dist:win`
- `pnpm smoke:m1`
- Electron main process: `src/main/main.ts`
- Renderer settings view: `src/renderer/src/components/SettingsView.tsx`
- Renderer pet view: `src/renderer/src/components/PetView.tsx`
- Shared settings/state types: `src/shared/types.ts`, `src/shared/constants.ts`, `src/shared/i18n.ts`
- Packaging config: `package.json`

## Main User Flows

### First Launch

1. User starts the app.
2. Transparent always-on-top pet window appears.
3. Tray menu is available.
4. Settings opens from tray or pet context menu.
5. Quit exits from tray.

Expected: no crash, pet remains visible, settings and tray respond.

### Reminder Flow

1. User enables rest or hydration reminders.
2. Timer reaches due time, or developer triggers demo reminder in dev mode.
3. Pet state changes and a speech bubble appears.
4. User dismisses or snoozes.

Expected: state returns to idle or focus companion state without requiring monitoring.

### Manual Focus Flow

1. User starts focus from tray, pet menu, or settings.
2. Pet enters `focusGuard`.
3. Timer counts down using configured duration.
4. User stops early or waits for completion.

Expected: pet enters completion state and focus minutes update. No foreground app/window/process information is read.

### Packaging Flow

1. Developer runs `pnpm dist:win`.
2. Build produces Windows distributable artifacts.
3. Preferred artifact is zip or portable.
4. NSIS remains secondary.

Expected: artifact exists under `dist/`; no default auto-start, auto-update, elevation, or hidden service behavior is configured.

## Important Failure Flows

- Missing preload: renderer shows a preload diagnostic instead of crashing.
- Invalid saved pet position: main process clamps the pet window into the current display work area.
- Missing optional pet asset: renderer falls back through the existing manifest fallback path.
- Reminder disabled: no reminder timer is scheduled for that reminder type.
- Focus timer stopped: timer clears and state returns to idle.

## Input And Config Boundaries

- Reminder intervals:
  - break: 1 to 180 minutes in settings UI
  - hydration: 1 to 240 minutes in settings UI
- manual focus duration: 1 to 120 minutes in settings UI
- local settings are normalized against defaults on read
- pet position persists as `{ x, y }` and is clamped on launch

## Expected Outputs

- Pet window renders transparent, frameless, always-on-top.
- Tray menu contains show/hide, manual focus start/stop, settings, and quit.
- Settings contains reminders, manual focus duration, appearance, diagnostics, and dev demo controls.
- No settings entry exposes automatic focus/distraction detection.
- `dist` contains Windows zip/portable output after packaging.

## Automated Checks

Required for M0/M1:

- `pnpm install --frozen-lockfile`
- `pnpm audit --json`
- `pnpm typecheck`
- `pnpm build`
- `pnpm dist:win`
- `pnpm smoke:m1`
- safety-boundary `rg` searches over source and config
- safety-boundary `git grep --cached` searches over the staged source and config
- artifact existence check under `dist`

## Manual-Only Checks

- Pet transparency on the real Windows desktop.
- Pet always-on-top behavior over normal windows.
- Tray click behavior in Windows notification area.
- Drag behavior with mouse.
- Settings window open/save behavior.
- Short manual focus timer visual behavior.
- Rest/hydration bubble readability.
- Launching from packaged artifact.

## Suggested Automated Scenarios

- Tray notification-area interaction.
- Drag behavior across multi-monitor and DPI setups.

## Verification Evidence

Run date: 2026-05-04 on Windows.

- `git init` and `git checkout -b feat/deskpet-phase1`: repository initialized on the feature branch.
- `git rev-list -n 1 v0.1.3`: `7cb44da708f2488d9587140554c486173145907a`.
- `pnpm install --frozen-lockfile`: completed with lockfile up to date; install scripts ran only for Electron/esbuild, and pnpm ignored `electron-winstaller`.
- `pnpm audit --json`: `low=0`, `moderate=0`, `high=0`, `critical=0`, `dependencies=431`.
- `pnpm typecheck`: `tsc --noEmit` completed with exit code 0.
- `pnpm dist:win`: completed with exit code 0 after running `pnpm build`; produced `DeskPet 0.1.0-m1.exe` and `DeskPet-0.1.0-m1-win.zip`.
- Artifact check: `DeskPet 0.1.0-m1.exe` = 100,014,618 bytes; `DeskPet-0.1.0-m1-win.zip` = 149,429,207 bytes.
- Dev run smoke: `pnpm dev` launched Electron; observed visible windows `DeskPet 220x340 TopMost=True` and `DeskPet 760x680 TopMost=False`; renderer dev server used `http://localhost:5189/`; process tree was cleaned with remaining count 0.
- Packaged run smoke: `dist/win-unpacked/DeskPet.exe --remote-debugging-port=9251` launched; observed visible window `DeskPet 220x340 TopMost=True`; process tree was cleaned with remaining count 0.
- Manual focus smoke through packaged CDP: snapshot changed from `focusActive=false` to `focusActive=true`, `petState=focusGuard`, `timers.focusEndsAt` numeric, then back to `focusActive=false`; snapshot keys were only `blockingMode`, `dogVisible`, `focusActive`, `petFacing`, `petState`, `settings`, `stats`, `statsHistory`, and `timers`.
- Reminder smoke through packaged CDP: break demo produced `blockingMode=break`, `petState=breakPrompt`; hydration demo produced `blockingMode=hydration`, `petState=hydrationPrompt`; after snooze, `blockingMode=null`.
- Safety searches: both `rg` over the working source/config and `git grep --cached` over staged source/config returned no matches for active monitoring/update/startup APIs such as `readActiveWindow`, `classifyDistraction`, `distractionDetection`, `focusWarning`, `desktopCapturer`, `capturePage`, `globalShortcut`, `setLoginItemSettings`, `autoUpdater`, `electron-updater`, `auto-launch`, `telemetry`, and known hook/OCR/window-monitor packages.
- Package resource check: `dist/win-unpacked/resources/pet_assets` contains only `线条小狗` and `金毛 puppy`; no `focusAlert`, `main_pixel_avatar`, or `paired_pixel_avatar` directories are present.
- `pnpm smoke:m1`: completed with exit code 0; output confirmed source/config safety scan passed, unpacked app was 210,890,752 bytes, portable artifact was 100,014,618 bytes, zip artifact was 149,429,207 bytes, zip audit found `143` entries, `1` executable entry, and no `elevate.exe`, packaged artifact/resource checks passed, packaged pet window was `220x340 TopMost=true`, CDP focus/reminder checks passed, settings persisted after packaged restart with isolated userData, process tree cleaned, and M1 smoke passed.
- Package helper audit: `package.json` sets `nsis.packElevateHelper=false`; portable artifact contains no ASCII `elevate.exe` marker; zip artifact has 0 `elevate.exe` entries. `dist/win-unpacked/resources/elevate.exe` remains present as a staging helper, size 107,520 bytes, SHA256 `9B1FBF0C11C520AE714AF8AA9AF12CFD48503EEDECD7398D8992EE94D1B4DC37`.

## Known Untested Risks

- SmartScreen/antivirus behavior for unsigned binaries.
- Multi-monitor and DPI edge cases beyond primary display clamp.
- Actual visual transparency and tray behavior require desktop runtime observation.
- PawPal inherited runtime assets still need redistribution clearance.
- `electron-store` local profile writes mean the app is local-first, not no-trace portable.
- `dist/win-unpacked` still includes an unused `resources/elevate.exe` staging helper; default zip/portable artifacts are checked clean, but the unpacked staging directory should not be published directly without re-review.
- Local M2 asset exploration files are excluded from this M0/M1 Git scope and package output.
