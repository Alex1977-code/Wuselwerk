import sys, colorsys
from PIL import Image

PPL = 6.5870728694936185
Z = 112

def klasse(r,g,b):
    mx, mn = max(r,g,b), min(r,g,b)
    if mx < 60 and mx-mn < 30: return 'dunkel'
    h,s,v = colorsys.rgb_to_hsv(r/255,g/255,b/255)
    hd = h*360
    if s < 0.18: return 'grau'
    if 190 <= hd <= 275: return 'haar'      # blau
    if 60 <= hd < 190:  return 'tunika'     # gruen
    return 'haut'                            # rot/orange/gelb

def profil(im, col, row, name=''):
    c = im.crop((col*Z, row*Z, col*Z+Z, row*Z+Z))
    px = c.load()
    zeilen = []
    for y in range(Z):
        xs = [x for x in range(Z) if px[x,y][3] > 100]
        if not xs: zeilen.append(None); continue
        kl = {}
        for x in xs:
            r,g,b,a = px[x,y]
            k = klasse(r,g,b); kl[k] = kl.get(k,0)+1
        zeilen.append((min(xs), max(xs), len(xs), kl))
    return zeilen

if __name__ == '__main__':
    im = Image.open('/home/user/Wuselwerk/src/art/wuselwerker.webp').convert('RGBA')
    row = int(sys.argv[1]) if len(sys.argv)>1 else 0
    col = int(sys.argv[2]) if len(sys.argv)>2 else 0
    z = profil(im, col, row)
    ys = [i for i,v in enumerate(z) if v]
    print(f'Zeile {row} Bild {col}: y {ys[0]}..{ys[-1]}  Hoehe {(ys[-1]-ys[0]+1)/PPL:.2f} lp')
    breit = max(v[1]-v[0]+1 for v in z if v)
    print(f'max Breite {breit} px = {breit/PPL:.2f} lp   B/H = {breit/(ys[-1]-ys[0]+1):.3f}')
    print(' y   rel%   x0  x1   B_px  B_lp   haar tunika haut dunkel grau')
    for y in ys:
        x0,x1,n,kl = z[y]
        rel = (y-ys[0])/(ys[-1]-ys[0])*100
        print(f'{y:3d} {rel:5.1f}  {x0:3d} {x1:3d}  {x1-x0+1:4d} {(x1-x0+1)/PPL:5.2f}  '
              f'{kl.get("haar",0):4d} {kl.get("tunika",0):5d} {kl.get("haut",0):5d} {kl.get("dunkel",0):5d} {kl.get("grau",0):4d}')
