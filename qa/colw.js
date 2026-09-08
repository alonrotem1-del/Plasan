const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(await p.evaluate(() => {
    const s = document.getElementById('s-cbg'), m = s.querySelector('.profile-main');
    const o = [];
    for (const w of [900, 940, 980, 1020, 1060, 1110]) {
      m.style.gridTemplateColumns = w + 'px 1fr';
      const st = s.querySelector('.pf-story'), im = s.querySelector('.pf-imgs');
      const deep = (c) => { const cr = c.getBoundingClientRect(); let d = 0;
        c.querySelectorAll('*').forEach((e) => { const r = e.getBoundingClientRect(); if (r.height > 0 && r.bottom - cr.top > d) d = r.bottom - cr.top; }); return Math.round(d); };
      o.push(`w=${w}  story ${deep(st)}  imgs ${deep(im)}  main ${Math.round(m.getBoundingClientRect().height)}`);
    }
    return o.join('\n');
  }));
  await b.close();
})();
