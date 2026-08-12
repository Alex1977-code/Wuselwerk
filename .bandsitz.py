"""Wo das Stirnband auf dem Blatt landet — Haar, Haut oder daneben.

Bildet nur die **Mittellinie** des Bandes nach, nicht die Zeichnung. Das reicht
fuer die Frage, die hier zu klaeren ist: Liegt das Band im Haar? Der letzte
Nachweis bleibt der Blick auf das Bild.
"""
from PIL import Image
import json, math, sys

m = json.load(open('src/art/wuselwerker.atlas.json'))
im = Image.open('src/art/wuselwerker.webp').convert('RGBA')
Z = 112; ppl = m['ppl']; W = im.size[0]
rgb = im.convert('RGB'); alp = im.split()[3]
A = list(alp.get_flattened_data()) if hasattr(alp, 'get_flattened_data') else list(alp.getdata())

# Zu stellende Werte — dieselben Zahlen wie in band.ts.
HOEHE = float(sys.argv[1]) if len(sys.argv) > 1 else 0.85
BREITE = float(sys.argv[2]) if len(sys.argv) > 2 else 3.4
VORN = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
BOGEN = float(sys.argv[4]) if len(sys.argv) > 4 else 1.5

def art(x, y):
    """Was an dieser Zellstelle liegt: Haar, Haut, sonst Figur, oder nichts."""
    ix, iy = int(round(x * ppl)), int(round(y * ppl))
    if not (0 <= ix < Z and 0 <= iy < Z): return 'weg'
    return _art(ix, iy)

def _art(ix, iy, spalte=0, reihe=0):
    px = (reihe * Z + iy) * W + spalte * Z + ix
    if A[px] < 90: return 'weg'
    r, g, b = rgb.getpixel((spalte * Z + ix, reihe * Z + iy))
    if b > r + 30 and b > 70: return 'haar'
    if r > 120 and r > b + 45 and g > b: return 'haut'
    return 'rest'

def bez(p0, p1, p2, t):
    u = 1 - t
    return (u*u*p0[0] + 2*u*t*p1[0] + t*t*p2[0], u*u*p0[1] + 2*u*t*p1[1] + t*t*p2[1])

gesamt = {'haar': 0, 'haut': 0, 'rest': 0, 'weg': 0}
for name, c in m['clips'].items():
    if 'stirn' not in c: continue
    zaehl = {'haar': 0, 'haut': 0, 'rest': 0, 'weg': 0}
    for f in range(len(c['holds'])):
        gx, gy = c['anchors'][min(f, len(c['anchors'])-1)]
        sx_, sy_ = c['stirn'][min(f, len(c['stirn'])-1)]
        dx, dy = sx_ - gx, sy_ - gy
        L = math.hypot(dx, dy) or 2
        neig = math.atan2(dy, dx) + math.pi/2
        bg = math.radians(c.get('dreh', 0))
        b = BREITE * math.cos(bg); bv = b * VORN
        versatz = -math.sin(bg) * 1.1
        oben = -HOEHE * L
        p0 = (versatz - b, oben + BOGEN*0.16)
        p1 = (versatz - b*0.15, oben - BOGEN)
        p2 = (versatz + bv, oben - BOGEN*0.28)
        for i in range(13):
            lx, ly = bez(p0, p1, p2, i/12)
            wx = gx + lx*math.cos(neig) - ly*math.sin(neig)
            wy = gy + lx*math.sin(neig) + ly*math.cos(neig)
            ix, iy = int(round(wx*ppl)), int(round(wy*ppl))
            k = 'weg' if not (0 <= ix < Z and 0 <= iy < Z) else _art(ix, iy, f, c['row'])
            zaehl[k] += 1
    n = sum(zaehl.values())
    for k in zaehl: gesamt[k] += zaehl[k]
    warn = ' <<<' if zaehl['haut']*100/n > 8 else ''
    print(f"{name:9s} Haar {zaehl['haar']*100//n:3d}%  Haut {zaehl['haut']*100//n:3d}%  "
          f"sonst {zaehl['rest']*100//n:3d}%  daneben {zaehl['weg']*100//n:3d}%{warn}")
n = sum(gesamt.values())
print(f"{'GESAMT':9s} Haar {gesamt['haar']*100//n:3d}%  Haut {gesamt['haut']*100//n:3d}%  "
      f"sonst {gesamt['rest']*100//n:3d}%  daneben {gesamt['weg']*100//n:3d}%")
