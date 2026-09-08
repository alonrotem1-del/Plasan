const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(await p.evaluate(() => {
    const s = document.getElementById('s-table'), sr = s.getBoundingClientRect();
    const rows = [];
    for (const k of [1, 0.95, 0.9, 0.85, 0.8, 0.78, 0.76, 0.75, 0.72, 0.7, 0.68, 0.65, 0.62]) {
      s.style.setProperty('--ovw-k', k);
      const t = s.querySelector('.ovw-table');
      const tb = t.getBoundingClientRect();
      const n = s.querySelector('.ovw-note').getBoundingClientRect();
      const trs = [...t.querySelectorAll('tr')].map((r) => Math.round(r.getBoundingClientRect().height));
      rows.push(`k=${k}  tableH ${Math.round(tb.height)}  bottom ${Math.round(tb.bottom - sr.top)}  noteH ${Math.round(n.height)}  rows[${trs.join(',')}]`);
    }
    s.style.removeProperty('--ovw-k');
    return rows.join('\n');
  }));
  await b.close();
})();
