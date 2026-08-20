import sys
from PIL import Image
sys.path.insert(0,'/home/user/Wuselwerk/art-src/proben/figur2/koerper')
from messen import klasse, PPL, Z
im = Image.open('/home/user/Wuselwerk/src/art/wuselwerker.webp').convert('RGBA')
CLIPS=['walking','falling','floating','climbing','hoisting','building','bashing','mining','digging','blocking','saving','dying','spaehen']
N=[8,4,4,4,6,8,3,4,3,2,6,8,6]
print('pose      bild  H  |  Bges  Bhaar Bhaut Btun  | Bges_lp Bhaar_lp Btun_lp | Ahaar%')
for r,(nm,n) in enumerate(zip(CLIPS,N)):
    for cI in range(n):
        c=im.crop((cI*Z,r*Z,cI*Z+Z,r*Z+Z)); px=c.load()
        w={'ALLE':0,'haar':0,'haut':0,'tunika':0}; ys=[]; flaeche={}
        for y in range(Z):
            ext={}
            for x in range(Z):
                p=px[x,y]
                if p[3]<=100: continue
                k=klasse(*p[:3])
                if k in ('grau','dunkel'): k='sonst'
                flaeche[k]=flaeche.get(k,0)+1; flaeche['ALLE']=flaeche.get('ALLE',0)+1
                for kk in (k,'ALLE'):
                    a=ext.setdefault(kk,[x,x]); a[0]=min(a[0],x); a[1]=max(a[1],x)
            if 'ALLE' in ext: ys.append(y)
            for kk in w:
                if kk in ext: w[kk]=max(w[kk], ext[kk][1]-ext[kk][0]+1)
        h=ys[-1]-ys[0]+1
        ah=flaeche.get('haar',0)/flaeche['ALLE']*100
        print(f'{nm:9s} {cI:3d} {h:3d} | {w["ALLE"]:5d} {w["haar"]:5d} {w["haut"]:5d} {w["tunika"]:5d} | '
              f'{w["ALLE"]/PPL:6.2f} {w["haar"]/PPL:7.2f} {w["tunika"]/PPL:7.2f} | {ah:5.1f}')
