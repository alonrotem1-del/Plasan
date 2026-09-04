/* Render + automated visual QA for the Plasan prototype deck.
 * Usage: node qa/render.js [--no-pdf]
 * Outputs screenshots/slide-N.png, deck.pdf, and a QA report on stdout. */
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const noPdf = process.argv.includes('--no-pdf');
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const url = 'file://' + path.resolve(__dirname, '..', 'deck.html') + '?flat=1';
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);

  const report = await page.evaluate(() => {
    const out = [];
    const visible = (el) => {
      const st = getComputedStyle(el);
      if (st.display === 'none' || st.visibility === 'hidden' || +st.opacity === 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    document.querySelectorAll('.slide').forEach((slide, i) => {
      const issues = [];
      const sr = slide.getBoundingClientRect();
      // 1. canvas overflow
      if (slide.scrollWidth > 1920 + 1 || slide.scrollHeight > 1080 + 1)
        issues.push(`canvas scroll overflow: ${slide.scrollWidth}x${slide.scrollHeight}`);
      // 2. elements escaping slide bounds (slide has overflow:hidden => clipped content)
      slide.querySelectorAll('*').forEach((el) => {
        if (!visible(el)) return;
        const r = el.getBoundingClientRect();
        const tol = 1.5;
        if (r.left < sr.left - tol || r.right > sr.right + tol || r.top < sr.top - tol || r.bottom > sr.bottom + tol) {
          issues.push(`escapes slide: <${el.tagName.toLowerCase()} class="${el.className}"> ` +
            `[${Math.round(r.left - sr.left)},${Math.round(r.top - sr.top)} ${Math.round(r.width)}x${Math.round(r.height)}] "${(el.textContent || '').trim().slice(0, 40)}"`);
        }
      });
      // 3. horizontal text clipping inside elements
      slide.querySelectorAll('*').forEach((el) => {
        if (!visible(el) || el.children.length > 0) return;
        if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2) {
          const st = getComputedStyle(el);
          if (st.overflow !== 'visible' || el.clientWidth === 0) return;
          issues.push(`clipped text in <${el.tagName.toLowerCase()} class="${el.className}">: scroll ${el.scrollWidth}x${el.scrollHeight} vs client ${el.clientWidth}x${el.clientHeight} "${(el.textContent || '').trim().slice(0, 40)}"`);
        }
      });
      // 4. tiny fonts
      const sizes = new Map();
      slide.querySelectorAll('*').forEach((el) => {
        if (!visible(el)) return;
        const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!hasText) return;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        sizes.set(fs, (sizes.get(fs) || 0) + 1);
        if (fs < 15) issues.push(`font ${fs}px too small: "${(el.textContent || '').trim().slice(0, 40)}"`);
      });
      // 5. footer collision: lowest non-footer content vs footer top
      const ftr = slide.querySelector('.ftr');
      if (ftr) {
        const ft = ftr.getBoundingClientRect().top;
        slide.querySelectorAll(':scope > *:not(.ftr) *, :scope > *:not(.ftr)').forEach((el) => {
          if (!visible(el) || ftr.contains(el)) return;
          const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
          if (!hasText) return;
          const r = el.getBoundingClientRect();
          if (r.bottom > ft + 1)
            issues.push(`content crosses footer line: "${(el.textContent || '').trim().slice(0, 40)}" bottom=${Math.round(r.bottom - sr.top)} footerTop=${Math.round(ft - sr.top)}`);
        });
      }
      // 6. absolute-block collisions: profile-main / tables vs the section below them
      const below = slide.querySelector('.pf-evidence');
      if (below) {
        const bt = below.getBoundingClientRect().top;
        const main = slide.querySelector('.profile-main');
        if (main) {
          let low = 0, lowEl = '';
          main.querySelectorAll('*').forEach((el) => {
            if (!visible(el)) return;
            const r = el.getBoundingClientRect();
            if (r.bottom > low) { low = r.bottom; lowEl = (el.textContent || '').trim().slice(0, 40); }
          });
          if (low > bt - 6) issues.push(`profile-main crowds evidence section: lowest="${lowEl}" bottom=${Math.round(low - sr.top)} evidenceTop=${Math.round(bt - sr.top)}`);
        }
      }
      const snap = slide.querySelector('.snap');
      const pmain = slide.querySelector('.profile-main');
      if (snap && pmain && snap.getBoundingClientRect().bottom > pmain.getBoundingClientRect().top - 4)
        issues.push(`snapshot table crowds profile-main: snapBottom=${Math.round(snap.getBoundingClientRect().bottom - sr.top)} mainTop=${Math.round(pmain.getBoundingClientRect().top - sr.top)}`);
      const hdr = slide.querySelector('.hdr');
      if (hdr) {
        const hb = [...hdr.querySelectorAll('*')].filter(visible).reduce((m, el) => Math.max(m, el.getBoundingClientRect().bottom), 0);
        const first = slide.querySelector('.snap, .ovw-table, .mx-table, .sx-table, .scope-grid, .funnel-zone');
        if (first && hb > first.getBoundingClientRect().top - 4)
          issues.push(`header crowds first content block: hdrBottom=${Math.round(hb - sr.top)} contentTop=${Math.round(first.getBoundingClientRect().top - sr.top)}`);
      }
      [['.ovw-table', '.ovw-note'], ['.mx-table', '.mx-note'], ['.sx-table', '.sx-legend'], ['.sx-legend', '.sx-notes'], ['.scope-grid', '.method-band'], ['.method-band', '.fun-strip']].forEach(([a, b]) => {
        const ea = slide.querySelector(a), eb = slide.querySelector(b);
        if (ea && eb && ea.getBoundingClientRect().bottom > eb.getBoundingClientRect().top - 4)
          issues.push(`${a} collides with ${b}`);
      });
      out.push({
        slide: i + 1,
        issues,
        fontSizes: [...sizes.entries()].sort((a, b) => a[0] - b[0]).map(([s, n]) => `${s}px×${n}`).join(', '),
      });
    });
    return out;
  });

  for (const r of report) {
    console.log(`--- SLIDE ${r.slide} ---`);
    console.log(`font sizes used: ${r.fontSizes}`);
    if (r.issues.length === 0) console.log('no automated issues found');
    r.issues.forEach((x) => console.log('ISSUE: ' + x));
  }

  const slides = await page.$$('.slide');
  for (let i = 0; i < slides.length; i++) {
    await slides[i].screenshot({ path: path.resolve(__dirname, '..', 'screenshots', `slide-${i + 1}.png`) });
  }
  console.log(`screenshots: ${slides.length} written`);

  if (!noPdf) {
    await page.emulateMedia({ media: 'print' });
    await page.pdf({
      path: path.resolve(__dirname, '..', 'deck.pdf'),
      preferCSSPageSize: true,
      printBackground: true,
    });
    console.log('deck.pdf written');
  }
  await browser.close();
})();
