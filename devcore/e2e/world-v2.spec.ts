import { test, expect } from '@playwright/test';
import { SHOTS, seedSave } from './helpers';
test('world v2: north architecture loads and village remains responsive',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await seedSave(page,{heroClass:'alchemist',extra:{village:{x:12,y:5,facing:'up'}}});
 await page.goto('/?rota=vila');
 await expect(page.locator('.village-hud')).toBeVisible();
 await page.waitForFunction(()=>performance.getEntriesByType('resource').some(e=>e.name.includes('world-v2/gate.png')));
 await page.waitForTimeout(600);
 await page.screenshot({path:`${SHOTS}/v2-north.png`});
 await page.keyboard.down('ArrowUp');await page.waitForTimeout(900);await page.keyboard.up('ArrowUp');
 // The gate remains an interactable solid boundary.
 await page.keyboard.press('Enter');await expect(page.locator('.dialog').first()).toBeVisible();
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:`${SHOTS}/v2-mobile.png`});
 expect(errors).toEqual([]);
});
