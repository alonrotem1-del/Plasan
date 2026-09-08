const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  const out = await p.evaluate(() => {
    const cases = [
      { id: 's-table', v: '--ovw-k', tbl: '.ovw-table', note: '.ovw-note' },
      { id: 's-landscape', v: '--mx-k', tbl: '.mx-table', note: '.mx-note' },
      { id: 's-plasan-fit', v: '--cmp-k', tbl: '.cmp-table', note: null },
    ];
    const res = [];
    for (const c of cases) {
      const s = document.getElementById(c.id), sr = s.getBoundingClientRect();
      const ftr = s.querySelector('.ftr').getBoundingClientRect().top - sr.top;
      let best = null, info = null;
      for (let k = 1.0; k >= 0.6; k -= 0.0025) {
        s.style.setProperty(c.v, String(k.toFixed(4)));
        const t = s.querySelector(c.tbl).getBoundingClientRect();
        const tb = t.bottom - sr.top;
        const n = c.note ? s.querySelector(c.note).getBoundingClientRect() : null;
        const nh = n ? Math.round(n.height) : 0;
        const total = c.note ? tb + 10 + nh : tb;
        if (total <= ftr - 8) { best = k; info = { tb: Math.round(tb), nh, total: Math.round(total), ftr: Math.round(ftr) }; break; }
        if (!info) info = { tb: Math.round(tb), nh, total: Math.round(total), ftr: Math.round(ftr) };
      }
      s.style.removeProperty(c.v);
      res.push({ id: c.id, k: best, info });
    }
    return res;
  });
  out.forEach((r) => console.log(`${r.id.padEnd(14)} k=${r.k ? r.k.toFixed(3) : 'none'}  minFont ${r.k ? (20 * r.k).toFixed(1) + 'px = ' + (10 * r.k).toFixed(2) + 'pt' : '-'}  [tableBottom ${r.info.tb} note ${r.info.nh} total ${r.info.total} ftr ${r.info.ftr}]`));
  await b.close();
})();
