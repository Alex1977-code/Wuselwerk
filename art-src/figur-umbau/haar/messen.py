"""Zahlen je Variante — dieselben Masse, an denen der alte Zeichner gescheitert ist."""
import numpy as np, math
from PIL import Image
from scipy import ndimage
from anker import AT, Z, PPL, zelle, masken
import probe, zeichnen as ZE

def zahlen(v, reihe, i, drift=(0, 0)):
    c = AT['clips'][reihe]
    a, s, dreh = c['anchors'][i], c['stirn'][i], c['dreh']
    roh = zelle(reihe, i)
    alt = np.asarray(roh)[..., 3] > 128
    z = probe.stutzen(roh, a, s, *v['stutz'], dreh=dreh) if v.get('stutz') else roh
    al, hm = masken(z)
    lg = ZE.strahnen(a, s, dreh, v, hm, drift, 0.0)
    tinte = np.zeros((Z, Z), bool)
    for k in ('hinten', 'vorn'):
        tinte |= np.asarray(lg[k])[..., 3] > 128
    neu = tinte & ~alt
    # Spielgroesse
    out = probe.bild(reihe, i, v, drift)
    g = np.asarray(out.resize((probe.SPIEL, probe.SPIEL), Image.LANCZOS))
    ga = g[..., 3] > 128
    r, gg, b = g[..., 0].astype(int), g[..., 1].astype(int), g[..., 2].astype(int)
    blau = ga & (b > r + 20) & (b > gg + 12)
    haut = ga & (r > 118) & (r >= gg) & (r > b)
    _, inseln = ndimage.label(blau, np.ones((3, 3)))
    o0 = zelle(reihe, i).resize((probe.SPIEL, probe.SPIEL), Image.LANCZOS)
    g0 = np.asarray(o0); a0 = g0[..., 3] > 128
    r0, gg0, b0 = g0[..., 0].astype(int), g0[..., 1].astype(int), g0[..., 2].astype(int)
    haut0 = a0 & (r0 > 118) & (r0 >= gg0) & (r0 > b0)
    return dict(
        tinte=int(tinte.sum()),
        aussen=round(float(neu.sum() / max(1, tinte.sum())) * 100, 1),
        umriss_gp=round(float((ga & ~a0).sum()), 0),
        inseln=int(inseln), haut=int(haut.sum()), haut0=int(haut0.sum()),
        breite=round(float(np.ptp(np.nonzero(ga.any(0))[0]) + 1) / probe.SPIEL * 17.003, 2),
    )
