/* Ideal .ifig height = padding + caption + the image's own aspect at the
 * figure's rendered width, capped by the room the slide actually has. */
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(JSON.stringify(await p.evaluate(async () => {
    const nat = async (url) => new Promise((res) => {
      const im = new Image(); im.onload = () => res(im.naturalWidth / im.naturalHeight);
      im.onerror = () => res(1.5); im.src = url;
    });
    const out = [];
    for (const s of document.querySelectorAll('.slide')) {
      const im = s.querySelector('.pf-imgs'); if (!im) continue;
      const st = s.querySelector('.pf-story');
      const deep = (c) => { const cr = c.getBoundingClientRect(); let d = 0;
        c.querySelectorAll('*').forEach((e) => { const r = e.getBoundingClientRect();
          if (r.height > 0 && r.bottom - cr.top > d) d = r.bottom - cr.top; }); return Math.round(d); };
      const ftr = s.querySelector('.ftr').getBoundingClientRect().top - s.getBoundingClientRect().top;
      const m = s.querySelector('.profile-main').getBoundingClientRect().top - s.getBoundingClientRect().top;
      const figs = [];
      for (const f of im.querySelectorAll('.ifig')) {
        const url = getComputedStyle(f.querySelector('.iimg')).backgroundImage.slice(5, -2);
        const ar = await nat(url);
        const cs = getComputedStyle(f);
        const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + 2;
        const capEl = f.querySelector('.icap2');
        const cap = capEl.getBoundingClientRect().height + parseFloat(getComputedStyle(capEl).marginTop);
        const w = f.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        figs.push({ cur: Math.round(f.getBoundingClientRect().height),
                    ideal: Math.round(pad + cap + Math.min(w / ar, w * 0.75)) });
      }
      out.push({ id: s.id, story: deep(st), imgs: deep(im),
                 room: Math.round(ftr - 10 - m), figs });
    }
    return out;
  })));
  await b.close();
})();
