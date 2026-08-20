"""GEHEN — der Wuselgang. Haeufigste Pose des Spiels, deshalb der groesste Hebel.

Vier Uebertreibungen uebereinander, jede einzeln abschaltbar:
  arm   Arm- und Beinschwung ueber den Verstaerker gespreizt
  hub   Auf und Ab des ganzen Koerpers (versatz)
  quetsch  Stauchen beim Aufsetzen, Strecken beim Durchschwingen
  wiege Seitliches Wiegen des Oberkoerpers (x-Anteil in Spine01/02)
"""
import math, sys, copy
sys.path.insert(0, '/home/user/Wuselwerk/art-src/proben/figur2/posen/bau')
from verstaerker import lade, verstaerke, _norm

ARME = {'L_Upperarm','L_Forearm','R_Upperarm','R_Forearm',
        'L_Thigh','L_Calf','L_Foot','R_Thigh','R_Calf','R_Foot'}

def gehen(arm=2.4, hub=0.09, quetsch=0.10, wiege=0.11, kopf=9.0, haar=2.2):
    p = lade('/home/user/Wuselwerk/art-src/wuselwerker/posen/walking.json')
    if arm != 1.0:
        p = verstaerke(p, arm, nur=ARME)
    n = len(p['frames'])                      # 8
    # Phase: 0 und 4 durchgeschwungen (hoch), 2 und 6 aufgesetzt (tief).
    takt = [ 1.0, 0.0, -1.0, 0.0, 1.0, 0.0, -1.0, 0.0]
    for i, f in enumerate(p['frames']):
        t = takt[i]
        f['versatz'] = round(hub * t, 5)
        # Aufsetzen breit und flach, Durchschwingen schmal und hoch.
        s = quetsch * t
        f['stauch'] = [round(1 - s*0.75, 5), round(1 + s, 5), round(1 - s*0.75, 5)]
        # Wiegen: einmal je Runde nach links, einmal nach rechts.
        w = wiege * math.sin(2*math.pi*i/n)
        for kn, anteil in (('Spine01', 1.0), ('Spine02', 0.7), ('NeckTwist01', -0.5)):
            if kn in f['richtung']:
                v = list(f['richtung'][kn]); v[0] = round(w*anteil, 4)
                f['richtung'][kn] = [round(c, 4) for c in _norm(v)]
        wi = f.setdefault('winkel', {})
        # Kopf nickt gegen den Hub und kippt mit dem Wiegen.
        wi['Head'] = [round(-3.0 - 5.0*t, 3), 0, round(-kopf*math.sin(2*math.pi*i/n), 3)]
        h = wi.get('HaarSchwung', [0, 0, 0])
        wi['HaarSchwung'] = [round(h[0]*haar, 3), 0, round(-kopf*0.8*math.sin(2*math.pi*i/n), 3)]
    return p
