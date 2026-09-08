/* Largest k per dense slide, with the note re-placed just under its table. */
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(await p.evaluate(() => {
    const cases = [['s-table', '--ovw-k', '.ovw-table', '.ovw-note'],
                   ['s-landscape', '--mx-k', '.mx-table', '.mx-note'],
                   ['s-plasan-fit', '--cmp-k', '.cmp-table', null]];
    const out = [];
    for (const [id, v, tbl, note] of cases) {
      const s = document.getElementById(id), sr = s.getBoundingClientRect();
      const ftr = s.querySelector('.ftr').getBoundingClientRect().top - sr.top;
      let best = null, info = null;
      for (let k = 1.0; k >= 0.6; k -= 0.005) {
        s.style.setProperty(v, String(k.toFixed(3)));
        const t = s.querySelector(tbl).getBoundingClientRect();
        const tb = t.bottom - sr.top;
        const nh = note ? s.querySelector(note).getBoundingClientRect().height : 0;
        const total = note ? tb + 14 + nh : tb;
        if (total <= ftr - 8) {
          const cell = s.querySelector(tbl + ' td');
          best = k;
          info = { px: parseFloat(getComputedStyle(cell).fontSize), tb: Math.round(tb),
                   nh: Math.round(nh), noteTop: Math.round(tb + 14) };
          break;
        }
      }
      s.style.removeProperty(v);
      out.push(`${id.padEnd(14)} k=${best ? best.toFixed(3) : 'none'}  cell ${info ? info.px.toFixed(1) + 'px = ' + (info.px / 2).toFixed(2) + 'pt' : '-'}  tableBottom ${info ? info.tb : '-'}  note h${info ? info.nh : 0} -> top ${info ? info.noteTop : '-'}`);
    }
    return out.join('\n');
  }));
  await b.close();
})();
