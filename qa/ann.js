const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(await p.evaluate(() => {
    const s = document.getElementById('s-mm-activity');
    const dp = s.querySelector('.mm-duo .dp'), r = dp.getBoundingClientRect();
    const out = ['plot box x=' + Math.round(r.left) + '..' + Math.round(r.right) + ' y=' + Math.round(r.top) + '..' + Math.round(r.bottom)];
    [...s.querySelectorAll('.mm-duo .dc')].slice(0, 3).forEach((c, i) => {
      [...c.querySelectorAll('.b')].forEach((bar) => {
        const br = bar.getBoundingClientRect(), lr = bar.querySelector('.bl').getBoundingClientRect();
        out.push('  col' + i + ' ' + bar.className.replace('b ', '') + ' bar x=' + Math.round(br.left - r.left) + '..' + Math.round(br.right - r.left) +
          ' top=' + Math.round(br.top - r.top) + '   label y=' + Math.round(lr.top - r.top) + '..' + Math.round(lr.bottom - r.top));
      });
    });
    const a = s.querySelector('.mm-ann').getBoundingClientRect();
    out.push('  annotation x=' + Math.round(a.left - r.left) + '..' + Math.round(a.right - r.left) + ' y=' + Math.round(a.top - r.top) + '..' + Math.round(a.bottom - r.top));
    return out.join('\n');
  }));
  await b.close();
})();
