"""Build decorative 32-bit-inspired icons from the original project's own illustration.
No remote assets or runtime dependencies. Source icons are cropped from original
PRIMAL KNIGHT art in art/source_composition.png, not from the battlefield runtime.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
ROOT=Path(__file__).resolve().parent
src=Image.open(ROOT/'art/source_composition.png').convert('RGBA')
# 1672x941 source composition: equipment/skill emblems on lower bar.
# Isolate the upper emblem area, explicitly excluding the baked-in labels.
coords={
 'battle':(210,846),'hero':(360,846),'power':(1360,846),
 'gear':(696,846),'fortress':(1020,846),'skills':(533,846),
 'runes':(861,846),'research':(1195,846),'training':(1360,846),'stations':(1020,846),'suppression':(1195,846)
}
icons={}
for name,(x,y) in coords.items():
    crop=src.crop((x-48,y-35,x+48,y+39))
    # Hand-mask away surrounding menu box for a clean icon with painted texture.
    mask=Image.new('L',crop.size,0)
    draw=ImageDraw.Draw(mask)
    draw.ellipse((7,2,89,71),fill=255)
    mask=mask.filter(ImageFilter.GaussianBlur(3))
    crop.putalpha(mask)
    crop.thumbnail((76,62),Image.Resampling.LANCZOS)
    icons[name]=crop
cols=6;w,h=92,84
sheet=Image.new('RGBA',(w*cols,h*2),(0,0,0,0))
for i,name in enumerate(coords):
    im=icons[name];left=(i%cols)*w+(w-im.width)//2;top=(i//cols)*h+(h-im.height)//2
    sheet.alpha_composite(im,(left,top))
sheet.save(ROOT/'assets/menu_icons.png',optimize=True)
print('Generated 11 original decorative icon crops:',(ROOT/'assets/menu_icons.png').stat().st_size,'bytes')