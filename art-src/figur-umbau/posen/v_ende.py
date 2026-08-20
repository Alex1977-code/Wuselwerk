"""STERBEN und RETTEN — die zwei Posen, die Gefuehl tragen.

Beide sind heute **lineare Rampen**: gleich grosse Schritte von Bild zu Bild.
Eine Rampe hat keine Betonung. Das Mittel hier ist nicht mehr Ausschlag, sondern
eine andere **Verteilung** derselben Bewegung ueber dieselben Bilder: erst
zurueckholen (Ausholen), dann in zwei Bildern durchschlagen, dann ueberschwingen
und einpendeln. Kostet keinen Bildpunkt und keine Haltedauer.
"""
import math, sys
sys.path.insert(0, '/home/user/Wuselwerk/art-src/proben/figur2/posen/bau')
from verstaerker import lade, _norm, _spreiz_richtung

def _zwischen(a, b, t):
    """Slerp mit Ueberschwingen: t darf unter 0 und ueber 1 liegen."""
    a, b = _norm(a), _norm(b)
    d = max(-1.0, min(1.0, sum(x*y for x, y in zip(a, b))))
    w = math.acos(d)
    if w < 1e-6:
        return a
    ax = _norm([a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]])
    return _spreiz_richtung(a, b, t) if False else _dreh(a, ax, w*t)

def _dreh(v, ax, t):
    c, s = math.cos(t), math.sin(t)
    kx = [ax[1]*v[2]-ax[2]*v[1], ax[2]*v[0]-ax[0]*v[2], ax[0]*v[1]-ax[1]*v[0]]
    dt = sum(x*y for x, y in zip(ax, v))
    return _norm([v[i]*c + kx[i]*s + ax[i]*dt*(1-c) for i in range(3)])

# c = 0 stehend, 1 zusammengesackt. Negativ ist das Aufbaeumen davor,
# ueber 1 das Durchsacken unter die Endlage.
KURVE_STERBEN = [-0.20, -0.30, 0.60, 1.18, 0.86, 1.06, 1.00, 0.99]

def sterben(kraft=1.0, kurve=None):
    p = lade('/home/user/Wuselwerk/art-src/wuselwerker/posen/dying.json')
    fr = p['frames']
    a, b = fr[0], fr[-1]
    ks = [(k-0.5)*kraft + 0.5 for k in (kurve or KURVE_STERBEN)]
    for f, c in zip(fr, ks):
        for kn in a['richtung']:
            f['richtung'][kn] = [round(x, 4) for x in _zwischen(a['richtung'][kn], b['richtung'][kn], c)]
        sy = 1.0 + (0.82 - 1.0)*c
        f['stauch'] = [round(1 + (1 - sy)*0.62, 5), round(sy, 5), round(1 + (1 - sy)*0.62, 5)]
        f['versatz'] = round(0.25*(sy - 1), 5)
        # Kopf schlaegt nach hinten, bevor er faellt; das Haar zieht gegenlaeufig nach.
        f['winkel'] = {'Head': [round(10 - 34*c, 2), 0, round(6*math.sin(3.0*c), 2)],
                       'HaarSchwung': [round(14 - 44*c, 2), 0, round(-9*math.sin(3.0*c), 2)]}
    return p

def retten(kraft=1.0):
    """Erst in die Knie, dann der Schuss nach oben. Bild 0 ist heute reines Stehen."""
    p = lade('/home/user/Wuselwerk/art-src/wuselwerker/posen/saving.json')
    fr = p['frames']
    hocke, schuss = 0.16*kraft, 0.20*kraft
    for i, f in enumerate(fr):
        if i == 0:                                   # Ausholen: in die Hocke
            f['stauch'] = [round(1 + hocke*0.7, 5), round(1 - hocke, 5), round(1 + hocke*0.7, 5)]
            f['versatz'] = round(-0.25*hocke, 5)
            f['richtung']['L_Upperarm'] = [round(x, 4) for x in _norm([0.34, -0.58, -0.74])]
            f['richtung']['R_Upperarm'] = [round(x, 4) for x in _norm([-0.34, -0.58, -0.74])]
            f['richtung']['L_Forearm'] = [round(x, 4) for x in _norm([0.24, -0.30, -0.92])]
            f['richtung']['R_Forearm'] = [round(x, 4) for x in _norm([-0.24, -0.30, -0.92])]
            f['richtung']['L_Thigh'] = [round(x, 4) for x in _norm([0.26, -0.72, 0.64])]
            f['richtung']['R_Thigh'] = [round(x, 4) for x in _norm([-0.26, -0.72, 0.64])]
            f['richtung']['L_Calf'] = [round(x, 4) for x in _norm([0.18, -0.86, -0.48])]
            f['richtung']['R_Calf'] = [round(x, 4) for x in _norm([-0.18, -0.86, -0.48])]
            f['richtung']['Spine01'] = [round(x, 4) for x in _norm([0, 0.90, 0.44])]
            f['winkel'] = {'Head': [-14, 0, 0], 'HaarSchwung': [16, 0, 0]}
        elif i == 1:                                 # Schuss: lang und schmal
            f['stauch'] = [round(1 - schuss*0.7, 5), round(1 + schuss, 5), round(1 - schuss*0.7, 5)]
            f['versatz'] = round(0.10 + 0.25*schuss, 5)
            f['winkel'] = {'Head': [22, 0, 0], 'HaarSchwung': [-34, 0, 0]}
        else:                                        # Wegfliegen: Haar zieht hinterher
            f['winkel'] = {'Head': [round(20 - 4*i, 2), 0, 0],
                           'HaarSchwung': [round(-38 + 3*i, 2), 0, round(8 - 3*i, 2)]}
    return p
