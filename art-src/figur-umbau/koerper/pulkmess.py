import sys
sys.path.insert(0,'/home/user/Wuselwerk/art-src/proben/figur2/koerper')
from PIL import Image
from zeigen import lade, zelle
from messen import klasse
B='/home/user/Wuselwerk/art-src/proben/figur2/koerper/blatt/%s/wuselwerker.webp'
GR=69; LP=GR/17.003
def bau(v,ab,n=20,saum='#0C1020'):
    im,sa=lade(B%v,saum); s=ab*LP
    bi=Image.new('RGBA',(int(n*s+GR+8),GR+8),(0,0,0,0))
    for k in range(n):
        z=zelle(im,sa,0,(k*3)%8,GR)
        if k%3==2: z=z.transpose(Image.FLIP_LEFT_RIGHT)
        bi.alpha_composite(z,(int(4+k*s),4+(k%2)*2))
    return bi
def inseln(bi,pruef):
    px=bi.load(); W,H=bi.size; seen=[[0]*H for _ in range(W)]; n=0
    for x in range(W):
        for y in range(H):
            if seen[x][y] or not pruef(px[x,y]): continue
            n+=1; st=[(x,y)]; seen[x][y]=1; gr=0
            while st:
                a,b=st.pop(); gr+=1
                for da,db in((1,0),(-1,0),(0,1),(0,-1)):
                    c,d2=a+da,b+db
                    if 0<=c<W and 0<=d2<H and not seen[c][d2] and pruef(px[c,d2]):
                        seen[c][d2]=1; st.append((c,d2))
            if gr<6: n-=1
    return n
haut=lambda p: p[3]>120 and klasse(*p[:3])=='haut'
voll=lambda p: p[3]>60
print('Var   Abst  Gesichter(von 20)  Fuellgrad des Bandes  Loecher')
for ab in (4,7):
    for v in ('v0','s1','s2','s3'):
        bi=bau(v,ab); px=bi.load(); W,H=bi.size
        A=sum(1 for x in range(W) for y in range(H) if px[x,y][3]>60)
        xs=[x for x in range(W) if any(px[x,y][3]>60 for y in range(H))]
        band=(max(xs)-min(xs)+1)*H
        print(f'{v:5s} {ab:4d} {inseln(bi,haut):16d} {A/band*100:20.1f}% {inseln(bi,lambda p:p[3]<=60):8d}')
