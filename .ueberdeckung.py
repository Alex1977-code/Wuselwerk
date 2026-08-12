"""Ueberdeckung der Silhouetten — wie aehnlich sich zwei Posen im Spiel sehen.

Misst am **gezeichneten** Ergebnis, nicht am Blatt: Werkzeug und Signalschicht
entstehen erst beim Zeichnen, und genau sie sollen den Unterschied tragen.
Grundlage ist `art-src/proben/ww-nackt.png` (Probe mit `?nackt`).
"""
from PIL import Image
import itertools, sys

datei = sys.argv[1] if len(sys.argv) > 1 else 'art-src/proben/ww-nackt.png'
im = Image.open(datei).convert('RGBA')
W, H = im.size
NAMEN = ['walking','falling','floating','climbing','hoisting','building','bashing',
         'mining','digging','blocking','saving','dying','spaehen']
zeil = H / 13
# Der Aufbau der Probe: 96 Bildpunkte Beschriftung, dann acht Kacheln je
# Massstab. Kachelbreite ist round(WUSEL_H * Massstab * 1,7).
LABEL, MASS = 96, [3, 6, 12]
ZELLEN = [round(12 * s * 1.7) for s in MASS]
X0, ZW = LABEL, ZELLEN[0]

def maske(r):
    # **Nicht** herunterrechnen. Die erste Fassung hat die Kachel auf 17x17
    # gebracht, also auf einen Bildpunkt je logischem Pixel — und dabei genau
    # das verloren, was gemessen werden soll: Ein Spaten ist einen logischen
    # Pixel breit, nach dem Verkleinern hat er ein Viertel Deckkraft und faellt
    # unter jede Schwelle. Gemessen wird deshalb in der Groesse, in der die
    # Figur auf dem Schirm steht.
    z = im.crop((X0, int(r*zeil), X0+ZW, int((r+1)*zeil)))
    a = z.split()[3]
    px = list(a.get_flattened_data()) if hasattr(a, 'get_flattened_data') else list(a.getdata())
    return [1 if p > 60 else 0 for p in px]

def nacktMaske(r, kante):
    """Dieselbe Messung am blossen Blatt — ohne Werkzeug, ohne Signalschicht.

    Der Vergleichswert. Er sagt, was die gezeichneten Schichten tatsaechlich
    beitragen, statt es zu behaupten.
    """
    blatt = Image.open('src/art/wuselwerker.webp').convert('RGBA')
    z = blatt.crop((0, r*112, 112, (r+1)*112)).resize((kante, kante), Image.LANCZOS)
    a = z.split()[3]
    px = list(a.get_flattened_data()) if hasattr(a, 'get_flattened_data') else list(a.getdata())
    return [1 if p > 60 else 0 for p in px]

def schnitt(masken):
    p = []
    for a, b in itertools.combinations(NAMEN, 2):
        inter = sum(1 for x, y in zip(masken[a], masken[b]) if x and y)
        uni = sum(1 for x, y in zip(masken[a], masken[b]) if x or y)
        p.append((inter/uni*100 if uni else 0, a, b))
    p.sort(reverse=True)
    return p

m = {n: maske(r) for r, n in enumerate(NAMEN)}
# Die Zellkante in derselben Groesse wie die Kachel der Probe.
kante = round(17.003 * MASS[0])
mb = {n: nacktMaske(r, kante) for r, n in enumerate(NAMEN)}
bloss = schnitt(mb)
paare = schnitt(m)
print('== am schlechtesten unterscheidbar ==')
for v, a, b in paare[:8]: print(f'{v:5.1f}%  {a:9s} {b}')
arbeit = ['bashing', 'mining', 'digging']
print('== die drei Grabberufe ==')
for v, a, b in paare:
    if a in arbeit and b in arbeit: print(f'{v:5.1f}%  {a:9s} {b}')
b = sum(v for v, _, _ in bloss)/len(bloss)
g = sum(v for v, _, _ in paare)/len(paare)
print(f'Schnitt ueber alle 78 Paare: bloss {b:.1f}%  gezeichnet {g:.1f}%  '
      f'(Gewinn {b-g:.1f} Punkte)')
