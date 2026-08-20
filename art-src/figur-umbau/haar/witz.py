"""Der Witz sitzt in der TRAEGHEIT: das Haar haengt, wenn die Figur steht, und
bleibt zurueck, wenn sie laeuft oder faellt. Alles fest gerechnet — kein
Math.random, die Simulation ist deterministisch.

Der Nachlauf ist eine Funktion des Bildes, nicht des Zufalls:
`drift = -(Geschwindigkeit) * traegheit`, mit einem Bild Verzoegerung.
"""
import math
import probe

# (Pose, Bild, Drift x, Drift y) — Drift in logischen Pixeln an der Spitze
FOLGE = [
    ('blocking', 0, 0.00, 0.00),   # steht: das Haar haengt senkrecht
    ('blocking', 1, 0.05, 0.00),
    ('walking', 0, -0.35, -0.10),  # geht: leichter Nachlauf, im Takt schwingend
    ('walking', 2, -0.85, -0.30),
    ('walking', 4, -0.35, -0.10),
    ('walking', 6, -0.85, -0.30),
    ('falling', 0, -0.90, -1.10),  # faellt: das Haar bleibt oben stehen
    ('falling', 1, -1.40, -2.00),
    ('falling', 2, -1.70, -2.60),
    ('falling', 3, -1.45, -2.20),
]

def strip(v, pfad):
    bs = [probe.bild(p, i, v, (dx, dy), phase=k * 0.9)
          for k, (p, i, dx, dy) in enumerate(FOLGE)]
    return probe.paar(bs, pfad, 0.66, 5, 3)
