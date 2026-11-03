import asyncio,base64,re
from pathlib import Path
from playwright.async_api import async_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text();css=(root/'style.css').read_text();js=(root/'game.js').read_text()
hero='data:image/png;base64,'+base64.b64encode((root/'assets'/'hero_front.png').read_bytes()).decode()
js=js.replace('assets/hero_front.png?v=064',hero)
css=css.replace("assets/hero_front.png?v=064",hero)
html=re.sub(r'<link rel="stylesheet"[^>]+>',lambda m:'<style>'+css+'</style>',html)
html=re.sub(r'<script src="game.js[^>]+></script>',lambda m:'<script>window.__PK_TEST__=true;</script><script>'+js+'</script>',html)
async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for name,w,h in [('desktop',1440,900),('portrait',393,852),('landscape',844,390)]:
   page=await browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
   errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
   await page.set_content(html,wait_until='load')
   await page.wait_for_timeout(300)
   await page.locator('[data-hub="hero"]').click()
   await page.wait_for_timeout(300)
   assert await page.locator('.hero-profile-card').count()==1,(name,'no hero profile')
   assert await page.locator('.talent-node').count()==6,(name,'missing 6 talents')
   assert await page.locator('.hero-profile-art img').evaluate('(im)=>im.complete&&im.naturalWidth>0'),(name,'hero art missing')
   assert await page.locator('#tierLobby').is_hidden(),(name,'tier lobby covers hero')
   # Guild change in Hero Hall must render another full path
   await page.locator('[data-school="Arcanist"]').first.click()
   assert 'Winter Touch' in await page.locator('#panelContent').inner_text(),(name,'school selector failed')
   await page.screenshot(path=str(root/f'qa065_{name}_hero.png'),full_page=False)
   await page.locator('#subnav [data-subtab="skills"]').click()
   assert await page.locator('.talent-board').count()==1
   assert await page.locator('.talent-node').count()==6
   await page.screenshot(path=str(root/f'qa065_{name}_tree.png'),full_page=False)
   # Ensure action actually spends 1 skill point and persists update
   await page.evaluate('window.__PK_TEST_TOOLS__.p().points=2')
   await page.locator('[data-school="Marksman"]').first.click()
   await page.locator('[data-action="skill:aim"]').click()
   state=await page.evaluate('({rank:window.__PK_TEST_TOOLS__.p().skills.aim,points:window.__PK_TEST_TOOLS__.p().points})')
   assert state=={'rank':1,'points':1},(name,'purchase failed',state)
   # Return to overview and validate integrated rank
   await page.locator('#subnav [data-subtab="hero"]').click()
   assert 'Hunter’s Eye' in await page.locator('#panelContent').inner_text()
   assert await page.locator('.talent-node[data-node="aim"] .talent-gems i.filled').count()==1
   await page.locator('[data-hub="battle"]').click()
   assert await page.locator('#tierLobby').is_visible()
   assert not errs,(name,errs)
   print('PASS',name,'hero portrait, path switching, 6 connected talents, skill purchase, return to lobby',state)
   await page.close()
  await browser.close()
asyncio.run(main())