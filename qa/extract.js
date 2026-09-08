// Extract the rendered deck into a structural op-list for PPTX generation.
// Text stays logical-order (bidi is re-applied by PowerPoint), geometry comes
// from the real layout, tables stay tables.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = process.argv[2] || '/tmp/pptx';
fs.mkdirSync(path.join(OUT, 'img'), { recursive: true });

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.resolve('deck.html') + '?flat=1', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  const data = await page.evaluate(async () => {
    const R = (v) => Math.round(v * 100) / 100;
    const imgs = new Map();     // dataURI -> {id, w, h}
    const natural = new Map();  // dataURI -> {w,h}

    async function measure(uri) {
      if (natural.has(uri)) return natural.get(uri);
      const d = await new Promise((res) => {
        const im = new Image();
        im.onload = () => res({ w: im.naturalWidth, h: im.naturalHeight });
        im.onerror = () => res({ w: 0, h: 0 });
        im.src = uri;
      });
      natural.set(uri, d);
      return d;
    }
    function imgId(uri) {
      if (!imgs.has(uri)) imgs.set(uri, { id: 'i' + imgs.size, uri });
      return imgs.get(uri).id;
    }
    function col(c) {
      if (!c) return null;
      const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
      if (!m) return null;
      if (m[4] !== undefined && parseFloat(m[4]) < 0.05) return null;
      const h = (n) => ('0' + Math.round(parseFloat(n)).toString(16)).slice(-2);
      return (h(m[1]) + h(m[2]) + h(m[3])).toUpperCase();
    }
    const isInlineDisp = (d) => d.startsWith('inline') || d === 'contents';
    const TXT = (n) => n.textContent.replace(/[ \t\n\r]+/g, ' ');
    const hasText = (n) => n.textContent.replace(/[\s‎‏]/g, '') !== '';

    // ---- Arial fit measurement ------------------------------------------
    const meas = document.createElement('div');
    meas.style.cssText = 'position:absolute;left:-99999px;top:0;visibility:hidden;';
    document.body.appendChild(meas);
    function measH(paras, w, lh, rtl, al, scale, ff) {
      const d = document.createElement('div');
      d.style.cssText = 'width:' + Math.max(4, w) + 'px;line-height:' + lh +
        ';direction:' + (rtl ? 'rtl' : 'ltr') + ';text-align:' + al +
        ';font-family:' + (ff || 'Arial,"Liberation Sans",sans-serif') + ';white-space:normal;';
      for (const para of paras) {
        const pd = document.createElement('div');
        for (const r of para) {
          const sp = document.createElement('span');
          sp.textContent = r.txt;
          sp.style.fontSize = (r.sz * scale) + 'px';
          if (r.b) sp.style.fontWeight = '700';
          if (r.sup) sp.style.verticalAlign = 'super';
          if (r.ltr) sp.setAttribute('dir', 'ltr');
          pd.appendChild(sp);
        }
        if (!para.length) pd.innerHTML = '&nbsp;';
        d.appendChild(pd);
      }
      meas.appendChild(d);
      const h = d.getBoundingClientRect().height;
      const sw = d.scrollWidth;
      meas.removeChild(d);
      return { h: h, w: sw };
    }
    function fitScale(paras, w, h, lh, rtl, al, checkW, ff) {
      if (!paras.length || h < 2) return 1;
      const lim = h + Math.max(2, h * 0.04);
      for (const sc of [1, 0.97, 0.94, 0.91, 0.88, 0.85, 0.82, 0.78]) {
        const m = measH(paras, w, lh, rtl, al, sc, ff);
        if (m.h <= lim && (!checkW || m.w <= w + 1)) return sc;
      }
      return 0.78;
    }

    function markerOf(el, base) {
      // empty inline element painted as a square/dot
      const cs = getComputedStyle(el);
      if (hasText(el)) return null;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return null;
      const fill = col(cs.backgroundColor);
      const bw = parseFloat(cs.borderTopWidth) || 0;
      const bc = col(cs.borderTopColor);
      if (!fill && !(bw > 0 && bc)) return null;
      const rad = parseFloat(cs.borderTopLeftRadius) || 0;
      return {
        t: 'rect', x: R(r.left - base.left), y: R(r.top - base.top), w: R(r.width), h: R(r.height),
        fill, line: bw > 0 && bc ? { c: bc, w: R(bw) } : null,
        rad: rad > 0 ? Math.min(0.5, rad / Math.min(r.width, r.height)) : 0,
      };
    }

    // ---- runs -------------------------------------------------------------
    function runsOf(nodes, ops, base) {
      const paras = [[]];
      function spacer(px, fs, refEl) {
        const n = Math.max(1, Math.round(px / (0.278 * fs)));
        const cs = getComputedStyle(refEl);
        paras[paras.length - 1].push({
          txt: '\u00a0'.repeat(n), sz: R(fs), b: false, c: col(cs.color) || '000000', sup: 0, ltr: 0,
        });
      }
      function push(node, ltr) {
        if (node.nodeType === 3) {
          const t = TXT(node);
          if (t === '') return;
          const el = node.parentElement;
          const cs = getComputedStyle(el);
          const va = cs.verticalAlign;
          const dirEl = el.closest('[dir]');
          const isLtr = ltr > 0 || (dirEl && dirEl.getAttribute('dir') === 'ltr');
          paras[paras.length - 1].push({
            txt: t,
            sz: R(parseFloat(cs.fontSize)),
            b: parseInt(cs.fontWeight, 10) >= 600,
            c: col(cs.color) || '000000',
            sup: va === 'super' ? 1 : (va === 'sub' ? -1 : 0),
            ltr: isLtr ? 1 : 0,
          });
          return;
        }
        if (node.nodeType !== 1) return;
        if (node.tagName === 'BR') { paras.push([]); return; }
        const cs = getComputedStyle(node);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const mk = markerOf(node, base);
        if (mk) {
          ops.push(mk);
          const pf = parseFloat(getComputedStyle(node.parentElement).fontSize) || 16;
          const adv = node.getBoundingClientRect().width +
            (parseFloat(cs.marginLeft) || 0) + (parseFloat(cs.marginRight) || 0);
          spacer(adv, pf, node.parentElement);
          return;
        }
        const ml = parseFloat(cs.marginLeft) || 0, mr = parseFloat(cs.marginRight) || 0;
        const rtlCtx = getComputedStyle(node.parentElement).direction === 'rtl';
        const lead = rtlCtx ? mr : ml, trail = rtlCtx ? ml : mr;
        const pfs = parseFloat(cs.fontSize) || 16;
        if (lead >= 4) spacer(lead, pfs, node);
        const l = ltr + (node.getAttribute('dir') === 'ltr' ? 1 : 0);
        for (const ch of node.childNodes) push(ch, l);
        if (trail >= 4) spacer(trail, pfs, node);
      }
      for (const n of nodes) push(n, 0);
      // trim edges
      const out = [];
      for (const p of paras) {
        if (!p.length) { if (out.length) out.push([]); continue; }
        p[0].txt = p[0].txt.replace(/^ +/, '');
        p[p.length - 1].txt = p[p.length - 1].txt.replace(/ +$/, '');
        const keep = p.filter((r) => r.txt !== '');
        if (keep.length) out.push(keep);
      }
      return out;
    }

    function textOp(nodes, container, ops, base) {
      const rng = document.createRange();
      rng.setStartBefore(nodes[0]);
      rng.setEndAfter(nodes[nodes.length - 1]);
      const r = rng.getBoundingClientRect();
      const paras = runsOf(nodes, ops, base);
      if (!paras.length || r.width < 1) return;
      const cs = getComputedStyle(container);
      const rtl = cs.direction === 'rtl';
      let al = cs.textAlign;
      if (al === 'start' || al === 'justify') al = rtl ? 'right' : 'left';
      if (al === 'end') al = rtl ? 'left' : 'right';
      const fs = parseFloat(cs.fontSize);
      let lh = cs.lineHeight === 'normal' ? 1.2 : parseFloat(cs.lineHeight) / fs;
      const alk = al === 'center' ? 'ctr' : al === 'right' ? 'r' : 'l';
      ops.push({
        t: 'text', x: R(r.left - base.left), y: R(r.top - base.top), w: R(r.width), h: R(r.height),
        al: alk, rtl: rtl ? 1 : 0, lh: R(lh), paras,
        sc: fitScale(paras, r.width + 2, r.height, lh, rtl, al === 'center' ? 'center' : al),
      });
    }

    // ---- boxes ------------------------------------------------------------
    async function paintBox(el, ops, base) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width < 0.5 || r.height < 0.5) return;
      const x = R(r.left - base.left), y = R(r.top - base.top);
      const fill = col(cs.backgroundColor);
      const rad = parseFloat(cs.borderTopLeftRadius) || 0;
      const sides = ['Top', 'Right', 'Bottom', 'Left'].map((s) => ({
        s, w: parseFloat(cs['border' + s + 'Width']) || 0, c: col(cs['border' + s + 'Color']),
        st: cs['border' + s + 'Style'],
      })).filter((b) => b.w > 0 && b.c && b.st !== 'none');
      const uniform = sides.length === 4 && sides.every((b) => b.w === sides[0].w && b.c === sides[0].c);
      if (fill || uniform) {
        ops.push({
          t: 'rect', x, y, w: R(r.width), h: R(r.height), fill,
          line: uniform ? { c: sides[0].c, w: R(sides[0].w) } : null,
          rad: rad > 0 ? Math.min(0.5, rad / Math.min(r.width, r.height)) : 0,
        });
      }
      if (!uniform) {
        for (const b of sides) {
          const o = { t: 'rect', fill: b.c, line: null, rad: 0 };
          if (b.s === 'Top') Object.assign(o, { x, y, w: R(r.width), h: R(b.w) });
          if (b.s === 'Bottom') Object.assign(o, { x, y: R(r.bottom - base.top - b.w), w: R(r.width), h: R(b.w) });
          if (b.s === 'Left') Object.assign(o, { x, y, w: R(b.w), h: R(r.height) });
          if (b.s === 'Right') Object.assign(o, { x: R(r.right - base.left - b.w), y, w: R(b.w), h: R(r.height) });
          ops.push(o);
        }
      }
      const bi = cs.backgroundImage;
      const m = bi && bi.match(/url\("?(data:[^")]+)"?\)/);
      if (m) {
        const uri = m[1];
        const nat = await measure(uri);
        let dx = x, dy = y, dw = R(r.width), dh = R(r.height);
        if (nat.w && cs.backgroundSize === 'contain') {
          const sc = Math.min(r.width / nat.w, r.height / nat.h);
          dw = R(nat.w * sc); dh = R(nat.h * sc);
          dx = R(x + (r.width - dw) / 2); dy = R(y + (r.height - dh) / 2);
        }
        ops.push({ t: 'pic', x: dx, y: dy, w: dw, h: dh, img: imgId(uri) });
      }
    }

    // ---- tables -----------------------------------------------------------
    function cellParas(cell, ops, base) {
      const paras = [];
      function walk(el) {
        let group = [];
        const flush = () => {
          if (!group.length) return;
          const ps = runsOf(group, ops, base);
          for (const p of ps) paras.push(p);
          group = [];
        };
        for (const ch of el.childNodes) {
          if (ch.nodeType === 3) { const tv = TXT(ch); if (tv.trim() !== '' || (tv !== '' && group.length)) group.push(ch); continue; }
          if (ch.nodeType !== 1) continue;
          const cs = getComputedStyle(ch);
          if (cs.display === 'none') continue;
          if (isInlineDisp(cs.display)) { group.push(ch); continue; }
          flush();
          walk(ch);
        }
        flush();
      }
      walk(cell);
      return paras;
    }

    function tableOp(tb, ops, base) {
      const tr = tb.getBoundingClientRect();
      const mops = []; // markers must paint above the table
      const cells = [];
      const xs = new Set(), ys = new Set();
      for (const row of tb.rows) {
        for (const c of row.cells) {
          const r = c.getBoundingClientRect();
          if (r.width < 0.5) continue;
          xs.add(R(r.left)); xs.add(R(r.right));
          ys.add(R(r.top)); ys.add(R(r.bottom));
        }
      }
      const ax = [...xs].sort((a, b) => a - b), ay = [...ys].sort((a, b) => a - b);
      const idx = (arr, v) => {
        let best = 0, bd = 1e9;
        arr.forEach((a, i) => { const d = Math.abs(a - v); if (d < bd) { bd = d; best = i; } });
        return best;
      };
      let cellScale = 1;
      for (const row of tb.rows) {
        for (const c of row.cells) {
          const r = c.getBoundingClientRect();
          if (r.width < 0.5) continue;
          const cs = getComputedStyle(c);
          const c0 = idx(ax, R(r.left)), c1 = idx(ax, R(r.right));
          const r0 = idx(ay, R(r.top)), r1 = idx(ay, R(r.bottom));
          cells.push({
            r: r0, c: c0, rs: Math.max(1, r1 - r0), cs: Math.max(1, c1 - c0),
            fill: col(cs.backgroundColor),
            va: cs.verticalAlign === 'middle' ? 'ctr' : cs.verticalAlign === 'bottom' ? 'b' : 't',
            al: (() => {
              let a = cs.textAlign;
              const rtl = cs.direction === 'rtl';
              if (a === 'start' || a === 'justify') a = rtl ? 'right' : 'left';
              if (a === 'end') a = rtl ? 'left' : 'right';
              return a === 'center' ? 'ctr' : a === 'right' ? 'r' : 'l';
            })(),
            rtl: cs.direction === 'rtl' ? 1 : 0,
            lh: R(cs.lineHeight === 'normal' ? 1.2 : parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)),
            pad: [R(parseFloat(cs.paddingTop)), R(parseFloat(cs.paddingRight)), R(parseFloat(cs.paddingBottom)), R(parseFloat(cs.paddingLeft))],
            paras: (function () {
              const ps = cellParas(c, mops, base);
              const iw = r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
              const ih = r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
              const alx = cs.textAlign === 'center' ? 'center' : (cs.direction === 'rtl' ? 'right' : 'left');
              const lhx = cs.lineHeight === 'normal' ? 1.2 : parseFloat(cs.lineHeight) / parseFloat(cs.fontSize);
              const srcH = measH(ps, iw, lhx, cs.direction === 'rtl', alx, 1, cs.fontFamily).h;
              const limit = Math.min(ih, srcH * 1.06);
              cellScale = fitScale(ps, iw, limit, lhx, cs.direction === 'rtl', alx, true);
              return ps;
            })(),
            sc: 1,
          });
          cells[cells.length - 1].sc = cellScale;
        }
      }
      ops.push({
        t: 'table', x: R(tr.left - base.left), y: R(tr.top - base.top), w: R(tr.width), h: R(tr.height),
        cols: ax.slice(1).map((v, i) => R(v - ax[i])),
        rows: ay.slice(1).map((v, i) => R(v - ay[i])),
        cells,
      });
      for (const m of mops) ops.push(m);
    }

    // ---- walker -----------------------------------------------------------
    async function walk(el, ops, base) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return;
      if (el.tagName === 'IMG') {
        const r = el.getBoundingClientRect();
        ops.push({ t: 'pic', x: R(r.left - base.left), y: R(r.top - base.top), w: R(r.width), h: R(r.height), img: imgId(el.src) });
        return;
      }
      await paintBox(el, ops, base);
      // bullet pseudo-squares
      if (el.matches('ul.story li') || el.matches('.ev-item')) {
        const r = el.getBoundingClientRect();
        const sz = el.matches('.ev-item') ? 9 : 10;
        const top = el.matches('.ev-item') ? 8 : 10;
        ops.push({ t: 'rect', x: R(r.right - base.left - sz), y: R(r.top - base.top + top), w: sz, h: sz, fill: '0B4F6C', line: null, rad: 0 });
      }
      if (el.tagName === 'TABLE') { tableOp(el, ops, base); return; }
      let group = [];
      const flush = () => { if (group.length) { textOp(group, el, ops, base); group = []; } };
      for (const ch of el.childNodes) {
        if (ch.nodeType === 3) { const tv = TXT(ch); if (tv.trim() !== '' || (tv !== '' && group.length)) group.push(ch); continue; }
        if (ch.nodeType !== 1) continue;
        const ccs = getComputedStyle(ch);
        if (ccs.display === 'none') continue;
        if (isInlineDisp(ccs.display)) {
          const mk = markerOf(ch, base);
          if (mk) { flush(); ops.push(mk); continue; }
          group.push(ch); continue;
        }
        flush();
        await walk(ch, ops, base);
      }
      flush();
    }

    const slides = [];
    for (const sec of document.querySelectorAll('section.slide')) {
      const base = sec.getBoundingClientRect();
      const ops = [];
      // .slide::before gray edge strip
      ops.push({ t: 'rect', x: 0, y: 150, w: 18, h: 1080 - 150, fill: 'CED2DB', line: null, rad: 0 });
      for (const ch of sec.children) await walk(ch, ops, base);
      slides.push({ id: sec.id, ops });
    }
    return { slides, imgs: [...imgs.values()] };
  });

  for (const im of data.imgs) {
    const m = im.uri.match(/^data:image\/(\w+);base64,(.*)$/);
    if (!m) continue;
    fs.writeFileSync(path.join(OUT, 'img', im.id + '.' + (m[1] === 'jpeg' ? 'jpg' : m[1])), Buffer.from(m[2], 'base64'));
  }
  const meta = data.slides.map((s) => ({ id: s.id, ops: s.ops }));
  fs.writeFileSync(path.join(OUT, 'ops.json'), JSON.stringify({ slides: meta, imgs: data.imgs.map((i) => i.id) }));
  console.log('slides:', meta.length, 'ops:', meta.reduce((a, s) => a + s.ops.length, 0), 'imgs:', data.imgs.length);
  await browser.close();
})();
