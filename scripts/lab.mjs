import {chromium} from 'playwright';
import {writeFile,mkdir} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox']});
const results=[];
for(const width of [390,1440]){
 const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1});const page=await context.newPage();const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:40,downloadThroughput:2000000,uploadThroughput:1000000});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await page.addInitScript(()=>{window.__lab={lcp:0,cls:0};new PerformanceObserver(list=>{for(const e of list.getEntries())window.__lab.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__lab.cls+=e.value;}).observe({type:'layout-shift',buffered:true});});
 await page.goto('http://localhost:4322/');await page.waitForTimeout(1200);const metrics=await page.evaluate(()=>({...window.__lab,resources:performance.getEntriesByType('resource').map(e=>({name:new URL(e.name).pathname,bytes:e.transferSize})),domContentLoaded:performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd}));
 await mkdir('docs/qa',{recursive:true});await page.screenshot({path:`docs/qa/home-${width}.png`,animations:'disabled'});results.push({width,...metrics});await context.close();
}
await browser.close();await writeFile('docs/qa/lab.json',JSON.stringify({conditions:'Local standalone Node build. Chromium headless, 4x CPU throttle, 40ms latency, 2 MB/s down. Single sample each; NOT field p75 or INP.',results},null,2));console.log(JSON.stringify(results,null,2));
