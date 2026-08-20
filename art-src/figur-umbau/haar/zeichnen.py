"""Lange Straehnen zeichnen — Wurzeln auf der GEMESSENEN Unterkante der Masse.

Was das Modell hier traegt und was nicht, steht im Bericht. Zwei Zahlen
bestimmen jede Entscheidung in dieser Datei:

* Haarblau #3851B6 steht vor dem Himmel mit WCAG-Kontrast **3,07**, vor der
  gruenen Tunika mit **1,08**. Eine Straehne, die vor dem Rumpf haengt, ist
  keine Straehne — sie ist unsichtbar. Nur was AUSSERHALB des Umrisses haengt,
  zaehlt.
* Zwei Straehnen lesen sich bei Spielgroesse erst ab rund 0,9 logischen Pixeln
  Abstand einzeln (gemessen in strich.py). Auf einem 8,5 Pixel breiten Kopf
  sind das hoechstens fuenf bis sechs — nicht siebzehn.
"""
import math
import numpy as np
from PIL import Image, ImageDraw
from anker import AT, Z, PPL

UEB = 4
HAAR_TON = (56, 81, 182)

# Kopfmitte aus dem Manifest: kleinste Quadrate ueber alle 66 Bilder gegen den
# gemessenen Haarschwerpunkt. Rest 0,61 lp im Mittel, 1,18 lp im schlechtesten
# Bild (dying) — dafuer fehlt dem Manifest ein Schaedelanker (siehe Bericht).
ZURUECK, MITTE_EICH = 1.35, 1.20


def _ton(f):
    return tuple(max(0, min(255, int(c * f))) for c in HAAR_TON)


def kopf(a, s, dreh):
    ux, uy = s[0] - a[0], s[1] - a[1]
    L = math.hypot(ux, uy) or 1.85
    u = (ux / L, uy / L)
    return u, (-u[1], u[0]), L, math.radians(dreh)


def mitte(a, s, dreh, hoch=MITTE_EICH):
    u, rechts, L, dr = kopf(a, s, dreh)
    k = ZURUECK * math.sin(dr) * L
    return (a[0] + u[0] * hoch * L - rechts[0] * k,
            a[1] + u[1] * hoch * L - rechts[1] * k)


def bahn(p0, u, ab, laenge, drift, wobbel):
    """Kubik: erst an der Schaedelrundung entlang, dann Schwerkraft."""
    ux, uy = u
    p1 = (p0[0] - ux * laenge * 0.30 + ab[0] * laenge * 0.16,
          p0[1] - uy * laenge * 0.30 + ab[1] * laenge * 0.16)
    p2 = (p0[0] + drift[0] * 0.45 + wobbel * 0.5,
          p0[1] + laenge * 0.62 + drift[1] * 0.45)
    p3 = (p0[0] + drift[0] + wobbel, p0[1] + laenge + drift[1])
    return p0, p1, p2, p3


def _pkte(b, n=22):
    p0, p1, p2, p3 = b
    out = []
    for i in range(n + 1):
        t = i / n
        m = 1 - t
        out.append((m**3*p0[0] + 3*m*m*t*p1[0] + 3*m*t*t*p2[0] + t**3*p3[0],
                    m**3*p0[1] + 3*m*m*t*p1[1] + 3*m*t*t*p2[1] + t**3*p3[1]))
    return out


def strich_poly(d, b, w0, w1, farbe):
    """Strich mit veraenderlicher Dicke — als Polygon, damit die Spitze duenn ist."""
    ps = _pkte(b)
    li, re = [], []
    for i, p in enumerate(ps):
        t = i / (len(ps) - 1)
        q = ps[min(i + 1, len(ps) - 1)]
        r = ps[max(i - 1, 0)]
        tx, ty = q[0] - r[0], q[1] - r[1]
        n = math.hypot(tx, ty) or 1
        nx, ny = -ty / n, tx / n
        w = (w0 * (1 - t) + w1 * t) / 2
        li.append((p[0] + nx * w, p[1] + ny * w))
        re.append((p[0] - nx * w, p[1] - ny * w))
    d.polygon(li + re[::-1], fill=farbe)


def wurzeln(haar, C, a, v, dr, L):
    """Wurzeln auf der gemessenen Unterkante der Haarmasse.

    Freigelassen wird das Gesicht: rechts und links vom Gesichtspunkt bleibt ein
    Streifen frei. Uebrig bleiben zwei Boegen — der hintere (Haar hinter der
    Schulter) und der vordere (Schlaefenlocke). Bei gedrehtem Kopf ist der
    hintere breit und der vordere schmal; von vorn sind beide gleich. Der
    Parameter `von`/`bis` laeuft in beiden Boegen von AUSSEN nach innen.
    """
    ys, xs = np.nonzero(haar)
    if len(xs) < 20:
        return []
    xl, xr = xs.min() / PPL, xs.max() / PPL
    frei = v['gesicht'] * L
    hin = -1.0 if math.sin(dr) >= 0 else 1.0
    boegen = []
    if hin < 0:
        boegen.append((xl, a[0] - frei, True, v['zahl'], False))
        boegen.append((a[0] + frei, xr, False, v.get('zahlvorn', 0), True))
    else:
        boegen.append((a[0] + frei, xr, False, v['zahl'], False))
        boegen.append((xl, a[0] - frei, True, v.get('zahlvorn', 0), True))
    hb = max(0.5, (xr - xl) * 0.5)
    out = []
    for lo, hi, aussen_ist_lo, zahl, vorn in boegen:
        lo, hi = min(lo, hi), max(lo, hi)
        if hi - lo < 0.4 or zahl < 1:
            continue
        for i in range(zahl):
            f = v['von'] if zahl == 1 else v['von'] + (v['bis'] - v['von']) * i / (zahl - 1)
            x = lo + (hi - lo) * (f if aussen_ist_lo else 1 - f)
            sp = np.nonzero(haar[:, max(0, min(Z - 1, int(x * PPL)))])[0]
            if len(sp) == 0:
                continue
            y = sp.max() / PPL
            # Nur wo das Haar bis unter die Augen reicht, ist es Seitenhaar.
            # Sonst sitzt die Wurzel auf dem Pony, und die Straehne faellt quer
            # ueber Auge und Mund — genau so sah der Versuch davor aus.
            if vorn and y < a[1] + v['unterauge'] * L:
                continue
            out.append(((x, y - v['einzug']), (x - C[0]) / hb, i, vorn))
    return out


def strahnen(a, s, dreh, v, haar=None, drift=(0.0, 0.0), phase=0.0):
    """Zwei Ebenen (hinten, vorn) in Zellaufloesung 112, fertig zum Stapeln."""
    u, rechts, L, dr = kopf(a, s, dreh)
    C = mitte(a, s, dreh, v['mitte'])
    ebenen = {}
    for k in ('hinten', 'vorn'):
        im = Image.new('RGBA', (Z * UEB, Z * UEB), (0, 0, 0, 0))
        ebenen[k] = (im, ImageDraw.Draw(im))
    for p0, seit, i, vorn in wurzeln(haar, C, a, v, dr, L):
        aus = 1.0 if seit >= 0 else -1.0
        ab = (rechts[0] * aus, rechts[1] * aus)
        lang = v['laenge'] * (0.78 + 0.22 * abs(seit)) * (v['vornkurz'] if vorn else 1.0)
        if v.get('staffel'):
            # Ungleiche Laengen. Ein gerader Schnitt unten ist wieder eine
            # geschlossene Kante — also wieder eine Kappe, nur laenger.
            lang *= v['staffel'][i % len(v['staffel'])]
        wob = math.sin(phase * 2.1 + i * 2.4) * v['wobbel']
        fl = v['flug'] * (0.3 + 0.7 * abs(seit)) * aus
        b = bahn(p0, u, ab, lang, (drift[0] + fl, drift[1]), wob)
        d = ebenen['vorn' if vorn else 'hinten'][1]
        ton = _ton(v['hell'] if vorn else v['dunkel'])
        w0 = v['dicke'] * PPL * UEB
        strich_poly(d, tuple((q[0] * PPL * UEB, q[1] * PPL * UEB) for q in b),
                    w0, w0 * v['spitze'], ton + (255,))
    return {k: im.resize((Z, Z), Image.LANCZOS) for k, (im, _) in ebenen.items()}
