#!/usr/bin/env python3
"""Gelieferte Grafiken in src/art/ui/ einsetzen — Welttafeln und Emblemblatt.

Deckt genau die drei offenen Dateien ab:
    welt-6.webp      384x216 RGB   Kopfplatte Sonnenhang
    welt-7.webp      384x216 RGB   Kopfplatte Wipfelweide
    weltembleme.webp 896x128 RGBA  sieben Zellen zu 128x128

Der Weg ist derselbe wie in scripts/grafik-aufbereiten.py — die Hilfsfunktionen
werden von dort importiert, nicht nachgebaut. Nachgemessen: mit diesen Werten
entstehen die fuenf vorhandenen Tafeln und das heutige Emblemblatt BYTEGLEICH
neu. Das Emblemblatt wird deshalb aus den Quell-PNGs neu gebaut statt
angestueckelt; nur so bleiben die ersten fuenf Zellen bildgleich.

Aufruf (aus dem Projektwurzelverzeichnis):

    python3 scripts/grafik-einsetzen.py tafel 6 lieferung/welt_6.png
    python3 scripts/grafik-einsetzen.py tafel 7 lieferung/welt_7.png
    python3 scripts/grafik-einsetzen.py embleme

`embleme` erwartet grafik/weltemblem_1.png .. weltemblem_7.png. Die Dateien 1
bis 5 liegen dort bereits; 6 und 7 kommen aus der Lieferung dazu.

Mit --ziel VERZEICHNIS schreibt das Skript woanders hin (zum Probelauf).
"""

import argparse
import os
import sys

from PIL import Image

WURZEL = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ZIEL_VORGABE = os.path.join(WURZEL, 'src', 'art', 'ui')
QUELLE_VORGABE = os.path.join(WURZEL, 'grafik')

# Die verbindlichen Masse und Guetegrade. Nachgemessen an den vorhandenen
# Dateien: welt-1..5 entstehen bei q=72 bytegleich, weltembleme bei q=82.
TAFEL_BREITE, TAFEL_HOEHE, TAFEL_GUETE = 384, 216, 72
ZELLE, EMBLEM_GUETE = 128, 82
ZELLEN_SOLL = 7


def _hilfsfunktionen():
    """Die Freisteller aus scripts/grafik-aufbereiten.py laden.

    Das Skript ist ein Ablaufskript ohne main(): Ein Import wuerde es
    komplett ausfuehren und dabei src/art/ui neu schreiben. Darum wird nur
    der Kopf bis zum ersten Arbeitsblock ausgewertet.
    """
    pfad = os.path.join(WURZEL, 'scripts', 'grafik-aufbereiten.py')
    quelltext = open(pfad, encoding='utf-8').read()
    kopf = quelltext.split('# --- Kulissenbaender')[0]
    raum = {'__name__': 'aufbereiter'}
    exec(compile(kopf, pfad, 'exec'), raum)
    return raum['schachbrett_frei'], raum['beschneiden'], raum['quadrat']


def tafel(nummer: int, eingang: str, ziel: str) -> None:
    im = Image.open(eingang)
    b, h = im.size
    soll = TAFEL_BREITE / TAFEL_HOEHE
    ist = b / h
    if abs(ist - soll) / soll > 0.01:
        # Mehr als ein Prozent daneben: mittig auf 16:9 beschneiden, statt
        # zu verzerren. Bis ein Prozent wird glatt skaliert — so macht es
        # der Aufbereiter mit den vorhandenen 1672x941-Lieferungen auch.
        if ist > soll:
            neu_b = round(h * soll)
            kasten = ((b - neu_b) // 2, 0, (b - neu_b) // 2 + neu_b, h)
        else:
            neu_h = round(b / soll)
            kasten = (0, (h - neu_h) // 2, b, (h - neu_h) // 2 + neu_h)
        print(f'  Seitenverhaeltnis {ist:.4f} statt {soll:.4f} — mittig beschnitten auf {kasten}')
        im = im.crop(kasten)
    im = im.resize((TAFEL_BREITE, TAFEL_HOEHE), Image.LANCZOS).convert('RGB')
    pfad = os.path.join(ziel, f'welt-{nummer}.webp')
    im.save(pfad, 'WEBP', quality=TAFEL_GUETE, method=6)
    kb = os.path.getsize(pfad) / 1024
    print(f'  {os.path.basename(pfad):20s} {im.width}x{im.height} RGB  {kb:5.2f} kB')
    if kb > 9:
        print(f'  ACHTUNG: {kb:.2f} kB liegt ueber dem Budget von 9 kB — Motiv beruhigen.')


def embleme(quelle: str, ziel: str) -> None:
    schachbrett_frei, beschneiden, quadrat = _hilfsfunktionen()
    zellen = []
    for i in range(1, ZELLEN_SOLL + 1):
        pfad = os.path.join(quelle, f'weltemblem_{i}.png')
        if not os.path.exists(pfad):
            sys.exit(f'FEHLT: {pfad} — alle {ZELLEN_SOLL} Quellbilder muessen da sein.')
        im = Image.open(pfad).resize((512, 512), Image.LANCZOS)
        im = schachbrett_frei(im)
        zellen.append(quadrat(beschneiden(im), ZELLE))
    blatt = Image.new('RGBA', (ZELLE * ZELLEN_SOLL, ZELLE), (0, 0, 0, 0))
    for i, z in enumerate(zellen):
        blatt.paste(z, (i * ZELLE, 0), z)
    pfad = os.path.join(ziel, 'weltembleme.webp')
    blatt.save(pfad, 'WEBP', quality=EMBLEM_GUETE, method=6)
    kb = os.path.getsize(pfad) / 1024
    print(f'  {os.path.basename(pfad):20s} {blatt.width}x{blatt.height} RGBA {kb:5.2f} kB')


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('was', choices=['tafel', 'embleme'])
    p.add_argument('rest', nargs='*')
    p.add_argument('--ziel', default=ZIEL_VORGABE)
    p.add_argument('--quelle', default=QUELLE_VORGABE)
    a = p.parse_args()
    os.makedirs(a.ziel, exist_ok=True)
    if a.was == 'tafel':
        if len(a.rest) != 2:
            sys.exit('Aufruf: einsetzen.py tafel NUMMER BILD.png')
        tafel(int(a.rest[0]), a.rest[1], a.ziel)
    else:
        embleme(a.quelle, a.ziel)
    print('fertig — jetzt `npm run build:single` laufen lassen.')


if __name__ == '__main__':
    main()
