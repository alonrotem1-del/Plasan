# Design system — derived from the BDO Strategy reference deck

Adapted for an LTR English deck; nothing is copied literally.

## Color tokens

| Token | Value | Derivation / use |
|---|---|---|
| `--c-primary` | `#014C67` | BDO theme accent5 (petrol) — structural color: titles, section bars, table header bars, key numbers, filled chips |
| `--c-slate` | `#46586A` | Dark slate-blue of BDO comparison-table header rows |
| `--c-slate-mid` | `#657C91` | BDO theme lt2 — kickers, secondary labels, page numbers |
| `--c-red` | `#ED1A3B` | BDO red (accent3) — brand accent ONLY (lockup rule + descriptor); never structural |
| `--c-burgundy` | `#98002E` | BDO dk2 — reserved for future categorical needs |
| `--c-amber` | `#D49802` | BDO accent2 — qualification accent (Development/Trials status) |
| `--c-fill` | `#EDF0F2` | Light gray cell/tile fill (BDO body cells) |
| `--c-text` / muted / faint | `#1A2530` / `#5A6B7A` / `#8595A3` | Text hierarchy |
| hairlines | `#DDE2E6` | Thin rules, column separators, footer rule |

## Typography

- Family: **Inter** (variable 400–800, latin subset, embedded base64) — closest
  freely-licensed grotesque to the reference deck's Almoni Neue.
- Slide title 44px/700 petrol (max 2 lines); kicker 17px/600 letterspaced
  uppercase slate; body 20–24px; table 21–22px; qualifiers 18px muted;
  hero numbers 96px/700 petrol; footer/source 16px faint.
- Tabular numerals in numeric table cells.

## Layout grid

- Canvas 1920×1080, side margins 72px (content width 1776px), top margin 56px.
- Header: kicker + action title top-left; PLASAN lockup (wordmark | red rule |
  two-line red/gray descriptor) top-right — mirrors the BDO logo lockup.
- Footer: full-width hairline; small gray page-number tab bottom-left (BDO
  pattern), project label next to it, quiet right-aligned source line.
- Tables: colored header bars (slate for data tables, petrol for profile
  snapshot bars), light-gray body cells separated by 2px white gutters —
  the BDO table pattern. Header case is a deliberate marker: sentence case
  on slate data-table headers; letterspaced caps on petrol profile fact
  strips (repeat exactly on every profile slide).
- Section bars on profile slides: petrol uppercase label over a 2px petrol
  rule (adapted from BDO's petrol section-header bars).
- Chips: 3px radius, tinted petrol fills or thin outlines; status semantics —
  filled petrol = Fielded/Commercial, outline = Commercial, amber outline =
  Development/Trials, gray = Prototype/historical.

## Whitespace philosophy

Calm, high-whitespace, restrained color: petrol carries structure, red only
brands, one accent (amber) for qualification. No gradients, no shadows on
canvas elements, no decorative icons, no stripes/accent bars.
