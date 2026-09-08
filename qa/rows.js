const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(await p.evaluate((sel) => {
    const t = document.querySelector(sel);
    const cs = getComputedStyle(t.querySelector('td'));
    return 'H=' + Math.round(t.getBoundingClientRect().height) + ' tdFont=' + cs.fontSize + ' lh=' + cs.lineHeight + ' pad=' + cs.padding +
      '\nrows: ' + [...t.querySelectorAll('tr')].map((r) => Math.round(r.getBoundingClientRect().height)).join(',') +
      '\nrow2 cells: ' + [...t.querySelectorAll('tr')][2].querySelectorAll('td').length +
      ' widths ' + [...[...t.querySelectorAll('tr')][2].querySelectorAll('td')].map((c) => Math.round(c.getBoundingClientRect().width)).join(',');
  }, process.argv[2]));
  await b.close();
})();
