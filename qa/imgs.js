const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(await p.evaluate(() => {
    const o = [];
    document.querySelectorAll('.iimg, img').forEach((e) => {
      const r = e.getBoundingClientRect();
      const s = e.tagName === 'IMG' ? e.getAttribute('src') : getComputedStyle(e).backgroundImage;
      if (r.width < 2 || r.height < 2) o.push('ZERO ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' ' + (e.closest('.slide')||{id:'?'}).id);
    });
    const figs = [...document.querySelectorAll('.ifig')].map((f) => ({ id: (f.closest('.slide')||{}).id, h: Math.round(f.getBoundingClientRect().height), ih: Math.round(f.querySelector('.iimg').getBoundingClientRect().height) }));
    return o.join('\n') + '\n--- figures ---\n' + figs.map(f => `${f.id} ifig ${f.h} iimg ${f.ih}`).join('\n');
  }));
  await b.close();
})();
