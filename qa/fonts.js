const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  const r = await p.evaluate(() => [...document.querySelectorAll('.slide')].map((s, i) => {
    const A = [], F = [];
    s.querySelectorAll('*').forEach((el) => {
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden') return;
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
      const fs = parseFloat(st.fontSize);
      (el.closest('.ftr') ? F : A).push(fs);
    });
    return { n: i + 1, id: s.id, aMin: A.length ? Math.min(...A) : null, aMax: A.length ? Math.max(...A) : null,
             fMin: F.length ? Math.min(...F) : null, n: i + 1 };
  }));
  let gA = 99, gF = 99;
  r.forEach((x) => { if (x.aMin) gA = Math.min(gA, x.aMin); if (x.fMin) gF = Math.min(gF, x.fMin);
    console.log(`s${String(x.n).padStart(2)} ${(x.id||'').padEnd(13)} analytical min ${x.aMin.toFixed(2)}px = ${(x.aMin/2).toFixed(2)}pt   footer/src min ${x.fMin.toFixed(1)}px = ${(x.fMin/2).toFixed(1)}pt`); });
  console.log(`\nDECK analytical floor ${gA.toFixed(2)}px = ${(gA/2).toFixed(2)}pt | source floor ${gF.toFixed(1)}px = ${(gF/2).toFixed(1)}pt`);
  await b.close();
})();
