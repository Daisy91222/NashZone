import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
let productionServer;
let testURL=process.env.TEST_URL || 'http://127.0.0.1:4317';
if(process.argv.includes('--production')){
  const root=resolve('dist');
  productionServer=http.createServer(async(req,res)=>{
    try{
      let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if(!pathname.startsWith('/NashZone/')){res.writeHead(404).end();return;}
      pathname=pathname.slice('/NashZone/'.length)||'index.html';
      const file=resolve(root,pathname);
      if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}
      res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'})[extname(file)]||'application/octet-stream');
      res.end(await readFile(file));
    }catch{res.writeHead(404).end();}
  });
  await new Promise(done=>productionServer.listen(0,'127.0.0.1',done));
  testURL=`http://127.0.0.1:${productionServer.address().port}/NashZone/`;
}
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1100}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(testURL);
  await page.waitForFunction(()=>window.__nashzone?.ready,{timeout:15000});
  await page.waitForTimeout(700);
  async function pixels(){return page.evaluate(()=>{
    const r=window.__nashzone.renderer,g=r.getContext(),w=g.drawingBufferWidth,h=g.drawingBufferHeight;
    const bytes=new Uint8Array(w*h*4);g.readPixels(0,0,w,h,g.RGBA,g.UNSIGNED_BYTE,bytes);
    let nonBackground=0,hash=0;
    for(let i=0;i<bytes.length;i+=64){if(bytes[i]<200||bytes[i+1]<200||bytes[i+2]<200)nonBackground++;hash=(hash*31+bytes[i]+bytes[i+1]*3+bytes[i+2]*7)>>>0;}
    return {nonBackground,hash};
  });}
  const start=await pixels();assert.ok(start.nonBackground>100,'Canvas must contain geometry');
  await page.screenshot({path:'tmp/demo-desktop.png',fullPage:true});
  const canvas=page.locator('#scene canvas');const box=await canvas.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+90,box.y+box.height/2+30,{steps:10});await page.mouse.up();await page.waitForTimeout(700);
  assert.notEqual((await pixels()).hash,start.hash,'Orbit must move visible geometry');
  await page.getByRole('button',{name:'F23 · Middle + right',exact:true}).click();
  assert.match(await page.locator('#height').innerText(),/198/);
  await page.getByRole('button',{name:'Stepped envelope',exact:true}).click();await page.waitForTimeout(500);
  assert.ok((await pixels()).nonBackground>100);await page.screenshot({path:'tmp/demo-combined.png',fullPage:true});
  await page.locator('#min-area').fill('60000');await page.locator('#floor-height').fill('12');await page.getByRole('button',{name:'Calculate',exact:true}).click();
  const changed=await page.evaluate(()=>window.__nashzone.results[3]);assert.ok(changed.n<15);assert.equal(changed.height,48+changed.n*12);
  await page.locator('#min-area').fill('999999');await page.getByRole('button',{name:'Calculate',exact:true}).click();assert.equal(await page.locator('#height').innerText(),'Infeasible');
  await page.locator('#min-area').fill('50000');await page.locator('#floor-height').fill('10');await page.getByRole('button',{name:'Calculate',exact:true}).click();
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download analysis JSON'}).click();assert.equal((await download).suggestedFilename(),'nashzone-height-study.json');
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'No horizontal page overflow');
  assert.ok((await pixels()).nonBackground>100);await page.screenshot({path:'tmp/demo-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS desktop/mobile, canvas pixels, orbit, four-scenario selection, mode switch, inputs, infeasible state and export');
}finally{await browser.close();if(productionServer)await new Promise(done=>productionServer.close(done));}
