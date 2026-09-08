const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  const r = await p.evaluate(() => {
    const o = [];
    document.querySelectorAll('.slide').forEach((s, i) => {
      const sr = s.getBoundingClientRect();
      const R = (e) => { const b = e.getBoundingClientRect();
        return { t: Math.round(b.top - sr.top), b: Math.round(b.bottom - sr.top), h: Math.round(b.height) }; };
      const g = (sel) => { const e = s.querySelector(sel); return e ? R(e) : null; };
      const f = s.querySelector('.ftr');
      const main = s.querySelector('.profile-main');
      const cols = main ? [...main.children].map((c) => {
        const cr = c.getBoundingClientRect(); let deep = 0;
        c.querySelectorAll('*').forEach((d) => { const dr = d.getBoundingClientRect();
          if (dr.height > 0 && dr.bottom - cr.top > deep) deep = dr.bottom - cr.top; });
        return { cls: (c.className || c.tagName).slice(0, 18), ...R(c), content: Math.round(deep) }; }) : [];
      const tl = g('.tlrow');
      o.push({ n: i + 1, id: s.id, snap: g('.snap'), tl, main: g('.profile-main'), cols,
               ev: g('.pf-evidence'), ftr: f ? Math.round(f.getBoundingClientRect().top - sr.top) : 1080 });
    });
    return o;
  });
  for (const s of r) {
    if (!s.main) continue;
    const f = (x) => x ? `${x.t}→${x.b}` : '-';
    console.log(`s${String(s.n).padStart(2)} ${(s.id||'').padEnd(12)} snap ${f(s.snap)} tl ${f(s.tl)} main ${f(s.main)} ev ${f(s.ev)} ftr ${s.ftr}`);
    console.log('      cols: ' + s.cols.map((c) => `${c.cls}=${c.content}`).join('  '));
    const need = (s.main.h) + 14 + (s.ev ? s.ev.h : 0);
    const avail = s.ftr - 6 - ((s.tl ? s.tl.b : s.snap.b) + 14);
    console.log(`      need ${need}  avail ${avail}  ${need > avail ? 'DEFICIT ' + (need - avail) : 'slack ' + (avail - need)}`);
  }
  await b.close();
})();
