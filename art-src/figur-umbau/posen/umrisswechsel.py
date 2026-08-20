"""Wieviel sich der Umriss von Bild zu Bild aendert — das Mass fuer Bewegung.

Nicht der Ausschlag einer Gliedmasse und nicht die Zahl der Bilder, sondern
das, was der Spieler im Pulk wirklich sieht: wieviel Flaeche zwischen zwei
Bildern kippt, in Prozent der Silhouette. Eine Pose, die sich um zwei Prozent
aendert, steht still, auch wenn ihre Knochen sich bewegen.

Gemessen bei Spielgroesse, denn nur dort gilt es.

Aufruf:  python3 umrisswechsel.py <blatt.webp> <atlas.json> [weiteres Paar]
"""
import sys, json
import numpy as np
from PIL import Image

SPIEL = 69
DECKUNG = 100


def messe(pb, pa):
    bild = Image.open(pb)
    at = json.load(open(pa))
    z = bild.width // 8
    aus = {}
    for reihe, c in at['clips'].items():
        r = c['row']
        n = len(c['holds'])
        if n < 2:
            continue
        masken = []
        for i in range(n):
            sp, sz = i % 8, r + i // 8
            masken.append(np.asarray(
                bild.crop((sp*z, sz*z, sp*z+z, sz*z+z))
                    .resize((SPIEL, SPIEL), Image.LANCZOS)
                    .convert('RGBA')).astype(int)[..., 3] > DECKUNG)
        # Einmalige Ablaeufe laufen nicht im Kreis: kein Paar vom letzten zum ersten.
        paare = range(n - 1) if c.get('once') else range(n)
        w = [np.logical_xor(masken[i], masken[(i + 1) % n]).sum() for i in paare]
        f = np.mean([m.sum() for m in masken])
        aus[reihe] = float(np.mean(w)) / f
    return aus


if __name__ == '__main__':
    paare = [(sys.argv[i], sys.argv[i + 1]) for i in range(1, len(sys.argv) - 1, 2)]
    tafeln = [messe(*p) for p in paare]
    print('Pose'.ljust(10) + ''.join(f'{"Wechsel":>10}' for _ in tafeln))
    for reihe in tafeln[0]:
        print(reihe.ljust(10) + ''.join(f'{t[reihe]*100:9.1f}%' for t in tafeln))
    for t, p in zip(tafeln, paare):
        print(f'Mittel {np.mean(list(t.values()))*100:.1f} %   ({p[0].split("/")[-1]})')
