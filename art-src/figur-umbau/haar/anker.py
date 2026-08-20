"""Traegt das Manifest genug fuer GEZEICHNETES Haar? Kopfpunkt + Stirn ergeben
die Kopfachse; der Nacken muss daraus GERECHNET werden. Hier wird geprueft, ob
der gerechnete Nacken in allen 13 Posen wirklich im Haar landet."""
import json, math
import numpy as np
from PIL import Image

W = '/home/user/Wuselwerk/'
AT = json.load(open(W + 'src/art/wuselwerker.atlas.json'))
BL = Image.open(W + 'src/art/wuselwerker.webp').convert('RGBA')
Z = 112
PPL = AT['ppl']

def zelle(reihe, i):
    r = AT['clips'][reihe]['row']
    return BL.crop((i * Z, r * Z, (i + 1) * Z, (r + 1) * Z))

def masken(c):
    a = np.asarray(c).astype(int)
    al = a[..., 3] > 128
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    haar = al & (b > r + 20) & (b > g + 12)
    return al, haar

def lp(p):      # Blattpunkt -> logischer Pixel in der Zelle
    return (p[0] / PPL, p[1] / PPL)

def bp(p):      # logischer Pixel -> Blattpunkt
    return (p[0] * PPL, p[1] * PPL)

def nacken(a, s, dreh, tief=0.55, hinten=1.15):
    """Gerechneter Nackenpunkt: von der Kopfachse aus nach hinten und herunter.
    `hinten` in Kopfachsen, perspektivisch mit sin(dreh) verkuerzt."""
    ux, uy = s[0] - a[0], s[1] - a[1]           # Achse Gesicht -> Stirn
    L = math.hypot(ux, uy) or 1.8
    ux, uy = ux / L, uy / L
    # Bildebenen-Richtung "nach hinten": Achse um 90 Grad gedreht, Vorzeichen
    # so, dass es vom Gesicht wegzeigt (Figur blickt im Blatt nach rechts).
    hx, hy = uy, -ux
    k = math.sin(math.radians(dreh))            # Verkuerzung durch die Drehung
    return (a[0] + hx * L * hinten * k + ux * L * tief,
            a[1] + hy * L * hinten * k + uy * L * tief)
