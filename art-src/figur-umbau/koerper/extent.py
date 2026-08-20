import sys, colorsys
from PIL import Image
sys.path.insert(0,'/home/user/Wuselwerk/art-src/proben/figur2/koerper')
from messen import klasse, PPL, Z

im = Image.open('/home/user/Wuselwerk/src/art/wuselwerker.webp').convert('RGBA')

def zeile(row, col):
    c = im.crop((col*Z, row*Z, col*Z+Z, row*Z+Z)); px = c.load()
    out=[]
    for y in range(Z):
        ext={}
        for x in range(Z):
            p=px[x,y]
            if p[3]<=100: continue
            k=klasse(*p[:3])
            if k in ('grau','dunkel'): k='sonst'
            a=ext.setdefault(k,[x,x]); a[0]=min(a[0],x); a[1]=max(a[1],x)
            a2=ext.setdefault('ALLE',[x,x]); a2[0]=min(a2[0],x); a2[1]=max(a2[1],x)
        out.append(ext)
    return out

CLIPS=['walking','falling','floating','climbing','hoisting','building','bashing','mining','digging','blocking','saving','dying','spaehen']
N=[8,4,4,4,6,8,3,4,3,2,6,8,6]
print('pose      bild  H_px  Bmax_px  B/H   ymax%  wer_ist_breit')
for r,(nm,n) in enumerate(zip(CLIPS,N)):
    for cIdx in range(n):
        z=zeile(r,cIdx)
        ys=[i for i,e in enumerate(z) if 'ALLE' in e]
        if not ys: continue
        h=ys[-1]-ys[0]+1
        bmax=0; ybest=0
        for y in ys:
            b=z[y]['ALLE'][1]-z[y]['ALLE'][0]+1
            if b>bmax: bmax,ybest=b,y
        e=z[ybest]
        wer=' '.join(f'{k}:{v[1]-v[0]+1}' for k,v in e.items() if k!='ALLE')
        print(f'{nm:9s} {cIdx:3d}  {h:4d} {bmax:6d}  {bmax/h:.3f}  {(ybest-ys[0])/h*100:5.1f}  {wer}')
