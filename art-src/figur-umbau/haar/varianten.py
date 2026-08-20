BASIS = dict(mitte=1.25, flug=0.5, gesicht=0.72, unterauge=0.05, vornkurz=0.72,
             einzug=0.35, spitze=0.35, wobbel=0.25, zahlvorn=0, von=0.04, bis=0.5,
             hell=1.14, dunkel=0.82, stutz=None)

def V(**kw):
    d = dict(BASIS); d.update(kw); return d

# 1 — DREI ZOEPFE: wenige, dicke, hueftlang, hinten, mit Flug nach aussen
DREI = V(zahl=3, laenge=7.2, dicke=0.70, von=0.02, bis=0.42, flug=0.95,
         staffel=(1.0, 0.62, 0.84),
         stutz=(1.62, 1.62, 1.25))
# 2 — SECHS FAEDEN: duenn, schulterlang, dicht — die gemessene Fehlvariante
SECHS = V(zahl=4, zahlvorn=2, laenge=4.4, dicke=0.36, wobbel=0.32,
          von=0.02, bis=0.78, stutz=(1.55, 1.58, 1.25))
# 3 — DER SCHWEIF: einer, sehr lang, unter die Tunika hinaus
ZOPF = V(zahl=1, laenge=9.6, dicke=1.10, spitze=0.24, wobbel=0.0, flug=0.75,
         von=0.02, stutz=(1.45, 1.55, 1.25))
# 4 — ZWEI SEITENZOEPFE: links und rechts an der breitesten Stelle des Kopfes,
#     wo er den Rumpf ueberragt — die einzige Stelle, die in JEDER Pose frei
#     vor dem Himmel steht
SEITE = V(zahl=1, zahlvorn=1, laenge=7.2, dicke=0.80, von=0.0, bis=0.0,
          flug=1.15, vornkurz=1.0, unterauge=-0.55, stutz=(1.58, 1.60, 1.25))
# 5 — GESTAFFELTE MAEHNE: fuenf Straehnen, jede anders lang. Die Unterkante
#     wird zackig statt gerade — der Umriss bricht auf, ohne dass mehr Tinte
#     noetig waere.
STAFFEL = V(zahl=5, laenge=7.0, dicke=0.50, von=0.02, bis=0.60, flug=0.85,
            staffel=(1.0, 0.55, 0.85, 0.40, 0.72), wobbel=0.18,
            stutz=(1.62, 1.62, 1.25))
NICHTS = V(zahl=0, laenge=0, dicke=0)
