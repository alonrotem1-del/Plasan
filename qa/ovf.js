const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(await p.evaluate((id) => {
    const s = document.getElementById(id), o = [];
    s.querySelectorAll('.sp, .hp, .dp').forEach((c) => {
      const cr = c.getBoundingClientRect();
      c.querySelectorAll(':scope > *').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < cr.top - 1) o.push('OVERFLOW ' + (el.className || el.tagName) + ' by ' + Math.round(cr.top - r.top) + 'px above its plot');
      });
    });
    return o.join('\n') || 'no bar/label overflows its plot area';
  }, process.argv[2]));
  await b.close();
})();
