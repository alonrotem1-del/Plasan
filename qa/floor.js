/* Feasibility probe: raise every analytical font below FLOOR px and measure
 * how much vertical space each slide would then need. Usage: node qa/floor.js 24 */
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const FLOOR = parseFloat(process.argv[2] || '24');
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1',
                  { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  const res = await page.evaluate((FLOOR) => {
    // 1. raise the floor on every element that is not footer/source chrome
    document.querySelectorAll('.slide *').forEach((el) => {
      if (el.closest('.ftr')) return;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs && fs < FLOOR) el.style.fontSize = FLOOR + 'px';
    });
    const out = [];
    document.querySelectorAll('.slide').forEach((slide, i) => {
      const sr = slide.getBoundingClientRect();
      const ftr = slide.querySelector('.ftr');
      const limit = ftr ? ftr.getBoundingClientRect().top - sr.top : 1080;
      let deepest = 0, worstEl = '', sumOv = 0, worstOv = 0, worstOvEl = '';
      slide.querySelectorAll('*').forEach((el) => {
        if (el.closest('.ftr')) return;
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden') return;
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) return;
        const b = r.bottom - sr.top;
        if (b > deepest) { deepest = b; worstEl = el.className || el.tagName; }
        const ov = el.scrollHeight - el.clientHeight;
        if (ov > 2 && st.overflow === 'visible' && el.clientHeight > 0) {
          sumOv += ov;
          if (ov > worstOv) { worstOv = ov; worstOvEl = (el.className || el.tagName) + ' :: ' + (el.textContent || '').trim().slice(0, 30); }
        }
      });
      out.push({ n: i + 1, limit: Math.round(limit), deepest: Math.round(deepest),
                 over: Math.round(deepest - limit), worstEl: String(worstEl).slice(0, 40),
                 worstOv, worstOvEl });
    });
    return out;
  }, FLOOR);
  console.log('FLOOR ' + FLOOR + 'px (' + (FLOOR / 2) + 'pt)');
  console.log('slide  footerTop  deepest  overshoot  worst-overflow-element');
  for (const r of res)
    console.log(String(r.n).padStart(5), String(r.limit).padStart(10), String(r.deepest).padStart(8),
                String(r.over).padStart(10), '  ', r.worstOv ? (r.worstOv + 'px ' + r.worstOvEl) : '-');
  const bad = res.filter(r => r.over > 0);
  console.log('\nslides overflowing footer: ' + bad.length + '/18   total overshoot ' +
              bad.reduce((a, b) => a + b.over, 0) + 'px   max ' +
              (bad.length ? Math.max(...bad.map(b => b.over)) : 0) + 'px');
  await browser.close();
})();
