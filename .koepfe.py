"""Kopfausschnitte aus der Spielprobe — der schnelle Blick beim Nachstellen."""
from PIL import Image
im = Image.open('art-src/proben/ww-spiel.png')
W, H = im.size
zeil = H / 13
NAMEN = ['walking','falling','floating','climbing','hoisting','building','bashing',
         'mining','digging','blocking','saving','dying','spaehen']
ZEIG = ['walking','climbing','bashing','mining','digging','blocking','dying']
teile = []
for r, name in enumerate(NAMEN):
    if name not in ZEIG: continue
    teile.append((name, im.crop((1650, int(r*zeil)+6, 1650+520, int(r*zeil)+int(zeil*0.60)))))
w = max(t[1].size[0] for t in teile); h = sum(t[1].size[1] for t in teile)
out = Image.new('RGB', (w, h), (20, 22, 26)); y = 0
for n, t in teile:
    out.paste(t, (0, y)); y += t.size[1]
out.resize((int(w*1.5), int(h*1.5)), Image.LANCZOS).save('art-src/proben/ww-koepfe.png')
print('art-src/proben/ww-koepfe.png', out.size)
