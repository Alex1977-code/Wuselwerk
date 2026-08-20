"""Wieviel von der Figur ist Haar — in der Hoehe und in der Flaeche.

Das Mass, an dem „sieht aus wie eine Kappe" haengt. Eine Kappe ist nicht
dadurch eine Kappe, dass sie blau ist, sondern dadurch, dass sie einen grossen
zusammenhaengenden Anteil des Umrisses stellt und bis weit unter das Gesicht
reicht. Gezaehlt wird bei Spielgroesse, blau gegen alles.

Aufruf:  python3 haaranteil.py <blatt.webp> <blatt.atlas.json> [weiteres Paar]
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
    hoch, flaech = [], []
    for reihe, c in at['clips'].items():
        r = c['row']
        for i in range(len(c['anchors'])):
            sp, sz = i % 8, r + i // 8
            a = np.asarray(bild.crop((sp*z, sz*z, sp*z+z, sz*z+z))
                           .resize((SPIEL, SPIEL), Image.LANCZOS)
                           .convert('RGBA')).astype(int)
            al = a[..., 3] > DECKUNG
            rr, gg, bb = a[..., 0], a[..., 1], a[..., 2]
            haar = al & (bb > rr + 25) & (bb > gg + 15)
            ys, _ = np.nonzero(al)
            hy, _ = np.nonzero(haar)
            if not len(ys) or not len(hy):
                continue
            hoch.append((hy.max() - hy.min() + 1) / (ys.max() - ys.min() + 1))
            flaech.append(haar.sum() / al.sum())
    return float(np.mean(hoch)), float(np.mean(flaech))


if __name__ == '__main__':
    for i in range(1, len(sys.argv) - 1, 2):
        h, f = messe(sys.argv[i], sys.argv[i + 1])
        print(f'{sys.argv[i].split("/")[-1]:<20} Haar deckt {h*100:5.1f} % der Figurenhoehe, '
              f'{f*100:5.1f} % der Flaeche')
