import sys
sys.path.insert(0,'/home/user/Wuselwerk/art-src/proben/figur2/koerper')
from PIL import Image, ImageDraw
from zeigen import lade, zelle
B='/home/user/Wuselwerk/art-src/proben/figur2/koerper/blatt/%s/wuselwerker.webp'
VAR=[('v0','heute  B/H 0,67'),('s1','S1  0,59'),('s2','S2  0,51'),('s3','S3  0,42')]
SAUM='#0C1020'; GRUND=(58,74,58); RAND=110
def tafel(gr, datei, saum=SAUM, reihe=0, n=8, titel=''):
    br=RAND+n*gr; ho=40+len(VAR)*(gr+26)
    bild=Image.new('RGB',(br,ho),GRUND); d=ImageDraw.Draw(bild)
    d.text((8,12), titel or f'Zelle {gr} Punkte', fill=(235,235,235))
    for i,(v,lab) in enumerate(VAR):
        im,sa=lade(B%v, saum)
        y=40+i*(gr+26)
        d.text((8,y+gr//2), lab, fill=(235,235,235))
        for c in range(n):
            bild.paste(zelle(im,sa,reihe,c,gr).convert('RGB'),(RAND+c*gr,y),
                       zelle(im,sa,reihe,c,gr))
    bild.save(datei); print(datei, bild.size)
if __name__=='__main__':
    tafel(69,'/home/user/Wuselwerk/art-src/proben/figur2/koerper/bilder/01-gehen-echt.png',
          titel='Gehen — ECHTE Spielgroesse (Zelle 69 Punkte, Figur 52)')
    tafel(276,'/home/user/Wuselwerk/art-src/proben/figur2/koerper/bilder/02-gehen-4x.png',
          n=4, titel='Gehen — vierfach')
