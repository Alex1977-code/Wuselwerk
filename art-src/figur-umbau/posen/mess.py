"""Misst Posen an einem gebackenen Blatt. Alles in logischen Pixeln."""
from PIL import Image
import sys, json

ZELLE = 112
LOGISCH = 17.003
PPL = 112 / LOGISCH          # 6.587 Bildpunkte je logischem Pixel
ZEILEN = [('walking',8),('falling',4),('floating',4),('climbing',4),('hoisting',6),
          ('building',8),('bashing',3),('mining',4),('digging',3),('blocking',2),
          ('saving',6),('dying',8),('spaehen',6)]
EINMAL = {'hoisting','saving','dying'}

def zellen(pfad, pose):
    bl = Image.open(pfad).convert('RGBA')
    reihe = [n for n,_ in ZEILEN].index(pose)
    n = dict(ZEILEN)[pose]
    return [bl.crop((s*ZELLE, reihe*ZELLE, (s+1)*ZELLE, (reihe+1)*ZELLE)) for s in range(n)]

def raster(zelle, kante=17):
    """Auf das logische Pixelraster herunterrechnen; Silhouette bei Alpha >= 128."""
    k = zelle.resize((kante, kante), Image.LANCZOS)
    a = k.split()[3].load()
    return [[1 if a[x,y] >= 128 else 0 for x in range(kante)] for y in range(kante)]

def flaeche(s): return sum(sum(z) for z in s)

def wechsel(a, b):
    return sum(1 for y in range(len(a)) for x in range(len(a[0])) if a[y][x] != b[y][x])

def iou(a, b):
    sch = sum(1 for y in range(len(a)) for x in range(len(a[0])) if a[y][x] and b[y][x])
    ver = sum(1 for y in range(len(a)) for x in range(len(a[0])) if a[y][x] or b[y][x])
    return sch/ver if ver else 1.0

def zickzack(werte, ring=True):
    """Wie oft die Bewegungsrichtung wechselt. Ein sauberer Bogen wechselt zweimal
    je Runde; mehr heisst Zittern statt Schwung."""
    n = len(werte)
    d = [werte[(i+1) % n]-werte[i] for i in range(n if ring else n-1)]
    d = [x for x in d if abs(x) > 0.05]
    return sum(1 for i in range(len(d)-1) if d[i]*d[i+1] < 0) + (1 if ring and len(d) > 1 and d[-1]*d[0] < 0 else 0)

def kasten(zelle):
    """Umriss in logischen Pixeln, volle Aufloesung."""
    bb = zelle.split()[3].point(lambda v: 255 if v >= 128 else 0).getbbox()
    if not bb: return None
    l,o,r,u = bb
    return dict(links=l/PPL, oben=o/PPL, rechts=r/PPL, unten=u/PPL,
                breite=(r-l)/PPL, hoehe=(u-o)/PPL)

def pose_mass(pfad, pose):
    zs = zellen(pfad, pose)
    ss = [raster(z) for z in zs]
    ks = [kasten(z) for z in zs]
    n = len(zs)
    paare = [(i,(i+1)%n) for i in range(n)] if pose not in EINMAL else [(i,i+1) for i in range(n-1)]
    w = [wechsel(ss[i], ss[j]) for i,j in paare]
    io = [iou(ss[i], ss[j]) for i,j in paare]
    fl = [flaeche(s) for s in ss]
    scheitel = [k['oben'] for k in ks]
    return dict(pose=pose, n=n,
                wechsel=w, wechsel_max=max(w), wechsel_schnitt=round(sum(w)/len(w),1),
                flaeche_schnitt=round(sum(fl)/n,1),
                flaeche_spiel=round((max(fl)-min(fl))/(sum(fl)/n),3),
                anteil_max=round(max(w)/(sum(fl)/n),3),
                iou_min=round(min(io),3), iou_schnitt=round(sum(io)/len(io),3),
                zickzack=zickzack(scheitel, pose not in EINMAL),
                scheitel_hub=round(max(scheitel)-min(scheitel),2),
                breite_max=round(max(k['breite'] for k in ks),2),
                hoehe_span=round(max(k['hoehe'] for k in ks)-min(k['hoehe'] for k in ks),2),
                sohle_hub=round(max(k['unten'] for k in ks)-min(k['unten'] for k in ks),2),
                seite_span=round(max(k['rechts'] for k in ks)-min(k['links'] for k in ks),2))

if __name__ == '__main__':
    pfad = sys.argv[1]
    posen = sys.argv[2:] or [n for n,_ in ZEILEN]
    for p in posen:
        m = pose_mass(pfad, p)
        print(f"{m['pose']:9s} Wechsel {str(m['wechsel']):28s} max {m['wechsel_max']:3d} "
              f"Schnitt {m['wechsel_schnitt']:5.1f}  Flaeche {m['flaeche_schnitt']:5.1f} "
              f"Anteil {m['anteil_max']:.2f}  Scheitelhub {m['scheitel_hub']:.2f}px "
              f"Hoehenspiel {m['hoehe_span']:.2f}px  breit {m['breite_max']:.2f}px")
