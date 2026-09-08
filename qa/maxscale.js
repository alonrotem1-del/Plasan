/* Per-slide: largest uniform scale of the current type sizes that still fits. */
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  const only = process.argv.slice(2).map(Number);
  const out = await p.evaluate((only) => {
    const slides = [...document.querySelectorAll('.slide')];
    const res = [];
    slides.forEach((s, i) => {
      if (only.length && !only.includes(i + 1)) return;
      const els = [...s.querySelectorAll('*')].filter((e) => !e.closest('.ftr'));
      const base = els.map((e) => parseFloat(getComputedStyle(e).fontSize));
      const minBase = Math.min(...base.filter((x) => x > 0));
      const reset = () => els.forEach((e) => { e.style.fontSize = ''; });
      const fits = () => {
        const sr = s.getBoundingClientRect();
        const ftr = s.querySelector('.ftr');
        const lim = ftr.getBoundingClientRect().top - sr.top - 4;
        let deep = 0;
        s.querySelectorAll('*').forEach((el) => {
          if (el.closest('.ftr')) return;
          const st = getComputedStyle(el);
          if (st.display === 'none' || st.visibility === 'hidden') return;
          const r = el.getBoundingClientRect(); if (r.width <= 0 || r.height <= 0) return;
          const bt = r.bottom - sr.top; if (bt > deep) deep = bt;
        });
        return { ok: deep <= lim, deep: Math.round(deep), lim: Math.round(lim) };
      };
      let best = null, info = null;
      for (let k = 1.0; k >= 0.68; k -= 0.01) {
        reset();
        els.forEach((e, j) => { if (base[j] > 0) e.style.fontSize = (base[j] * k).toFixed(2) + 'px'; });
        const f = fits();
        if (f.ok) { best = k; info = f; break; }
        if (!info) info = f;
      }
      reset();
      res.push({ n: i + 1, id: s.id, k: best, minBase, info });
    });
    return res;
  }, only);
  out.forEach((r) => console.log(`s${String(r.n).padStart(2)} ${(r.id||'').padEnd(13)} maxScale ${r.k ? r.k.toFixed(2) : 'n/a'}  => min font ${r.k ? (r.minBase * r.k).toFixed(1) + 'px (' + (r.minBase * r.k / 2).toFixed(2) + 'pt)' : '-'}   [deep ${r.info.deep} lim ${r.info.lim}]`));
  await b.close();
})();
