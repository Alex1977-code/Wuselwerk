# Wuselwerk — Grafikintegration: Blattaufteilung, Anbauteile, Terraintexturen

Ergänzungsband zu [`grafik-prompts.md`](./grafik-prompts.md). Diese Datei wiederholt
**nichts** von dort. Sie schließt die Lücke, die die Prompt-Bibliothek offen lässt:

> Die 65 Prompts dort beschreiben, **wie** die Grafik aussehen soll.
> Diese Datei beschreibt, **in welcher exakten Blattaufteilung der Code sie braucht** —
> und wie sie in den laufenden Prototyp kommt, ohne ihn kaputtzumachen.

**Sprachregel wie in der Bibliothek:** Erklärungen deutsch, Prompts englisch, jeder Prompt
in einem eigenen Codeblock.

**Rechtsrahmen unverändert bindend** (GDD §12, `grafik-prompts.md` §0): keine Nennung
irgendeiner Vorlage, kein grünes Haar in Kombination mit blauer Kutte, keine Umschreibung
wie „retro puzzle classic". Der universelle Negativprompt aus §1.3 der Bibliothek gehört an
**jeden** Prompt dieser Datei. Er ist hier nicht wiederholt.

**Quelle aller Zahlen:** `src/core/constants.ts`, `src/core/types.ts`, `src/core/world.ts`,
`src/render/sprites.ts`, `src/render/terrainView.ts`, `src/render/scene.ts`,
`src/render/palette.ts`, `src/core/terrain.ts`. Jede Zahl unten trägt ihre Herleitung.

---

## Inhalt

| § | Abschnitt | Prompts |
|---|---|---|
| 1 | Bestandsaufnahme: was heute prozedural entsteht | — |
| 2 | Verbindliche Zellgeometrie | — |
| 3 | Sprite-Blätter je Zustand | 1 Vertrag + 12 |
| 4 | Blickrichtung und Ausrüstung: Anbauteile statt Kombinationen | 4 |
| 5 | Terrain als Textur statt Farbwert | 5 |
| 6 | Integrationsspezifikation (kein Prompt) | — |
| 7 | Reihenfolge | — |
| 8 | Wo Bildgeneratoren hier scheitern | — |

**Gesamt: 21 einsetzbare Prompts plus ein Blattvertrag zum Voranstellen.**

---

## 1. Bestandsaufnahme

Alles, was der Prototyp heute mit `fillRect`, `arc` und Verläufen zeichnet — und was
stattdessen als Bild vorliegen müsste. Das ist die Landkarte für den Rest der Datei.

### 1.1 Die Figur (`src/render/sprites.ts`)

| Was der Code heute zeichnet | Zeile | Maß (logische Pixel) | Ersatz als Bild |
|---|---|---|---|
| Umriss der Grundsilhouette | 64 | 6 × 13, Unterkante auf `y` | in jedem Zustandsblatt enthalten |
| Kopf (Haut) | 65 | 4 × 4 | ebd. |
| Rumpf (Anzug) | 66 | 4 × 6 | ebd. |
| Stiefel | 67 | 4 × 2 | ebd. |
| Kletterhelm | 69 | 6 × 2, 2 px über dem Scheitel | **Anbauteil** §4.1 |
| Schirm eingeklappt | 70 | 2 × 4, an der Hüfte vorn | **Anbauteil** §4.2 |
| Laufschritt (2 Phasen, `tick/6`) | 73–77 | 2 × 2 Fuß | Clip `walking` §3.1 |
| Fallarme (2 Klötze) | 85–86 | je 2 × 2 | Clip `falling` §3.2 |
| Schirmdach + 2 Streben | 81–83 | 12 × 2, Oberkante `y−18` | Clip `floating` §3.3 |
| Kletterarme | 91–92 | 2 × 4 und 2 × 3 | Clips `climbing`/`hoisting` §3.4/§3.5 |
| Blockerarme + 2 Paddel | 96–98 | 12 × 2 auf Brusthöhe | Clip `blocking` §3.10 |
| Bauplanke + Weißblinken | 101–103 | 7 × 1, reicht 8 px nach vorn | Clip `building` §3.6 |
| Hammer (2 Phasen, `tick/5`) | 107–108 | 5 × 2, reicht 7 px nach vorn | Clip `bashing` §3.7 |
| Spitzhacke (2 Rechtecke) | 112–113 | Diagonale bis 7 px vorn | Clip `mining` §3.8 |
| Schaufel (2 Phasen, `tick/5`) | 116–117 | 8 × 2, reicht 2 px **unter** die Füße | Clip `digging` §3.9 |
| Zünder-Rotblitz über den ganzen Körper | 135–136 | 6 × 13 | Tönung bleibt im Code, Bombe als **Anbauteil** §4.3 |
| Countdown-Ziffer, `system-ui` 13 px | 140–146 | Bildschirmpixel, nicht logisch | Ziffernstreifen §4.4 |
| Todes-Squash (roter Balken, verbreitert) | 157–160 | bis 12 × 12 | Clip `dying` §3.12 |
| Rettung (Aufstieg 6 px + Ausblenden) | 55–61 | 4 × 12 | Clip `saving` §3.11 |

**Zwei Beobachtungen, die für die Blattaufteilung entscheidend sind:**

1. **Der Fußpunkt.** Der Umriss wird als `R(-3, -WUSEL_H-1, 6, WUSEL_H+1)` gezeichnet, also
   von Zeile `y−13` bis `y−1` — die **Unterkante des Rechtecks liegt genau auf `y`**. Der
   Boden liegt bei `y+1`. Der Fußpunkt jedes Sprites ist damit eindeutig: *Unterkante der
   Figur = logische Zeile `y`.* (Nebenbefund: die Physik rechnet mit den Zeilen `y−11 … y`,
   die Zeichnung sitzt also 2 px höher als der Kollisionskörper. Das ist eine
   Prototyp-Ungenauigkeit, die beim Sprite-Umbau verschwindet, weil der Fußpunkt dann
   verbindlich definiert ist.)
2. **Die Spiegelachse.** `m(off, w) = d>0 ? off : -(off+w)` spiegelt an der **Kante**
   zwischen Spalte `−1` und Spalte `0`, nicht an einer Pixelmitte. Der Ankerpunkt eines
   Sprites muss deshalb auf einer Zellkante liegen — nicht in einer Pixelmitte, sonst
   verschiebt sich die Figur beim Richtungswechsel um einen halben Pixel.

### 1.2 Terrain (`src/render/terrainView.ts`)

| Was der Code heute rechnet | Zeile | Regel | Ersatz als Bild |
|---|---|---|---|
| Materialfarbe je Pixel | 79–102 | eine Grundfarbe je `MAT` | Kacheltextur §5.1–§5.4 |
| Deterministisches Korn | 7–11, 78 | `±7` Helligkeit, ortsfest | Textur ersetzt den Großteil, Rest bleibt |
| Grasnarbe | 83 | nur wenn `openAbove && !isFresh` | Deckschichtstreifen §5.5 |
| Tiefenabdunklung Erde | 85 | bis `−20` am Levelboden | **bleibt im Code** — keine Kachel kann das |
| Fels heller an der Oberkante | 89 | `+16` bei `openAbove` | bleibt im Code |
| Stahlmuster | 93 | 4-px-Schachbrett `((x>>2)+(y>>2))&1`, `±8` | Textur §5.3 übernimmt es exakt |
| Stahlniete | 94 | `+34` bei `x%8==4 && y%8==4` | Textur §5.3 |
| Ziegelnaht | 98 | `−20` bei `x%6==0`, sonst `+6` | Textur §5.4 |
| Frische Bruchkante | 104 | `+30` (`freshBoost`) | **bleibt im Code** — siehe §5.0 |

### 1.3 Szene, Effekte, Oberfläche

| Was der Code zeichnet | Datei | Ersatz | Prompt vorhanden? |
|---|---|---|---|
| Himmelsverlauf, zwei Farbstopps | `scene.ts` 175–181 | Parallaxband 1 | ja, Bibliothek §6.2 ff. |
| Drei Hügelpolygone aus Rauschen | `scene.ts` 183–209 | Parallaxbänder 2–4 | ja, §6.2 ff. |
| Ausgang: Radialverlauf + 3 Rechtecke | `scene.ts` 211–245 | 3-Bild-Puls | ja, §7.2 |
| Falltür: 3 Rechtecke, 34 × 12 | `scene.ts` 247–259 | 2-Bild-Zustand | ja, §7.1 |
| Partikel: 1–2 px Quadrate, 5 Farben | `scene.ts` 261–270 | Partikelblätter | ja, §8.1–§8.5 |
| Berufssymbole als Vektorpfade | `icons.ts` | Icon-Atlas | ja, §9.1/§9.2 |
| HUD-Flächen, Rateregler, Sterne | `hud.ts` | UI-Rahmen | ja, §9.3/§9.4 |
| Lupenrahmen, Fadenkreuz | `magnifier.ts` | — | **Lücke**, noch kein Prompt |

Für alles mit „ja" existiert der Prompt bereits; hier fehlt nur die Blattaufteilung, die in
§6 mitspezifiziert ist. Neu zu erzeugen sind **die Zustandsblätter (§3), die Anbauteile (§4)
und die Terrainkacheln (§5)** — genau die drei Dinge, für die es bisher keine
maßhaltige Vorlage gibt.

---

## 2. Verbindliche Zellgeometrie

Alle Zustandsblätter benutzen **dieselbe Zelle**. Das ist keine Bequemlichkeit, sondern
Voraussetzung dafür, dass ein Atlas mit einem einzigen Ankerwert auskommt und dass die
Spiegelung ohne Korrekturversatz funktioniert.

### 2.1 Herleitung der Zellgröße

**Diese Herleitung ist überholt.** Sie stand, solange die Figur kahl war; seit der
Ankerfigur A0 bestimmt nicht mehr der Körper das Zellmaß, sondern die Mähne. Maßgeblich ist
`grafik-ankerbild-a0.md` §4. Der Vollständigkeit halber die alte Rechnung — die äußersten
Punkte, die `sprites.ts` am Körper erreicht:

| Richtung | Extremwert im Code | Quelle |
|---|---|---|
| nach oben | `y − 18` (Schirmdach-Oberkante), `y − 18` (Rettungsaufstieg) | Zeile 81, 58 |
| nach unten | `y + 2` (Schaufelunterkante) | Zeile 117 |
| nach links/rechts | `± 7` (Blockerarme), `+ 8` (Bauplanke) | Zeile 96, 102 |

Daraus kämen 20 Zeilen über dem Fußpunkt, 4 darunter, 12 Spalten je Seite. Die Mähne
verlangt am Modell gemessen 5,4 über dem Scheitel und 7,5 neben der Mitte, mit Zugabe für
Bewegung also 22 Zeilen und 14 Spalten — sie ist in beiden Richtungen die größere Zahl und
gibt damit das Maß vor.

| Größe | Logisch | Master (8×) | Ausgeliefert (1×) |
|---|---|---|---|
| Zelle | 28 × 28 | 224 × 224 | 28 × 28 |
| Fußpunkt in der Zelle | (14, 22) | (112, 176) | (14, 22) |
| Figurenhöhe ohne Haar | 12 (Silhouette 13) | 96 (104) | 12 (13) |
| Haarüberstand oben / seitlich | bis 8 / bis 11 | 64 / 88 | bis 8 / bis 11 |

**Warum der Anker genau auf halber Zellbreite sitzt:** Weil die Spiegelachse des Codes eine
Pixelkante ist und `anchorX = 14 = cellWidth/2`, genügt beim Richtungswechsel ein
`ctx.scale(-1, 1)` um den Ankerpunkt — **ohne jeden Versatzausgleich**. Jeder andere
Ankerwert erzwingt eine Korrekturrechnung, die bei nicht ganzzahligem `v.scale` (die
Kameraskala ist `box.w * zoom / 300`, praktisch nie ganzzahlig) zu Wackeln um einen Pixel
führt.

### 2.2 Warum 1× ausgeliefert wird und nicht 2× oder 4×

Der Renderer rundet heute jedes Rechteck auf ganze **Bildschirmpixel** (`sprites.ts`
`rect()`), zeichnet also 1 logischen Pixel als harten Block. Ein Sprite in 2× oder 4×
brächte ein zweites Pixelraster ins Bild, das mit dem des Terrains nicht deckungsgleich
ist — sichtbar als Kantenflimmern beim Zoomen (Zoom 1 bis 3, `camera.ts`). Deshalb:

- **Arbeitsdatei: 8× Master** (224 × 224 je Zelle), wie die ganze Bibliothek.
- **Auslieferung: 1×** (28 × 28 je Zelle), nearest-neighbour heruntergerechnet und von Hand
  nachgezogen.
- Hochskaliert wird ausschließlich im Renderer, mit `imageSmoothingEnabled = false`.

Nebeneffekt, der praktisch wichtig ist: Bei 1× ist der komplette Figurenatlas (60 Bilder à
28 × 28) etwa 7 kB PNG. Das passt in den Einzeldatei-Build (`scripts/build-single.mjs`) —
siehe §6.6.

### 2.3 Taktraten und die daraus folgende Bildanzahl

Der Kern dieser Datei. Die Simulation läuft mit 60 Hz und ganzzahligen Ticks
(`TICK_HZ = 60`). Jeder Arbeitszustand macht **alle N Ticks genau einen Schritt** — daraus
folgt zwingend, wie viele Bilder ein Zyklus zeigen kann, bevor er sich wiederholt. Ein
Blatt mit mehr Bildern als der Zyklus Ticks hat wäre unsichtbar; eines mit weniger würde
mitten im Arbeitsschritt springen.

| Clip | Taktquelle | Zyklus (Ticks) | Bilder | Haltedauer je Bild | Herleitung |
|---|---|---|---|---|---|
| `walking` | `WALK_INTERVAL = 3` | 24 | **8** | 3 | Ein Bild je gelaufenem Pixel — so rutschen die Füße nie; 8 px = zwei Schritte |
| `falling` | `FALL_INTERVAL = 1`, `MAX_DROP = 3` | 16 | **4** | 4 | Der kürzestmögliche Sturz ist `MAX_DROP+1 = 4` px = 4 Ticks; länger gehaltene Bilder würden kurze Stürze als Standbild zeigen |
| `floating` | `FLOAT_INTERVAL = 3` | 12 | **4** | 3 | Ein Bild je gesunkenem Pixel, wie beim Laufen |
| `climbing` | `CLIMB_INTERVAL = 4` | 16 | **4** | 4 | Ein Bild je geklettertem Pixel; 4 px ist die Reichweite der stummeligen Arme, mehr wäre ein unmöglicher Griffwechsel |
| `hoisting` | `CLIMB_INTERVAL = 4` × 13 Takte | 52 | **6** | 8·5 + 12 | `hoist` läuft 0 → `WUSEL_H = 12`, danach ein Takt für den Schritt zur Seite = 13 Takte; die Körperhebung macht der Code, das Blatt trägt nur die Haltungsänderung |
| `building` | `BUILD_INTERVAL = 24` | 24 | **8** | 3 | Eine Stufe je Zyklus; 24 = 8 × 3 hält dieselbe 3-Tick-Kadenz wie das Laufen |
| `bashing` | `BASH_INTERVAL = 9` | 9 | **3** | 3 | 9 ist nur durch 3 und 9 teilbar; 9 Bilder à 1 Tick wären bei 60 Hz nicht wahrnehmbar |
| `mining` | `MINE_INTERVAL = 12` | 12 | **4** | 3 | Ein Hieb je Zyklus, gleiche Kadenz wie Laufen und Bauen |
| `digging` | `DIG_INTERVAL = 7` | 7 | **3** | 3, 2, 2 | **7 ist prim** — eine gleichmäßige Haltedauer ist arithmetisch unmöglich |
| `blocking` | kein Simulationstakt; `tick/8` in `sprites.ts` | 16 | **2** | 8 | Der einzige kosmetische Takt, den der Code kennt |
| `saving` | `SAVING_TICKS = 18` | 18 | **6** | 3 | Die Figur steigt 6 px auf (`-12 - t*6`) — ein Bild je Pixel |
| `dying` | `DYING_TICKS = 26` | 26 | **8** | 3·6 + 4·2 | 26 = 2 · 13; acht Bilder gehen nur mit ungleicher Haltedauer |
| `fuse` (Overlay) | `BOMB_FUSE_TICKS = 300` | 300 | **5** | 60 | Eine Sekunde je Bild — der Countdown 5-4-3-2-1 aus GDD §5 |

**Summe Körperbilder: 60.** Das ist der gesamte Figurenbestand für alle sichtbaren
Zustände.

Zwei Folgerungen, die im Atlasformat (§6.2) landen:

- **`digging` erzwingt eine Haltedauer *je Bild*, nicht je Blatt.** Ein Format mit einer
  einzigen `fps`-Zahl kann den Gräber nicht abbilden. Deshalb trägt jeder Clip eine
  Liste `holds`.
- **Bild 1 ist immer das Wirkungsbild.** Der Code arbeitet bei `w.timer % interval === 0`
  (`World.due()`), und `timer % interval === 0` fällt auf Index 0 der Haltedauerliste. Der
  Schaufelbiss, der Hammerschlag, der Hackenhieb und das Legen der Stufe müssen deshalb
  auf **Bild 1** liegen — sonst laufen Bild und Terrainänderung auseinander.

### 2.4 Zustände ohne Blatt

| Zustand | Warum kein Sprite |
|---|---|
| `DEAD` | `drawWusel` kehrt sofort zurück (Zeile 41) |
| `SAVED` | ebd. |
| `DeathCause.ABYSS` | die Figur ist unterhalb des Levels, wenn sie stirbt (`world.ts` 461) — nie im Bild |

Ebenfalls **kein** eigener Zustand, obwohl die Bibliothek §2.4 eine Pose dafür liefert:
das Umdrehen an der Wand. `hitWall()` kippt nur `w.dir` und bleibt in `WALKING`. Wer die
Pose einbauen will, braucht zuerst einen Zustand `TURNING` in `types.ts` und `world.ts` —
das ist eine Simulationsänderung, keine Grafikaufgabe.

---

## 3. Sprite-Blätter je Zustand

### 3.0 Blattvertrag — wörtlich vor jeden Prompt dieses Abschnitts

Wie die Stilblöcke der Bibliothek: **Wort für Wort kopieren, nicht paraphrasieren.** Die
Reihenfolge ist `[STYLE BLOCK A]` → `[SHEET CONTRACT]` → Einzelprompt → `[PALETTE LOCK]` →
`[NEGATIVE PROMPT]`.

Ein Absatz darin weicht bewusst von Stilblock A ab: **die Lichtrichtung.** Stilblock A
fordert ein Schlüssellicht von links oben. Der Code spiegelt die Figur aber an der
Blickrichtung — ein von links kommendes Licht wandert dann nach rechts, und eine Hälfte
aller Figuren im Bild ist falsch beleuchtet. Deshalb hier: Licht fast senkrecht von oben.
Das ist eine Gestaltungsentscheidung, die vor der ersten Serie abgenommen werden sollte.

```
SHEET CONTRACT — WUSELWERK CHARACTER ATLAS

Sheet layout, non-negotiable and more important than any artistic
consideration in this prompt:

Exactly one single horizontal row of equally sized cells. No second row, no
gaps, no borders, no separators, no frame numbers, no labels, no captions,
no margin around the sheet.

Every cell is exactly 192 by 192 pixels.

Alignment across all cells: the character's ground contact line — the flat
underside of the boots — sits at exactly 160 pixels below the top edge of
its cell in every single frame, never one pixel higher or lower. The
character's vertical centre line sits at exactly 96 pixels from the left
edge of its cell in every single frame. The upright figure is 96 pixels
tall from the ground contact line upward. These three values do not vary
between frames for any reason; the whole sheet must overlay perfectly when
the cells are stacked.

Nothing may cross a cell border. Tools, limbs and equipment stay inside
their own cell.

Direction: strict orthographic side view facing right in every frame. Only
this one direction is drawn. The engine mirrors the sprite horizontally for
the other direction, so the design must survive being flipped: no writing,
no numerals, no asymmetric badge, no marking that only makes sense on one
side.

Lighting, overriding the style block: a soft key light from almost directly
above with only a very slight bias to the left, a cool ambient fill from
below, and a thin bright rim along the top of the head. No strong side
lighting, no cast shadow, no ground shadow, no contact shadow — the sprite
gets flipped and a directional shadow would flip with it.

Background: fully transparent. No ground, no terrain, no wall, no props, no
backdrop, no dust and no particles unless the frame description explicitly
asks for them — particles are separate assets composited by the engine.

Readability rule, non-negotiable: the silhouette must remain unmistakable
when the cell is downscaled to 28 by 28 pixels and the figure is therefore
12 pixels tall. Silhouette carries all information.
```

---

### 3.1 `walking` — 8 Bilder

Der meistgesehene Clip des Spiels: bis zu 60 Figuren gleichzeitig, fast immer laufend.
**8 Bilder à 3 Ticks = 24 Ticks**, weil `WALK_INTERVAL = 3` einen Pixel Fortbewegung je
3 Ticks bedeutet — ein Bild je Pixel, damit die Füße nicht über den Boden rutschen. Ein
voller Zyklus deckt 8 logische Pixel ab, also zwei Schritte à 4 px.

Ersetzt für die Produktion das Konzeptblatt §2.3 der Bibliothek; jenes bleibt als
Posenvorlage gültig, hat aber weder Zellmaß noch Fußpunkt.

```
[PREPEND STYLE BLOCK A]
[PREPEND SHEET CONTRACT]

Walk cycle of the Wusel creature: small stocky worker, three heads tall,
large bald egg-shaped head with warm sand skin #f4d7ac, two round black dot
eyes set wide and low, tiny mouth line, one-piece teal work suit #2fc9b8,
stubby mitten arms, blunt dark teal boots #1d8f85, hard near-black outline
#0c1119.

Exactly 8 frames in one row. Canvas 1536 by 192 pixels, aspect ratio 8:1.

The cycle covers two full steps and advances the character by the width of
its own body and a half. Read the frames as one continuous loop where frame
8 leads seamlessly back into frame 1.

Frame 1 — contact, left boot forward and flat, right boot behind and about
to leave the ground, torso upright, arms in mild opposition.
Frame 2 — down, weight over the front boot, body at its lowest, knees
absorbing.
Frame 3 — passing, rear boot swinging through directly beneath the body,
torso at mid height.
Frame 4 — up, body at its highest point of the cycle, rear boot rising for
the next contact.
Frames 5 to 8 — the identical motion with the legs and arms exchanged.

The head bobs by at most 2 pixels between the lowest and highest frame at
this master scale. The creature never looks where it is going: the head
stays tilted a few degrees down and forward throughout, cheerfully oblivious.

No motion blur, no speed lines, no dust.
```

---

### 3.2 `falling` — 4 Bilder

`FALL_INTERVAL = 1` heißt 60 Pixel pro Sekunde — dafür kann kein Blatt Bild für Bild
mithalten. Die Haltedauer ergibt sich stattdessen aus `MAX_DROP = 3`: Der kürzeste Sturz,
den die Simulation überhaupt erzeugt, ist 4 Pixel und dauert 4 Ticks. Eine längere
Haltedauer würde kurze Stürze als Standbild zeigen. **4 Bilder à 4 Ticks = 16 Ticks =
16 gefallene Pixel je Schleife**; die tödliche Fallhöhe von `FALL_DEATH_PX = 78` zeigt die
Schleife knapp fünfmal.

```
[PREPEND STYLE BLOCK A]
[PREPEND SHEET CONTRACT]

Free-fall loop of the Wusel creature (bald sand-skinned head #f4d7ac, teal
one-piece suit #2fc9b8, dark teal boots #1d8f85, near-black outline
#0c1119), falling without any equipment.

Exactly 4 frames in one row. Canvas 768 by 192 pixels, aspect ratio 4:1.

Important: the engine moves the character downward. The frames must NOT
show downward travel — the ground contact line stays fixed. Only the pose
changes.

Frame 1 — both arms thrown straight up above the head, legs trailing
slightly behind, body stretched into a narrow vertical shape, mouth open in
a small round shout, eyes wide.
Frame 2 — arms flailing outward and slightly back, one leg kicking forward,
body twisting a few degrees.
Frame 3 — arms back up and crossing near the wrists, both legs splayed
apart, the widest frame of the loop.
Frame 4 — arms sweeping down and outward, legs together again, leading back
into frame 1.

The whole loop must read as helpless, uncontrolled and slightly comical,
and as clearly distinct from the calm descent under an umbrella. This is
the player's warning signal that a creature needs help, so the difference
must survive downscaling to 12 pixels tall: keep the arms above the head in
at least three of the four frames.
```

---

### 3.3 `floating` — 4 Bilder

Kein eigener `State`, sondern die Variante `FALLING && hasFloater && fallDist >= 10`
(`sprites.ts` 79, `world.ts` 446). Weil sich dabei die **Körperhaltung grundlegend ändert**
— hängend statt strampelnd —, ist das ein eigener Clip und kein Anbauteil. `FLOAT_INTERVAL
= 3` gibt einen Pixel Sinkflug je 3 Ticks: **4 Bilder à 3 Ticks = 12 Ticks = 4 Pixel**.

```
[PREPEND STYLE BLOCK A]
[PREPEND SHEET CONTRACT]

Slow descent loop of the Wusel creature hanging beneath an open umbrella
(bald sand-skinned head #f4d7ac, teal one-piece suit #2fc9b8, dark teal
boots #1d8f85, near-black outline #0c1119).

Exactly 4 frames in one row. Canvas 768 by 192 pixels, aspect ratio 4:1.

Equipment, drawn as part of this sheet: a small open umbrella held above
the head in both mitten hands. Canopy in amber #ffd23f with a darker amber
underside, six visible ribs, a shallow dome, a short straight handle, a
small finial on top. The canopy is exactly 96 pixels wide at this master
scale — twice the body width — and its top edge sits 144 pixels above the
ground contact line, so it reaches close to but never past the top of the
cell.

The engine moves the character downward. The frames must NOT show downward
travel — only a gentle sway.

Frame 1 — canopy level, body hanging straight down, legs relaxed with toes
pointing down, head calm and level.
Frame 2 — canopy tipped a few degrees, body swinging slightly to one side,
legs trailing the swing.
Frame 3 — canopy level again, canopy edge lifted a little as if catching
air, body at the bottom of its swing.
Frame 4 — canopy tipped the other way, body swinging back.

The silhouette must read as one wide dome on a narrow stem at 12 pixels
tall: top-heavy, calm, in complete contrast to the free-fall loop. Never
confusable with the arms-wide blocker, whose wide element sits at chest
height and is straight, not domed.
```

---

### 3.4 `climbing` — 4 Bilder

`CLIMB_INTERVAL = 4` → ein Pixel Aufstieg je 4 Ticks. **4 Bilder à 4 Ticks = 16 Ticks =
4 Pixel je Griffwechselfolge.** Mehr Pixel je Zyklus gehen nicht: Die Arme sind gezeichnet
etwa 4 logische Pixel lang, ein weiterer Griff wäre anatomisch unmöglich und der Griff
würde sichtbar an der Wand rutschen.

```
[PREPEND STYLE BLOCK A]
[PREPEND SHEET CONTRACT]

Wall-climbing loop of the Wusel creature (bald sand-skinned head #f4d7ac,
teal one-piece suit #2fc9b8, dark teal boots #1d8f85, near-black outline
#0c1119), climbing a vertical surface that is NOT drawn.

Exactly 4 frames in one row. Canvas 768 by 192 pixels, aspect ratio 4:1.

The implied wall is at the right edge of the body, running vertically. The
body is pressed flat against it, chest and knees touching, head tilted up.
The engine moves the character upward — the frames must NOT show upward
travel, only the hand-over-hand cycle. The ground contact line stays fixed
and marks the boots.

Frame 1 — upper mitten hand planted high, lower hand at chest height, both
boots braced flat against the wall, body compact.
Frame 2 — the lower hand releases and reaches up past the other, body
stretching slightly.
Frame 3 — the reaching hand plants high, roles now exchanged, body compact
again.
Frame 4 — the other hand releases and reaches, mirroring frame 2, leading
back into frame 1.

The creature is a climber and therefore always wears the helmet — but the
helmet is a separate attachment layer and must NOT be drawn on this sheet.
Leave the top of the bald head clear and unobstructed.

The silhouette at 12 pixels tall must read as "flat against a wall, one arm
high": narrower than a walker, with at least one arm above head height in
every frame.
```

---

### 3.5 `hoisting` — 6 Bilder, einmalig

Der Kletterer zieht sich über die Kante. `hoist` läuft von 0 bis `WUSEL_H = 12`, danach
folgt ein Takt für den Schritt zur Seite — **13 Takte à `CLIMB_INTERVAL = 4` = 52 Ticks**.
Die Aufwärtsbewegung macht der Code (`w.y--`), das Blatt trägt nur die Haltungsänderung;
deshalb genügen **6 Bilder** mit den Haltedauern **8, 8, 8, 8, 8, 12**. Die letzten
12 Ticks sind das echte Stehen auf der Kante vor dem Seitwärtsschritt.

```
[PREPEND STYLE BLOCK A]
[PREPEND SHEET CONTRACT]

One-shot pull-up sequence of the Wusel creature (bald sand-skinned head
#f4d7ac, teal one-piece suit #2fc9b8, dark teal boots #1d8f85, near-black
outline #0c1119), hauling itself over the top edge of a wall that is NOT
drawn.

Exactly 6 frames in one row. Canvas 1152 by 192 pixels, aspect ratio 6:1.
This sequence plays once and does not loop.

The implied ledge edge runs horizontally at the height of the ground
contact line. The engine raises the character; the frames must NOT show
vertical travel. The ground contact line stays fixed in every cell and
marks the implied ledge.

Frame 1 — hanging: both mitten hands hooked over the implied edge at the
ground contact line, arms straight, body dangling below, boots loose.
Frame 2 — pulling: elbows bending hard, shoulders rising toward the hands,
head coming up, boots swinging forward to find the wall.
Frame 3 — chest over: torso folding forward across the edge, one knee
lifting, arms taking the weight, the most awkward and most comic frame.
Frame 4 — knee up: one boot planted on the ledge, the other still hanging,
body crouched low and wide.
Frame 5 — rising: both boots on the ledge, body straightening out of a deep
crouch, arms swinging forward for balance.
Frame 6 — standing on the edge, upright, weight settled, one boot slightly
ahead, ready to walk on. This frame is held nearly twice as long as the
others, so it must read as a stable resting pose, not as a transition.

Leave the top of the bald head clear — the climbing helmet is a separate
attachment layer.
```

---

### 3.6 `building` — 8 Bilder

`BUILD_INTERVAL = 24` Ticks je Stufe. **8 Bilder à 3 Ticks = 24 Ticks** hält dieselbe
3-Tick-Kadenz wie Laufen, Rammen und Baggern, so dass alle Arbeitsclips in derselben
Grundfrequenz atmen. Harte Zusatzbedingung aus `world.ts` 531–545: Am Zyklusende springt
der Körper um `BUILD_ADVANCE = 2` px nach vorn und 1 px nach oben. Bild 8 muss deshalb
lückenlos in ein um 2 px nach vorn und 1 px nach oben versetztes Bild 1 übergehen — sonst
sieht man bei jeder Stufe ein Zucken.

```
[PREPEND STYLE BLOCK A]
[PREPEND SHEET CONTRACT]

Bridge-building work cycle of the Wusel creature (bald sand-skinned head
#f4d7ac, teal one-piece suit #2fc9b8, dark teal boots #1d8f85, near-black
outline #0c1119), laying one plank step per cycle.

Exactly 8 frames in one row. Canvas 1536 by 192 pixels, aspect ratio 8:1.

Equipment: a small amber #ffd23f tool belt at the waist with two spare
planks tucked in behind the back, and one plank step in warm brick brown
#b5713f being handled. A laid plank is 48 pixels long and 8 pixels thick at
this master scale.

Frame 1 — the placement frame, the single most important frame of the
sheet: the plank is fully down and in place, lying flat and level, its far
end reaching forward and slightly up, both mitten hands just leaving it.
The creature is bent forward from the hips at about thirty degrees, front
knee bent, rear leg braced back, head down watching the work.
Frames 2 and 3 — straightening up, both hands empty and swinging back
toward the belt.
Frame 4 — upright, one hand at the belt, pulling the next plank free.
Frames 5 and 6 — bringing the new plank forward and down, body folding back
into the forward lean.
Frame 7 — plank held just above its target position, arms extended low and
forward, body at full lean.
Frame 8 — plank touching down, weight shifting onto the front foot. This
frame must lead seamlessly into frame 1 shifted 16 pixels forward and 8
pixels up at this master scale, because the engine moves the body by that
amount at the end of every cycle.

Silhouette test: the forward lean plus the plank produce a clear diagonal
rising to the upper right in frames 1, 7 and 8 — the exact opposite
direction to the miner's downward diagonal. At 12 pixels tall the figure
must read as "leaning forward, something sticking out ahead and slightly up".
```

Der Prototyp lässt die Planke weiß blinken, wenn `bricks <= 3` (`BUILD_WARN_AT`,
`sprites.ts` 101). Das ist eine **Tönung, keine zweite Bildreihe**: Der Renderer zeichnet
denselben Clip und legt ein weißes `source-atop`-Rechteck darüber. So bleibt die Warnung
kostenlos und bei jeder Bildzahl korrekt.

---

### 3.7 `bashing` — 3 Bilder

`BASH_INTERVAL = 9` ist nur durch 3 und 9 teilbar. Neun Bilder à 1 Tick wären bei 60 Hz
nicht wahrnehmbar und neunmal so teuer — bleibt **3 Bilder à 3 Ticks = 9 Ticks**, exakt ein
Hammerschlag je Zyklus. Der Stollen wird 12 px hoch ausgeräumt (`BASH_UP`), der Hammer muss
also auf Bauchhöhe und deutlich vor dem Körper sitzen.

```
[PREPEND STYLE BLOCK A]
[PREPEND SHEET CONTRACT]

Horizontal digging work cycle of the Wusel creature (bald sand-skinned head
#f4d7ac, teal one-piece suit #2fc9b8, dark teal boots #1d8f85, near-black
outline #0c1119), swinging a sledgehammer straight forward into a wall that
is NOT drawn.

Exactly 3 frames in one row. Canvas 576 by 192 pixels, aspect ratio 3:1.

Equipment: a heavy sledgehammer with a short amber #ffd23f haft and a
chunky rectangular near-black head, gripped in both mitten hands.

Frame 1 — impact, the frame on which the engine removes terrain: the hammer
is thrust fully forward at belly height, its head clear of the body outline
to the right, the haft level and horizontal. Torso rotated into the blow,
rear foot dug in, front knee bent, head pushed forward, shoulders
compressed into a small squash.
Frame 2 — recoil: the hammer rebounds up and back, the body straightening,
head snapping back a little.
Frame 3 — wind-up: the hammer drawn back over the shoulder, both arms
raised, body coiled and leaning back, the widest wind-up the stubby arms
allow. This leads straight back into frame 1.

Silhouette test: in frame 1 the hammer forms a solid horizontal bar at
belly height projecting forward — level, never angled. That bar height is
the only readable difference from the miner (bar angled down) and the
digger (bar at foot height), so keep it exactly at mid-body height and make
it thick.

No rubble, no dust, no impact sparks — those are separate particle assets.
```

---

### 3.8 `mining` — 4 Bilder

`MINE_INTERVAL = 12` → **4 Bilder à 3 Ticks = 12 Ticks**, gleiche Kadenz wie Laufen und
Bauen. Wie beim Bauer springt der Körper am Zyklusende: `MINE_DX = 2` nach vorn,
`MINE_DY = 1` nach unten (`world.ts` 605–613). Der Winkel des Schachts ist damit fest —
2 px vor je 1 px ab, rund 27°.

```
[PREPEND STYLE BLOCK A]
[PREPEND SHEET CONTRACT]

Diagonal digging work cycle of the Wusel creature (bald sand-skinned head
#f4d7ac, teal one-piece suit #2fc9b8, dark teal boots #1d8f85, near-black
outline #0c1119), driving a pickaxe forward and downward into ground that
is NOT drawn.

Exactly 4 frames in one row. Canvas 768 by 192 pixels, aspect ratio 4:1.

Equipment: a pickaxe with a long amber #ffd23f handle and a curved
near-black double-pointed head, gripped in both mitten hands.

Frame 1 — strike, the frame on which the engine removes terrain: the
pickaxe is driven forward and down at exactly twenty-seven degrees below
horizontal, two units forward for every one unit down, its point reaching
toward the lower right of the cell and well outside the body outline. Body
crouched and rotated into the strike, rear leg extended, front leg bent
under the body, head down and forward.
Frame 2 — the pick bites and the body compresses over it, shoulders
dropping, the shaft angle unchanged.
Frame 3 — the pick is levered back out, body beginning to rise, shaft
swinging up through horizontal.
Frame 4 — full wind-up, the pick raised behind and above the shoulder, body
coiled, ready to strike again. This must lead into frame 1 shifted 16
pixels forward and 8 pixels down at this master scale, because the engine
moves the body by that amount at the end of every cycle.

Silhouette test: the pickaxe makes one long clean unbroken diagonal running
from the upper left of the body to the lower right. That downward diagonal
is the only reliable difference from the builder, whose diagonal points
upward. Keep the shaft long and unbroken so the angle survives downscaling
to 12 pixels tall.
```

---

### 3.9 `digging` — 3 Bilder, ungleiche Haltedauer

`DIG_INTERVAL = 7` — und **7 ist prim**. Eine gleichmäßige Haltedauer über mehrere Bilder
ist arithmetisch unmöglich; entweder ein Standbild oder sieben Bilder à 1 Tick. Deshalb
**3 Bilder mit den Haltedauern 3, 2, 2 = 7 Ticks**. Genau dieser Fall ist der Grund, warum
das Atlasformat in §6.2 eine Haltedauer *je Bild* trägt und keine einzelne Bildrate.

Zweite Bedingung: Die Figur sinkt je Zyklus 1 px (`w.y = row`, `world.ts` 634). Das Blatt
darf die Abwärtsbewegung deshalb **nicht** zusätzlich zeigen, sonst sinkt sie doppelt.

```
[PREPEND STYLE BLOCK A]
[PREPEND SHEET CONTRACT]

Vertical digging work cycle of the Wusel creature (bald sand-skinned head
#f4d7ac, teal one-piece suit #2fc9b8, dark teal boots #1d8f85, near-black
outline #0c1119), shovelling straight down into ground that is NOT drawn.

Exactly 3 frames in one row. Canvas 576 by 192 pixels, aspect ratio 3:1.

Equipment: a broad flat-bladed shovel with a short amber #ffd23f handle and
a wide near-black blade, held in both mitten hands. The blade is 64 pixels
wide at this master scale — wider than the creature's stance.

The engine lowers the character one pixel per cycle. The frames must NOT
show downward travel; the ground contact line stays fixed.

Frame 1 — the bite, the frame on which the engine removes a row of terrain:
legs braced wide apart, torso bent deeply forward and down, both arms
straight down between the legs, the shovel blade horizontal and driven just
below the ground contact line. Head lowered, looking straight down into the
hole. This is the lowest, most compact silhouette of the sheet.
Frame 2 — the lift: the blade rises to knee height carrying a small load,
the body beginning to straighten, one shoulder leading.
Frame 3 — the toss and reset: the blade swung out to the side and up, load
thrown clear, body at its most upright, already twisting back down. Leads
straight into frame 1.

Silhouette test: in frame 1 the shovel forms a wide horizontal bar at the
very bottom of the figure, at foot level. At 12 pixels tall that low bar
must not be mistakable for the basher's bar, which sits at mid-body height.
Keep frame 1 clearly the lowest and widest of the three.

No soil, no dust, no debris.
```

---

### 3.10 `blocking` — 2 Bilder

Der einzige Zustand ohne Simulationstakt: `stepBlocking()` prüft nur, ob der Boden noch da
ist. Ein völlig unbewegtes Sprite zwischen 59 laufenden sieht allerdings tot aus. Die
einzige Taktquelle, die der Code für rein kosmetische Dinge kennt, ist
`Math.floor(tick / 8)` (`sprites.ts` 101, 135) — daraus **2 Bilder à 8 Ticks = 16 Ticks**.
Bewusst minimal: Der Blocker soll unverrückbar wirken.

```
[PREPEND STYLE BLOCK A]
[PREPEND SHEET CONTRACT]

Two-frame idle of the Wusel creature in its blocking stance (bald
sand-skinned head #f4d7ac, teal one-piece suit #2fc9b8, dark teal boots
#1d8f85, near-black outline #0c1119).

Exactly 2 frames in one row. Canvas 384 by 192 pixels, aspect ratio 2:1.

Equipment: two wide rectangular signal paddles in warning orange #ff7a45
with a thin near-black border, one gripped in each mitten hand, plus a
matching orange chest band across the suit.

Pose: the torso turned slightly toward the viewer while the boots stay in
side-view profile, both arms stretched horizontally straight out to left
and right at chest height, elbows locked, paddles held vertical at the
ends. Total arm span exactly 96 pixels at this master scale — the same as
the figure's height, and the widest silhouette in the game. Legs planted
wide and firm, knees straight, head level, jaw set, eyes narrowed with
total conviction. The creature is a living road block and knows it.

Frame 1 — the stance at rest.
Frame 2 — the same stance one pixel of master-scale breath higher: the
chest lifted very slightly, the paddles raised a hair, the eyes blinking
half shut. Nothing else moves. Arm span, arm height and boot position are
byte-identical to frame 1.

Silhouette test: a hard letter T with a heavy base, readable as "stop" at
12 pixels tall. It must never be confused with the umbrella descent, whose
wide element sits above the head and is domed rather than straight.
```

---

### 3.11 `saving` — 6 Bilder, einmalig

`SAVING_TICKS = 18`, und der Prototyp lässt die Figur dabei 6 logische Pixel aufsteigen
(`-12 - t*6`, `sprites.ts` 58) und ausblenden. **6 Bilder à 3 Ticks = 18 Ticks**, also ein
Bild je aufgestiegenem Pixel.

**Aufstieg und Ausblenden bleiben im Code.** Beides ist eine Zeile (`globalAlpha`, ein
y-Versatz), lässt sich ohne Neugenerierung nachjustieren — und würde eingebacken die Zelle
sprengen: 13 px Figur plus 6 px Aufstieg plus gestreckte Arme überschreiten die 20 px
Kopffreiheit aus §2.1. Das Blatt zeigt deshalb nur die Haltungsänderung auf fester
Grundlinie.

```
[PREPEND STYLE BLOCK A]
[PREPEND SHEET CONTRACT]

One-shot rescue sequence of the Wusel creature (bald sand-skinned head
#f4d7ac, teal one-piece suit #2fc9b8, dark teal boots #1d8f85, near-black
outline #0c1119) being drawn into the exit and saved.

Exactly 6 frames in one row. Canvas 1152 by 192 pixels, aspect ratio 6:1.
This sequence plays once and does not loop.

The engine handles both the upward drift and the fade to transparency. Do
not paint any fade, opacity change or vertical travel into the frames:
every frame is fully opaque and the ground contact line stays fixed in all
six cells, exactly as in every other sheet.

Frame 1 — still standing flat, head turning up toward an unseen warm light
above, eyes widening.
Frame 2 — up on tiptoes, heels lifted off the contact line, arms starting
to lift away from the body, expression turning from surprise to delight.
Frame 3 — the boots tuck up under the body, knees folding, arms out and up,
a broad grin: the creature is being lifted, not jumping.
Frame 4 — legs dangling relaxed below the tucked knees, arms overhead, head
tipped back, eyes closed in happy arcs.
Frame 5 — the body slims into a narrower vertical shape as if being drawn
upward, boots pointing straight down, arms pressed together above the head.
Frame 6 — the most stretched pose, body at its narrowest and tallest, arms
fully extended up, unmistakably happy. The head must stay clear of the top
of the cell.

A warm rim light #ffd98a from above grows stronger across the six frames,
strongest on the top of the head dome and the shoulders. This is the only
place in the character set where a coloured light is baked in, because the
exit glow is always the same warm tone.
```

---

### 3.12 `dying` — 8 Bilder, einmalig

`DYING_TICKS = 26 = 2 · 13`. Acht Bilder gehen nur mit ungleicher Haltedauer:
**3, 3, 3, 3, 3, 3, 4, 4 = 26 Ticks**. Genau diese Aufteilung macht auch die bestehenden
Todesblätter der Bibliothek (§4.1 Sturz, §4.4 Zerquetschen, §4.5 Sprengung) einbaufähig —
sie sind bereits als 8-Bild-Reihen angelegt und brauchen nur noch die Zellgeometrie aus §2.

Was in der Bibliothek fehlt, ist der **allgemeine Zusammenbruch**: Der Code kennt fünf
Todesursachen (`DeathCause`), von denen `ABYSS` unsichtbar ist und `NUKE` dieselbe
Darstellung wie `EXPLOSION` benutzt. Für jede Ursache ohne eigenes Blatt — und als
Rückfall, solange die Spezialblätter fehlen — braucht es einen generischen Tod.

| `DeathCause` | Blatt |
|---|---|
| `SPLAT` | Bibliothek §4.1 (Aufprall) |
| `CRUSHED` | Bibliothek §4.4 (Zerquetschen) |
| `EXPLOSION`, `NUKE` | Bibliothek §4.5 (Sprengung) |
| `ABYSS` | keins — die Figur ist außerhalb des Levels |
| Rückfall für alles | dieses Blatt |

```
[PREPEND STYLE BLOCK A]
[PREPEND SHEET CONTRACT]

One-shot generic collapse sequence of the Wusel creature (bald sand-skinned
head #f4d7ac, teal one-piece suit #2fc9b8, dark teal boots #1d8f85,
near-black outline #0c1119): the default death used when no cause-specific
animation applies.

Exactly 8 frames in one row. Canvas 1536 by 192 pixels, aspect ratio 8:1.
This sequence plays once and does not loop.

Frame 1 — the moment of realisation: standing, both arms flung up, eyes
huge, mouth a small round shout.
Frame 2 — the legs buckle, knees folding inward, body dropping to two
thirds height, arms still up.
Frame 3 — full collapse, the body folding down onto itself, head sinking
between the shoulders, arms flopping outward.
Frame 4 — maximum squash: the whole creature flattened to about a third of
its height and spread wider than its normal stance, a single thin ring of
pale dust around the base.
Frame 5 — settling, the flattened shape relaxing, one mitten hand still
raised and then falling.
Frame 6 — motionless, the outline softening, the teal desaturating one step
toward the outline tone.
Frame 7 — the shape reduced further, colours flattening toward a single
dull tone, the dust ring drifting outward and thinning.
Frame 8 — a small motionless heap no taller than a quarter of the original
figure, one recognisable boot shape and a last wisp of dust.

No blood, no gore, no red fluid, no detached limbs. The weight comes from
the squash and from the abrupt stillness of frames 6 to 8 — those three
frames carry the guilt and must be genuinely still.

At 12 pixels tall the sequence must read unmistakably as "that one is gone",
distinguishable at a glance from the rescue sequence, which rises and
brightens where this one flattens and dulls.
```

---

## 4. Blickrichtung und Ausrüstung

### 4.1 Warum das Backen aller Kombinationen nicht geht

`hasClimber` und `hasFloater` sind **dauerhafte Eigenschaften** der Figur, keine Zustände
(`types.ts` 98–99). Einmal vergeben, bleiben sie bis zum Tod bestehen und kommen zu
*jedem* Zustand dazu. Dasselbe gilt für `fuse > 0`, den laufenden Sprengcountdown, der laut
`skills.ts` 41 aus **jedem** Zustand heraus gesetzt werden kann — auch im Fall, auch beim
Blocker.

Damit ergibt sich für ein vollständig gebackenes Blattwerk:

| Faktor | Ausprägungen |
|---|---|
| Clips | 12 |
| Körperbilder gesamt | 60 |
| `hasClimber` | 2 |
| `hasFloater` | 2 |
| `fuse > 0` | 2 |
| Blickrichtung | 1 (der Code spiegelt) |

**60 × 2 × 2 × 2 = 480 Einzelbilder.** Bei einem Aufwand von rund einer Stunde je fertig
nachgepixeltem Bild (Bibliothek §11) sind das drei Monate Vollzeit — und jede spätere
Änderung an der Grundfigur macht alle 480 ungültig.

### 4.2 Der gangbare Weg: getrennte Anbauteil-Ebenen

Statt der Kombinationen wird pro Bild ein **Andockpunkt** gespeichert und das Ausrüstungs­teil
als eigene, sehr kleine Ebene darübergezeichnet. Der Atlas trägt dafür drei Punktlisten,
je eine Position pro Körperbild:

| Andockpunkt | Wofür | Ersetzt im Code |
|---|---|---|
| `head` | Kletterhelm | `sprites.ts` 69 |
| `hip` | eingeklappter Schirm | `sprites.ts` 70 |
| `belly` | Bombe mit Zündschnur | neu, ersetzt den Ganzkörper-Rotblitz |

**Der Aufwand fällt von 480 auf 75 Bilder:**

| Ebene | Bilder |
|---|---|
| Körper (12 Clips) | 60 |
| Helm, 3 Neigungen | 3 |
| Schirm eingeklappt, 2 Bilder | 2 |
| Bombe mit brennender Schnur, 5 Bilder | 5 |
| Countdown-Ziffern 1–5 | 5 |
| **Summe** | **75** |

**Ehrlich zur Grenze dieses Verfahrens:** Ein einziges angeheftetes Helmbild passt nicht auf
jede Kopfhaltung. Der Kletterer blickt nach oben, der Gräber nach unten, der Faller kippt
nach hinten. Deshalb drei Neigungsvarianten und ein Variantenindex je Körperbild — nicht
ein Bild, sondern eine kleine Auswahl. Wo auch das nicht reicht (der Helm bei maximalem
Squash im Todesbild 4), wird das Anbauteil für diese Bilder schlicht abgeschaltet: Der
Atlas erlaubt `null` als Andockpunkt, und der Helm verschwindet, sobald die Figur ohnehin
nicht mehr als Figur lesbar ist.

**Zur Spiegelung:** Ein Anbauteil wird mit demselben `scale(-1, 1)` gespiegelt wie der
Körper, und sein Andockpunkt wird an derselben Achse gespiegelt. Damit darf **kein**
Anbauteil eine Seitenkennung tragen: keine Lampe nur links, kein Abzeichen, keine
Beschriftung. Die Stirnlampe des Helms muss deshalb mittig auf der Stirn sitzen — sie ist in
der reinen Seitenansicht ohnehin ein einzelner Pixel.

---

### 4.3 Kletterhelm — 3 Neigungen

Heute ein 6 × 2 px großer Balken 2 px über dem Scheitel (`sprites.ts` 69). Als Anbauteil:
Zelle **12 × 12 logisch = 96 × 96 Master**, Ankerpunkt in der Zellmitte bei Master (48, 48),
und dieser Punkt liegt auf dem Scheitel der Kopfkuppel.

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Attachment asset: a climbing helmet for a small cartoon worker creature,
drawn on its own so an engine can pin it onto a character sprite. The head
it belongs on is a large smooth bald dome; the helmet must sit on that dome
like a shell, with its inner curve matching a dome of 32 pixels diameter at
this master scale.

Design: a hard angular helmet in amber #ffd23f with a flat forward brim, a
low crown ridge running front to back, a chin strap suggested as two short
dark lines at the sides, and one small round lamp centred on the front of
the brim with a pale warm core. Hard near-black outline #0c1119, the same
weight as the character outline.

Layout: exactly 3 cells in one horizontal row, equal cells, no gaps, no
borders, no labels. Each cell is exactly 96 by 96 pixels. Canvas 288 by 96
pixels, aspect ratio 3:1.

The pinning point is the exact centre of every cell, at 48 pixels from the
left and 48 pixels from the top: that point marks the crown of the head the
helmet sits on, and it must be at the identical position in all three
cells.

Cell 1 — level: the helmet worn straight, brim horizontal and pointing
right.
Cell 2 — tilted up by about twenty degrees, brim pointing up and right, for
a character looking upward.
Cell 3 — tilted down by about twenty degrees, brim pointing down and right,
for a character looking at the ground.

Strict side view facing right in all three. The engine mirrors the sheet
for the other direction, so nothing may identify a left or a right side
beyond the brim direction itself. The lamp is centred, not offset.

Fully transparent background, no head drawn, no shadow, no character. At 12
pixels of character height the helmet is barely two pixels tall — it must
therefore change the head silhouette from round to squared-off and add
visible height. That change is the entire purpose of the asset.
```

---

### 4.4 Schirm eingeklappt — 2 Bilder

Heute ein 2 × 4 px großer Balken an der Hüfte vorn (`sprites.ts` 70), sichtbar in **allen**
Zuständen außer `FALLING`. Zelle **12 × 12 logisch = 96 × 96 Master**, Anker in der
Zellmitte auf dem Griffpunkt der Hand.

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Attachment asset: a furled umbrella carried at the hip of a small cartoon
worker creature, drawn on its own so an engine can pin it onto a character
sprite.

Design: a tightly closed umbrella in amber #ffd23f with a darker amber
binding strap around the middle, a short straight handle with a simple
hooked end, a small finial at the tip, and the ribs visible as three fine
darker lines along the furled canopy. Hard near-black outline #0c1119, the
same weight as the character outline. Total length 32 pixels at this master
scale, thickness 16 pixels.

Layout: exactly 2 cells in one horizontal row, equal cells, no gaps, no
labels. Each cell is exactly 96 by 96 pixels. Canvas 192 by 96 pixels,
aspect ratio 2:1.

The pinning point is the exact centre of every cell, at 48 pixels from the
left and 48 pixels from the top: that point marks the mitten hand gripping
the handle, and it must be at the identical position in both cells.

Cell 1 — hanging: the umbrella pointing down and slightly back, at rest.
Cell 2 — swinging: the same umbrella rotated about fifteen degrees forward
around the pinning point, as it would swing while the creature walks.

Strict side view facing right. The engine mirrors the sheet, so the design
carries no left or right marking.

Fully transparent background, no character, no hand, no shadow. At 12
pixels of character height this asset is a two-pixel notch on the hip — its
only job is to say "this one has an umbrella" before the fall starts, so
keep it a hard, compact, high-contrast wedge rather than a fine detail.
```

---

### 4.5 Bombe mit Zündschnur — 5 Bilder

`BOMB_FUSE_TICKS = 5 · TICK_HZ = 300` Ticks. **5 Bilder à 60 Ticks** — eine Sekunde je
Bild, deckungsgleich mit dem Countdown 5-4-3-2-1, den `sprites.ts` 133 als Zahl ausgibt und
`world.ts` 260 als `fuse-tick`-Ereignis meldet. Das Blatt greift die Idee des
Countdown-Blatts §3.3 der Bibliothek auf, liefert sie aber **ohne Figur** — denn ein
Sprengmeister läuft, fällt, gräbt und blockt weiter, während die Schnur brennt.

Zelle **16 × 16 logisch = 128 × 128 Master**, Anker bei Master (64, 80): 10 logische Pixel
Platz nach oben für die Schnur, 6 nach unten.

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Attachment asset: a round bomb with a burning fuse, clutched against the
belly of a small cartoon worker creature, drawn on its own so an engine can
pin it onto a character sprite. The character is not drawn.

Design: a cannonball-style sphere in near-black #0c1119, 40 pixels across
at this master scale, with one amber #ffd23f highlight arc on its upper
left and a small collar at the top where the fuse enters. A curled fuse
rises from the collar, drawn as a rope-textured cord in warm sand #f4d7ac,
burning at its tip with a bright spark.

Layout: exactly 5 cells in one horizontal row, equal cells, no gaps, no
borders, no labels, no numerals anywhere. Each cell is exactly 128 by 128
pixels. Canvas 640 by 128 pixels, aspect ratio 5:1.

The pinning point sits at 64 pixels from the left and 80 pixels from the
top of every cell, at the centre of the sphere, identical in all five
cells. The sphere must not move between cells — only the fuse changes.

Cell 1 — the fuse is at full length, curling well above the sphere, the
spark small and white with a thin four-point flare.
Cell 2 — the fuse noticeably shorter, one curl gone, the spark larger, a
first wisp of grey smoke.
Cell 3 — half the fuse burnt away, the spark bright amber with visible
sparks flicking off, more smoke.
Cell 4 — a short stub of fuse, the spark large and hot, a warm glow
#ff7a45 spilling onto the top of the sphere.
Cell 5 — the fuse is gone to a nub at the collar, the spark a small white
flash, the whole sphere rim-lit in danger red #ff4d4d.

Strict side view facing right. The engine mirrors the sheet, so nothing may
identify a left or a right side.

Fully transparent background, no character, no arms, no shadow. At 12
pixels of character height this asset is a round bulge at belly height with
a thin curl above the shoulder — that combination must read as "carrying
something round and lit" and must not be confusable with an object held
above the head.
```

---

### 4.6 Countdown-Ziffern 1 bis 5

Heute zeichnet `sprites.ts` 140–146 die Zahl mit `bold 13px system-ui` in **Bildschirm**pixeln
— sie skaliert also nicht mit dem Zoom und passt stilistisch nicht zum Rest. Ein
Ziffernstreifen in logischen Pixeln behebt beides. Nur 1 bis 5, weil
`Math.ceil(fuse / 60)` bei `BOMB_FUSE_TICKS = 300` nie mehr ergibt.

Zelle **8 × 10 logisch = 64 × 80 Master**, Anker unten mittig bei Master (32, 80); der
Renderer setzt ihn auf `y − WUSEL_H − 4`, also 16 logische Pixel über dem Fußpunkt.

```
[PREPEND STYLE BLOCK A]

Pixel-font asset: the five numerals 1, 2, 3, 4 and 5, for a countdown
displayed above a character in a pixel-art game. Nothing else — no other
digits, no letters, no punctuation, no frame.

Design: heavy blocky numerals in bright amber #ffdf5e with a hard
near-black outline #0c1119 two pixels thick at this master scale and a
one-pixel dark drop offset below and right, so the digits stay legible
against a bright sky and against dark rock alike. Flat fill, no gradient,
no bevel, no glow.

Layout: exactly 5 cells in one horizontal row, equal cells, no gaps, no
borders, no separators. Each cell is exactly 64 by 80 pixels. Canvas 320 by
80 pixels, aspect ratio 4:1. Reading order left to right: 1, 2, 3, 4, 5.

Every numeral sits on a common baseline at exactly 80 pixels from the top
of its cell and is horizontally centred at 32 pixels from the left of its
cell. All five have the same cap height, the same stroke weight and the
same visual width — the digit 1 must be padded to the same optical width as
the others, not left narrow.

Construction rule: build every numeral on a strict grid so that at final
size it is 5 pixels wide and 7 pixels tall with a 1-pixel stroke. Counters
— the enclosed hole in the 4 — must stay open at that size.

Fully transparent background, no shadow, no panel, no background plate.
```

---

## 5. Terrain als Textur statt Farbwert

### 5.0 Was der Code heute wirklich tut — und was davon eine Kachel übernehmen kann

`TerrainView.paint()` (`terrainView.ts` 57–112) berechnet für **jeden** Pixel eine
Grundfarbe je Material und addiert darauf mehrere Helligkeitsterme. Eine Textur kann nur
den Teil ersetzen, der eine *Funktion des Ortes* ist — nicht den, der eine Funktion des
*Zustands* ist.

| Term | Ortsabhängig? | Zustandsabhängig? | Kachel oder Code |
|---|---|---|---|
| Grundfarbe je Material | ja | nein | **Kachel** |
| Korn `±7` | ja (`grain(x,y)`) | nein | Kachel, Rest im Code auf `±4` reduzieren |
| Stahlschachbrett `±8` | ja | nein | **Kachel** |
| Stahlniete `+34` | ja | nein | **Kachel** |
| Ziegelnaht `−20 / +6` | ja | nein | **Kachel** |
| Grasnarbe | nein — hängt an `openAbove` | ja | Deckschicht + Codeänderung |
| Tiefenabdunklung `−20` | teils | nein | **bleibt im Code** |
| Fels-Oberkante `+16` | nein — hängt an `openAbove` | ja | **bleibt im Code** |
| Frische Bruchkante `+30` | nein — hängt an `fresh[]` | ja | **bleibt im Code** |

**Der wichtigste Befund zu „frisch":** `Terrain.markNeighboursFresh()` setzt das Flag auf den
acht Nachbarn jedes abgeräumten Pixels. Innenpixel eines abgeräumten Bereichs sind selbst
leer, ihre Nachbarn also auch — **`fresh` ist damit ein exakt ein Pixel breiter Saum entlang
jeder Grabkante**, und er bleibt dauerhaft gesetzt. Es braucht deshalb *keine* zweite,
hellere Kacheltextur. Es braucht eine Kachel, die eine gleichmäßige Aufhellung um 30 pro
Kanal **überhaupt verträgt**.

Daraus folgt die härteste Anforderung dieses Abschnitts, und sie ist reine Arithmetik:

> **Kein Kanal einer grabbaren Kachel darf unter 32 oder über 200 liegen.**

Herleitung: Auf den Kachelwert addiert der Renderer im ungünstigsten Fall Korn `+4`,
Fels-Oberkante `+16` und Frischesaum `+30`, zusammen `+50` → 200 + 50 = 250 < 255. Nach
unten: Korn `−4` und Tiefenabdunklung `−20`, zusammen `−24` → 32 − 24 = 8 > 0. Wird das
Band verletzt, klemmt `clamp255()` — und der Frischesaum, der laut GDD §6 die eigene Arbeit
sichtbar machen soll, verschwindet genau dort, wo die Kachel am hellsten ist. Das ist der
häufigste Fehler beim Umstieg von Farbwerten auf Texturen.

Stahl wird nie frisch (`markNeighboursFresh` überspringt `MAT.STEEL`); dort genügt das Band
**24 bis 232**.

### 5.1 Erde — 64 × 64 logisch

Die Kachel wird in **Weltkoordinaten** angesprochen (`tex[(y & 63) * 64 + (x & 63)]`), nicht
pro Objekt. Jede Richtungstendenz in der Struktur wird dadurch zur sichtbaren Diagonale über
den ganzen Bildschirm.

```
[PREPEND STYLE BLOCK B]
[APPEND PALETTE LOCK]

Seamless tileable ground texture for a game with pixel-destructible
terrain, to be sampled in world coordinates by a renderer. Material: soft
diggable soil. Base #6b4a2e, darker pockets toward #4a3320, lighter grains
toward #8a6236.

Hard technical constraints, more important than the look:

Value range: no pixel may have any red, green or blue channel below 32 or
above 200. The engine adds up to fifty and subtracts up to twenty-four on
top of this texture, and anything outside that band clips to flat white or
flat black. Check the histogram, not the impression.

Tiling: perfectly seamless on all four edges, and — this is the part that
usually fails — with no perceptible repeating motif at all. There must be
no single feature large or distinctive enough to be recognised when the
tile repeats fifteen times across the screen: no big stone, no bright
patch, no dark hole, no diagonal streak, no directional grain. Test by
offsetting the tile by half its width and half its height; the seam and any
landmark must be invisible.

Content: densely packed granular earth at a uniform scale, small embedded
pebbles no wider than eight pixels of this master texture, a few short root
threads, occasional tiny stones. Irregular and organic, no rows, no clumps
larger than a sixteenth of the tile. It must read as "I can dig through
this": loose, crumbly, soft-edged, never crystalline and never metallic.

Absolutely no grass, no crust, no vegetation, no surface layer of any kind.
The grass layer is a separate asset composited on top by the engine, and
grass baked into this tile would appear underground.

Lighting: completely flat and even. No directional shadow, no highlight
hotspot, no vignette, no corner darkening — every one of those becomes a
visible repeat.

Pixel art on a strict square pixel grid, roughly 20 colours, mild ordered
dithering in the tonal transitions.

Master scale: 512 by 512 pixels, representing 64 by 64 logical game pixels
at 8x. Opaque, fills the whole canvas, no border, no frame, no label.
Aspect ratio 1:1.
```

### 5.2 Fels — 64 × 64 logisch

```
[PREPEND STYLE BLOCK B]
[APPEND PALETTE LOCK]

Seamless tileable ground texture for a game with pixel-destructible
terrain, to be sampled in world coordinates by a renderer. Material: hard
but still diggable rock. Base #565d6b, darker crevices toward #3b414d,
lighter facets toward #6f7787.

Hard technical constraints, more important than the look:

Value range: no pixel may have any red, green or blue channel below 32 or
above 200. The engine adds up to fifty and subtracts up to twenty-four on
top of this texture; anything outside that band clips.

Tiling: perfectly seamless on all four edges, with no perceptible repeating
motif. No single facet may be large or bright enough to be recognised when
the tile repeats across the screen, and no facet edge may run consistently
in one direction — a shared diagonal would read as banding at screen scale.
Verify with a half-width, half-height offset.

Content: interlocking angular stone facets of varying size, none wider than
a sixth of the tile, sharp fracture planes, thin dark cracks running
between the blocks, a sparse scatter of fine mineral speckles. Clearly
harder and more angular than soil, but still fractured and workable: it
must read as "slow going but possible", never as impenetrable. The player
distinguishes rock from steel by this quality alone, so keep every edge
irregular and hand-broken.

Lighting: completely flat and even. Facet variation is expressed through
value steps in the texture itself, never through a light direction. No
baked shadow, no hotspot, no vignette.

Pixel art on a strict square pixel grid, roughly 18 colours, hard-edged
facets, no soft gradients.

Master scale: 512 by 512 pixels, representing 64 by 64 logical game pixels
at 8x. Opaque, fills the whole canvas. Aspect ratio 1:1.
```

### 5.3 Stahl — 64 × 64 logisch, Raster exakt aus dem Code

Anders als in der Bibliothek §5.3 sind hier die Rasterpositionen **exakt** vorgegeben, weil
die Kachel das prozedurale Muster ersetzt und nicht danebenliegen darf. Aus
`terrainView.ts` 92–94: Schachbrettzelle `4 × 4` logische Pixel
(`((x>>2)+(y>>2)) & 1`), Niete an `x % 8 == 4 && y % 8 == 4`. Bei 8× Master heißt das:
Schachbrettzelle 32 × 32 Master, Nietmittelpunkt bei Master (36, 36) in jedem 64 × 64
Master großen Block.

```
[PREPEND STYLE BLOCK B]
[APPEND PALETTE LOCK]

Seamless tileable ground texture: indestructible riveted steel plating for
a side-scrolling game, to be sampled in world coordinates by a renderer.
Base #8b96a6, recesses toward #656f7d, bright bevels toward #b9c3d0.

The geometry of this texture is fixed and must be hit exactly; it replaces
a procedural pattern and any deviation will be visible as a misalignment.

Checker: the surface is divided into a two-tone checkerboard of squares
exactly 32 by 32 pixels of this master texture, alternating one value step
lighter and one step darker, starting with the lighter square at the top
left corner of the canvas. The checker is subtle — a hint of plate
segmentation, not a chessboard.

Rivets: one round dome-head rivet every 64 pixels of this master texture in
both directions, so eight rivets across and eight down. Each rivet centre
sits at 36 pixels right and 36 pixels down from the top left corner of its
own 64 by 64 block — deliberately off-centre, one checker square in from
the corner. Each rivet is 24 pixels across, with a bright top bevel, a mid
tone body and a dark bottom recess.

Value range: no pixel below 24 or above 232 on any channel; the engine adds
and subtracts a small amount on top.

Tiling: perfectly seamless on all four edges with the rivet grid continuing
unbroken across every seam. Because the pattern is deliberately regular,
the seam test here is about phase, not about landmarks: offsetting the tile
by 64 pixels in either direction must produce an identical image.

Read intent, the most important requirement: this material must say "you
cannot dig here, stop" instantly and from across the screen. Cold, hard,
machined, perfectly regular, utterly unlike every organic material in the
game. Sharp bevels, no crumbling, no cracks, no dirt softening the edges.
Between the rivets, only faint brushed striations and two or three small
dents in the whole tile.

Lighting: flat and even overall; the bevel structure provides all form. No
scene shadow, no vignette.

Pixel art on a strict square pixel grid, roughly 14 colours.

Master scale: 512 by 512 pixels, representing 64 by 64 logical game pixels
at 8x, rivets every 8 logical pixels. Opaque, fills the whole canvas.
Aspect ratio 1:1.
```

### 5.4 Gebaute Stufe — 48 × 8 logisch

Das einzige Material, das der Spieler erzeugt — und das mit Abstand dünnste. Der
Brückenbauer legt mit `terrain.fillRect(bx, w.y, BRICK_LEN, 1, MAT.BRICK)` eine Reihe von
genau **einem** Pixel Höhe (`world.ts` 521). Eine Treppe besteht aus zwölf solchen Reihen
auf unterschiedlichen Höhen. Jede Bildzeile der Kachel wird also **einzeln und isoliert**
gesehen; senkrechte Holzmaserung ist im Spiel unsichtbar. Was zählt, ist ausschließlich der
waagerechte 6-Pixel-Rhythmus aus `x % 6 == 0` — deshalb muss die Kachelbreite ein
Vielfaches von `BRICK_LEN = 6` sein, hier 48.

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Seamless horizontally tileable texture strip: player-built wooden bridge
steps for a side-scrolling puzzle game, sampled in world coordinates by a
renderer. Warm brick brown #b5713f, darker seams #8a5530, lighter top
surface #c98a52.

Unusual and critical constraint: in the game this material is only ever
drawn one pixel row at a time, at varying heights. Every single horizontal
row of this strip is therefore seen on its own, without the rows above or
below it. Design accordingly: all meaningful structure must be horizontal.
Vertical wood grain, plank thickness shading and top-to-bottom gradients
are wasted here and will never be visible.

Rhythm, fixed: a dark vertical seam exactly every 48 pixels of this master
texture, one master-scale plank width, drawn as a 8-pixel-wide dark notch
running the full height of the strip. Between the seams the plank body is
one step lighter, with a small nail head near each seam and a slightly
chipped, irregular edge along the top row. Exactly eight seams across the
strip.

Value range: no pixel below 32 or above 200 on any channel — the engine
brightens freshly cut edges by thirty and this material can be dug.

Tiling: perfectly seamless left to right, with the seam rhythm continuing
across the wrap. Vertical tiling is not required.

The material must read as clearly manufactured and clearly not natural
against both soil and rock: a straight machined edge, an even thickness, a
hard regular rhythm. The player traces their own path through the level by
this rhythm alone.

Lighting: flat and even, no directional shadow.

Master scale: 384 by 64 pixels, representing 48 by 8 logical game pixels at
8x, one seam every 6 logical pixels. Opaque, fills the whole canvas.
Aspect ratio 6:1.
```

### 5.5 Grasnarbe — Deckschicht, nur oben

Heute ersetzt die Narbe die komplette Farbe genau dort, wo `openAbove && !isFresh` gilt
(`terrainView.ts` 83) — das ist **eine einzige Pixelzeile**. Als Textur soll sie ein paar
Pixel tief reichen; dafür braucht der Renderer den Abstand zur Oberfläche statt eines
Ja/Nein-Werts (siehe §6.4). Die Deckschicht wird **über** die Erdkachel gelegt, trägt
deshalb Alpha und läuft nach unten aus.

Die zweite Bedingung steckt ebenfalls im Code: `!isFresh`. Wo frisch gegraben wurde, gibt es
keine Narbe — das ist der sichtbare Beweis der eigenen Arbeit und darf durch die Textur
nicht aufgeweicht werden.

```
[PREPEND STYLE BLOCK B]
[APPEND PALETTE LOCK]

Seamless horizontally tileable overlay strip: the grass crust that sits on
top of undisturbed soil in a side-scrolling game. This is an overlay with
transparency, composited by the engine on top of a separate soil texture.

Layout: the strip is 8 logical pixels tall, 64 pixels of this master
texture, and reads strictly top to bottom as depth below the surface.

Row band 1, the topmost 8 master pixels: the surface itself, fully opaque,
lush grass green #4f8f3c, with a few individual blades and tufts breaking
upward past the top edge of the strip in an irregular, hand-cut rhythm — a
ragged line, never a straight one.
Row band 2, the next 16 master pixels: dense root mat, still mostly opaque,
green darkening toward #3a6b2c as it goes down.
Row band 3, the next 16 master pixels: the transition, alpha falling
steadily, individual root threads and a few clinging soil crumbs, the green
shifting toward brown.
Row band 4, the remaining 24 master pixels: almost entirely transparent,
only a scatter of isolated fine root hairs reaching down into what will be
bare soil, fading to fully transparent at the very bottom row.

The alpha ramp is the whole point of the asset: the crust must dissolve
into the soil beneath rather than end at a visible line, because the engine
places it at whatever depth the terrain surface happens to be.

Tiling: perfectly seamless left to right, with no recognisable landmark
tuft — the strip repeats many times across a level. No vertical tiling.

Value range: no channel below 32 or above 216.

Lighting: flat and even, no directional shadow, no highlight along the top
edge. The engine handles surface lightening.

Pixel art on a strict square pixel grid, roughly 12 colours plus alpha.

Master scale: 512 by 64 pixels, representing 64 by 8 logical game pixels at
8x. Transparent where specified. Aspect ratio 8:1.
```

---

## 6. Integrationsspezifikation

Kein Prompt — die Bauanleitung. Leitgedanke: **Das Spiel muss zu jedem Zeitpunkt lauffähig
bleiben.** Es gibt keinen Umstellungstag, an dem die prozedurale Zeichnung verschwindet.
Jedes einzelne Blatt wird zugeschaltet, sobald es fertig ist, und alles andere zeichnet
weiter wie bisher.

### 6.1 Ablage

```
src/art/
  wusel.png          Figurenatlas, 1×, alle Clips als Zeilen
  wusel.json         Atlasbeschreibung
  attach.png         Helm, Schirm, Bombe, Ziffern
  tile-earth.png     64 × 64
  tile-rock.png      64 × 64
  tile-steel.png     64 × 64
  strip-brick.png    48 × 8
  strip-crust.png    64 × 8
```

Unter `src/`, nicht unter `public/` — der Grund steht in §6.6.

### 6.2 Atlasformat

Ein JSON je Atlas. Die Felder sind genau die, die der Renderer braucht, und keines mehr.

```json
{
  "version": 1,
  "cell": { "w": 28, "h": 28 },
  "anchor": { "x": 14, "y": 22 },
  "facing": "right",
  "clips": {
    "walking":  { "row": 0,  "holds": [3,3,3,3,3,3,3,3],     "loop": true  },
    "falling":  { "row": 1,  "holds": [4,4,4,4],             "loop": true  },
    "floating": { "row": 2,  "holds": [3,3,3,3],             "loop": true  },
    "climbing": { "row": 3,  "holds": [4,4,4,4],             "loop": true  },
    "hoisting": { "row": 4,  "holds": [8,8,8,8,8,12],        "loop": false },
    "building": { "row": 5,  "holds": [3,3,3,3,3,3,3,3],     "loop": true  },
    "bashing":  { "row": 6,  "holds": [3,3,3],               "loop": true  },
    "mining":   { "row": 7,  "holds": [3,3,3,3],             "loop": true  },
    "digging":  { "row": 8,  "holds": [3,2,2],               "loop": true  },
    "blocking": { "row": 9,  "holds": [8,8],                 "loop": true  },
    "saving":   { "row": 10, "holds": [3,3,3,3,3,3],         "loop": false },
    "dying":    { "row": 11, "holds": [3,3,3,3,3,3,4,4],     "loop": false }
  },
  "attach": {
    "head": {
      "walking":  [ {"x":12,"y":7,"v":0}, {"x":12,"y":8,"v":0}, "…je Bild ein Eintrag" ],
      "digging":  [ {"x":13,"y":9,"v":2}, null, {"x":12,"y":8,"v":0} ]
    },
    "hip":   { "walking": [ {"x":14,"y":12}, "…" ] },
    "belly": { "walking": [ {"x":12,"y":13}, "…" ] }
  }
}
```

Die nötigen Angaben je Bild und warum:

| Feld | Wozu | Woher |
|---|---|---|
| `cell.w/h` | Zuschnitt aus dem Atlas-PNG | §2.1 — aus den Extremwerten in `sprites.ts` |
| `anchor.x/y` | Fußpunkt; `x` muss halbe Zellbreite sein | §2.1 — Spiegelachse des Codes |
| `holds[i]` | Ticks, die Bild `i` steht; Länge = Bildzahl | §2.3 — Taktraten aus `constants.ts` |
| `loop` | `false` bei `hoisting`, `saving`, `dying` | diese Zustände enden von selbst |
| `row` | Zeile im gepackten Atlas | Ergebnis des Packschritts |
| `attach.*[clip][frame]` | Andockpunkt in Zellkoordinaten, `v` = Variantenindex, `null` = Teil ausblenden | §4.2 |

Die Bildzahl steht **nicht** als eigenes Feld drin: Sie ist `holds.length`. Zwei Quellen für
dieselbe Zahl gehen irgendwann auseinander.

### 6.3 Laden

Regel: **Das Laden darf den Start nie blockieren.** Der Prototyp startet heute sofort; das
muss so bleiben, auch wenn ein PNG fehlt oder kaputt ist.

```ts
// src/render/atlas.ts (neu)
let atlas: Atlas | null = null;
export function getAtlas(): Atlas | null { return atlas; }

export function loadArt(onReady: () => void): void {
  // fire and forget; jeder Fehler lässt atlas === null und damit die
  // prozedurale Zeichnung stehen.
  decode(wuselPng, wuselJson)
    .then((a) => { atlas = a; onReady(); })
    .catch((e) => console.warn('Atlas nicht geladen, zeichne prozedural', e));
}
```

`game.ts` ruft `loadArt()` einmal beim Start auf und übergibt als `onReady` ein
`this.terrainView.markAllDirty()` plus `sync()` — sonst behält die schon gemalte
Terrain-Leinwand ihre Platzhalterfarben, bis der nächste Spatenstich sie berührt.

### 6.4 Zeichnen mit Rückfallebene

Die Weiche sitzt in `drawWusel` und ist **pro Clip**, nicht pro Spiel. So kann man ein
einziges fertiges Blatt zuschalten, während die restlichen elf noch prozedural laufen.

```ts
export function drawWusel(ctx, v, w, tick) {
  const a = getAtlas();
  const clip = a ? a.clips[clipNameFor(w)] : undefined;
  if (a && clip) { drawFromAtlas(ctx, v, w, a, clip); return; }
  drawWuselProcedural(ctx, v, w, tick);   // der heutige Code, unverändert
}
```

Vier Regeln für `drawFromAtlas`, jede davon aus einem konkreten Verhalten des Prototyps:

1. **Bildindex aus `w.timer`, nie aus dem globalen `tick`.** Heute rechnet `sprites.ts` mit
   `tick`, wodurch alle Figuren im Gleichschritt laufen und alle Hämmer gleichzeitig
   zuschlagen — eine Revuetruppe. `w.timer` zählt Ticks *im aktuellen Zustand* und ist je
   Figur verschieden, weil die Figuren zu verschiedenen Ticks in ihre Zustände geraten.
   Das ist eine sichtbare Verhaltensänderung und gehört abgenommen.
   ```ts
   function frameIndex(clip, t) {
     const cycle = clip.holds.reduce((a, b) => a + b, 0);
     let r = clip.loop ? t % cycle : Math.min(t, cycle - 1);
     for (let i = 0; i < clip.holds.length; i++) {
       if (r < clip.holds[i]) return i;
       r -= clip.holds[i];
     }
     return clip.holds.length - 1;
   }
   ```
   Weil `World.due()` bei `w.timer % interval === 0` arbeitet und die Zykluslänge jedes
   Arbeitsclips genau `interval` ist, fällt der Arbeitstick immer auf Index 0 — daher die
   Regel „Bild 1 ist das Wirkungsbild" aus §2.3.
2. **Ganzzahliges Zielrechteck.** `v.scale` ist praktisch nie ganzzahlig. Ohne Rundung
   wandert die Figur um Bruchteile eines Bildschirmpixels und flimmert. Dieselbe Rundung
   wie in `rect()` anwenden:
   ```ts
   const px = Math.round(sx(v, w.x));
   const py = Math.round(sy(v, w.y));
   const dw = Math.round(a.cell.w * v.scale);
   const dh = Math.round(a.cell.h * v.scale);
   const ax = Math.round(a.anchor.x * v.scale);
   const ay = Math.round(a.anchor.y * v.scale);
   ```
3. **Spiegeln ohne Versatzausgleich.** Weil `anchor.x` exakt die halbe Zellbreite ist:
   ```ts
   ctx.save();
   ctx.translate(px, py);
   if (w.dir < 0) ctx.scale(-1, 1);
   ctx.drawImage(a.img, sxCell, syCell, a.cell.w, a.cell.h, -ax, -ay, dw, dh);
   ctx.restore();
   ```
4. **`imageSmoothingEnabled = false` für den ganzen Szenenblock.** Heute schaltet
   `scene.ts` 154–164 die Glättung nur für das Terrainbild ab und **direkt danach wieder
   ein** — jedes Sprite-`drawImage` würde also weichgezeichnet. Die Abschaltung muss vor
   `drawSky` und die Wiedereinschaltung ans Ende von `draw()`.

Für die Anbauteile derselbe Ablauf mit dem Andockpunkt als zusätzlichem Versatz; ein
`null`-Eintrag überspringt das Teil für dieses Bild.

### 6.5 Terrain

`TerrainView.paint()` bleibt in seiner Struktur erhalten — die Dirty-Rect-Logik ist das,
was große Sprengungen billig macht, und die will man nicht anfassen. Es ändert sich nur, wo
`base` herkommt:

```ts
const t = this.tex[m];              // Uint32Array | null, je Material
if (t) {
  base = t[((y & 63) << 6) | (x & 63)] & 0xffffff;
  shade = (n - 0.5) * 8;            // Korn von ±7 auf ±4 reduziert
} else {
  base = /* heutiger switch, unverändert */;
  shade = (n - 0.5) * 14;
}
```

Vier Punkte dazu:

- **Kachelgrößen als Zweierpotenz**, damit `& 63` statt `%` reicht — das läuft pro Pixel und
  pro Sprengung über tausende Pixel. Einzige Ausnahme ist die Ziegelkachel mit 48 Breite
  (Vielfaches von `BRICK_LEN = 6`); dort ist ein `%` vertretbar, weil gebaute Stufen ein
  verschwindender Anteil der Fläche sind.
- **Weltkoordinaten, nicht Kachelkoordinaten.** `x` und `y` sind die Terrainkoordinaten. Das
  hält die Textur beim Graben ortsfest — grübe man in Kachelkoordinaten, würde sich die
  Struktur bei jeder Änderung verschieben.
- **Grasnarbe braucht einen Tiefenwert.** Heute liefert `openAbove` nur ja/nein. Für eine
  8 px tiefe Deckschicht braucht `paint()` den Abstand zur nächsten leeren Zeile darüber,
  gedeckelt bei 8:
  ```ts
  let d = 0;
  while (d < 8 && y - d - 1 >= 0 && mat[i - (d + 1) * width] !== MAT.EMPTY) d++;
  // d === 0  → direkt an der Oberfläche
  // d >= 8   → keine Narbe
  ```
  Die Schleife läuft höchstens achtmal und nur innerhalb des Dirty-Rects. Die Narbe wird
  danach mit ihrem eigenen Alpha über den Erdwert gemischt — und **nur wenn `!isFresh`**,
  genau wie heute.
- **Nach dem Laden `markAllDirty()` und `sync()`**, sonst bleibt das schon gezeichnete
  Level auf den Platzhalterfarben stehen.

### 6.6 Der Einzeldatei-Build ist die eigentliche Falle

`scripts/build-single.mjs` baut `spielen.html` und `dist/wuselwerk-single.html`, indem es
**nur das JS- und das CSS-Bündel** einbettet. Alles, was zur Laufzeit nachgeladen würde, ist
in diesen Fassungen kaputt — und die Fassung im Projektstamm ist der Link, den man
weitergibt.

Deshalb liegen die Bilder unter `src/art/` und werden **importiert**, nicht per URL geholt.
Vite bettet importierte Assets unterhalb von `build.assetsInlineLimit` als Data-URI direkt
ins JS-Bündel ein. Der Standardwert liegt bei 4 kB und reicht nicht.

```ts
// vite.config.ts
build: {
  target: 'es2020',
  outDir: 'dist',
  assetsInlineLimit: 512 * 1024,   // Grafik landet als Data-URI im Bündel,
                                   // sonst bricht npm run build:single
}
```

Größenrechnung, damit klar ist, dass das trägt: Der Figurenatlas mit 60 Bildern à 28 × 28
und rund 20 Farben liegt bei etwa 7 kB PNG, die fünf Terrainkacheln zusammen bei etwa 12 kB,
die Anbauteile bei etwa 2 kB. Base64 bläht um ein Drittel auf — zusammen also gut 25 kB im
Bündel. Das ist die Rechtfertigung dafür, in 1× auszuliefern statt in 2× oder 4× (§2.2):
Bei 4× wären es rund 400 kB, und die Einzeldatei würde unhandlich.

`scripts/verify-single.mjs` sollte dazu eine Prüfung bekommen, die fehlschlägt, sobald in
der erzeugten HTML noch ein Verweis auf `./assets/` steht. Sonst merkt man den Bruch erst,
wenn jemand den Link öffnet.

### 6.7 Zu ändernde Dateien

| Datei | Änderung | Umfang |
|---|---|---|
| `src/render/atlas.ts` | **neu** — Typen, Laden, Dekodieren, `frameIndex` | ~120 Zeilen |
| `src/render/textures.ts` | **neu** — PNG zu `Uint32Array` je Material | ~50 Zeilen |
| `src/art/*` | **neu** — die Bilder und die JSON | Assets |
| `src/render/sprites.ts` | Weiche vorn; heutiger Code wird `drawWuselProcedural` und bleibt wörtlich stehen | ~60 Zeilen dazu |
| `src/render/terrainView.ts` | Texturabfrage in `paint()`, Tiefenwert für die Narbe | ~30 Zeilen |
| `src/render/palette.ts` | Texturzuordnung je `ThemeId` neben den Farbwerten | ~10 Zeilen |
| `src/render/scene.ts` | `imageSmoothingEnabled` einmal für den ganzen Block; später Tür- und Falltürsprites | ~10 Zeilen |
| `src/game.ts` | `loadArt()` beim Start, `markAllDirty()` als Rückruf | ~5 Zeilen |
| `vite.config.ts` | `assetsInlineLimit` | 1 Zeile |
| `scripts/verify-single.mjs` | Prüfung auf verbliebene `assets/`-Verweise | ~10 Zeilen |
| `tests/` | siehe unten | ~40 Zeilen |

**Was ausdrücklich unangetastet bleibt:** alles unter `src/core/`. Die Simulation kennt keine
Grafik, und `World.stateHash()` (`world.ts` 663) samt der Determinismustests hängt daran.
Ein Renderer, der `w.timer` *liest*, ist unbedenklich; einer, der irgendetwas schreibt,
zerstört den Zeitrücklauf aus GDD §3.4.

**Zwei Tests, die den Umbau absichern:**

1. Ein Test, der über alle Werte von `State` läuft und prüft, dass jeder sichtbare Zustand
   entweder einen Clipnamen in der Zuordnungstabelle hat oder ausdrücklich als
   „prozedural" markiert ist. So fällt ein neu hinzugefügter Zustand sofort auf.
2. Ein Test, der für jeden Clip prüft, dass `sum(holds)` gleich der zugehörigen Konstante
   aus `constants.ts` ist — `digging` gegen `DIG_INTERVAL`, `dying` gegen `DYING_TICKS`, und
   so weiter. Damit kann niemand die Taktrate ändern, ohne dass das Blatt auffällt.

---

## 7. Reihenfolge

Sortiert nach sichtbarem Gewinn je Arbeitsstunde, nicht nach Interesse.

| Rang | Was | Warum zuerst / warum später | Prompt |
|---|---|---|---|
| 1 | **Parallax und Himmel** | Größte Bildfläche, offensichtlichster Platzhalter (ein Verlauf und drei einfarbige Polygone), Integration sind zwei `drawImage`-Aufrufe in `scene.ts`. Kein Atlas, keine Taktraten, keine Anker. Bester Eindruck je Stunde im ganzen Projekt. | vorhanden, Bibliothek §6.2/§6.4 |
| 2 | **Terrain: Erde, Fels, Grasnarbe** | Zweitgrößte Fläche und der eigentliche Spielinhalt — der Spieler starrt beim Graben genau darauf. Keine Animation, kein Timing. Der Umbau in `paint()` ist überschaubar, und §5.0 liefert die Wertebänder, an denen es sonst scheitert. | §5.1, §5.2, §5.5 |
| 3 | **`walking`** | Weit über neun Zehntel aller sichtbaren Figurenbilder. Ein einziges Blatt, und die Figuren hören auf, Klötzchen zu sein. Beweist außerdem die komplette Atlaskette an einem Fall, bei dem jeder Fehler sofort auffällt. | §3.1 |
| 4 | **Die vier Arbeitsclips**: `bashing`, `mining`, `digging`, `building` | Hier schaut der Spieler hin, wenn es zählt: Er prüft, ob sein Beruf sitzt. Zusammen nur 18 Bilder. Enthält mit `digging` den einzigen Clip mit ungleicher Haltedauer — danach ist das Format bewiesen. | §3.6–§3.9 |
| 5 | **`blocking`, `falling`, `floating`** | Spielentscheidende Lesbarkeit: „braucht die einen Schirm?" ist die häufigste Frage am Bildschirm. Nur 10 Bilder. Steht hinter Rang 4, weil die drei Zustände kürzer zu sehen sind. | §3.10, §3.2, §3.3 |
| 6 | **Anbauteile**: Helm, Schirm, Bombe, Ziffern | Ab hier ist die Ausrüstung wieder korrekt sichtbar. Muss nach den Körperclips kommen, weil die Andockpunkte je Bild aus den fertigen Körpern abgemessen werden — vorher gibt es nichts zu messen. | §4.3–§4.6 |
| 7 | **Ausgang und Falltür** | Die zwei Fixpunkte jedes Levels, Prompts liegen fertig vor, je zwei bis drei Bilder, keine Taktrate. Billig und sofort sichtbar — steht nur deshalb hier, weil der Ausgang schon heute durch seinen Leuchtschein funktioniert. | vorhanden, §7.1/§7.2 |
| 8 | **`saving` und `dying`** | Die emotionale Auszahlung aus GDD §2 — aber je Figur nur 18 bzw. 26 Ticks lang und im Gewusel oft übersehen. Der generische Tod (§3.12) zuerst, die drei ursachenspezifischen Blätter danach. | §3.11, §3.12, Bibliothek §4 |
| 9 | **`climbing` und `hoisting`** | Nur sichtbar, wenn der Kletterer im Level überhaupt vorkommt, und `hoisting` mit 52 Ticks höchstens einmal je Wand. 10 Bilder für einen Randfall. | §3.4, §3.5 |
| 10 | **Stahl- und Ziegelkachel** | Stahl kommt selten und flächig vor, und das prozedurale Muster ist bereits erstaunlich passend. Ziegel ist ein Pixel hoch — dort holt eine Textur fast nichts heraus. | §5.3, §5.4 |
| 11 | **Partikel und Explosion** | Die farbigen Quadrate sehen in Bewegung besser aus, als sie im Standbild wirken. Prompts liegen vor; reiner Feinschliff. | vorhanden, Bibliothek §8 |
| 12 | **UI, Symbole, HUD** | Der am fertigsten wirkende Teil des Prototyps — `icons.ts` und `hud.ts` sind sauber gezeichnet. Zuletzt, und ehrlicherweise vielleicht gar nicht. | vorhanden, Bibliothek §9 |

Die Grenze zwischen „bringt sichtbar am meisten" und „Feinschliff" liegt zwischen Rang 6
und 7. Bis dahin verändert jeder Schritt den Gesamteindruck; danach verbessert er Details.

---

## 8. Wo Bildgeneratoren hier scheitern

Die Bibliothek sagt es in §0 allgemein; für die Blätter dieser Datei ist es konkreter und
härter, weil hier **Maßhaltigkeit über mehrere Bilder** gefordert wird.

**Was zuverlässig schiefgeht:**

| Anforderung | Was das Modell liefert | Nachbearbeitung |
|---|---|---|
| „exakt 8 Zellen in einer Reihe" | 6, 7 oder 9 Zellen, ungleich breit | Blatt verwerfen, neu erzeugen — nicht reparieren |
| „Grundlinie in allen Zellen bei 160 px" | Grundlinie wandert um 5–15 px | Zellen einzeln freistellen, an der Fußunterkante ausrichten |
| „Figur in allen Bildern gleich groß" | Kopf wächst und schrumpft um 10–20 % | Kopfdurchmesser messen, Bilder skalieren, danach neu pixeln |
| „ein Bild je gelaufenem Pixel" | eine Pose, achtmal leicht variiert | Nur Bild 1, 3, 5, 7 verwenden und die Zwischenbilder von Hand einsetzen |
| „Wert nie über 200" | Werte bis 255, oft mit hellen Glanzstellen | Tonwertkorrektur, danach Histogramm prüfen |
| „nahtlos kachelbar" | sichtbare Naht, oft mit Vignette | Halbversatz-Test, Naht übermalen, Vignette abziehen |
| „Niete bei Master (36, 36) je 64er-Block" | irgendwo, unregelmäßig | Für Stahl gar nicht generieren lassen — siehe unten |
| Anbauteil ohne Figur | Modell malt trotzdem eine Figur dazu | Freistellen oder verwerfen |

**Konsequenzen, die man einplanen muss:**

1. **Animationsblätter sind Vorlagen, keine Assets.** Die verlässliche Arbeitsweise ist:
   das Blatt erzeugen, die **zwei bis drei Extremposen** daraus behalten (bei `bashing`
   Aufprall und Ausholen, bei `walking` Kontakt und Durchschwung) und die Zwischenbilder von
   Hand einsetzen. Der Generator liefert die Idee der Pose, nicht die Sequenz. Für den
   Laufzyklus sind das erfahrungsgemäß drei bis vier Stunden — die Zahl aus §11 der
   Bibliothek stimmt und gilt hier unverändert.
2. **Der 3D-Weg aus Bibliothek §10 löst genau dieses Problem** und ist der einzige, der es
   löst. Ein Modell in derselben Geometrie über acht Posen bleibt konsistent, ein Bildmodell
   nicht. Wer mehr als zwei bis drei Clips ernsthaft animieren will, sollte den Umweg
   nehmen, statt gegen die Blattkonsistenz anzukämpfen.
3. **Die Stahlkachel sollte man nicht generieren.** Das Raster ist exakt vorgegeben
   (Schachbrettzelle 32 Master, Niete bei (36, 36) je 64er-Block) und arithmetisch
   ableitbar. Ein zwanzigzeiliges Skript, das die Kachel aus der Codeformel malt, ist in
   einer halben Stunde fertig und stimmt auf den Pixel. Der Prompt in §5.3 ist trotzdem
   nützlich — als Musterbild dafür, wie Fase, Niete und Kratzer aussehen sollen, bevor man
   sie nachbaut.
4. **Die Ziffern gehören von Hand gesetzt.** Fünf Glyphen à 5 × 7 Pixel sind eine
   Viertelstunde Arbeit und werden von keinem Bildmodell auf dem Raster getroffen. Der
   Prompt in §4.6 ist als Formvorlage gemeint, nicht als Lieferant.
5. **Zu den Werkzeugeinstellungen bewusst nichts Konkretes.** Welche Bildreferenz-,
   Seed- oder Auflösungsoptionen zur Verfügung stehen, hängt vom Werkzeug, vom Tarif und vom
   Stand des jeweiligen Dienstes ab. Das Vorgehen bleibt das aus §11 der Bibliothek: das
   erste wirklich gelungene Blatt als Referenz weiterverwenden, alle Blätter einer Serie am
   selben Tag mit derselben Einstellung erzeugen, und Prompt samt Einstellung zu jedem
   behaltenen Asset mitspeichern.

**Prüfliste zusätzlich zu der aus Bibliothek §11** — diese fünf Fragen betreffen nur die
Maßhaltigkeit und sind vor der Abnahme jedes Blattes dieser Datei zu beantworten:

1. Stapeltest: Alle Zellen übereinandergelegt — liegen Fußunterkante und Mittellinie in
   allen Bildern auf demselben Pixel?
2. Zellzahl: Ist die Bildzahl exakt die aus §2.3 geforderte? Eine mehr oder weniger bricht
   die Taktbindung.
3. Randtest: Ragt in irgendeinem Bild etwas über die Zellgrenze? Der Renderer schneidet
   hart ab.
4. Spiegeltest: Blatt waagerecht spiegeln — sieht die Figur immer noch richtig beleuchtet
   und ohne Seitenkennung aus?
5. Histogramm (nur Kacheln): Liegt jeder Kanal im Band aus §5.0? Wenn nicht, verschwindet
   die frische Bruchkante.
