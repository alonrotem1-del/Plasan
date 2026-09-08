const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(await p.evaluate((k) => {
    const s = document.getElementById('s-table');
    if (k) s.style.setProperty('--ovw-k', k);
    const t = s.querySelector('.ovw-table');
    const tr = [...t.querySelectorAll('tr')][2];
    return 'rowH=' + Math.round(tr.getBoundingClientRect().height) + '\n' +
      [...tr.querySelectorAll('td')].map((c, i) => {
        const cs = getComputedStyle(c);
        return `  c${i} w${Math.round(c.getBoundingClientRect().width)} h${Math.round(c.getBoundingClientRect().height)} f${cs.fontSize} lh${cs.lineHeight} pad${cs.padding} "${(c.textContent||'').trim().slice(0,26)}"`;
      }).join('\n');
  }, process.argv[2] || null));
  await b.close();
})();
