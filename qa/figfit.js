const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(JSON.stringify(await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('.slide').forEach((s) => {
      const m = s.querySelector('.profile-main'); if (!m) return;
      const st = s.querySelector('.pf-story'), im = s.querySelector('.pf-imgs');
      if (!st || !im) return;
      const deep = (c) => { const cr = c.getBoundingClientRect(); let d = 0;
        c.querySelectorAll('*').forEach((e) => { const r = e.getBoundingClientRect();
          if (r.height > 0 && r.bottom - cr.top > d) d = r.bottom - cr.top; }); return Math.round(d); };
      const rows = [...im.querySelectorAll('.figrow')].length ||
                   [...im.querySelectorAll(':scope > .ifig')].length;
      const figs = [...im.querySelectorAll('.ifig')].map((f) => ({
        h: Math.round(f.getBoundingClientRect().height),
        cap: Math.round(f.querySelector('.icap2').getBoundingClientRect().height) }));
      const ftr = s.querySelector('.ftr').getBoundingClientRect().top - s.getBoundingClientRect().top;
      const mTop = m.getBoundingClientRect().top - s.getBoundingClientRect().top;
      out.push({ id: s.id, story: deep(st), imgs: deep(im), figRows: rows, figs,
                 room: Math.round(ftr - 10 - mTop) });
    });
    return out;
  })));
  await b.close();
})();
