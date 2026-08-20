"""Strichprobe: Ab welcher Laenge/Breite liest sich eine Straehne bei
Spielgroesse als LINIE und nicht als Fleck oder Punktreihe?

Kette wie im Spiel: zeichnen bei Blattaufloesung (6-fach ueberabgetastet wie
scripts/bake-figur.mjs), dann auf Spielgroesse herunterrechnen.
"""
import math, json
from PIL import Image, ImageDraw
import numpy as np

PPL_BLATT = 6.5870728694936185      # Blattpunkte je logischem Pixel
ZELLE_BLATT = 112
ZELLE_SPIEL = 74                     # iPhone 14, dpr 2 (docs/figur-mass.md)
PPL_SPIEL = ZELLE_SPIEL / 17.003     # 4,352 Geraetepunkte je logischem Pixel
UEBER = 6                            # Ueberabtastung wie beim Backen
HAAR = (56, 81, 182)                 # #3851B6, gemessener Haarton
HIMMEL = (127, 178, 217)

def strich(laenge_lp, breite_lp, winkel_grad, welle=0.0):
    """Eine Straehne allein auf Himmel, fertig heruntergerechnet auf Spielgroesse."""
    rand = 6
    W = int((laenge_lp + 2 * rand) * PPL_BLATT)
    H = W
    im = Image.new('RGB', (W * UEBER, H * UEBER), HIMMEL)
    d = ImageDraw.Draw(im)
    s = PPL_BLATT * UEBER
    x0, y0 = rand * s, rand * s
    a = math.radians(winkel_grad)
    n = 24
    pts = []
    for i in range(n + 1):
        t = i / n
        # Welle quer zur Strichrichtung — eine haengende Straehne ist nie gerade
        q = math.sin(t * math.pi) * welle * s
        px = x0 + math.cos(a) * t * laenge_lp * s - math.sin(a) * q
        py = y0 + math.sin(a) * t * laenge_lp * s + math.cos(a) * q
        pts.append((px, py))
    d.line(pts, fill=HAAR, width=max(1, int(breite_lp * s)), joint='curve')
    im = im.resize((W, H), Image.LANCZOS)                       # -> Blatt
    z = max(2, int(round(W * PPL_SPIEL / PPL_BLATT)))
    return im.resize((z, z), Image.LANCZOS)                      # -> Spiel

def messen(im):
    a = np.asarray(im).astype(float)
    # Deckung: 0 = Himmel, 1 = voller Haarton
    hv = np.array(HAAR, float) - np.array(HIMMEL, float)
    deck = ((a - np.array(HIMMEL, float)) @ hv) / (hv @ hv)
    deck = np.clip(deck, 0, 1)
    m = deck >= 0.5
    if m.sum() < 1:
        return dict(sichtbar=False)
    ys, xs = np.nonzero(m)
    pts = np.stack([xs, ys], 1).astype(float)
    mit = pts.mean(0)
    c = np.cov((pts - mit).T) if len(pts) > 1 else np.zeros((2, 2))
    ew = np.sort(np.linalg.eigvalsh(c))[::-1] if len(pts) > 1 else np.zeros(2)
    lang = 2 * math.sqrt(max(ew[0], 1e-9))
    quer = 2 * math.sqrt(max(ew[1], 1e-9))
    # Zusammenhang: eine Linie ist EIN Klecks, eine Punktreihe sind mehrere
    from scipy import ndimage
    _, teile = ndimage.label(m, structure=np.ones((3, 3)))
    return dict(sichtbar=True, spitze=round(float(deck.max()), 2),
                punkte=int(m.sum()), lang=round(float(lang), 2),
                quer=round(float(quer), 2),
                schlank=round(float(lang / max(quer, 0.35)), 2), teile=int(teile))

def kamm(n, breite_lp, luecke_lp, laenge_lp=6.0):
    """n parallele Straehnen mit Luecke dazwischen — liest man sie einzeln?"""
    rand = 3
    spann = (n - 1) * (breite_lp + luecke_lp)
    W = int((spann + 2 * rand) * PPL_BLATT)
    H = int((laenge_lp + 2 * rand) * PPL_BLATT)
    im = Image.new('RGB', (W * UEBER, H * UEBER), HIMMEL)
    d = ImageDraw.Draw(im)
    s = PPL_BLATT * UEBER
    for i in range(n):
        x = (rand + i * (breite_lp + luecke_lp)) * s
        d.line([(x, rand * s), (x, (rand + laenge_lp) * s)],
               fill=HAAR, width=max(1, int(breite_lp * s)))
    im = im.resize((W, H), Image.LANCZOS)
    zw = max(2, int(round(W * PPL_SPIEL / PPL_BLATT)))
    zh = max(2, int(round(H * PPL_SPIEL / PPL_BLATT)))
    return im.resize((zw, zh), Image.LANCZOS)

def taeler(im):
    """Quer durch den Kamm: wie tief sind die Taeler zwischen den Straehnen?"""
    a = np.asarray(im).astype(float)
    hv = np.array(HAAR, float) - np.array(HIMMEL, float)
    deck = np.clip(((a - np.array(HIMMEL, float)) @ hv) / (hv @ hv), 0, 1)
    p = deck[deck.shape[0] // 2]                    # ein Querschnitt in der Mitte
    berge, tal = [], []
    for i in range(1, len(p) - 1):
        if p[i] >= p[i - 1] and p[i] >= p[i + 1] and p[i] > 0.25: berge.append(p[i])
        if p[i] <= p[i - 1] and p[i] <= p[i + 1] and p[i - 1] > 0.25: tal.append(p[i])
    if len(berge) < 2: return dict(berge=len(berge), kerbe=0.0)
    return dict(berge=len(berge), kerbe=round(float(min(berge) - max(tal)) if tal else 0.0, 2),
                tiefe=round(float(max(tal)), 2) if tal else None)
