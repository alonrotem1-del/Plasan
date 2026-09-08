const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  const r = await p.evaluate(() => [...document.querySelectorAll('.slide')].map((s, i) => {
    const h = s.querySelector('.hdr'); if (!h) return null;
    return { n: i + 1, id: s.id, b: Math.round(h.getBoundingClientRect().bottom - s.getBoundingClientRect().top) };
  }).filter(Boolean));
  const mx = Math.max(...r.map(x => x.b));
  console.log('deepest header bottom', mx, '->', r.filter(x => x.b === mx).map(x => x.id).join(', '));
  await b.close();
})();
