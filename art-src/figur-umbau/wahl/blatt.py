"""Baut wahl.png — das einzige Bild, das der Auftraggeber zu sehen bekommt."""
import sys
from PIL import Image, ImageDraw
sys.path.insert(0, '/home/user/Wuselwerk/art-src/proben/figur2/wahl/bau')
from wahl import (spalte, zellen, var, font, _band, zuschnitt,
                  GRUND, WEISS, GRAU, GELB, HIMMEL, SPIEL)
from bau import Blatt, figurzelle, STAFFEL, DREI, SECHS

BR = 336
# Gedraenge: gemischte Posen im Abstand 7 logischer Pixel — der Anblick, den das
# Spiel am haeufigsten zeigt. Nicht acht Gehbilder: die taeuschen Vielfalt vor.
POSEN = [('walking', 2), ('digging', 1), ('walking', 5), ('blocking', 1),
         ('building', 3), ('walking', 0), ('mining', 2)]

MAEHNE = var(STAFFEL, dicke=0.75)     # 0,50 war halb Saum — siehe Bericht
ZOEPFE = var(DREI, dicke=0.90)
FAEDEN = var(SECHS, dicke=0.36)

def pulkz(blatt, hv):
    b = Blatt(blatt)
    return [figurzelle(b, p, i, hv, phase=i * 0.8) for p, i in POSEN]

SPALTEN = [
    ('heute', None, 'HEUTE', 'B/H 0,73',
     'Breiteste Stelle ist das AUGE, nicht die Schulter. | Kopf und Haar sind die halbe Figur. | Im Gedraenge ein einziges blaues Band.', (255, 140, 130)),
    ('s2', None, 'A — SCHMAL', 'B/H 0,55',
     'Ganze Figur waagerecht gestaucht (0,76) + Kopf 0,88. | Ein Regler im Backskript, sonst nichts. | Breiteste Stelle wandert zur Schulter.', GELB),
    ('s3', None, 'B — MENSCHLICH', 'B/H 0,47',
     'Stauchung 0,64 + Kopf 0,82. Untere Grenze | des menschlichen Bandes (0,35-0,45). | Kopf erstmals hoeher als breit.', GELB),
    ('s3', MAEHNE, 'C — STAFFELMAEHNE', '5 Straehnen, 60 % blau',
     'Kappe im Modell auf eine Ellipse gestutzt, | fuenf Straehnen GEZEICHNET, jede anders lang | (2,8 bis 7,0 lp). Unterkante wird zackig.', GELB),
    ('s3', ZOEPFE, 'D — DREI ZOEPFE', '3 Straehnen, 61 % blau',
     'Dieselbe Bauart, nur drei dicke Linien | statt fuenf duenner. Der ruhigste Entwurf — | im Gedraenge flimmert nichts.', GELB),
    ('s3p', MAEHNE, 'E — ALLES ZUSAMMEN', 'Umriss +26 % je Bild',
     'B + C + uebertriebene Posen: Stauchen und | Strecken beim Gehen, Klettern wird ein echter | Klimmzug, Rammen holt aus. Blatt 145 -> 119 kB.', (150, 255, 170)),
]

def bauen(pfad):
    sp = []
    for bl, hv, tit, zahl, unter, farbe in SPALTEN:
        sp.append(spalte(zellen(bl, hv), pulkz(bl, hv), BR, tit, unter, zahl, farbe))
    return sp

def grenzband(breite):
    """Was NICHT auf das Blatt gehoert — und warum. Alles in Spielgroesse:
    im Zoom sieht jede dieser Varianten gut aus, das ist ja der Fehler."""
    from bau import ZOPF
    fa = [('Sechs duenne Faeden (0,36 lp)', 's3', FAEDEN,
           'verschmelzen zur blauen Wolke — 71 % der Spitzenpaare unter der Lesegrenze 0,9 lp'),
          ('Der Schweif (eine Straehne, 9,6 lp)', 's3', var(ZOPF, dicke=1.10),
           'liest sich als Draht, nicht als Haar — und beruehrt in 32 von 66 Bildern den Zellrand'),
          ('Straehnen zu duenn (0,50 lp)', 's3', var(MAEHNE, dicke=0.50),
           'halb Saum, halb Haar — die Straehne liest sich schwarz statt blau. 0,75 lp erst traegt.')]
    zl = []
    for tit, bl, hv, wa in fa:
        zs = zellen(bl, hv)[:5]
        b = _band(zs, SPIEL, 0.50)
        zl.append((tit, wa, b.resize((b.width * 2, b.height * 2), Image.NEAREST)))
    h = 34 + max(b.height for _, _, b in zl) + 56
    im = Image.new('RGB', (breite, h), (38, 26, 26)); d = ImageDraw.Draw(im)
    d.text((10, 7), 'GRENZMARKEN — gemessen durchgefallen. Im Zoom sehen alle drei gut aus; '
                    'das ist genau der Fehler. Hier Spielgroesse, punktweise verdoppelt.',
           font=font(15, True), fill=(255, 150, 140))
    x = 10
    for tit, wa, b in zl:
        im.paste(b, (x, 34))
        d.text((x, 38 + b.height + 4), tit, font=font(14, True), fill=(240, 220, 215))
        d.text((x, 38 + b.height + 22), wa, font=font(12), fill=(195, 165, 160))
        x += max(b.width, 560) + 30
    return im

def zusammen(pfad):
    """Empfehlung ist E; sie bekommt einen gruenen Rahmen. Wer nur EINEN Schritt
    gehen will, nimmt B — den Rest kann man spaeter daraufsetzen."""
    sp = bauen(None)
    br = BR * len(sp)
    kopf, fuss = 70, 34
    gb = grenzband(br)
    im = Image.new('RGB', (br, kopf + sp[0].height + gb.height + fuss), GRUND)
    d = ImageDraw.Draw(im)
    d.text((12, 10), 'WUSELWERKER — die Figur ueberarbeiten: fuenf Vorschlaege',
           font=font(27, True), fill=WEISS)
    d.text((12, 45), 'Jede Spalte, von oben: GEDRAENGE (7 Pixel Abstand) und GEHREIHE in '
                     'ECHTER Spielgroesse (Zelle 69 Punkte, Figur 52 hoch — so gross ist sie auf dem '
                     'Telefon) · dieselbe Gehreihe punktweise VERDOPPELT, damit man die Bewegung sieht · '
                     'ein Bild SECHSFACH.', font=font(14), fill=GRAU)
    for i, s in enumerate(sp):
        im.paste(s, (i * BR, kopf))
        if i:
            d.line([(i * BR - 1, kopf), (i * BR - 1, kopf + s.height)], fill=(60, 66, 78))
    e = (len(sp) - 1) * BR
    d.rectangle([e + 1, kopf + 1, e + BR - 3, kopf + sp[0].height - 2],
                outline=(120, 235, 160), width=3)
    d.rectangle([e + 3, kopf + sp[0].height - 24, e + BR - 5, kopf + sp[0].height - 3], fill=(24, 60, 36))
    d.text((e + 10, kopf + sp[0].height - 22), 'EMPFEHLUNG',
           font=font(14, True), fill=(140, 245, 175))
    im.paste(gb, (0, kopf + sp[0].height))
    y = kopf + sp[0].height + gb.height
    d.text((12, y + 8), 'Alle Zahlen bei Spielgroesse gemessen (Zelle 69), Silhouette ab Alpha 100, '
                        'mit dem Saum, den das Spiel wirklich zeichnet. B/H = Breite durch Hoehe der '
                        'Silhouette; ein Mensch liegt bei 0,35-0,45.',
           font=font(13), fill=(120, 128, 142))
    im.save(pfad); return im

if __name__ == '__main__':
    im = zusammen('/home/user/Wuselwerk/art-src/proben/figur2/wahl/wahl.png')
    print(im.size)
