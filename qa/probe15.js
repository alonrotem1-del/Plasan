const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.resolve('deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(200);
  const r = await page.evaluate(() => {
    const s = document.querySelector("#s-shieldex"); const sr = s.getBoundingClientRect();
    const g = (sel) => { const el = s.querySelector(sel); if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.top - sr.top), Math.round(b.bottom - sr.top)]; };
    return { snap: g('.snap'), main: g('.profile-main'), story: g('ul.story'), bands: g('.pf-bands'), imgs: g('.pf-imgs'), ev: g('.pf-evidence'), list: g('.ev-list') };
  });
  console.log(JSON.stringify(r)); await browser.close();
})();
