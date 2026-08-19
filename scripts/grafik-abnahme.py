#!/usr/bin/env python3
"""Abnahmezettel als Programm — prueft eine gelieferte Datei gegen den Vertrag.

    python3 scripts/grafik-abnahme.py src/art/ui/welt-6.webp
    python3 scripts/grafik-abnahme.py src/art/ui/weltembleme.webp

Jede Zeile ist eine Bedingung mit OK oder FEHLER. Rueckgabewert 0 heisst:
Die Datei sitzt ohne Nacharbeit. Alle Schwellen sind an den fuenf vorhandenen
Tafeln und am heutigen Emblemblatt gemessen, nicht geraten.
"""

import os
import sys

import numpy as np
from PIL import Image

# An welt-1..5 gemessen (Hoechstwerte der Reihe): Randsprung 11.9, Streuung
# der Eckfelder 11.8, Streuung unten links 26.4, mittlere Helligkeit
# 102.8..169.1. Die Schwellen liegen mit Luft darueber — der Zettel muss die
# vorhandenen fuenf Tafeln bestehen, sonst misst er das Falsche.
TAFEL = dict(breite=384, hoehe=216, modus='RGB', kb_min=3.0, kb_max=9.0,
             mittel_min=95, mittel_max=180, ecke_std_max=16, rand_diff_max=20,
             unten_links_std_max=34)
# Der Radius 10 CSS bei kleinstem tw entspricht 16,5 Quellpixeln; 18 deckt es.
ECKE = 18
EMBLEM = dict(zelle=128, zellen=7, kb_max=34.0, r_leer=65, r_voll=58)

fehler = 0


def pruefe(bedingung: bool, text: str, ist: str = '') -> None:
    global fehler
    marke = 'OK    ' if bedingung else 'FEHLER'
    if not bedingung:
        fehler += 1
    print(f'  [{marke}] {text}{("  — ist: " + ist) if ist else ""}')


def tafel(pfad: str) -> None:
    im = Image.open(pfad)
    kb = os.path.getsize(pfad) / 1024
    print(f'Welttafel {pfad}')
    pruefe(im.format == 'WEBP', 'Format ist WebP', str(im.format))
    pruefe(im.size == (TAFEL['breite'], TAFEL['hoehe']),
           f'Groesse ist {TAFEL["breite"]}x{TAFEL["hoehe"]}', f'{im.width}x{im.height}')
    pruefe(im.mode == 'RGB', 'Modus RGB, kein Alphakanal (sonst schlaegt die '
           'dunkle Platte #0a0e16 durch)', im.mode)
    pruefe(getattr(im, 'n_frames', 1) == 1, 'Ein Einzelbild, keine Animation')
    pruefe(TAFEL['kb_min'] <= kb <= TAFEL['kb_max'],
           f'Dateigroesse {TAFEL["kb_min"]}..{TAFEL["kb_max"]} kB', f'{kb:.2f} kB')

    L = np.asarray(im.convert('L')).astype(float)
    pruefe(TAFEL['mittel_min'] <= L.mean() <= TAFEL['mittel_max'],
           f'Mittlere Helligkeit {TAFEL["mittel_min"]}..{TAFEL["mittel_max"]}', f'{L.mean():.1f}')

    rand = np.concatenate([L[0:2, :].ravel(), L[-2:, :].ravel(),
                           L[:, 0:2].ravel(), L[:, -2:].ravel()])
    innen = np.concatenate([L[4:10, :].ravel(), L[-10:-4, :].ravel(),
                            L[:, 4:10].ravel(), L[:, -10:-4].ravel()])
    d = abs(rand.mean() - innen.mean())
    pruefe(d <= TAFEL['rand_diff_max'],
           'Kein gemalter Rahmen — das Motiv laeuft bis an die Kante', f'Randsprung {d:.1f}')

    ecken = {'oben links': L[0:ECKE, 0:ECKE], 'oben rechts': L[0:ECKE, -ECKE:],
             'unten links': L[-ECKE:, 0:ECKE], 'unten rechts': L[-ECKE:, -ECKE:]}
    for name, feld in ecken.items():
        pruefe(feld.std() <= TAFEL['ecke_std_max'],
               f'Ecke {name} ruhig ({ECKE}x{ECKE} px werden rund abgeschnitten)',
               f'Streuung {feld.std():.1f}')

    # Das Belohnungsabzeichen sitzt unten links ueber der Tafel und verdeckt
    # dort rund 50x51 Quellpixel. Dort darf nichts Tragendes liegen.
    feld = L[165:216, 0:50]
    pruefe(feld.std() <= TAFEL['unten_links_std_max'],
           'Unten links ruhig (50x51 px verdeckt das Belohnungsabzeichen)',
           f'Streuung {feld.std():.1f}')
    pruefe(L[162:216, :].mean() < L[0:54, :].mean(),
           'Unteres Viertel dunkler als der Himmel — die Erdkante der Reihe')


def embleme(pfad: str) -> None:
    im = Image.open(pfad)
    kb = os.path.getsize(pfad) / 1024
    z, n = EMBLEM['zelle'], EMBLEM['zellen']
    print(f'Emblemblatt {pfad}')
    pruefe(im.format == 'WEBP', 'Format ist WebP', str(im.format))
    pruefe(im.height == z, f'Hoehe genau {z} px — der Zeichner liest die '
           'Zellgroesse aus naturalHeight', str(im.height))
    pruefe(im.width == z * n, f'Breite genau {z * n} px = {n} Zellen', str(im.width))
    pruefe(im.mode == 'RGBA', 'Modus RGBA mit echtem Alphakanal', im.mode)
    pruefe(kb <= EMBLEM['kb_max'], f'Dateigroesse hoechstens {EMBLEM["kb_max"]} kB',
           f'{kb:.2f} kB')

    a = np.asarray(im.convert('RGBA'))
    yy, xx = np.mgrid[0:z, 0:z]
    d = np.sqrt((xx - (z - 1) / 2) ** 2 + (yy - (z - 1) / 2) ** 2)
    for i in range(min(n, im.width // z)):
        al = a[:, i * z:(i + 1) * z, 3]
        voll = (al > 128)
        pruefe(voll.any(), f'Zelle {i} ist nicht leer')
        if not voll.any():
            continue
        pruefe(voll[d > EMBLEM['r_leer']].mean() < 0.01,
               f'Zelle {i}: nichts ausserhalb Radius {EMBLEM["r_leer"]} — '
               'die Scheibe bleibt in der Zelle',
               f'{voll[d > EMBLEM["r_leer"]].mean() * 100:.1f}% belegt')
        pruefe(voll[d < EMBLEM['r_voll']].mean() > 0.90,
               f'Zelle {i}: innerhalb Radius {EMBLEM["r_voll"]} deckend — '
               'runde Scheibe, kein freigestelltes Symbol',
               f'{voll[d < EMBLEM["r_voll"]].mean() * 100:.1f}% deckend')


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    for pfad in sys.argv[1:]:
        name = os.path.basename(pfad)
        if not os.path.exists(pfad):
            print(f'  [FEHLER] {pfad} fehlt')
            globals().__setitem__('fehler', fehler + 1)
            continue
        if name.startswith('weltembleme'):
            embleme(pfad)
        else:
            tafel(pfad)
        print()
    print('ABNAHME BESTANDEN' if fehler == 0 else f'{fehler} Bedingung(en) verletzt')
    sys.exit(0 if fehler == 0 else 1)


if __name__ == '__main__':
    main()
