"""Zahlen fuer das Wahlblatt — alle in ECHTER Spielgroesse (Zelle 69) gemessen,
nicht auf der 112er Zelle. Was auf dem Blatt schoen ist, entscheidet nichts."""
import sys
import numpy as np
from PIL import Image
sys.path.insert(0, '/home/user/Wuselwerk/art-src/proben/figur2/wahl/bau')
from bau import Blatt, figurzelle, Z

SPIEL = 69

def _a(im):
    return np.asarray(im.convert('RGBA')).astype(int)

def strahnenanteil(blattname, hv, reihe='walking', n=8, gr=SPIEL):
    """Wieviel von der Straehnentinte ist BLAU (liest sich als Haar) und wieviel
    ist nur Saum (liest sich als schwarzer Draht)? Gemessen bei Spielgroesse."""
    bl = Blatt(blattname)
    k = min(n, len(bl.at['clips'][reihe]['anchors']))
    blau = saum = 0
    for i in range(k):
        ohne = figurzelle(bl, reihe, i, None).resize((gr, gr), Image.LANCZOS)
        mit = figurzelle(bl, reihe, i, hv).resize((gr, gr), Image.LANCZOS)
        o, m = _a(ohne), _a(mit)
        neu = (m[..., 3] > 100) & (o[..., 3] <= 100)      # nur was die Straehne hinzufuegt
        r, g, b = m[..., 0], m[..., 1], m[..., 2]
        ist_blau = neu & (b > r + 25) & (b > 70)
        blau += int(ist_blau.sum()); saum += int((neu & ~ist_blau).sum())
    ges = blau + saum
    return dict(blau=blau, saum=saum, anteil_blau=blau / ges if ges else 0.0,
                neu_je_bild=ges / k)

def umriss(blattname, hv, reihe='walking', n=8, gr=SPIEL):
    """B/H der Silhouette und Flaeche, bei Spielgroesse."""
    bl = Blatt(blattname)
    k = min(n, len(bl.at['clips'][reihe]['anchors']))
    bs, hs, fl = [], [], []
    for i in range(k):
        a = _a(figurzelle(bl, reihe, i, hv).resize((gr, gr), Image.LANCZOS))
        m = a[..., 3] > 100
        ys, xs = np.nonzero(m)
        if not len(xs): continue
        bs.append(xs.max() - xs.min() + 1); hs.append(ys.max() - ys.min() + 1)
        fl.append(int(m.sum()))
    return dict(breite=float(np.mean(bs)), hoehe=float(np.mean(hs)),
                bh=float(np.mean(bs) / np.mean(hs)), flaeche=float(np.mean(fl)))

def wechsel(blattname, hv, reihe='walking', n=8, gr=SPIEL):
    """Umrisswechsel je Bildpaar in Prozent der Silhouettenflaeche —
    das Mass der Posen-Werkstatt, hier bei Spielgroesse."""
    bl = Blatt(blattname)
    k = min(n, len(bl.at['clips'][reihe]['anchors']))
    ms = [_a(figurzelle(bl, reihe, i, hv).resize((gr, gr), Image.LANCZOS))[..., 3] > 100
          for i in range(k)]
    w = [np.logical_xor(ms[i], ms[(i + 1) % k]).sum() for i in range(k)]
    f = np.mean([m.sum() for m in ms])
    return dict(wechsel=float(np.mean(w)), anteil=float(np.mean(w) / f))
