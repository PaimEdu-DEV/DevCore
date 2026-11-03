import { test, expect } from '@playwright/test';
import { seedSave, SHOTS } from './helpers';
test('composition: sector captures and collision against residential foundation',async({browser})=>{
 for(const [name,x,y] of [['plaza',12,12],['residential',3,7],['workshop',20,7],['market',16,13],['gate',12,4]] as const){
  const page=await browser.newPage({viewport:{width:1366,height:768}});
  await seedSave(page,{heroClass:'alchemist',extra:{village:{x,y,facing:'up'}}});
  await page.goto('/?rota=vila');await expect(page.locator('.village-hud')).toBeVisible();
  await page.waitForTimeout(700);await page.screenshot({path:`${SHOTS}/v3-${name}.png`});await page.close();
 }
 const page=await browser.newPage();
 // encostado na porta da casa dos livros (2,5): subir não pode atravessar a parede
 await seedSave(page,{heroClass:'alchemist',extra:{village:{x:2,y:6,facing:'up'}}});
 await page.goto('/?rota=vila');await expect(page.locator('.village-hud')).toBeVisible();
 await page.keyboard.down('ArrowUp');await page.waitForTimeout(800);await page.keyboard.up('ArrowUp');
 // Navigate via menu so the screen persists its actual position to the save.
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog',{name:'Menu'})).toBeVisible();
 await page.screenshot({path:`${SHOTS}/v3-collision.png`});
 await page.getByRole('button',{name:'Perfil',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('devcore.save')!).village)).toMatchObject({x:2,y:6});
 await page.close();
});
