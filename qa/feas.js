const { chromium } = require('playwright'); const path=require('path');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+path.resolve('deck.html')+'?flat=1',{waitUntil:'networkidle'});
await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(200);
const r=await p.evaluate(()=>{
  const meas=document.createElement('div');
  meas.style.cssText='position:absolute;left:-99999px;top:0;visibility:hidden;';
  document.body.appendChild(meas);
  const need=(el,px,w)=>{const d=document.createElement('div');
    d.style.cssText=`width:${w}px;font-size:${px}px;line-height:1.4;direction:rtl;font-family:Arial,"Liberation Sans",sans-serif;`;
    d.innerHTML=el.innerHTML; meas.appendChild(d); const h=d.getBoundingClientRect().height; meas.removeChild(d); return h;};
  const out=[];
  document.querySelectorAll('section.slide').forEach((s,i)=>{
    const src=s.querySelector('.ftr .src'); if(!src) return;
    const w=src.getBoundingClientRect().width;
    // free space above the footer = gap between lowest content bottom and footer top (1022)
    let low=0;
    s.querySelectorAll('*').forEach(el=>{
      if(el.closest('.ftr')) return;
      const cs=getComputedStyle(el); if(cs.display==='none') return;
      const t=el.textContent.replace(/\s/g,''); if(!t) return;
      const b=el.getBoundingClientRect().bottom - s.getBoundingClientRect().top;
      if(b>low && b<1080) low=b;
    });
    out.push({slide:i+1, w:Math.round(w), cur:Math.round(need(src,16,w)), at20:Math.round(need(src,20,w)),
              lowest:Math.round(low), free:Math.round(1022-low)});
  });
  return out;});
console.log('slide  srcW  h@16px  h@20px  contentBottom  freeAboveFooter');
for(const x of r) console.log(String(x.slide).padStart(4), String(x.w).padStart(6), String(x.cur).padStart(6), String(x.at20).padStart(7), String(x.lowest).padStart(12), String(x.free).padStart(14));
await b.close();})();
