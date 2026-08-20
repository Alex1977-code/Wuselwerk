"""Rendert JEDE Kombination aus Koerper-, Haar- und Posenvariante — und zwar so,
wie das Spiel sie zeichnet: mit SAUM je Ebene (src/render/atlas.ts SAUM_PX 2,
src/render/werkzeug.ts SAUM_PX 0,24 lp). Die Haar-Werkstatt hat ohne Saum
gerendert; das unterschlaegt genau den Kontrast, von dem die Straehnen leben."""
import json, math, sys
import numpy as np
from PIL import Image
from scipy import ndimage

W = '/home/user/Wuselwerk/'
sys.path.insert(0, W + 'art-src/proben/figur2/haar/bau')
import zeichnen as ZE
from varianten import V, DREI, SECHS, ZOPF, STAFFEL, SEITE

Z = 112
SAUM_TON = (12, 16, 32)
SAUM_PX = 2

BLATT = dict(
    heute=W + 'src/art/',
    s1=W + 'art-src/proben/figur2/koerper/blatt/s1/',
    s2=W + 'art-src/proben/figur2/koerper/blatt/s2/',
    s3=W + 'art-src/proben/figur2/koerper/blatt/s3/',
    s2p=W + 'art-src/proben/figur2/wahl/blatt/s2p/',
    s3p=W + 'art-src/proben/figur2/wahl/blatt/s3p/',
)

class Blatt:
    def __init__(self, name):
        d = BLATT[name]
        self.at = json.load(open(d + 'wuselwerker.atlas.json'))
        self.im = Image.open(d + 'wuselwerker.webp').convert('RGBA')
        self.ppl = self.at['ppl']
    def zelle(self, reihe, i):
        r = self.at['clips'][reihe]['row']
        return self.im.crop((i * Z, r * Z, (i + 1) * Z, (r + 1) * Z))

def masken(c, ppl):
    a = np.asarray(c).astype(int)
    al = a[..., 3] > 128
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return al, al & (b > r + 20) & (b > g + 12)

def stutzen(c, a, s, rx, ry, mitte, dreh, ppl):
    """Kappe kappen: Haar ausserhalb einer Ellipse um die Kopfmitte faellt weg.
    Die Loeschmaske wird geweitet, sonst bleibt der weiche Saum als Geisterstrich."""
    u, rechts, L, _ = ZE.kopf(a, s, 0)
    C = ZE.mitte(a, s, dreh, mitte)
    arr = np.array(c).astype(np.int16)
    _, haar = masken(c, ppl)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    haut = (r > 118) & (r >= g) & (r > b)
    yy, xx = np.mgrid[0:Z, 0:Z]
    dx = xx / ppl - C[0]; dy = yy / ppl - C[1]
    lx = (dx * rechts[0] + dy * rechts[1]) / L
    ly = (dx * u[0] + dy * u[1]) / L
    aus = (lx / rx) ** 2 + (ly / ry) ** 2 > 1.0
    weg = ndimage.binary_dilation(haar & aus, np.ones((5, 5))) & aus & ~haut
    arr[..., 3][weg] = 0
    return Image.fromarray(arr.astype(np.uint8), 'RGBA')

def saum(im, ton=SAUM_TON, px=SAUM_PX, fein=1):
    """fein>1: Saum auf hochgerechneter Ebene, damit Bruchteile von Blattpunkten
    moeglich sind. Gezeichnetes Werkzeug hat SAUM_PX 0,24 lp = 1,58 Blattpunkte,
    das Blatt selbst 2,0 — mit ganzen Punkten waere der Unterschied nicht
    darstellbar, und der Saum ist bei einer 0,5-Pixel-Straehne die halbe Tinte."""
    if fein > 1:
        gr = (im.width * fein, im.height * fein)
        s = saum(im.resize(gr, Image.LANCZOS), ton, int(round(px * fein)))
        return s.resize(im.size, Image.LANCZOS)
    return _saum1(im, ton, px)

def _saum1(im, ton=SAUM_TON, px=SAUM_PX):
    a = Image.new('RGBA', im.size, (0, 0, 0, 0))
    for dx, dy in ((-px,0),(px,0),(0,-px),(0,px),(-px,-px),(px,-px),(-px,px),(px,px)):
        a.alpha_composite(im, dest=(max(dx,0), max(dy,0)), source=(max(-dx,0), max(-dy,0)))
    f = Image.new('RGBA', im.size, ton + (255,))
    f.putalpha(a.getchannel('A'))
    return f

def figurzelle(bl, reihe, i, hv=None, mit_saum=True, drift=(0,0), phase=0.0):
    """Eine fertige Zelle: Straehnen hinten, Figur, Straehnen vorn — je mit Saum."""
    c = bl.at['clips'][reihe]
    a, s, dreh = c['anchors'][i], c['stirn'][i], c['dreh']
    z = bl.zelle(reihe, i)
    ZE.PPL = bl.ppl                     # Haarcode rechnet in Blattpunkten
    if hv and hv.get('stutz'):
        z = stutzen(z, a, s, *hv['stutz'], dreh=dreh, ppl=bl.ppl)
    out = Image.new('RGBA', (Z, Z), (0, 0, 0, 0))
    if hv and hv['zahl'] + hv.get('zahlvorn', 0) > 0:
        _, hm = masken(z, bl.ppl)
        lg = ZE.strahnen(a, s, dreh, hv, hm, drift, phase)
        for k, wann in (('hinten', True), (None, None), ('vorn', False)):
            if k is None:
                if mit_saum: out.alpha_composite(saum(z))
                out.alpha_composite(z); continue
            e = lg[k]
            if mit_saum: out.alpha_composite(saum(e, px=1.58, fein=4))
            out.alpha_composite(e)
    else:
        if mit_saum: out.alpha_composite(saum(z))
        out.alpha_composite(z)
    return out
