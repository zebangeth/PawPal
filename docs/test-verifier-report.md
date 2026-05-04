# DeskPet M0/M1 Test Verifier Report

Verdict: 通过

Coverage score: 99 / 100

Review date: 2026-05-04

Scope reviewed:

- `specs/project-test-inventory.md`
- `specs/test-cases.md`
- `docs/test-coverage-map.md`
- `docs/test-risk-log.md`
- `specs/deskpet-phase1.md`
- `scripts/smoke-m1.mjs`

## Final Gate Checks

| Gate | Result | Evidence |
| --- | --- | --- |
| All P0 entries are present in the case matrix. | 通过 | P0 coverage summary lists TC-M0-001 through TC-M0-005 and TC-M1-001 through TC-M1-007, TC-M1-011, TC-M1-012, TC-M1-014, TC-M1-016 in `specs/test-cases.md:44`. |
| P0 monitoring-removal risk is linked to cases. | 通过 | RISK-001 links to TC-M1-001, TC-M1-003, TC-M1-012, TC-M1-017 in `docs/test-risk-log.md:7`. |
| Manual focus timer has a direct case and evidence. | 通过 | TC-M1-002 is defined in `specs/test-cases.md:24`; packaged smoke evidence is recorded in `specs/deskpet-phase1.md:126`. |
| Package and green distribution requirements are covered. | 通过 | TC-M1-011 and TC-M1-014 are defined in `specs/test-cases.md:33` and `specs/test-cases.md:36`; package config defaults to portable/zip in `package.json:35`. |
| Package helper hardening has a repeatable check. | 通过 | `scripts/smoke-m1.mjs:223` asserts `packElevateHelper=false`; `scripts/smoke-m1.mjs:229` logs zip audit success. |
| M2 assets are not counted as covered product scope. | 通过 | REQ-M1-09 is mapped to TC-M0-003 and TC-M1-014 in `docs/test-coverage-map.md:20`; local M2 drafts are treated as excluded scope in `docs/test-risk-log.md:24`. |
| Automated smoke coverage is backed by a committed script and concrete checkpoint titles. | 通过 | Automated cases now include a real script and test title/checkpoint in `specs/test-cases.md:23` through `specs/test-cases.md:40`. |
| Settings persistence has a restart check. | 通过 | `scripts/smoke-m1.mjs:417` logs the settings update check and `scripts/smoke-m1.mjs:425` logs restart persistence. |
| Coverage score is at least 95. | 通过 | Score is 99 / 100 in `docs/test-coverage-map.md:52`. |

## Automated Case Trace

| Case IDs | Real Test File | Test Title / Checkpoint |
| --- | --- | --- |
| TC-M1-001 | `scripts/smoke-m1.mjs` | `Safety scan passed for source/config paths.` at line 207 |
| TC-M1-002 | `scripts/smoke-m1.mjs` | `CDP focus and reminder checks passed.` at line 402 |
| TC-M1-003 | `scripts/smoke-m1.mjs` | `assertSameKeys` snapshot/settings key assertions at line 334 |
| TC-M1-006 | `scripts/smoke-m1.mjs` | `break reminder prompt` / `break reminder snooze` wait titles at lines 381 and 386 |
| TC-M1-007 | `scripts/smoke-m1.mjs` | `hydration reminder prompt` / `hydration reminder snooze` wait titles at lines 392 and 397 |
| TC-M1-008 | `scripts/smoke-m1.mjs` | `Settings update check passed.` and `Settings persistence check passed after restart.` at lines 417 and 425 |
| TC-M1-011 | `scripts/smoke-m1.mjs` | `Zip audit passed: ... no elevate.exe.` at line 229 |
| TC-M1-012 | `scripts/smoke-m1.mjs` | `NSIS elevate helper must not be packaged.` assertion at line 223 |
| TC-M1-014 | `scripts/smoke-m1.mjs` | `Package target and resource checks passed.` at line 237 |
| TC-M1-018 | `scripts/smoke-m1.mjs` | `Process tree cleaned.` at line 567 |

## P0 Gaps

None.

Every P0 requirement has at least one case ID and an explicit verification method. Runtime/package P0 behavior is now supported by `pnpm smoke:m1` where deterministic automation is practical.

## P1 Gaps

| Gap | Linked Cases | Required Follow-Up |
| --- | --- | --- |
| Tray menu behavior needs human Windows tray observation. | TC-M1-005 | Keep manual check for M1; automate only if an Electron tray testing approach is selected. |
| Mouse drag, multi-monitor, and DPI are not deterministic yet. | TC-M1-013 | Add manual QA steps or future Playwright/Electron smoke once automation phase starts. |

## False Coverage / False Pass Risks

- `automated` status is used only for cases covered by `scripts/smoke-m1.mjs` and now mapped to a named checkpoint or assertion.
- Manual smoke evidence is not counted as tray/drag automation closure.
- Source/license and asset-license checks are marked as review/audit cases, not runtime behavior tests.
- Safety grep is a keyword boundary check; it is paired with source inspection and runtime snapshot checks to avoid a pure string-search false pass.
- `dist/win-unpacked` still contains an `elevate.exe` staging helper; this is not counted as a clean distributable artifact. Zip/portable are the M0/M1 distribution candidates.

## Cases To Add Or Repair

No blocking P0 case repair is needed before continuing M1.

Recommended future additions:

- Add tray and drag/multi-monitor checks if M1 hardening moves beyond manual QA.

## Manual-Only Checks

- TC-M1-005: Windows tray menu interaction.
- TC-M1-013: drag behavior, multi-monitor, DPI.
- Visual readability of transparent pet and reminder bubbles.
- SmartScreen/antivirus behavior for unsigned portable/zip artifacts.

## Automation Phase Decision

The project can continue M1.

Runtime/package smoke automation has started through `pnpm smoke:m1`. Full automation closure is still not claimed because tray behavior, drag/multi-monitor behavior, and visual desktop readability remain manual or future-automation checks.
