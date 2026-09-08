const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const id = process.argv[2];
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  const r = await p.evaluate((id) => {
    const s = document.getElementById(id); const sr = s.getBoundingClientRect(); const o = [];
    ['.pf-story', '.pf-imgs', '.pf-evidence'].forEach((sel) => {
      const c = s.querySelector(sel); if (!c) return;
      o.push({ d: 0, cls: sel, t: Math.round(c.getBoundingClientRect().top - sr.top), h: Math.round(c.getBoundingClientRect().height) });
      [...c.children].forEach((k) => { const kr = k.getBoundingClientRect();
        o.push({ d: 1, cls: (k.className || k.tagName), t: Math.round(kr.top - sr.top), h: Math.round(kr.height) });
        if (k.tagName === 'UL') [...k.children].forEach((li) => { const lr = li.getBoundingClientRect();
          o.push({ d: 2, cls: 'li', t: Math.round(lr.top - sr.top), h: Math.round(lr.height) }); });
      });
    });
    return o;
  }, id);
  r.forEach((x) => console.log('  '.repeat(x.d) + String(x.cls).slice(0, 30).padEnd(32) + ' top ' + String(x.t).padStart(4) + '  h ' + String(x.h).padStart(4)));
  await b.close();
})();
