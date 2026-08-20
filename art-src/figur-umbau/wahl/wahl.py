"""Das Wahlblatt. Jede Spalte zeigt DIESELBEN drei Dinge:
oben den Pulk in echter Spielgroesse (Zelle 69 Geraetepunkte — so gross ist die
Figur auf dem Telefon), darunter die Gehreihe in derselben Groesse (damit man die
Bewegung sieht und nicht nur die Haltung), ganz unten sechsfach vergroessert.
Ganz links immer der heutige Stand."""
import sys
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, '/home/user/Wuselwerk/art-src/proben/figur2/wahl/bau')
from bau import Blatt, figurzelle, STAFFEL, DREI, SECHS, Z

SPIEL, ZOOM = 69, 6
HIMMEL, ERDE, GRUND = (127, 178, 217), (74, 63, 53), (28, 31, 38)
WEISS, GRAU, GELB = (240, 242, 246), (150, 158, 172), (250, 205, 90)
F = '/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf'
def font(g, fett=False):
    return ImageFont.truetype(F % ('-Bold' if fett else ''), g)

def var(b, **kw):
    d = dict(b); d.update(kw); return d

def zellen(blatt, hv, reihe='walking', n=8):
    bl = Blatt(blatt)
    k = min(n, len(bl.at['clips'][reihe]['anchors']))
    return [figurzelle(bl, reihe, i, hv, phase=i * 0.8) for i in range(k)]

def _band(zs, gr, schritt, boden=True):
    st = max(1, int(round(gr * schritt)))
    w = st * (len(zs) - 1) + gr
    bh = int(gr * 0.09) if boden else 0
    im = Image.new('RGB', (w, gr + bh), HIMMEL)
    if bh: im.paste(Image.new('RGB', (w, bh), ERDE), (0, gr))
    for i, c in enumerate(zs):
        s = c.resize((gr, gr), Image.LANCZOS); im.paste(s, (i * st, 0), s)
    return im

def zuschnitt(im, rand=2):
    a = im.split()[3].getbbox()
    return im.crop((max(0, a[0]-rand), max(0, a[1]-rand),
                    min(im.width, a[2]+rand), min(im.height, a[3]+rand)))

def spalte(gehzs, pulkzs, breite, titel, unter, zahl, zahlfarbe=GELB, gehn=8):
    """Eine Spalte, vier Baender — die ersten drei zeigen DIESELBE Spielgroesse:

    1 Gedraenge: gemischte Posen im Abstand 7 logischer Pixel, der haeufigste
      Anblick des Spiels. Hier entscheidet sich, ob sich Figuren trennen.
    2 Gehreihe, acht Bilder, echte Spielgroesse — so klein ist sie wirklich.
    3 dieselbe Gehreihe punktweise verdoppelt, damit die BEWEGUNG sichtbar wird.
    4 ein Bild, sechsfach — und zwar die SPIELGROSSE Zelle vergroessert, nicht
      die Blattzelle neu gerechnet. Sonst zeigt das Grossbild Kanten, die das
      Telefon nie zeichnet; genau daran ist der erste Haarumbau vorbeigelaufen.
    """
    pulk = _band(pulkzs, SPIEL, 7.0 / 17.0)
    gehen = _band([gehzs[i % len(gehzs)] for i in range(gehn)], SPIEL, 0.50)
    vier = [gehzs[(i * max(1, len(gehzs) // 4)) % len(gehzs)] for i in range(4)]
    bew = _band(vier, SPIEL, 0.48, boden=False)
    bew = bew.resize((bew.width * 2, bew.height * 2), Image.NEAREST)
    klein = gehzs[0].resize((SPIEL, SPIEL), Image.LANCZOS)
    eine = zuschnitt(klein, 1)
    gross = eine.resize((eine.width * ZOOM, eine.height * ZOOM), Image.NEAREST)
    gh = 68 * ZOOM
    kasten = Image.new('RGB', (breite, gh), HIMMEL)
    kasten.paste(gross, ((breite - gross.width) // 2, gh - gross.height - 14), gross)
    baender = [pulk, gehen, bew]
    h = 30 + sum(b.height + 8 for b in baender) + 6 + gh + 108
    im = Image.new('RGB', (breite, h), GRUND); d = ImageDraw.Draw(im)
    d.text((8, 4), titel, font=font(18, True), fill=WEISS)
    y = 30
    for b in baender:
        im.paste(b, ((breite - b.width) // 2, y)); y += b.height + 8
    y += 6; im.paste(kasten, (0, y)); y += gh + 10
    d.text((8, y), zahl, font=font(19, True), fill=zahlfarbe)
    for i, z in enumerate(unter.split('|')):
        d.text((8, y + 25 + i * 16), z.strip(), font=font(12), fill=GRAU)
    return im
