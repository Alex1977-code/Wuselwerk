"""Verstaerkt eine vorhandene Pose um den Faktor g, ohne die Durchschnittshaltung
zu verschieben: jede Groesse wird um ihren Mittelwert ueber alle Bilder gespreizt.
Richtungsvektoren werden dabei um die Mittelrichtung herausgedreht (Slerp mit t=g)."""
import json, math, copy

def _norm(v):
    l = math.sqrt(sum(c*c for c in v)) or 1.0
    return [c/l for c in v]

def _spreiz_richtung(mittel, v, g):
    m, v = _norm(mittel), _norm(v)
    d = max(-1.0, min(1.0, sum(a*b for a, b in zip(m, v))))
    w = math.acos(d)
    if w < 1e-6:
        return v
    ax = [m[1]*v[2]-m[2]*v[1], m[2]*v[0]-m[0]*v[2], m[0]*v[1]-m[1]*v[0]]
    ax = _norm(ax)
    t = w*g
    c, s = math.cos(t), math.sin(t)
    kx = [ax[1]*m[2]-ax[2]*m[1], ax[2]*m[0]-ax[0]*m[2], ax[0]*m[1]-ax[1]*m[0]]
    dt = sum(a*b for a, b in zip(ax, m))
    return _norm([m[i]*c + kx[i]*s + ax[i]*dt*(1-c) for i in range(3)])

def verstaerke(pose, g, nur=None):
    """g = 1 laesst alles wie es ist. nur = Menge von Knochennamen (None = alle)."""
    p = copy.deepcopy(pose)
    fr = p['frames']
    n = len(fr)
    knochen = sorted({k for f in fr for k in f.get('richtung', {})})
    for kn in knochen:
        if nur and kn not in nur:
            continue
        vs = [f['richtung'][kn] for f in fr if kn in f.get('richtung', {})]
        if len(vs) < n:
            continue
        mittel = _norm([sum(v[i] for v in vs)/n for i in range(3)])
        for f in fr:
            f['richtung'][kn] = [round(c, 4) for c in _spreiz_richtung(mittel, f['richtung'][kn], g)]
    wknochen = sorted({k for f in fr for k in f.get('winkel', {})})
    for kn in wknochen:
        vs = [f.get('winkel', {}).get(kn, [0, 0, 0]) for f in fr]
        mittel = [sum(v[i] for v in vs)/n for i in range(3)]
        for f, v in zip(fr, vs):
            f.setdefault('winkel', {})[kn] = [round(mittel[i] + g*(v[i]-mittel[i]), 3) for i in range(3)]
    vz = [f.get('versatz', 0) or 0 for f in fr]
    mv = sum(vz)/n
    st = [f.get('stauch', [1, 1, 1]) for f in fr]
    ms = [sum(s[i] for s in st)/n for i in range(3)]
    for f, v, s in zip(fr, vz, st):
        f['versatz'] = round(mv + g*(v-mv), 5)
        f['stauch'] = [round(ms[i] + g*(s[i]-ms[i]), 5) for i in range(3)]
    return p

def lade(pfad):
    with open(pfad) as fh:
        return json.load(fh)
