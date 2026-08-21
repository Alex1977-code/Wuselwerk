"""Ein geliefertes Turnaround-Blatt gegen das Zielband messen.

Zwischen „sieht gut aus" und „taugt fuer das Spiel" liegen neunzehn Groessen:
Die Vorschau zeigt die Figur rund siebenhundert Bildpunkte hoch, das Spiel
zeichnet sie auf neunundvierzig. Vier Runden Prompt sind daran vorbeigelaufen,
weil beide Seiten die Vorschau angesehen haben. Dieses Werkzeug misst
stattdessen — und rechnet am Ende auf Spielgroesse herunter.

Aufruf:  python3 art-src/figur-umbau/blattmass.py <blatt.png> [ziel-vergleich.png]

Erwartet wird ein Blatt mit einem flachen Vollton als Hintergrund und vier
Ansichten nebeneinander (vorn, links, hinten, rechts). Drei oder zwei gehen
auch; benannt werden nur die ersten vier.

Das Zielband stammt aus `docs/figur-neubau.md` §6 und §7.
"""
import sys
import numpy as np
from PIL import Image

# Wie hoch das Telefon die Figur wirklich zeichnet: WUSEL_H 12 logische Pixel
# mal 4,06 Geraetepunkte je logischem Pixel (Zelle 69 auf 17,003).
SPIEL_HOCH = 49
NAMEN = ['vorn', 'links', 'hinten', 'rechts']

# (Name, Sollbereich, Einheit) — die Schranken, an denen die Backkette haengt.
BAND = {
    'B/H vorn': (0.42, 0.58),
    'Augenlinie': (48.0, 80.0),
    'Koepfe hoch': (2.6, 3.6),
    'Haut zu Haar am Kopf': (1.0, 3.0),
}


def hintergrund(a):
    """Der haeufigste Ton am Bildrand."""
    rand = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    q = (rand // 4) * 4
    k = q[:, 0] * 65536 + q[:, 1] * 256 + q[:, 2]
    v, c = np.unique(k, return_counts=True)
    t = v[np.argmax(c)]
    return np.array([t // 65536, (t // 256) % 256, t % 256])


def ansichten(figur, mindest=40):
    """Zusammenhaengende Spaltenbloecke — je einer ist eine Ansicht."""
    spalten = figur.any(axis=0)
    aus, start = [], None
    for x in range(len(spalten)):
        if spalten[x] and start is None:
            start = x
        elif not spalten[x] and start is not None:
            if x - start > mindest:
                aus.append((start, x))
            start = None
    if start is not None and len(spalten) - start > mindest:
        aus.append((start, len(spalten)))
    return aus


def masken(A, f):
    r, g, b = A[..., 0], A[..., 1], A[..., 2]
    return {
        'haar': f & (b > r + 40) & (b > g + 40),
        'haut': f & (r > 190) & (g > 120) & (g < 200) & (b < 150),
        'kleid': f & (g > r + 3) & (g > b + 3),
    }


def urteil(name, wert):
    if name not in BAND:
        return ''
    lo, hi = BAND[name]
    return '  ok' if lo <= wert <= hi else f'  AUSSERHALB {lo}..{hi}'


def messe(pfad):
    im = Image.open(pfad).convert('RGB')
    a = np.asarray(im).astype(int)
    bg = hintergrund(a)
    figur = np.abs(a - bg).sum(axis=2) > 40
    bloecke = ansichten(figur)
    print(f'{pfad}   {im.width}x{im.height}, Hintergrund '
          f'#{bg[0]:02x}{bg[1]:02x}{bg[2]:02x}, {len(bloecke)} Ansichten\n')

    print(f'{"Ansicht":<9}{"Hoehe":>7}{"Breite":>8}{"B/H":>8}{"Haar%":>8}{"Haut%":>8}{"Haut/Haar":>11}')
    for i, (s, e) in enumerate(bloecke):
        f = figur[:, s:e]
        A = a[:, s:e]
        ys, xs = np.nonzero(f)
        h = ys.max() - ys.min() + 1
        b = xs.max() - xs.min() + 1
        m = masken(A, f)
        ges = f.sum()
        hr, ht = m['haar'].sum(), m['haut'].sum()
        nm = NAMEN[i] if i < len(NAMEN) else f'#{i}'
        print(f'{nm:<9}{h:7d}{b:8d}{b/h:8.3f}{hr/ges*100:7.1f}%{ht/ges*100:7.1f}%'
              f'{ht/max(1, hr):11.2f}')

    # Alles Weitere an der Vorderansicht.
    s, e = bloecke[0]
    f = figur[:, s:e]
    A = a[:, s:e]
    ys, xs = np.nonzero(f)
    oben, unten = ys.min(), ys.max()
    hoehe = unten - oben + 1
    m = masken(A, f)
    r, g, b = A[..., 0], A[..., 1], A[..., 2]

    print('\nVorderansicht')
    print(f'  {"B/H vorn":<24}{(xs.max()-xs.min()+1)/hoehe:8.3f}'
          f'{urteil("B/H vorn", (xs.max()-xs.min()+1)/hoehe)}')

    kopf = np.zeros_like(f)
    kopf[oben:oben + int(hoehe * 0.45), :] = True
    py, px = np.nonzero(f & kopf & (r < 70) & (g < 70) & (b < 70))
    if len(py):
        augen = (unten - py.mean()) / hoehe * 100
        print(f'  {"Augenlinie":<24}{augen:7.1f} %{urteil("Augenlinie", augen)}')
        ty, tx = np.nonzero(m['haut'] & kopf)
        kb = tx.max() - tx.min() + 1
        links = px < px.mean()
        abst = abs(px[~links].mean() - px[links].mean()) / kb * 100
        print(f'  {"Augenabstand":<24}{abst:7.0f} % der Kopfbreite   (Ziel rund 25)')

    zeilen = m['haut'].sum(axis=1)
    erste = np.nonzero(zeilen)[0][0]
    hals = erste + int(np.argmin(zeilen[erste + int(hoehe * 0.15):erste + int(hoehe * 0.45)])
                       + hoehe * 0.15)
    kopfH = max(1, hals - erste)
    print(f'  {"Koepfe hoch":<24}{hoehe/kopfH:8.2f}{urteil("Koepfe hoch", hoehe/kopfH)}')
    hy, hx = np.nonzero(m['haar'])
    print(f'  {"Haar ueber der Stirn":<24}{(erste-hy.min())/kopfH:8.2f} Kopfhoehen')
    print(f'  {"Haar reicht herunter bis":<24}{(unten-hy.max())/hoehe*100:7.1f} % der Figurenhoehe')

    print('\n  Farben (haeufigster Ton je Flaeche)')
    for nm, mk, ziel in [('Haar', m['haar'], '#3c5cd4'), ('Haut', m['haut'], '#eca46c'),
                         ('Kleidung', m['kleid'], '#649434')]:
        sub = A[mk]
        if len(sub) < 50:
            continue
        q = (sub // 6) * 6 + 3
        k = q[:, 0] * 65536 + q[:, 1] * 256 + q[:, 2]
        v, c = np.unique(k, return_counts=True)
        t = v[np.argmax(c)]
        print(f'    {nm:<10} #{t//65536:02x}{(t//256)%256:02x}{t%256:02x}   Ziel {ziel}')

    # Und zum Schluss: dieselbe Figur auf Spielgroesse.
    c = im.crop((s + xs.min(), oben, s + xs.max() + 1, unten + 1))
    klein = c.resize((max(1, round(c.width * SPIEL_HOCH / c.height)), SPIEL_HOCH), Image.LANCZOS)
    q = np.asarray(klein.convert('RGB')).astype(int)
    fm = np.abs(q - bg).sum(axis=2) > 40
    mk = masken(q, fm)
    print(f'\n  Auf Spielgroesse ({SPIEL_HOCH} Geraetepunkte hoch), vorn:')
    hr, ht = mk['haar'].sum(), mk['haut'].sum()
    print(f'    Haar {hr/fm.sum()*100:.1f} % der Flaeche, Haut {ht/fm.sum()*100:.1f} %, '
          f'Haut zu Haar {ht/max(1,hr):.2f}'
          + urteil('Haut zu Haar am Kopf', ht / max(1, hr)))
    return klein


if __name__ == '__main__':
    for p in sys.argv[1:]:
        messe(p)
        print()
