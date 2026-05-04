# DeskPet M0/M1 Test Risk Log

## Active Risks

| Risk ID | Priority | Risk | Impact | Linked Cases | Current Mitigation | Status |
| --- | --- | --- | --- | --- | --- | --- |
| RISK-001 | P0 | Automatic monitoring code could re-enter through stale source, staged files, dependency, or package config. | Violates M1 safety boundary. | TC-M1-001, TC-M1-003, TC-M1-012, TC-M1-017 | Removed `src/main/distraction.ts`; removed settings/types/UI fields; `pnpm smoke:m1` scans source/config; staged safety grep remains required before commits. | Controlled |
| RISK-002 | P0 | Manual focus could silently depend on foreground app/window/process state. | Privacy and product contract breach. | TC-M1-002, TC-M1-003 | `pnpm smoke:m1` confirms focus timer state only; snapshot has no monitoring fields. | Controlled |
| RISK-003 | P0 | Windows package could default to installer behavior, auto-start, update, elevation, or hidden service. | Fails green package requirement. | TC-M1-011, TC-M1-012 | Default Windows targets are portable/zip; NSIS is explicit secondary command with `allowElevation=false`, `perMachine=false`, `packElevateHelper=false`, no update/startup config; smoke checks zip/portable for `elevate.exe`. | Controlled |
| RISK-004 | P0 | M2/private assets could accidentally enter M0/M1 Git scope or package output. | Scope creep and possible privacy/licensing issue. | TC-M0-003, TC-M1-014 | `.gitignore` excludes local M2/private paths; package filters exclude M2 folders; `pnpm smoke:m1` checks packaged resources. | Controlled |
| RISK-005 | P0 | PawPal bundled GIF assets may not be redistributable. | Blocks public release. | TC-M0-003 | `ASSET_LICENSE.md` and source audit document risk; M0/M1 treats assets as validation placeholders only. | Open release blocker |
| RISK-006 | P1 | `dist/win-unpacked` staging still includes unused `resources/elevate.exe`. | Publishing the unpacked staging directory as a green package could fail strict review. | TC-M1-012 | `packElevateHelper=false`; smoke asserts zip has 0 `elevate.exe` entries and portable has no `elevate.exe` marker; staging helper SHA256 is documented for review. | Controlled with distribution constraint |
| RISK-007 | P1 | Tray click behavior is hard to prove without human desktop observation. | A tray regression could pass command-only checks. | TC-M1-005 | Source path reviewed; Windows manual check remains required. | Manual-only |
| RISK-008 | P1 | Drag, multi-monitor, and DPI behavior are not covered by committed tests. | Pet may position poorly on some desktops. | TC-M1-013 | Existing clamp/drag paths remain; manual Windows check required. | Manual-only |
| RISK-009 | P1 | Settings persistence could regress across packaged restarts. | Invalid or stale stored settings could affect launch behavior. | TC-M1-008 | `pnpm smoke:m1` writes settings through IPC, restarts with the same isolated userData, and verifies persisted settings plus no focus/blocking auto-resume. | Controlled |
| RISK-010 | P1 | Release workflow uploads `dist/*.exe`; stale local installer artifacts could be included if `dist` is dirty. | Accidental installer distribution. | TC-M1-015 | Workflow uses `pnpm dist:win`, default target currently portable `.exe`; clean `dist` before release remains required. | Controlled with process note |

## Risk Decisions

- No current P0 gap blocks continuing M1.
- Public distribution remains blocked by RISK-005 until assets are replaced or licensed.
- Package helper risk is controlled for the default zip/portable artifacts; do not publish `dist/win-unpacked` directly without re-review.
- Deterministic smoke coverage now exists for TC-M1-001, TC-M1-002, TC-M1-003, TC-M1-006, TC-M1-007, TC-M1-008, TC-M1-011, TC-M1-012, TC-M1-014, and TC-M1-018 through `pnpm smoke:m1`.
- M2 local drafts are intentionally excluded from Git and package output during M0/M1; they are not counted as covered product functionality.
