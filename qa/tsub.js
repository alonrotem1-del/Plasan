const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(await p.evaluate(() => {
    const s = document.getElementById('s-mm-scale');
    return [...s.querySelectorAll('.mm-scale')].slice(1)[0].querySelectorAll('.tile').length + ' tiles\n' +
      [...s.querySelectorAll('.tile.pipe')].map(t => {
        const sub = t.querySelector('.tsub'), r = sub.getBoundingClientRect();
        return Math.round(r.height) + 'px  ' + Math.round(r.width) + 'w  ' + sub.textContent.trim().slice(0, 40);
      }).join('\n');
  }));
  await b.close();
})();
