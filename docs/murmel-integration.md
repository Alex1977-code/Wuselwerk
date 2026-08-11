# Murmel — Integrationsdokumentation

Spielfigur für das Lemminge-Handyspiel. Alles, was die Engine über die Figur wissen muss.

---

## 1. Konzept in drei Sätzen

Die Murmel ist ein gesichtsloser Kiesel ohne Beine. Ihre gesamte Mimik läuft über ein einziges bewegliches Element am Kopf — den **Schopf** —, das als separate 2D-Ebene über den 3D-gebackenen Körper gelegt wird. Der Körper ist farbneutral, die Akzentfarbe des Schopfs zeigt an, welchen Beruf die Figur gerade ausübt.

Daraus folgen drei Regeln, die überall gelten:

1. Der Körper wird **nie** eingefärbt. Farbe ist Information und gehört dem Schopf.
2. Der Schopf zeigt immer den Zustand des **vorherigen** Körperbildes (ein Bild Nachlauf).
3. Nichts Dunkles ragt in die Körperfläche hinein. Werkzeuge brechen die Silhouette nach außen, sonst werden sie als Gesichtszüge gelesen.

---

## 2. Dateien

| Datei | Inhalt |
|---|---|
| `murmel_posen_sheet.png` | Körper-Spritesheet, 896 × 1344, RGBA transparent |
| `murmel_posen_anker.json` | Takte, Schopf-Ankerposition und Schopf-Zustand je Einzelbild |
| `murmel_tuff_sheet.png` | Schopf-Spritesheet, 600 × 600, RGBA transparent, 9 Zustände |
| `murmel_posen.glb` | 3D-Modell mit Rig und allen 12 Animationen (Quelle zum Neubacken) |

`murmel_rig_v2.glb` ist dasselbe Modell ohne Animationen und wird zur Laufzeit nicht gebraucht.

---

## 3. Körper-Spritesheet

**Raster:** 8 Spalten × 12 Reihen, Zelle 112 × 112 Bildpunkte = 28 × 28 logische Pixel bei 4 Bildpunkten je logischem Pixel.

**Zeilenreihenfolge** (Zeile 0 oben):

| Zeile | Pose | Bilder | Takte je Bild | Gesamt | Ablauf |
|---:|---|---:|---|---:|---|
| 0 | walking | 8 | 3 durchgehend | 24 | Schleife |
| 1 | falling | 4 | 4 durchgehend | 16 | Schleife |
| 2 | floating | 4 | 3 durchgehend | 12 | Schleife |
| 3 | climbing | 4 | 4 durchgehend | 16 | Schleife |
| 4 | hoisting | 6 | 8·5, dann 12 | 52 | einmal |
| 5 | building | 8 | 3 durchgehend | 24 | Schleife |
| 6 | bashing | 3 | 3 durchgehend | 9 | Schleife |
| 7 | mining | 4 | 3 durchgehend | 12 | Schleife |
| 8 | digging | 3 | 3, 2, 2 | 7 | Schleife |
| 9 | blocking | 2 | 8, 8 | 16 | Schleife |
| 10 | saving | 6 | 3 durchgehend | 18 | einmal |
| 11 | dying | 8 | 3·6, dann 4, 4 | 26 | einmal |

Zellen rechts der angegebenen Bilderzahl sind leer. Ein Takt entspricht 1/60 Sekunde.

**Zellgeometrie.** Die Fußlinie der Figur liegt 3 Bildpunkte über der Zellunterkante. Der Zellausschnitt deckt 1,22 Modelleinheiten in beiden Achsen ab; die Figur ist im Ruhezustand 0,861 Einheiten hoch, also rund 79 Bildpunkte. Der Ausschnitt ist bewusst 8 % weiter als nötig, damit auch die breiteste Pose (`dying`, flachgedrückt) nicht beschnitten wird. Alle Bilder teilen denselben Maßstab — nie einzelne Zellen nachskalieren.

**Spiegeln.** Die Figur ist frontal gebacken und lehnt in Bewegungsrichtung nach rechts. Für die Gegenrichtung die Zelle horizontal spiegeln. Der Schopf-Anker muss dabei mitgespiegelt werden: `x_gespiegelt = 28 − x`.

---

## 4. Schopf-Spritesheet

**Raster:** 3 Spalten × 3 Reihen, Zelle 200 × 200 Bildpunkte.

| Index | Zelle | Zustand | Bedeutung |
|---:|---|---|---|
| 0 | Z1 S1 | ruhe | neutral, aufrecht |
| 1 | Z1 S2 | lauf_a | Gehen, Phase A |
| 2 | Z1 S3 | lauf_b | Gehen, Phase B |
| 3 | Z2 S1 | zurueck | nach hinten gerissen, Schub nach vorn |
| 4 | Z2 S2 | vor | nach vorn gestreckt, greift |
| 5 | Z2 S3 | hoch | steil aufgerichtet, Kraft nach unten |
| 6 | Z3 S1 | geknickt | an die Wand gepresst |
| 7 | Z3 S2 | flach | liegt, Aufprall oder Tod |
| 8 | Z3 S3 | schirm | zum Fallschirm geöffnet |

Alle neun teilen denselben Ankerpunkt: waagerecht Zellmitte, senkrecht 24 Bildpunkte über Zellunterkante. Beim Zeichnen wird dieser Punkt auf den Anker aus der JSON gelegt.

**Der Schopf ist das Requisit.** Beim Schweben gibt es keinen separaten Schirm — der Schopf selbst öffnet sich (Index 8). Das spart ein Objekt und ist zugleich die stärkste Aussage des Entwurfs.

---

## 5. Ankertabelle

`murmel_posen_anker.json`, Aufbau:

```json
{
  "zelle_px": 112,
  "zelle_logisch": 28,
  "spalten": 8,
  "reihenfolge": ["walking", "falling", ...],
  "posen": {
    "walking": {
      "loop": true,
      "frames": [
        { "frame": 0, "ticks": 3,
          "anchor_px": [62.3, 30.5],
          "anchor_logisch": [15.59, 7.63],
          "tuff": 1 }
      ]
    }
  }
}
```

`anchor_px` ist der Ursprung links oben der Zelle, y nach unten. `tuff` ist der Index ins Schopf-Sheet.

**Warum eine Tabelle und keine feste Position.** Der Anker wandert je nach Pose zwischen y = 5,4 und y = 25,8 logischen Pixeln — beim Klettern sitzt er hoch, beim Sterben fast auf dem Boden. Waagerecht schwankt er zwischen x = 10,6 und x = 25,0. Eine feste Position würde den Schopf bei jeder Neigung vom Kopf rutschen lassen.

Extremwerte zur Kontrolle: `hoisting` Bild 0 liegt bei [25,01 / 13,80], `dying` Bild 7 bei [14,00 / 25,79], `bashing` Bild 0 bei [10,64 / 7,94].

---

## 6. Ebenen und Zeichenreihenfolge

Von hinten nach vorn:

1. **Körper** — Zelle aus dem Körper-Sheet, unverändert, nie eingefärbt
2. **Werkzeug** — noch zu erstellen, siehe Abschnitt 9
3. **Schopf** — Zelle aus dem Schopf-Sheet, am Anker positioniert, eingefärbt
4. **Schutt und Partikel** — von der Engine erzeugt

Der Schopf liegt bewusst **über** dem Werkzeug, damit er beim Bohren vor dem Keil durchschwingen kann.

---

## 7. Laufzeitlogik

**Nachlauf.** Der Schopf zeigt den Zustand des vorherigen Körperbildes:

```
schopf_index = TUFT[pose][(bild - 1 + n) % n]
```

Bei einmaligen Posen wird bei Bild 0 der Zustand von Bild 0 verwendet. Ein Bild Verzögerung, nicht mehr — das ist die gesamte Physik, die der Schopf braucht.

**Einfärbung.** Das Schopf-Sheet liegt in Akzentfarbe vor. Für den Produktivbetrieb weiß exportieren und zur Laufzeit multiplikativ tönen, dann reicht ein Sheet für alle Berufe.

| Beruf | Farbe |
|---|---|
| Gehen (kein Beruf) | `#D8D0C4` |
| Bohren (bashing) | `#E8674F` |
| Graben (digging, mining) | `#E2B044` |
| Bauen (building) | `#569CB2` |
| Sperren (blocking) | `#80A86C` |
| Klettern (climbing) | `#A87EBE` |
| Schweben (floating) | `#EE9EB0` |
| Sprengen | `#5C5C68` |

Körper `#EFE3D0`, Sohle `#D6C6AC`, Augen `#2E2A26`.

**Sprengen ohne Countdown.** Kein Ziffernzähler über dem Kopf. Der Schopf pulst stattdessen im Sekundentakt zwischen Akzentfarbe und Weiß, und die Taktfrequenz verdoppelt sich in den letzten zwei Sekunden. Das ist ohne Text lesbar und passt zur gesichtslosen Figur.

**Schutt als vierter Kanal.** Seitlich nach hinten bei `bashing`, schräg nach hinten-unten bei `mining`, nach oben zu beiden Seiten bei `digging`, keiner bei `building`. Bewegte Partikel fallen im Blick sofort auf, auch wenn die Figur klein ist — der billigste Lesbarkeitsgewinn im ganzen System.

**Der Tod.** Ab Bild 6 von `dying` verlässt der Schopf den Anker, segelt herab und bleibt auf dem Boden liegen. Das ist der einzige Fall, in dem er sich vom Körper löst, und der emotionale Kern des Entwurfs. Die beiden langen Schlussbilder gehören ihm allein — nicht mit einer Explosion füllen.

---

## 8. Lesbarkeitsgrenzen

Bei 48 Bildpunkten Höhe bleibt alles lesbar: Silhouette, Augen, Posenunterschiede. Bei 32 kippt es — dann ist nur noch ein heller Klumpen mit farbigem Punkt erkennbar. **Die Figur darf im Spiel nicht kleiner als 48 Bildpunkte dargestellt werden.**

Faustregel für alles Weitere: Was Information trägt, muss mindestens drei logische Pixel breit sein.

---

## 9. Offene Punkte

**Werkzeug-Bake fehlt.** Keil (waagerecht), Spaten (senkrecht), Planke (steigend). Alle in `#3A3430`, alle außerhalb der Körperkontur. Die Achse des Werkzeugs ist das, was der Spieler liest — nicht das Gerät selbst.

**`bashing` und `mining` trennen sich derzeit nur über die Körperneigung.** Das ist knapp. Die Werkzeugachse muss den Unterschied tragen: strikt waagerecht gegen deutlich 45 Grad nach unten-vorn. Nicht 30 Grad — der Unterschied muss auf einen Blick sitzen.

**`building` liest sich ohne Planke fast wie Gehen.** Sobald das Werkzeug im Bild ist, sollte es tragen. Falls nicht, die Kopfneigung von 20 auf etwa 30 Grad ziehen und neu backen.

**Blocker-Ausnahme.** `blocking` ist die einzige Pose ohne Werkzeug. Sie hat dafür die breiteste Silhouette und den langsamsten Takt — Ruhe ist hier die Information, nicht Bewegung.

---

## 10. Neu backen

Änderungen gehen über `murmel_posen.glb`, nicht über die Pixel. Die zwölf Animationen liegen dort mit STEP-Interpolation und den Taktzeiten aus Abschnitt 3.

Der Rig hat acht Knochen:

```
Root                 Bodenpivot, y = 0, ohne Gewicht
└─ Body              y = 0,20   Neigung und Squash        28,6 %
   ├─ L_Foot         y = 0,075                             5,2 %
   ├─ R_Foot         y = 0,075                             5,1 %
   └─ Head           y = 0,44   obere Körperhälfte        35,8 %
      ├─ Crown       y = 0,861  Schopf-Anker, ohne Gewicht
      ├─ L_Arm       y = 0,455                            12,8 %
      └─ R_Arm       y = 0,455                            12,4 %
```

Zwei Eigenheiten, die beim Weiterarbeiten wichtig sind. Die Arme hängen an `Head`, nicht an `Body` — sonst scheren sie am Ansatz weg, sobald der Kopf sich neigt. Und die Biegezone zwischen `Body` und `Head` läuft von y = 0,28 bis 0,50, endet also unter den Augen bei y = 0,488; dadurch sitzen die Augen geschlossen in einer Zone und verzerren bei keiner Neigung. Wer die Zone verschiebt, muss diese Grenze einhalten.

Der Anker für den Schopf ist die Weltposition des `Crown`-Knochens je Einzelbild, projiziert in Zellkoordinaten. Beim Neubacken fällt die Ankertabelle also automatisch mit ab.
