# Privacy And Safety

DeskPet M0/M1 is a local desktop companion shell. It provides reminders and a manual focus timer.

## What DeskPet Stores

DeskPet stores local settings and simple daily counters through `electron-store`:

- language
- selected pet appearance
- reminder toggles and intervals
- manual focus duration
- today's rest, water, and focus minutes
- pet window position

This data is local to the user's Windows profile.

## What DeskPet Does Not Do

DeskPet M0/M1 does not include active behavior for:

- reading the foreground app
- reading window titles
- scanning processes for focus state
- taking screenshots
- OCR
- keyboard or mouse input hooks
- process injection
- privilege escalation
- telemetry
- analytics
- hidden network calls
- default auto-start
- auto-update
- hidden background services

## Manual Focus Boundary

Manual focus is only a timer:

1. The user starts the timer from the tray, pet menu, or settings window.
2. The pet switches to the focus companion state.
3. The app counts down locally.
4. The timer completes or the user stops it.

The app does not inspect which app the user opens while the timer is running.

## Packaging Boundary

The preferred Windows distribution is zip/portable.

NSIS installer output is secondary only. It must not be treated as the default green build, and it must not enable auto-start, auto-update, elevation, or hidden background service behavior.

## Remaining Risks

- Unsigned Windows binaries can still trigger SmartScreen or antivirus warnings.
- `electron-store` writes local settings to the user's profile, so this is not a no-trace portable app.
- PawPal-bundled pet assets have separate license risk and should be replaced or cleared before public distribution.
