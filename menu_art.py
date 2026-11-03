"""Build eleven isolated pixel-art menu emblems from original game illustration.

Each PNG has its own 96x80 RGBA canvas. Never crop from an atlas at runtime;
this prevents broken textures, stray HUD frames and scaled sprite offsets.
Pillow is build-time only; the running game has zero external dependencies.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
ROOT=Path(__file__).resolve().parent
src=Image.open(ROOT/'art'/'source_composition.png').convert('RGBA')
dest=ROOT/'assets'/'menu'
dest.mkdir(parents=True,exist_ok=True)
coords={
 'battle':(197,839,88,57),
 'hero':(364,839,78,57),
 'power':(1316,840,81,57),
 'gear':(674,839,86,58),
 'fortress':(994,840,85,58),
 'skills':(519,837,90,58),
 'runes':(838,841,74,56),
 'research':(1149,840,78,57),
 'training':(1316,840,81,57),
 'stations':(994,840,85,58),
 'suppression':(794,146,53,49)
}
for name,(cx,cy,width,height) in coords.items():
    crop=src.crop((cx-width//2,cy-height//2,cx-width//2+width,cy-height//2+height))
    matte=Image.new('L',crop.size,0)
    pen=ImageDraw.Draw(matte)
    inset=1 if name=='suppression' else 2
    pen.ellipse((inset,8,width-inset-1,height+22),fill=255)
    matte=matte.filter(ImageFilter.GaussianBlur(2.6))
    for y in range(height):
        factor=min(1.0,max(0.0,(y-5)/14),(height-y)/4)
        if factor<1:
            for x in range(width):
                matte.putpixel((x,y),int(matte.getpixel((x,y))*factor))
    crop.putalpha(matte)
    crop=ImageEnhance.Contrast(crop).enhance(1.07)
    crop.thumbnail((82,65),Image.Resampling.LANCZOS)
    target=Image.new('RGBA',(96,80),(0,0,0,0))
    target.alpha_composite(crop,((96-crop.width)//2,(80-crop.height)//2))
    target.save(dest/(name+'.png'),optimize=True)
    assert (dest/(name+'.png')).stat().st_size>1000,name
# Visual contact sheet for QA (never displayed by the game).
sheet=Image.new('RGB',(592,378),'#141e2a')
draw=ImageDraw.Draw(sheet)
for i,name in enumerate(coords):
    im=Image.open(dest/(name+'.png'))
    x=(i%4)*148+26;y=(i//4)*126+10
    sheet.paste(im,(x,y),im)
    draw.text(((i%4)*148+20,(i//4)*126+95),name,fill='#e9cf9a')
(ROOT/'docs').mkdir(exist_ok=True)
sheet.save(ROOT/'docs'/'menu_icon_contact.png')
print('Created',len(coords),'isolated menu icons')
