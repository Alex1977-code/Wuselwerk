"""Breite durch Hoehe der Silhouette — bei ECHTER Spielgroesse.

Warum nicht auf der Blattzelle: Das Blatt traegt 112 Bildpunkte je Zelle, das
Spiel zeichnet sie auf rund 69 (Zelle 17 logische Pixel mal Geraetefaktor 4).
Ein Umriss, der auf dem Blatt schlank aussieht, kann nach dem Verkleinern
wieder klumpen — gemessen wird deshalb dort, wo der Spieler hinsieht.

Aufruf:  python3 silhouette.py <blatt.webp> <blatt.atlas.json> [weiteres Paar]
Mit zwei Paaren stellt es sie nebeneinander.
"""
import sys, json
import numpy as np
from PIL import Image

SPIEL = 69          # Kantenlaenge der Zelle in Geraetepunkten, wie im Spiel
DECKUNG = 100       # ab hier zaehlt ein Punkt als Figur und nicht als Rand


def zellen(bild, atlas, reihe):
    """Alle Bilder einer Pose, auf Spielgroesse verkleinert, als Alphamasken."""
    z = int(round(bild.width / 8))
    r = atlas['clips'][reihe]['row']
    n = len(atlas['clips'][reihe]['anchors'])
    aus = []
    for i in range(n):
        sp, sz = i % 8, r + i // 8
        aus.append(np.asarray(
            bild.crop((sp * z, sz * z, sp * z + z, sz * z + z))
                .resize((SPIEL, SPIEL), Image.LANCZOS)
                .convert('RGBA')).astype(int)[..., 3] > DECKUNG)
    return aus


def messe(pfad_bild, pfad_atlas):
    bild = Image.open(pfad_bild)
    atlas = json.load(open(pfad_atlas))
    aus = {}
    for reihe in atlas['clips']:
        bs, hs, fl = [], [], []
        for m in zellen(bild, atlas, reihe):
            ys, xs = np.nonzero(m)
            if not len(xs):
                continue
            bs.append(xs.max() - xs.min() + 1)
            hs.append(ys.max() - ys.min() + 1)
            fl.append(int(m.sum()))
        aus[reihe] = dict(breite=float(np.mean(bs)), hoehe=float(np.mean(hs)),
                          bh=float(np.mean(bs)) / float(np.mean(hs)),
                          flaeche=float(np.mean(fl)))
    return aus


if __name__ == '__main__':
    paare = [(sys.argv[i], sys.argv[i + 1]) for i in range(1, len(sys.argv) - 1, 2)]
    tafeln = [messe(*p) for p in paare]
    kopf = 'Pose'.ljust(10) + ''.join(f'{"B/H":>7}{"Breite":>8}{"Flaeche":>9}' for _ in tafeln)
    print(kopf)
    for reihe in tafeln[0]:
        z = reihe.ljust(10)
        for t in tafeln:
            d = t[reihe]
            z += f'{d["bh"]:7.3f}{d["breite"]:8.1f}{d["flaeche"]:9.0f}'
        print(z)
    for t, p in zip(tafeln, paare):
        m = np.mean([d['bh'] for d in t.values()])
        print(f'Mittel B/H {m:.3f}   ({p[0]})')
