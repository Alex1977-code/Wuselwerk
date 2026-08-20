"""Bis zu 13 Posenvarianten in EINEM Backvorgang: jede Variante belegt eine Zeile
des Blatts. Die Zeile gibt nur die Bildzahl vor; Blickwinkel und Bodenbezug
schreibt die Variante selbst. So kostet ein Vergleich zwoelf Sekunden statt zwoelf mal zwoelf."""
import json, os, shutil, subprocess, sys

WURZEL = '/home/user/Wuselwerk'
BAU = f'{WURZEL}/art-src/proben/figur2/posen/bau'
ZEILEN = [('walking',8),('falling',4),('floating',4),('climbing',4),('hoisting',6),
          ('building',8),('bashing',3),('mining',4),('digging',3),('blocking',2),
          ('saving',6),('dying',8),('spaehen',6)]
ORIG = f'{WURZEL}/art-src/wuselwerker/posen'

def plaetze(n):
    """Zeilen, die mindestens n Bilder fassen — laengste zuerst vergeben ist falsch;
    knappste zuerst, damit die 8er-Zeilen fuer 8er-Varianten frei bleiben."""
    return [z for z, k in ZEILEN if k >= n]

def backe(belegung, name, dreh_je=None):
    """belegung: {zeilenname: posedict}. Schneidet Bilder auf die Zeilenlaenge zu."""
    q = f'{WURZEL}/art-src/proben/figur2/posen/lauf/{name}'
    shutil.rmtree(q, ignore_errors=True)
    os.makedirs(f'{q}/posen', exist_ok=True)
    fj = json.load(open(f'{WURZEL}/art-src/wuselwerker/figur.json'))
    for z, k in ZEILEN:
        p = belegung.get(z)
        if p is None:
            p = json.load(open(f'{ORIG}/{z}.json'))
        else:
            p = json.loads(json.dumps(p))
            if len(p['frames']) < k:
                p['frames'] = (p['frames'] * ((k // len(p['frames'])) + 1))[:k]
            p['frames'] = p['frames'][:k]
            if dreh_je and z in dreh_je:
                p['dreh'] = dreh_je[z]
        json.dump(p, open(f'{q}/posen/{z}.json', 'w'))
    json.dump(fj, open(f'{q}/figur.json', 'w'))
    os.symlink(f'{WURZEL}/art-src/wuselwerker/wuselwerker-haar.glb', f'{q}/wuselwerker-haar.glb')
    ziel = f'{WURZEL}/art-src/proben/figur2/posen/blatt/{name}'
    rel = os.path.relpath(q, WURZEL); zrel = os.path.relpath(ziel, WURZEL)
    r = subprocess.run(['node', f'{BAU}/backen.mjs', 'wuselwerker', '--quelle', rel, '--ziel', zrel],
                       cwd=WURZEL, capture_output=True, text=True)
    if r.returncode:
        print(r.stdout[-2000:], r.stderr[-2000:]); sys.exit(1)
    return f'{ziel}/wuselwerker.webp', r.stdout
