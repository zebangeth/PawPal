# DeskPet M0/M1 Test Coverage Map

Coverage scope: M0 Base Validation and M1 Safety-Clean App Shell.

## Requirement Coverage

| Requirement | Priority | Covered By | Coverage Status | Evidence |
| --- | --- | --- | --- | --- |
| REQ-M0-01 PawPal source must match `v0.1.3` / `7cb44da708f2488d9587140554c486173145907a`. | P0 | TC-M0-001 | Covered | `git rev-list -n 1 v0.1.3`; `docs/pawpal-source-audit.md`. |
| REQ-M0-02 MIT source license and asset license risk must be recorded. | P0 | TC-M0-002, TC-M0-003 | Covered | `LICENSE`, `ASSET_LICENSE.md`, `docs/pawpal-source-audit.md`, `docs/asset-guide.md`. |
| REQ-M0-03 Dependencies and install scripts must be audited. | P0 | TC-M0-004, TC-M0-005 | Covered | `pnpm install --frozen-lockfile`, `pnpm ignored-builds`, `pnpm audit --json`, `docs/dependency-audit.md`. |
| REQ-M1-01 Automatic focus/distraction detection must be removed or hard-disabled. | P0 | TC-M1-001, TC-M1-003 | Covered | `pnpm smoke:m1`, `rg`, and `git grep --cached` have no active sensitive API matches; `src/main/distraction.ts` is absent. |
| REQ-M1-02 Manual focus must run only as a timer. | P0 | TC-M1-002, TC-M1-003 | Covered | `startFocusMode` / `stopFocusMode` use `setTimeout`, `focusEndsAt`, and focus stats only; `pnpm smoke:m1` confirms snapshot shape. |
| REQ-M1-03 Transparent always-on-top pet window must launch on Windows. | P0 | TC-M1-004 | Covered | Dev and packaged smoke observed `DeskPet 220x340 TopMost=True`. |
| REQ-M1-04 Tray menu must be available. | P0 | TC-M1-005 | Covered with manual requirement | Source path exists in `createTray`; full notification-area interaction remains manual-only. |
| REQ-M1-05 Rest and hydration reminders must remain usable. | P0 | TC-M1-006, TC-M1-007 | Covered | `pnpm smoke:m1` confirms break/hydration states and snooze return path. |
| REQ-M1-06 Windows package must prefer portable/zip; NSIS secondary only. | P0 | TC-M1-011, TC-M1-012 | Covered | `package.json` default Windows targets are `portable` and `zip`; `dist:win:installer` is explicit; `pnpm smoke:m1` checks artifacts and zip `elevate.exe` absence. |
| REQ-M1-07 No default auto-start/update/elevation/hidden service/telemetry/input/screenshot/OCR/foreground monitoring path. | P0 | TC-M1-001, TC-M1-012, TC-M1-017 | Covered | Safety grep, dependency audit, `allowElevation=false`, `packElevateHelper=false`, and mac entitlement cleanup. |
| REQ-M1-08 M0/M1 feature spec must record flows, failures, verification, and risk. | P0 | TC-M1-016 | Covered | `specs/deskpet-phase1.md`. |
| REQ-M1-09 M2 assets must not be integrated. | P0 | TC-M0-003, TC-M1-014 | Covered | `.gitignore`, package `extraResources` filters, and `pnpm smoke:m1` resource listing with no M2 dirs. |

## Entry Coverage

| Entry ID | Case IDs | Status |
| --- | --- | --- |
| ENTRY-CLI-01 | TC-M0-004 | Covered |
| ENTRY-CLI-02 | TC-M0-005 | Covered |
| ENTRY-CLI-03 | TC-M1-011 | Covered by `pnpm smoke:m1` after build |
| ENTRY-CLI-04 | TC-M1-001 | Covered by `pnpm smoke:m1` |
| ENTRY-WIN-01 | TC-M1-004 | Covered |
| ENTRY-WIN-02 | TC-M1-002, TC-M1-006, TC-M1-007 | Covered by `pnpm smoke:m1` |
| ENTRY-UI-01 | TC-M1-013 | Manual-only |
| ENTRY-UI-02 | TC-M1-004, TC-M1-008 | Settings persistence covered by `pnpm smoke:m1`; visual settings control interaction remains manual |
| ENTRY-STATE-01 | TC-M1-006 | Covered by `pnpm smoke:m1` |
| ENTRY-STATE-02 | TC-M1-007 | Covered by `pnpm smoke:m1` |
| ENTRY-STATE-03 | TC-M1-002 | Covered by `pnpm smoke:m1` |
| ENTRY-STATE-04 | TC-M1-003, TC-M1-008 | Covered by snapshot/type review and `pnpm smoke:m1` restart persistence check |
| ENTRY-PKG-01 | TC-M1-011 | Covered by `pnpm smoke:m1` after build |
| ENTRY-PKG-02 | TC-M1-011 | Covered by `pnpm smoke:m1` after build |
| ENTRY-PKG-03 | TC-M1-012 | Covered by smoke package assertions plus config review; installer artifact not built in M0/M1 |
| ENTRY-DOC-01 | TC-M0-001, TC-M0-002, TC-M0-003 | Covered |
| ENTRY-DOC-02 | TC-M1-016 | Covered |

## Coverage Score

Scoring method:

- P0 requirement covered: 78 points possible, 78 earned.
- P1 important edge/manual-risk coverage: 22 points possible, 21 earned.
- Deducted 1 point for manual-only tray and drag/multi-monitor checks.

Coverage score: 99 / 100.

Automated cases marked in `specs/test-cases.md` include both a real test file and a named checkpoint/assertion title. Manual, future-automation, and audit-only cases are not counted as automated closure.

The project can continue M1 implementation. It should not claim full automation closure until tray and drag/multi-monitor checks are covered or explicitly accepted as manual-only release checks.
