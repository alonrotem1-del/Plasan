const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  const r = await p.evaluate(() => [...document.querySelectorAll('.slide')].map((s, i) => {
    const h = s.querySelector('.hdr'); if (!h) return null;
    const t = s.querySelector('h1.title');
    return { n: i + 1, id: s.id, b: Math.round(h.getBoundingClientRect().bottom - s.getBoundingClientRect().top),
             fs: t ? getComputedStyle(t).fontSize : '-', lines: t ? Math.round(t.getBoundingClientRect().height / parseFloat(getComputedStyle(t).lineHeight)) : 0 };
  }).filter(Boolean));
  r.forEach(x => console.log(`s${String(x.n).padStart(2)} ${(x.id||'').padEnd(14)} hdrBottom ${String(x.b).padStart(3)}  title ${x.fs} ${x.lines} lines`));
  await b.close();
})();
