import sys
from PIL import Image
p=sys.argv[1]; n=int(sys.argv[2]) if len(sys.argv)>2 else 6
ims=[Image.open(f'out/{p}_{i}.png') for i in range(1,n+1)]
W=540;H=675;s=Image.new('RGB',(W*3+40,H*2+30),'#333')
for i,im in enumerate(ims): s.paste(im.convert('RGB').resize((W,H)),(10+(i%3)*(W+10),10+(i//3)*(H+10)))
s.save(f'out/{p}_sheet.jpg',quality=85)
