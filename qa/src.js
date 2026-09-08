const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  const r = await p.evaluate(() => [...document.querySelectorAll('.slide')].map((s, i) => {
    const src = s.querySelector('.ftr .src'), f = s.querySelector('.ftr');
    return { n: i + 1, id: s.id, tall: s.classList.contains('tall-ftr'),
             fh: f ? Math.round(f.getBoundingClientRect().height) : 0,
             sh: src ? Math.round(src.getBoundingClientRect().height) : 0,
             lines: src ? Math.round(src.getBoundingClientRect().height / (parseFloat(getComputedStyle(src).lineHeight) || 26)) : 0 };
  }));
  r.forEach((x) => console.log(`s${String(x.n).padStart(2)} ${(x.id||'').padEnd(12)} tall=${x.tall?'Y':'n'} ftrH ${x.fh}  srcH ${x.sh}  lines ~${x.lines}`));
  await b.close();
})();
