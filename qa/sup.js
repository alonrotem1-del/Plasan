const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(await p.evaluate(() => {
    const s = document.getElementById('s-table'), t = s.querySelector('.ovw-table');
    const H = () => Math.round(t.getBoundingClientRect().height);
    const rows = () => [...t.querySelectorAll('tr')].map((r) => Math.round(r.getBoundingClientRect().height)).join(',');
    const o = [];
    s.style.setProperty('--ovw-k', 0.75);
    o.push('k=.75 base           H=' + H() + '  [' + rows() + ']');
    s.querySelectorAll('sup').forEach((e) => e.style.fontSize = '15px');
    o.push('k=.75 sup15          H=' + H() + '  [' + rows() + ']');
    s.querySelectorAll('td,th').forEach((e) => e.style.padding = '3px 9px');
    o.push('k=.75 sup15+pad3/9   H=' + H() + '  [' + rows() + ']');
    return o.join('\n');
  }));
  await b.close();
})();
