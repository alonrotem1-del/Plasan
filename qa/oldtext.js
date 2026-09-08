const { chromium } = require('playwright'); const path=require('path'); const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+process.argv[2]+'?flat=1',{waitUntil:'networkidle'});
await p.evaluate(()=>document.fonts.ready);
const t=await p.evaluate(()=>[...document.querySelectorAll('section.slide')].map(s=>s.innerText));
fs.writeFileSync(process.argv[3],JSON.stringify(t)); await b.close();})();
