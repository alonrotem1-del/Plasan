const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve('/home/user/Plasan/deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(await p.evaluate(() => {
    const o = [];
    ['.ovw-note', '.mx-note'].forEach((q) => { const e = document.querySelector(q); const cs = getComputedStyle(e);
      o.push(q + ' cols=' + cs.columnCount + ' w=' + Math.round(e.getBoundingClientRect().width) + ' h=' + Math.round(e.getBoundingClientRect().height) + ' sh=' + e.scrollHeight + ' display=' + cs.display); });
    return o.join('\n');
  }));
  await b.close();
})();
