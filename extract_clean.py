"""Create a layered, combat-free pixel-art battlefield from the project's original scenic art.

No generated enemy, floating-number, projectile or hit-effect pixels belong in
our static environment. Gameplay monsters and effects are separately drawn live.
Requires Pillow; deterministic and repeatable for GitHub CI.
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import math, random
ROOT=Path(__file__).resolve().parent
SRC=ROOT/'assets'/'battlefield_source.png'
if not SRC.exists():
    # Initial migration: keep a pristine copy of the original for repeatable builds.
    from shutil import copyfile
    copyfile(ROOT/'assets'/'battlefield.png',SRC)
source=Image.open(SRC).convert('RGB')
if source.size != (960,540):
    raise ValueError('Expected 960×540 original terrain illustration')
W,H=source.size
rand=random.Random(731048)
canvas=Image.new('RGB',(W,H),(51,82,77))
draw=ImageDraw.Draw(canvas)
# Keep the full scenic upper horizon—waterfalls, castle, sunset—from original art.
canvas.paste(source.crop((0,0,W,77)),(0,0))
# Content-aware scenic replacements: use nearby authentic landscape from the
# source illustration to conceal the old boss, health bar, and painted banners.
def patch_horizon(dst,donor,feather=13):
    x0,y0,x1,y1=dst
    patch=source.crop(donor).resize((x1-x0,y1-y0),Image.Resampling.BICUBIC)
    m=Image.new('L',patch.size,255)
    md=ImageDraw.Draw(m)
    # feather all sides to blend into the existing sky, mountains and waterfalls
    for j in range(feather):
        c=int(255*(j+1)/feather)
        md.rectangle((j,j,patch.width-1-j,patch.height-1-j),outline=c,width=1)
    canvas.paste(patch,(x0,y0),m.filter(ImageFilter.GaussianBlur(3)))
patch_horizon((312,35,407,103),(150,35,245,103),11)
patch_horizon((464,20,664,107),(105,20,305,107),14)
patch_horizon((813,70,945,113),(20,70,152,113),9)

# Base meadow gradients on a pixel grid. The green/yellow richness is adapted from the
# original painted terrain, rather than a generic flat-color placeholder.
for y in range(77,346):
    f=(y-77)/269
    for x in range(0,W,3):
        r=rand.randint(-9,9)
        c=(round(76+44*f+r),round(115+27*f+r),round(83-9*f+r//2))
        draw.rectangle((x,y,x+2,y),fill=c)
# Atmosphere: misty rolling woodland at the far end of the road.
for band in range(3):
    yy=86+band*16
    pts=[(0,yy+rand.randrange(0,10))]
    for x in range(0,W+12,8): pts.append((x,yy+rand.randrange(-8,9)))
    pts += [(W,145+band*9),(0,145+band*9)]
    col=[(58,99,107),(51,96,92),(52,100,73)][band]
    draw.polygon(pts,fill=col)
# A real wooded background, layered pines with highlights, bark and branch depth.
for layer in (0,1,2):
    rng=random.Random(2020+layer)
    count=(65,73,46)[layer]
    for _ in range(count):
        x=rng.randint(-25,985)
        ht=rng.randrange(19+layer*9,42+layer*19)
        foot=104+layer*17+rng.randrange(-12,13)
        sz=max(5,int(ht*.38))
        cols=[('#416d75','#699083'),('#35615b','#4f8372'),('#2f674e','#5a8658')][layer]
        draw.rectangle((x-2,foot-12,x+2,foot+3),fill='#3c584d')
        for k in range(4):
            yt=foot-ht+int(k*ht*.22)
            extent=int(sz*(.42+.26*k))
            draw.polygon([(x,yt-9),(x-extent,yt+13),(x+extent,yt+13)],fill=cols[0])
            if rng.random()<.68:
                draw.line((x-extent//2,yt+5,x+1,yt+1),fill=cols[1],width=2)
# Rebuild the entire combat lane with natural pixel textures. This is a true blank
# battlefield: not one baked-in monster, bullet, status effect, or damage number.
ground=Image.new('RGB',(W,245),(110,140,81))
gd=ImageDraw.Draw(ground)
for y in range(245):
    depth=y/245
    for x in range(0,W,3):
        value=rand.randrange(-10,11)
        shade=(int(96+33*depth+value),int(126+25*depth+value),int(75+8*depth+value//2))
        gd.rectangle((x,y,x+2,y),fill=shade)
# Painterly ground detail sampled from safe grass in the original 32-bit artwork.
pat=source.crop((126,226,173,256)).resize((94,60),Image.Resampling.NEAREST)
for y in range(-15,245,45):
    for x in range(-30,W,76):
        tile=pat.transpose(rand.choice([Image.Transpose.FLIP_LEFT_RIGHT,Image.Transpose.FLIP_TOP_BOTTOM,Image.Transpose.ROTATE_180]))
        mask=Image.new('L',tile.size,0)
        md=ImageDraw.Draw(mask); md.ellipse((3,2,91,58),fill=rand.randint(68,125))
        ground.paste(tile,(x+rand.randrange(-14,15),y+rand.randrange(-10,11)),mask)
gd=ImageDraw.Draw(ground)
# Path converges in perspective towards the horizon (center ~500), and expands
# toward the wall. It remains clean and deliberately low-noise for approaching foes.
edgeLeft=[];edgeRight=[]
for y in range(245):
    realy=101+y
    depth=y/245
    center=491+math.sin(y*.024)*12
    radius=38+133*(depth**1.23)
    edgeLeft.append((round(center-radius+math.sin(y*.14)*4),y))
    edgeRight.append((round(center+radius+math.cos(y*.11)*6),y))
road=edgeLeft+list(reversed(edgeRight))
gd.polygon(road, fill='#bd9664')
# Soil/cobblestone detail, using real painted path texture from the prior artwork.
soil=source.crop((664,296,701,325)).resize((85,68),Image.Resampling.NEAREST)
clip=Image.new('L',(W,245),0);ImageDraw.Draw(clip).polygon(road,fill=195)
soil_layer=Image.new('RGB',(W,245),'#af885c')
for y in range(0,245,55):
    for x in range(250,790,76):
        tile=soil.transpose(rand.choice([Image.Transpose.FLIP_LEFT_RIGHT,Image.Transpose.FLIP_TOP_BOTTOM]))
        soil_layer.paste(tile,(x+rand.randrange(-16,14),y+rand.randrange(-7,8)))
# road mask blurred only around its outline; keep sprite-like pixel crispness inside
clip=clip.filter(ImageFilter.GaussianBlur(1.0))
ground.paste(soil_layer,(0,0),clip)
gd=ImageDraw.Draw(ground)
for i in range(1750):
    y=rand.randrange(5,243);x=rand.randrange(8,952)
    depth=y/245
    center=491+math.sin(y*.024)*12
    path=abs(x-center)<(43+133*depth**1.23)
    if path: 
        if rand.random()<.31:
            color=rand.choice(['#d8ad70','#986f54','#e2b573','#b07c54'])
            width=rand.randrange(1,4)
            gd.rectangle((x,y,x+width,y+rand.randrange(1,4)),fill=color)
    else:
        color=rand.choice(['#6f8f45','#4f843f','#b3ae68','#d6c177','#d0ad75','#6d9757'])
        gd.line((x,y,x+rand.randrange(-2,3),y-rand.randrange(2,7)),fill=color,width=rand.choice([1,1,2]))
        if rand.random()<.09 and depth>.22:
            gd.ellipse((x-1,y-3,x+2,y),fill=rand.choice(['#eadc9b','#ebc9cb','#cbb6ed']))
# Little stepped stones, darker farther from the audience.
for i in range(73):
    y=rand.randint(35,240);x=rand.randrange(60,920)
    dep=(y+20)/245
    width=max(2,int(dep*rand.randint(3,10)))
    gd.polygon([(x,y),(x+width,y-2),(x+width+3,y),(x+width+1,y+3),(x-2,y+2)],fill=rand.choice(['#60785e','#75875f','#988d65']))
    gd.line((x,y,x+width,y-2),fill='#b0a080',width=1)
# Lay the clean field in, allowing one row of distant foliage to overlap the horizon.
canvas.paste(ground,(0,101))
# Use original hand-painted tree texture to frame the approach, avoiding banner/enemies.
left=source.crop((0,30,79,245));right=left.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
mask=Image.new('L',left.size);md=ImageDraw.Draw(mask)
md.polygon([(0,0),(79,0),(68,60),(75,114),(52,170),(35,215),(0,215)],fill=255)
mask=mask.filter(ImageFilter.GaussianBlur(2))
canvas.paste(left,(0,30),mask)
canvas.paste(right,(W-79,30),mask.transpose(Image.Transpose.FLIP_LEFT_RIGHT))
# Preserve the actual meticulously painted stone battlement from the original.
# This is re-drawn *after* the independent enemy actors, so invaders cannot
# incorrectly walk in front of the wall.
foreground=Image.new('RGBA',(W,H),(0,0,0,0))
foreground.paste(source.crop((0,341,W,H)).convert('RGBA'),(0,341))
# Wall turrets stand in front of the field. Masks deliberately avoid baked-in
# projectiles or enemies that appeared in the previous composite.
def polygon(mask,coordinates,feather=1):
    d=ImageDraw.Draw(mask);d.polygon(coordinates,fill=255)
    return mask.filter(ImageFilter.GaussianBlur(feather))
def restore(points,blur=1):
    m=Image.new('L',(W,H),0);m=polygon(m,points,blur)
    foreground.paste(source.convert('RGBA'),(0,0),m)
# Ballista body and base, without the old diagonal projectile trails.
restore([(0,305),(28,288),(37,269),(104,258),(166,264),(216,288),(202,312),(179,340),(0,349)])
# Midas station pedestal and magical socket, not the old simulated damage effect.
restore([(210,340),(226,312),(238,294),(274,287),(305,302),(324,341)])
# Frost beacon and crystalline tower hardware.
restore([(796,341),(807,318),(832,300),(863,298),(886,318),(909,340)])
# The original detailed hero was integrated into the poster. Extract only the
# upper body above battlements; the lower body is already preserved in wall layer.
restore([(428,341),(465,334),(485,313),(489,294),(517,290),(545,302),(554,326),(574,326),(586,314),(609,326),(631,342)])
# Crucial: no damage text or monster is preserved anywhere in the foreground.
# The old lower decorative ability icons are retained as architectural trim.
background_path=ROOT/'assets'/'battlefield.png'
foreground_path=ROOT/'assets'/'foreground.png'
canvas.save(background_path,optimize=True)
foreground.save(foreground_path,optimize=True)
print('Wrote clean battlefield:',background_path,'and layered battlements:',foreground_path)

