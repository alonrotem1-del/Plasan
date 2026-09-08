const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  console.log(await p.evaluate(() => {
    const meas = document.createElement('div');
    meas.style.cssText = 'position:absolute;left:-99999px;top:0;visibility:hidden;';
    document.body.appendChild(meas);
    const out = [];
    const lis = document.querySelectorAll('#s-cbg ul.story li');
    lis.forEach((li, i) => {
      const cs = getComputedStyle(li);
      const fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight) / fs;
      const rng = document.createRange(); rng.selectNodeContents(li);
      const r = rng.getBoundingClientRect();
      const d = document.createElement('div');
      d.style.cssText = 'width:' + (r.width + 2) + 'px;line-height:' + lh + ';direction:rtl;text-align:right;font-family:Arial,"Liberation Sans",sans-serif;white-space:normal;';
      const pd = document.createElement('div');
      pd.innerHTML = li.innerHTML;
      pd.style.fontSize = fs + 'px';
      d.appendChild(pd); meas.appendChild(d);
      out.push(`li${i}: rangeH ${Math.round(r.height)} rangeW ${Math.round(r.width)} liH ${Math.round(li.getBoundingClientRect().height)} measH ${Math.round(d.getBoundingClientRect().height)} fs ${fs} lh ${lh.toFixed(3)}`);
      meas.removeChild(d);
    });
    return out.join('\n');
  }));
  await b.close();
})();
