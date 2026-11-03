import asyncio,base64,re
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parent.parent
html=(ROOT/'index.html').read_text()
css=(ROOT/'style.css').read_text()
js=(ROOT/'game.js').read_text()
assets={}
for f in (ROOT/'assets').rglob('*'):
 if f.suffix in ('.png','.webp'):
  mime='image/webp' if f.suffix=='.webp' else 'image/png'
  assets[str(f.relative_to(ROOT))]='data:'+mime+';base64,'+base64.b64encode(f.read_bytes()).decode()
for path,data in assets.items():
 css=css.replace(path,data)
 html=html.replace(path,data)
 js=js.replace("'"+path+"'","'"+data+"'")
 js=js.replace('src=\"'+path+'\"','src=\"'+data+'\"')
shim='<script>window.__PK_TEST__=true;window.__primalAssets='+str(assets).replace("'",'"')+';const OriginalImage=window.Image;window.Image=class extends OriginalImage{set src(v){super.src=window.__primalAssets[v]||v}get src(){return super.src}};</script>'
js=js.replace("const chamberArt=tabName=>'assets/chambers/'+(tabName in tabInfo?tabName:'hero')+'.webp';", "const chamberArt=tabName=>window.__primalAssets['assets/chambers/'+(tabName in tabInfo?tabName:'hero')+'.webp'];")
html=re.sub(r'<link rel="stylesheet"[^>]*>',lambda _: '<style>'+css+'</style>',html)
html=re.sub(r'<script src="game.js\?v=[^"]+"></script>',lambda _:shim+'<script>'+js+'</script>',html)

async def test(browser,name,w,h,touch):
 page=await browser.new_page(viewport={'width':w,'height':h},has_touch=touch,device_scale_factor=1)
 page.on('dialog',lambda dialog:asyncio.create_task(dialog.accept()))
 errors=[]
 page.on('pageerror',lambda error:errors.append(str(error)))
 await page.add_init_script('window.__PK_TEST__=true;')
 await page.set_content(html,wait_until='load',timeout=30000)
 await page.wait_for_selector('#tierLobby:not([hidden])')
 await page.locator('[data-hub="gear"]').click()
 await page.wait_for_selector('.armory-showcase')
 assert await page.locator('.armory-slot-select').count()==3
 assert await page.locator('.armory-hero-plinth img').count()==1
 assert await page.locator('#tierLobby').get_attribute('hidden') is not None
 bounds=await page.locator('.armory-showcase').bounding_box()
 assert bounds and bounds['width']>min(280,w-100),bounds
 (ROOT/'docs'/'qa06').mkdir(exist_ok=True)
 await page.screenshot(path=str(ROOT/'docs'/'qa06'/(name+'_hero_gear.png')))
 await page.locator('[data-gear-slot="weapon"]').first.click()
 await page.wait_for_selector('#armoryDrawer:not([hidden])',timeout=3000)
 assert await page.locator('#armoryDrawer .armory-inventory-item').count()==1
 assert await page.locator('#armoryDrawer .armory-inventory-item .armory-sell-item').is_disabled()
 await page.screenshot(path=str(ROOT/'docs'/'qa06'/(name+'_weapon_inventory.png')))
 await page.locator('[data-gear-back]').click()
 await page.evaluate('''() => {let p=window.__PK_TEST_TOOLS__.p();p.inventory.push({id:'sparec1',slot:'weapon',rarity:0,plus:0},{id:'sparec2',slot:'armor',rarity:0,plus:0},{id:'sparelegend',slot:'charm',rarity:4,plus:3},{id:'spareepic',slot:'weapon',rarity:3,plus:2});p.gold+=10000;}''')
 await page.locator('[data-gear-slot="all"]').click()
 await page.wait_for_selector('#armoryDrawer:not([hidden])')
 assert await page.locator('#armoryDrawer .armory-inventory-item').count()==7
 headings=await page.locator('.armory-rarity-group h3').all_text_contents()
 assert headings[0].startswith('◆LEGENDARY'), headings
 assert headings[1].startswith('◆EPIC'), headings
 await page.screenshot(path=str(ROOT/'docs'/'qa06'/(name+'_full_inventory.png')))
 before=await page.evaluate('window.__PK_TEST_TOOLS__.p().gold')
 await page.locator('[data-gear-sell="spareepic"]').click()
 assert await page.locator('[data-item-id="spareepic"]').count()==0
 assert await page.evaluate('window.__PK_TEST_TOOLS__.p().gold')>before
 await page.locator('[data-sell-rarity="0"]').check()
 assert await page.locator('#armoryBulkSell').is_enabled()
 msg=await page.locator('#armoryBulkSell').text_content()
 assert '2 ITEMS' in msg,msg
 before=await page.evaluate('window.__PK_TEST_TOOLS__.p().gold')
 await page.locator('#armoryBulkSell').click()
 assert await page.evaluate("window.__PK_TEST_TOOLS__.p().inventory.filter(x=>x.rarity===0).length")==3
 assert await page.evaluate('window.__PK_TEST_TOOLS__.p().gold')>before
 assert await page.locator('[data-item-id="starterbow"]').count()==1
 assert await page.locator('[data-gear-undo]').is_enabled()
 await page.locator('[data-gear-undo]').click()
 assert await page.evaluate("window.__PK_TEST_TOOLS__.p().inventory.filter(x=>x.rarity===0).length")==5
 await page.locator('[data-gear-back]').click()
 await page.locator('[data-gear-slot="armor"]').click()
 await page.locator('[data-gear-unequip="armor"]').click()
 await page.locator('[data-gear-back]').click()
 assert 'Empty Armor Slot' in await page.locator('.armory-armor').inner_text()
 await page.locator('[data-gear-slot="armor"]').click()
 await page.locator('[data-action="equip:starterarmor"]').click()
 assert await page.evaluate("window.__PK_TEST_TOOLS__.p().equipped.armor")=="starterarmor"
 await page.locator('[data-gear-back]').click()
 assert 'Scout Mantle' in await page.locator('.armory-armor').inner_text()
 assert not errors,errors
 await page.close()
 print(name,'PASS',{'width':w,'height':h,'groups':headings[:3],'beforeBattle':True})

async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for args in [('desktop',1440,900,False),('iphone_landscape',852,393,True),('iphone_portrait',393,852,True)]:
   await test(browser,*args)
  await browser.close()


if __name__=='__main__':asyncio.run(main())
