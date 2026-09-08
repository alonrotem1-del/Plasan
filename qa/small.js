const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(await p.evaluate((id) => {
    const s = document.getElementById(id), o = [];
    s.querySelectorAll('*').forEach((el) => {
      if (el.closest('.ftr')) return;
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 24) o.push(fs + 'px  <' + el.tagName.toLowerCase() + ' class="' + el.className + '">  "' +
        (el.textContent || '').trim().slice(0, 42) + '"');
    });
    return o.join('\n') || 'none below 24px';
  }, process.argv[2]));
  await b.close();
})();
