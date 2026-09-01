# Plasan — Signature Management | Company Landscape deck

Prototype phase: 3 slides (screening funnel, 9-company executive overview,
CBG Systems company profile) as a self-contained HTML deck exportable to PDF.

## Files

| Path | Purpose |
|---|---|
| `deck.html` | Self-contained deck (embedded font) — open in a browser; scales to the window |
| `deck_template.html` | Editable source; `@@FONT_B64@@` token is inlined by `build.py` |
| `build.py` | Regenerates `deck.html` from the template |
| `deck.pdf` | PDF export — one 1920×1080 page per slide |
| `screenshots/slide-N.png` | Rendered 1920×1080 screenshots of each slide |
| `assets/source_mapping.json` | Source mapping for external data/imagery and fonts |
| `assets/fonts/inter-latin.woff2` | Inter variable font (latin subset, weights 400–800, OFL) |
| `qa/render.js` | Playwright render + automated QA (overflow, clipping, font sizes, footer collisions) + PDF export |
| `qa/measure.js` | Table row-height measurement helper |
| `DESIGN_SYSTEM.md` | Design tokens and layout rules derived from the BDO reference deck |

## Rebuild & QA

```bash
python3 build.py          # template -> deck.html
node qa/render.js         # screenshots + automated checks + deck.pdf
```

Playwright uses the pre-installed Chromium at `/opt/pw-browsers/chromium`.
`deck.html?flat=1` disables browser scaling (used by automation).

## Data rules honored

- The 9-company Excel workbook is the single source of truth; the company-map
  workbook is used only for the screening-funnel universe (37 companies).
- Revenue appears only as reported (Permali) or explicitly qualified
  third-party estimates; no research-process labels appear on slides.
- Radar/RCS claims are qualified where not independently substantiated;
  RF/EMI shielding is never presented as RCS reduction.
- Official CBG product imagery could not be downloaded in this build
  environment (network egress blocked); the profile slide carries labeled
  slots citing the exact official source pages instead of substitute imagery.
