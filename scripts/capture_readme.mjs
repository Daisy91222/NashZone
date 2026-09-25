import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';

await mkdir('docs/images',{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  await page.goto('https://daisy91222.github.io/NashZone/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.__nashzone?.ready);
  await page.screenshot({path:'docs/images/height-surface.png',fullPage:true});
  await page.getByRole('button',{name:'F23 · Middle + right',exact:true}).click();
  await page.getByRole('button',{name:'Stepped envelope',exact:true}).click();
  await page.waitForTimeout(700);
  await page.screenshot({path:'docs/images/combined-frontage.png',fullPage:true});
  console.log('Captured two live-site screenshots.');
  const response=await page.request.get('https://api.github.com/repos/Daisy91222/NashZone');
  if(response.ok()) {const r=await response.json();console.log(JSON.stringify({homepage:r.homepage,has_pages:r.has_pages,visibility:r.visibility}));}
  else console.log('Repository metadata unavailable: '+response.status());
}finally{await browser.close();}
