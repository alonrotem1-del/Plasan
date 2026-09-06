const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.resolve('/home/user/Plasan/deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const s = document.getElementById('s-ravelin');
    const sr = s.getBoundingClientRect();
    const out = {};
    for (const sel of ['.snap', '.tlrow', '.profile-main', '.pf-story', 'ul.story', '.pf-bands', '.pf-bandqual', '.mixp', '.relv', '.pf-evidence']) {
      const el = s.querySelector(sel);
      if (el) { const b = el.getBoundingClientRect(); out[sel] = [Math.round(b.top - sr.top), Math.round(b.bottom - sr.top)]; }
    }
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  await browser.close();
})();
