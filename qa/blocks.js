const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  const sels = process.argv.slice(3);
  const r = await p.evaluate(({ id, sels }) => {
    const s = document.getElementById(id), sr = s.getBoundingClientRect(), o = [];
    sels.forEach((q) => { const e = s.querySelector(q); if (!e) { o.push([q, 'MISSING']); return; }
      const b = e.getBoundingClientRect();
      o.push([q, Math.round(b.top - sr.top) + '→' + Math.round(b.bottom - sr.top) + ' (h' + Math.round(b.height) + ')']); });
    const f = s.querySelector('.ftr'); o.push(['.ftr', Math.round(f.getBoundingClientRect().top - sr.top)]);
    return o;
  }, { id: process.argv[2], sels });
  r.forEach((x) => console.log(x[0].padEnd(18), x[1]));
  await b.close();
})();
