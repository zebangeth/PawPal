# DeskPet Asset Guide

M0/M1 does not integrate custom DeskPet assets. This file is kept as a minimal runtime asset note so the imported PawPal shell remains understandable without implying full Phase 1 or M2 completion.

## Current Runtime Assets

The imported PawPal assets remain available only for base validation:

- `pet_assets/线条小狗/`
- `pet_assets/金毛 puppy/`

These assets are not DeskPet's final product identity. Their redistribution rights are not fully proven in this repo, so they should be replaced or separately cleared before public distribution.

## States Used In M0/M1

Active reminder and shell states:

- `idle`
- `sitting`
- `happy`
- `breakPrompt`
- `breakRunning`
- `breakDone`
- `hydrationPrompt`
- `drinking`
- `hydrationDone`
- `focusGuard`
- `focusDone`
- `sad`
- `sleeping`

The old PawPal `focusAlert` warning state is not part of M0/M1 runtime state and is excluded from default package resources.

## M2 Boundary

Do not treat any `main_pixel_avatar` or `paired_pixel_avatar` folder as integrated in M0/M1. Those folders are ignored and excluded from package resources until the M2 asset system is explicitly implemented.
