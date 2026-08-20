# Zeichnet Blattzellen wie src/render/atlas.ts: Saum (8-fach um 2 Blattpunkte
# versetzt, einfarbig) hinter das Blatt, dann beides mit demselben Zielrechteck
# verkleinert. Spielgroesse = Zelle 69 Punkte (Telefon, Figur 52 Punkte hoch).
import sys
from PIL import Image
Z=112; SAUM=2
def saumblatt(im, ton):
    a=Image.new('RGBA', im.size, (0,0,0,0))
    for dx,dy in ((-SAUM,0),(SAUM,0),(0,-SAUM),(0,SAUM),(-SAUM,-SAUM),(SAUM,-SAUM),(-SAUM,SAUM),(SAUM,SAUM)):
        a.alpha_composite(im, dest=(max(dx,0),max(dy,0)), source=(max(-dx,0),max(-dy,0)))
    f=Image.new('RGBA', im.size, ton); f.putalpha(a.getchannel('A')); return f
def zelle(blatt, saum, r, c, gr):
    box=(c*Z,r*Z,c*Z+Z,r*Z+Z)
    o=Image.new('RGBA',(Z,Z),(0,0,0,0))
    if saum: o.alpha_composite(saum.crop(box))
    o.alpha_composite(blatt.crop(box))
    return o.resize((gr,gr), Image.LANCZOS)
def lade(p, ton=None):
    im=Image.open(p).convert('RGBA'); return im, (saumblatt(im,ton) if ton else None)
