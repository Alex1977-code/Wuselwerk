"""Bereitet die gelieferten Grafiken (grafik/) fuer den Einbau auf.

Die Lieferung kommt als grosse RGB-PNGs ohne Alphakanal, in zwei Sorten:

- **Magenta-Himmel** (Kulissenbaender, Wolken): Alles nahe #FF00FF wird
  Alpha. Die Baender werden zusaetzlich **entfaerbt** und im Wertebereich
  gespreizt — eingefaerbt wird zur Laufzeit mit der Weltpalette, damit ein
  Satz Baender fuer alle fuenf Welten reicht (grafikbedarf.md §3.1).
- **Gemaltes Schachbrett** (Symbole, Embleme, Wortmarke, Belohnungen,
  Laternen): Das Bildmodell hat die Transparenz als helles Schachbrett
  MITgemalt. Freigestellt wird per Flutfuellung von allen Raendern ueber
  helle, ungesaettigte Pixel — Glanzlichter im Motivinneren bleiben so
  unangetastet, weil die Flut sie nie erreicht.

Ziel: src/art/ui/*.webp in den Massen und Budgets aus grafikbedarf.md.
Aufruf: python3 scripts/grafik-aufbereiten.py
"""

import os
from collections import deque

from PIL import Image, ImageFilter

QUELLE = 'grafik'
ZIEL = 'src/art/ui'
os.makedirs(ZIEL, exist_ok=True)


def magenta_frei(im: Image.Image, toleranz: int = 90) -> Image.Image:
    """Magenta-Himmel zu Alpha. Weich: Restsaum wird anteilig transparent."""
    im = im.convert('RGBA')
    px = im.load()
    b, h = im.size
    for y in range(h):
        for x in range(b):
            r, g, bl, _ = px[x, y]
            # Abstand zu Magenta (255, 0, 255).
            d = max(255 - r, g, 255 - bl)
            if d < toleranz:
                a = 0 if d < toleranz // 2 else int(255 * (d - toleranz // 2) / (toleranz / 2))
                px[x, y] = (r, g, bl, a)
    return im


def entsaeumen(im: Image.Image) -> Image.Image:
    """Magenta-Restsaum neutralisieren.

    Der weiche Schluessel laesst an Kanten Pixel stehen, die schon halb zum
    Himmel gehoerten — sie tragen einen Magenta-Stich (R und B ueber G). Der
    Ueberschuss wird abgebaut: an den Raendern (geringe Deckung) ganz, im
    Kern nur zur Haelfte, damit gemalte kuehle Schatten nicht veroeden.
    """
    px = im.load()
    b, h = im.size
    for y in range(h):
        for x in range(b):
            r, g, bl, a = px[x, y]
            if a == 0:
                continue
            ueber = min(r, bl) - g
            if ueber > 0:
                f = 1.0 if a < 200 else 0.5
                px[x, y] = (int(r - ueber * f), g, int(bl - ueber * f), a)
    return im


def schachbrett_frei(im: Image.Image) -> Image.Image:
    """Flutfuellung von allen Raendern ueber helle, ungesaettigte Pixel."""
    im = im.convert('RGBA')
    b, h = im.size
    px = im.load()

    def hell_grau(p):
        r, g, bl = p[0], p[1], p[2]
        return min(r, g, bl) > 185 and max(r, g, bl) - min(r, g, bl) < 26

    gesehen = bytearray(b * h)
    schlange = deque()
    for x in range(b):
        for y in (0, h - 1):
            if hell_grau(px[x, y]):
                schlange.append((x, y))
                gesehen[y * b + x] = 1
    for y in range(h):
        for x in (0, b - 1):
            if hell_grau(px[x, y]) and not gesehen[y * b + x]:
                schlange.append((x, y))
                gesehen[y * b + x] = 1
    while schlange:
        x, y = schlange.popleft()
        p = px[x, y]
        px[x, y] = (p[0], p[1], p[2], 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < b and 0 <= ny < h and not gesehen[ny * b + nx] and hell_grau(px[nx, ny]):
                gesehen[ny * b + nx] = 1
                schlange.append((nx, ny))
    return im


def beschneiden(im: Image.Image, rand: int = 6) -> Image.Image:
    kasten = im.getbbox()
    if kasten is None:
        return im
    l, o, r, u = kasten
    return im.crop((max(0, l - rand), max(0, o - rand), min(im.width, r + rand), min(im.height, u + rand)))


def quadrat(im: Image.Image, seite: int) -> Image.Image:
    """Mittig auf ein Quadrat legen, laengste Kante = seite."""
    im = im.copy()
    im.thumbnail((seite, seite), Image.LANCZOS)
    blatt = Image.new('RGBA', (seite, seite), (0, 0, 0, 0))
    blatt.paste(im, ((seite - im.width) // 2, (seite - im.height) // 2), im)
    return blatt


def grau_gespreizt(im: Image.Image, lo: int = 90, hi: int = 255) -> Image.Image:
    """Entfaerben und Wertebereich spreizen — Form aus Licht, Farbe zur Laufzeit."""
    g = im.convert('LA')
    l, a = g.split()
    px = l.load()
    werte = [px[x, y] for y in range(0, l.height, 7) for x in range(0, l.width, 7)
             if a.getpixel((x, y)) > 128]
    if werte:
        mn, mx = min(werte), max(werte)
    else:
        mn, mx = 0, 255
    spanne = max(1, mx - mn)
    l = l.point(lambda v: max(0, min(255, lo + (v - mn) * (hi - lo) // spanne)))
    return Image.merge('LA', (l, a)).convert('RGBA')


def speichere(im: Image.Image, name: str, q: int) -> None:
    pfad = os.path.join(ZIEL, name)
    im.save(pfad, 'WEBP', quality=q, method=6)
    kb = os.path.getsize(pfad) / 1024
    print(f'{name:22s} {im.width}x{im.height}  {kb:6.1f} kB')


# --- Kulissenbaender: Magenta frei, entfaerbt, laufzeit-tintbar -------------
for name, ziel_b in (('kulisse_fern', 1024), ('kulisse_mitte', 1024), ('kulisse_nah', 1024)):
    im = Image.open(f'{QUELLE}/{name}.png')
    im = im.resize((ziel_b, round(im.height * ziel_b / im.width)), Image.LANCZOS)
    im = magenta_frei(im)
    im = im.crop(im.getbbox())
    im = grau_gespreizt(im)
    speichere(im, f'{name.replace("_", "-")}.webp', 74)

# --- Wolken: Magenta frei, Farbe bleibt (weiss) -----------------------------
im = Image.open(f'{QUELLE}/wolken.png')
im = im.resize((1024, round(im.height * 1024 / im.width)), Image.LANCZOS)
im = magenta_frei(im)
im = entsaeumen(im)
im = im.crop(im.getbbox())
speichere(im, 'wolken.webp', 72)

# --- Erde-Relief: Graustufen, Mittelwert auf 128 ----------------------------
im = Image.open(f'{QUELLE}/erde_relief.png').convert('L').resize((256, 256), Image.LANCZOS)
werte = list(im.getdata())
mittel = sum(werte) / len(werte)
im = im.point(lambda v: max(0, min(255, round(v + 128 - mittel))))
speichere(im.convert('RGB'), 'erde-relief.webp', 80)

# --- Berufsknoepfe: Schachbrett frei, ein Blatt in SKILLS-Reihenfolge -------
reihenfolge = ['climber', 'floater', 'bomber', 'blocker', 'builder', 'basher', 'miner', 'digger']
zellen = []
for skill in reihenfolge:
    im = Image.open(f'{QUELLE}/ui_{skill}.png').resize((512, 512), Image.LANCZOS)
    im = schachbrett_frei(im)
    zellen.append(quadrat(beschneiden(im), 128))
blatt = Image.new('RGBA', (128 * 8, 128), (0, 0, 0, 0))
for i, z in enumerate(zellen):
    blatt.paste(z, (i * 128, 0), z)
speichere(blatt, 'berufe.webp', 80)

# --- Weltembleme: ein Blatt -------------------------------------------------
# Die Zahl der Zellen richtet sich nach den vorhandenen Quellen, nicht nach
# einer fest verdrahteten Fuenf: Das Blatt wird mit dem Weltindex
# angesprochen (`weltkarte.ts`), ein zu kurzes Blatt laesst die letzte Welt
# also stillschweigend ohne Emblem. Wer weltemblem_6.png dazulegt, bekommt
# beim naechsten Lauf sechs Zellen — ohne diese Datei anzufassen.
zellen = []
for i in range(1, 99):
    quelle = f'{QUELLE}/weltemblem_{i}.png'
    if not os.path.exists(quelle):
        break
    im = Image.open(quelle).resize((512, 512), Image.LANCZOS)
    im = schachbrett_frei(im)
    zellen.append(quadrat(beschneiden(im), 128))
blatt = Image.new('RGBA', (128 * len(zellen), 128), (0, 0, 0, 0))
for i, z in enumerate(zellen):
    blatt.paste(z, (i * 128, 0), z)
speichere(blatt, 'weltembleme.webp', 82)

# --- Belohnungen: ein Blatt (werkzeug, zeit, komfort, schmuck) --------------
zellen = []
for name in ('tool', 'time', 'comfort', 'ornament'):
    im = Image.open(f'{QUELLE}/belohnung_{name}.png').resize((512, 512), Image.LANCZOS)
    im = schachbrett_frei(im)
    zellen.append(quadrat(beschneiden(im), 128))
blatt = Image.new('RGBA', (128 * 4, 128), (0, 0, 0, 0))
for i, z in enumerate(zellen):
    blatt.paste(z, (i * 128, 0), z)
speichere(blatt, 'belohnungen.webp', 82)

# --- Laternen: ein Blatt (an, aus) ------------------------------------------
zellen = []
for name in ('A', 'B'):
    im = Image.open(f'{QUELLE}/laterne_{name}.png').resize((512, 512), Image.LANCZOS)
    im = schachbrett_frei(im)
    zellen.append(quadrat(beschneiden(im), 96))
blatt = Image.new('RGBA', (96 * 2, 96), (0, 0, 0, 0))
for i, z in enumerate(zellen):
    blatt.paste(z, (i * 96, 0), z)
speichere(blatt, 'laternen.webp', 82)

# --- Avatare: ein Blatt, zwoelf Scheiben ------------------------------------
#
# Die Lieferung hat die Scheibe vor eine volle Ecke gemalt — mal weiss, mal
# schwarz. Freigestellt wird wie beim Schachbrett per Flutfuellung von den
# Raendern, nur dass die Zielfarbe je Bild aus der Ecke gelesen wird; die
# Scheibe umschliesst das Portraet vollstaendig, also erreicht die Flut nie
# weisses Haar oder schwarzen Pony im Inneren. Danach frisst ein MinFilter
# den Antialiasing-Saum, und der Beschnitt auf die Kastengrenze zentriert
# jede Scheibe unabhaengig von ihrer gelieferten Groesse.


def ecken_frei(im: Image.Image, toleranz: int = 30) -> Image.Image:
    im = im.convert('RGBA')
    b, h = im.size
    px = im.load()
    er, eg, eb = px[2, 2][:3]

    def hintergrund(p) -> bool:
        return abs(p[0] - er) <= toleranz and abs(p[1] - eg) <= toleranz and abs(p[2] - eb) <= toleranz

    gesehen = bytearray(b * h)
    schlange = deque()
    for x in range(b):
        for y in (0, h - 1):
            if hintergrund(px[x, y]) and not gesehen[y * b + x]:
                schlange.append((x, y))
                gesehen[y * b + x] = 1
    for y in range(h):
        for x in (0, b - 1):
            if hintergrund(px[x, y]) and not gesehen[y * b + x]:
                schlange.append((x, y))
                gesehen[y * b + x] = 1
    while schlange:
        x, y = schlange.popleft()
        p = px[x, y]
        px[x, y] = (p[0], p[1], p[2], 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < b and 0 <= ny < h and not gesehen[ny * b + nx] and hintergrund(px[nx, ny]):
                gesehen[ny * b + nx] = 1
                schlange.append((nx, ny))
    alpha = im.getchannel('A').filter(ImageFilter.MinFilter(5))
    im.putalpha(alpha)
    return im


zellen = []
for i in range(1, 13):
    im = Image.open(f'{QUELLE}/avatar{i}.png').resize((512, 512), Image.LANCZOS)
    im = ecken_frei(im)
    zellen.append(quadrat(beschneiden(im, 0), 128))
blatt = Image.new('RGBA', (128 * 4, 128 * 3), (0, 0, 0, 0))
for i, z in enumerate(zellen):
    blatt.paste(z, ((i % 4) * 128, (i // 4) * 128), z)
# Qualitaet 68 statt 78: bei 78 lag das Blatt bei 40 kB, das Budget aus
# grafikbedarf §3.9 sagt 26. Bei 64-px-Anzeige traegt die Stufe nichts.
speichere(blatt, 'avatare.webp', 68)

# --- Wortmarke --------------------------------------------------------------
im = Image.open(f'{QUELLE}/wortmarke.png').resize((1024, round(Image.open(f'{QUELLE}/wortmarke.png').height * 1024 / Image.open(f'{QUELLE}/wortmarke.png').width)), Image.LANCZOS)
im = schachbrett_frei(im)
im = beschneiden(im, 4)
speichere(im, 'wortmarke.webp', 82)

# --- Titelbild --------------------------------------------------------------
im = Image.open(f'{QUELLE}/titel.png').resize((1280, 592), Image.LANCZOS)
speichere(im.convert('RGB'), 'titel.webp', 74)

# --- Welttafeln -------------------------------------------------------------
# Ebenso hier: gemalt wird, was daliegt. Fruehere Fassungen zaehlten bis
# fuenf und haetten eine gelieferte welt-6 beim naechsten Lauf uebergangen.
for i in range(1, 99):
    quelle = f'{QUELLE}/welt_{i}.png'
    if not os.path.exists(quelle):
        break
    im = Image.open(quelle).resize((384, 216), Image.LANCZOS)
    speichere(im.convert('RGB'), f'welt-{i}.webp', 72)

print('fertig')
