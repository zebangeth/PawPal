# PawPal Source Audit

## Import Point

- Source repo: `https://github.com/zebangeth/PawPal`
- Imported tag: `v0.1.3`
- Imported commit: `7cb44da708f2488d9587140554c486173145907a`
- Verification command: `git rev-list -n 1 v0.1.3`
- Verified result: `7cb44da708f2488d9587140554c486173145907a`

## Source License

The imported application source is under the MIT License.

- Local license file: `LICENSE`
- Copyright line: `Copyright (c) 2026 PawPal contributors`
- DeskPet M0/M1 keeps this attribution.

## Asset License Boundary

PawPal's source license does not automatically cover all bundled animation assets.

- Local asset notice: `ASSET_LICENSE.md`
- Runtime asset folders imported from PawPal:
  - `pet_assets/线条小狗/`
  - `pet_assets/金毛 puppy/`
- Risk: original asset source and redistribution rights are not fully proven inside this repo.
- M0/M1 decision: keep assets only as inherited validation/runtime placeholders; do not treat them as DeskPet product identity.
- Distribution warning: before giving a public build to others, replace or clear-license the bundled assets.

## M0/M1 Base Decision

PawPal remains viable for M0/M1 if the app installs, runs, packages as portable/zip, and the monitoring cleanup stays isolated from reminders and manual focus timing.

No hard fallback has been triggered by source license or initial dependency inspection. Asset licensing remains a release risk, not a code-base hard fallback for this local validation pass.
