# Wuselwerk — Prompt-Bibliothek für Bild- und 3D-Generatoren

> **⚠️ Hinweis zur Gültigkeit — Stand August 2026**
>
> Die **Stilrichtung** dieser Datei ist durch [`grafik-katalog.md`](./grafik-katalog.md)
> abgelöst. Das betrifft insbesondere den Wusel-Kanon (die Figur ist nicht mehr kahl,
> sondern ist ein Troll mit violetter Mähne `#9d4edd` als Signaturmerkmal), die Körperproportionen,
> die Stilblöcke A und B, den Palettenblock und die Konturstärke. Wo diese Datei und der
> Katalog sich widersprechen, gilt der Katalog — und wo der Katalog und
> [`grafik-ankerbild-a0.md`](./grafik-ankerbild-a0.md) sich widersprechen, gilt die
> Ankerdatei.
>
> **Gültig und unverändert bleiben die Motivlisten** — welche Grafiken das Spiel braucht,
> ist hier vollständig erfasst und dient dem Katalog als Vollständigkeitsprüfung. Ebenso
> gültig bleiben der rechtliche Warnhinweis, die Einordnung „was die Generatoren können",
> der 3D-Arbeitsablauf in §10 und die Aufwandsschätzungen in §11.

Stand: Prototyp-Palette und -Maße aus `src/render/palette.ts`, `src/render/sprites.ts`,
`src/core/constants.ts`, `src/core/types.ts`, `src/levels/index.ts`.
Kunstrichtung nach GDD §6, Pflichtinhalte nach GDD §5, Rechtsrahmen nach GDD §12.

**Sprachregel dieser Datei:** Erklärungen auf Deutsch, Prompts auf Englisch.
Bildmodelle folgen englischen Prompts spürbar zuverlässiger. Jeder Prompt steht in
einem eigenen Codeblock und ist ohne Umschreiben einsetzbar.

---

## ⚠️ Rechtlicher Warnhinweis — vor dem ersten Prompt lesen

GDD §12 ist hier bindend. In **keinem** Prompt, in keinem Dateinamen, in keinem
Referenzbild-Upload darf vorkommen:

- der Name **Lemmings**, **Psygnosis**, **DMA Design** oder **Sony** — in keiner Schreibweise
- **grünes Haar in Kombination mit blauer Kutte** — das ist die geschützte Originalgestaltung
- Formulierungen wie *„in the style of a classic 1991 puzzle game"*, *„like the old Amiga
  puzzle classic"*, *„retro lemming-like creatures"*. Auch die Umschreibung ist zu nah.
  Bereits die Anspielung erzeugt Assets, die dem Original zu ähnlich sehen — und genau die
  darf man nicht ausliefern.
- Screenshots des Originals als Referenzbild (img2img, Style-Reference, IP-Adapter)

**Erlaubt und gewollt ist:** die *Silhouettenlogik*. Kleine Figur, großer Kopf, kräftiger
Umriss, Beruf am Umriss erkennbar. Das ist Funktionsdesign, keine Gestaltungsübernahme.

**Der Wusel-Kanon (unsere Eigenentwicklung, in jedem Prompt gleich):**
kahler Kopf ohne Haare, überproportional groß (rund ein Drittel der Körperhöhe),
warme Sandhaut `#f4d7ac`, **einteiliger türkiser Arbeitsanzug** `#2fc9b8` mit dunkleren
Stiefeln `#1d8f85`, alle Werkzeuge und Ausrüstungsteile in Bernsteingelb `#ffd23f`,
fast schwarzer Umriss `#0c1119`. Kein Haar, kein Umhang, keine Kutte, kein Grün am Kopf.

Wenn ein Generator trotzdem etwas liefert, das nach dem Original aussieht: verwerfen und
den Negativprompt (§1.3) schärfen. Lieber zehn Generierungen mehr als ein Anwaltsbrief.

---

## Was diese Generatoren realistisch können — und was nicht

Ehrliche Einordnung vorweg, damit niemand drei Wochen an der falschen Stelle sucht:

**Bildmodelle liefern zuverlässig „Pixelart-Look", nicht echtes Pixelart.** Typische
Fehler: kein sauberes Pixelraster, Anti-Aliasing mitten in der Fläche, 4000 statt 24 Farben,
Halbpixel, verwaschene Kanten, inkonsistente Pixelgröße innerhalb eines Bildes. Für ein
Spiel, dessen Figur **12 logische Pixel** hoch ist, ist das nicht direkt verwertbar.

| Wofür die Generatoren taugen | Wofür eher nicht |
|---|---|
| Konzeptbilder, Stimmungsbilder, Farbfindung | Finale 12-px-Figuren |
| Charakterblätter und Turnarounds als **Malvorlage** | Animationsphasen mit konsistenter Figur |
| Parallax-Hintergründe (werden weichgezeichnet, Fehler fallen nicht auf) | Kachelbare Texturen ohne Nachbearbeitung |
| Store-Keyart, App-Icon-Entwurf, Pressebilder | UI-Symbole mit exakter Strichstärke |
| Materialstudien: Wie sieht frische Bruchkante aus? | Alles, was pixelgenau zum Terrain passen muss |

**Praktische Konsequenz:** Der einzige Weg zu echtem Pixelart im Spiel führt über
Nachbearbeitung von Hand (Aseprite o. ä.) oder über die 3D-Pipeline in §10. Die
Generatoren sind Zulieferer für Konzept und Hintergrund, nicht für Sprites.

---

## Inhalt

| § | Abschnitt | Prompts |
|---|---|---|
| 1 | Stil-Basis, Palette, Negativprompt | 4 |
| 2 | Die Figur (Wusel) | 5 |
| 3 | Die zehn Berufe | 10 |
| 4 | Todesanimationen | 5 |
| 5 | Terrain-Materialien | 5 |
| 6 | Die sechs Welten | 12 |
| 7 | Objekte, Türen und Fallen | 6 |
| 8 | Effekte und Partikel | 5 |
| 9 | UI, Icons, Keyart | 7 |
| 10 | Tripo (3D → Pixelart) | 6 |
| 11 | Arbeitsablauf und Konsistenz | — |

**Gesamt: 65 einsetzbare Prompts.**

### Technische Eckwerte, die überall wiederkehren

| Wert | Zahl | Quelle |
|---|---|---|
| Terrainmaske je Level | 960 × 540 logische Pixel | `levels/index.ts` |
| Figurenhöhe | 12 logische Pixel | `WUSEL_H` |
| Figurenbreite (gezeichnet) | 6 logische Pixel | `WUSEL_HALF_W` + Umriss |
| Blockerarme / Schirmdach | 12 logische Pixel breit | `sprites.ts` |
| Grabschacht (Gräber) | 8 logische Pixel breit | `DIG_HALF_W` |
| Rammstollen (Rammer) | 12 logische Pixel hoch | `BASH_UP` |
| Schrägbagger-Winkel | 2 px rechts je 1 px runter (~27°) | `MINE_DX`/`MINE_DY` |
| Brückenstufe | 6 logische Pixel lang, 12 Stück | `BRICK_LEN`, `BUILD_BRICKS` |
| Sprengradius | 14 logische Pixel | `BOMB_RADIUS` |
| Tödliche Fallhöhe | 78 logische Pixel | `FALL_DEATH_PX` |
| Falltür | 34 × 12 logische Pixel | `scene.ts` |
| Ausgangstür | ca. 32 × 26 logische Pixel | `levels/index.ts` |
| Frisch gegrabenes Material | +30 Helligkeit gegenüber altem | `freshBoost` |
| Stahl-Muster | 4-px-Schachbrett, Niete alle 8 px | `terrainView.ts` |
| Berufssymbol im HUD | 36 Punkt Breite | GDD §3.5 |

**Master-Maßstab: 8×.** Alles wird acht Mal so groß erzeugt wie es logisch ist, dann
heruntergerechnet. Figur 12 px → Master 96 px. Terrainkachel 64 px → Master 512 px.
Acht ist bewusst eine Zweierpotenz: Das Herunterrechnen bleibt verlustarm und die Kanten
landen auf ganzen Pixeln.

> **Anmerkung zur Auflösung:** GDD §6 nennt die Terrainmaske mit 960 × 600, der Code und
> alle fünf Testlevel arbeiten mit 960 × 540. Diese Bibliothek folgt dem Code. Vor dem
> Produktions-Asset-Bau sollte die Zahl einmal verbindlich festgezurrt werden.

---

## 1. Stil-Basis

Der Trick gegen Stilbruch über hunderte Generierungen: **ein Stilblock, der wörtlich vor
jeden anderen Prompt gesetzt wird.** Nicht paraphrasieren, nicht kürzen — Wort für Wort
kopieren. Modelle reagieren empfindlich auf Umformulierungen, und schon ein geändertes
Adjektiv verschiebt Farbtemperatur und Kantenhärte.

**Bewusste Entscheidung:** GDD §6 nennt *Dead Cells* und *Blasphemous* als Richtung. Diese
Titel stehen in dieser Datei ausschließlich in den deutschen Erklärtexten, **nie in einem
Prompt**. Der Grund ist praktisch, nicht juristisch: Stilnennungen fremder Spiele ziehen
Modelle zu deren konkreten Motiven (Untote, Kutten, Kathedralen) und liefern dann Bilder,
die man nicht verwenden kann. Der Stilblock beschreibt stattdessen die *Technik* — 8-fache
Auflösung, harter Umriss, indizierte Palette, dynamisches Licht statt Flat-Shading.

Es gibt zwei Stilblöcke: einen für Assets mit transparentem Hintergrund (Figuren, Objekte,
Icons) und einen für gemalte Flächen (Hintergründe, Keyart). Der Unterschied liegt in der
Beleuchtung: Assets brauchen neutrales, weiches Licht, damit sie in jede Welt passen;
Hintergründe dürfen dramatisch beleuchtet sein.

### 1.1 Master-Stilblock A — Sprites, Objekte, Icons

```
STYLE BLOCK A — WUSELWERK SPRITE STYLE

High-resolution pixel art rendered at 8x master scale, in the modern
pixel-art tradition where sprites are sculpted with volume and lit with
real-time lighting rather than flat-shaded. Chunky readable forms, a hard
near-black outline on every silhouette, and a strictly limited palette of
about 20 to 24 indexed colours. Clean orthogonal pixel grid: every pixel is
a perfect square, no half-pixels, no anti-aliasing inside flat areas, soft
anti-aliasing permitted only on the outer silhouette edge.

Lighting: neutral three-quarter key light from the upper left, one cool
bounce fill from the lower right, one narrow rim highlight along the top
edge to lift the sprite off dark terrain. No cast shadow baked into the
sprite. No coloured environment light — the sprite must sit believably in a
green field, a blue ice cave and a red lava pit without re-tinting.

Rendering: crisp, slightly grimy, hand-crafted. Visible dithering only in
large gradients. No airbrush softness, no vector smoothness, no gradient
meshes, no glossy plastic sheen.

Readability rule, non-negotiable: the shape must remain unmistakable when
downscaled to 16 pixels tall. Silhouette carries all information; colour is
decoration only.
```

### 1.2 Master-Stilblock B — Hintergründe, Parallax, Keyart

```
STYLE BLOCK B — WUSELWERK ENVIRONMENT STYLE

High-resolution painterly pixel art, side-scrolling platform-game
perspective, strictly orthographic side view with no vanishing point and no
perspective convergence. Modern dynamic lighting layered over a pixel base:
volumetric light shafts, coloured bounce light, atmospheric haze that
desaturates and lightens with distance, and gentle depth-of-field blur on
the farthest layers only.

Palette discipline: 24 to 32 indexed colours per layer, deliberate value
separation between depth layers so each layer reads as its own plane even
in greyscale. Foreground darkest and most saturated, distance progressively
lighter, cooler and hazier.

Rendering: hand-painted pixel clusters, visible dithering in gradients and
fog, hard silhouette edges on nearby geometry, softened edges in the far
distance. Composition leaves the horizontal centre band calm and uncluttered
— gameplay happens there and must stay legible.

No characters, no creatures, no text, no logos, no UI elements, no
foreground props unless explicitly requested.
```

### 1.3 Negativprompt — universal

Bei Modellen ohne eigenes Negativfeld (etwa manchen Chat-basierten Generatoren) hängt man
diesen Block als Absatz mit dem Vorsatz „Avoid the following:" an den Prompt an.

```
NEGATIVE PROMPT — WUSELWERK

green hair, blue robe, blue hooded gown, green-haired creature, hooded
tunic, small green-haired mascot, any recognisable existing game character,
existing franchise mascot, licensed character, brand logo, trademark,
watermark, signature, artist signature

vector art, flat vector illustration, smooth vector shapes, corporate flat
design, clip art, sticker style, glossy 3D mobile-game render, cartoon
cel-shading, calarts style, chibi anime, kawaii sticker

blurry, smeared, soft focus on the subject, anti-aliased interior, mixed
pixel sizes, inconsistent pixel grid, upscaling artefacts, JPEG artefacts,
noise, film grain, chromatic aberration, lens flare, bloom on sprites

photorealistic, realistic human proportions, detailed facial features,
teeth, fingers, text, letters, numbers, captions, speech bubbles, UI
overlay, health bar, drop shadow, cast shadow on transparent background,
checkerboard pattern rendered as image content, busy background, cluttered
composition, perspective distortion, three-quarter camera, isometric view
```

### 1.4 Palettenblock zum Anhängen

Die echten Werte aus dem Prototyp. Wer diesen Block anhängt, bekommt Assets, die zum
laufenden Spiel passen — ohne dass man sie hinterher umfärben muss. Bei Modellen, die
Hex-Werte ignorieren, hilft es trotzdem: Sie schieben die Farbstimmung in die richtige
Richtung, und der Rest wird beim Nachbearbeiten auf die Palette quantisiert.

```
PALETTE LOCK — WUSELWERK

Character: suit teal #2fc9b8, deep suit teal #1d8f85, skin warm sand
#f4d7ac, equipment amber #ffd23f, outline near-black #0c1119, blocker
warning orange #ff7a45, danger red #ff4d4d.

Grassland terrain: soil brown #6b4a2e, grass crust #4f8f3c, rock grey
#565d6b, indestructible steel #8b96a6, built brick step #b5713f, warm glow
#ffd98a.

Grassland sky and parallax: sky top #101c33, sky at horizon #3d5f7d,
far hills #1b2f42, mid hills #24415a, near hills #2f5570.

Crystal cave: soil #3e4a72, glowing crust #6f8ad6, rock #35405f, crystal
violet #a06be0, cold glow #9fd8ff, sky top #0a0f22, sky bottom #1d2b52.

UI: panel #0e131c, raised panel #18202e, hairline #27334a, text #dce6f5,
dimmed text #7b8ba3, accent amber #ffd23f, success #4fd18b, failure #e05a4a.

Use these values as the indexed palette. Do not introduce additional hues
outside this set except for light bloom and particle sparks.
```

---

## 2. Die Figur (Wusel)

Die Figur ist der schwierigste Teil der ganzen Bibliothek, weil sie den härtesten
Zielkonflikt trägt: Sie muss **niedlich genug für Empathie** sein (GDD §2, Spaßquelle 3 —
man soll sich schuldig fühlen, wenn sie stirbt) und gleichzeitig **auf 16 Bildschirmpixeln
lesbar**. Alles, was Niedlichkeit über feine Details erzeugt — Wimpern, Fellstruktur,
Stoffdetails — ist bei dieser Größe verloren. Niedlichkeit muss deshalb über **Proportion**
kommen: großer Kopf, kurze Beine, runde Schultern.

Deshalb steht in jedem Figurenprompt der Satz zur 16-Pixel-Lesbarkeit, und deshalb wird
die Figur als **Charakterblatt** erzeugt, nicht als Einzelbild: Man braucht sofort mehrere
Ansichten, um zu prüfen, ob die Silhouette von allen Seiten trägt.

### 2.1 Grunddesign — Charakterblatt

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Character sheet for "Wusel", the player creature of a real-time rescue
puzzle game. Original design, not based on any existing character.

Anatomy: a small stocky worker creature, roughly three heads tall in total.
The head is a large smooth egg-shaped dome, completely bald, no hair, no
fur, no headwear, warm sand skin #f4d7ac. Two large round black dot eyes
set wide apart, low on the face, no visible nose, a tiny simple mouth line.
No ears. The body is a single-piece teal work suit #2fc9b8 with a slightly
barrel-shaped torso, short stubby arms with mitten hands, very short legs
ending in blunt dark teal boots #1d8f85. No cape, no robe, no hood, no
tunic, no skirt. Hard near-black outline #0c1119 around the entire figure,
two pixels thick at master scale.

Pose: standing at rest, strict side view facing right, feet flat on an
invisible ground line, arms hanging slightly forward, head tilted a few
degrees down as if about to walk off a ledge without noticing.

Lighting: neutral key from upper left, cool fill lower right, thin warm rim
along the top of the head.

The silhouette must be instantly recognisable as this creature when the
image is downscaled to 16 pixels tall: large round head, blocky torso,
stubby legs, no thin protruding details that would vanish.

Master scale: figure 96 pixels tall inside a 128 x 128 pixel canvas,
centred, feet on the lower third line. Fully transparent background, no
ground shadow, no backdrop. Square aspect ratio 1:1.
```

### 2.2 Turnaround — vier Ansichten

Der Turnaround dient nicht dem Spiel (das ist reine Seitenansicht), sondern der
**3D-Modellierung in §10** und dem Nachzeichnen. Wichtig ist, dass alle vier Ansichten auf
derselben Grundlinie und in derselben Höhe stehen — sonst kann man sie nicht übereinander
projizieren.

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Four-view turnaround sheet of the Wusel creature described as: small stocky
worker, three heads tall, large bald egg-shaped head with warm sand skin
#f4d7ac, two round black dot eyes, tiny mouth line, one-piece teal work
suit #2fc9b8, stubby mitten arms, dark teal boots #1d8f85, hard near-black
outline #0c1119.

Layout: exactly four figures in a single horizontal row, evenly spaced,
left to right: front view, right side view facing right, rear view, three-
quarter front-right view. All four identical in height, all standing on the
same horizontal ground line, all in a relaxed T-adjacent neutral pose with
arms held slightly away from the body so the torso outline stays readable.

Consistency is critical: same proportions, same palette, same eye size and
placement in every view. Rear view shows a plain suit back with a single
horizontal seam, no logo, no backpack, no printed markings.

Lighting: flat neutral frontal illumination with only mild form shading, so
the sheet can be used as modelling reference. Minimise cast shadow.

Master scale: each figure 96 pixels tall, canvas 640 x 160 pixels, fully
transparent background, no ground line drawn. Aspect ratio 4:1.
```

### 2.3 Laufzyklus — Sprite-Sheet

Der Laufzyklus ist das meistgesehene Asset im ganzen Spiel: 60 Figuren gleichzeitig, sie
laufen die ganze Zeit. Der Prototyp benutzt zwei Phasen; produktionsreif sind acht. Der
Prompt fordert ein hartes Raster mit fester Bildanzahl, weil Modelle sonst gern sechs oder
neun Bilder liefern und die Zellen ungleich verteilen.

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Walk-cycle sprite sheet of the Wusel creature: small stocky worker, large
bald sand-skinned head #f4d7ac, one-piece teal suit #2fc9b8, dark teal
boots #1d8f85, near-black outline #0c1119.

Layout: exactly 8 frames in one single horizontal row, one frame per cell,
8 equal cells, no gaps, no borders, no frame numbers, no labels. Strict
side view facing right in every frame. The character's ground line and
horizontal centre must be identical in all 8 cells so the sheet loops
without jitter.

Motion: a stubborn, determined, slightly comical march. Frame 1 contact
pose left foot forward, frame 2 down, frame 3 passing, frame 4 up with a
small vertical body rise, frames 5 to 8 mirror the same motion with the
other leg. Head bobs at most 2 pixels at master scale. Arms swing in mild
opposition to the legs. The creature never looks where it is going.

Lighting identical in all frames: neutral key upper left, cool fill lower
right. No motion blur, no speed lines, no dust — dust is a separate
particle asset.

Master scale: each cell 128 x 128 pixels, figure 96 pixels tall, total
canvas 1024 x 128 pixels. Fully transparent background. Aspect ratio 8:1.
```

### 2.4 Fallen, Landen, Umdrehen

Diese drei Zustände sind Spielinformation, keine Zierde: Der Spieler muss auf einen Blick
sehen, ob eine Figur schon fällt (Schirm nötig!) und ob sie an der Wand umkehrt. Deshalb
sind die Posen bewusst übertrieben.

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Pose sheet of the Wusel creature (bald sand-skinned head #f4d7ac, teal
one-piece suit #2fc9b8, dark teal boots #1d8f85, near-black outline
#0c1119), strict side view facing right.

Layout: exactly 6 frames in one horizontal row, equal cells, no gaps, no
labels, identical ground reference line.

Frame 1 — start of fall: body still upright, arms just beginning to rise,
feet leaving the ground, expression surprised.
Frame 2 — mid fall: body slightly tilted back, both arms straight up above
the head, legs trailing, mouth open in a small round shout, the classic
falling shape with a narrow silhouette.
Frame 3 — long fall: same as frame 2 but arms flailing wider and legs
splayed, so the player can tell a dangerous fall from a short hop.
Frame 4 — soft landing: knees deeply bent, body compressed to roughly two
thirds height, arms out for balance, small squash on the head dome.
Frame 5 — recovery: rising back up, one arm still out, head straightening.
Frame 6 — wall turn: body pressed flat against an implied vertical surface
at the right edge of the cell, one mitten hand touching it, head turned
back over the shoulder to the left, one foot already pivoting.

The difference between frame 2 and frame 3 must survive downscaling to 16
pixels tall — the falling pose is the player's warning signal.

Master scale: cells 128 x 128 pixels, figure 96 pixels tall, canvas
768 x 128 pixels, fully transparent background. Aspect ratio 6:1.
```

### 2.5 Gesichter und Ausdruck

Ein Gesicht auf 12 Pixeln besteht aus zwei bis drei Pixeln. Trotzdem lohnt das Blatt: Es
legt fest, **wie viel Ausdruck überhaupt gebaut wird**, und liefert die Vorlagen für Lupe
(2,5×), Levelabschluss-Bildschirm und Store-Material — dort sieht man das Gesicht wirklich.

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Expression sheet: head and shoulders only of the Wusel creature. Large bald
egg-shaped dome head, warm sand skin #f4d7ac, two large round black dot
eyes set wide and low, tiny mouth line, teal suit collar #2fc9b8 visible at
the bottom edge, hard near-black outline #0c1119. No hair, no eyebrows, no
nose, no ears.

Layout: exactly 8 heads in a 4 by 2 grid, equal cells, no gaps, no labels,
all heads the same size and centred in their cell, all in three-quarter
front view turned slightly right.

Expressions, in reading order:
1 neutral, blank and content, eyes forward
2 cheerful, eyes as upward arcs, small open smile
3 determined at work, eyes narrowed to short horizontal bars, mouth a firm
  straight line
4 alarmed, eyes wide with visible white ring, mouth a small open oval
5 terrified, eyes huge and shaking, mouth a wide open shout
6 dazed after impact, eyes as small spirals, mouth wavy
7 proud and rescued, eyes closed happy arcs, mouth a broad grin, chin up
8 resigned, eyes half-lidded, mouth a flat downward curve

Every expression must be built from at most four distinct shapes so it can
be reduced to a handful of pixels. Test criterion: at 16 pixels tall,
frames 1, 5 and 7 must still be distinguishable from one another.

Master scale: cells 160 x 160 pixels, canvas 640 x 320 pixels, fully
transparent background. Aspect ratio 2:1.
```

---

## 3. Die zehn Berufe

**Das ist der wichtigste Abschnitt der Bibliothek.** GDD §6 formuliert die Regel, die alles
entscheidet: *Jeder Beruf ist an der Silhouette erkennbar, nicht an der Farbe.* Der Grund
steht in §3: 6-Zoll-Display, 60 Figuren, Daumen davor. Dazu kommt Farbfehlsichtigkeit —
rund acht Prozent der männlichen Spieler, und die Zielgruppe ist laut §10 überwiegend 35+
und männlich geprägt. Ein rein farbcodierter Beruf wäre für diese Spieler unsichtbar.

Deshalb hat jeder der folgenden Prompts einen expliziten Absatz **„Silhouette test"**, der
beschreibt, welche schwarze Umrissform der Beruf erzeugt und wovon sie sich unterscheiden
muss. Diesen Absatz nicht kürzen — er ist der eigentliche Auftrag an das Modell.

Die Silhouetten sind so verteilt, dass sich je zwei benachbarte Berufe maximal unterscheiden:

| Beruf | Silhouettenmerkmal | Umriss-Kennung |
|---|---|---|
| Kletterer | Helm mit Stirnlampe, Griffhaken | Kopf wird eckig und höher |
| Schirmspringer | aufgespannter Schirm, 12 px breit | Figur wird doppelt so breit, oben |
| Sprengmeister | Kugelbombe mit Zündschnur, Countdown | runder Klotz vor dem Bauch |
| Blocker | Arme waagerecht ausgestreckt, 12 px | breitestes T im Spiel |
| Brückenbauer | Stufe vor sich, Vorbeuge | Diagonale nach oben rechts |
| Rammer | schwerer Vorschlaghammer waagerecht | Balken auf Bauchhöhe |
| Schrägbagger | Spitzhacke diagonal nach unten | Diagonale nach unten rechts |
| Gräber | breite Schaufel waagerecht unter sich | Balken auf Fußhöhe |
| Magnetiker | Hufeisenmagnet hochgehalten | U-Form über dem Kopf |
| Springer | geduckte Sprungfeder-Hocke | tiefste, kompakteste Form |

### 3.1 Kletterer

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

The Wusel creature in its Climber role. Base design unchanged: bald sand-
skinned head #f4d7ac, one-piece teal suit #2fc9b8, dark teal boots
#1d8f85, near-black outline #0c1119.

Role equipment, all in amber #ffd23f: a hard angular climbing helmet with a
flat front brim and a small round lamp on the forehead, and two short
grappling claws strapped to the mitten hands.

Pose: strict side view facing right, body pressed flat against an implied
vertical wall on the right edge of the frame, one claw hooked high above
the head, the other at chest height, both boots braced against the wall,
knees bent, head tilted up.

Silhouette test: the helmet turns the round head into a squared-off wedge
and adds height, so the climbing figure is taller and more angular than a
walker. Both arms are above shoulder height — no other role does that. The
resulting black shape must be distinguishable from the Jumper and the
Magnetiser at 16 pixels tall.

Lighting: neutral key upper left, cool fill lower right, small warm
specular on the helmet lamp.

Master scale: figure 96 pixels tall inside a 128 x 128 pixel canvas,
transparent background, no wall drawn, no shadow. Aspect ratio 1:1.
```

### 3.2 Schirmspringer

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

The Wusel creature in its Floater role. Base design unchanged: bald sand-
skinned head #f4d7ac, one-piece teal suit #2fc9b8, dark teal boots
#1d8f85, near-black outline #0c1119.

Role equipment: a small open umbrella held above the head in both mitten
hands. The canopy is amber #ffd23f with a darker amber underside, six
visible ribs, a shallow dome shape, a short straight handle and a small
finial on top. Canopy width is exactly twice the body width.

Pose: strict side view facing right, descending slowly, body hanging
straight down beneath the umbrella, both arms raised to the handle, legs
dangling relaxed with toes pointing down, head level and calm.

Silhouette test: the canopy doubles the width of the upper half of the
figure and produces a wide mushroom shape with a narrow stem — the most
top-heavy silhouette in the game. It must never be confused with the
Blocker, whose wide element sits at chest height and has no dome.

Lighting: neutral key upper left, cool fill lower right, thin rim along the
top of the canopy.

Master scale: figure plus umbrella 96 pixels tall inside a 128 x 128 pixel
canvas, transparent background, no shadow. Aspect ratio 1:1.
```

### 3.3 Sprengmeister

Der Sprengmeister ist der einzige Beruf mit **Zeitkomponente** (5-4-3-2-1). Die Silhouette
allein reicht hier nicht — der Countdown muss zusätzlich ablesbar sein. Deshalb fordert der
Prompt ein Sheet mit fünf Zuständen statt eines Einzelbilds.

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Countdown sheet of the Wusel creature in its Bomber role. Base design
unchanged: bald sand-skinned head #f4d7ac, one-piece teal suit #2fc9b8,
dark teal boots #1d8f85, near-black outline #0c1119.

Role equipment: a round cannonball-style bomb in near-black #0c1119 with a
single amber #ffd23f highlight arc, clutched against the belly with both
mitten arms wrapped around it. A short curled fuse rises from the top of
the bomb, burning with a small bright spark.

Layout: exactly 5 frames in one horizontal row, equal cells, same ground
line, strict side view facing right. Frame 1 the fuse is long and the
creature stands calmly. Across frames 2 to 5 the fuse burns shorter, the
spark grows brighter, the creature's stance grows more agitated: shoulders
rise, knees bend, head pulls back, eyes widen. In frame 5 the fuse is a
stub, the spark is a small white flash, the creature is braced and squeezes
its eyes shut. The suit picks up a warm danger tint #ff4d4d from the spark
in frames 4 and 5 only.

Silhouette test: the bomb adds a distinct round bulge at belly height and
the fuse adds a thin curl above the shoulder — together they read as
"carrying something round" at 16 pixels tall. This must not be confused
with the Magnetiser, whose object is held above the head.

Master scale: cells 128 x 128 pixels, figure 96 pixels tall, canvas
640 x 128 pixels, transparent background. Aspect ratio 5:1.
```

### 3.4 Blocker

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

The Wusel creature in its Blocker role. Base design unchanged: bald sand-
skinned head #f4d7ac, one-piece teal suit #2fc9b8, dark teal boots
#1d8f85, near-black outline #0c1119.

Role equipment: two wide rectangular signal paddles in warning orange
#ff7a45 with a thin near-black border, one gripped in each mitten hand, and
a matching orange chest band across the suit.

Pose: strict frontal-facing stance turned slightly toward the viewer while
the feet stay in side-view profile, both arms stretched horizontally
straight out to the left and right at chest height, elbows locked, paddles
vertical at the ends. Legs planted wide and firm, knees straight, head
level, jaw set, eyes narrowed with total conviction. The creature is a
living road block and knows it.

Silhouette test: this is the widest silhouette in the game — total arm span
is twice the height of the head. The resulting black shape is a hard T with
a heavy base. It must be readable as "stop" at 16 pixels tall and must
never be confused with the Floater, whose wide element sits above the head
and is domed rather than straight.

Lighting: neutral key upper left, cool fill lower right, slight warm bounce
from the orange paddles onto the underside of the arms.

Master scale: figure 96 pixels tall inside a 160 x 128 pixel canvas to fit
the arm span, transparent background, no shadow. Aspect ratio 5:4.
```

### 3.5 Brückenbauer

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

The Wusel creature in its Builder role. Base design unchanged: bald sand-
skinned head #f4d7ac, one-piece teal suit #2fc9b8, dark teal boots
#1d8f85, near-black outline #0c1119.

Role equipment: a flat plank step in warm brick brown #b5713f held in both
mitten hands, plus a small amber #ffd23f tool belt around the waist with
two spare planks tucked in it, their ends protruding behind the back.

Pose: strict side view facing right, leaning forward from the hips at about
thirty degrees, both arms extended low and forward, placing the plank at
knee height diagonally upward to the right. Rear leg braced back, front
knee bent, head down watching the work.

Silhouette test: the forward lean plus the extended plank produce a clear
diagonal that rises to the upper right — the exact opposite direction to
the Miner's downward diagonal. The spare planks behind the back add a small
notch to the rear of the silhouette. At 16 pixels tall the figure must read
as "leaning forward, something sticking out ahead and slightly up".

Lighting: neutral key upper left, cool fill lower right, warm bounce from
the brown plank onto the chest.

Master scale: figure 96 pixels tall inside a 144 x 128 pixel canvas,
transparent background, no shadow, no terrain. Aspect ratio 9:8.
```

### 3.6 Rammer

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

The Wusel creature in its Basher role, digging horizontally. Base design
unchanged: bald sand-skinned head #f4d7ac, one-piece teal suit #2fc9b8,
dark teal boots #1d8f85, near-black outline #0c1119.

Role equipment: a heavy sledgehammer with a short amber #ffd23f haft and a
chunky rectangular near-black head, gripped in both mitten hands.

Pose: strict side view facing right, mid-swing, the hammer thrust straight
forward at belly height so its head sits clear of the body outline to the
right. Torso rotated into the blow, rear foot dug in, front knee bent, head
pushed forward, teeth clenched. Small compression squash in the shoulders
to sell the impact.

Silhouette test: the hammer creates a solid horizontal bar at belly height
projecting to the right of the body — a level bar, not a diagonal. This is
the single distinguishing feature against the Miner (bar angled down) and
the Digger (bar low at foot height). At 16 pixels tall the height of that
bar above the ground line is the only readable difference, so keep it
exactly at mid-body height and make it thick.

Lighting: neutral key upper left, cool fill lower right, bright rim on the
top edge of the hammer head.

Master scale: figure 96 pixels tall inside a 160 x 128 pixel canvas,
transparent background, no rubble, no dust. Aspect ratio 5:4.
```

### 3.7 Schrägbagger

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

The Wusel creature in its Miner role, digging diagonally downward. Base
design unchanged: bald sand-skinned head #f4d7ac, one-piece teal suit
#2fc9b8, dark teal boots #1d8f85, near-black outline #0c1119.

Role equipment: a pickaxe with a long amber #ffd23f handle and a curved
near-black double-pointed head, gripped in both mitten hands.

Pose: strict side view facing right, mid-strike, the pickaxe driven
downward and forward at roughly twenty-seven degrees below horizontal — two
units right for every one unit down — so its point reaches toward the lower
right corner of the frame. Body crouched and rotated into the strike, rear
leg extended, front leg bent under the body, head down and forward.

Silhouette test: the pickaxe makes a long clean diagonal running from the
upper left of the body to the lower right, well outside the body outline.
That downward diagonal is the only reliable difference from the Builder,
whose diagonal points upward. Keep the shaft long and unbroken so the angle
survives downscaling to 16 pixels tall.

Lighting: neutral key upper left, cool fill lower right, sharp specular on
the pick point.

Master scale: figure 96 pixels tall inside a 160 x 128 pixel canvas,
transparent background, no debris. Aspect ratio 5:4.
```

### 3.8 Gräber

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

The Wusel creature in its Digger role, digging straight down. Base design
unchanged: bald sand-skinned head #f4d7ac, one-piece teal suit #2fc9b8,
dark teal boots #1d8f85, near-black outline #0c1119.

Role equipment: a broad flat-bladed shovel with a short amber #ffd23f
handle and a wide near-black blade, held in both mitten hands.

Pose: strict side view facing right, legs braced wide apart, torso bent
deeply forward and down, both arms straight down between the legs, the
shovel blade horizontal and pressed against the ground line directly
beneath the body. Head lowered, looking straight down into the hole.

Silhouette test: the shovel forms a wide horizontal bar at the very bottom
of the figure, at foot level, wider than the creature's stance. The overall
shape is a compact hunched block with a broad base — the lowest centre of
mass of any role. At 16 pixels tall the low bar must not be mistaken for
the Basher's bar, which sits at mid-body height.

Lighting: neutral key upper left, cool fill lower right, dark occlusion
under the blade.

Master scale: figure 96 pixels tall inside a 128 x 128 pixel canvas,
transparent background, no soil, no dust. Aspect ratio 1:1.
```

### 3.9 Magnetiker (ab Welt 4)

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

The Wusel creature in its Magnetiser role. Base design unchanged: bald
sand-skinned head #f4d7ac, one-piece teal suit #2fc9b8, dark teal boots
#1d8f85, near-black outline #0c1119.

Role equipment: a large classic horseshoe magnet held overhead in both
mitten hands, the U opening forward to the right. Magnet body amber
#ffd23f, the two pole tips in warning orange #ff7a45. Three short curved
attraction arcs drawn in pale glow #ffd98a spring from the poles.

Pose: strict side view facing right, feet planted, knees slightly bent,
both arms raised straight above the head holding the magnet high, torso
leaning back a little against the pull, chin up, eyes wide with effort.

Silhouette test: the raised horseshoe adds an unmistakable U-shaped notch
above the head — an open shape with a hole in it, which no other role has.
Keep the gap between the two poles at least one third of the magnet width
so the hole survives downscaling to 16 pixels tall. Must not be confused
with the Climber, whose head element is solid and helmet-shaped.

Lighting: neutral key upper left, cool fill lower right, soft warm glow
from the arcs onto the head dome.

Master scale: figure 96 pixels tall inside a 128 x 144 pixel canvas,
transparent background, no shadow. Aspect ratio 8:9.
```

### 3.10 Springer (ab Welt 4)

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Two-frame sheet of the Wusel creature in its Jumper role. Base design
unchanged: bald sand-skinned head #f4d7ac, one-piece teal suit #2fc9b8,
dark teal boots #1d8f85, near-black outline #0c1119.

Role equipment: chunky amber #ffd23f spring-loaded overshoes strapped over
the boots, each with a visible compressed coil at the heel.

Layout: exactly 2 frames in one horizontal row, equal cells, same ground
line, strict side view facing right.
Frame 1 — crouch: knees fully folded, body compressed to about two thirds
normal height, arms swung back behind the hips, head tucked down, coils
fully compressed. The most compact silhouette in the game.
Frame 2 — launch: body fully extended into a stretched arc, both arms
thrown forward and up, rear leg trailing straight back, front knee tucked,
coils extended, head up and forward, eyes wide with delight.

Silhouette test: frame 1 is a low squat lump clearly shorter than a walker;
frame 2 is a long diagonal streak clearly longer than a walker. Both
extremes must be obvious at 16 pixels tall against the standing walk pose.

Master scale: cells 128 x 128 pixels, canvas 256 x 128 pixels, transparent
background. Aspect ratio 2:1.
```

---

## 4. Todesanimationen

GDD §5: *„Sie sterben sichtbar — Sturz, Ertrinken, Feuer, Zerquetschen. Jeder Tod hat eine
eigene Animation. Das darf ruhig ein bisschen wehtun."* Das ist Spaßquelle 3 aus §2
(Empathie): Der Spieler soll sich schuldig fühlen. Ein Tod, der nur ein Verschwinden ist,
liefert das nicht.

Gleichzeitig gilt eine harte Grenze: **kein Blut, keine Körperteile, keine Grausamkeit.**
Der Grund ist nicht Zimperlichkeit, sondern Altersfreigabe — der App Store stuft Blut
sofort hoch, und die Zielgruppe aus §10 spielt das im Zug. Der Schmerz kommt aus
**Komik plus Endgültigkeit**: Die Figur verschwindet mit einem kleinen, hilflosen Ton, und
es bleibt etwas liegen. Das trifft härter als Rot.

Alle Todes-Sheets sind **8 Bilder**, damit sie zur Zustandsdauer von 26 Ticks passen
(`DYING_TICKS`) — rund 0,43 Sekunden, also etwa 3 Ticks pro Bild.

### 4.1 Sturz — Aufprall

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Death animation sheet: impact after a long fall, for the Wusel creature
(bald sand-skinned head #f4d7ac, teal suit #2fc9b8, dark teal boots
#1d8f85, near-black outline #0c1119).

Layout: exactly 8 frames in one horizontal row, equal cells, identical
ground line, strict side view facing right.

Frame 1 — falling fast, arms straight up, legs trailing, mouth open in a
shout, body stretched vertically.
Frame 2 — contact, head-first compression, the head dome squashed to two
thirds width, legs still up in the air.
Frame 3 — maximum squash, the whole creature flattened to about a quarter
of its height and spread wider than normal, a single puff ring of pale dust
around the base.
Frame 4 — a few small teal fragments and one amber equipment piece bounce
outward and up.
Frame 5 to 7 — the flattened shape settles, fragments fall back down,
outline softens, colours desaturate toward the outline tone.
Frame 8 — only a small pale dust cloud and one motionless teal scrap remain
on the ground.

No blood, no gore, no red fluid, no detached limbs. The impact is conveyed
purely through squash, dust and the abrupt stillness afterwards.

Master scale: cells 128 x 128 pixels, canvas 1024 x 128 pixels, transparent
background. Aspect ratio 8:1.
```

### 4.2 Ertrinken

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Death animation sheet: drowning, for the Wusel creature (bald sand-skinned
head #f4d7ac, teal suit #2fc9b8, dark teal boots #1d8f85, near-black
outline #0c1119).

Layout: exactly 8 frames in one horizontal row, equal cells, strict side
view facing right, a horizontal water surface line at the vertical middle
of every cell drawn as a two-pixel band of pale cyan #9fd8ff.

Frame 1 — the creature stands at the edge, one foot already over the line.
Frame 2 — it breaks the surface, a small crown-shaped splash of cyan
droplets, arms flung up.
Frame 3 — head still above water, mouth wide open, arms slapping the
surface, ripple rings spreading.
Frame 4 — head level with the surface, eyes squeezed shut, one mitten hand
reaching up.
Frame 5 — only the hand and the top of the head remain visible, three
bubbles rising.
Frame 6 — fully submerged, the silhouette visible but darkened and tinted
cool blue, sinking, four bubbles.
Frame 7 — a faint dark shape far below the surface, two bubbles.
Frame 8 — only the water surface and one last bubble bursting.

The horror is quiet: no thrashing violence, no blood, just the small hand
disappearing. Below the surface the figure must be visibly tinted and
darkened so the player reads "gone" instantly.

Master scale: cells 128 x 128 pixels, canvas 1024 x 128 pixels, transparent
background above and below the water band. Aspect ratio 8:1.
```

### 4.3 Feuer

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Death animation sheet: incineration, for the Wusel creature (bald sand-
skinned head #f4d7ac, teal suit #2fc9b8, dark teal boots #1d8f85, near-
black outline #0c1119).

Layout: exactly 8 frames in one horizontal row, equal cells, identical
ground line, strict side view facing right.

Frame 1 — the creature walks into an implied heat source from the right,
recoiling, arms raised to shield the face.
Frame 2 — ignition, a bright warm flash #ffd23f washes over the silhouette,
suit colour pushed toward orange #ff7a45.
Frame 3 — fully alight, flames rising from head and shoulders, the creature
running on the spot with arms flailing, eyes wide.
Frame 4 — the body reads as a hot silhouette: interior filled with bright
warm gradient from #ff4d4d at the base to #ffd23f at the tips, outline
still hard.
Frame 5 — the silhouette begins to break up from the feet upward into
glowing embers.
Frame 6 — half the body gone, embers drifting up, a dark ash column
forming.
Frame 7 — only the head dome remains, glowing, tipping backward.
Frame 8 — a small heap of grey ash and three fading orange embers.

No blood, no charred flesh detail, no screaming face close-up. The
transition from teal to burning silhouette must be readable at 16 pixels
tall as "that one is on fire".

Master scale: cells 128 x 128 pixels, canvas 1024 x 128 pixels, transparent
background. Aspect ratio 8:1.
```

### 4.4 Zerquetschen

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Death animation sheet: crushed by a descending press, for the Wusel
creature (bald sand-skinned head #f4d7ac, teal suit #2fc9b8, dark teal
boots #1d8f85, near-black outline #0c1119).

Layout: exactly 8 frames in one horizontal row, equal cells, identical
ground line, strict side view facing right. A heavy flat steel plate
#8b96a6 enters from the top of the cell.

Frame 1 — the creature stands beneath the raised plate, looking up, eyes
wide.
Frame 2 — the plate drops to shoulder height, the creature ducks, knees
bending.
Frame 3 — contact, the head dome compressed, shoulders folded, arms shooting
out sideways.
Frame 4 — body squashed to half height, arms and legs splayed straight out
horizontally, mouth a flat line.
Frame 5 — plate fully down, the creature compressed to a thin teal band no
taller than a quarter of its original height, spread wider than the plate
edge, a small puff of dust squirting out from both sides.
Frame 6 — the plate begins to rise, the flat teal shape sticks to the
ground.
Frame 7 — plate half raised, the flattened shape desaturating.
Frame 8 — plate gone, only a flat teal smear and a small dust puff remain.

No blood, no red splatter, no gore. The comedy of the flattening carries the
weight; the stillness in frames 7 and 8 carries the guilt.

Master scale: cells 128 x 128 pixels, canvas 1024 x 128 pixels, transparent
background. Aspect ratio 8:1.
```

### 4.5 Sprengung und Selbstzerstörung

Dieser Tod ist ein Sonderfall: Er ist **freiwillig** und wird bei der Selbstzerstörung
(GDD §4) sechzigfach gleichzeitig ausgelöst. Er muss deshalb auch dann noch lesbar sein,
wenn er über den halben Bildschirm verteilt gleichzeitig läuft.

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Death animation sheet: self-detonation, for the Wusel creature (bald sand-
skinned head #f4d7ac, teal suit #2fc9b8, dark teal boots #1d8f85, near-
black outline #0c1119) holding a round black bomb.

Layout: exactly 8 frames in one horizontal row, equal cells, identical
ground line, strict side view facing right, the explosion centred on the
creature's belly.

Frame 1 — braced, eyes shut, bomb fuse a burning stub, whole figure tinted
warm.
Frame 2 — a small white core flash, only 8 pixels across, the silhouette
still fully visible in front of it.
Frame 3 — the flash expands to swallow the figure, pure white centre, thin
amber #ffd23f ring.
Frame 4 — full blast: a ragged circular fireball, white core, amber middle,
orange #ff7a45 outer edge, roughly 112 master pixels across, matching a
14-pixel logical blast radius.
Frame 5 — the fireball breaks into tumbling chunks, a grey smoke ball rises
from the centre, six dark debris shards fly outward.
Frame 6 — smoke dominates, fire reduced to embers at the base, debris
arcing down.
Frame 7 — a dark grey smoke column drifting up, faint warm underlight.
Frame 8 — thin dissipating smoke, a small scorch smear on the ground.

No body parts, no blood. The creature simply is not there any more from
frame 4 onward.

Master scale: cells 160 x 160 pixels, canvas 1280 x 160 pixels, transparent
background. Aspect ratio 8:1.
```

---

## 5. Terrain-Materialien

Terrain ist in Wuselwerk **kein Dekor, sondern Spielregel**. GDD §5 verlangt pixelgenaue
Zerstörung ohne Kachelraster; GDD §11 speichert dazu einen Materialkanal (`MAT.EARTH`,
`ROCK`, `STEEL`, `BRICK`). Der Spieler muss aus der Textur allein ableiten können, ob er
hier graben kann.

Drei Regeln, die in allen Materialprompts stecken:

1. **Stahl muss sofort „hier ist Schluss" sagen** — kalt, glatt, genietet, industriell,
   maximal fremd gegenüber allem Organischen. Wer erst durch Ausprobieren merkt, dass es
   Stahl ist, hat 10 Sekunden verloren.
2. **Frisch Gegrabenes ist heller** (`freshBoost = +30`). Das ist GDD §6 wörtlich: *„man
   sieht seine eigene Arbeit."* Deshalb braucht jedes Material eine helle Variante.
3. **Kachelbar ohne sichtbares Raster.** Die Textur wird über eine freiformige Maske
   gelegt; ein erkennbarer Wiederholungsrhythmus zerstört die Illusion des
   Handgegrabenen sofort.

### 5.1 Erde

```
[PREPEND STYLE BLOCK B]
[APPEND PALETTE LOCK]

Seamless tileable texture: soft diggable soil for a side-scrolling game
with pixel-destructible terrain. Base colour #6b4a2e, with darker pockets
toward #4a3320 and lighter grains toward #8a6236.

Content: densely packed granular earth, small embedded pebbles, a few
short root threads, occasional tiny stones. Structure is irregular and
organic with no visible rows, no repeating clumps, no directional streaks.
The texture must read as "I can dig through this" at a glance: loose,
crumbly, soft-edged, never crystalline and never metallic.

Lighting: flat and even, no baked directional shadow, no highlight hotspot
— the engine adds dynamic light on top.

Perfectly seamless on all four edges. Rendered as pixel art on a strict
square pixel grid, roughly 24 colours, with mild ordered dithering in the
tonal transitions.

Master scale: 512 x 512 pixels, representing 64 by 64 logical game pixels
at 8x. Opaque, fills the whole canvas, no border, no frame, no label.
Aspect ratio 1:1.
```

### 5.2 Fels

```
[PREPEND STYLE BLOCK B]
[APPEND PALETTE LOCK]

Seamless tileable texture: hard but diggable rock for a side-scrolling game
with pixel-destructible terrain. Base colour #565d6b, with darker crevices
toward #3b414d and lighter facets toward #6f7787.

Content: interlocking angular stone facets of varying size, sharp
crystalline fracture planes, thin dark cracks running between blocks, a
sparse scatter of fine mineral speckles. Clearly harder and more angular
than soil, but still fractured and workable — it must read as "slow going
but possible", not as impenetrable.

Lighting: flat and even, no baked directional shadow. Facet variation is
expressed through value steps in the base texture, not through a light
direction.

Perfectly seamless on all four edges, with no visible repeating motif and
no diagonal banding. Pixel art on a strict square pixel grid, roughly 20
colours, hard-edged facets, no soft gradients.

Master scale: 512 x 512 pixels, representing 64 by 64 logical game pixels
at 8x. Opaque, fills the whole canvas. Aspect ratio 1:1.
```

### 5.3 Stahl — unzerstörbar

Der Prototyp zeichnet Stahl als **4-Pixel-Schachbrett mit einer Niete alle 8 Pixel**
(`terrainView.ts`). Der Prompt übernimmt das exakt, damit die generierte Textur zum
laufenden Renderer passt und man beides mischen kann.

```
[PREPEND STYLE BLOCK B]
[APPEND PALETTE LOCK]

Seamless tileable texture: indestructible industrial steel plating for a
side-scrolling game. Base colour #8b96a6, darker recesses toward #656f7d,
bright bevel highlights toward #b9c3d0.

Content: heavy riveted armour plate. A regular grid of round dome-head
rivets spaced exactly every 64 pixels of this master texture, each rivet
with a bright top-left bevel and a dark bottom-right recess. Between the
rivets a subtle two-tone checker of 32-pixel squares alternating one step
lighter and one step darker, plus faint brushed-metal striations and a few
small dents and scratches.

Read intent, the most important requirement: this material must
communicate "you cannot dig here, stop" instantly and from a distance. It
is cold, hard, machined, perfectly regular and utterly unlike any organic
material in the game. Sharp bevels, no crumbling, no cracks, no dirt
build-up softening the edges.

Lighting: flat and even overall, with the bevel structure providing all
form. No baked scene shadow.

Perfectly seamless on all four edges, rivet grid continuing across the
seam. Pixel art on a strict square pixel grid, roughly 16 colours.

Master scale: 512 x 512 pixels, representing 64 by 64 logical game pixels
at 8x, rivets every 8 logical pixels. Opaque, fills the whole canvas.
Aspect ratio 1:1.
```

### 5.4 Gebaute Brückenstufe

Die Brückenstufe ist das einzige Material, das der **Spieler selbst erzeugt**. Sie muss
sich deshalb sichtbar von allem Gewachsenen absetzen — man soll den eigenen Weg im Level
auf einen Blick nachverfolgen können. 6 logische Pixel Länge je Stufe, 12 Stufen.

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Asset sheet: player-built bridge steps for a side-scrolling puzzle game.
Warm brick brown #b5713f, darker underside #8a5530, lighter top surface
#c98a52, hard near-black outline #0c1119.

Layout: exactly 4 items in one horizontal row, equal cells, transparent
background.
Item 1 — a single plank step seen from the strict side: a flat rectangle 48
pixels wide and 12 pixels tall at master scale, with a visible plank grain,
two small nail heads, a chipped front edge and a slightly darker underside.
Item 2 — a run of three such steps stacked in an ascending diagonal
staircase, each step offset one step right and one step up, ends
overlapping so the run reads as a continuous ramp.
Item 3 — the same run seen with the topmost step half-built: the far end
thinner and ragged, as if just placed.
Item 4 — a broken step: cracked in the middle, one splinter falling away.

The material must read as clearly manufactured and clearly not natural: a
straight machined edge, an even thickness, a visible repeating seam every
48 master pixels. It has to stand out against both soil and rock at 16
pixels tall.

Lighting: neutral key upper left, cool fill lower right, subtle warm bounce
under the overhang.

Master scale: canvas 768 x 192 pixels, transparent background, no shadow.
Aspect ratio 4:1.
```

### 5.5 Bruchkanten — frisch gegen alt

Der wichtigste Materialprompt des Abschnitts. Er liefert nicht eine Textur, sondern die
**Regel**, wie eine gegrabene Kante aussieht: hell, scharf, körnig, mit hellem Saum. Diese
Regel steckt in `terrainView.ts` (`freshBoost = +30`) und macht laut GDD §6 die eigene
Arbeit sichtbar.

```
[PREPEND STYLE BLOCK B]
[APPEND PALETTE LOCK]

Comparison study sheet: freshly excavated versus long-settled terrain
edges, for a side-scrolling game with pixel-destructible terrain.

Layout: exactly 4 panels in a 2 by 2 grid, equal cells, hairline separator
between panels, no labels, no text.

Panel top left — an old undisturbed soil edge in #6b4a2e: the top surface
carries a 6-pixel band of grass crust #4f8f3c, the exposed face is
weathered, slightly darker toward the bottom, edges softened by settling
and small debris piles at the foot.

Panel top right — the same soil, freshly dug: the cut face is one clear
brightness step lighter than the old face, roughly a plus-30 lift on each
channel, the grain reads coarser and sharper, the cut edge is crisp and
irregular like a tunnel bored by hand, no grass crust anywhere on the cut,
a few loose crumbs still falling, a thin bright rim along the topmost cut
line where light catches the raw material.

Panel bottom left — an old rock edge in #565d6b: rounded fracture faces,
dark seated crevices, a dulled surface.

Panel bottom right — the same rock, freshly broken: bright sharp
crystalline fracture faces one step lighter, clean angular chips, a
scattering of fine dust, distinctly brighter and more contrasted than the
weathered panel.

The single point of the sheet: the fresh cut must be unmistakably brighter
and sharper than the old material, so a player can see at a glance where
work has already been done.

Master scale: canvas 1024 x 1024 pixels. Aspect ratio 1:1.
```

---

## 6. Die sechs Welten

GDD §6 gibt jeder Welt ein eigenes Materialgesetz. Für die Grafik heißt das: Die Welt muss
ihre Regel **zeigen**, bevor der Spieler sie erlebt. Rutschiges Eis muss glänzen, steigende
Lava muss von unten leuchten, Stahl der Fabrik muss überall präsent sein.

Jede Welt bekommt zwei Prompts:

- **A — Materialtafel:** vier Materialien der Welt nebeneinander, für Terrain und
  Farbabstimmung.
- **B — Parallax:** die Hintergrundebenen. Wichtig ist die **getrennte Anforderung** der
  Ebenen im selben Bild (als Streifen untereinander), denn Modelle liefern sonst eine
  fertig komponierte Szene, die man nicht mehr in Ebenen zerlegen kann. Man erzeugt
  also ein Blatt mit vier Streifen und schneidet sie auseinander.

Für Grasland und Kristallhöhle sind die exakten Prototyp-Farben eingesetzt; die vier
weiteren Welten haben noch keine Palette im Code — dort schlagen die Prompts eine vor, die
zur bestehenden Logik (dunkler Himmel oben, hellerer Horizont, drei Hügelebenen mit
steigender Helligkeit) passt. Diese vier Paletten müssen später in `palette.ts` nachgezogen
werden.

### 6.1 Grasland — Material

```
[PREPEND STYLE BLOCK B]
[APPEND PALETTE LOCK]

Material board for the world "Grassland", the tutorial world of a side-
scrolling puzzle game: soft, everything diggable, friendly.

Layout: exactly 4 seamless material swatches in one horizontal row, equal
cells, thin hairline separators, no text, no labels.
Swatch 1 — topsoil with grass crust: body #6b4a2e, the upper 8 pixels a
lush grass layer #4f8f3c with a few individual blades breaking the line,
small roots hanging into the soil below.
Swatch 2 — deep soil: #6b4a2e with pebbles, darker toward the bottom,
crumbly and loose.
Swatch 3 — grey bedrock: #565d6b, angular facets, thin cracks, harder than
soil but still workable.
Swatch 4 — riveted steel plate: #8b96a6, dome rivets every 64 master
pixels, cold and machined, unmistakably indestructible.

Warm midday mood, gentle and inviting, the friendliest world in the game.

Master scale: canvas 2048 x 512 pixels, each swatch 512 x 512. Opaque.
Aspect ratio 4:1.
```

### 6.2 Grasland — Parallax

```
[PREPEND STYLE BLOCK B]

Parallax background layer sheet for the world "Grassland" of a side-
scrolling puzzle game. Strictly orthographic side view, no perspective
convergence.

Layout: exactly 4 horizontal bands stacked vertically in one image, equal
height, thin hairline separator between bands, no text, no labels. Each
band is one complete standalone layer, horizontally tileable, and must
contain nothing from the other layers.

Band 1, sky: a smooth vertical gradient from deep night blue #101c33 at the
top to dusty warm horizon blue #3d5f7d at the bottom, with ordered
dithering in the transition and a scatter of tiny pale stars in the upper
third. Nothing else.

Band 2, far hills: soft rolling hill silhouettes in flat #1b2f42, low
amplitude, no detail, heavy atmospheric haze, slight blur, tiny distant
tree shapes on the ridge line reduced to a bumpy edge.

Band 3, mid hills: larger rolling hills in flat #24415a with a hint of
internal value break, a few recognisable tree clusters and one small
distant windmill silhouette on the horizon, mild haze.

Band 4, near hills: the closest and largest hill shapes in flat #2f5570,
crisp silhouette edge, individual tree shapes and tall grass tufts along
the top edge, no haze, darkest and most saturated of the three hill layers.

Layers 2 to 4 have fully transparent skies so they can be composited over
band 1. Value separation between the three hill layers must be clearly
readable in greyscale.

Master scale: canvas 2048 x 2304 pixels, each band 2048 x 576. Aspect ratio
8:9.
```

### 6.3 Kristallhöhle — Material

```
[PREPEND STYLE BLOCK B]
[APPEND PALETTE LOCK]

Material board for the world "Crystal Cave" of a side-scrolling puzzle
game: glowing stone, deep darkness, limited sight radius.

Layout: exactly 4 seamless material swatches in one horizontal row, equal
cells, thin hairline separators, no text.
Swatch 1 — cave soil: #3e4a72, damp, fine-grained, cool-toned, with a
scatter of tiny embedded glinting mineral flecks.
Swatch 2 — luminous crust: #6f8ad6, the surface layer that glows faintly
from within, with a soft cyan #9fd8ff bloom along its upper edge and thin
glowing veins running down into the darker material.
Swatch 3 — cave rock: #35405f, dark angular facets, deep shadowed crevices,
sparse violet #a06be0 crystal shards growing out of the fractures.
Swatch 4 — riveted steel plate: #8b96a6, dome rivets every 64 master
pixels, cold and machined, reflecting a little cyan glow on its upper
bevels.

Overall mood: dark, cold, quietly beautiful, lit only by the material
itself.

Master scale: canvas 2048 x 512 pixels, each swatch 512 x 512. Opaque.
Aspect ratio 4:1.
```

### 6.4 Kristallhöhle — Parallax

```
[PREPEND STYLE BLOCK B]

Parallax background layer sheet for the world "Crystal Cave" of a side-
scrolling puzzle game. Strictly orthographic side view, no perspective
convergence.

Layout: exactly 4 horizontal bands stacked vertically, equal height, thin
hairline separator, no text. Each band is one standalone horizontally
tileable layer containing nothing from the others.

Band 1, void: a vertical gradient from near-black #0a0f22 at the top to
deep blue #1d2b52 at the bottom, dithered, with a few extremely faint
distant glimmers. Nothing else.

Band 2, far cavern: enormous distant stalactite and stalagmite silhouettes
in flat #121a33, very low contrast, heavy blue haze, blurred, with three or
four faint cyan #9fd8ff glow spots suggesting crystal clusters far away.

Band 3, mid cavern: a cave wall of angular rock shelves in flat #1a2544,
clusters of violet #a06be0 crystals growing from the shelves, each cluster
casting a soft local glow onto the surrounding rock, mild haze.

Band 4, near cavern: the closest rock ledges and hanging formations in flat
#243158, crisp silhouette, large foreground crystals with bright cyan cores
and visible internal facets, small floating dust motes catching the light,
no haze.

Layers 2 to 4 have fully transparent backgrounds. The glow must come from
discrete crystal sources, not from a global ambient wash — the darkness
between them is the point.

Master scale: canvas 2048 x 2304 pixels, each band 2048 x 576. Aspect ratio
8:9.
```

### 6.5 Ewiges Eis — Material

```
[PREPEND STYLE BLOCK B]

Material board for the world "Eternal Ice" of a side-scrolling puzzle game:
slippery ground, creatures slide onward instead of stopping.

Layout: exactly 4 seamless material swatches in one horizontal row, equal
cells, thin hairline separators, no text.
Swatch 1 — packed snow: base #cfe0ef with cool shadow pockets #8fa8c4,
soft granular surface, small wind ripples, a bright rim along the top edge.
Swatch 2 — slick blue ice, the signature slippery material: base #6fb6d8
with deep cores #2f6f96 and near-white specular streaks #e8f6ff, visible
internal fracture planes, trapped air bubbles, and a mirror-bright
horizontal sheen band across the surface. This swatch must scream
"frictionless" — high specular contrast, long clean highlight streaks,
glassy rather than granular.
Swatch 3 — frozen bedrock: #4a5a6b stone with a thin rime coating #b9d4e4
in the crevices, harder and duller than the ice.
Swatch 4 — riveted steel plate: #8b96a6, dome rivets every 64 master
pixels, with frost crusting in the recesses.

The visual difference between swatch 1 (walkable snow) and swatch 2
(slippery ice) is a gameplay rule and must be obvious at a glance and in
greyscale.

Master scale: canvas 2048 x 512 pixels, each swatch 512 x 512. Opaque.
Aspect ratio 4:1.
```

### 6.6 Ewiges Eis — Parallax

```
[PREPEND STYLE BLOCK B]

Parallax background layer sheet for the world "Eternal Ice" of a side-
scrolling puzzle game. Strictly orthographic side view, no perspective
convergence.

Layout: exactly 4 horizontal bands stacked vertically, equal height, thin
hairline separator, no text. Each band is one standalone horizontally
tileable layer.

Band 1, sky: vertical gradient from cold deep blue #16233d at the top to
pale glacial white-blue #a9c6dc at the bottom, dithered, with a faint
aurora ribbon in muted teal #4fd18b low in the upper third.

Band 2, far peaks: distant jagged mountain silhouettes in flat #35506e,
snow caps suggested only by a lighter top edge, very heavy haze, blurred,
lowest contrast in the sheet.

Band 3, mid glacier: a wall of stepped glacier terraces and ice cliffs in
flat #4a6c8d with faint cyan crevasse lines, wind-blown snow drifting
horizontally as fine dithered streaks, moderate haze.

Band 4, near ice: the closest ice formations in flat #5f83a6, crisp
silhouette, large hanging icicles along the top edge, bright specular
glints on the closest faces, drifting snow particles, no haze.

Layers 2 to 4 have fully transparent skies. Keep the whole sheet cold: no
warm hues anywhere except the faint aurora.

Master scale: canvas 2048 x 2304 pixels, each band 2048 x 576. Aspect ratio
8:9.
```

### 6.7 Zahnradfabrik — Material

```
[PREPEND STYLE BLOCK B]
[APPEND PALETTE LOCK]

Material board for the world "Gearworks", the industrial world of a side-
scrolling puzzle game: presses, conveyor belts, a great deal of
indestructible steel.

Layout: exactly 4 seamless material swatches in one horizontal row, equal
cells, thin hairline separators, no text.
Swatch 1 — riveted structural steel, the dominant material of this world:
#8b96a6 with dome rivets every 64 master pixels, a 32-pixel two-tone
checker of plates, bevelled seams, a few dents and oil streaks. Cold,
machined, absolutely impenetrable.
Swatch 2 — rusted iron, diggable: base #8a5a3a with corroded pits toward
#5e3a24 and flaking scale toward #b5713f, crumbling edges. It must read as
"this one gives way" in direct contrast to swatch 1 — rougher, warmer,
visibly decayed.
Swatch 3 — compacted machine grit: #4a4740, a dark oily mix of soot, iron
filings and grease, soft and diggable.
Swatch 4 — grated walkway plate: #6d7683 with a regular diamond-mesh
pattern and darker voids between the bars, semi-transparent voids showing
black behind.

Warning-stripe accent allowed as a small detail: diagonal amber #ffd23f and
near-black hazard stripes on one plate edge in swatch 1.

Master scale: canvas 2048 x 512 pixels, each swatch 512 x 512. Opaque.
Aspect ratio 4:1.
```

### 6.8 Zahnradfabrik — Parallax

```
[PREPEND STYLE BLOCK B]

Parallax background layer sheet for the world "Gearworks" of a side-
scrolling puzzle game. Strictly orthographic side view, no perspective
convergence.

Layout: exactly 4 horizontal bands stacked vertically, equal height, thin
hairline separator, no text. Each band is one standalone horizontally
tileable layer.

Band 1, hall interior: vertical gradient from soot black #14161c at the top
to warm furnace amber #6b4a2e at the bottom, dithered, with faint dust
haze.

Band 2, far machinery: enormous distant gear wheels, boilers and pipe runs
reduced to flat silhouettes in #262b36, extremely low contrast, heavy dusty
haze, blurred. Gears large enough that only a segment of each fits the
band.

Band 3, mid machinery: a wall of interlocking gears, drive belts, pressure
gauges and riveted tanks in flat #343b49, a few small amber #ffd23f
indicator lights and one row of warning stripes, moderate haze, faint
steam wisps.

Band 4, near machinery: the closest pipes, chains, hanging hooks and gear
teeth in flat #454e5f, crisp silhouettes, visible rivet detail, a dripping
oil highlight, no haze, darkest and most detailed layer.

Layers 2 to 4 have fully transparent backgrounds. Every layer must feel
mechanical, regular and man-made — straight lines and circles only, no
organic shapes anywhere.

Master scale: canvas 2048 x 2304 pixels, each band 2048 x 576. Aspect ratio
8:9.
```

### 6.9 Vulkanschlund — Material

```
[PREPEND STYLE BLOCK B]

Material board for the world "Volcano Throat" of a side-scrolling puzzle
game: lava rises slowly from below, constant time pressure.

Layout: exactly 4 seamless material swatches in one horizontal row, equal
cells, thin hairline separators, no text.
Swatch 1 — cooled basalt, diggable: #3a3436 with darker vesicle pits
#221e20 and a fine ash dusting, brittle and crumbly.
Swatch 2 — heat-cracked crust: #4a3a34 shot through with a network of
glowing cracks from deep red #8a2b1e to bright orange #ff7a45, the glow
strongest at the crack centres and falling off within a few pixels. The
material must look like it is being heated from behind.
Swatch 3 — obsidian rock: #221c24, glassy conchoidal fracture, sharp
bright specular edges, harder and darker than basalt.
Swatch 4 — riveted steel plate: #8b96a6, dome rivets every 64 master
pixels, discoloured by heat with a blue-violet temper gradient along one
edge.

Master scale: canvas 2048 x 512 pixels, each swatch 512 x 512. Opaque.
Aspect ratio 4:1.
```

### 6.10 Vulkanschlund — Parallax

Der einzige Parallax der Bibliothek, dessen Licht **von unten** kommt. Das ist kein
Stilspiel, sondern Spielinformation: Die Lava steigt, und der Spieler soll das im
Augenwinkel spüren, bevor sie im Bild ist.

```
[PREPEND STYLE BLOCK B]

Parallax background layer sheet for the world "Volcano Throat" of a side-
scrolling puzzle game. Strictly orthographic side view, no perspective
convergence.

Layout: exactly 4 horizontal bands stacked vertically, equal height, thin
hairline separator, no text. Each band is one standalone horizontally
tileable layer.

Band 1, backdrop: vertical gradient from near-black smoke #120d10 at the
top to hot ember orange #8a3a1c at the bottom, dithered, with drifting ash
particles. All light in this world comes from below.

Band 2, far caldera: distant volcanic cliff silhouettes in flat #2b1e22,
underlit along their lower edges with a dim red rim, very heavy smoke haze,
blurred, a faint glow pool at the bottom of the band.

Band 3, mid caldera: closer basalt columns and collapsed ledges in flat
#3a2830, underlit with a stronger orange rim along every bottom edge, two
lava falls pouring down as bright vertical streaks, moderate haze, rising
heat shimmer suggested by a wavy dithered band.

Band 4, near rock: the closest basalt outcrops and hanging stone in flat
#4a3038, crisp silhouettes, strong orange underlighting on all bottom-
facing surfaces, glowing crack lines, floating embers rising upward, no
haze.

Layers 2 to 4 have fully transparent backgrounds. Critical: the key light
is from below in every layer, so all rim highlights sit on downward-facing
edges and all shadows sit on top surfaces — the reverse of every other
world.

Master scale: canvas 2048 x 2304 pixels, each band 2048 x 576. Aspect ratio
8:9.
```

### 6.11 Wolkenwerft — Material

```
[PREPEND STYLE BLOCK B]
[APPEND PALETTE LOCK]

Material board for the world "Cloud Yard" of a side-scrolling puzzle game:
very little ground, a great deal of falling, the umbrella is king.

Layout: exactly 4 seamless material swatches in one horizontal row, equal
cells, thin hairline separators, no text.
Swatch 1 — weathered airship decking, diggable: warm plank wood #b5713f
with #8a5530 seams every 48 master pixels, brass nail heads in amber
#ffd23f, worn and sun-bleached along the grain.
Swatch 2 — floating chalk stone, diggable: pale #cfc4ae with soft #9a8d78
pockets, light and porous, crumbling at the edges, a few tufts of pale
grass on top.
Swatch 3 — brass framework: #c9a24f with dark #7d6224 recesses, riveted
struts and turnbuckles, warm and ornate but not indestructible.
Swatch 4 — riveted steel plate: #8b96a6, dome rivets every 64 master
pixels, the only impenetrable material here, with a few taut rigging cables
anchored to it.

Bright high-altitude daylight mood, high key, airy, the lightest and most
open world in the game.

Master scale: canvas 2048 x 512 pixels, each swatch 512 x 512. Opaque.
Aspect ratio 4:1.
```

### 6.12 Wolkenwerft — Parallax

```
[PREPEND STYLE BLOCK B]

Parallax background layer sheet for the world "Cloud Yard" of a side-
scrolling puzzle game. Strictly orthographic side view, no perspective
convergence.

Layout: exactly 4 horizontal bands stacked vertically, equal height, thin
hairline separator, no text. Each band is one standalone horizontally
tileable layer.

Band 1, high sky: vertical gradient from deep zenith blue #2c4f86 at the
top to pale hazy horizon cream #dfe6ea at the bottom, dithered, with a
small bright sun disc and faint high cirrus streaks.

Band 2, far clouds: vast distant cumulus banks in flat #b9cadd, extremely
soft silhouettes, heavy haze, blurred, lowest contrast in the sheet, with
one tiny far-off airship silhouette.

Band 3, mid cloud yard: floating rock islands with trailing chains and
small windmill platforms in flat #8fa4bd, cloud banks weaving between them,
two moored airship hulls, moderate haze, thin rope bridges spanning gaps.

Band 4, near structures: the closest floating dock timbers, hanging chains,
mooring masts and torn banners in flat #6d829e, crisp silhouettes, visible
plank and rivet detail, a few loose feathers drifting, no haze.

Layers 2 to 4 have fully transparent skies. The whole sheet must
communicate height and emptiness: large vertical gaps between elements,
nothing continuous to stand on, plenty of open air.

Master scale: canvas 2048 x 2304 pixels, each band 2048 x 576. Aspect ratio
8:9.
```

---

## 7. Objekte, Türen und Fallen

Falltür und Ausgang sind die beiden **Fixpunkte jedes Levels** (GDD §5). Der Ausgang muss
laut `scene.ts` sogar durch Gestein hindurch leuchten — sonst findet ihn auf 6 Zoll
niemand. Die vier Fallen aus §5 sind bewusst „unfair aussehend": Sie sollen aus der
Entfernung als Gefahr lesbar sein, aber der Spieler soll sie trotzdem übersehen, wenn er
in Panik ist. Das ist der Unterschied zwischen fairer und billiger Falle.

### 7.1 Falltür (Einstieg)

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Two-state asset: the entrance hatch of a level, the hanging trapdoor the
creatures drop out of. Strict side view, hanging in mid-air with no support
structure below.

Design: a heavy riveted steel box #8b96a6 with darker recesses #656f7d and
bright bevels #b9c3d0, wider than tall, with two thick chains rising from
its top corners out of the top of the frame. A bright amber #ffd23f warning
light sits on the top face. Two hinged doors form the underside.

Layout: exactly 2 frames in one horizontal row, equal cells.
Frame 1 — closed: the underside doors flush and shut, a dark seam between
them, the amber light dim.
Frame 2 — open: both doors swung down and outward at about seventy degrees,
revealing a pure black opening #0b0d12 in the middle, the amber light lit
bright with a small warm glow spill onto the door edges, a few dust motes
falling from the opening.

The object must read as an industrial hopper releasing something, not as a
door in a wall.

Master scale: each cell 320 x 160 pixels, object 272 pixels wide and 96
pixels tall, representing a 34 by 12 logical pixel hatch at 8x. Canvas
640 x 160 pixels, fully transparent background. Aspect ratio 4:1.
```

### 7.2 Ausgangstür

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

The level exit: a glowing doorway that the creatures walk into to be saved.
Strict side view, standing on an implied ground line.

Design: a dark stone or metal portal frame #1a1208, roughly as wide as it
is tall, with a slightly arched top. The interior is filled with warm light
in three concentric steps: an outer body of glow amber #ffd98a, a brighter
inner field, and a near-white core #fff6dd at the centre. A soft radial
warm halo extends well beyond the frame in all directions and fades to
nothing. Two small amber lamps sit on the upper corners of the frame.

Layout: exactly 3 frames in one horizontal row, equal cells, showing one
gentle pulse: frame 1 dim, frame 2 medium, frame 3 bright with the halo at
its largest and a few rising light motes.

Critical requirement: this object is the only thing in a level that stays
visible through solid terrain, so the halo must be strong, warm, perfectly
radially symmetric and clearly distinguishable from every other light
source in the game. It must be identifiable at 16 pixels tall as "the goal".

Master scale: each cell 384 x 384 pixels, the frame itself 256 pixels wide
and 208 pixels tall, representing a 32 by 26 logical pixel exit at 8x.
Canvas 1152 x 384 pixels, fully transparent background. Aspect ratio 3:1.
```

### 7.3 Bärenfalle

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Two-state trap asset: a spring-loaded jaw trap set into the ground. Strict
side view, resting on an implied ground line.

Design: a semicircular base plate in dark iron #4a4740 with two rows of
triangular teeth on hinged jaws, a heavy coil spring on each side, a small
round pressure plate in the centre, and a short chain running off to the
left. Rust streaks in #8a5a3a along the metal. A thin amber #ffd23f
highlight on the tooth tips so the danger reads even in shadow.

Layout: exactly 2 frames in one horizontal row, equal cells.
Frame 1 — armed: jaws open flat to left and right, teeth pointing up, the
pressure plate raised, the spring compressed and visibly tense.
Frame 2 — sprung: jaws snapped shut into a closed triangular wedge, teeth
interlocked, a small puff of dust at the base, the chain jerked taut.

The armed state must read as a wide toothed mouth at 16 pixels tall; the
sprung state as a closed narrow wedge. No blood, no remains.

Master scale: cells 320 x 192 pixels, canvas 640 x 192 pixels, fully
transparent background. Aspect ratio 10:3.
```

### 7.4 Presse

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Three-state trap asset: an industrial crushing press. Strict side view.

Design: a heavy rectangular steel ram #8b96a6 with bevelled edges, dome
rivets and a hazard stripe band of diagonal amber #ffd23f and near-black
along its lower face, mounted on two vertical guide rails that run out of
the top of the frame. A matching anvil base plate sits on the ground line
below, scarred and dented, with dark oil staining.

Layout: exactly 3 frames in one horizontal row, equal cells, identical
rails and base in all three.
Frame 1 — raised: the ram at the top of its travel, the gap beneath it
clearly tall enough to walk through, a small green indicator light.
Frame 2 — descending: the ram at half travel, motion implied by a slight
vertical smear on the guide rails, the indicator light amber.
Frame 3 — closed: the ram fully down onto the anvil, a hard contact spark,
dust puffing sideways from the seam, the indicator light red #ff4d4d.

The hazard stripes on the underside are the player's warning and must stay
legible at small size.

Master scale: cells 384 x 384 pixels, canvas 1152 x 384 pixels, fully
transparent background. Aspect ratio 3:1.
```

### 7.5 Feuerstrahl

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Four-frame trap animation: a horizontal flame jet emitter. Strict side
view, the nozzle on the left, the jet firing to the right.

Design: a stubby riveted iron nozzle #4a4740 with a small pilot flame and
two pressure valves, mounted flush to an implied wall on the left edge.

Layout: exactly 4 frames in one horizontal row, equal cells, identical
nozzle position.
Frame 1 — idle: only the tiny blue pilot flame at the nozzle mouth, a wisp
of heat shimmer.
Frame 2 — ignition: a short stubby burst of flame reaching one third across
the cell, white-hot core, amber #ffd23f middle, orange #ff7a45 fringe.
Frame 3 — full jet: a long tapering flame spanning the full cell width,
white-hot at the nozzle, cooling through amber to deep red #8a2b1e at the
tip, with turbulent lobed edges and a few detached flame licks.
Frame 4 — dying back: the jet broken into three separate rolling puffs
drifting right, smoke starting to form.

The flame must be built from hard-edged pixel clusters, not soft airbrushed
gradients. The full jet state must be unmistakably lethal at a glance.

Master scale: cells 512 x 192 pixels, canvas 2048 x 192 pixels, fully
transparent background. Aspect ratio 32:3.
```

### 7.6 Wasser

```
[PREPEND STYLE BLOCK B]
[APPEND PALETTE LOCK]

Water surface asset for a side-scrolling puzzle game: a lethal water pool
the creatures drown in. Strict orthographic side view, seen from slightly
above the waterline so both surface and body are visible.

Layout: exactly 3 elements stacked vertically in one image, thin hairline
separators, no text.
Element 1 — a horizontally tileable water surface strip: a bright specular
line in pale cyan #9fd8ff along the very top, a 16-pixel band of lighter
water #4f8fb5 below it, then the body colour #2f6f96, with small regular
wave crests and ordered dithering in the transition. Tileable left to
right.
Element 2 — the deep body: a vertical gradient from #2f6f96 down to
#16324a, with faint caustic light bands drifting through it and a few
rising bubbles.
Element 3 — a 6-frame splash sequence in one row: a small crown splash
forming, peaking, breaking into droplets, falling back, ripple rings
spreading, and settling.

The water must read as depth, not as a flat blue block: value must fall off
clearly with depth so a submerged silhouette is visibly darker.

Master scale: canvas 2048 x 1024 pixels. Elements 1 and 2 are opaque, the
splash sequence sits on a transparent strip. Aspect ratio 2:1.
```

---

## 8. Effekte und Partikel

GDD §6 nennt vier Partikelarten. Der Prototyp erzeugt sie bereits (`scene.ts`, Methode
`spawnFromEvents`) mit genau diesen Farben — die Prompts übernehmen sie, damit generierte
Effektblätter und laufender Code dieselbe Sprache sprechen:

| Ereignis | Farbe im Code | Menge |
|---|---|---|
| `dig` | `#8a6236` | 3 Partikel |
| `brick` | `#c98a52` | 2 Partikel |
| `steel` | `#ffe9a8` | 7 Partikel, hohe Geschwindigkeit |
| `explode` | `#ff9a3c` + `#5a5a5a` | 26 + 12 Partikel |
| `saved` | `#ffe98a` | 8 Partikel |

Wichtig für alle Effektblätter: **transparenter Hintergrund und additive Tauglichkeit.**
Effekte werden im Renderer über alles gelegt; ein mitgeliefertes Schwarz zerstört das.

### 8.1 Staubwolke beim Graben

```
[PREPEND STYLE BLOCK A]

Particle effect sprite sheet: a small dust puff kicked up by digging
through soil. Warm earth dust, base colour #8a6236, lighter rim #b08a5e,
darkest cores #5e4226.

Layout: exactly 8 frames in one horizontal row, equal cells, the effect
originating at the bottom centre of each cell and expanding upward and
outward.
Frame 1 — a tight, dense, small puff barely larger than a fist.
Frames 2 to 4 — the cloud billows outward and upward, its silhouette
breaking into three or four distinct rounded lobes, a few individual grain
pixels flicking outward.
Frames 5 to 7 — the cloud thins, drifts slightly to one side, lobes
separate, overall value lightens toward the background.
Frame 8 — only a faint haze and two or three drifting grains remain.

Built from hard-edged pixel clusters with visible ordered dithering at the
fading edges, never soft airbrush. Opacity falls off across the sequence,
so later frames are partly transparent.

Master scale: cells 128 x 128 pixels, canvas 1024 x 128 pixels, fully
transparent background, no ground, no character. Aspect ratio 8:1.
```

### 8.2 Gesteinsbrocken

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Debris asset sheet: individual rock and soil chunks thrown by digging and
blasting, meant to be simulated with physics and rotated by the engine.

Layout: exactly 12 separate chunks in a 6 by 2 grid, equal cells, each
chunk centred in its own cell, no overlap between cells.
Cells 1 to 4 — soil clods in #6b4a2e with lighter grain #8a6236, irregular
lumpy shapes, sizes from 8 to 32 pixels at master scale.
Cells 5 to 8 — rock shards in #565d6b with bright fracture faces #7d8697,
angular and faceted, sharp corners, sizes from 12 to 40 pixels.
Cells 9 and 10 — brick fragments in #b5713f with a straight machined edge
on one side and a broken edge on the other.
Cells 11 and 12 — small pebbles, 6 to 10 pixels, nearly silhouette-only.

Each chunk carries a hard near-black outline #0c1119, one lit face toward
the upper left and one shadowed face toward the lower right, so it still
reads as a solid volume when rotating. No motion blur, no trails, no
shadow.

Master scale: cells 64 x 64 pixels, canvas 384 x 128 pixels, fully
transparent background. Aspect ratio 3:1.
```

### 8.3 Funken bei Stahlkontakt

Dieser Effekt ist reine Kommunikation: Er sagt dem Spieler *„du gräbst gegen Stahl, hör
auf"*. Er muss deshalb hell, schnell und laut aussehen — der auffälligste kleine Effekt im
Spiel.

```
[PREPEND STYLE BLOCK A]

Particle effect sprite sheet: a bright spark burst produced when a digging
tool strikes indestructible steel. Colours: white-hot core #ffffff, pale
gold body #ffe9a8, warm amber tips #ffd23f. No smoke, no dust.

Layout: exactly 6 frames in one horizontal row, equal cells, the burst
originating at the centre of each cell.
Frame 1 — a single tiny white flash point with a four-point star flare.
Frame 2 — seven distinct sparks shooting outward in a fan biased to the
left and upward, each spark a 1 to 3 pixel dot with a short bright trail,
plus a bright flash disc at the origin.
Frame 3 — sparks at maximum spread, trails at their longest, flash disc
shrinking, one or two sparks already ricocheting back.
Frames 4 and 5 — sparks arcing downward under gravity, trails shortening,
colour cooling from white through gold to amber.
Frame 6 — two or three faint amber dots winking out.

The effect must be readable as "hard stop, metal on metal" and must be the
brightest small effect in the game. Hard-edged pixels only, additive-
friendly: no dark pixels anywhere in the sheet.

Master scale: cells 128 x 128 pixels, canvas 768 x 128 pixels, fully
transparent background. Aspect ratio 6:1.
```

### 8.4 Rauchfahne

```
[PREPEND STYLE BLOCK A]

Particle effect sprite sheet: a rising smoke plume left behind after an
explosion. Greys from dark #3a3a3a through mid #5a5a5a to light #8f8f8f,
with a faint warm underlight #8a5530 at the base in the first three frames
only.

Layout: exactly 8 frames in one horizontal row, equal cells, the plume
rising from the bottom centre of each cell.
Frame 1 — a dense dark ball of smoke close to the ground, warm glow beneath
it.
Frames 2 to 4 — the ball lifts and stretches into a column, rolling
billows forming along its edges, the base thinning into a stem, the warm
underlight fading out.
Frames 5 and 6 — the column leans and widens at the top into a mushroom
cap, internal value contrast reducing.
Frames 7 and 8 — the plume breaks into three separate drifting clouds,
lightening and dissolving toward transparency.

Billows built from rounded hard-edged pixel lobes with heavy ordered
dithering at the boundaries. Opacity decreases steadily across the
sequence.

Master scale: cells 192 x 256 pixels, canvas 1536 x 256 pixels, fully
transparent background. Aspect ratio 6:1.
```

### 8.5 Explosion

Bildschirmschütteln und Chromatic Aberration sind laut GDD §6 **ausschließlich** hier
erlaubt. Der Effekt darf deshalb visuell aus dem Rahmen fallen — er ist der einzige, der
das darf.

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Explosion sprite sheet for a side-scrolling puzzle game, matching a
14-logical-pixel blast radius.

Layout: exactly 9 frames in one horizontal row, equal cells, the blast
centred in every cell.
Frame 1 — a small pure white core flash, 16 master pixels across, with a
thin four-point flare.
Frame 2 — the core expands to 64 pixels, a bright amber #ffd23f ring
forming around it, a thin white shockwave circle racing ahead of the fire.
Frame 3 — full fireball at 224 master pixels across, matching the 14-pixel
logical radius at 8x: white core, amber #ff9a3c middle body, ragged orange
#ff7a45 outer lobes, the shockwave ring now a faint expanding outline well
beyond the fire.
Frame 4 — the fireball's outline turns lumpy and asymmetric, dark grey
#5a5a5a smoke appearing at the top, eight dark debris shards launching
outward.
Frames 5 and 6 — fire collapses inward and cools from white through amber
to deep red, smoke takes over the upper half, debris arcs outward.
Frames 7 and 8 — smoke ball dominant, only ember specks remain, debris
falling.
Frame 9 — a drifting smoke ring and a dark scorch smear at the centre.

Hard-edged pixel clusters throughout, ordered dithering at the fire-smoke
boundary, no soft airbrush, no lens flare, no bloom baked into the sheet.

Master scale: cells 320 x 320 pixels, canvas 2880 x 320 pixels, fully
transparent background. Aspect ratio 9:1.
```

---

## 9. UI, Icons und Keyart

Die Berufssymbole sind der zweite Ort, an dem sich das Spiel entscheidet. Sie sitzen laut
GDD §3.5 in einem Bogen in den unteren 25 % des Bildschirms und sind **36 Punkt breit** —
das ist kleiner als eine Fingerkuppe. Der Prototyp zeichnet sie bewusst grob und kantig
(`icons.ts`).

Zwei Regeln, die in den Icon-Prompts stecken:

- **Gleiche Silhouettenlogik wie die Figuren.** Das Symbol des Gräbers zeigt denselben
  waagerechten Balken *unten*, den auch die Figur zeigt. Wer die Figur gelernt hat, kann
  das Symbol lesen — und umgekehrt. Das halbiert die Lernkurve.
- **Strichstärke absolut, nicht relativ.** Bei 36 Punkt muss die dünnste Linie mindestens
  2 Punkt haben, sonst verschwindet sie auf einem gebrauchten Display mit Fettfilm.

### 9.1 Die acht Berufssymbole

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

UI icon set for the eight skills of a real-time rescue puzzle game. Flat
single-colour glyphs, drawn in amber #ffd23f on a fully transparent
background, hard-edged pixel art, no gradients, no outlines, no fills other
than the glyph colour.

Layout: exactly 8 icons in a 4 by 2 grid, equal cells, each glyph centred
and occupying about 80 percent of its cell, no labels, no text, no frames,
no separators.

Icons, in reading order:
1 Climber — a vertical ladder with four rungs, and a small simplified
  figure silhouette climbing on its left side.
2 Floater — an open umbrella dome with three ribs and a straight vertical
  handle beneath it.
3 Bomber — a round bomb with a short curled fuse rising from the upper
  right and a small spark at its tip.
4 Blocker — a stick figure with a round head and both arms stretched
  perfectly horizontal, forming a wide T.
5 Builder — a rising staircase of three steps, drawn as a single continuous
  stepped line climbing from lower left to upper right.
6 Basher — a solid vertical wall bar on the right, with a thick horizontal
  arrow pointing right into it.
7 Miner — a solid horizontal floor bar at the bottom, with a thick arrow
  pointing diagonally down-right at about 27 degrees.
8 Digger — a solid horizontal ceiling bar at the top, with a thick arrow
  pointing straight down.

Stroke weight: uniform and heavy, at least 1/12 of the cell width, with
rounded caps and joins. Arrow heads solid and large.

Test criterion: each glyph must remain unambiguous when the cell is scaled
down to 36 by 36 pixels, viewed through a smudged screen. Icons 6, 7 and 8
differ only in bar position and arrow direction — exaggerate those
differences.

Master scale: cells 512 x 512 pixels, canvas 2048 x 1024 pixels, fully
transparent background. Aspect ratio 2:1.
```

### 9.2 Die zwei späteren Symbole

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Two additional UI icons for the same skill set, matching the existing eight
in weight and construction. Flat single-colour glyphs in amber #ffd23f on a
fully transparent background, hard-edged pixel art, no gradients, no
outlines.

Layout: exactly 2 icons in one horizontal row, equal cells, each glyph
centred at about 80 percent of cell size, no text, no frames.

Icon 1 — Magnetiser: a classic horseshoe magnet with the opening facing
right, the two pole tips squared off, and two short curved attraction arcs
springing from the poles toward the right edge. The open U gap must be at
least one third of the magnet width so the hole survives at small size.

Icon 2 — Jumper: a solid arc trajectory line rising from lower left to
upper right and curving back down, with a small filled circle at the start
of the arc and a short gap in the ground bar directly beneath the arc's
peak, so the icon reads as "jumping over a hole".

Stroke weight uniform and heavy, at least 1/12 of the cell width, rounded
caps and joins. Both glyphs must stay unambiguous at 36 by 36 pixels and
must not be confusable with any of the existing eight.

Master scale: cells 512 x 512 pixels, canvas 1024 x 512 pixels, fully
transparent background. Aspect ratio 2:1.
```

### 9.3 Skill-Leiste im Bogen

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

UI frame asset: the skill bar of a portrait-orientation mobile puzzle game,
occupying the bottom quarter of the screen and shaped as a shallow upward
arc so the eight buttons follow the natural sweep of a thumb.

Design: a dark panel #0e131c filling the lower area, its top edge a smooth
shallow arc rising slightly at the centre, with a 2-pixel hairline
#27334a along that edge and a soft inner shadow beneath it. Eight round
button wells sit along the arc, evenly spaced, each a slightly raised disc
#18202e with a thin darker rim and a subtle top bevel, each large enough
for a 36 point icon plus padding.

Include three button states shown side by side below the main bar as a
small reference row: idle #18202e, pressed with a darker recessed fill and
no bevel, and selected with a 3-pixel amber #ffd23f ring and a faint amber
inner glow.

Also include a vertical slider track on the left side of the panel: a
narrow recessed channel with a chunky rounded handle, for the release-rate
control.

No icons inside the wells, no text, no numbers — those are drawn by the
engine. Clean, functional, slightly industrial, matching a pixel-art game
without itself being lo-fi.

Master scale: canvas 1080 x 640 pixels, portrait-screen width proportions.
Transparent background outside the panel shape. Aspect ratio 27:16.
```

### 9.4 Rettungsquote-Balken

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

UI asset: the rescue-quota bar of a rescue puzzle game, showing how many
creatures have been saved against how many are required.

Design: a long horizontal capsule-shaped track, dark #0e131c with a thin
#27334a rim and a subtle inner shadow. The fill grows from the left in
success green #4fd18b with a lighter top highlight line and a soft glow at
its leading edge. A distinct vertical target marker crosses the whole bar
at roughly 70 percent: a 4-pixel amber #ffd23f line with a small downward-
pointing triangle above it, marking the required quota.

Layout: exactly 4 states stacked vertically, equal spacing, no text, no
numbers.
State 1 — empty track.
State 2 — filled to about 30 percent, below the target marker, fill in
neutral #7b8ba3 rather than green because the quota is not yet met.
State 3 — filled just past the target marker, fill in green #4fd18b, with a
small amber pulse ring at the marker.
State 4 — filled completely, fill in green with a bright highlight sweep
and a thin amber outline around the whole capsule.

The colour switch from neutral to green at the target marker is the single
most important readability feature.

Master scale: canvas 1024 x 512 pixels, each bar 896 pixels wide and 64
pixels tall. Transparent background. Aspect ratio 2:1.
```

### 9.5 App-Icon

```
[PREPEND STYLE BLOCK A]
[APPEND PALETTE LOCK]

Mobile app icon for a real-time rescue puzzle game about small creatures
digging through destructible terrain. Original character design, not based
on any existing game or franchise.

Composition: a single Wusel creature in strict three-quarter front view,
filling the central two thirds of the icon, seen from slightly above.
Design as established: large bald egg-shaped head with warm sand skin
#f4d7ac, two large round black dot eyes, tiny mouth, one-piece teal work
suit #2fc9b8, dark teal boots #1d8f85, hard near-black outline #0c1119.
It holds a broad amber #ffd23f shovel across its body and looks up at the
viewer with cheerful, slightly clueless determination.

Background: a simple radial field from #24415a at the edges to #3d5f7d
behind the head, with a subtle warm glow #ffd98a behind the creature's
shoulders so its silhouette separates hard from the ground. A shallow
cross-section of brown soil #6b4a2e with a green crust #4f8f3c across the
bottom fifth, and a small dug tunnel opening visible in it.

No text, no logo, no title, no border, no rounded-corner mask drawn into
the image — the store applies the mask. Nothing important within 80 pixels
of any edge.

The whole icon must remain readable at 60 by 60 pixels: one clear subject,
one clear silhouette, high value contrast, no fine detail.

Master scale: 1024 x 1024 pixels, opaque. Aspect ratio 1:1.
```

### 9.6 Store-Keyart quer

```
[PREPEND STYLE BLOCK B]
[APPEND PALETTE LOCK]

Landscape key art for a real-time rescue puzzle game about small creatures
digging through destructible terrain. Original characters and world, not
based on any existing game or franchise.

Scene: a wide cross-section of grassland terrain cut open like a doll's
house, seen in strict orthographic side view. The upper third is sky
gradient #101c33 to #3d5f7d with three receding hill layers #1b2f42,
#24415a, #2f5570. The lower two thirds are soil #6b4a2e with a green crust
#4f8f3c, riddled with hand-dug tunnels, a diagonal mine shaft, a vertical
pit, and one horizontal gallery blocked by a riveted steel plate #8b96a6.

Cast: about twenty small teal-suited creatures at work throughout the cut-
away — one swinging a shovel at the bottom of the pit, one hammering
sideways against the steel with sparks flying, one placing brick steps
#b5713f up a ledge, one drifting down a shaft under an amber umbrella, one
standing arms-wide as a blocker, a small crowd marching in single file
along the surface. Every creature reads clearly by silhouette alone.

Focal point: on the right, a glowing exit door with a strong warm halo
#ffd98a that the marching line is heading toward. On the upper left, a
riveted steel hatch on chains with creatures dropping out of it.

Lighting: warm late-afternoon key from the upper left, cool bounce in the
tunnels, warm rim light on the fresh cut edges which are one clear step
brighter than the settled soil, dust motes in the light shafts.

Leave the upper right quadrant relatively calm for a title treatment. No
text, no logo, no UI in the image.

Master scale: 2560 x 1440 pixels, opaque. Aspect ratio 16:9.
```

### 9.7 Store-Keyart hoch

```
[PREPEND STYLE BLOCK B]
[APPEND PALETTE LOCK]

Portrait key art for the same real-time rescue puzzle game, for phone store
listings and vertical feature placements. Original characters and world,
not based on any existing game or franchise.

Scene: a tall vertical cross-section of terrain, seen in strict
orthographic side view, reading as a deep shaft from sky to depths. Top
eighth is sky gradient #101c33 to #3d5f7d with a riveted steel hatch on
chains, doors open, three small teal-suited creatures falling out of it,
arms up, one already under an amber #ffd23f umbrella.

Middle: layered terrain descending through green-crusted soil #6b4a2e, grey
rock #565d6b, and one thick horizontal band of riveted steel #8b96a6 that
the tunnels visibly stop at and route around. Hand-dug tunnels wind down
the shaft, a diagonal mine gallery cuts across, a brick #b5713f staircase
climbs a ledge, and a blocker stands arms-wide on a narrow ridge.

Bottom sixth: the glowing exit door with a strong warm halo #ffd98a and a
queue of creatures walking into it, small rising light motes above them.

Lighting: cool from above, warm from the exit glow below, so the vertical
composition is lit from both ends and the middle stays dark and dense.
Fresh cut edges one clear step brighter than settled material.

Leave the top fifth calm enough for a title treatment. No text, no logo, no
UI in the image.

Master scale: 1440 x 2560 pixels, opaque. Aspect ratio 9:16.
```

---

## 10. Tripo (3D)

### Warum überhaupt 3D für ein Pixelspiel

*Dead Cells* — von GDD §6 neben *Blasphemous* als Richtung genannt — wurde nicht gepixelt,
sondern **in 3D modelliert, animiert und anschließend zu Pixelart heruntergerendert**. Genau
diesen Weg beschreibt §6. Das ist kein Umweg, sondern die Lösung für genau
das Problem, das Abschnitt „Was diese Generatoren können" beschreibt: Bildmodelle halten
eine Figur über 8 Animationsphasen nicht konsistent — ein 3D-Modell schon, weil es
dieselbe Geometrie aus verschiedenen Winkeln zeigt.

**Der Arbeitsablauf in drei Schritten:**

1. **Modell.** Aus dem Tripo-Prompt entsteht ein Mesh in T-Pose mit sauberer, ungetönter
   Oberfläche. Wichtig: **keine eingebackene Beleuchtung** in der Textur, sonst kann man
   später nicht neu beleuchten und die Figur passt in keine zweite Welt.
2. **Render-Turnaround.** Das Modell wird in Blender orthografisch gerendert — Seitenansicht
   für das Spiel, dazu Front/Rück/Dreiviertel für Referenz. Beleuchtung nach Stilblock A
   (Key oben links, kühler Fill unten rechts, schmales Rim oben). Rendergröße: die
   8-fache Zielgröße, also 96 px hohe Figur.
3. **Herunterrechnen und nachziehen.** Der Render wird auf 12 px Höhe skaliert (nearest
   neighbour), auf die Palette aus §1.4 quantisiert und dann von Hand nachgezogen: Umriss
   schließen, Augen auf ganze Pixel setzen, Silhouette schärfen. **Dieser letzte Schritt
   bleibt Handarbeit** — er entscheidet über die Lesbarkeit und dauert pro Figur eine
   knappe Stunde.

Für den Rest der Berufe muss nicht jedes Mal ein neues Modell entstehen: Es reicht, das
Basismodell einmal zu bauen und die **Ausrüstungsteile** (Helm, Schirm, Hammer, Spitzhacke,
Schaufel, Magnet) als eigene kleine Modelle daranzustecken.

**Zu den Einstellungen, vorsichtig formuliert:** Tripo bietet Text-zu-3D und Bild-zu-3D
sowie Nachbearbeitungsschritte. Welche Optionen (etwa Vierecksnetz-Topologie oder
PBR-Texturen) im eigenen Konto verfügbar sind, hängt von Tarif und Version ab — bitte in
der Oberfläche nachsehen statt hier zitierte Parameternamen zu erwarten. Die Prompts unten
sind absichtlich so geschrieben, dass sie ohne Spezialoptionen funktionieren: kurz,
objektbezogen, mit klaren Formaussagen. Tripo reagiert schlechter auf lange Stilessays als
Bildmodelle — deshalb sind diese Prompts deutlich kürzer als alle anderen in dieser Datei.

**Bild-zu-3D als bessere Variante:** Wenn ein gutes Charakterblatt aus §2.1 oder ein
Turnaround aus §2.2 vorliegt, liefert der Bild-zu-3D-Weg meist konsistentere Ergebnisse
als reiner Text. Dann dient der Textprompt nur noch als Ergänzung.

### 10.1 Basisfigur in T-Pose

```
A small stylised cartoon worker creature, game-ready character model, T-pose
with arms straight out to the sides and legs slightly apart.

Proportions: three heads tall. Very large smooth egg-shaped bald head, no
hair, no headwear, no ears. Two large round eyes set wide apart and low on
the face. Tiny simple mouth. No nose. Short barrel torso in a one-piece
work suit with a rolled collar, short stubby arms ending in simple mitten
hands with no separate fingers, very short legs ending in blunt rounded
boots.

Surface: clean flat colour blocking only — sand-coloured skin on the head
and hands, teal suit on the torso and arms, dark teal boots. Completely
unlit, no baked shadows, no baked highlights, no ambient occlusion, no
gloss, matte diffuse only.

Geometry: simple rounded volumes, moderate polygon count, closed watertight
mesh, no thin protruding parts, no loose accessories, no cloth, no cape.
Bold clear silhouette that stays readable when the model is rendered very
small.
```

### 10.2 Ausrüstungsteile als Anbauteile

```
A set of stylised cartoon tool props for a small worker character, game-ready
models, each as a separate simple object: an angular hard hat with a flat
front brim and a round forehead lamp; a small closed-form open umbrella with
six ribs, a shallow dome canopy and a straight handle; a short heavy
sledgehammer with a blocky rectangular head; a pickaxe with a curved double-
pointed head and a long straight handle; a broad flat-bladed shovel with a
short handle; a thick horseshoe magnet with squared pole tips.

Style: chunky, exaggerated, oversized relative to a real tool, rounded edges,
no fine detail, no engraving, no text.

Surface: flat single-colour blocking, warm amber for the metal and handles,
near-black for the striking heads. Completely unlit, no baked shadows or
highlights, matte diffuse only.

Geometry: moderate polygon count, closed watertight meshes, each prop
separate and centred at its own origin, no scene, no base plate, no ground.
Every prop must read as its own distinct silhouette at very small size.
```

### 10.3 Blocker-Pose als eigenes Modell

Der Blocker ist die einzige Pose, die man nicht aus dem Basismodell heraus animieren
sollte: Seine Silhouette ist das Spielsignal, sie muss exakt stimmen. Deshalb ein eigenes
Modell, in dem die Armspanne genau doppelt so breit ist wie die Figur hoch.

```
The same small stylised cartoon worker creature, game-ready character model,
in a rigid blocking pose: standing frontally, feet planted wide and firm,
both arms stretched perfectly straight out to the left and right at chest
height, elbows locked, mitten hands turned so the palms face forward.

Total arm span exactly twice the height of the head. Chin slightly raised,
face set and determined.

Surface: flat colour blocking only, sand skin, teal one-piece suit, dark teal
boots, an orange band across the chest and an orange rectangular paddle in
each hand. Completely unlit, no baked shadows or highlights, matte diffuse
only.

Geometry: moderate polygon count, closed watertight mesh, arms thick enough
to stay visible at very small render sizes. The silhouette must read as a
solid wide letter T with a heavy base.
```

### 10.4 Falltür und Ausgangstür

```
Two separate stylised game props, chunky low-detail cartoon style.

Prop one: a hanging industrial hopper, a riveted rectangular metal box wider
than it is tall, with two hinged doors forming its underside, two thick
chain links rising from the top corners, and a small dome lamp on the top
face. Model the doors as separate hinged parts so they can be opened.

Prop two: a standing doorway portal, a heavy arched frame roughly as wide as
it is tall, with a plain flat recessed panel filling the opening and two
small lamps on the upper corners. The recessed panel must be a separate flat
surface so a glowing material can be assigned to it later.

Surface: flat colour blocking, cool grey metal for the hopper, dark stone for
the portal frame, plain neutral for the recessed panel. Completely unlit, no
baked lighting, no emissive, matte diffuse only.

Geometry: moderate polygon count, closed watertight meshes, bold chunky
forms, rivets as simple raised domes. No ground plane, no scene, no
background.
```

### 10.5 Fallen — Presse und Bärenfalle

```
Two separate stylised game props, chunky low-detail cartoon style, mechanical
hazard devices.

Prop one: an industrial crushing press. A heavy rectangular ram block with
bevelled edges and raised rivets, mounted between two vertical guide rails,
above a scarred flat anvil base plate. Model the ram as a separate part that
slides along the rails.

Prop two: a spring-loaded jaw trap. A semicircular flat base plate, two
hinged jaws each carrying a row of triangular teeth, a coil spring at each
hinge, a small round pressure plate in the centre and a short chain attached
to one side. Model the two jaws as separate hinged parts so the trap can be
posed open or closed.

Surface: flat colour blocking, cool grey steel for the press, dark rusted
iron for the trap. Completely unlit, no baked shadows or highlights, matte
diffuse only.

Geometry: moderate polygon count, closed watertight meshes, exaggerated
chunky proportions, teeth large and blunt rather than fine and sharp. No
ground plane, no scene, no background.
```

### 10.6 Terrainbausteine

Terrain wird im Spiel als Bitmaske erzeugt, nicht als Modell (GDD §11). Diese Modelle
liefern nur die **Textur-Bausteine**: Man rendert sie orthografisch, schneidet sie zu
Kacheln und benutzt sie als Materialgrundlage für §5.

```
A set of stylised game terrain chunks, chunky low-detail cartoon style, each
as a separate object.

Chunk one: a block of loose crumbly soil with embedded pebbles and a rough
uneven top surface.
Chunk two: a block of angular faceted rock with sharp interlocking fracture
planes and deep crevices.
Chunk three: a riveted steel armour plate, perfectly flat and machined, with
a regular grid of dome-head rivets and bevelled plate seams.
Chunk four: a single wooden plank step with visible grain, two nail heads and
one chipped end.

All four chunks the same overall size, all as flat-fronted slabs suitable for
rendering in strict orthographic front view and tiling the result.

Surface: flat colour blocking only, brown for soil, grey for rock, cool grey
for steel, warm brown for the plank. Completely unlit, no baked shadows, no
ambient occlusion, matte diffuse only.

Geometry: moderate polygon count, closed watertight meshes, surface relief
expressed as real geometry rather than as texture detail. No ground plane, no
scene, no background.
```

---

## 11. Arbeitsablauf und Konsistenz

### Wie man Stil über hunderte Generierungen hält

Der Feind ist nicht die einzelne schlechte Generierung — die wirft man weg. Der Feind ist
der **schleichende Stildrift**: Asset 1 und Asset 80 passen einzeln, aber nicht
nebeneinander. Fünf Maßnahmen dagegen, in der Reihenfolge ihrer Wirksamkeit:

1. **Stilblock wörtlich voranstellen.** Nicht paraphrasieren, nicht kürzen, nicht „an den
   Kontext anpassen". Der Block aus §1.1 oder §1.2 steht unverändert vor jedem Prompt.
2. **Referenzbild verwenden, sobald eines gut ist.** Das erste wirklich gelungene
   Charakterblatt wird zur Referenz für alles Weitere — über die Bildreferenz-Funktion des
   jeweiligen Generators (Bild-Anhang, Stilreferenz, IP-Adapter, je nach Werkzeug). Ein
   gutes Referenzbild schlägt jede Prompt-Formulierung.
3. **Seed festhalten, wenn der Generator einen anbietet.** Gleicher Seed plus minimal
   geänderter Prompt ergibt Varianten derselben Figur statt einer neuen Figur. Seed und
   vollständigen Prompt zu jedem behaltenen Asset mitspeichern — sonst ist eine
   Nachgenerierung in drei Wochen unmöglich.
4. **In Serien arbeiten, nicht einzeln.** Alle acht Berufe an einem Tag mit demselben
   Modell und derselben Einstellung erzeugen. Modelle werden aktualisiert; ein Beruf, der
   drei Monate später nachgezogen wird, sieht anders aus.
5. **Früh auf die Palette quantisieren.** Alle Assets so bald wie möglich auf die indizierte
   Palette aus §1.4 zwingen. Das planiert einen großen Teil des Stildrifts automatisch, weil
   Farbabweichung der auffälligste Bruch ist.

### Was realistisch nachbearbeitet werden muss

Ehrliche Zeitschätzung, damit die Planung stimmt. Kein generiertes Asset geht ohne
Nachbearbeitung ins Spiel.

| Asset | Nachbearbeitung | Aufwand |
|---|---|---|
| Figur, 12 px | Vollständig von Hand nachgepixelt. Der Generator liefert nur die Vorlage. | 1–2 h je Beruf |
| Laufzyklus | Phasen von Hand ausgerichtet, Grundlinie fixiert, Kopfversatz auf ganze Pixel | 3–4 h |
| Todesanimation | Timing gekürzt auf 8 Bilder, Silhouetten geglättet | 2 h je Tod |
| Terrainkachel | Kachelbarkeit prüfen und Naht reparieren (offset-Test), Palette reduzieren | 30–60 min je Kachel |
| Parallax-Ebene | In Ebenen zerschnitten, Alpha freigestellt, horizontal kachelbar gemacht | 1–2 h je Welt |
| UI-Symbol | Meist komplett neu gezeichnet — 36 Punkt verzeiht nichts | 20 min je Symbol |
| Keyart | Farbkorrektur, Titelfläche freiräumen, Store-Zuschnitte | 2–3 h |
| 3D-Modell | Netz aufräumen, T-Pose korrigieren, Rig, Render-Setup | 4–8 h je Modell |

**Die drei häufigsten Reparaturen:**

- **Kachelnaht.** Textur um die halbe Breite und Höhe versetzen, dann sieht man die Naht
  sofort. Übermalen, zurückversetzen, prüfen.
- **Pixelraster stimmt nicht.** Das generierte Bild hat „Pixel" in 7,3 Bildpunkten Größe.
  Lösung: auf die nächste saubere Zweierpotenz herunterrechnen (nearest neighbour), dann
  Kanten nachziehen.
- **Zu viele Farben.** Generierte Assets haben oft mehrere tausend Farben. Auf 24 indizierte
  Farben quantisieren, danach die Bereiche kontrollieren, in denen das Dithering zerfällt.

### Prüfliste vor der Abnahme eines Assets

Jedes Asset muss diese fünf Fragen mit Ja beantworten, sonst geht es zurück:

1. **Silhouettentest bestanden?** Asset komplett schwarz füllen, auf Zielgröße
   herunterrechnen. Ist es noch identifizierbar? Bei Berufen: von den anderen neun
   unterscheidbar?
2. **Graustufentest bestanden?** Farbe entfernen. Trägt das Bild noch? Wenn nicht, macht es
   für farbfehlsichtige Spieler nicht das, was es soll.
3. **Palette eingehalten?** Nur Farben aus §1.4, plus Leuchten und Funken.
4. **Rechtsprüfung bestanden?** Kein grünes Haar, keine blaue Kutte, keine Ähnlichkeit zu
   geschützten Figuren, keine fremde Marke im Bild.
5. **16-Pixel-Test bestanden?** Auf einem echten Telefon ansehen, mit dem Daumen davor, im
   Zug, bei Sonne. Das ist die einzige Umgebung, die zählt.
