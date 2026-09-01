const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.resolve('deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const rows = await page.evaluate(() => {
    const t = document.querySelector('.ovw-table');
    return [...t.querySelectorAll('tr')].map(tr => ({
      h: Math.round(tr.getBoundingClientRect().height),
      cls: tr.className,
      txt: tr.textContent.trim().replace(/\s+/g,' ').slice(0, 50),
      cellHeights: [...tr.children].map(td => {
        // which cell content is tallest?
        const probe = document.createRange();
        probe.selectNodeContents(td);
        return Math.round(probe.getBoundingClientRect().height);
      }),
    }));
  });
  rows.forEach(r => console.log(String(r.h).padStart(4), JSON.stringify(r.cellHeights), r.cls, r.txt));
  await browser.close();
})();
