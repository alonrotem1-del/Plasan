const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(await p.evaluate((id) => {
    const s = document.getElementById(id), sb = s.getBoundingClientRect(), o = [];
    s.querySelectorAll(':scope > *').forEach((el) => {
      const r = el.getBoundingClientRect();
      o.push((el.className || el.tagName).toString().padEnd(22) +
        ' top=' + Math.round(r.top - sb.top) + '  bot=' + Math.round(r.bottom - sb.top) + '  h=' + Math.round(r.height));
    });
    return o.join('\n');
  }, process.argv[2]));
  await b.close();
})();
