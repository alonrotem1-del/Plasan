/* Generate deck.pptx — native, fully editable PowerPoint version of the
 * Plasan Signature Management deck (Hebrew / RTL) in the BDO identity.
 * Mirrors the approved Hebrew HTML deck (14 slides): all text/tables/shapes
 * native; only product photos + logo are images.
 * RTL: titles right-aligned, logo top-left, edge strip + pageno tab stay on
 * the physical left, table column arrays are reversed so the lead column
 * renders on the right, rtlMode set on Hebrew text.
 * Scale: HTML px -> inches = /144 (1920px = 13.333in); px -> pt = /2.
 * Font: Almoni Neue DL 4.0 AAA (BDO brand font, Hebrew-native; QA renders
 * here substitute, so sizing leaves slack). */
const pptxgen = require('pptxgenjs');
const path = require('path');

const F = 'Almoni Neue DL 4.0 AAA';
const C = {
  petrol: '014C67', petrolTint: 'E6EEF1', slate: '46586A', slateMid: '657C91',
  red: 'ED1A3B', burgundy: '98002E',
  text: '1A2530', muted: '5A6B7A', faint: '8595A3', fill: 'EDF0F2',
  border: 'C9D0D6', hairline: 'DDE2E6', strip: 'CED2DB', tab: '97A4B2',
};
const IMG = (f) => path.join(__dirname, '..', 'assets', 'images', f);
const DIMS = {
  'ametrine-flint-jltv.jpg': [863, 1013], 'stg-equipment-shelter.jpg': [1200, 773],
  'stg-thermal-view.jpg': [1100, 1037], 'sterlite-mscn-net.jpg': [800, 624],
  'sterlite-paint-application.jpg': [800, 624], 'amd-chamir-news.jpg': [1200, 675],
  'cbg-redback-solarsigmashield.jpg': [1400, 782], 'cbg-solarsigmashield-vehicle.jpg': [1100, 825],
  'ravelin-tacticam-hmmwv.jpg': [1200, 904], 'ravelin-tacticam-closeup.jpg': [800, 602],
  'permali-dust-guards.jpg': [1100, 708], 'shieldex-metallized-textile.jpg': [1400, 700],
  'shieldex-shielding-tent.jpg': [1000, 667], 'eltics-blackfox-demo.jpg': [396, 263],
};
const W = 13.333, H = 7.5, MX = 0.5, CW = W - 2 * MX;
const FT = 7.097; // footer top
const px = (v) => v / 144;
const RLM = '‏'; // right-to-left mark — anchors mixed Hebrew/Latin strings
// wrap numeric/money/trademark tokens in LRM pairs so bidi keeps them intact
const fixbidi = (s) => typeof s === 'string' ? s
  .replace(/(?<![\u0590-\u05FF][-‑])(?<![\d.,])([~≈]?[$£]?\d[\d.,]*(?:[–-]\d[\d.,]*)?[KMB]?\+?)/g, '\u200E$1\u200E')
  .replace(/([A-Za-z][A-Za-z0-9]*[™®])/g, '\u200E$1\u200E') : s;
const fixruns = (t) => typeof t === 'string' ? fixbidi(t) : Array.isArray(t) ? t.map((r) => Object.assign({}, r, { text: fixbidi(r.text) })) : t;
const PROJ = 'פלסן סאסא — ניהול חתימה | מיפוי חברות';

const P = new pptxgen();
P.layout = 'LAYOUT_WIDE';
P.theme = { headFontFace: F, bodyFontFace: F };

const RT = { rtlMode: true, align: 'right', lang: 'he-IL' };

function chrome(s, { kicker, title, pageno, src }) {
  s.background = { color: 'FFFFFF' };
  s.addShape('rect', { x: 0, y: px(150), w: px(18), h: H - px(150), fill: { color: C.strip } });
  s.addImage({ path: IMG('bdo-logo.png'), x: MX, y: 0.33, w: 1.75, h: 1.75 * 109 / 443 });
  s.addText(kicker, Object.assign({ x: W - MX - 9.3, y: 0.28, w: 9.3, h: 0.28, fontFace: F, fontSize: 10, bold: true, color: C.slateMid, margin: 0, isTextBox: true }, RT));
  s.addText(fixbidi(title), Object.assign({ x: W - MX - 9.3, y: 0.56, w: 9.3, h: 1.0, fontFace: F, fontSize: 21, bold: true, color: C.slate, margin: 0, isTextBox: true, valign: 'top', lineSpacingMultiple: 1.15, fit: 'shrink' }, RT));
  // footer: pageno tab stays bottom-left; sources small at left, project name at right
  s.addShape('line', { x: 0, y: FT, w: W, h: 0, line: { color: C.hairline, width: 0.75 } });
  s.addShape('rect', { x: 0, y: FT, w: px(58), h: H - FT, fill: { color: C.tab } });
  s.addText(String(pageno), { x: 0, y: FT, w: px(58), h: H - FT, align: 'center', valign: 'middle', fontFace: F, fontSize: 8, bold: true, color: 'FFFFFF', margin: 0, isTextBox: true });
  s.addText(RLM + fixbidi(src), { x: px(58) + 0.15, y: FT, w: 8.2, h: H - FT, align: 'left', valign: 'middle', fontFace: F, fontSize: 8, color: C.faint, margin: 0, isTextBox: true, rtlMode: true, lang: 'he-IL' });
  s.addText(PROJ, { x: W - MX - 4.2, y: FT, w: 4.2, h: H - FT, align: 'right', valign: 'middle', fontFace: F, fontSize: 8, color: C.faint, margin: 0, isTextBox: true, rtlMode: true, lang: 'he-IL' });
}

function secBarR(s, label, xRight, y, w) {
  s.addText(label, Object.assign({ x: xRight - w, y, w, h: 0.26, fontFace: F, fontSize: 11, bold: true, color: C.petrol, margin: 0, isTextBox: true }, RT));
  s.addShape('line', { x: xRight - w, y: y + 0.30, w, h: 0, line: { color: C.petrol, width: 1.5 } });
}

// chip placed by its RIGHT edge; returns width
function chipR(s, text, xRight, y) {
  const lat = (text.match(/[A-Za-z0-9/ .™®-]/g) || []).length, heb = text.length - lat;
  const w = 0.24 + lat * 0.072 + heb * 0.088;
  s.addText(RLM + fixbidi(text), { shape: 'roundRect', x: xRight - w, y, w, h: 0.3, rectRadius: 0.02, align: 'center', valign: 'middle', fontFace: F, fontSize: 9, bold: true, margin: 0, isTextBox: true, fit: 'shrink', fill: { color: C.petrolTint }, color: C.petrol, rtlMode: true, lang: 'he-IL' });
  return w;
}

// bulleted story paragraphs: paras = array of run-arrays
function story(s, x, y, w, h, paras) {
  const runs = [];
  paras.forEach((para, pi) => {
    para.forEach((r, ri) => {
      const o = Object.assign({}, r.options || {});
      o.bullet = { code: '25AA', color: C.petrol, indent: 14 };
      o.paraSpaceAfter = 7;
      if (ri === para.length - 1 && pi < paras.length - 1) o.breakLine = true;
      runs.push({ text: fixbidi(r.text), options: o });
    });
  });
  s.addText(runs, Object.assign({ x, y, w, h, fontFace: F, fontSize: 10.5, color: C.text, margin: 0, isTextBox: true, valign: 'top', lineSpacingMultiple: 1.18, fit: 'shrink' }, RT));
}
const T = (t) => ({ text: t });
const B = (t) => ({ text: t, options: { bold: true, color: C.petrol } });
const DM = (t) => ({ text: t, options: { color: C.muted } });

// framed image, contain-fit, caption inside the frame bottom
function ifig(s, img, cap, x, y, w, h) {
  s.addShape('rect', { x, y, w, h, fill: { color: C.fill }, line: { color: C.border, width: 0.75 } });
  const capH = 0.38, bw = w - 0.16, bh = h - 0.1 - capH;
  const d = DIMS[img], k = Math.min(bw / d[0], bh / d[1]);
  s.addImage({ path: IMG(img), x: x + 0.08 + (bw - d[0] * k) / 2, y: y + 0.05 + (bh - d[1] * k) / 2, w: d[0] * k, h: d[1] * k });
  s.addText(RLM + fixbidi(cap), Object.assign({ x: x + 0.1, y: y + h - capH - 0.02, w: w - 0.2, h: capH, fontFace: F, fontSize: 7.5, color: C.muted, margin: 0, isTextBox: true, lineSpacingMultiple: 1.05, fit: 'shrink' }, RT));
}

/* ============================== 1. COVER ============================== */
{
  const s = P.addSlide();
  s.background = { color: 'FFFFFF' };
  s.addShape('rect', { x: 0, y: px(150), w: px(18), h: H - px(150), fill: { color: C.strip } });
  s.addImage({ path: IMG('bdo-logo.png'), x: MX, y: 0.39, w: 2.6, h: 2.6 * 109 / 443 });
  s.addShape('rect', { x: W - px(20), y: px(230), w: px(20), h: px(160), fill: { color: C.slate } });
  s.addText('פלסן סאסא — אסטרטגיה', Object.assign({ x: W - MX - 8, y: 2.2, w: 8, h: 0.32, fontFace: F, fontSize: 13, bold: true, color: C.slateMid, margin: 0, isTextBox: true }, RT));
  s.addText('ניהול חתימה\nוהסוואה רב-ספקטרלית', Object.assign({ x: W - MX - 10.8, y: 2.6, w: 10.8, h: 1.75, fontFace: F, fontSize: 42, bold: true, color: C.petrol, margin: 0, isTextBox: true, lineSpacingMultiple: 1.12 }, RT));
  s.addText('מיפוי חברות ממוקד — ניתוח עומק של תשע חברות נבחרות', Object.assign({ x: W - MX - 9, y: 4.5, w: 9, h: 0.4, fontFace: F, fontSize: 16, color: C.muted, margin: 0, isTextBox: true }, RT));
  s.addText('ספטמבר 2026', Object.assign({ x: W - MX - 4, y: 5.12, w: 4, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: C.faint, margin: 0, isTextBox: true }, RT));
  s.addShape('rect', { x: MX, y: FT - px(120), w: px(120), h: px(120), fill: { color: C.burgundy } });
  s.addShape('line', { x: 0, y: FT, w: W, h: 0, line: { color: C.hairline, width: 0.75 } });
  s.addShape('rect', { x: 0, y: FT, w: px(58), h: H - FT, fill: { color: C.tab } });
  s.addText('1', { x: 0, y: FT, w: px(58), h: H - FT, align: 'center', valign: 'middle', fontFace: F, fontSize: 8, bold: true, color: 'FFFFFF', margin: 0, isTextBox: true });
  s.addText('מסמך עבודה פנימי', { x: px(58) + 0.15, y: FT, w: 5, h: H - FT, align: 'left', valign: 'middle', fontFace: F, fontSize: 8, color: C.faint, margin: 0, isTextBox: true, rtlMode: true, lang: 'he-IL' });
  s.addText(PROJ, { x: W - MX - 4.2, y: FT, w: 4.2, h: H - FT, align: 'right', valign: 'middle', fontFace: F, fontSize: 8, color: C.faint, margin: 0, isTextBox: true, rtlMode: true, lang: 'he-IL' });
}

/* ======================= 2. SCOPE + FUNNEL ======================= */
{
  const s = P.addSlide();
  chrome(s, { kicker: 'מסגרת הפרויקט ותהליך הסינון', pageno: 2,
    title: 'בניית בנק חברות מטרה בניהול חתימה — מ-37 חברות רלוונטיות לתשע נבחרות לניתוח עומק',
    src: 'מקור: תהליך הסינון של צוות הפרויקט; חוברות המיפוי של פלסן (מפת החברות; מאגר תשע החברות)' });
  const tiles = [
    ['המשימה', [B('בנק חברות מטרה'), T(' עבור פלסן בתחום ניהול החתימה וההסוואה הרב-ספקטרלית — בניית תשתית סדורה של מועמדות רלוונטיות')]],
    ['טכנולוגיות בתחולת הפרויקט', [T('הפחתת חתימה אלקטרומגנטית / מכ״ם · הסוואה אופטית ורב-ספקטרלית · הפחתת חתימה תרמית (IR)')]],
    ['פלטפורמות', [B('יבשתיות'), T(' — הפוקוס העיקרי; '), B('ימיות'), T(' — רלוונטיות אפשרית '), DM('· מחוץ להיקף: חברות בפוקוס תעופתי בלבד או ללוחם הבודד בלבד')]],
    ['שאלת המחקר', [T('אילו מוצרים קיימים בשוק ניהול החתימה, ואילו חלקים של הספקטרום כל אחד מהם מכסה')]],
    ['גיאוגרפיה', [T('ישראל · מזרח אירופה · ארה״ב · מערב אירופה '), DM('· למיפוי ערך גם בהיעדר יעד מיידי')]],
    ['פרופיל גודל', [T('מכירות עד ~$20M — פרופיל היעד העיקרי · גדולות יותר — רלוונטיות להשקעת מיעוט ללא שליטה '), DM('· גדולות מאוד — נקודת ייחוס שוק בלבד')]],
  ];
  const tw = (CW - 2 * 0.14) / 3, th = 1.22, gy = 0.14, y0 = 1.72;
  tiles.forEach(([lbl, runs], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = W - MX - (col + 1) * tw - col * 0.14, y = y0 + row * (th + gy);
    s.addShape('rect', { x, y, w: tw, h: 0.03, fill: { color: C.petrol } });
    s.addShape('rect', { x, y: y + 0.03, w: tw, h: th - 0.03, fill: { color: C.fill } });
    s.addText(lbl, Object.assign({ x: x + 0.16, y: y + 0.12, w: tw - 0.32, h: 0.24, fontFace: F, fontSize: 10.5, bold: true, color: C.petrol, margin: 0, isTextBox: true }, RT));
    s.addText(runs.map(r => ({ text: fixbidi(r.text), options: r.options })), Object.assign({ x: x + 0.16, y: y + 0.38, w: tw - 0.32, h: th - 0.5, fontFace: F, fontSize: 9.5, color: C.text, margin: 0, isTextBox: true, valign: 'top', lineSpacingMultiple: 1.16, fit: 'shrink' }, RT));
  });
  const my = y0 + 2 * th + gy + 0.16;
  s.addShape('rect', { x: MX, y: my, w: CW, h: 0.4, fill: { color: C.petrolTint } });
  s.addText('המתודולוגיה, קריטריוני הסינון והבחירה גובשו בעבודה משותפת עם מומחה ניהול החתימה של פלסן',
    Object.assign({ x: MX + 0.18, y: my, w: CW - 0.36, h: 0.4, valign: 'middle', fontFace: F, fontSize: 11, color: C.petrol, margin: 0, isTextBox: true }, RT));
  // funnel: 37 (right) -> 18 -> 9 (left, petrol)
  const fy = my + 0.58, fh = 1.55, bw = (CW - 2 * 0.42) / 3;
  const boxes = [
    ['37', 'חברות רלוונטיות זוהו', 'מיפוי שוק מבוסס-קריטריונים של ספקיות ניהול חתימה והסוואה', false],
    ['18', 'נותרו לבחינה מעמיקה', 'לאחר סינון חברות עם מכירות מעל ~$100M וסקירת הנהלת הפרויקט', false],
    ['9', 'נבחרו לניתוח עומק', 'בסקירת המומחים — והן מושא מסמך זה', true],
  ];
  boxes.forEach(([n, lbl, d, dark], i) => {
    const x = W - MX - (i + 1) * bw - i * 0.42;
    s.addShape('rect', { x, y: fy, w: bw, h: fh, fill: { color: dark ? C.petrol : C.fill } });
    s.addText(n, Object.assign({ x: x + 0.2, y: fy + 0.06, w: bw - 0.4, h: 0.72, fontFace: F, fontSize: 40, bold: true, color: dark ? 'FFFFFF' : C.petrol, margin: 0, isTextBox: true }, RT));
    s.addText(lbl, Object.assign({ x: x + 0.2, y: fy + 0.82, w: bw - 0.4, h: 0.26, fontFace: F, fontSize: 11.5, bold: true, color: dark ? 'FFFFFF' : C.text, margin: 0, isTextBox: true }, RT));
    s.addText(RLM + fixbidi(d), Object.assign({ x: x + 0.2, y: fy + 1.08, w: bw - 0.4, h: 0.44, fontFace: F, fontSize: 9, color: dark ? 'D3E0E6' : C.muted, margin: 0, isTextBox: true, lineSpacingMultiple: 1.12, fit: 'shrink' }, RT));
    if (i < 2) s.addText('❮', { x: x - 0.42, y: fy + fh / 2 - 0.22, w: 0.42, h: 0.44, align: 'center', valign: 'middle', fontFace: F, fontSize: 20, color: C.slateMid, margin: 0, isTextBox: true });
  });
}

/* ================== 3. FLAT COMPARATIVE TABLE ================== */
{
  const s = P.addSlide();
  chrome(s, { kicker: 'תמונת-על השוואתית', pageno: 3,
    title: 'תשע החברות במבט אחד — ארבע שחקניות הסוואה ייעודיות וחמש חברות עם ניהול חתימה בתוך עסק רחב יותר',
    src: 'מקור: מאגר תשע החברות של פלסן (אתרי חברות, הודעות תוכנית, הערכות צד-שלישי); מאגרי חברות חיצוניים' });
  const bd = { pt: 1.2, color: 'FFFFFF' };
  const cell = (t, o) => ({ text: fixruns(t), options: Object.assign({ fontFace: F, fontSize: 8.5, color: C.text, fill: { color: C.fill }, border: bd, valign: 'middle', margin: 0.04, align: 'right', rtlMode: true, lang: 'he-IL' }, o) });
  const sup = (n) => ({ text: String(n), options: { superscript: true, fontSize: 7 } });
  const co = (n, sub) => cell(sub ? [{ text: n, options: { bold: true, fontSize: 9, breakLine: true } }, { text: sub, options: { fontSize: 7.5, color: C.muted } }] : [{ text: n, options: { bold: true, fontSize: 9 } }], {});
  const mut = (t) => cell(RLM + t, { color: C.muted });
  const imp = (t) => cell(t, { bold: true, color: C.petrol });
  const prod = (runs) => cell(runs.map(([t, b]) => ({ text: t, options: b ? { bold: true, color: C.petrol } : {} })), { fontSize: 8.5 });
  const num = (t) => cell(RLM + t, {});
  const rev = (a, q) => cell(q ? [{ text: RLM + a, options: { breakLine: true } }, { text: q, options: { fontSize: 7.5, color: C.muted } }] : RLM + a, {});
  const hd = ['חברה', 'מדינה', 'עיסוק עיקרי', 'חשיבות ניהול החתימה', 'קטגוריית פתרון', 'הצעה מרכזית בניהול חתימה', 'ספקטרום', 'עובדים', 'הכנסות', 'בעלות']
    .map((t) => cell(t, { fill: { color: C.slate }, color: 'FFFFFF', bold: true, fontSize: 8.5 }));
  const rows = [hd,
    [co('Ametrine Technologies'), mut('ישראל / ארה״ב'), mut('מערכות הסוואה רב-ספקטרליות'), imp('ליבת העסק'), mut('ציפויים · כיסויים'),
     prod([['Flint™', 1], [' — ציפוי / מעטה פלטפורמה; כיסויי הסתרה רב-ייעודיים', 0]]),
     cell([{ text: RLM + 'VIS · תרמי' }, sup(1)], {}), num('~40'), rev('$1–15M', 'הערכה'), mut('פרטית')],
    [co('Eltics / Black Fox'), mut('ישראל'), mut('הסוואה תרמית אקטיבית'), imp('ליבת העסק'), mut('מערכת אקטיבית'),
     prod([['Black Fox', 1], [' — הסוואה תרמית אקטיבית לרכב יבשתי', 0]]),
     cell(RLM + 'MWIR · LWIR', {}), num('~5'), mut('אין נתון'), mut('פרטית')],
    [co('STG Defence'), mut('אוקראינה'), mut('מערכות הסוואה והגנה מגילוי'), imp('ליבת העסק'), mut('רשתות · כיסויים'),
     prod([['Thermal Signature Equipment Shelter', 1], [' לפלטפורמות; מערכות ללוחם', 0]]),
     cell([{ text: RLM + 'NIR·SWIR·MWIR·LWIR · מכ״ם' }, sup(2)], {}), num('51–200'), mut('אין נתון'), mut('פרטית')],
    [co('Sterlite Camotech'), mut('הודו'), mut('ציוד הסוואה צבאי'), imp('ליבת העסק'), mut('רשתות · צבעים'),
     prod([['רשתות MSCN', 1], [' רב-ספקטרליות; הסוואה ניידת ', 0], ['MCS', 1], ['; צבעי IR', 0]]),
     cell([{ text: RLM + 'VIS · NIR · תרמי' }, sup(1), { text: ' · מכ״ם' }, sup(3)], {}), num('26–50'), mut('אין נתון'), mut('פרטית')],
    [co('Advanced Material Development'), mut('ארה״ב / בריטניה'), mut('ננו-חומרים וציפויים מתקדמים'), imp('קו עסקי מרכזי'), mut('ציפויים · RAM'),
     prod([['CHAM-NIR / ChamIR', 1], [' — ציפויים; חומרי ', 0], ['ChamEM', 1], [' למכ״ם', 0]]),
     cell([{ text: RLM + 'NIR · MWIR' }, sup(4), { text: ' · מכ״ם' }], {}), num('~15'), mut('אין נתון'), mut('פרטית')],
    [co('CBG Systems'), mut('אוסטרליה'), mut('מערכות הגנה ימיות-ביטחוניות'), imp('קו עסקי מרכזי'), mut('מערכת רכב · רשתות'),
     prod([['SolarSigmaShield', 1], [' — הסוואת פלטפורמה רב-ספקטרלית; רשתות', 0]]),
     cell([{ text: RLM + 'VIS · תרמי' }, sup(1), { text: ' · מכ״ם' }], {}), num('~20'), rev('≈$6M', 'הערכה'), mut('פרטית')],
    [co('Ravelin Defense', 'לשעבר ArmorWorks'), mut('ארה״ב'), mut('שרידות ביטחונית וייצור'), imp('קו עסקי מרכזי'), mut('מערכת רכב · כיסויים'),
     prod([['TactiCam™', 1], [' — הסוואת רכב תלת-ממדית; כיסויי הפחתת מכ״ם', 0]]),
     cell(RLM + 'VIS / IR · מכ״ם', {}), num('201–500'), mut('לא מאומת'), mut('Littlejohn Capital')],
    [co('Permali'), mut('בריטניה'), mut('קומפוזיטים ביטחוניים'), imp('הצעה משיקה'), mut('קומפוזיטים'),
     prod([['Dust Skirts', 1], [' — דיכוי ענן האבק של רק״ם בתנועה', 0]]),
     cell([{ text: RLM + 'VIS · מכ״ם' }, sup(5)], {}), num('~270'), rev('£30M', 'מדווח'), mut('קבוצת Diamorph')],
    [co('Shieldex'), mut('גרמניה'), mut('טקסטיל טכני מוליך'), imp('הצעה משיקה'), mut('טקסטיל · חומרים'),
     prod([['Shieldex® Zell RS CR', 1], [' — טקסטיל מצופה-מתכת כחומר מאפשר', 0]]),
     cell([{ text: RLM + 'תרמי' }, sup(1), { text: ' · EMI' }, sup(6)], {}), num('~50'), rev('≈$31M', 'הערכה'), mut('משפחתית (Statex)')],
  ].map((r) => [hd, r][1]);
  const colW = [1.639, 0.778, 1.431, 0.917, 1.167, 2.417, 1.417, 0.653, 0.903, 1.011];
  const rrows = rows.map((r) => r.slice().reverse());
  s.addTable(rrows, { x: MX, y: px(218), w: CW, colW: colW.slice().reverse(), fontFace: F, autoPage: false });
  s.addText(RLM + fixbidi('¹ תת-התחום התרמי אינו מפורט במקורות · ² מכ״ם — בקווי תעופה / האנגרים בלבד · ³ מכ״ם — טענת חברה, לא אומתה עצמאית · ⁴ המקור מציין "NIR / MIR" · ⁵ חתימת ענן האבק בלבד · ⁶ סיכוך RF / EMI — אינו הפחתת RCS · נתוני עובדים: אומדנים ממאגרי חברות חיצוניים כאשר נמצא בסיס מהימן; אחרת טווחים · נתוני "הערכה" — אומדני צד-שלישי, לא הכנסות מדווחות'),
    Object.assign({ x: MX, y: 6.58, w: CW, h: 0.42, fontFace: F, fontSize: 7.5, color: C.faint, margin: 0, isTextBox: true, lineSpacingMultiple: 1.2, valign: 'top' }, RT));
}

/* ==================== 4. SPECTRUM MATRIX ==================== */
{
  const s = P.addSlide();
  chrome(s, { kicker: 'כיסוי ספקטרלי', pageno: 4,
    title: 'כיסוי אופטי-תרמי הוא המכנה המשותף; יכולת מכ״ם מגיעה משש חברות — חלקה מסויג או ממוקד-יישום',
    src: 'מקור: מאגר תשע החברות של פלסן — פירוט ספקטרלי ברמת מוצר; סיווג צוות הפרויקט' });
  const bd = { pt: 1.2, color: 'FFFFFF' };
  const cell = (t, o) => ({ text: fixruns(t), options: Object.assign({ fontFace: F, fontSize: 10, color: C.text, fill: { color: C.fill }, border: bd, valign: 'middle', margin: 0.04, align: 'center' }, o) });
  const hd = (t, rng) => cell(rng ? [{ text: t, options: { breakLine: true } }, { text: rng, options: { fontSize: 7.5, color: 'C8D0D8', bold: false } }] : t, { fill: { color: C.slate }, color: 'FFFFFF', bold: true, fontSize: 9.5 });
  const co = (n) => cell(n, { bold: true, fontSize: 10.5, align: 'right', rtlMode: true, lang: 'he-IL' });
  // d = filled (documented), o = outline (qualified), fn = footnote digit
  const mark = (kind, fn) => {
    const runs = [];
    if (kind === 'd') runs.push({ text: '■', options: { color: C.petrol, fontSize: 13 } });
    if (kind === 'o') runs.push({ text: '□', options: { color: C.slateMid, fontSize: 14, bold: true } });
    if (fn) runs.push({ text: ' ' + fn, options: { superscript: true, fontSize: 8, color: C.muted } });
    return cell(runs.length ? runs : '', {});
  };
  const row = (n, marks) => [co(n)].concat(marks.map((m) => (m ? mark(m[0], m[1]) : cell('', {}))));
  const rows = [
    [hd('חברה'), hd('אופטי VIS', '≈0.4–0.7µm'), hd('NIR', '≈0.7–1.4µm'), hd('SWIR', '≈1–3µm'), hd('MWIR', '≈3–5µm'), hd('LWIR', '≈8–14µm'), hd('מכ״ם / RCS')],
    row('Ametrine Technologies', [['d'], 0, 0, ['o'], ['o'], [null, 1] && ['x', 1]]),
    row('Eltics / Black Fox', [0, 0, 0, ['d'], ['d'], 0]),
    row('STG Defence', [0, ['d'], ['d'], ['d'], ['d'], ['o', 2]]),
    row('Sterlite Camotech', [['d'], ['d'], 0, ['o'], ['o'], ['o', 3]]),
    row('Advanced Material Development', [0, ['d'], 0, ['d', 4], 0, ['d']]),
    row('CBG Systems', [['d'], 0, 0, ['o'], ['o'], ['d']]),
    row('Ravelin Defense', [['d'], 0, 0, ['o'], ['o'], ['d']]),
    row('Permali', [['d'], 0, 0, 0, 0, ['d', 5]]),
    row('Shieldex', [0, 0, 0, ['o', 6], ['o', 6], ['x', 6]]),
  ];
  const colW = [2.639, 1.611, 1.611, 1.611, 1.611, 1.611, 1.639];
  s.addTable(rows.map((r) => r.slice().reverse()), { x: MX, y: px(224), w: CW, colW: colW.slice().reverse(), fontFace: F, autoPage: false, rowH: [0.48].concat(Array(9).fill(0.42)) });
  s.addText([
    { text: '■', options: { color: C.petrol, fontSize: 12 } },
    { text: ' מתועד במקורות החברה או בתיעוד תוכנית      ' },
    { text: '□', options: { color: C.slateMid, fontSize: 13, bold: true } },
    { text: ' מסויג — תחום תרמי ללא פירוט תת-תחום (מסומן על MWIR ו-LWIR) או כפוף להערה' },
  ], Object.assign({ x: MX, y: 5.98, w: CW, h: 0.26, fontFace: F, fontSize: 10, color: C.muted, margin: 0, isTextBox: true }, RT));
  s.addText(RLM + fixbidi('¹ יכולת מכ״ם / RCS לא מאומתת בחומרי המוצר הנוכחיים · ² מתועד בעיקר בקווי תעופה / האנגרים · ³ טענת חברה, לא אומתה עצמאית · ⁴ המקור מציין "NIR / MIR" · ⁵ חתימת ענן האבק של רק״ם נע בלבד · ⁶ על בסיס יישומי הסתרה של טקסטיל מצופה-מתכת; סיכוך RF / EMI אינו נספר כיכולת מכ״ם / RCS · תחומים מוצגים רק כאשר קיימת עדות מוצר; אין הערכת ביצועים'),
    Object.assign({ x: MX, y: 6.34, w: CW, h: 0.45, fontFace: F, fontSize: 7.5, color: C.faint, margin: 0, isTextBox: true, lineSpacingMultiple: 1.2, valign: 'top' }, RT));
}

/* ==================== 5. PRODUCT-FAMILY LANDSCAPE ==================== */
{
  const s = P.addSlide();
  chrome(s, { kicker: 'מפת מוצרים וטכנולוגיות', pageno: 5,
    title: 'מערכות רכב, רשתות וטקסטיל מרכיבים את עיקר ההיצע; יכולת אקטיבית / אדפטיבית קיימת בשתי חברות בלבד',
    src: 'מקור: מאגר תשע החברות של פלסן (סיווג משפחות מוצר)' });
  const bd = { pt: 1.2, color: 'FFFFFF' };
  const cell = (t, o) => ({ text: fixruns(t), options: Object.assign({ fontFace: F, fontSize: 10, color: C.text, fill: { color: C.fill }, border: bd, valign: 'middle', margin: 0.05, align: 'center' }, o) });
  const hd = (t, c) => cell([{ text: t, options: { breakLine: true } }, { text: c, options: { fontSize: 7.5, color: 'C8D0D8', bold: false } }], { fill: { color: C.slate }, color: 'FFFFFF', bold: true, fontSize: 9, rtlMode: true, lang: 'he-IL' });
  const co = (n, sub) => cell([{ text: n, options: { bold: true, fontSize: 10, breakLine: true } }, { text: RLM + sub, options: { fontSize: 7.5, color: C.muted } }], { align: 'right', rtlMode: true, lang: 'he-IL' });
  const grp = (a, b) => [cell([{ text: a + '   ', options: { bold: true, fontSize: 9.5, color: C.petrol } }, { text: b, options: { fontSize: 8.5, color: C.slateMid } }], { fill: { color: C.petrolTint }, colspan: 7, align: 'right', rtlMode: true, lang: 'he-IL' })];
  const dot = (v) => cell(v ? '■' : '', { color: C.petrol, fontSize: 12 });
  const row = (n, f, flags) => [co(n, f)].concat(flags.map(dot));
  const rows = [
    [cell('חברה', { fill: { color: C.slate }, color: 'FFFFFF', bold: true, fontSize: 9.5, align: 'right', rtlMode: true, lang: 'he-IL' }),
     hd('מערכות הסוואה לרכב', '5 מתוך 9'), hd('רשתות וכיסויים', '5 מתוך 9'), hd('טקסטיל וחומרים', '5 מתוך 9'),
     hd('ציפויים', '3 מתוך 9'), hd('RAM וקומפוזיטים', '2 מתוך 9'), hd('מערכות אקטיביות / אדפטיביות', '2 מתוך 9')],
    grp('ליבת העסק', '— ניהול חתימה הוא עיסוקה המרכזי של החברה'),
    row('Ametrine Technologies', 'Flint™', [1, 1, 1, 1, 0, 0]),
    row('Eltics / Black Fox', 'Black Fox', [1, 0, 0, 0, 0, 1]),
    row('STG Defence', 'Thermal Signature Equipment Shelter', [0, 1, 1, 0, 0, 0]),
    row('Sterlite Camotech', 'MSCN · MCS · IR paints', [1, 1, 1, 1, 0, 0]),
    grp('קו עסקי מרכזי', '— פעילות ניהול חתימה ייעודית בתוך עסק רחב יותר'),
    row('Advanced Material Development', 'CHAM-NIR · ChamIR · ChamEM', [0, 0, 0, 1, 1, 1]),
    row('CBG Systems', 'SolarSigmaShield', [1, 1, 1, 0, 0, 0]),
    row('Ravelin Defense', 'TactiCam™ · Radar Reduction Shrouds', [1, 1, 0, 0, 0, 0]),
    grp('הצעה משיקה', '— ניהול חתימה כיישום של טכנולוגיה משיקה'),
    row('Permali', 'Dust Skirts', [0, 0, 0, 0, 1, 0]),
    row('Shieldex', 'Shieldex® Zell RS CR', [0, 0, 1, 0, 0, 0]),
  ];
  const colW = [2.778, 1.59, 1.59, 1.59, 1.59, 1.59, 1.605];
  s.addTable(rows.map((r) => r.slice().reverse()), { x: MX, y: px(218), w: CW, colW: colW.slice().reverse(), fontFace: F, autoPage: false });
  s.addText('סימון מלא = לחברה מוצרים במשפחת הפתרון, לפי מאגר הפרויקט; מוצרי הדגל מוצגים מתחת לשם כל חברה. הגדרות המשפחות — לפי מדריך הסיווג של הפרויקט.',
    Object.assign({ x: MX, y: 6.66, w: CW, h: 0.25, fontFace: F, fontSize: 8, color: C.faint, margin: 0, isTextBox: true }, RT));
}

/* ========================= 6–14. PROFILES ========================= */
const PROFILES = [
  { pg: 6, group: 'ליבת העסק', title: 'Ametrine Technologies — שחקנית הסוואה ייעודית עם מוצרי פלטפורמה בשטח ופעילות מול לקוחות ממשל בארה״ב',
    snap: ['ישראל / ארה״ב', 'הסוואה וניהול חתימה רב-ספקטרלי', 'ליבת העסק', RLM + 'פרטית — Ametrine Technologies Ltd / Inc.', RLM + '~40', RLM + '$1–15M (הערכות צד-שלישי)'],
    story: [
      [T('חברת ניהול חתימה '), B('ייעודית'), T(' — כל העסק ממוקד בהסוואה רב-ספקטרלית לפלטפורמות ולציוד')],
      [B('Flint™'), T(' — ציפוי / מעטה רב-שכבתי לפלטפורמות ניידות להפחתת החתימה האופטית והתרמית; לצדו כיסויי הסתרה רב-ייעודיים ומערכות ללוחם '), DM('(Poncho Elite, ACCUS — משניים לפוקוס הרכב של סקירה זו)')],
      [T('פעילות מול לקוחות ממשל בארה״ב: '), B('ONR'), T(', זרוע המחקר של צבא ארה״ב (RDECOM) ו-USSOCOM — כולל הזמנה שכללה כיסוי הסוואה ב-2024 וחוזה מו״פ של $18M ב-2025')],
      [T('הפורטפוליו ממוקד אופטי-תרמי; יכולת מכ״ם / RCS לא מאומתת בחומרי המוצר הנוכחיים')],
      [T('רלוונטיות לפלסן: פוקוס דומה בפלטפורמות יבשתיות, בסדר גודל קטן — כ-40 עובדים ומכירות מוערכות של $1–15M')],
    ],
    bands: ['אופטי (VIS)', 'תרמי (IR)'], bandqual: 'תת-התחום התרמי אינו מפורט במקורות; מכ״ם / RCS לא מאומת',
    imgs: { kind: 'hero', items: [['ametrine-flint-jltv.jpg', 'Flint™ על רכב JLTV. מקור: ametrine.tech — ספריית המדיה הרשמית']] },
    tiles: [['לקוחות ממשל בארה״ב', 'ONR, זרוע המחקר של צבא ארה״ב (RDECOM) ו-USSOCOM'],
      ['2024 — הזמנת ONR', 'הזמנה של ≈$250K הכוללת כיסוי הסוואה — אות מוצר ישיר'],
      ['2025 — חוזה מו״פ מ-ONR', '$18M; התכולה לא פורטה פומבית — לא ניתן לייחסו במלואו להסוואה']],
    src: 'מקור: אתר Ametrine הרשמי; רישומי חוזים פדרליים בארה״ב; מאגר תשע החברות של פלסן. טווח ההכנסות — הערכת צד-שלישי.' },
  { pg: 7, group: 'ליבת העסק', title: 'Eltics / Black Fox — ידע ייחודי בהסוואה תרמית אקטיבית; העדויות ברובן היסטוריות והסטטוס הנוכחי אינו ברור',
    snap: ['ישראל', 'טכנולוגיית ניהול חתימה תרמית אקטיבית', 'ליבת העסק', 'פרטית', RLM + '~5', 'אין נתון עדכני מהימן'],
    story: [
      [T('חברה ישראלית קטנה שפיתחה את '), B('Black Fox'), T(' — מערכת הסוואה תרמית '), B('אקטיבית'), T(' לרכב קרבי')],
      [T('לוחות שטח מבוקרים מעצבים את החתימה התרמית הנפלטת בתחומי MWIR ו-LWIR — יכולת אקטיבית שקיימת רק בשתי חברות במיפוי')],
      [T('הודגמה על כלי רכב צבאיים; העדויות הפומביות הן מעידן האב-טיפוס '), DM('(סביב 2012)'), T(' — לא זוהתה פעילות משמעותית מ-2023 ואילך')],
      [T('אין ערוץ מוצר רשמי פעיל; הסטטוס התאגידי והמסחרי הנוכחי אינו ברור')],
    ],
    bands: ['MWIR', 'LWIR'], bandqual: 'לא זוהתה יכולת מכ״ם / RCS', rightTitle: 'מוצר וסטטוס',
    imgs: { kind: 'note', items: [['eltics-blackfox-demo.jpg', 'אב-טיפוס Black Fox עם לוחות תרמיים אקטיביים; בתמונה המשובצת: מבט מצלמה תרמית עם "חתימה מזויפת". תמונה מערוץ עיתונאי צד-שלישי — Soldier Systems Daily (2012)']],
      note: 'עדויות המוצר הפומביות מתרכזות סביב Black Fox וברובן היסטוריות — לא זוהה ערוץ מוצר רשמי פעיל' },
    tiles: [['הדגמות', 'הדגמות שדה על רכב צבאי דווחו בעבר'],
      ['לקוחות', 'אין לקוח מאומת בשטח'],
      ['פעילות אחרונה', 'לא זוהתה פעילות משמעותית מ-2023 ואילך']],
    src: 'מקור: מאגר תשע החברות של פלסן (דיווח פומבי היסטורי). אין אתר רשמי פעיל; התמונה — ערוץ עיתונאי צד-שלישי (Soldier Systems Daily, 2012).' },
  { pg: 8, group: 'ליבת העסק', title: 'STG Defence — הסתרה תרמית מבצעית לפלטפורמות וללוחם; השימוש בשדה הקרב באוקראינה — בדיווח החברה',
    snap: ['אוקראינה', 'הסוואה והגנה מפני גילוי תרמי וראיית לילה', 'ליבת העסק', 'פרטית — הבעלות לא פורסמה', RLM + '51–200', 'אין נתון פומבי מהימן'],
    story: [
      [T('חברה אוקראינית המתמחה בבדים ובמערכות הגנה מפני גילוי תרמי ואמצעי ראיית לילה — מוצריה בשימוש מבצעי בעימות הנוכחי, בדיווח החברה')],
      [B('Thermal Signature Equipment Shelter'), T(' — הסתרה מהירה לרכב, רק״ם, ארטילריה ועמדות; ב-2025 הושק גם פונצ׳ו החתימה התרמית ללוחם')],
      [T('כיסוי ספקטרלי רחב במיפוי: NIR, SWIR, MWIR ו-LWIR; הפחתה הקשורה למכ״ם מתועדת בעיקר בפתרונות תעופה / האנגרים')],
      [T('לקוחות '), DM('(בדיווח החברה)'), T(': הכוחות המזוינים של אוקראינה, כולל כוחות מיוחדים')],
      [T('רלוונטיות לפלסן: חשיפה מבצעית עדכנית לעימות בעצימות גבוהה '), DM('(בדיווח החברה)'), T(', בתוך הגיאוגרפיה שהוגדרה — מזרח אירופה')],
    ],
    bands: ['NIR / SWIR', 'MWIR / LWIR'], bandqual: 'מכ״ם — מתועד בעיקר בקווי תעופה / האנגרים; אינו מורחב לכל מוצרי ההסתרה',
    imgs: { kind: 'pair', items: [['stg-equipment-shelter.jpg', 'Thermal Signature Equipment Shelter. מקור: stg-defence.com'],
      ['stg-thermal-view.jpg', 'מבט מצלמה תרמית על רכב מוסתר. מקור: stg-defence.com']] },
    tiles: [['לקוחות (בדיווח החברה)', 'הכוחות המזוינים של אוקראינה, כולל כוחות מיוחדים'],
      ['2025 — השקת מוצר', 'פונצ׳ו החתימה התרמית הושק והודגם'],
      ['נראות תוכניתית', 'לא זוהתה תוכנית רכש רכב גדולה בשם בעדויות הפומביות שנסקרו']],
    src: 'מקור: אתר STG Defence הרשמי; מאגר תשע החברות של פלסן. השימוש אצל הלקוח — בדיווח החברה.' },
  { pg: 9, group: 'ליבת העסק', title: 'Sterlite Camotech — פורטפוליו הסוואה פסיבית רחב וניסיון אספקה מדווח לזרועות הביטחון בהודו',
    snap: ['הודו', 'ציוד הסוואה צבאי — רשתות, מערכות רכב וצבעים', 'ליבת העסק', 'פרטית', RLM + '26–50', 'אין נתון פומבי מהימן'],
    story: [
      [T('יצרנית הודית של ציוד הסוואה צבאי '), DM('(הוקמה 2016, פרידאבאד)'), T(' — רשתות, מערכות רכב וצבעים')],
      [T('רשתות '), B('MSCN'), T(' רב-ספקטרליות — מוצר הדגל; '), B('MCS'), T(' — הסוואה ניידת מותקנת-פלטפורמה; וצבעי הסוואה IR')],
      [T('כיסוי אופטי, NIR ותרמי; יכולת מכ״ם — טענת חברה שלא אומתה עצמאית')],
      [T('לקוחות '), DM('(בדיווח החברה)'), T(': חיל האוויר והצבא ההודי, כוחות פרה-צבאיים ומתקני DRDO; ייצוא מדווח לבריטניה, מלזיה ומצרים')],
      [T('ב-2025 השתתפה ברכש של הצבא ההודי לרשתות רב-ספקטרליות — זכייה והיקף לא פורסמו')],
    ],
    bands: ['אופטי (VIS)', 'NIR', 'תרמי (IR)'], bandqual: 'מכ״ם — טענת חברה, לא אומתה עצמאית; תת-התחום התרמי אינו מפורט',
    imgs: { kind: 'pair', items: [['sterlite-mscn-net.jpg', 'רשת הסוואה רב-ספקטרלית — MSCN. מקור: sterlitecamotech.com'],
      ['sterlite-paint-application.jpg', 'יישום צבע הסוואה. מקור: sterlitecamotech.com']] },
    tiles: [['לקוחות (בדיווח החברה)', 'חיל האוויר והצבא בהודו, כוחות פרה-צבאיים ומתקני DRDO'],
      ['2025 — רכש', 'השתתפות ברכש הצבא ההודי לרשתות רב-ספקטרליות; זכייה / היקף לא פורסמו'],
      ['2024 — תיעוד', 'חוברת החברה מתעדת ניסיון אספקה ביטחוני']],
    src: 'מקור: אתר Sterlite Camotech וחוברת החברה; מאגר תשע החברות של פלסן. הכנסות הושמטו — אומדנים פומביים סותרים.' },
  { pg: 10, group: 'קו עסקי מרכזי', title: 'Advanced Material Development — חומרים אדפטיביים לחתימת IR ומכ״ם בשלב ניסויים ביטחוניים; טרם נפרסו בשטח',
    snap: ['ארה״ב / בריטניה', 'ננו-חומרים וציפויים מתקדמים — הביטחון הוא אחד מכמה שווקים', 'קו עסקי מרכזי', RLM + 'פרטית — AMD Ltd (בריטניה); AMD Inc. (ארה״ב)', RLM + '~15', 'אין נתון פומבי מהימן'],
    story: [
      [T('חברת ננו-חומרים בריטית שצמחה מאוניברסיטת סאסקס, עם זרוע ביטחונית אמריקאית שהושקה ב-2025')],
      [T('משפחת Cham: ציפוי אדפטיבי '), B('CHAM-NIR'), T(', בקרת חתימה תרמית '), B('ChamIR'), T(', וחומרי '), B('ChamEM'), T(' להפחתת חתימת מכ״ם — יישום מכ״ם אמיתי, לא סיכוך EMI')],
      [T('נבחנה במסגרות אמריקאיות: פעילות FCT של צבא ארה״ב / OSD בזיקה ל-ChamEM; ניסויי NPS JIFX 25-4 לציפויים אדפטיביים '), DM('(2025)')],
      [T('שלב בשלות: פיתוח / ניסויים — לא זוהתה פריסה רחבה בשטח')],
      [T('צוות קטן '), DM('(כ-15 עובדים)'), T(' — פורטפוליו חוצה-תחומים שטרם הוצג כמערכת משולבת אחת')],
    ],
    bands: ['NIR / MWIR', 'מכ״ם / EM'], bandqual: 'המקורות מציינים "NIR / MIR"; הפורטפוליו טרם נפרס כמערכת אחת',
    imgs: { kind: 'hero', items: [['amd-chamir-news.jpg', 'הודעת הפטנט של ChamIR — תמונת החדשות הרשמית. מקור: amdnano-usa.com — חדשות']] },
    tiles: [['ניסויים ואימות', 'פעילות FCT של צבא ארה״ב / OSD בזיקה ל-ChamEM; ניסויי NPS JIFX 25-4 לציפויים אדפטיביים (2025)'],
      ['2025 — דריסת רגל בארה״ב', 'הושקה חברת-בת ביטחונית אמריקאית — מחזקת גישה לתוכניות; אינה כשלעצמה הזמנת לקוח'],
      ['בשלות', 'שלב פיתוח / ניסויים; לא זוהתה פריסה רחבה בשטח']],
    src: 'מקור: אתר AMD הרשמי; תיעוד NPS JIFX; מאגרי חברות חיצוניים (מצבת עובדים); מאגר תשע החברות של פלסן.' },
  { pg: 11, group: 'קו עסקי מרכזי', title: 'CBG Systems — מערכת הסוואת רכב רב-ספקטרלית עם זכייה תוכניתית, בתוך עסק ימי-ביטחוני רחב',
    snap: ['אוסטרליה', 'בידוד ימי, מערכות הגנה מאש וניהול חתימה ביטחוני', 'קו עסקי מרכזי', RLM + 'פרטית — CBG Systems Pty Ltd', RLM + '~20', RLM + '≈$6M (הערכת צד-שלישי)'],
    story: [
      [T('חברה אוסטרלית ותיקה '), DM('(40+ שנים; הובארט ואדלייד)'), T(' — בידוד ימי ומערכות הגנה מאש, עם ניהול חתימה כקו עסקי ייעודי')],
      [B('SolarSigmaShield'), T(' — הסוואת פלטפורמה רב-שכבתית מותאמת: אופטי, תרמי ומכ״ם בפתרון רכב משולב אחד; לצדה רשתות רב-ספקטרליות ומערכת ללוחם')],
      [T('2024 — נבחרה לספק את המערכת עבור ה-'), B('Redback IFV'), T(' בתוכנית LAND 400 Phase 3; הלקוח: Hanwha Defence Australia')],
      [T('זיקה תוכניתית נוספת: כלי ה-AS9 / AS10 בתוכנית LAND 8116')],
      [T('צוות קטן '), DM('(כ-20 עובדים; מכירות ≈$6M בהערכת צד-שלישי)'), T(' — יכולת תוכניתית גבוהה ביחס לגודל')],
    ],
    bands: ['אופטי (VIS)', 'תרמי (IR)', 'מכ״ם'], bandqual: 'תת-התחום התרמי אינו מפורט במקורות',
    imgs: { kind: 'pair', items: [['cbg-redback-solarsigmashield.jpg', 'מערכת SolarSigmaShield על גבי Redback IFV. מקור: cbgsystems.com — הודעת LAND 400 Phase 3'],
      ['cbg-solarsigmashield-vehicle.jpg', 'SolarSigmaShield על רכב. מקור: cbgsystems.com — Mobile Camouflage']] },
    tiles: [['2024 — LAND 400 Phase 3', 'נבחרה לספק SolarSigmaShield עבור ה-Redback IFV — לקוח בשם, תוכנית רק״ם מרכזית'],
      ['לקוח', 'Hanwha Defence Australia — הלקוח בתוכנית LAND 400 Phase 3'],
      ['זיקה תוכניתית נוספת', 'נקשרה לכלי ה-AS9 / AS10 בתוכנית LAND 8116']],
    src: 'מקור: אתר CBG Systems הרשמי (ניהול חתימה; הודעת LAND 400 Phase 3). ההכנסות — הערכת צד-שלישי, לא דיווח חברה.' },
  { pg: 12, group: 'קו עסקי מרכזי', title: 'Ravelin Defense — ניהול חתימה כיחידה ייעודית בקבוצת שרידות אמריקאית שהשלימה איחוד ב-2026',
    snap: ['ארה״ב', 'שרידות ביטחונית — מיגון, מושבים ממוגנים, ניהול חתימה וייצור מתכת', 'קו עסקי מרכזי', RLM + 'חברת פורטפוליו של Littlejohn Capital', RLM + '201–500', 'לא מאומת לאחר האיחוד'],
    story: [
      [T('נוצרה מאיחוד '), B('ArmorWorks'), T(' — שלושה עשורים של פתרונות שרידות '), DM('(מיגון, הגנת צוות, שיכוך הדף)'), T(' — ו-'), B('Fox Valley Metal Tech'), T(', יצרנית מתכת מדויקת לתוכניות הצי האמריקאי')],
      [T('Littlejohn Capital רכשה את ArmorWorks בדצמבר 2014; ArmorWorks רכשה את FVMT ב-2024; ביוני 2026 אוחדו החברות תחת המותג '), B('Ravelin Defense')],
      [T('ניהול החתימה נשמר כיחידה עסקית ייעודית: '), B('TactiCam™'), T(' — הסוואת רכב תלת-ממדית עמידה, ולצדה כיסויים להפחתת חתימת מכ״ם')],
      [T('TactiCam הודגמה על פלטפורמות רכב של General Dynamics; בסיס הלקוחות הרחב כולל את צבא ארה״ב וקבלניות-על — לא כולו מיוחס לניהול חתימה')],
      [T('הכנסות לאחר האיחוד טרם דווחו; נתון ArmorWorks ההיסטורי אינו מיוחס ל-Ravelin')],
    ],
    bands: ['VIS / IR', 'מכ״ם'], bandqual: 'התחומים הספקטרליים המדויקים אינם מפורטים פומבית',
    imgs: { kind: 'pair', items: [['ravelin-tacticam-hmmwv.jpg', 'TactiCam™ בגוון מדברי על HMMWV. מקור: ravelindefense.com — Signature Management'],
      ['ravelin-tacticam-closeup.jpg', 'משטח TactiCam™ תלת-ממדי מקרוב (AUSA 2025). מקור: ravelindefense.com']] },
    tiles: [['הדגמות', 'TactiCam הודגמה על פלטפורמות רכב יבשתיות של General Dynamics'],
      ['2026 — איחוד', 'ArmorWorks ו-Fox Valley Metal Tech אוחדו תחת Ravelin Defense; ניהול החתימה נשמר כיחידה ייעודית'],
      ['בסיס לקוחות', 'הלקוחות הרחבים כוללים את צבא ארה״ב וקבלניות-על — לא כולם מיוחסים לניהול חתימה']],
    src: 'מקור: אתר Ravelin Defense והודעות רשמיות; מאגר תשע החברות של פלסן. הכנסות ArmorWorks ההיסטוריות אינן מיוחסות ל-Ravelin.' },
  { pg: 13, group: 'הצעה משיקה', title: 'Permali — קומפוזיטים ביטחוניים עם יישום חתימה מבוסס: דיכוי ענן האבק של רק״ם בתנועה',
    snap: ['בריטניה', 'קומפוזיטים מתקדמים לביטחון ולשווקים הנדסיים', 'הצעה משיקה', RLM + 'קבוצת Diamorph (נרכשה 2021)', RLM + '~270', RLM + 'מחזור מדווח £30M'],
    story: [
      [T('יצרנית קומפוזיטים בריטית ותיקה '), DM('(גלוסטר)'), T('; נרכשה על-ידי קבוצת Diamorph ב-2021')],
      [B('Dust Skirts / Dust Guards'), T(' — מותקנים סביב רק״ם לדיכוי ענן האבק הנראה בתנועה ולהפחתת חתימת המכ״ם של ענן האבק — הפחתת חתימה עקיפה, לא RAM קלאסי')],
      [T('ההצעה נשענת על ידע הקומפוזיטים הביטחוני של החברה — הצעת הליבה היא הנדסת חומרים, לא הסוואה')],
      [T('סדר גודל: מחזור מדווח של £30M; כ-270 עובדים '), DM('(מאגרי חברות; פרסומי הקבוצה מציינים ~370)')],
      [T('לא זוהתה פעילות ייעודית חדשה בניהול חתימה מ-2023 ואילך — הצעה משיקה מבוססת')],
    ],
    bands: ['אופטי (VIS)', 'מכ״ם'], bandqual: 'חתימת ענן האבק בלבד; אין טענה תרמית רחבה',
    imgs: { kind: 'hero', items: [['permali-dust-guards.jpg', 'Dust Guards — איור המוצר הרשמי. מקור: permali.co.uk — Land Defence Composites / Dust Skirts']] },
    tiles: [['סדר גודל (מדווח)', 'מחזור ≈£30M; כ-270 עובדים (מאגרי חברות; פרסומי הקבוצה: ~370)'],
      ['בעלות', 'נרכשה על-ידי קבוצת Diamorph ב-2021'],
      ['פעילות אחרונה', 'לא זוהתה פעילות ייעודית בניהול חתימה מ-2023 ואילך — הצעה משיקה מבוססת']],
    src: 'מקור: אתר Permali הרשמי; פרסומי Diamorph; מאגרי חברות חיצוניים; מאגר תשע החברות של פלסן.' },
  { pg: 14, group: 'הצעה משיקה', title: 'Shieldex — פלטפורמת טקסטיל מוליך שנעה ליישומים ביטחוניים רב-ספקטרליים כחומר מאפשר',
    snap: ['גרמניה', 'טקסטיל טכני מוליך ומצופה-מתכת', 'הצעה משיקה', RLM + 'עסק משפחתי — Statex GmbH', RLM + '~50', RLM + '≈$31M (הערכת צד-שלישי)'],
    story: [
      [T('עסק משפחתי גרמני '), DM('(Statex, ברמן; המותג — Shieldex)'), T(' — מוביל עולמי בחוטים ובדים מצופי כסף מאז 1978')],
      [B('Shieldex® Zell RS CR'), T(' — טקסטיל מצופה-מתכת המשמש ביישומי הסתרה וסיכוך צבאיים — חומר מאפשר, לא מערכת הסוואת רכב שלמה')],
      [T('2024 — מיצוב משפחת פתרונות '), B('Multispectral Shielding'), T(' ייעודית לשוק הצבאי — אות שוק, לא חוזה שנחשף')],
      [T('הבחנה מהותית: סיכוך RF / EMI אינו הפחתת חתך מכ״ם (RCS) — לא אומתה טענת RCS ברמת מוצר')],
      [T('לא זוהה לקוח צבאי עדכני בשמו בתחום ניהול החתימה')],
    ],
    bands: ['תרמי (IR)', 'סיכוך RF / EMI'], bandqual: 'סיכוך EMI / RF אינו הפחתת חתך מכ״ם (RCS); לא אומתה טענת RCS ברמת מוצר',
    imgs: { kind: 'pair', items: [['shieldex-metallized-textile.jpg', 'טקסטיל מצופה-מתכת — תצוגת מוצר. מקור: shieldex.de — Multispectral Shielding'],
      ['shieldex-shielding-tent.jpg', 'אוהל סיכוך RF / EMI — יישום סיכוך. מקור: shieldex.de — Multispectral Shielding']] },
    tiles: [['2024 — מיצוב', 'משפחת פתרונות Multispectral Shielding ייעודית לשוק הצבאי — אות שוק, לא חוזה שנחשף'],
      ['לקוחות', 'לא זוהה לקוח צבאי עדכני בשמו בתחום ניהול החתימה'],
      ['חוזק הפלטפורמה', 'מומחיות סיכוך RF / EMI מבוססת ביישומים תעשייתיים וביטחוניים']],
    src: 'מקור: אתר Shieldex הרשמי; מאגרי חברות חיצוניים; מאגר תשע החברות של פלסן. ההכנסות — הערכת צד-שלישי.' },
];

for (const p of PROFILES) {
  const s = P.addSlide();
  chrome(s, { kicker: 'פרופיל חברה · ' + p.group, pageno: p.pg, title: p.title, src: p.src });
  // snapshot table (reversed: מדינה renders rightmost)
  const bd = { pt: 1.2, color: 'FFFFFF' };
  const th = (t) => ({ text: t, options: { fontFace: F, fontSize: 9, bold: true, color: 'FFFFFF', fill: { color: C.petrol }, border: bd, margin: 0.06, align: 'right', rtlMode: true, lang: 'he-IL' } });
  const td = (t) => ({ text: fixruns(t), options: { fontFace: F, fontSize: 9.5, color: C.text, fill: { color: C.fill }, border: bd, valign: 'top', margin: 0.07, align: 'right', rtlMode: true, lang: 'he-IL' } });
  const heads = ['מדינה', 'עיסוק עיקרי', 'חשיבות ניהול החתימה', 'בעלות', 'עובדים', 'הכנסות'];
  const colW = [1.458, 3.056, 1.667, 2.778, 1.181, 2.193];
  s.addTable([heads.map(th).reverse(), p.snap.map(td).reverse()],
    { x: MX, y: px(228), w: CW, colW: colW.slice().reverse(), fontFace: F, autoPage: false });
  // right column: the story
  const SW = 6.25, SX = W - MX - SW, py0 = px(366);
  secBarR(s, 'הסיפור בקצרה', W - MX, py0, SW);
  story(s, SX, py0 + 0.42, SW, 2.06, p.story);
  const by = py0 + 2.56;
  s.addText('תחומי חתימה', Object.assign({ x: W - MX - 1.3, y: by + 0.03, w: 1.3, h: 0.24, fontFace: F, fontSize: 9.5, bold: true, color: C.muted, margin: 0, isTextBox: true }, RT));
  let bx = W - MX - 1.42;
  for (const b of p.bands) bx -= chipR(s, b, bx, by) + 0.1;
  if (p.bandqual) s.addText(RLM + fixbidi(p.bandqual), Object.assign({ x: SX, y: by + 0.38, w: SW, h: 0.2, fontFace: F, fontSize: 8.5, color: C.faint, margin: 0, isTextBox: true, fit: 'shrink' }, RT));
  // left column: images
  const IW = CW - SW - 0.31, IX = MX;
  secBarR(s, p.rightTitle || 'מוצר ויישום', IX + IW, py0, IW);
  const iy = py0 + 0.42, ih = 2.62;
  if (p.imgs.kind === 'hero') {
    ifig(s, p.imgs.items[0][0], p.imgs.items[0][1], IX, iy, IW, ih);
  } else if (p.imgs.kind === 'pair') {
    const fw = (IW - 0.14) / 2;
    ifig(s, p.imgs.items[0][0], p.imgs.items[0][1], IX + fw + 0.14, iy, fw, ih); // first item on the right
    ifig(s, p.imgs.items[1][0], p.imgs.items[1][1], IX, iy, fw, ih);
  } else { // note layout (Eltics)
    ifig(s, p.imgs.items[0][0], p.imgs.items[0][1], IX, iy, IW, 1.82);
    s.addShape('rect', { x: IX, y: iy + 1.94, w: IW, h: 0.68, fill: { color: C.fill } });
    s.addText([{ text: 'סטטוס', options: { fontSize: 8, bold: true, color: C.faint, breakLine: true } },
               { text: fixbidi(p.imgs.note), options: { fontSize: 9.5, color: C.text } }],
      Object.assign({ x: IX + 0.14, y: iy + 2.0, w: IW - 0.28, h: 0.58, fontFace: F, margin: 0, isTextBox: true, valign: 'top', lineSpacingMultiple: 1.12, fit: 'shrink' }, RT));
  }
  // evidence tiles (first tile renders rightmost)
  const EY = 5.68;
  secBarR(s, 'עדות מסחרית', W - MX, EY, CW);
  const TW = 4.0, GAP = px(24);
  p.tiles.forEach(([lbl, txt], i) => {
    const tx = W - MX - TW - i * (TW + GAP);
    s.addShape('rect', { x: tx, y: EY + 0.4, w: TW, h: 0.035, fill: { color: C.petrol } });
    s.addShape('rect', { x: tx, y: EY + 0.435, w: TW, h: 0.9, fill: { color: C.fill } });
    s.addText([{ text: fixbidi(lbl), options: { fontSize: 9, bold: true, color: C.petrol, breakLine: true } },
               { text: RLM + fixbidi(txt), options: { fontSize: 9, color: C.text } }],
      Object.assign({ x: tx + 0.15, y: EY + 0.5, w: TW - 0.3, h: 0.8, fontFace: F, margin: 0, isTextBox: true, valign: 'top', lineSpacingMultiple: 1.1, fit: 'shrink' }, RT));
  });
}

P.writeFile({ fileName: path.join(__dirname, '..', 'deck.pptx') }).then(() => console.log('deck.pptx written'));
