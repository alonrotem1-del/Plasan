/* Per-slide: highest analytical font floor (px) at which the slide still fits
 * above its footer.  Usage: node qa/maxfloor.js */
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  const out = await p.evaluate(async () => {
    const slides = [...document.querySelectorAll('.slide')];
    // remember originals
    const orig = new Map();
    slides.forEach((s) => s.querySelectorAll('*').forEach((el) => orig.set(el, el.style.fontSize)));
    const fits = (s) => {
      const sr = s.getBoundingClientRect();
      const ftr = s.querySelector('.ftr');
      const lim = ftr ? ftr.getBoundingClientRect().top - sr.top - 4 : 1076;
      let deep = 0;
      s.querySelectorAll('*').forEach((el) => {
        if (el.closest('.ftr')) return;
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden') return;
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) return;
        const bt = r.bottom - sr.top; if (bt > deep) deep = bt;
      });
      return { ok: deep <= lim, deep: Math.round(deep), lim: Math.round(lim) };
    };
    const res = [];
    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      let best = null, bestInfo = null;
      for (const F of [26, 25, 24, 23, 22, 21.5, 21, 20.5, 20, 19.5, 19, 18.5, 18, 17.5, 17, 16, 15]) {
        s.querySelectorAll('*').forEach((el) => { el.style.fontSize = orig.get(el) || ''; });
        s.querySelectorAll('*').forEach((el) => {
          if (el.closest('.ftr')) return;
          const fs = parseFloat(getComputedStyle(el).fontSize);
          if (fs && fs < F) el.style.fontSize = F + 'px';
        });
        const f = fits(s);
        if (f.ok) { best = F; bestInfo = f; break; }
        if (!bestInfo) bestInfo = f;
      }
      s.querySelectorAll('*').forEach((el) => { el.style.fontSize = orig.get(el) || ''; });
      res.push({ n: i + 1, id: s.id, best, info: bestInfo });
    }
    return res;
  });
  out.forEach((r) => console.log(`s${String(r.n).padStart(2)} ${(r.id||'').padEnd(13)} max floor ${r.best === null ? '<15' : r.best + 'px (' + (r.best / 2) + 'pt)'}   [deep ${r.info.deep} lim ${r.info.lim}]`));
  await b.close();
})();
