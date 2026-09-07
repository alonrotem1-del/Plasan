const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.resolve('deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(200);
  const r = await page.evaluate(() => {
    const s = document.querySelector('#s-sterlite'); const sr = s.getBoundingClientRect();
    const out = [];
    s.querySelectorAll('.snap tr').forEach((tr,i)=>{ tr.querySelectorAll('th,td').forEach(td=>{ const b=td.getBoundingClientRect(); out.push([i, Math.round(b.width), Math.round(b.height), td.textContent.trim().slice(0,25)]); }); });
    const g = (sel) => { const el = s.querySelector(sel); if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.top - sr.top), Math.round(b.bottom - sr.top)]; };
    return { cells: out, main: g('.profile-main'), ev: g('.pf-evidence'), list: g('.ev-list'), relv: g('.relv'), hdr: g('.hdr') };
  });
  console.log(JSON.stringify(r, null, 0)); await browser.close();
})();
