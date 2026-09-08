const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(JSON.stringify(await p.evaluate(() => {
    const o = [];
    document.querySelectorAll('.slide').forEach((s) => {
      const m = s.querySelector('.profile-main'); if (!m) return;
      const sr = s.getBoundingClientRect();
      const R = (e) => e ? { t: Math.round(e.getBoundingClientRect().top - sr.top),
                             b: Math.round(e.getBoundingClientRect().bottom - sr.top) } : null;
      o.push({ id: s.id, above: R(s.querySelector('.tlrow')) || R(s.querySelector('.snap')),
               main: R(m), ev: R(s.querySelector('.pf-evidence')),
               ftr: Math.round(s.querySelector('.ftr').getBoundingClientRect().top - sr.top) });
    });
    return o;
  })));
  await b.close();
})();
