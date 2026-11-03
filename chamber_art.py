"""Create original Primal KnIght progression-chamber illustrations from in-repo pixel art.
Pillow is build-only. Every image is a real separate asset; no UI or labels are painted in.
The painterly materials, hero, rune machinery and fortress details are reused from
art/source_composition.png and the game's own original sprite assets.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import math, random
ROOT=Path(__file__).resolve().parent
SRC=Image.open(ROOT/'art/source_composition.png').convert('RGBA')
HERO=Image.open(ROOT/'assets/hero.png').convert('RGBA')
BG=Image.open(ROOT/'assets/battlefield.png').convert('RGBA')
ICONS={p.stem:Image.open(p).convert('RGBA') for p in (ROOT/'assets/menu').glob('*.png')}
OUT=ROOT/'assets/chambers';OUT.mkdir(parents=True,exist_ok=True)
random.seed(0xA1C0)
W,H=640,880
TINTS={
 'hero':('#202e45','#e69a58','#d7af70'),
 'skills':('#272047','#b9a0f8','#e4c3fb'),
 'training':('#332946','#f1bf61','#f6e2a8'),
 'research':('#162f3a','#73d4c0','#b5edca'),
 'equipment':('#2e2426','#f5af60','#efc29c'),
 'runes':('#211d3e','#ad96ef','#dacbff'),
 'stations':('#202f32','#83e2bc','#deedd2'),
 'suppression':('#382127','#ec8576','#efb8a8'),
 'settings':('#253246','#aecbde','#e5eaf2')}

def rgb(h):return tuple(int(h[i:i+2],16) for i in (1,3,5))
def layer(src,sz,brightness=1,contrast=1):
    im=src.copy().convert('RGBA').resize(sz,Image.Resampling.LANCZOS)
    if brightness!=1: im=ImageEnhance.Brightness(im).enhance(brightness)
    if contrast!=1: im=ImageEnhance.Contrast(im).enhance(contrast)
    return im

def feather_cut(box,wh,cut=32,angle=0,bright=1.0):
    im=SRC.crop(box)
    mask=Image.new('L',im.size,0);d=ImageDraw.Draw(mask)
    d.rounded_rectangle((cut//2,cut//2,im.width-cut//2,im.height-cut//2),radius=cut,fill=255)
    mask=mask.filter(ImageFilter.GaussianBlur(max(5,cut//2)))
    im.putalpha(mask)
    im=layer(im,wh,bright,1.1)
    if angle: im=im.rotate(angle,expand=True,resample=Image.Resampling.BICUBIC)
    return im

def blend(canvas,obj,pos):
    if obj.mode!='RGBA':obj=obj.convert('RGBA')
    canvas.alpha_composite(obj,pos)

def glow(canvas,xy,radius,color,strength=.85):
    gl=Image.new('RGBA',(W,H),(0,0,0,0))
    d=ImageDraw.Draw(gl)
    rr,gg,bb=rgb(color)
    x,y=xy
    for k in range(10,0,-1):
        rad=radius*k/9
        a=int(strength*10.5*(11-k))
        d.ellipse((x-rad,y-rad,x+rad,y+rad),fill=(rr,gg,bb,a))
    gl=gl.filter(ImageFilter.GaussianBlur(max(18,radius/3)))
    canvas.alpha_composite(gl)

def make_room(key,main_icon,accent,extras):
    dark,light,metal=TINTS[key]
    ground=Image.new('RGBA',(W,H))
    pix=ground.load()
    dr,dg,db=rgb(dark);lr,lg,lb=rgb(light)
    for y in range(H):
        fade=y/H
        for x in range(W):
            v=((x//26*7+y//21*5)%9-4)/150
            skylight=max(0,1-abs(x/W-.51)*1.9)*(.15 if y<500 else .04)
            pix[x,y]=(max(0,min(255,int(dr*(1-.15*fade)+lr*(skylight+v)))),max(0,min(255,int(dg*(1-.10*fade)+lg*(skylight+v)))),max(0,min(255,int(db*(1-.05*fade)+lb*(skylight+v)))),255)
    # Actual hand-painted cliff/castle backdrop from the game's original illustration.
    sky=SRC.crop((285,73,1395,207))
    sky=layer(sky,(W,250),.52,1.17)
    mask=Image.new('L',(W,250));md=ImageDraw.Draw(mask)
    for y in range(250):
        a=int(140*(1-(y/250))**1.2)
        md.line((0,y,W,y),fill=a)
    sky.putalpha(mask)
    blend(ground,sky,(0,0))
    stone=SRC.crop((320,554,1120,783))
    stone=layer(stone,(W,355),.47,1.15)
    sm=Image.new('L',(W,355));m=ImageDraw.Draw(sm)
    for y in range(355):
        al=int(100*(.15+.85*y/355))
        m.line((0,y,W,y),fill=al)
    stone.putalpha(sm);blend(ground,stone,(0,525))
    glow(ground,(W//2,310),260,light,.35)
    # Scene architecture - torch columns and gilded metallic arch ornaments.
    d=ImageDraw.Draw(ground)
    for xx in (28,W-58):
        d.rounded_rectangle((xx,70,xx+30,H-88),radius=8,fill=(29,30,35,160),outline=(146,112,62,165),width=5)
        for yy in range(92,H-110,92):
            d.rectangle((xx+5,yy,xx+25,yy+7),fill=(161,115,62,110))
        d.rounded_rectangle((xx-6,58,xx+36,90),radius=5,fill=(66,50,42,200),outline=(220,170,86,205),width=3)
        d.rounded_rectangle((xx-6,H-112,xx+36,H-73),radius=5,fill=(63,52,46,190),outline=(220,170,86,160),width=3)
    # Gold-flecked ambient fireflies. They are decoration, not attacks/damage.
    for i in range(55):
        xx=random.randint(85,W-85);yy=random.randint(145,H-115)
        if i%4==0:d.ellipse((xx,yy,xx+3,yy+3),fill=(*rgb(light),random.randint(75,170)))
        elif i%6==0:d.point((xx,yy),fill=(*rgb(metal),random.randint(80,165)))
    # One large illustrated artifact, different per room.
    if key=='hero':
        glow(ground,(320,480),230,'#f98b49',.55)
        hero=layer(HERO,(340,415))
        blend(ground,hero,(155,264))
        sword=feather_cut((144,815,244,895),(125,95),16)
        blend(ground,sword,(95,680))
    elif key=='equipment':
        glow(ground,(290,475),260,'#fba64d',.65)
        machine=feather_cut((164,421,416,607),(460,350),34,bright=.99)
        blend(ground,machine,(102,383))
        e=layer(ICONS['gear'],(190,145));blend(ground,e,(222,240))
        weapon=layer(ICONS['battle'],(135,106));blend(ground,weapon,(92,628))
        rune=layer(ICONS['runes'],(125,98));blend(ground,rune,(419,635))
    elif key=='stations':
        glow(ground,(318,435),235,'#64d0bb',.42)
        tower=feather_cut((1360,438,1552,658),(345,390),32)
        blend(ground,tower,(164,308))
        ballista=feather_cut((162,430,412,603),(250,194),28)
        blend(ground,ballista,(64,599))
    elif key=='suppression':
        glow(ground,(320,345),250,'#e9626c',.44)
        beast=feather_cut((760,145,970,319),(390,335),23)
        blend(ground,beast,(130,278))
        skull=layer(ICONS['suppression'],(144,116));blend(ground,skull,(258,635))
    elif key=='runes':
        glow(ground,(320,420),270,'#8f78fc',.62)
        crystal=feather_cut((1175,413,1390,653),(360,430),27)
        blend(ground,crystal,(142,257))
        top=layer(ICONS['runes'],(172,132));blend(ground,top,(235,593))
    elif key=='skills':
        glow(ground,(320,382),275,'#b26ef6',.52)
        icon=layer(ICONS['skills'],(315,255))
        blend(ground,icon,(162,301))
        orbital=layer(ICONS['runes'],(130,100));blend(ground,orbital,(400,602))
        more=layer(ICONS['power'],(118,100));blend(ground,more,(115,620))
    elif key=='training':
        glow(ground,(320,397),252,'#fec96e',.52)
        gold=layer(ICONS['training'],(302,260))
        blend(ground,gold,(169,296))
        defender=layer(HERO,(190,235),.84)
        blend(ground,defender,(225,555))
    elif key=='research':
        glow(ground,(320,386),258,'#69e8c0',.45)
        vial=layer(ICONS['research'],(222,190));blend(ground,vial,(211,339))
        book=layer(ICONS['skills'],(180,150));blend(ground,book,(325,568))
        rune=layer(ICONS['runes'],(130,108));blend(ground,rune,(130,592))
    else:
        glow(ground,(315,405),230,'#a7cbe3',.4)
        blend(ground,layer(ICONS['hero'],(280,235)),(185,302))
    # End-frame carved rails, luminous glints, and parchment-colored corner knots.
    d=ImageDraw.Draw(ground)
    col=rgb(metal); golden=rgb(light)
    d.line((70,54, W-70,54),fill=(*col,156),width=5)
    d.line((70,H-60,W-70,H-60),fill=(*col,156),width=6)
    for (xx,yy) in ((79,66),(W-79,66),(79,H-70),(W-79,H-70)):
        d.polygon([(xx,yy-12),(xx+10,yy),(xx,yy+12),(xx-10,yy)],fill=(*golden,210),outline=(25,22,29,230))
    # Vignette keeps text-free artwork readable against any background.
    edge=Image.new('RGBA',(W,H),(0,0,0,0));v=ImageDraw.Draw(edge)
    for n in range(68):
        al=int((68-n)/68*1.25)
        v.rectangle((n,n,W-n-1,H-n-1),outline=(4,8,17,max(0,al)),width=1)
    ground=Image.alpha_composite(ground,edge)
    # Final pixel-art color reduction avoids fuzzy photographic UI aesthetics.
    palette=ground.convert('RGB').quantize(colors=192,method=Image.Quantize.FASTOCTREE).convert('RGB')
    palette.save(OUT/(key+'.webp'),format='WEBP',quality=88,method=6)
    print(key, (OUT/(key+'.webp')).stat().st_size)

for name,icon,accent,extras in [(x,None,None,None) for x in TINTS]:make_room(name,icon,accent,extras)
# contact sheet to QA all nine chamber scenes
im=Image.new('RGB',(9*210,280),'#141d28')
for idx,key in enumerate(TINTS):
    s=Image.open(OUT/(key+'.webp')).resize((200,272))
    im.paste(s,(idx*210+5,4))
(ROOT/'docs/chamber_art_contact.png').parent.mkdir(exist_ok=True)
im.save(ROOT/'docs/chamber_art_contact.png')
