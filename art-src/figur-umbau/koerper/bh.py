import sys
sys.path.insert(0,'/home/user/Wuselwerk/art-src/proben/figur2/koerper')
from PIL import Image
from messen import klasse, PPL, Z
CLIPS=['walking','falling','floating','climbing','hoisting','building','bashing','mining','digging','blocking','saving','dying','spaehen']
N=[8,4,4,4,6,8,3,4,3,2,6,8,6]
def mess(pfad):
    im=Image.open(pfad).convert('RGBA'); out={}
    for r,(nm,n) in enumerate(zip(CLIPS,N)):
        rr=[]
        for cI in range(n):
            c=im.crop((cI*Z,r*Z,cI*Z+Z,r*Z+Z)); px=c.load()
            ys=[];bmax=0;ybest=0;bh_=0;bt=0;A=0
            for y in range(Z):
                xs=[x for x in range(Z) if px[x,y][3]>100]
                if not xs: continue
                ys.append(y); b=max(xs)-min(xs)+1
                if b>bmax: bmax,ybest=b,y
                A+=len(xs)
                hx=[x for x in xs if klasse(*px[x,y][:3])=='haar']
                tx=[x for x in xs if klasse(*px[x,y][:3])=='tunika']
                if hx: bh_=max(bh_,max(hx)-min(hx)+1)
                if tx: bt=max(bt,max(tx)-min(tx)+1)
            h=ys[-1]-ys[0]+1
            rr.append(dict(h=h,b=bmax,bh=bh_,bt=bt,A=A,rel=(ybest-ys[0])/h))
        out[nm]=rr
    return out
if __name__=='__main__':
    for p in sys.argv[1:]:
        d=mess(p); alle=[f for v in d.values() for f in v]
        w=d['walking']
        print(f'{p.split("/")[-2]:12s} '
              f'gehen B/H {sum(f["b"]/f["h"] for f in w)/len(w):.3f}  '
              f'B {sum(f["b"] for f in w)/len(w)/PPL:.2f}lp  '
              f'Haar {sum(f["bh"] for f in w)/len(w)/PPL:.2f}  '
              f'Tunika {sum(f["bt"] for f in w)/len(w)/PPL:.2f}  '
              f'| alle: B/H max {max(f["b"]/f["h"] for f in alle):.3f} '
              f'Bmax {max(f["b"] for f in alle)/PPL:.2f}lp  '
              f'Flaeche {sum(f["A"] for f in alle)/len(alle):.0f}px  '
              f'breiteste Zeile bei {sum(f["rel"] for f in w)/len(w)*100:.0f}% von oben')
