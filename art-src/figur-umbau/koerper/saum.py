import sys
sys.path.insert(0,'/home/user/Wuselwerk/art-src/proben/figur2/koerper')
from PIL import Image
from zeigen import lade, zelle
B='/home/user/Wuselwerk/art-src/proben/figur2/koerper/blatt/%s/wuselwerker.webp'
def masse(bild):
    px=bild.load(); W,H=bild.size; xs=[];A=0;bmax=0
    for y in range(H):
        r=[x for x in range(W) if px[x,y][3]>60]
        if r: A+=len(r); bmax=max(bmax,max(r)-min(r)+1); xs.append(y)
    return bmax,A,(xs[-1]-xs[0]+1 if xs else 0)
print('Var    Zelle  B ohne  B mit  Saum je Seite  Flaeche ohne  mit   Saum-Anteil  Kern bleibt')
for v in ('v0','s1','s2','s3'):
    for gr in (69,):
        im,sa=lade(B%v,'#0C1020')
        for c in (0,):
            o=zelle(im,None,0,c,gr); m=zelle(im,sa,0,c,gr)
            bo,Ao,ho=masse(o); bm,Am,hm=masse(m)
            print(f'{v:5s} {gr:5d} {bo:7d} {bm:6d} {(bm-bo)/2:14.1f} {Ao:13d} {Am:5d} '
                  f'{(Am-Ao)/Am*100:11.1f}% {Ao/Am*100:9.1f}%')
