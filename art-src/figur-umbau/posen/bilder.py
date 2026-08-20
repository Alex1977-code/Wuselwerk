"""Beweisbilder: immer paarweise — oben echte Spielgroesse, unten vergroessert."""
from PIL import Image, ImageDraw
import sys
sys.path.insert(0, '/home/user/Wuselwerk/art-src/proben/figur2/posen/bau')
from mess import zellen, raster

SPIEL = 74     # Zelle auf einem heutigen Telefon, in Geraetepunkten (docs/figur-mass.md)
GRUND = (38, 44, 54, 255)

def _streifen(zs, kante, luft=6, hg=GRUND, gitter=False):
    n = len(zs)
    b = Image.new('RGBA', (n*(kante+luft)+luft, kante+2*luft), hg)
    for i, z in enumerate(zs):
        k = z.resize((kante, kante), Image.NEAREST if gitter else Image.LANCZOS)
        b.alpha_composite(k, (luft+i*(kante+luft), luft))
    return b

def _rasterbild(z, kante=17, zoom=8):
    s = raster(z, kante)
    b = Image.new('RGBA', (kante*zoom, kante*zoom), (24, 26, 32, 255))
    d = ImageDraw.Draw(b)
    for y in range(kante):
        for x in range(kante):
            if s[y][x]:
                d.rectangle([x*zoom, y*zoom, x*zoom+zoom-1, y*zoom+zoom-1], fill=(215, 228, 245, 255))
    return b

def paar(blatt, pose, ziel, titel='', zoom=3):
    zs = zellen(blatt, pose)
    oben = _streifen(zs, SPIEL)
    unten = _streifen(zs, 112*zoom//2)
    b = Image.new('RGBA', (max(oben.width, unten.width), oben.height+unten.height+22), GRUND)
    b.alpha_composite(oben, (0, 20)); b.alpha_composite(unten, (0, oben.height+20))
    ImageDraw.Draw(b).text((6, 5), titel, fill=(190, 205, 225, 255))
    b.save(ziel); return ziel

def reihen(eintraege, ziel, kante=SPIEL, mitgitter=False):
    """eintraege: [(blatt, pose, beschriftung)] — je Zeile ein Filmstreifen in Spielgroesse."""
    st = [(_streifen(zellen(b, p), kante), t) for b, p, t in eintraege]
    br = max(s.width for s, _ in st) + 150
    ho = sum(s.height for s, _ in st)
    b = Image.new('RGBA', (br, ho), GRUND)
    d = ImageDraw.Draw(b)
    y = 0
    for s, t in st:
        b.alpha_composite(s, (150, y))
        d.text((8, y + s.height//2 - 5), t, fill=(200, 214, 234, 255))
        y += s.height
    b.save(ziel); return ziel

def gitterreihen(eintraege, ziel, zoom=7):
    """Dasselbe im logischen 17er-Raster — die Groesse, in der gemessen wird."""
    zeilen = []
    for bl, p, t in eintraege:
        zs = zellen(bl, p)
        bs = [_rasterbild(z, 17, zoom) for z in zs]
        w = Image.new('RGBA', (len(bs)*(17*zoom+4)+4, 17*zoom+8), GRUND)
        for i, im in enumerate(bs):
            w.alpha_composite(im, (4+i*(17*zoom+4), 4))
        zeilen.append((w, t))
    br = max(w.width for w, _ in zeilen)+150
    b = Image.new('RGBA', (br, sum(w.height for w, _ in zeilen)), GRUND)
    d = ImageDraw.Draw(b); y = 0
    for w, t in zeilen:
        b.alpha_composite(w, (150, y)); d.text((8, y+w.height//2-5), t, fill=(200, 214, 234, 255)); y += w.height
    b.save(ziel); return ziel
