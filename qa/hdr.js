const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(await p.evaluate(() => {
    const o = [];
    for (const w of [1440, 1470, 1490, 1510, 1530]) {
      document.querySelectorAll('.hdr-titles').forEach((e) => e.style.maxWidth = w + 'px');
      let mx = 0, worst = '';
      document.querySelectorAll('.slide').forEach((s) => {
        const h = s.querySelector('.hdr'); if (!h) return;
        const bt = h.getBoundingClientRect().bottom - s.getBoundingClientRect().top;
        if (bt > mx) { mx = bt; worst = s.id; }
      });
      o.push(`maxWidth ${w}: deepest header bottom ${Math.round(mx)} (${worst})`);
    }
    return o.join('\n');
  }));
  await b.close();
})();
