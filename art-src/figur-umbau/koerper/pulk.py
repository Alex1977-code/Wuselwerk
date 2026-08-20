import sys
sys.path.insert(0,'/home/user/Wuselwerk/art-src/proben/figur2/koerper')
from PIL import Image, ImageDraw
from zeigen import lade, zelle
B='/home/user/Wuselwerk/art-src/proben/figur2/koerper/blatt/%s/wuselwerker.webp'
VAR=[('v0','heute 0,67'),('s1','S1 0,59'),('s2','S2 0,51'),('s3','S3 0,42')]
GR=69                      # Zelle in Geraetepunkten (Spielgroesse)
LP=GR/17.003               # Punkte je logischem Pixel
def pulk(datei, abstand_lp, saum='#0C1020', grund=(58,74,58), n=20):
    schritt=abstand_lp*LP
    br=int(160+n*schritt+GR); ho=40+len(VAR)*(GR+22)
    bi=Image.new('RGB',(br,ho),grund); d=ImageDraw.Draw(bi)
    d.text((8,12),f'Pulk: {n} Figuren, Abstand {abstand_lp} logische Pixel '
                  f'(Kollisionsbreite ist 4) — Spielgroesse',fill=(235,235,235))
    for i,(v,lab) in enumerate(VAR):
        im,sa=lade(B%v,saum); y=40+i*(GR+22)
        d.text((8,y+GR//2),lab,fill=(235,235,235))
        for k in range(n):
            z=zelle(im,sa,0,(k*3)%8,GR)
            if k%3==2: z=z.transpose(Image.FLIP_LEFT_RIGHT)
            bi.paste(z.convert('RGB'),(int(150+k*schritt),y+((k%2)*2)),z)
    bi.save(datei); print(datei,bi.size)
if __name__=='__main__':
    P='/home/user/Wuselwerk/art-src/proben/figur2/koerper/bilder/'
    pulk(P+'03-pulk-eng.png',4)
    pulk(P+'04-pulk-locker.png',7)
