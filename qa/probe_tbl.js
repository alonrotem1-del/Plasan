const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.resolve('deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(200);
  const r = await page.evaluate(() => {
    const out = {};
    for (const [id, sels] of Object.entries({ 's-table': ['.ovw-table', '.ovw-note', '.hdr'], 's-spectrum': ['.sx-table', '.sx-legend', '.sx-notes'], 's-landscape': ['.mx-table', '.mx-note'], 's-plasan-fit': ['.cmp-table', '.hdr'] })) {
      const s = document.querySelector('#' + id); if (!s) continue; const sr = s.getBoundingClientRect();
      out[id] = {};
      for (const sel of sels) { const el = s.querySelector(sel); if (!el) continue; const b = el.getBoundingClientRect(); out[id][sel] = [Math.round(b.top - sr.top), Math.round(b.bottom - sr.top)]; }
    }
    return out;
  });
  console.log(JSON.stringify(r)); await browser.close();
})();
