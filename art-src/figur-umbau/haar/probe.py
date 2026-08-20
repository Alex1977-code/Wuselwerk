"""Baut die Beweisbilder: immer PAARWEISE — echte Spielgroesse und Zoom."""
import math
import numpy as np
from PIL import Image
from anker import AT, Z, PPL, zelle, masken
import zeichnen as ZE

SPIEL = 74                       # Zellkante auf dem Telefon (iPhone 14, dpr 2)
HIMMEL = (127, 178, 217, 255)
ERDE = (74, 63, 53, 255)

def stutzen(c, a, s, rx, ry, mitte, dreh=0):
    """Die Kappe kleiner machen: Haar ausserhalb einer Ellipse um die Kopfmitte
    faellt weg. Simuliert, was am MODELL passieren muesste.

    Der Rand muss MIT weg. Wer nur die als Haar eingestuften Bildpunkte loescht,
    laesst den weichgezeichneten Saum stehen — und der zeichnet dann den alten
    Umriss als duennen Geisterstrich nach. Genau das war beim ersten Versuch zu
    sehen. Deshalb wird die Loeschmaske um zwei Punkte geweitet und alles
    genommen, was dort nicht Haut ist."""
    from scipy import ndimage
    u, rechts, L, _ = ZE.kopf(a, s, 0)
    C = ZE.mitte(a, s, dreh, mitte)
    arr = np.array(c).astype(np.int16)
    al, haar = masken(c)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    haut = (r > 118) & (r >= g) & (r > b)
    yy, xx = np.mgrid[0:Z, 0:Z]
    dx = (xx / PPL - C[0]); dy = (yy / PPL - C[1])
    lx = (dx * rechts[0] + dy * rechts[1]) / L
    ly = (dx * u[0] + dy * u[1]) / L
    aus = (lx / rx) ** 2 + (ly / ry) ** 2 > 1.0
    weg = ndimage.binary_dilation(haar & aus, np.ones((5, 5))) & aus & ~haut
    arr[..., 3][weg] = 0
    return Image.fromarray(arr.astype(np.uint8), 'RGBA')

def bild(reihe, i, v, drift=(0, 0), phase=0.0):
    c = AT['clips'][reihe]
    a, s, dreh = c['anchors'][i], c['stirn'][i], c['dreh']
    z = zelle(reihe, i)
    if v.get('stutz'):
        z = stutzen(z, a, s, *v['stutz'], dreh=dreh)
    al, hm = masken(z)
    lg = ZE.strahnen(a, s, dreh, v, hm, drift, phase)
    out = Image.new('RGBA', (Z, Z), (0, 0, 0, 0))
    out.alpha_composite(lg['hinten']); out.alpha_composite(z); out.alpha_composite(lg['vorn'])
    return out

def pulk(bilder, breite=0.62, hoch=1.0):
    schritt = int(SPIEL * breite)
    w = schritt * (len(bilder) - 1) + SPIEL
    h = int(SPIEL * hoch)
    im = Image.new('RGBA', (w, h), HIMMEL)
    boden = int(h * 0.965)
    im.paste(Image.new('RGBA', (w, h - boden), ERDE), (0, boden))
    for i, c in enumerate(bilder):
        im.alpha_composite(c.resize((SPIEL, SPIEL), Image.LANCZOS), (i * schritt, h - SPIEL))
    return im

def zoom(bilder, f=4, grund=HIMMEL):
    w = Z * len(bilder)
    im = Image.new('RGBA', (w, Z), grund)
    for i, c in enumerate(bilder):
        im.alpha_composite(c, (i * Z, 0))
    return im.resize((w * f, Z * f), Image.NEAREST)

def paar(bilder, pfad, breite=0.62, zoomzahl=4, zoomf=4):
    """Oben echte Spielgroesse (2-fach genau vergroessert zum Ansehen),
    unten Zoom auf die Blattzelle."""
    o = pulk(bilder, breite)
    o2 = o.resize((o.width * 3, o.height * 3), Image.NEAREST)
    u = zoom(bilder[:min(zoomzahl, len(bilder))], zoomf)
    w = max(o2.width, u.width)
    im = Image.new('RGBA', (w, o2.height + u.height + 8), (24, 26, 32, 255))
    im.alpha_composite(o2, ((w - o2.width) // 2, 0))
    im.alpha_composite(u, ((w - u.width) // 2, o2.height + 8))
    im.convert('RGB').save(pfad)
    return pfad
