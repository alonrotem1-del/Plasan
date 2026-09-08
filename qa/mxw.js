const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(await p.evaluate(() => {
    const s = document.getElementById('s-landscape-b'), t = s.querySelector('.mx-table');
    const cols = [...t.querySelectorAll('col')];
    const o = [];
    for (const w of [620, 680, 740, 800, 840, 880]) {
      const rest = Math.floor((1776 - w) / 3);
      cols[0].style.width = w + 'px';
      for (let i = 1; i < 4; i++) cols[i].style.width = rest + 'px';
      o.push(`co=${w} rest=${rest}  tableH ${Math.round(t.getBoundingClientRect().height)}`);
    }
    return o.join('\n');
  }));
  await b.close();
})();
