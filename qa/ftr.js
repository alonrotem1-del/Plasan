const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(await p.evaluate(() => {
    const o = [];
    document.querySelectorAll('.slide').forEach((s, i) => {
      const src = s.querySelector('.ftr .src'); if (!src) return;
      const lines = Math.round(src.getBoundingClientRect().height / (20 * 1.3));
      if (lines > 1) o.push((i + 1) + '  ' + s.id + '  lines=' + lines + '  h=' + src.getBoundingClientRect().height.toFixed(0));
    });
    return o.join('\n') || 'all footer source lines fit on one line';
  }));
  await b.close();
})();
