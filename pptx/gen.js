/* Generate deck.pptx — native, fully editable PowerPoint version of the
 * Plasan Signature Management deck in the BDO identity.
 * All text/tables/shapes are native; only product photos + logo are images.
 * Scale: HTML px -> inches = /144 (1920px = 13.333in); px -> pt = /2.
 * Font: Almoni Neue DL 4.0 AAA (BDO brand font; renders on machines that
 * have it installed — QA renders here substitute, so sizing leaves slack). */
const pptxgen = require('pptxgenjs');
const path = require('path');

const F = 'Almoni Neue DL 4.0 AAA';
const C = {
  petrol: '014C67', petrolTint: 'E6EEF1', slate: '46586A', slateMid: '657C91',
  red: 'ED1A3B', burgundy: '98002E', amberTx: '9A7002', amberBd: 'EAD9A8',
  text: '1A2530', muted: '5A6B7A', faint: '8595A3', fill: 'EDF0F2',
  border: 'C9D0D6', hairline: 'DDE2E6', strip: 'CED2DB', tab: '97A4B2',
};
const IMG = (f) => path.join(__dirname, '..', 'assets', 'images', f);
const DIMS = {
  'ametrine-flint-jltv.jpg': [863, 1013], 'ametrine-gmv-cover.jpg': [334, 271],
  'stg-equipment-shelter.jpg': [1200, 773], 'stg-thermal-view.jpg': [1100, 1037],
  'sterlite-mscn-net.jpg': [800, 624], 'sterlite-paint-application.jpg': [800, 624],
  'amd-chamir-news.jpg': [1200, 675], 'cbg-redback-solarsigmashield.jpg': [1400, 782],
  'cbg-solarsigmashield-vehicle.jpg': [1100, 825], 'ravelin-tacticam-hmmwv.jpg': [1200, 904],
  'ravelin-tacticam-closeup.jpg': [800, 602], 'permali-dust-guards.jpg': [1100, 708],
  'shieldex-metallized-textile.jpg': [1400, 700], 'shieldex-shielding-tent.jpg': [1000, 667],
  'eltics-blackfox-demo.jpg': [396, 263],
};
const W = 13.333, H = 7.5, MX = 0.5, CW = W - 2 * MX;
const FT = 7.097; // footer top
const px = (v) => v / 144;

const P = new pptxgen();
P.layout = 'LAYOUT_WIDE';
P.theme = { headFontFace: F, bodyFontFace: F };

function chrome(s, { kicker, title, pageno, src, twoLine = true }) {
  s.background = { color: 'FFFFFF' };
  s.addShape('rect', { x: 0, y: px(150), w: px(18), h: H - px(150), fill: { color: C.strip } });
  s.addImage({ path: IMG('bdo-logo.png'), x: W - MX - 1.75, y: 0.33, w: 1.75, h: 1.75 * 109 / 443 });
  s.addText(kicker.toUpperCase(), { x: MX, y: 0.30, w: 9.3, h: 0.28, fontFace: F, fontSize: 8.5, bold: true, color: C.slateMid, charSpacing: 3, margin: 0, isTextBox: true });
  s.addText(title, { x: MX, y: 0.58, w: 9.3, h: twoLine ? 1.0 : 0.55, fontFace: F, fontSize: 22, bold: true, color: C.slate, margin: 0, isTextBox: true, valign: 'top', lineSpacingMultiple: 1.15, fit: 'shrink' });
  // footer
  s.addShape('line', { x: 0, y: FT, w: W, h: 0, line: { color: C.hairline, width: 0.75 } });
  s.addShape('rect', { x: 0, y: FT, w: px(58), h: H - FT, fill: { color: C.tab } });
  s.addText(String(pageno), { x: 0, y: FT, w: px(58), h: H - FT, align: 'center', valign: 'middle', fontFace: F, fontSize: 8, bold: true, color: 'FFFFFF', margin: 0, isTextBox: true });
  s.addText('Plasan Sasa — Signature Management | Company Landscape', { x: px(58) + 0.15, y: FT, w: 5.5, h: H - FT, valign: 'middle', fontFace: F, fontSize: 8, color: C.faint, margin: 0, isTextBox: true });
  s.addText(src, { x: 5.2, y: FT, w: W - 5.2 - MX, h: H - FT, align: 'right', valign: 'middle', fontFace: F, fontSize: 8, color: C.faint, margin: 0, isTextBox: true });
}

function secBar(s, label, x, y, w) {
  s.addText(label.toUpperCase(), { x, y, w, h: 0.24, fontFace: F, fontSize: 10, bold: true, color: C.petrol, charSpacing: 2, margin: 0, isTextBox: true });
  s.addShape('line', { x, y: y + 0.27, w, h: 0, line: { color: C.petrol, width: 1.5 } });
}

function chip(s, text, x, y, style) {
  const w = 0.2 + text.length * 0.068;
  const o = { x, y, w, h: 0.28, rectRadius: 0.02, align: 'center', valign: 'middle', fontFace: F, fontSize: 8, bold: true, margin: 0, isTextBox: true, fit: 'shrink' };
  if (style === 'filled') Object.assign(o, { fill: { color: C.petrol }, color: 'FFFFFF' });
  else if (style === 'amber') Object.assign(o, { fill: { color: 'FFFFFF' }, line: { color: C.amberBd, width: 1.25 }, color: C.amberTx });
  else if (style === 'gray') Object.assign(o, { fill: { color: 'FFFFFF' }, line: { color: 'D5DADF', width: 1.25 }, color: C.muted });
  else if (style === 'tint') Object.assign(o, { fill: { color: C.petrolTint }, color: C.petrol });
  else Object.assign(o, { fill: { color: 'FFFFFF' }, line: { color: 'CFDEE4', width: 1.25 }, color: C.petrol });
  s.addText(text, Object.assign({ shape: 'roundRect' }, o));
  return w;
}

/* ============================== 1. COVER ============================== */
{
  const s = P.addSlide();
  s.background = { color: 'FFFFFF' };
  s.addShape('rect', { x: 0, y: px(150), w: px(18), h: H - px(150), fill: { color: C.strip } });
  s.addImage({ path: IMG('bdo-logo.png'), x: MX, y: 0.39, w: 2.6, h: 2.6 * 109 / 443 });
  s.addShape('rect', { x: W - px(20), y: px(230), w: px(20), h: px(160), fill: { color: C.slate } });
  s.addText('PLASAN SASA — STRATEGY', { x: MX, y: 2.24, w: 8, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: C.slateMid, charSpacing: 4, margin: 0, isTextBox: true });
  s.addText('Signature Management &\nMultispectral Camouflage', { x: MX, y: 2.62, w: 10.8, h: 1.7, fontFace: F, fontSize: 43, bold: true, color: C.petrol, margin: 0, isTextBox: true, lineSpacingMultiple: 1.1 });
  s.addText('Company landscape deep dive — nine selected companies', { x: MX, y: 4.42, w: 9, h: 0.4, fontFace: F, fontSize: 16, color: C.muted, margin: 0, isTextBox: true });
  s.addText('September 2026', { x: MX, y: 5.05, w: 4, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: C.faint, margin: 0, isTextBox: true });
  s.addShape('rect', { x: MX, y: FT - px(120), w: px(120), h: px(120), fill: { color: C.burgundy } });
  s.addShape('line', { x: 0, y: FT, w: W, h: 0, line: { color: C.hairline, width: 0.75 } });
  s.addShape('rect', { x: 0, y: FT, w: px(58), h: H - FT, fill: { color: C.tab } });
  s.addText('1', { x: 0, y: FT, w: px(58), h: H - FT, align: 'center', valign: 'middle', fontFace: F, fontSize: 8, bold: true, color: 'FFFFFF', margin: 0, isTextBox: true });
  s.addText('Plasan Sasa — Signature Management | Company Landscape', { x: px(58) + 0.15, y: FT, w: 6, h: H - FT, valign: 'middle', fontFace: F, fontSize: 8, color: C.faint, margin: 0, isTextBox: true });
  s.addText('Internal working document', { x: 8, y: FT, w: W - 8 - MX, h: H - FT, align: 'right', valign: 'middle', fontFace: F, fontSize: 8, color: C.faint, margin: 0, isTextBox: true });
}

/* ============================ 2. FUNNEL ============================ */
{
  const s = P.addSlide();
  chrome(s, { kicker: 'Screening Approach', pageno: 2,
    title: 'Criteria-driven screening surfaced 37 companies, narrowed to 18 in management review and 9 in expert selection',
    src: 'Source: Plasan screening process (project team); Signature Management company map workbook' });
  const stages = [
    ['01', 'Criteria definition', 'Kickoff with Arit and Binny — the precise search criteria for relevant signature-management companies were defined', null, null],
    ['02', 'Market scan & size screen', 'Companies matching the criteria identified for Plasan review; companies above ~US$100M revenue screened out', '37', 'companies identified'],
    ['03', 'Management review', 'Binny reviewed all 37 companies', '18', 'kept for review'],
    ['04', 'Expert selection', 'Arit reviewed the remaining companies and made the final selection', '9', 'selected for deep dive'],
  ];
  const top = px(268), colW = CW / 4;
  // final petrol panel (behind last column, meets wedge bottom)
  const panX = MX + 3 * colW + px(12);
  s.addShape('rect', { x: panX, y: px(248), w: W - MX + px(8) - panX, h: px(820 - 248), fill: { color: C.petrol } });
  // light wedge: taper (rtTriangle) + base rect, ending at the panel edge
  s.addShape('rect', { x: MX, y: px(776), w: panX - MX, h: px(44), fill: { color: C.petrol, transparency: 90 } });
  s.addShape('rtTriangle', { x: MX, y: px(724), w: panX - MX, h: px(52), fill: { color: C.petrol, transparency: 90 } });
  stages.forEach((st, i) => {
    const x = MX + i * colW + (i ? px(34) : 0), wcol = colW - px(34) - (i === 3 ? px(10) : px(20));
    const dark = i === 3;
    if (i) s.addShape('line', { x: MX + i * colW, y: top, w: 0, h: px(560), line: { color: C.hairline, width: 0.75 } });
    s.addText(st[0], { x, y: top, w: wcol, h: 0.25, fontFace: F, fontSize: 9.5, bold: true, color: dark ? 'BFD2DA' : C.slateMid, charSpacing: 2, margin: 0, isTextBox: true });
    s.addText(st[1], { x, y: top + 0.30, w: wcol, h: 0.62, fontFace: F, fontSize: 13.5, bold: true, color: dark ? 'FFFFFF' : C.text, margin: 0, isTextBox: true, lineSpacingMultiple: 1.1 });
    s.addText(st[2], { x, y: top + 0.98, w: wcol, h: 1.15, fontFace: F, fontSize: 10, color: dark ? 'D3E0E6' : C.muted, margin: 0, isTextBox: true, lineSpacingMultiple: 1.2, fit: 'shrink' });
    if (st[3]) {
      s.addText([{ text: st[3], options: { fontSize: 48, bold: true, color: dark ? 'FFFFFF' : C.petrol } },
                 { text: '  ' + st[4], options: { fontSize: 10.5, color: dark ? 'D3E0E6' : C.muted } }],
        { x, y: top + 2.2, w: Math.min(3.3, W - MX - 0.05 - x), h: 0.85, fontFace: F, valign: 'bottom', margin: 0, isTextBox: true });
    }
  });
  secBar(s, 'Selected for deep dive', MX, px(872), CW);
  let cx = MX;
  ['Advanced Material Development', 'Ametrine Technologies', 'CBG Systems', 'Eltics / Black Fox', 'Permali',
   'Ravelin Defense', 'Shieldex', 'STG Defence', 'Sterlite Camotech'].forEach((n) => {
    cx += chip(s, n, cx, px(930), 'tint') + 0.09;
  });
}

/* ======================= 3. OVERVIEW TABLE ======================= */
{
  const s = P.addSlide();
  chrome(s, { kicker: 'Selected Companies — Executive Overview', pageno: 3,
    title: 'Four camouflage pure-plays; five broader businesses with a dedicated or adjacent signature-management line',
    src: 'Source: Plasan 9-company deep-dive dataset (company websites, program announcements, third-party estimates)' });
  const bd = { pt: 1.2, color: 'FFFFFF' };
  const cell = (t, o) => ({ text: t, options: Object.assign({ fontFace: F, fontSize: 9.5, color: C.text, fill: { color: C.fill }, border: bd, valign: 'middle', margin: 0.04 }, o) });
  const co = (n, sub) => cell([{ text: n, options: { bold: true, fontSize: 10, breakLine: true } }, { text: sub, options: { fontSize: 8, color: C.muted } }], {});
  const prod = (runs) => cell(runs.map(([t, b]) => ({ text: t, options: b ? { bold: true, color: C.petrol } : {} })), {});
  const dom = (m, q) => cell(q ? [{ text: m, options: { breakLine: true } }, { text: q, options: { fontSize: 8.5, color: C.muted } }] : m, {});
  const st = (t, kind) => cell(t, { bold: true, fontSize: 9, align: 'center',
    color: kind === 'filled' ? 'FFFFFF' : kind === 'amber' ? C.amberTx : kind === 'gray' ? C.muted : C.petrol,
    fill: { color: kind === 'filled' ? C.petrol : C.fill } });
  const sc = (a, b) => cell(b ? [{ text: a, options: { breakLine: true } }, { text: b, options: { fontSize: 8.5, color: C.muted } }] : a, {});
  const grp = (a, b) => [cell([{ text: a.toUpperCase() + '   ', options: { bold: true, fontSize: 9.5, color: C.petrol, charSpacing: 1.5 } }, { text: b, options: { fontSize: 8.5, color: C.slateMid } }], { fill: { color: C.petrolTint }, colspan: 6 })];
  const hd = ['Company', 'Main business', 'Key signature-management offering', 'Signature domains', 'Market status', 'Employees · Revenue']
    .map((t) => cell(t, { fill: { color: C.slate }, color: 'FFFFFF', bold: true, fontSize: 9.5 }));
  const rows = [hd,
    grp('Core business', "— signature management is the company's main activity"),
    [co('Ametrine Technologies', 'Israel / US'), cell('Camouflage systems', { color: C.muted }), prod([['Flint™', 1], [' platform coating/skin; multirole concealment covers', 0]]), dom('Visual · Thermal IR'), st('Fielded / Commercial', 'filled'), sc('11–50', '$1–15M (est.)')],
    [co('Eltics / Black Fox', 'Israel'), cell('Camouflage systems', { color: C.muted }), prod([['Black Fox', 1], [' active thermal camouflage for land vehicles', 0]]), dom('Thermal IR (MWIR / LWIR)'), st('Prototype / historical', 'gray'), sc('5', 'status unclear')],
    [co('STG Defence', 'Ukraine'), cell('Camouflage systems', { color: C.muted }), prod([['Thermal Signature Equipment Shelter', 1], [' for vehicles & platforms; personnel systems', 0]]), dom('NIR / SWIR · MWIR / LWIR', 'radar: aviation / hangar lines'), st('Fielded / Commercial', 'filled'), sc('51–200')],
    [co('Sterlite Camotech', 'India'), cell('Camouflage systems', { color: C.muted }), prod([['MSCN', 1], [' multispectral nets; ', 0], ['MCS', 1], [' mobile camouflage; IR paints', 0]]), dom('Visual · NIR · Thermal IR', 'radar: company-claimed'), st('Fielded / Commercial', 'filled'), sc('26–50')],
    grp('Major business line', '— dedicated signature-management line within a broader business'),
    [co('Advanced Material Development', 'US / UK'), cell('Nanomaterials & advanced coatings', { color: C.muted }), prod([['CHAM-NIR / ChamIR', 1], [' adaptive IR coatings; ', 0], ['ChamEM', 1], [' radar materials', 0]]), dom('NIR / MIR · Radar / EM'), st('Development / Trials', 'amber'), sc('2–10')],
    [co('CBG Systems', 'Australia'), cell('Marine & defence protection systems', { color: C.muted }), prod([['SolarSigmaShield', 1], [' vehicle camouflage system; multispectral nets', 0]]), dom('Visual · Thermal IR · Radar'), st('Fielded / Commercial', 'filled'), sc('11–50', '≈$6M (est.)')],
    [co('Ravelin Defense', 'US · formerly ArmorWorks'), cell('Defence survivability & manufacturing', { color: C.muted }), prod([['TactiCam™', 1], [' 3D vehicle camouflage; radar-reduction shrouds', 0]]), dom('Visual / IR · Radar'), st('Commercial', 'outline'), sc('201–500')],
    grp('Adjacent offering', '— signature management as an application of an adjacent technology'),
    [co('Permali', 'UK · Diamorph Group'), cell('Defence composites', { color: C.muted }), prod([['Dust Skirts', 1], [' suppressing the dust plume of moving armored vehicles', 0]]), dom('Visual · Radar', 'dust-plume signature only'), st('Commercial', 'outline'), sc('370', '£30M reported')],
    [co('Shieldex', 'Germany · family-owned'), cell('Conductive & shielding textiles', { color: C.muted }), prod([['Shieldex® Zell RS CR', 1], [' metallized textile — enabling material', 0]]), dom('Thermal IR · RF / EMI shield', 'not RCS reduction'), st('Commercial', 'outline'), sc('~50', '≈$31M (est.)')],
  ];
  s.addTable(rows, { x: MX, y: px(214), w: CW, colW: [1.972, 1.75, 3.014, 2.208, 1.75, 1.639], fontFace: F, autoPage: false });
  s.addText('Employee counts are working ranges; "est." figures are unvalidated third-party estimates, not reported revenue; radar coverage is qualified where not independently substantiated.',
    { x: MX, y: px(982), w: CW, h: 0.25, fontFace: F, fontSize: 8, color: C.faint, margin: 0, isTextBox: true });
}

/* ======================= 4. LANDSCAPE MATRIX ======================= */
{
  const s = P.addSlide();
  chrome(s, { kicker: 'Product & Technology Landscape', pageno: 4,
    title: 'Vehicle systems, nets and textiles dominate the set; active / adaptive signature control appears at only two companies',
    src: 'Source: Plasan 9-company deep-dive dataset (product-family classification)' });
  const bd = { pt: 1.2, color: 'FFFFFF' };
  const cell = (t, o) => ({ text: t, options: Object.assign({ fontFace: F, fontSize: 10, color: C.text, fill: { color: C.fill }, border: bd, valign: 'middle', margin: 0.05 }, o) });
  const hd = (t, c) => cell(c ? [{ text: t, options: { breakLine: true } }, { text: c, options: { fontSize: 7.5, color: 'C8D0D8', bold: false } }] : t, { fill: { color: C.slate }, color: 'FFFFFF', bold: true, fontSize: 9, align: 'center' });
  const co = (n, sub) => cell([{ text: n, options: { bold: true, fontSize: 10.5, breakLine: true } }, { text: sub, options: { fontSize: 8, color: C.muted } }], {});
  const grp = (a, b) => [cell([{ text: a.toUpperCase() + '   ', options: { bold: true, fontSize: 9.5, color: C.petrol, charSpacing: 1.5 } }, { text: b, options: { fontSize: 8.5, color: C.slateMid } }], { fill: { color: C.petrolTint }, colspan: 7 })];
  const dot = (v) => cell(v ? '■' : '', { align: 'center', color: C.petrol, fontSize: 12 });
  const row = (n, f, flags) => [co(n, f)].concat(flags.map(dot));
  const rows = [
    [hd('Company'), hd('Vehicle camouflage systems', '5 of 9'), hd('Nets & covers', '5 of 9'), hd('Textiles & materials', '5 of 9'), hd('Coatings', '3 of 9'), hd('RAM & composites', '2 of 9'), hd('Active / adaptive systems', '2 of 9')],
    grp('Core business', "— signature management is the company's main activity"),
    row('Ametrine Technologies', 'Flint™', [1, 1, 1, 1, 0, 0]),
    row('Eltics / Black Fox', 'Black Fox', [1, 0, 0, 0, 0, 1]),
    row('STG Defence', 'Thermal Signature Equipment Shelter', [0, 1, 1, 0, 0, 0]),
    row('Sterlite Camotech', 'MSCN · MCS · IR paints', [1, 1, 1, 1, 0, 0]),
    grp('Major business line', '— dedicated signature-management line within a broader business'),
    row('Advanced Material Development', 'CHAM-NIR · ChamIR · ChamEM', [0, 0, 0, 1, 1, 1]),
    row('CBG Systems', 'SolarSigmaShield', [1, 1, 1, 0, 0, 0]),
    row('Ravelin Defense', 'TactiCam™ · Radar Reduction Shrouds', [1, 1, 0, 0, 0, 0]),
    grp('Adjacent offering', '— signature management as an application of an adjacent technology'),
    row('Permali', 'Dust Skirts', [0, 0, 0, 0, 1, 0]),
    row('Shieldex', 'Shieldex® Zell RS CR', [0, 0, 1, 0, 0, 0]),
  ];
  s.addTable(rows, { x: MX, y: px(214), w: CW, colW: [2.778, 1.59, 1.59, 1.59, 1.59, 1.59, 1.605], fontFace: F, autoPage: false });
  s.addText('A filled marker = the company offers products in that solution family, per the project dataset; flagship products shown under each company name.',
    { x: MX, y: px(958), w: CW, h: 0.25, fontFace: F, fontSize: 8, color: C.faint, margin: 0, isTextBox: true });
}

/* ========================= 5–13. PROFILES ========================= */
const PROFILES = [
  { pg: 5, group: 'Core Business', title: 'Ametrine Technologies — a camouflage pure-play with fielded platform products and active U.S. government engagement',
    snap: ['Israel / United States', 'Camouflage & multispectral signature management', 'Core business', 'Private — Ametrine Technologies Ltd / Inc.', '11–50', '$1–15M (third-party estimates)'],
    products: [['Flint™', 'Platform coating / skin — flagship', 'Multilayer coating / skin applied to mobile platforms to reduce detectable optical and thermal signatures'],
      ['Multirole Concealment Covers', 'Nets & covers', 'Deployable concealment for equipment and platforms'],
      ['Personnel systems', 'Secondary', 'Poncho Elite and the Advanced Camouflage Combat Uniform™ System — secondary to the vehicle / platform focus of this review']],
    bands: ['Visual / Optical', 'Thermal IR'], bandqual: 'Radar / RCS not verified in current product materials',
    imgs: [['ametrine-flint-jltv.jpg', 'Flint™ on a JLTV. Source: ametrine.tech — official media library', 1.556],
           ['ametrine-gmv-cover.jpg', 'GMV vehicle concealment cover. Source: ametrine.tech — official media library', 0.778]],
    tiles: [['U.S. GOVERNMENT CUSTOMERS', 'Office of Naval Research, U.S. Army RDECOM and USSOCOM'],
      ['2024 — ONR ORDER', '≈$250k order for an X-hangar and camouflage cover — a direct product signal'],
      ['2025 — ONR R&D CONTRACT', '$18M R&D contract; public scope not detailed — not attributable in full to camouflage']],
    src: 'Source: Ametrine official website; U.S. federal contract records; Plasan 9-company dataset. Revenue range is a third-party estimate.' },
  { pg: 6, group: 'Core Business', title: 'Eltics / Black Fox — active thermal-camouflage know-how; evidence is largely historical, current status unclear',
    snap: ['Israel', 'Active thermal signature-management technology', 'Core business', 'Private', '5', 'No reliable current figure'],
    products: [['Black Fox', 'Active / adaptive thermal system', 'Controlled surface panels manage the vehicle’s emitted thermal signature in the MWIR and LWIR bands'],
      ['Demonstrations — context', 'Land vehicles', 'Demonstrated on military vehicles; public evidence is prototype / demonstrator-era rather than current commercial fielding']],
    bands: ['MWIR', 'LWIR'], bandqual: 'No radar / RCS capability identified', rightTitle: 'Product & status', fitImg: true,
    imgs: [['eltics-blackfox-demo.jpg', 'Black Fox demonstrator with active thermal panels; inset: "fake signature" thermal view. Third-party editorial image — Soldier Systems Daily (2012)']],
    note: 'Public product evidence is concentrated around Black Fox and is largely historical — no active official product channel identified; current corporate and commercial status is unclear',
    tiles: [['DEMONSTRATIONS', 'Field demonstrations on military vehicles reported historically'],
      ['CUSTOMERS', 'No fielded customer confirmed'],
      ['RECENT ACTIVITY', 'No significant activity identified from 2023 onward']],
    src: 'Source: Plasan 9-company dataset (historical public reporting). No active official website; product image is third-party editorial (Soldier Systems Daily, 2012).' },
  { pg: 7, group: 'Core Business', title: 'STG Defence — fielded thermal concealment for platforms and personnel; customer use is company-stated',
    snap: ['Ukraine', 'Camouflage & protection against thermal and night-vision detection', 'Core business', 'Private — ownership not publicly disclosed', '51–200', 'No reliable public figure'],
    products: [['Thermal Signature Equipment Shelter', 'Nets & covers — flagship for platforms', 'Rapid concealment for vehicles, armored platforms, artillery and command / equipment positions'],
      ['Thermal Signature Poncho / Suit', 'Personnel', 'Personnel thermal-concealment systems; the poncho was launched and demonstrated in 2025']],
    bands: ['NIR / SWIR', 'MWIR / LWIR'], bandqual: 'Radar-related reduction documented mainly in aviation / hangar solutions — not extended to every shelter product',
    imgs: [['stg-equipment-shelter.jpg', 'Thermal Signature Equipment Shelter. Source: stg-defence.com — equipment-shelter page'],
           ['stg-thermal-view.jpg', 'Thermal-imager view of a concealed vehicle. Source: stg-defence.com — equipment-shelter page']],
    tiles: [['CUSTOMERS (COMPANY-STATED)', 'Armed Forces of Ukraine, including Special Operations Forces'],
      ['2025 — PRODUCT LAUNCH', 'Thermal Signature Poncho launched and demonstrated'],
      ['PROGRAM VISIBILITY', 'No major named vehicle procurement program identified in the public evidence reviewed']],
    src: 'Source: STG Defence official website; Plasan 9-company dataset. Customer use is company-stated.' },
  { pg: 8, group: 'Core Business', title: 'Sterlite Camotech — a broad passive camouflage portfolio with company-stated supply experience across Indian forces',
    snap: ['India', 'Military camouflage equipment — nets, mobile systems, paints', 'Core business', 'Private / proprietorship', '26–50', 'No reliable public figure'],
    products: [['MSCN camouflage nets', 'Multispectral Camouflage Nets — flagship', 'Multispectral concealment nets for military equipment and positions'],
      ['MCS mobile camouflage', 'Mobile Camouflage System — vehicle-fitted', 'Platform-fitted mobile camouflage for vehicles'],
      ['Infrared Camouflage Paints', 'Coatings', 'IR-reflective paints adding surface-treatment capability; further products broaden the portfolio']],
    bands: ['Visual', 'NIR', 'Thermal IR'], bandqual: 'Radar coverage is company-claimed, not independently confirmed',
    imgs: [['sterlite-mscn-net.jpg', 'Multispectral camouflage net — MSCN. Source: sterlitecamotech.com — products'],
           ['sterlite-paint-application.jpg', 'Camouflage-paint application. Source: sterlitecamotech.com — products']],
    tiles: [['CUSTOMERS (COMPANY-STATED)', 'Indian Air Force, Indian Army, paramilitary forces and DRDO establishments'],
      ['2025 — PROCUREMENT', 'Participated in Indian Army procurement for multispectral camouflage nets; award / value not publicly established'],
      ['2024 — DOCUMENTATION', 'Company brochure documents defence supply experience']],
    src: 'Source: Sterlite Camotech official website and brochure; Plasan 9-company dataset. Revenue omitted — public estimates conflict.' },
  { pg: 9, group: 'Major Business Line', title: 'Advanced Material Development — adaptive IR and radar-signature materials in defence trials, not yet fielded',
    snap: ['US / UK', 'Nanomaterials & advanced coatings — defence is one of several markets', 'Major business line', 'Private — AMD Ltd (UK); U.S. arm AMD Inc.', '2–10', 'No reliable public figure'],
    products: [['CHAM-NIR', 'Adaptive coating', 'Adaptive near-infrared signature-management coating / system'],
      ['ChamIR', 'Coating', 'Infrared / thermal signature control'],
      ['ChamEM', 'RAM / advanced materials', 'Electromagnetic / radar-signature reduction using advanced materials — a genuine radar application, not generic EMI shielding']],
    bands: ['NIR / MIR', 'Thermal IR', 'Radar / EM'], bandqual: 'Cross-domain portfolio; not yet shown as one integrated fielded system', tallImg: true,
    imgs: [['amd-chamir-news.jpg', 'ChamIR patent announcement — official news imagery. Source: amdnano-usa.com — news']],
    tiles: [['TRIALS & VALIDATION', 'U.S. Army / OSD Foreign Comparative Testing associated with ChamEM; NPS JIFX 25-4 testing of adaptive NIR / MIR coatings (2025)'],
      ['2025 — U.S. FOOTPRINT', 'U.S. defence subsidiary launched — strengthens access to U.S. programs; not itself a customer order'],
      ['MATURITY', 'Development / trials stage; no broad field deployment identified']],
    src: 'Source: AMD official website; NPS JIFX documentation; Plasan 9-company dataset.' },
  { pg: 10, group: 'Major Business Line', title: 'CBG Systems — a fielded multispectral vehicle-camouflage system inside a broader marine & protection business',
    snap: ['Australia', 'Marine insulation, fire/protection systems & defence signature management', 'Major business line', 'Private — CBG Systems Pty Ltd', '11–50', '≈$6M (third-party estimate)'],
    products: [['SolarSigmaShield', 'Vehicle camouflage system — flagship', 'Tailored, layered multispectral camouflage for military platforms — reduces visual / optical, thermal-IR and radar signatures in one integrated vehicle solution'],
      ['Multispectral Net System', 'Nets & covers', 'Deployable multispectral concealment for equipment and platforms'],
      ['Individual Camouflage System', 'Personnel — secondary', 'Personal concealment; secondary to the vehicle / platform portfolio']],
    bands: ['Visual / Optical', 'Thermal IR', 'Radar'], bandqual: null,
    imgs: [['cbg-redback-solarsigmashield.jpg', 'Redback IFV with SolarSigmaShield MCS. Source: cbgsystems.com — LAND 400 Phase 3 announcement'],
           ['cbg-solarsigmashield-vehicle.jpg', 'SolarSigmaShield on vehicle. Source: cbgsystems.com — Mobile Camouflage']],
    tiles: [['2024 — LAND 400 PHASE 3', 'Contracted to supply SolarSigmaShield for the Redback IFV — named customer, major armored-vehicle program'],
      ['CUSTOMER', 'Hanwha Defence Australia — named customer for the Redback IFV under LAND 400 Phase 3'],
      ['FURTHER PROGRAM ASSOCIATION', "Associated with Australia's AS9 / AS10 vehicles under LAND 8116"]],
    src: 'Source: CBG Systems official website (Signature Management; LAND 400 Phase 3 announcement). Revenue is a third-party estimate, not company-reported.' },
  { pg: 11, group: 'Major Business Line', title: 'Ravelin Defense — signature management retained as a dedicated unit inside a scaled U.S. survivability group',
    snap: ['United States', 'Defence survivability — armor, seating, signature management, metal fabrication', 'Major business line', 'Littlejohn Capital portfolio company', '201–500', 'Unverified post-integration'],
    products: [['TactiCam™', 'Vehicle camouflage system — flagship', 'Durable 3D vehicle camouflage / signature-management system for land platforms, positioned as multispectral with visual / IR relevance'],
      ['Radar Reduction Shrouds', 'Radar signature products', 'Signature-management products intended to reduce platform radar detectability']],
    bands: ['Visual / IR', 'Radar'], bandqual: 'Exact spectral bands not fully disclosed publicly',
    imgs: [['ravelin-tacticam-hmmwv.jpg', 'TactiCam™ desert scheme on a HMMWV. Source: ravelindefense.com — Signature Management'],
           ['ravelin-tacticam-closeup.jpg', 'TactiCam™ 3D surface, close-up (AUSA 2025). Source: ravelindefense.com — Signature Management']],
    tiles: [['DEMONSTRATIONS', 'TactiCam demonstrated on General Dynamics land-vehicle platforms'],
      ['2026 — INTEGRATION', 'ArmorWorks and Fox Valley Metal Tech unified under Ravelin Defense; Signature Management retained as a dedicated business unit'],
      ['CUSTOMER BASE', 'Broader customers include the U.S. military and major primes — not all attributable to signature management']],
    src: 'Source: Ravelin Defense official website and announcements; Plasan 9-company dataset. Historical ArmorWorks revenue is not attributed to Ravelin.' },
  { pg: 12, group: 'Adjacent Offering', title: 'Permali — defence composites with an established signature application: suppressing the armored vehicle’s dust plume',
    snap: ['United Kingdom', 'Advanced composites for defence & engineered markets', 'Adjacent offering', 'Diamorph Group (acquired 2021)', '370', '£30M reported turnover'],
    products: [['Dust Skirts / Dust Guards', 'Composite application — adjacent', 'Installed around armored vehicles to suppress the visible dust plume created during movement and reduce the associated radar signature of the dust cloud — indirect signature reduction, not classic platform RAM'],
      ['Composite engineering base — context', 'Land-defence composites', 'The offering applies Permali’s defence composite know-how; the core proposition is material engineering rather than camouflage']],
    bands: ['Visual', 'Radar'], bandqual: 'Dust-plume signature only; no broad thermal-IR claim', tallImg: true,
    imgs: [['permali-dust-guards.jpg', 'Dust Guards — official product illustration. Source: permali.co.uk, Land Defence Composites / Dust Skirts']],
    tiles: [['SCALE (REPORTED)', '≈£30M turnover and ≈370 co-workers, as reported in current Diamorph publications'],
      ['OWNERSHIP', 'Acquired by Diamorph Group in 2021'],
      ['RECENT ACTIVITY', 'No significant signature-management-specific activity identified from 2023 onward — an established adjacent offering']],
    src: 'Source: Permali official website; Diamorph publications; Plasan 9-company dataset.' },
  { pg: 13, group: 'Adjacent Offering', title: 'Shieldex — a conductive-textile platform moving into defence multispectral applications as an enabling material',
    snap: ['Germany', 'Conductive & metallized technical textiles', 'Adjacent offering', 'Family-owned — Robert Erichsen (CEO & Owner)', '~50', '≈$31M (third-party estimate)'],
    products: [['Shieldex® Zell RS CR', 'Textiles & materials — enabling material', 'Metallized textile used in military concealment and shielding applications — an enabling material rather than a complete vehicle camouflage system'],
      ['Conductive-textile platform — context', 'Shielding · heating · sensing', 'A broad portfolio of conductive / metallized textiles for electromagnetic shielding, heating and sensing underpins the defence offering']],
    bands: ['Thermal IR', 'RF / EMI shielding'], bandqual: 'EMI / RF shielding is not radar-cross-section reduction; no product-specific RCS claim verified',
    imgs: [['shieldex-metallized-textile.jpg', 'Metallized textile — product preview. Source: shieldex.de, Multispectral Shielding'],
           ['shieldex-shielding-tent.jpg', 'RF / EMI shielding tent — shielding application. Source: shieldex.de, Multispectral Shielding']],
    tiles: [['2024 — POSITIONING', 'Dedicated Multispectral Shielding solution family positioned for military and security applications — a market signal, not a disclosed contract'],
      ['CUSTOMERS', 'No named recent military signature-management customer identified'],
      ['PLATFORM STRENGTH', 'Established RF / EMI shielding expertise across industrial and defence applications']],
    src: 'Source: Shieldex official website; Plasan 9-company dataset. Revenue is a third-party estimate.' },
];

for (const p of PROFILES) {
  const s = P.addSlide();
  chrome(s, { kicker: 'Company Profile · ' + p.group, pageno: p.pg, title: p.title, src: p.src });
  // snapshot table
  const bd = { pt: 1.2, color: 'FFFFFF' };
  const th = (t) => ({ text: t.toUpperCase(), options: { fontFace: F, fontSize: 8.5, bold: true, color: 'FFFFFF', fill: { color: C.petrol }, border: bd, charSpacing: 1, margin: 0.06 } });
  const td = (t) => ({ text: t, options: { fontFace: F, fontSize: 10, color: C.text, fill: { color: C.fill }, border: bd, valign: 'top', margin: 0.07 } });
  s.addTable([
    ['Country', 'Main business', 'Signature focus', 'Ownership', 'Employees', 'Revenue'].map(th),
    p.snap.map(td),
  ], { x: MX, y: px(232), w: CW, colW: [1.389, 3.264, 2.083, 2.292, 1.292, 2.013], fontFace: F, autoPage: false });
  // left column: portfolio
  const LX = MX, LW = px(1020), py0 = px(378);
  secBar(s, 'Signature-management portfolio', LX, py0, LW);
  const step = p.products.length >= 3 ? 0.62 : 0.74;
  let y = py0 + 0.42;
  for (const [name, type, desc] of p.products) {
    s.addText([{ text: name, options: { fontSize: 11.5, bold: true, color: C.petrol, breakLine: true } },
               { text: type, options: { fontSize: 8.5, color: C.slateMid } }],
      { x: LX, y, w: 2.5, h: step - 0.08, fontFace: F, margin: 0, isTextBox: true, valign: 'top', lineSpacingMultiple: 1.05, fit: 'shrink' });
    s.addText(desc, { x: LX + 2.7, y, w: LW - 2.7, h: step - 0.08, fontFace: F, fontSize: 10, color: C.text, margin: 0, isTextBox: true, valign: 'top', lineSpacingMultiple: 1.12, fit: 'shrink' });
    y += step;
    s.addShape('line', { x: LX, y: y - 0.07, w: LW, h: 0, line: { color: C.hairline, width: 0.5 } });
  }
  y += 0.05;
  s.addText('SIGNATURE DOMAINS', { x: LX, y: y + 0.04, w: 2.0, h: 0.2, fontFace: F, fontSize: 8, bold: true, color: C.muted, charSpacing: 1.5, margin: 0, isTextBox: true, fit: 'shrink' });
  let bx = LX + 1.95;
  for (const b of p.bands) bx += chip(s, b, bx, y, 'tint') + 0.1;
  if (p.bandqual) s.addText(p.bandqual, { x: LX, y: y + 0.34, w: LW, h: 0.2, fontFace: F, fontSize: 8.5, color: C.faint, margin: 0, isTextBox: true, fit: 'shrink' });
  // right column: images / notes
  const RX = MX + px(1020) + px(56), RW = CW - px(1020) - px(56);
  secBar(s, p.rightTitle || 'Product & application', RX, py0, RW);
  let iy = py0 + 0.42;
  for (const [img, cap, hOverride] of p.imgs) {
    const fh = hOverride || (p.tallImg ? 2.48 : 1.167);
    s.addShape('rect', { x: RX, y: iy, w: RW, h: fh, fill: { color: C.fill }, line: { color: C.border, width: 0.75 } });
    const capH = 0.34, bw = RW - 0.16, bh = fh - 0.1 - capH;
    const d = DIMS[img], k = Math.min(bw / d[0], bh / d[1]);
    const iw = d[0] * k, ihh = d[1] * k;
    s.addImage({ path: IMG(img), x: RX + 0.08 + (bw - iw) / 2, y: iy + 0.05 + (bh - ihh) / 2, w: iw, h: ihh });
    s.addText(cap, { x: RX + 0.1, y: iy + fh - capH - 0.02, w: RW - 0.2, h: capH, fontFace: F, fontSize: 7.5, color: C.muted, margin: 0, isTextBox: true, lineSpacingMultiple: 1.05, fit: 'shrink' });
    iy += fh + 0.12;
  }
  if (p.note) {
    s.addShape('rect', { x: RX, y: iy, w: RW, h: 1.05, fill: { color: C.fill } });
    s.addText([{ text: 'STATUS', options: { fontSize: 7.5, bold: true, color: C.faint, charSpacing: 1.5, breakLine: true } },
               { text: p.note, options: { fontSize: 9.5, color: C.text } }],
      { x: RX + 0.12, y: iy + 0.08, w: RW - 0.24, h: 0.9, fontFace: F, margin: 0, isTextBox: true, valign: 'top', lineSpacingMultiple: 1.15, fit: 'shrink' });
  }
  // evidence tiles
  const EY = px(802);
  secBar(s, 'Commercial evidence', MX, EY, CW);
  const TW = 4.0, GAP = px(24);
  p.tiles.forEach(([lbl, txt], i) => {
    const tx = MX + i * (TW + GAP);
    s.addShape('rect', { x: tx, y: EY + 0.38, w: TW, h: 0.035, fill: { color: C.petrol } });
    s.addShape('rect', { x: tx, y: EY + 0.415, w: TW, h: 1.12, fill: { color: C.fill } });
    s.addText([{ text: lbl, options: { fontSize: 9, bold: true, color: C.petrol, breakLine: true } },
               { text: txt, options: { fontSize: 9.5, color: C.text } }],
      { x: tx + 0.15, y: EY + 0.5, w: TW - 0.3, h: 1.0, fontFace: F, margin: 0, isTextBox: true, valign: 'top', lineSpacingMultiple: 1.12, fit: 'shrink' });
  });
}

P.writeFile({ fileName: path.join(__dirname, '..', 'deck.pptx') }).then(() => console.log('deck.pptx written'));
