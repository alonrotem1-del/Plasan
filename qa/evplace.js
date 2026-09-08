const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(JSON.stringify(await p.evaluate(() => {
    const o = [];
    document.querySelectorAll('.slide').forEach((s) => {
      const e = s.querySelector('.pf-evidence.ev-wide'); if (!e) return;
      const sr = s.getBoundingClientRect();
      const hdr = s.querySelector('.hdr').getBoundingClientRect().bottom - sr.top;
      const ftr = s.querySelector('.ftr').getBoundingClientRect().top - sr.top;
      o.push({ id: s.id, h: Math.round(e.getBoundingClientRect().height),
               hdr: Math.round(hdr), ftr: Math.round(ftr),
               top: Math.round(e.getBoundingClientRect().top - sr.top) });
    });
    return o;
  })));
  await b.close();
})();
