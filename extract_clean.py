from PIL import Image,ImageDraw,ImageFilter
import cv2, numpy as np
from pathlib import Path
root=Path(__file__).resolve().parent;src_path=root/'art'/'source_composition.png';src=Image.open(src_path).convert('RGBA')
def custom(name,box,parts):
 a=src.crop(box);mask=Image.new('L',a.size);d=ImageDraw.Draw(mask)
 for shape in parts:d.polygon(shape,fill=255)
 mask=mask.filter(ImageFilter.GaussianBlur(.55));a.putalpha(mask)
 a.save(root/'assets'/f'{name}.png')
 return a
# Coordinates relative to source crops; each polygon follows pixel-art silhouette.
gob=custom('goblin',(470,350,564,457),[
 [(27,21),(32,15),(45,12),(55,17),(59,24),(72,18),(80,19),(74,35),(76,42),(68,48),(58,48),(52,51),(38,49),(32,45),(25,39),(19,38),(23,28)],
 [(25,31),(18,32),(13,37),(8,46),(6,55),(4,65),(11,72),(20,68),(23,60),(30,57),(37,52)],
 [(61,32),(66,39),(78,42),(81,47),(85,49),(88,61),(85,68),(72,71),(67,63),(60,58)],
 [(27,46),(57,46),(63,63),(59,79),(48,82),(32,76),(25,65)],
 [(31,74),(42,72),(45,92),(40,96),(20,95),(22,85)],
 [(48,75),(59,74),(66,87),(66,95),(47,95),(43,87)]
])
sk=custom('skeleton',(1120,306,1231,428),[
 # skull / neck
 [(58,18),(67,14),(77,16),(83,23),(85,33),(81,43),(70,47),(57,42),(53,32)],
 # arms + sword
 [(51,39),(59,44),(52,52),(42,55),(36,59),(24,52),(20,45),(27,44),(34,50)],
 [(27,48),(20,36),(23,31),(36,39),(47,51),(42,56)],
 # armor and legs
 [(63,40),(81,39),(87,47),(88,61),(78,65),(68,60),(63,54),(57,64),(60,72),(54,75),(45,72),(51,61),(57,49)],
 [(78,57),(83,60),(92,67),(91,75),(76,73),(69,67)],
 # shield
 [(86,35),(100,40),(102,51),(97,60),(88,64),(79,55),(79,44)]
])
# Pixel-painting cutouts created using GrabCut on the original composition.
# This script is optional tooling (Pillow + OpenCV). Runtime does NOT use Python.
original=cv2.imread(str(src_path))
for typ,box in {'warg':(1060,352,1187,439),'ogre':(764,158,985,343),'hero':(695,468,930,715)}.items():
 x1,y1,x2,y2=box
 crop=original[y1:y2,x1:x2].copy();h,w=crop.shape[:2]
 mask=np.zeros((h,w),np.uint8);bg=np.zeros((1,65),np.float64);fg=np.zeros((1,65),np.float64)
 cv2.grabCut(crop,mask,(4,4,w-8,h-8),bg,fg,7,cv2.GC_INIT_WITH_RECT)
 alpha=np.where((mask==2)|(mask==0),0,255).astype('uint8')
 alpha=cv2.morphologyEx(alpha,cv2.MORPH_OPEN,np.ones((2,2),np.uint8))
 rgba=cv2.cvtColor(crop,cv2.COLOR_BGR2RGBA);rgba[:,:,3]=alpha
 Image.fromarray(rgba).save(root/'assets'/f'{typ}.png')
# The 32-bit style bat-imp is experimental and not in the active spawn pool.
print('Rebuilt sprite cutouts. Review before distributing.')
