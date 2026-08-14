# Wie gross die Figur wirklich ist

Gemessen, nicht geschaetzt — an `src/core/constants.ts`, `src/render/camera.ts`,
`scripts/bake-figur.mjs`, `src/art/wuselwerker.atlas.json` und am gebackenen
Blatt selbst, dazu ein Messlauf ueber acht Geraetegroessen im echten Spiel.

Diese Datei ist die Vorgabe fuer jede Neuerstellung der 3D-Figur.

## 1 Auf dem Bildschirm

Die Simulation rechnet mit **`WUSEL_H = 12` logischen Pixeln**. Das ist
zugleich die Kollisionshoehe und der Massstab, an dem alles andere haengt
(Stufenhoehe 5, Sturzgrenze 78, Grabbreite 9).

Der Massstab auf dem Bildschirm ist

    Massstab = min(Spielfeldbreite / 180, Spielfeldhoehe / 120) x Zoom

und die Pixeldichte ist auf **2 gedeckelt** (`Game.resize`:
`Math.min(2, devicePixelRatio)`) — ein Telefon mit dreifacher Dichte rendert
die Figur trotzdem nur zweifach.

| Geraet | Spielfeld (CSS) | Massstab | Koerper 12 px | Zelle 17 px |
|---|---|---|---|---|
| iPhone SE (320x568) | 320 x 400 | 1,78 | 21,3 CSS = **43 Punkte** | 60 |
| iPhone 8 (375x667) | 375 x 499 | 2,08 | 25,0 CSS = **50 Punkte** | 71 |
| iPhone 14 (390x844) | 390 x 676 | 2,17 | 26,0 CSS = **52 Punkte** | 74 |
| Pixel 7 (412x915) | 412 x 747 | 2,29 | 27,5 CSS = **55 Punkte** | 78 |
| 14 Pro Max (430x932) | 430 x 764 | 2,39 | 28,7 CSS = **57 Punkte** | 81 |
| iPhone 14 quer | 794 x 143 | 1,19 | 14,3 CSS = **29 Punkte** | 41 |
| iPad hoch | 718 x 194 | 1,62 | 19,4 CSS = **39 Punkte** | 55 |
| iPad quer | 842 x 246 | 2,05 | 24,6 CSS = **49 Punkte** | 70 |

**Die eine Zahl, wenn nur eine gebraucht wird:** Auf einem heutigen Telefon
ist die Figur **26 CSS-Pixel = 52 Geraetepunkte** hoch. Fuer die
Gestaltung ist das die Groesse, in der alles lesbar sein muss.

Der Spieler kann zoomen (`ZOOM_MIN 0,6` bis `ZOOM_MAX 2,4`). Bei vollem
Zoom wird der Koerper auf einem 14 Pro Max **138 Geraetepunkte** hoch, die
Zelle 195.

### Ein Befund am Rande: das Blatt ist fuer den Maximalzoom zu grob

Die Zelle im Blatt misst 112 Bildpunkte. Bei vollem Zoom braucht sie bis zu
195 — dort wird um Faktor 1,7 **hoch**skaliert. Bei einer Neuerstellung
waere `ZELLE = 160` der ehrliche Wert (Blatt dann 1280 x 2080 statt
896 x 1456, rund doppelte Dateigroesse). Das ist eine Entscheidung, keine
Pflicht: Der Maximalzoom ist selten, und die Datei ist ein Budget.

## 2 Das Blatt

| Groesse | Wert |
|---|---|
| Zelle | 112 x 112 Bildpunkte |
| Blatt | 896 x 1456 (8 Spalten x 13 Zeilen), WebP mit Alpha |
| Zelle logisch | 17,003 logische Pixel |
| Bildpunkte je logischem Pixel (`ppl`) | 6,587 |
| Anker (Fusspunkt) | x = 8,5015 (Zellmitte), y = 16,5476 — 97,3 % der Zellhoehe |
| Ueberabtastung beim Backen | 6-fach, also 672 x 672 je Bild |
| Posen (Zeilen) | walking, falling, floating, climbing, hoisting, building, bashing, mining, digging, blocking, saving, dying, spaehen |

## 3 Fuer die 3D-Erstellung

Der Backvorgang (`scripts/bake-figur.mjs`) rendert orthografisch:

| Groesse | Wert | Bedeutung |
|---|---|---|
| `SICHT` | 1,22 Modelleinheiten | Hoehe UND Breite des Sichtfelds = die Zelle |
| `FIGUR_EINHEITEN` | 0,861 Modelleinheiten | worauf die Figur normiert wird |
| `FUSS_PX` | 3 von 112 | Luft unter der Sohle |
| Verhaeltnis | 0,861 / 1,22 = **70,6 %** | Figur zur Zellhoehe |

### Die Falle, und sie ist die wichtigste Zeile dieses Dokuments

`eiche()` misst die **Huellbox des ganzen Modells in der Ruhepose** — Haar
eingeschlossen — und skaliert sie auf 0,861. Die 0,861 sind also **nicht die
Koerperhoehe, sondern die Gesamthoehe von der Sohle bis zur obersten
Haarspitze.**

Daraus folgt: **Ein groesseres Haar macht nicht die Figur groesser, sondern
den Koerper kleiner.** Wer eine Maehne baut, ohne die Proportion mit
vorzugeben, bekommt ein Gesicht, das im Spiel um denselben Anteil
schrumpft — und das Gesicht ist bei 52 Punkten Hoehe ohnehin das Knappste.

Gemessen am heutigen Blatt (Zeilen `walking` und `blocking`):

- Gesamthoehe der Figur im Bild: **84 von 112 Zellpunkten** (75 %)
- davon Haar und Kopfoberteil: **27 bis 29 Punkte = 32 bis 35 %**

**Vorgabe fuer ein neues Modell:** Haar und Kopfoberteil duerfen **hoechstens
40 %** der Gesamthoehe einnehmen. Darueber wird das Gesicht unlesbar.

### Wie dick eine Haarstraehne mindestens sein muss

Die Figur ist im Bild 84 Bildpunkte hoch und wird auf dem Telefon mit 52
Geraetepunkten gezeigt — ein Verhaeltnis von rund 1,6 zu 1. Eine Straehne,
die im Spiel ueberhaupt sichtbar sein soll, braucht dort mindestens einen
ganzen Punkt, also im Blatt mindestens zwei:

> **Jede Haarstraehne mindestens 2,5 % der Figurenhoehe dick** — im Modell
> also mindestens 0,022 Modelleinheiten.

Das ist der Grund, warum die Vorlage in `art-src/ansichten/vorn-haar.png`
nicht funktioniert hat: Sie zeigt eine Flammenmaehne aus dutzenden feinen
Spitzen. Bei 52 Punkten Figurenhoehe ist jede davon ein Drittel Bildpunkt
breit, und ein Drittel Bildpunkt ist kein Haar, sondern Rauschen. Das
Bild-zu-3D-Verfahren hat daraus folgerichtig eine glatte Kuppel gemacht —
die Muetze, ueber die dreimal geklagt wurde.

**Ein neues Modell braucht deshalb weniger und dickere Straehnen als die
Vorlage: etwa acht bis zwoelf, nicht vierzig.**

### Was das Modell sonst mitbringen muss

- **Rig mit den vorhandenen Knochennamen** (`Head`, `Spine01/02`, `Waist`,
  `Pelvis`, `L_/R_Upperarm`, `L_/R_Forearm`, `L_/R_Hand`, `L_/R_Thigh`,
  `L_/R_Calf`, `L_/R_Foot`, `NeckTwist01/02`, `Root`). Die Posen in
  `art-src/wuselwerker/posen/*.json` benennen Knochen und Zielrichtungen;
  fehlt ein Knochen, faellt die Pose in die Ruhelage.
- **Nullpunkt im Becken**, wie beim heutigen Modell. Der Seitenversatz wird
  in `figur.json` ausgeglichen.
- **Blickwinkel je Pose** stehen in `figur.json` (`drehung`): Gehen 46 Grad,
  Sperren 8 Grad, Sterben 0 Grad, und so weiter. Das Modell wird also aus
  wechselnden Winkeln gesehen — eine Silhouette, die nur von vorn
  funktioniert, faellt beim Gehen auseinander.
- **Haar als eigenes Untermesh mit eigenem Material.** Das heutige Modell ist
  ein einziges Mesh mit einem Material (4964 Dreiecke, aus einem
  Bild-zu-3D-Dienst) — deshalb laesst sich am Haar nichts aendern, ohne den
  Kopf mit anzufassen.
