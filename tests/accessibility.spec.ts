import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('public pages meet automated WCAG A/AA rules at desktop and narrow mobile',async({page})=>{
 for(const width of [1440,320]){await page.setViewportSize({width,height:1000});for(const route of ['/','/sample-report/','/license-plate-lookup/','/pricing/','/guides/buying-checklist/']){await page.goto(route);const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),`${route} at ${width}`).toEqual([]);}}
});
test('report, account and checkout layouts remain usable at all required widths',async({page})=>{
 await page.goto('/');await page.getByLabel('Vehicle identification number').fill('1HGCM82633A004352');await page.getByRole('button',{name:'Check vehicle',exact:true}).click();await page.getByRole('link',{name:'Choose single report',exact:true}).click();
 for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 const checkoutAudit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(checkoutAudit.violations).toEqual([]);
 await page.getByLabel('Email for your report').fill('qa@example.com');await page.getByRole('button',{name:'Review sandbox order'}).click();await page.getByRole('button',{name:'Simulate successful payment'}).click();await expect(page).toHaveURL(/\/reports\//);
 const reportUrl=page.url();for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:1000});await page.goto(reportUrl);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.goto('/account/');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 for(const url of [reportUrl,'/account/']){await page.goto(url);const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);}
});
