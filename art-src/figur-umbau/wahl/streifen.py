"""Streifen in ECHTER Spielgroesse (Zelle 69 Geraetepunkte, Figur 52 hoch —
docs/figur-mass.md) und derselbe Inhalt vergroessert. Nie das eine ohne das andere."""
import sys
from PIL import Image
sys.path.insert(0, '/home/user/Wuselwerk/art-src/proben/figur2/wahl/bau')
from bau import Blatt, figurzelle, Z

SPIEL = 69
HIMMEL = (127, 178, 217)
ERDE = (74, 63, 53)

def zellen(blatt, hv, reihe='walking', n=8, phase0=0.0):
    bl = Blatt(blatt)
    k = min(n, len(bl.at['clips'][reihe]['anchors']))
    return [figurzelle(bl, reihe, i, hv, phase=phase0 + i * 0.8) for i in range(k)]

def pulk(zs, gr=SPIEL, schritt=0.60, boden=True, grund=HIMMEL):
    st = max(1, int(gr * schritt))
    w = st * (len(zs) - 1) + gr
    h = gr + (int(gr * 0.10) if boden else 0)
    im = Image.new('RGB', (w, h), grund)
    if boden:
        im.paste(Image.new('RGB', (w, h - gr), ERDE), (0, gr))
    for i, c in enumerate(zs):
        s = c.resize((gr, gr), Image.LANCZOS)
        im.paste(s, (i * st, 0), s)
    return im

def gross(zs, f=6, grund=HIMMEL):
    w = Z * len(zs)
    im = Image.new('RGB', (w, Z), grund)
    for i, c in enumerate(zs):
        im.paste(c, (i * Z, 0), c)
    return im.resize((w * f // 4, Z * f // 4), Image.LANCZOS)
