"""Streifenbild in echter Spielgroesse + Messung. Aufruf: mess.py <blatt> <name>"""
import sys, math, json
from PIL import Image

ZELLE_BLATT = 112
ZELLE_SPIEL = 74          # iPhone 14: Zelle 17,003 log px * 2,17 * dpr 2
REIHEN = ['walking','falling','floating','climbing','hoisting','building',
          'bashing','mining','digging','blocking','saving','dying','spaehen']
HIMMEL = (127,178,217); ERDE = (74,63,53)

def zellen(blatt, reihe, n):
    r = REIHEN.index(reihe)
    return [blatt.crop((i*ZELLE_BLATT, r*ZELLE_BLATT, (i+1)*ZELLE_BLATT, (r+1)*ZELLE_BLATT))
            for i in range(n)]

def haar(px):
    r,g,b,a = px
    return a>128 and b>r+20 and b>g+12

def streifen(bilder, breite_faktor=0.62):
    """Pulk: Figuren dicht nebeneinander, jede in einem anderen Gehbild."""
    schritt = int(ZELLE_SPIEL*breite_faktor)
    w = schritt*len(bilder) + ZELLE_SPIEL - schritt
    im = Image.new('RGBA', (w, ZELLE_SPIEL), HIMMEL+(255,))
    boden = int(ZELLE_SPIEL*0.965)
    im.paste(Image.new('RGBA',(w, ZELLE_SPIEL-boden), ERDE+(255,)), (0,boden))
    for i,c in enumerate(bilder):
        k = c.resize((ZELLE_SPIEL,ZELLE_SPIEL), Image.LANCZOS)
        im.alpha_composite(k, (i*schritt, 0))
    return im

def auskragung(zelle):
    """Wie weit steht Haar aus der geglaetteten HAAR-Silhouette (Spielpunkte)."""
    s = ZELLE_SPIEL/ZELLE_BLATT
    m = [(x,y) for x in range(ZELLE_BLATT) for y in range(ZELLE_BLATT)
         if zelle.getpixel((x,y))[3] > 128]
    hs = [(x,y) for (x,y) in m if haar(zelle.getpixel((x,y)))]
    if len(hs) < 20: return None
    ys = [y for _,y in hs]; xs = [x for x,_ in hs]
    oben = [(x,y) for (x,y) in hs if y < min(ys)+(max(ys)-min(ys))*0.5]
    cx = sum(x for x,_ in oben)/len(oben); cy = sum(y for _,y in oben)/len(oben)
    prof = {}
    for (x,y) in hs:
        a = math.degrees(math.atan2(cy-y, x-cx)) % 360
        k = int(a)//4
        r = math.hypot(x-cx, y-cy)
        if r > prof.get(k, -1): prof[k] = r
    ks = sorted(prof)
    if len(ks) < 12: return None
    glatt = {}
    for k in ks:
        w = [prof[j] for j in ks if min(abs(j-k), 90-abs(j-k)) <= 7]
        glatt[k] = sum(w)/len(w)
    ab = {k: (prof[k]-glatt[k])*s for k in ks}
    spitze = max(ab.values())
    zacken = 0; drin = False
    for k in ks:
        if ab[k] > 0.9 and not drin: zacken += 1; drin = True
        elif ab[k] < 0.35: drin = False
    kopfoben = [p for p in hs if 20 <= math.degrees(math.atan2(cy-p[1], p[0]-cx)) % 360 <= 160]
    tip = max(kopfoben, key=lambda p: math.hypot(p[0]-cx, p[1]-cy)) if kopfoben else (cx,cy)
    return dict(spitze=round(spitze,2), zacken=zacken,
                tip=[round(tip[0]*s,2), round(tip[1]*s,2)],
                haaranteil=round(len(hs)/len(m),3),
                hoehe_haar=round((max(ys)-min(ys))*s,1),
                breite_haar=round((max(xs)-min(xs))*s,1))

def kopf_lesbar(zelle):
    """Haut- und Dunkelanteil im Kopfbereich bei Spielgroesse."""
    k = zelle.resize((ZELLE_SPIEL,ZELLE_SPIEL), Image.LANCZOS)
    haut = dunkel = blau = 0
    for x in range(ZELLE_SPIEL):
        for y in range(ZELLE_SPIEL):
            r,g,b,a = k.getpixel((x,y))
            if a < 128: continue
            if r<80 and g<80 and b<105: dunkel += 1
            elif r>115 and r>=g and r>b: haut += 1
            elif b>r+20 and b>g+12: blau += 1
    return dict(haut=haut, dunkel=dunkel, blau=blau)

if __name__ == '__main__':
    blatt = Image.open(sys.argv[1]).convert('RGBA')
    name = sys.argv[2]
    zs = zellen(blatt, 'walking', 8)
    st = streifen(zs)
    aus = f'art-src/proben/figur2/haar/bilder/{name}'
    st.save(aus+'-echt.png')
    st.resize((st.width*8, st.height*8), Image.NEAREST).save(aus+'-8x.png')
    mess = {'auskragung': [auskragung(z) for z in zs],
            'kopf': kopf_lesbar(zs[0])}
    tips = [m['tip'] for m in mess['auskragung'] if m]
    if len(tips) > 1:
        weg = max(math.hypot(a[0]-b[0], a[1]-b[1]) for a in tips for b in tips)
        mess['kantenweg'] = round(weg,2)
    print(json.dumps(mess, ensure_ascii=False))
