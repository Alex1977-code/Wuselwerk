"""KLETTERN, FALLEN, RAMMEN — von Hand uebertrieben statt nur verstaerkt."""
import json, sys, copy, math
sys.path.insert(0, '/home/user/Wuselwerk/art-src/proben/figur2/posen/bau')
from verstaerker import lade, _norm

def _sp(f, **kw):
    for k, v in kw.items():
        f['richtung'][k] = [round(c, 4) for c in _norm(v)]

def _paar(f, stamm, links, rechts=None):
    """Setzt L_ und R_ eines Gliedes; rechts spiegelt links, wenn nicht angegeben."""
    r = rechts if rechts is not None else [-links[0], links[1], links[2]]
    _sp(f, **{f'L_{stamm}': links, f'R_{stamm}': r})

ARM_HOCH  = ([0.20, 0.94, 0.28], [0.12, 0.98, 0.16])
ARM_TIEF  = ([0.30, -0.42, 0.86], [0.18, 0.22, 0.96])
BEIN_HOCH = ([0.20, -0.34, 0.92], [0.15, -0.95, 0.28], [0.08, -0.28, 0.96])
BEIN_LANG = ([0.16, -0.95, 0.26], [0.12, -0.99, 0.05], [0.08, -0.16, 0.99])

def klettern(kraft=1.0):
    """Klimmzug: greifen, hochziehen, nachsetzen.

    Erste Fassung war ein Zweitakt — Streckung wechselte JEDES Bild, und welche
    Hand oben greift, sieht man hinter dem Haar ohnehin nicht. Gemessener
    Zweitakt 1,9: Bild 0 und 2 waren fast gleich, die Nachbarn weit auseinander.
    Das ist Flackern, keine Bewegung. Jetzt laeuft beides als **eine** Welle je
    Runde, und der Griffwechsel ist stufenlos statt umgeschaltet.
    """
    import math as _m
    p = lade('/home/user/Wuselwerk/art-src/wuselwerker/posen/climbing.json')
    n = len(p['frames'])
    q, r = 0.13*kraft, 0.25
    for i, f in enumerate(p['frames']):
        a = _m.cos(2*_m.pi*i/n)                    # +1 linke Hand oben, -1 rechte
        t = _m.cos(2*_m.pi*(i-1)/n)                # Hub laeuft dem Griff ein Bild nach
        def misch(hoch, tief, u):                  # u = 1 hoch, -1 tief
            k = (u+1)/2
            return [hoch[j]*k + tief[j]*(1-k) for j in range(3)]
        for vz, (ho, ti) in enumerate(zip(ARM_HOCH, ARM_TIEF)):
            nm = 'Upperarm' if vz == 0 else 'Forearm'
            L = misch([ho[0], ho[1], ho[2]], [ti[0], ti[1], ti[2]], a)
            R = misch([ho[0], ho[1], ho[2]], [ti[0], ti[1], ti[2]], -a)
            f['richtung'][f'L_{nm}'] = [round(c, 4) for c in _norm(L)]
            f['richtung'][f'R_{nm}'] = [round(c, 4) for c in _norm([-R[0], R[1], R[2]])]
        for vz, nm in enumerate(('Thigh', 'Calf', 'Foot')):
            L = misch(BEIN_LANG[vz], BEIN_HOCH[vz], a)
            R = misch(BEIN_LANG[vz], BEIN_HOCH[vz], -a)
            f['richtung'][f'L_{nm}'] = [round(c, 4) for c in _norm(L)]
            f['richtung'][f'R_{nm}'] = [round(c, 4) for c in _norm([-R[0], R[1], R[2]])]
        f['versatz'] = round(r*q*t, 5)
        f['stauch'] = [round(1 - q*t*0.7, 5), round(1 + q*t, 5), round(1 - q*t*0.7, 5)]
        f['richtung']['Spine01'] = [round(c, 4) for c in _norm([0.10*a, 0.95, 0.28])]
        f['richtung']['Spine02'] = [round(c, 4) for c in _norm([0.07*a, 0.98, 0.16])]
        f['winkel'] = {'Head': [round(-8 - 6*t, 2), 0, round(-7*a, 2)],
                       'HaarSchwung': [round(-6 - 22*t, 2), 0, round(-10*a, 2)]}
    return p

def fallen(art='welle', kraft=1.0):
    """art 'welle': eine Streckwelle je Runde. art 'zappel': harter Wechsel jedes Bild."""
    p = lade('/home/user/Wuselwerk/art-src/wuselwerker/posen/falling.json')
    q = 0.16*kraft
    takt = {'welle': [1.0, 0.0, -1.0, 0.0], 'zappel': [1.0, -1.0, 1.0, -1.0]}[art]
    for i, f in enumerate(p['frames']):
        t = takt[i]
        f['versatz'] = round(0.25*q*t, 5)
        f['stauch'] = [round(1 - q*t*0.7, 5), round(1 + q*t, 5), round(1 - q*t*0.7, 5)]
        s = math.cos(2*math.pi*(i-1)/len(p['frames']))   # Arme als Welle, nicht als Zweitakt
        # Arme rudern gegengleich: einer hoch und weit, der andere nach vorn gerissen.
        _sp(f, L_Upperarm=[0.62, 0.70 + 0.20*s, 0.34 - 0.30*s],
               R_Upperarm=[-0.62, 0.70 - 0.20*s, 0.34 + 0.30*s],
               L_Forearm=[0.50, 0.60 + 0.30*s, 0.62 - 0.20*s],
               R_Forearm=[-0.50, 0.60 - 0.30*s, 0.62 + 0.20*s])
        # Beine strampeln.
        _sp(f, L_Thigh=[0.26, -0.86, 0.42 + 0.30*s], R_Thigh=[-0.26, -0.86, 0.42 - 0.30*s],
               L_Calf=[0.18, -0.96, -0.18 - 0.30*s], R_Calf=[-0.18, -0.96, -0.18 + 0.30*s])
        f['richtung']['Spine01'] = [round(c, 4) for c in _norm([0.08*s, 0.98, -0.16 - 0.10*t])]
        f['winkel'] = {'Head': [round(8 + 7*t, 2), 0, round(7*s, 2)],
                       'HaarSchwung': [round(-26 - 16*t, 2), 0, round(-10*s, 2)]}
    return p

def rammen(kraft=1.0):
    """Ausholen und Zuschlagen als zwei verschiedene Silhouetten. Bild 0 ist der Treffer."""
    p = lade('/home/user/Wuselwerk/art-src/wuselwerker/posen/bashing.json')
    q = 0.13*kraft
    # t: +1 gestreckt/aufgerichtet (Ausholen), -1 gestaucht/vorgeschossen (Treffer)
    stufen = [(-1.0, 'treffer'), (-0.1, 'ruecklauf'), (1.0, 'ausholen')]
    for f, (t, wie) in zip(p['frames'], stufen):
        f['versatz'] = round(0.25*q*t, 5)
        f['stauch'] = [round(1 - q*t*0.8, 5), round(1 + q*t, 5), round(1 - q*t*0.8, 5)]
        neig = -0.34 if wie == 'treffer' else (0.30 if wie == 'ausholen' else 0.02)
        f['richtung']['Spine01'] = [round(c, 4) for c in _norm([0, 0.94, 0.34 + neig*1.0*kraft])]
        f['richtung']['Spine02'] = [round(c, 4) for c in _norm([0, 0.97, 0.20 + neig*0.7*kraft])]
        if wie == 'treffer':
            _sp(f, L_Upperarm=[0.20, -0.34, 0.92], R_Upperarm=[-0.20, -0.34, 0.92],
                   L_Forearm=[0.12, -0.30, 0.95], R_Forearm=[-0.12, -0.30, 0.95])
            kopf, haar = 12, 24
        elif wie == 'ruecklauf':
            _sp(f, L_Upperarm=[0.20, 0.10, 0.98], R_Upperarm=[-0.20, 0.10, 0.98],
                   L_Forearm=[0.12, 0.50, 0.86], R_Forearm=[-0.12, 0.50, 0.86])
            kopf, haar = 0, 4
        else:
            _sp(f, L_Upperarm=[0.20, 0.86, 0.47], R_Upperarm=[-0.20, 0.86, 0.47],
                   L_Forearm=[0.12, 0.72, -0.68], R_Forearm=[-0.12, 0.72, -0.68])
            kopf, haar = -16, -30
        # Ausfallschritt: vorderes Bein gebeugt, hinteres gestreckt.
        _sp(f, L_Thigh=[0.14, -0.90, 0.41], L_Calf=[0.11, -0.99, 0.05], L_Foot=[0.07, -0.24, 0.97],
               R_Thigh=[-0.14, -0.94, -0.31], R_Calf=[-0.11, -0.84, -0.53], R_Foot=[-0.07, -0.36, 0.93])
        f['winkel'] = {'Head': [round(kopf*kraft, 2), 0, 0], 'HaarSchwung': [round(haar*kraft, 2), 0, 0]}
    return p
