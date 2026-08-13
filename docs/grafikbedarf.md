# Grafikbedarf

Was an Grafik fehlt, wie es aussehen soll, und der Prompt, mit dem es entsteht.
Diese Datei ist die **Auftragsliste**: Für jede Grafik stehen hier Zweck,
wörtlicher Prompt, Pixelmaß, Einbauweg und ein Abnahmekriterium, an dem sich
ohne Geschmacksdiskussion entscheiden lässt, ob die Lieferung brauchbar ist.

Sie ist aus dem Stand des Spiels hergeleitet, nicht erfunden: aus
`src/render/scene.ts`, `terrainView.ts`, `palette.ts`, `icons.ts`, `layout.ts`,
`hud.ts`, `weltkarte.ts`, `werkzeug.ts`, `band.ts`, aus `src/art/*.atlas.json`,
`scripts/bake-figur.mjs`, `scripts/build-single.mjs`, `src/levels/welten.ts`
und aus den Kontrollbildern in `art-src/proben/`.

**Sprachregel:** Erklärungen deutsch, Prompts englisch. Bildmodelle folgen
englischen Prompts spürbar zuverlässiger. Jeder Prompt steht in einem eigenen
Codeblock und ist ohne Umschreiben einsetzbar.

---

## 0. Die Randbedingungen — sie gelten für jede Zeile dieser Datei

**0.1 Eine einzige, in sich geschlossene HTML-Datei.** `scripts/build-single.mjs`
backt Skript, Stil und alle Bilder in `spielen.html`; `vite.config.ts` hebt dafür
`assetsInlineLimit` auf 512 kB, damit kein Bild als eigene Datei liegenbleibt.
Zur Laufzeit wird **nichts** nachgeladen: kein CDN, keine externen Bilder, keine
Schriften. Daraus folgen genau drei Wege, auf denen eine Grafik ins Spiel kommt,
und jede Zeile unten sagt, welcher gemeint ist:

| Weg | Was das heißt | Wo es hingehört |
|---|---|---|
| **gebacken** | aus dem 3D-Modell in ein Sprite-Blatt gerendert | `scripts/bake-figur.mjs` → `src/art/*.webp` |
| **prozedural** | zur Laufzeit mit Canvas-Befehlen gezeichnet | `src/render/*.ts` |
| **eingebettet** | kleine WebP-Datei, die Vite als Data-URI einbaut | `src/art/`, `src/art/ui/` |

**0.2 Das Größenbudget.** Die fertige `spielen.html` misst heute **618 kB**.
Base64 kostet rund 37 Prozent Aufschlag auf jede eingebettete Datei. Der ganze
Bedarf dieser Liste ist auf **230 kB roh (≈ 315 kB eingebettet)** gedeckelt und
in §5 gegenfinanziert.

**0.3 Keine Markennamen.** In keinem Prompt, keinem Dateinamen, keinem
Referenzbild: kein Name eines bestehenden Spiels, Studios oder einer bestehenden
Figur — auch keine Umschreibung („wie das Spiel von damals", „retro classic
puzzle creatures"). Beschrieben wird die Sache selbst. Keine Screenshots fremder
Spiele als Stilreferenz, Bildvorlage oder IP-Adapter.

**0.4 Niemals grüne Haare zusammen mit blauer Tunika.** Die vorhandene Figur
trägt **blaues Haar und grüne Tunika** — genau andersherum. Das bleibt so, und
jede abgeleitete Grafik (allen voran die Avatare) hält sich daran. Der Satz steht
in jedem Prompt, der Figuren zeigt, wörtlich im Negativteil.

**0.5 Zwölf logische Pixel.** Die Spielfigur ist `WUSEL_H = 12` logische Pixel
hoch und erscheint bei Zoom 1 auf rund **26 CSS-Pixeln** (Herleitung in
`camera.ts`: Sichtfenster 180 × 120 logische Pixel). Alles, was neben ihr steht,
muss auf dieser Größe lesbar sein.

**0.6 Querformat, Handy, Daumen.** Bezugsgerät ist 844 × 390 CSS-Pixel im
Querformat bei `devicePixelRatio` 2, also 1688 × 780 Gerätepunkte
(`game.ts` deckelt den Faktor auf 2). Das Hochformat läuft weiter, ist aber nicht
die Bezugsgröße.

---

## 1. Stil und Farbwelt

### 1.1 Woher der Stil kommt

Er ist nicht gewählt, er ist **schon da**: Die ausgelieferte Figur ist ein aus
einem 3D-Modell gebackener Chibi (`art-src/wuselwerker/`, Blatt
`src/art/wuselwerker.webp`, 896 × 1456, 13 Zeilen à 8 Zellen von 112 × 112). Die
Beleuchtung dieses Backvorgangs ist die **verbindliche Lichtregel für alles
Weitere**, weil jede neue Grafik neben dieser Figur stehen wird
(`scripts/bake-figur.mjs`):

| Licht | Farbe | Stärke | Richtung |
|---|---|---|---|
| Hemisphäre (Grundhelligkeit) | `#FFFFFF` über `#9A8F80` | 2,0 | von oben |
| Führungslicht | `#FFF4E2` (warm) | 1,5 | links vorn oben |
| Kantenlicht | `#DFE8FF` (kühl) | 0,6 | rechts hinten unten |
| Material | Rauheit 0,92, Metallanteil 0,0 | | matt, kein Glanzlicht |

In Worten, und genau so steht es in jedem Prompt: **weiche, matte, gerundete
Oberflächen; warmes Führungslicht von links vorn oben, kühles Kantenlicht von
rechts hinten; helles Grundlicht; keine Glanzpunkte, keine harten Schlagschatten,
keine Kontur.**

### 1.2 Die Figur — gemessen am ausgelieferten Blatt

| | Licht | Grundton | Schatten |
|---|---|---|---|
| Haar (blau) | `#3D59C8` | **`#3851B6`** | `#284098` |
| Tunika (grün) | `#587828` | **`#486820`** | `#3A4125` |
| Haut | `#D8985E` | **`#D29059`** | `#B88050` |

Proportionen (`docs/wuselwerker.md`): Kopf und Haar sind **55 %** der Höhe, die
Beine **11 %**. Die Silhouette ist aufrecht, rund 10 von 17 Zellpixeln breit.
Wer diese Figur zeichnet, zeichnet einen sehr großen runden Kopf mit einer
voluminösen blauen Haarmasse, ein kurzes gedrungenes Körperchen in grüner Tunika,
sehr kurze Beine, ein rundes Gesicht mit großen Augen.

### 1.3 Die Welt — aus `src/render/palette.ts`

| | Grasland (`grass`) | Höhle (`crystal`) |
|---|---|---|
| Himmel oben / Mitte / unten | `#2F74B8` · `#69AADD` · `#C6E6F2` | `#1B2450` · `#38508F` · `#6F8ECD` |
| Hügel fern / mitte / nah | `#A5CBDD` · `#7AA8BD` · `#4A7F69` | `#7D92C9` · `#5D72AB` · `#44548A` |
| Hügelfuß fern / mitte / nah | `#8FBBD0` · `#5E8EA6` · `#33604E` | `#6A7FB8` · `#4A5D93` · `#33406E` |
| Erde oben / tief | `#7A5230` · `#452C19` | `#4A5788` · `#232C52` |
| Narbe / Wurzelsaum | `#63B23F` · `#35601F` | `#8AA5E8` · `#2F3A66` |
| Fels / Stahl / Ziegel | `#6B7480` · `#9AA5B5` · `#C98246` | `#3D4A6F` · `#9AA5B5` · `#D59A4A` |
| Kiesel / Schein | `#93867A` · `#FFE6A8` | `#7C86AB` · `#BFE6FF` |

**Luftperspektive ist die Regel:** Was weiter weg ist, wird **heller und
blasser**, nicht dunkler. Das steht so im Code und ist der Grund, warum die
Fernschichten fast Himmelsfarbe haben.

### 1.4 Die Oberfläche — aus `src/render/hud.ts` und `build-single.mjs`

| Rolle | Wert |
|---|---|
| Leiste / Leiste hell / Linie | `#1B2536` · `#27354B` · `#3A4A66` |
| Text / gedämpft | `#EAF2FF` · `#95A7C0` |
| Akzent / gut / schlecht | `#FFC93C` · `#5CE09A` · `#F26A55` |
| Rahmen der Seite | `#05070C` (Grund), `#0E131C` (Tafel), `#FFD23F` (Akzent) |

### 1.5 Die Berufsfarben — aus `src/render/schopf.ts`, verbindlich

Sie sind bereits im Spiel: Sie färben das Stirnband der Figur, das sagt, welchen
Auftrag sie gerade ausführt. **Jede Grafik, die einen Beruf zeigt, benutzt genau
diese Farbe** — dann lernt der Spieler den Farbcode einmal und nicht zweimal.

| Beruf | Kennung | Farbe |
|---|---|---|
| Kletterer | `climber` | `#A87EBE` |
| Schirmspringer | `floater` | `#EE9EB0` |
| Sprengmeister | `bomber` | `#5C5C68` |
| Blocker | `blocker` | `#80A86C` |
| Brückenbauer | `builder` | `#569CB2` |
| Rammer | `basher` | `#E8674F` |
| Schrägbagger | `miner` | `#E2B044` |
| Gräber | `digger` | `#E2B044` |

> **Merke:** Schrägbagger und Gräber teilen sich heute eine Farbe. Für ein
> Farbleitsystem auf den Knöpfen ist das ein Fehler — die beiden sind im Spiel
> genau die, die man verwechselt. Vorschlag: Gräber bleibt `#E2B044`,
> Schrägbagger geht auf **`#C87B2E`** (dieselbe Familie, deutlich dunkler). Eine
> Zeile in `schopf.ts`. Die Prompts unten benutzen bereits die getrennten Werte.

### 1.6 Das Werkzeug — aus `src/render/werkzeug.ts`

Eisen `#3A3430`, Holz `#6B5A46`, Schirmtuch `#D8CBB4` mit Schatten `#A2937C`,
Leine `#4A4238`. Werkzeug ist **dunkel und schlicht** — es ist Silhouette, kein
Schaustück.

### 1.7 Der gemeinsame Stilblock

Dieser Absatz steht wörtlich in fast jedem Prompt unten. Wer einen neuen Prompt
schreibt, übernimmt ihn unverändert:

```
STYLE BLOCK — copy verbatim into every prompt:
modern hand-painted 2.5D game art, soft matte surfaces, rounded volumes,
gentle form shading, no visible brush strokes, no outlines, no cel shading,
no pixel art, no photographic texture. Lighting: bright neutral ambient fill,
one warm key light from the upper left front (#FFF4E2), one cool rim light
from behind right (#DFE8FF); matte roughness, no specular highlights, no lens
flare, no hard cast shadows. Colours slightly desaturated toward the cool side
in the distance (aerial perspective: distant things get lighter and paler,
never darker). Clean, friendly, uncluttered.

NEGATIVE BLOCK — copy verbatim into every prompt:
no text, no letters, no numbers, no watermark, no signature, no logo, no brand
mark, no UI elements, no frames or borders, no vignette, no film grain, no
noise overlay, no chromatic aberration, no harsh black outlines, no pixelation,
no dithering, no photorealism, no 3D render turntable look, no glossy plastic,
no neon, no lens blur, no depth of field.
```

---

## 2. Wo die Grafik ankommt — die Maße aus dem Code

Diese Tabelle beantwortet für jeden Prompt die Frage „in welcher Auflösung?".

| Ort | CSS-Größe (844 × 390) | Gerätepunkte (dpr 2) | Quelle |
|---|---|---|---|
| Spielfeld | 844 × 248 | 1688 × 496 | `layout.ts`, Kopfzeile 42 + Leiste 100 |
| ein logischer Pixel bei Zoom 1 | 2,07 CSS | 4,13 | `camera.ts` (`min(844/180, 248/120)`) |
| Figur (12 logische Pixel) | ≈ 26 CSS | ≈ 52 | `WUSEL_H` × Maßstab |
| Berufsknopf | 69–92 × 78 | 138–184 × 156 | `layout.ts` |
| Symbol **im** Knopf | **30 × 30** | **60 × 60** | `hud.ts`, `min(b.w*0.6, 30)` |
| Kopfzeilen-Knopf (Ton, Nuke, Pause) | 34 × 34 | 68 × 68 | `layout.ts` |
| Vollbild (Titel, Karte) | 844 × 390 | 1688 × 780 | Rahmen aus `build-single.mjs` |
| Atlaszelle der Figur | 17,003 log. Px | 112 × 112 im Blatt | `wuselwerker.atlas.json`, `ppl` 6,587 |

**Die wichtigste Zahl in dieser Tabelle ist die 30.** Ein Berufssymbol wird auf
30 CSS-Pixeln angezeigt — genauso groß wie die Figur im Spiel. Alles, was auf
einem Knopf steht, muss auf 30 Pixeln lesbar sein. Wir liefern in 128 px, also
gut viermal so groß; die Abnahme findet aber auf 30 statt.

---

## 3. Die Grafiken

### 3.1 Kulissenband — drei Parallaxschichten

**Zweck.** Ersetzt den prozeduralen Hügelhintergrund und ist damit der größte
einzelne Hebel für „dreidimensionaler und moderner".

**Was heute passiert.** `Scene.buildHills()` würfelt drei Stützstellenketten aus
und `drawHills()` zieht sie als geglättete Kurve mit einem senkrechten
Farbverlauf, einem Lichtsaum am Kamm, neun sehr weichen dunklen Flecken auf der
vordersten Schicht und 26 Baumsilhouetten aus je einem Rechteck und drei Kreisen.
Das ist sauber gebaut und begründet — und es ist trotzdem **flach**, weil jede
Schicht eine einzige Fläche mit einem linearen Verlauf ist. Volumen entsteht
nicht aus einem Verlauf, sondern aus Formen, die Licht und Schatten tragen:
Kuppen, Kerben, Waldkanten, Felsabbrüche, Nebel im Tal.

**Der Vorschlag.** Die drei Schichten werden **Bilder statt Kurven**: waagerecht
kachelbare Streifen, gezeichnet als echte Landschaft mit modelliertem Licht. Die
Parallaxrechnung aus `drawHills()` bleibt unverändert (`factor` 0,25 / 0,45 /
0,68, Bezugspunkt Weltmitte) — nur der Füllvorgang wird ersetzt. Bewuchs
(`drawBewuchs`) und Wiesenflecken (`this.flecken`) entfallen, sie stecken dann im
Bild.

**Ein Satz für alle fünf Welten.** Die Streifen werden **grau mit Alpha**
geliefert und zur Laufzeit mit `palette.hills[i]` → `palette.hillsDeep[i]`
eingefärbt. Das ist der Grund, warum es nur einen Satz braucht und nicht fünf:
Die Form kommt aus dem Bild, die Farbe aus der Palette. Grasland, Höhle und die
drei noch ungebauten Welten bedienen sich am selben Bild.

**Prompt — Fernschicht (`kulisse-fern`):**

```
A seamless horizontally tiling parallax background strip for a 2D side-scrolling
game: a very distant mountain and hill range seen from far away, low rolling
ridges with two or three taller peaks, hazy soft edges, thin mist pooling in the
valleys, no visible individual trees, no buildings, no roads, no people.
Straight-on side view, orthographic, horizon at eye level, no perspective
convergence, no vanishing point. The ridge line occupies the lower 70% of the
frame; everything above the ridge is solid flat magenta #FF00FF to be keyed out.
The strip must tile seamlessly left to right: the pixel column at the left edge
continues exactly into the right edge, and no distinctive peak sits closer than
80 px to either edge.
Painted in a single cool blue-grey hue (#A5CBDD lit, #8FBBD0 in the folds) with
strong value modelling only — the volume must read from light and shadow, not
from colour changes.
Aspect ratio 4:1, 1024 x 256 pixels.
STYLE BLOCK — modern hand-painted 2.5D game art, soft matte surfaces, rounded
volumes, gentle form shading, no visible brush strokes, no outlines, no cel
shading, no pixel art, no photographic texture. Lighting: bright neutral ambient
fill, one warm key light from the upper left front (#FFF4E2), one cool rim light
from behind right (#DFE8FF); matte roughness, no specular highlights, no lens
flare, no hard cast shadows. Aerial perspective: distant things get lighter and
paler, never darker. Clean, friendly, uncluttered.
NEGATIVE — no text, no letters, no numbers, no watermark, no signature, no logo,
no brand mark, no UI elements, no frames or borders, no vignette, no film grain,
no noise overlay, no chromatic aberration, no harsh black outlines, no
pixelation, no dithering, no photorealism, no glossy plastic, no neon, no lens
blur, no depth of field, no sky gradient, no clouds, no sun, no birds.
```

**Prompt — Mittelschicht (`kulisse-mitte`):**

```
A seamless horizontally tiling parallax background strip for a 2D side-scrolling
game: a middle-distance range of rounded green hills, closer than the far range,
with visible shoulders and folds, a few soft dips and hollows, the suggestion of
tree cover as massed dark shapes along the upper slopes rather than individual
trees, one shallow saddle between two hills. No buildings, no roads, no people,
no animals. Straight-on side view, orthographic, no perspective convergence.
The ridge line occupies the lower 75% of the frame; everything above the ridge
is solid flat magenta #FF00FF to be keyed out.
The strip must tile seamlessly left to right: the pixel column at the left edge
continues exactly into the right edge, and no distinctive feature sits closer
than 80 px to either edge.
Painted in a single muted blue-green hue (#7AA8BD lit, #5E8EA6 in the folds)
with strong value modelling only — the volume must read from light and shadow,
not from colour changes.
Aspect ratio 3.2:1, 1024 x 320 pixels.
STYLE BLOCK — modern hand-painted 2.5D game art, soft matte surfaces, rounded
volumes, gentle form shading, no visible brush strokes, no outlines, no cel
shading, no pixel art, no photographic texture. Lighting: bright neutral ambient
fill, one warm key light from the upper left front (#FFF4E2), one cool rim light
from behind right (#DFE8FF); matte roughness, no specular highlights, no lens
flare, no hard cast shadows. Aerial perspective: distant things get lighter and
paler, never darker. Clean, friendly, uncluttered.
NEGATIVE — no text, no letters, no numbers, no watermark, no signature, no logo,
no brand mark, no UI elements, no frames or borders, no vignette, no film grain,
no noise overlay, no chromatic aberration, no harsh black outlines, no
pixelation, no dithering, no photorealism, no glossy plastic, no neon, no lens
blur, no depth of field, no sky gradient, no clouds, no sun.
```

**Prompt — Nahschicht (`kulisse-nah`):**

```
A seamless horizontally tiling parallax background strip for a 2D side-scrolling
game: the nearest band of grassy hills directly behind the playfield, close
enough to show real form — a broad meadow shoulder, two shallow hollows with
soft shadow pooling in them, a low rock outcrop breaking through the turf, and a
loose row of stylised broadleaf trees standing on the crest, each tree a simple
rounded silhouette 30 to 60 px tall with a short trunk, spaced irregularly, never
touching each other. No buildings, no roads, no people, no animals, no fences.
Straight-on side view, orthographic, no perspective convergence.
The crest line and the trees occupy the lower 80% of the frame; everything above
is solid flat magenta #FF00FF to be keyed out.
The strip must tile seamlessly left to right: the pixel column at the left edge
continues exactly into the right edge, no tree is cut by either edge, and no
distinctive feature sits closer than 80 px to either edge.
Painted in a single deep green hue (#4A7F69 lit, #33604E in the folds and under
the trees) with strong value modelling only — the volume must read from light
and shadow, not from colour changes.
Aspect ratio 8:3, 1024 x 384 pixels.
STYLE BLOCK — modern hand-painted 2.5D game art, soft matte surfaces, rounded
volumes, gentle form shading, no visible brush strokes, no outlines, no cel
shading, no pixel art, no photographic texture. Lighting: bright neutral ambient
fill, one warm key light from the upper left front (#FFF4E2), one cool rim light
from behind right (#DFE8FF); matte roughness, no specular highlights, no lens
flare, no hard cast shadows. Clean, friendly, uncluttered.
NEGATIVE — no text, no letters, no numbers, no watermark, no signature, no logo,
no brand mark, no UI elements, no frames or borders, no vignette, no film grain,
no noise overlay, no chromatic aberration, no harsh black outlines, no
pixelation, no dithering, no photorealism, no glossy plastic, no neon, no lens
blur, no depth of field, no sky gradient, no clouds, no sun, no flowers.
```

**Format und Größe.**

| Datei | Bild | entspricht | Budget |
|---|---|---|---|
| `kulisse-fern.webp` | 1024 × 256 | 256 × 64 logische Pixel | ≤ 10 kB |
| `kulisse-mitte.webp` | 1024 × 320 | 256 × 80 logische Pixel | ≤ 14 kB |
| `kulisse-nah.webp` | 1024 × 384 | 256 × 96 logische Pixel | ≤ 18 kB |

Vier Bildpunkte je logischem Pixel — genau die Gerätepunktdichte bei Zoom 1 und
dpr 2. Bei Zoom 2,4 wird weich hochskaliert; das ist bei einer Kulisse richtig
und nicht falsch. Format WebP mit Alpha, verlustbehaftet, Qualität 70–76.

**Nachbearbeitung vor dem Einbau (drei Schritte, alle prüfbar):**
1. Magenta ausschlüsseln → Alphakanal. Restsaum unter 2 px.
2. Entsättigen zu Graustufen, Wertebereich auf 90–255 spreizen.
3. Kachelprobe: Bild zweimal nebeneinander legen, die Nahtspalte muss unauffindbar sein.

**Einbauweg.** Eingebettet. Neuer Ordner `src/art/ui/` mit eigenem `index.ts`
(`import.meta.glob('./*.webp', { eager: true, query: '?url', import: 'default' })`),
neue Datei `src/render/kulisse.ts` mit dem Einfärben und dem Kacheln. In
`scene.ts` ersetzt `drawKulisse()` den Rumpf von `drawHills()`; `buildHills()`,
`drawBewuchs()` und `this.flecken` entfallen. Die Streifen werden asynchron
geladen (wie das Figurenblatt in `Game.initArt()`); bis sie da sind, bleibt der
prozedurale Weg stehen — das Spiel muss auch mit halbfertiger Grafik laufen.

**Abnahmekriterium.**
- Die Kachelnaht ist bei 400 % Vergrößerung nicht zu finden (kein Helligkeits-
  oder Formsprung über die Nahtspalte).
- Kein undurchsichtiger Bildpunkt in der obersten Zeile des Streifens — sonst
  entsteht beim Schwenken eine sichtbare Oberkante.
- Der Höhenunterschied zwischen höchstem Kamm und tiefstem Sattel beträgt in
  jedem Streifen mindestens 25 % der Streifenhöhe. Ein Streifen, der flacher
  ist, ersetzt nur einen Verlauf durch ein Bild.
- In der Nahschicht sind bei 30 % Verkleinerung noch mindestens acht einzelne
  Bäume zählbar.
- Alle drei Dateien zusammen ≤ 42 kB.

---

### 3.2 Wolkenband

**Zweck.** Der Himmel ist heute ein Verlauf mit acht radial verlaufenden
Kreisgruppen darauf. Ein Wolkenband gibt ihm dieselbe Tiefe, die die Kulisse dem
Boden gibt, und es ist die billigste Schicht des ganzen Bildes.

**Prompt:**

```
A seamless horizontally tiling cloud band for a 2D side-scrolling game
background: soft cumulus clouds, three or four loose groups of different sizes,
flat-bottomed and billowing on top, generous empty sky between the groups, seen
straight on from the side at eye level, orthographic, no perspective.
Pure white to very pale grey clouds (#FFFFFF core, #D9E6F2 in the undersides) on
solid flat magenta #FF00FF to be keyed out — the magenta is the empty sky and
must show through generously, the clouds cover at most 45% of the frame.
Edges soft and feathered, never hard-outlined; the undersides slightly flatter
and cooler than the tops.
The band must tile seamlessly left to right: no cloud is cut by either edge and
the left edge column continues exactly into the right edge.
Aspect ratio 4:1, 1024 x 256 pixels.
STYLE BLOCK — modern hand-painted 2.5D game art, soft matte surfaces, rounded
volumes, gentle form shading, no visible brush strokes, no outlines, no cel
shading, no pixel art, no photographic texture. Lighting: bright neutral ambient
fill, one warm key light from the upper left front (#FFF4E2). Clean, friendly,
uncluttered.
NEGATIVE — no text, no letters, no watermark, no logo, no UI elements, no
frames, no vignette, no film grain, no noise, no photorealism, no storm clouds,
no rain, no lightning, no sun, no rays, no birds, no aircraft, no ground, no
horizon, no landscape.
```

**Format und Größe.** `wolken.webp`, 1024 × 256 (= 256 × 64 logische Pixel),
WebP mit Alpha, Qualität 72, **≤ 8 kB**. Anzeige: mit Parallaxfaktor 0,12 über
das Spielfeld gekachelt, ein Bildpunkt entspricht bei Zoom 1 etwa 0,52 CSS-Pixeln.

**Einbauweg.** Eingebettet, `src/art/ui/wolken.webp`. Ersetzt `Scene.drawWolken()`;
der Himmelsverlauf `drawSky()` bleibt prozedural — ein Verlauf als Bild kostet
Kilobyte und gewinnt nichts. Die Deckkraft bleibt einstellbar (heute 0,16–0,38)
und wird je Thema gesetzt: in der Höhle steht das Band auf 0.

**Abnahmekriterium.** Naht unauffindbar bei 400 %. Magentaanteil des Rohbilds
zwischen 50 % und 65 % der Fläche (weniger = zugedeckter Himmel, mehr = keine
Wolke). Datei ≤ 8 kB.

---

### 3.3 Reliefkachel für die Erde

**Zweck.** Der Erdquerschnitt füllt bis zur Hälfte des Bildes und ist die
einzige Fläche, die der Spieler wirklich anfasst. Er hat heute Struktur, aber
kein **Volumen**.

**Was heute passiert.** `terrainView.ts` rechnet jeden Bildpunkt aus der Maske:
zwei Erdfarben über die Tiefe überblendet, Schollen und Korn aus zweifachem
Wertrauschen, Kiesel, dunkle Einschlüsse, Wurzelsaum, Kantenverschattung. Das ist
gut begründet und muss bleiben — die Maske ändert sich bei jedem Spatenstich,
eine gemalte Geländegrafik könnte an keiner Schnittkante stimmen.

**Was fehlt.** Wertrauschen erzeugt Flecken, keine Klumpen. Ein Klumpen hat eine
**beleuchtete Oberseite und eine beschattete Unterseite**; genau daran erkennt
das Auge Erde statt Papier. Die Kachel liefert diese eine Sache und nichts sonst:
ein Graustufenrelief, das auf die vorhandene Farbe multipliziert wird.

**Prompt:**

```
A seamless tiling greyscale relief texture for a cross-section of soil in a 2D
game: irregular rounded clods and lumps of packed earth of mixed sizes, from
6 px to 40 px across, tightly packed, each lump lit from directly above so its
top is bright and its underside falls into shadow; a few embedded pebbles with
the same top-lit shading; thin dark crevices between the clods. Flat frontal
view of a cut face, orthographic, no perspective, no depth of field.
Pure greyscale only, no colour at all. Mid grey #808080 is the neutral level;
highlights reach #D8D8D8, the deepest crevices reach #4A4A4A; the average
brightness of the whole image is between #7A7A7A and #8A8A8A.
Must tile seamlessly in BOTH directions — top edge continues into bottom edge,
left edge into right edge, no visible repeating feature, no directional streak,
no visible grid.
Square, 256 x 256 pixels.
STYLE BLOCK — soft matte surfaces, rounded volumes, gentle form shading, no
visible brush strokes, no outlines, no cel shading, no pixel art. Bright neutral
ambient fill plus one light from directly above.
NEGATIVE — no text, no letters, no watermark, no logo, no colour, no green, no
grass, no plants, no roots, no insects, no photorealism, no photographic
texture, no noise overlay, no film grain, no vignette, no seams, no tiling
artefacts, no repeating pattern, no cracks in a regular grid.
```

**Format und Größe.** `erde-relief.webp`, 256 × 256, Graustufen, WebP verlustbehaftet
Qualität 80, **≤ 6 kB**. Ein Bildpunkt = ein logischer Pixel der Maske, also 1:1
und ohne Skalierung.

**Einbauweg.** Eingebettet, `src/art/ui/erde-relief.webp`. In `TerrainView` einmal
in ein Offscreen-Canvas gelegt und als `Uint8Array` gelesen; in `paint()` kommt
`hell += (relief[(y & 255) * 256 + (x & 255)] - 128) * STAERKE` hinzu, mit
`STAERKE` ≈ 0,22. **Additiv, nicht ersetzend** — die vorhandene prozedurale
Struktur bleibt vollständig, das Relief legt sich darüber. Ist die Kachel nicht
geladen, ändert sich nichts (`STAERKE = 0`).

Das ist der einzige Posten dieser Liste, der ein System berührt, dessen Autor
ausdrücklich für prozedurale Erzeugung argumentiert hat. Deshalb: additiv,
abschaltbar, und ein Vorher-Nachher-Bild vor der Übernahme.

**Abnahmekriterium.** Die Kachel viermal in beide Richtungen gelegt: kein
sichtbares Wiederholungsmuster, keine Naht. Mittlere Helligkeit zwischen 122 und
138 (sonst hebt oder senkt die Kachel die Gesamthelligkeit der Erde).
Standardabweichung zwischen 22 und 40. Datei ≤ 6 kB.

---

### 3.4 Berufsknöpfe — die acht Symbole

**Zweck.** Die acht Knöpfe unten sind die einzige Stelle, an der der Spieler das
Spiel bedient. Sie sollen auf einen Blick sagen, was passiert, und den Farbcode
lehren, den die Figur auf dem Feld dann trägt.

**Was heute passiert.** `icons.ts` zeichnet acht gefüllte Vektorformen in **einer**
Farbe: ein Pfeil auf eine Wand (in drei Winkeln für Gräber, Schrägbagger, Rammer),
Leiter, Schirm, Bombe, Sperre, Treppe. Die Begründung dort ist richtig und bleibt
gültig: gefüllte Silhouetten statt Striche, und eine geteilte Form für die drei
Grabberufe.

**Was fehlt — und was ausdrücklich *nicht* getan wird.** Die Merkliste erwägt
„gegebenenfalls mit der Figur darauf". Dagegen spricht eine Messung aus dem
eigenen Haus: `docs/wuselwerker.md` weist nach, dass sich die Silhouetten dieser
Figur über alle Posen zu **74,6 %** überdecken und erst das Gerät den Unterschied
trägt. Acht fast gleiche Figuren auf acht 30-Pixel-Knöpfen wären damit acht
gleiche Knöpfe. **Das Gerät bleibt der Träger der Identität.** Die Figur kommt
nur dort dazu, wo das Gerät allein nichts sagt: beim **Blocker** (dort *ist* die
Figur das Gerät) und beim **Schirmspringer** (ein Schirm ohne Last ist ein Pilz).

Neu gegenüber heute sind drei Dinge: **Volumen** (jedes Symbol ist ein Gegenstand
mit Oberlicht und Kontaktschatten statt eines Piktogramms), **die Berufsfarbe**
(dieselbe wie am Stirnband) und **eine gemeinsame Grundform** — jedes Symbol steht
auf einer angedeuteten Standfläche, damit die acht als Reihe lesen.

**Prompt (acht Mal einzeln laufen lassen, Stilblock unverändert):**

```
A single game UI icon, rendered as a small three-dimensional object floating on
a fully transparent background. Centred, filling 80% of the frame, seen from
slightly above at a shallow three-quarter angle so the object has visible
thickness and a top face. A soft elliptical contact shadow sits directly beneath
it, no other shadow. Chunky, bold, simplified forms with thick proportions — the
whole silhouette must stay readable when the image is scaled down to 30 x 30
pixels; no part thinner than 1/12 of the frame width.
Square, 128 x 128 pixels, transparent background (alpha), nothing touching the
frame edges.

SUBJECT (use exactly one per generation):
1  CLIMBER  — a short sturdy wooden ladder standing upright and leaning against
   a stone wall edge at the right, four rungs, main accent colour #A87EBE.
2  FLOATER  — an open dome-shaped canopy of cream cloth (#D8CBB4) with a scalloped
   rim, four cords running down to a tiny round bundle hanging beneath it, main
   accent colour #EE9EB0.
3  BOMBER   — a round black iron bomb with a short curved fuse and a bright spark
   at its tip, main accent colour #5C5C68, spark in #FFC93C.
4  BLOCKER  — a stout little figure seen from the front standing with both arms
   held straight out sideways like a barrier, very large round head, huge
   voluminous blue hair (#3851B6), short green tunic (#486820), warm tan skin
   (#D29059), a headband across the hair in #80A86C; behind it a low striped road
   barrier. Main accent colour #80A86C.
5  BUILDER  — three ascending stone-and-timber steps climbing to the upper right,
   a wooden plank being laid onto the topmost step, main accent colour #569CB2.
6  BASHER   — a heavy iron wedge driving horizontally to the right into a broken
   rock face, three rubble chunks flying off, main accent colour #E8674F.
7  MINER    — a heavy spade blade driving diagonally down-right at exactly 45
   degrees into a broken rock face, three rubble chunks flying off, main accent
   colour #C87B2E.
8  DIGGER   — a heavy spade blade driving straight down into broken ground, three
   rubble chunks flying off to the sides, main accent colour #E2B044.

COLOUR RULE: the named accent colour must cover at least 35% of the object's
visible area; the rest is dark iron (#3A3430) and warm wood (#6B5A46). Never use
green hair together with a blue tunic.

STYLE BLOCK — modern hand-painted 2.5D game art, soft matte surfaces, rounded
volumes, gentle form shading, no visible brush strokes, no outlines, no cel
shading, no pixel art, no photographic texture. Lighting: bright neutral ambient
fill, one warm key light from the upper left front (#FFF4E2), one cool rim light
from behind right (#DFE8FF); matte roughness, no specular highlights, no hard
cast shadows. Clean, friendly, uncluttered.
NEGATIVE — no text, no letters, no numbers, no watermark, no signature, no logo,
no brand mark, no frame, no border, no background colour, no drop shadow onto
the transparency, no glow, no sparkles, no vignette, no film grain, no noise, no
photorealism, no glossy plastic, no neon, no thin lines, no hatching, no
gradients across the background.
```

**Format und Größe.** Acht Zellen à 128 × 128 in **einem** Blatt
`berufe.webp`, 1024 × 128, WebP mit Alpha, Qualität 80, **≤ 16 kB**.
Reihenfolge der Zellen **zwingend** wie `SKILLS` in `src/core/types.ts`:
climber, floater, bomber, blocker, builder, basher, miner, digger.
Anzeigegröße 30 × 30 CSS (60 × 60 Gerätepunkte) — geliefert wird gut das
Vierfache.

**Einbauweg.** Eingebettet, `src/art/ui/berufe.webp`. `drawSkillIcon()` in
`icons.ts` bekommt einen Bildweg vorgeschaltet und behält den Vektorweg als
Rückfallebene (dieselbe Bauform wie beim Figurenblatt). Zwei Folgeänderungen sind
Pflicht und klein:

1. **Die drei Zustände.** Heute geben die Symbole ihre Farbe von außen
   (`selected` weiß, `usable` hell, aufgebraucht `#4A5A75`). Ein farbiges Bild
   kann das nicht. Stattdessen: gewählt = Bild unverändert, wählbar = Bild
   unverändert, aufgebraucht = Bild mit `globalAlpha 0.35` über einem
   abgedunkelten Knopf. Der Zustand steckt ohnehin schon in Fläche, Randbalken
   und Plakette.
2. **Der Symbolplatz.** `hud.ts` zeichnet mit `Math.min(b.w * 0.6, 30)`. Für ein
   modelliertes Symbol ist das knapp; auf **`Math.min(b.w * 0.62, 34)`** erhöhen.
   Eine Zeile.

**Abnahmekriterium.**
- Auf 30 × 30 gerechnet und ausgedruckt sind alle acht Symbole von einer Person,
  die das Spiel nicht kennt, den acht Berufsnamen zuzuordnen — mindestens sechs
  von acht richtig.
- Die drei Grabsymbole (Rammer, Schrägbagger, Gräber) zeigen dieselbe Gerätform
  in **exakt** 0°, 45° und 90°; die Winkelabweichung beträgt höchstens 3°.
- Jedes Symbol füllt mindestens 60 % und höchstens 85 % der Zellbreite.
- Kein undurchsichtiger Bildpunkt berührt einen Zellrand.
- Blatt ≤ 16 kB.

---

### 3.5 Titelbild

**Zweck.** Der erste Bildschirm. Heute steht dort auf `#0A0E16` das Wort
WUSELWERK in der Systemschrift und darunter „Welt 1 — Grasland · MVP-Prototyp".

**Prompt:**

```
Key art for a mobile puzzle game, wide landscape format, no text anywhere in the
image.
Scene: a sunny grassland hillside seen from the side in a flat, almost
orthographic side-scroller perspective. In the middle ground the turf is cut
open like a cross-section, showing a deep brown earth wall with a tunnel bored
horizontally into it and a shaft dug straight down; warm light spills out of a
stone archway set into the earth on the right, glowing amber. Six or seven tiny
chubby workers are busy along the cut: one digging downward with a spade, one
driving a wedge sideways into the wall, one climbing the earth face, one
drifting down under a small cream parachute, one standing with both arms out
like a barrier, one carrying a plank. They are small — each about one twelfth of
the image height — and they read as silhouettes with colour, not as portraits.
Behind them three receding bands of hills in cool blue-greens, and a bright blue
sky with soft cumulus clouds.
THE WORKERS: very large round heads, huge voluminous BLUE hair (#3851B6), short
GREEN tunics (#486820), warm tan skin (#D29059), tiny legs, no visible facial
detail beyond two large friendly eyes. Never green hair with a blue tunic.
COLOURS: sky #2F74B8 to #C6E6F2, distant hills #A5CBDD and #7AA8BD, near hills
#4A7F69, turf #63B23F, earth #7A5230 down to #452C19, doorway glow #FFE6A8.
COMPOSITION: the middle 45% of the width and the middle 70% of the height is a
protected safe area that must stay calm and uncluttered — a title will be placed
there later. Nothing important within 60 px of any edge. Aspect ratio 2.16:1,
1280 x 592 pixels, opaque background, full bleed.
STYLE BLOCK — modern hand-painted 2.5D game art, soft matte surfaces, rounded
volumes, gentle form shading, no visible brush strokes, no outlines, no cel
shading, no pixel art, no photographic texture. Lighting: bright neutral ambient
fill, one warm key light from the upper left front (#FFF4E2), one cool rim light
from behind right (#DFE8FF); matte roughness, no specular highlights, no lens
flare, no hard cast shadows. Aerial perspective: distant things get lighter and
paler, never darker. Clean, friendly, uncluttered.
NEGATIVE — no text, no letters, no numbers, no title, no watermark, no
signature, no logo, no brand mark, no UI elements, no buttons, no frames, no
borders, no vignette, no film grain, no noise, no chromatic aberration, no
photorealism, no glossy plastic, no neon, no lens blur, no depth of field, no
blood, no weapons, no faces in close-up, no green hair with blue tunic.
```

**Format und Größe.** `titel.webp`, 1280 × 592 (2,16:1 — das Seitenverhältnis
des Bezugsgeräts 844 × 390), WebP verlustbehaftet Qualität 74, **≤ 40 kB**.
Anzeige formatfüllend, 1688 × 780 Gerätepunkte; das Bild wird um Faktor 1,32
hochskaliert, was bei einem gemalten Motiv niemand sieht. Im Hochformat wird auf
die mittleren 45 % der Breite beschnitten — daher die Schutzzone.

**Einbauweg.** Eingebettet, `src/art/ui/titel.webp`. Neuer Bildschirm
`Screen = 'titel'` in `game.ts`, gezeichnet in `overlays.ts`
(`drawTitel()`): Bild formatfüllend, darüber die Wortmarke aus §3.6, darunter
zwei Knöpfe („Spielen", „Weltauswahl") in der vorhandenen `button()`-Form.

**Abnahmekriterium.**
- In der Schutzzone (mittlere 45 % × 70 %) schwankt die Helligkeit um höchstens
  20 Stufen; eine Wortmarke muss dort ohne Hinterlegung lesbar sein.
- Auf 422 × 195 verkleinert sind mindestens vier arbeitende Figuren einzeln
  zählbar.
- Kein Buchstabe im Bild.
- Datei ≤ 40 kB.

---

### 3.6 Wortmarke

**Zweck.** Der Schriftzug des Spiels. **Er muss ein Bild sein**, denn die
Einzeldatei darf keine Schriftart nachladen — die Systemschrift ist alles, was
sonst zur Verfügung steht, und ein Titel in der Systemschrift ist kein Titel.

> **Abhängigkeit.** Die Merkliste sieht zusätzlich einen Nachsatz vor: fünf
> Buchstaben für die Figur plus Zusatz („Name — der Untertitel"). Der Name steht
> noch nicht fest. Die Wortmarke wird deshalb **zweiteilig** geliefert: Zeile 1
> „WUSELWERK" jetzt, Zeile 2 später als eigene kleine Grafik im selben Stil. Wer
> beides in einem Bild bestellt, bestellt es zweimal.

**Prompt:**

```
A game wordmark: the single word "WUSELWERK" in capital letters, drawn as one
solid three-dimensional lettering piece on a fully transparent background.
Letters are chunky, rounded and slightly irregular, as if carved from warm stone
and packed earth; each letter has a visible top bevel catching warm light and a
darker under-edge, giving real thickness. A thin band of green turf with a few
short grass blades sits along the top edges of the letters, and a little loose
soil clings to their bottoms. The baseline arcs very gently upward in the middle,
no more than 4% of the image height.
COLOURS: letter faces warm sandy stone #CBB89C to #8A705E, under-edges #544636,
turf band #63B23F with #35601F beneath, no other colours.
The word fills 92% of the width, is horizontally centred, and nothing touches
the frame edges. Aspect ratio 32:9, 1024 x 288 pixels, transparent background
(alpha).
Spelling must be exactly W-U-S-E-L-W-E-R-K, nine letters, one word, no
hyphen, no space, no second line, no subtitle, no tagline.
STYLE BLOCK — modern hand-painted 2.5D game art, soft matte surfaces, rounded
volumes, gentle form shading, no visible brush strokes, no outlines, no cel
shading, no pixel art. Lighting: bright neutral ambient fill, one warm key light
from the upper left front (#FFF4E2), one cool rim light from behind right
(#DFE8FF); matte roughness, no specular highlights, no hard cast shadows.
NEGATIVE — no additional text, no subtitle, no tagline, no numbers, no
watermark, no signature, no logo mark, no brand mark, no frame, no border, no
background, no drop shadow onto the transparency, no glow, no sparkles, no
gradient background, no banner, no ribbon, no shield, no serif typeface, no
handwriting, no calligraphy, no metallic chrome, no gold, no neon, no misspelled
letters, no extra letters, no mirrored letters.
```

**Format und Größe.** `wortmarke.webp`, 1024 × 288, WebP mit Alpha, Qualität 82,
**≤ 12 kB**. Anzeige höchstens 440 CSS-Pixel breit (880 Gerätepunkte), also mit
Reserve.

**Einbauweg.** Eingebettet, `src/art/ui/wortmarke.webp`. Gezeichnet im
Titelbildschirm und als kleine Fassung (Breite 180 CSS) oben auf der Weltauswahl.

**Abnahmekriterium.** Die neun Buchstaben stehen in der richtigen Reihenfolge und
ohne zusätzliche Zeichen — das ist bei Bildmodellen der häufigste Ausfall und
wird zuerst geprüft. Auf 180 CSS-Pixel Breite verkleinert ist das Wort noch
lesbar. Kein undurchsichtiger Bildpunkt am Rand. Datei ≤ 12 kB.

---

### 3.7 Weltauswahl — fünf Welttafeln

**Zweck.** Die Weltauswahl soll senkrecht laufen und grafisch aufbereitet sein.
Eine Welt braucht dafür ein **Bild, das sie zeigt** — heute unterscheiden sich
die fünf Abschnitte nur durch einen Himmelsverlauf und zwei prozedurale
Hügelketten, und drei der fünf teilen sich sogar die Palette der Höhle, weil es
für Rost, Frost und Magma noch keine gibt.

**Was gezeichnet bleibt.** Weg, Levelpunkte, Sterne, Laternen, Tor und Figur
bleiben prozedural (`weltkarte.ts`) — sie hängen am Fortschritt und dürfen kein
Bild sein. Die Tafel ist die Kopfplatte eines Abschnitts, nicht sein Hintergrund.

**Prompt (fünf Mal laufen lassen, je einmal je Szene):**

```
A small illustrated title plate for one world of a mobile puzzle game: a wide
landscape vignette seen from the side in a flat, almost orthographic
side-scroller perspective, showing the character of this world in one glance.
No characters, no creatures, no text.
Composition: three depth bands — a distant skyline, a middle band of terrain,
and a near cut edge of ground along the bottom 25% showing the material in
cross-section. The four corners fade gently into the surrounding colour so the
plate can sit on a coloured panel without a hard frame.
Aspect ratio 16:9, 384 x 216 pixels, opaque background.

SCENE (use exactly one per generation):
1  GRASSLAND — soft rolling green meadow hills under a bright blue sky, a few
   round broadleaf trees, the cut edge showing warm brown soil under a green turf
   crust. Colours: sky #2F74B8 to #C6E6F2, hills #A5CBDD / #7AA8BD / #4A7F69,
   turf #63B23F, earth #7A5230 to #452C19.
2  CRYSTAL RAVINE — a narrow underground gorge, walls of cold blue-violet rock
   with glowing pale blue crystal veins lighting the space from within, no sky.
   Colours: #1B2450 to #6F8ECD, rock #3D4A6F, crystal glow #BFE6FF, cut edge
   #4A5788 to #232C52.
3  RUSTWORKS — a heap of corroded steel plate, riveted girders and scrap under a
   dull ochre haze, everything angular and stacked, the cut edge showing rusted
   sheet layers. Colours: haze #C0A070, steel #9AA5B5, rust #C07A3A and #7A4520,
   deep shadow #3A2A1E.
4  FROST RAVINE — a tall narrow icy chasm, pale blue-white ice walls with
   hanging icicles, drifting snow, thin cold light from far above. Colours: ice
   #9FD8E8 and #D8EEF5, deep ice #4A7A93, shadow #2A4457.
5  FLUE — a vertical volcanic shaft, dark basalt walls with glowing orange cracks
   and rising heat shimmer, a molten pool far below. Colours: basalt #3A2A28,
   glow #E2653A and #FFC93C, smoke #6A5A55, deep shadow #1A1214.

STYLE BLOCK — modern hand-painted 2.5D game art, soft matte surfaces, rounded
volumes, gentle form shading, no visible brush strokes, no outlines, no cel
shading, no pixel art, no photographic texture. Lighting: bright neutral ambient
fill, one warm key light from the upper left front (#FFF4E2), one cool rim light
from behind right (#DFE8FF); matte roughness, no specular highlights, no hard
cast shadows. Aerial perspective: distant things get lighter and paler, never
darker. Clean, friendly, uncluttered.
NEGATIVE — no text, no letters, no numbers, no watermark, no signature, no logo,
no brand mark, no UI elements, no buttons, no frames, no borders, no vignette,
no film grain, no noise, no photorealism, no glossy plastic, no neon, no lens
blur, no depth of field, no characters, no creatures, no people, no animals, no
buildings with windows, no vehicles.
```

**Format und Größe.** Fünf Dateien `welt-1.webp` … `welt-5.webp`, je 384 × 216,
WebP verlustbehaftet Qualität 72, **je ≤ 8 kB, zusammen ≤ 40 kB**. Anzeige
192 × 108 CSS-Pixel (= 384 × 216 Gerätepunkte bei dpr 2), also exakt 1:1 ohne
Skalierung.

**Einbauweg.** Eingebettet, `src/art/ui/welt-*.webp`. In `weltkarte.ts` an den
Kopf jedes Weltabschnitts, links neben `weltName()`, mit abgerundeter Ecke
beschnitten. Das setzt den Umbau auf **senkrechtes Band** voraus: `bandY()` und
die x-Rechnung tauschen die Achsen, `KartenPunkt.x` wird zur Tiefe im Band. Der
Umbau ist Code und steht nicht in dieser Liste, die Tafel aber setzt ihn voraus.

**Abnahmekriterium.** Die fünf Tafeln sind bei 96 × 54 Pixeln (halbe
Anzeigegröße) noch auseinanderzuhalten — Prüfung: fünf Personen ordnen die fünf
Bilder den fünf Weltnamen zu, mindestens vier von fünf richtig. Jede Tafel zeigt
mindestens drei Tiefenstufen. Je Datei ≤ 8 kB.

---

### 3.8 Weltembleme

**Zweck.** Ein rundes Zeichen je Welt, klein genug für das Weltentor, die
Belohnungstafel, die Kopfzeile und später die Bestenliste. Die Tafel aus §3.7 ist
dafür zu detailliert; ab etwa 60 Pixeln zerfällt sie.

**Prompt (fünf Mal laufen lassen):**

```
A single round game emblem on a fully transparent background: a circular badge
seen straight on, filling 88% of the frame, with a slightly raised rim catching
warm light from the upper left and a soft contact shadow beneath. Inside the
circle one bold simplified symbol, filling at least half of the disc, readable
as a silhouette when scaled down to 48 x 48 pixels. No text, no numbers.
Square, 128 x 128 pixels, transparent background (alpha).

EMBLEM (use exactly one per generation):
1  GRASSLAND  — a rounded green hill with a single broadleaf tree on it.
   Disc #4A7F69, symbol #63B23F, rim #8FBBD0.
2  CRYSTAL RAVINE — three upright crystal shards of different heights.
   Disc #33406E, symbol #8AA5E8, rim #6F8ECD.
3  RUSTWORKS  — a riveted steel plate corner with three bolts.
   Disc #5A3A22, symbol #C07A3A, rim #9AA5B5.
4  FROST RAVINE — three hanging icicles under a straight ledge.
   Disc #2A4457, symbol #9FD8E8, rim #D8EEF5.
5  FLUE       — a narrow chimney silhouette with a rising flame inside it.
   Disc #3A2A28, symbol #E2653A, rim #FFC93C.

STYLE BLOCK — modern hand-painted 2.5D game art, soft matte surfaces, rounded
volumes, gentle form shading, no visible brush strokes, no outlines, no cel
shading, no pixel art. Lighting: bright neutral ambient fill, one warm key light
from the upper left front (#FFF4E2), one cool rim light from behind right
(#DFE8FF); matte roughness, no specular highlights.
NEGATIVE — no text, no letters, no numbers, no watermark, no signature, no
brand mark, no square frame, no background, no drop shadow onto the
transparency, no glow, no sparkles, no ribbons, no banners, no heraldry, no
gemstone facets, no metallic chrome, no gold, no neon, no thin lines.
```

**Format und Größe.** Ein Blatt `weltembleme.webp`, 640 × 128 (fünf Zellen à
128 × 128), WebP mit Alpha, Qualität 82, **≤ 10 kB**. Anzeige 48–64 CSS-Pixel.

**Einbauweg.** Eingebettet, `src/art/ui/weltembleme.webp`. In `weltkarte.ts` in
den Torbogen (`tor()`) und in die Kopfzeile jedes Abschnitts.

**Abnahmekriterium.** Auf 48 × 48 verkleinert ist jedes Symbol als Form
erkennbar (die inneren Formen sind auch dann noch mindestens 6 Pixel breit).
Alle fünf Scheiben haben denselben Durchmesser (Abweichung ≤ 2 Pixel). Blatt
≤ 10 kB.

---

### 3.9 Avatare

**Zweck.** Auswahlbild bei der Spieleranmeldung und Kennzeichen in der
Bestenliste (Merkliste: „Der Spieler muss angemeldet sein: Spielername und
Avatar").

**Die Regel, die hier scharf wird.** Die Avatare sind Abwandlungen derselben
Figur. Deshalb steht die Vorgabe aus §0.4 in diesem Prompt zweimal: **nie grünes
Haar zusammen mit blauer Tunika.** Die zwölf Kombinationen unten sind so gewählt,
dass diese Paarung gar nicht erst entstehen kann — grünes Haar kommt nur über
warmen oder neutralen Tuniken vor.

> **Korrektur nach der ersten Lieferung.** Die erste Fassung dieser Liste
> unterschied die Paare 1/2, 3/4, 5/6 und 7/8 nur an der Tunika — und der
> Kragen ist im Porträt ein schmaler Saum am Bildrand. Zwei gelieferte
> Varianten waren praktisch dasselbe Bild („avatargrafiken sehen zu gleich
> aus", und es stimmte; sie verletzten sogar das eigene Abnahmekriterium,
> denn Haar- UND Scheibenfarbe waren identisch). Was ein Porträt bei 28
> Pixeln unterscheidet, sind **Haarfarbe, Haarsilhouette und
> Scheibenfarbe** — deshalb trägt jetzt jede Variante ihre eigene
> Silhouette und ihre eigene Scheibe; die Tunika ist nur noch Beiwerk.

**Prompt (zwölf Mal laufen lassen, Kopf und Schultern):**

```
A game avatar portrait: head and shoulders of a small chubby cartoon worker,
seen from the front, tilted very slightly to one side, centred in the frame and
filling 82% of its height. Very large round head, warm tan skin (#D29059 with
#B88050 in the shadows), two large friendly round eyes, a small mouth, no nose
detail, no ears visible under the hair, a short tunic collar visible at the
bottom. Behind the head a plain flat circular disc in a single colour, filling
the frame; nothing outside the disc.
The HAIR STYLE named in the variant is the identity of this avatar: exaggerate
its silhouette so it reads at 28 x 28 pixels, and keep the hair voluminous and
soft in every style.
Square, 128 x 128 pixels.

VARIANT (use exactly one per generation) — hair colour / HAIR STYLE / tunic / disc:
 1  deep blue #3851B6    / huge rounded cloud of curls           / green #486820 / disc #2A3A5E
 2  amber #E2B044        / short tousled crop, wind-swept        / green #486820 / disc #5E4718
 3  violet #A87EBE       / two big round side puffs              / green #486820 / disc #4A2F55
 4  copper red #C4553A   / tall loose top knot bun               / sand #CBB89C  / disc #7A3A28
 5  moss green #6E8F3A   / wavy shoulder-length bob              / rust #C07A3A  / disc #35401E
 6  snow white #E4E9EE   / short curly crop with a cowlick       / rust #C07A3A  / disc #46525E
 7  ink black #2A2E36    / thick straight fringe, bowl silhouette/ amber #E2B044 / disc #6E5A20
 8  teal #3F9E96         / spiky brush-up, flame-like tips       / rust #C07A3A  / disc #1F4A48
 9  deep blue #3851B6    / two chunky braids hanging forward     / sand #CBB89C  / disc #204060
10  copper red #C4553A   / big curly mohawk ridge, shaved sides  / green #486820 / disc #5A2A20
11  violet #A87EBE       / asymmetric long sweep over one eye    / rust #C07A3A  / disc #38254A
12  moss green #6E8F3A   / short afro with a zigzag parting      / sand #CBB89C  / disc #2A331A
HARD RULE: never green hair together with a blue tunic, in any variant, under
any circumstance. No two variants share the same hair style.

STYLE BLOCK — modern hand-painted 2.5D game art, soft matte surfaces, rounded
volumes, gentle form shading, no visible brush strokes, no outlines, no cel
shading, no pixel art, no photographic texture. Lighting: bright neutral ambient
fill, one warm key light from the upper left front (#FFF4E2), one cool rim light
from behind right (#DFE8FF); matte roughness, no specular highlights, no hard
cast shadows. Clean, friendly, uncluttered.
NEGATIVE — no text, no letters, no numbers, no watermark, no signature, no logo,
no brand mark, no frame, no border, no vignette, no film grain, no noise, no
photorealism, no glossy plastic, no neon, no hats, no helmets, no glasses, no
jewellery, no weapons, no beards, no visible ears, no realistic human
proportions, no adult face, no green hair with a blue tunic.
```

**Format und Größe.** Ein Blatt `avatare.webp`, 512 × 384 (vier Spalten × drei
Zeilen à 128 × 128), WebP verlustbehaftet Qualität 78, **≤ 26 kB**. Anzeige in
der Auswahl 64 × 64 CSS (= 128 Gerätepunkte, exakt 1:1), in der Bestenliste
28–40 CSS.

**Einbauweg.** Eingebettet, `src/art/ui/avatare.webp`. Neue Datei
`src/render/avatare.ts` mit `drawAvatar(ctx, index, x, y, groesse)`; der Index
wandert nach `localStorage` neben `wuselwerk.progress.v1` (siehe `storage.ts`).

**Abnahmekriterium.**
- Zwölf Zellen, exakt 128 × 128, Raster ohne Versatz.
- Auf 28 × 28 verkleinert sind alle zwölf **paarweise** unterscheidbar.
  Prüfung: Jedes Paar unterscheidet sich in mindestens **zwei** der drei
  Merkmale Haarfarbe (ΔE ≥ 15 in CIE-L\*a\*b\*), Haarsilhouette (benennbar
  verschieden: Wolke, Schopf, Puschel, Knoten, Bob, Wirbel, Pony, Bürste,
  Zöpfe, Kamm, Strähne, Scheitel) und Scheibenfarbe (ΔE ≥ 15).
- Keine Variante trägt grünes Haar über blauer Tunika.
- Blatt ≤ 26 kB.

---

### 3.10 Der Schirm als Modellteil (`.glb`)

**Zweck.** Der Schirm des Schirmspringers ist heute das einzige gezeichnete
Gerät, das **nicht** an der Hand hängt: `werkzeug.ts` setzt ihn auf die
Mittellinie über dem Kopf, weil das Rig je nach Drehwinkel mal die linke und mal
die rechte Hand als „vorn" meldet. Der gezeichnete Schirm steht deshalb in jeder
Pose flach von vorn da, während die Figur um 26° weggedreht ist. Ein **gebackener**
Schirm dreht sich mit — er wird Teil desselben Renderdurchgangs.

**Das ist die härteste Zahlenvorgabe dieser Datei**, weil ein gebackener Schirm
in die Zelle passen muss und der gezeichnete das nicht tut.

**Die Rechnung.** Aus `wuselwerker.atlas.json` und `bake-figur.mjs`:

| Größe | Wert |
|---|---|
| Zelle | 17,003 logische Pixel im Quadrat |
| Fusspunkt in der Zelle | x 8,5015 · y 16,5476 von oben |
| Kopffreiheit über der Sohle | **16,55 logische Pixel** |
| Figurenhöhe `floating` | 12,8 logische Pixel, Breite 9,8 |
| Modelleinheit | `FIGUR_EINHEITEN` 0,861 = 12 logische Pixel → **1 log. Px = 0,07175 Einheiten** |
| gezeichneter Schirm heute | Mitte bei 17,05 log. Px über der Sohle, Breite 7,4 |

Der gezeichnete Schirm sitzt also **0,5 Pixel über der Zelloberkante**. Der
Backvorgang prüft ausdrücklich auf Anschnitt und bricht ab, wenn ein
undurchsichtiger Bildpunkt den Zellrand berührt. Der gebackene Schirm muss
deshalb **tiefer sitzen**:

| | logische Pixel über der Sohle | Modelleinheiten |
|---|---|---|
| Unterkante der Kuppel (Krempe) | 13,7 | 0,983 |
| Oberkante der Kuppel (Scheitel) | **höchstens 16,0** | 1,148 |
| Kuppelbreite | 8,0 bis 9,0 | 0,574 bis 0,646 |
| Kuppeltiefe (Krempe bis Scheitel) | 2,3 bis 2,8 | 0,165 bis 0,201 |
| Stiel nach unten (Griff) | 3,0 bis 3,5 | 0,215 bis 0,251 |

Das ist eine Absenkung um gut zwei Pixel gegenüber heute — der Schirm rückt näher
an die erhobenen Hände, was ohnehin richtiger aussieht.

**Referenzbild-Prompt** (für Bild→3D; die Modelle liefern daraus deutlich
sauberere Netze als aus reinem Text):

```
A single object on a fully transparent background: a small open parachute
canopy, seen straight from the front, orthographic, no perspective, no
foreshortening. The canopy is a shallow dome of cream-coloured cloth (#D8CBB4
lit, #A2937C in the folds), clearly wider than it is tall, with six gentle
radial gores meeting at a small round apex and a softly scalloped lower rim.
From the rim, four thin dark cords (#4A4238) converge downward to a short
wooden handle (#6B5A46) held together at the bottom. The whole object is
symmetrical about its vertical axis. Chunky, toy-like, thick-walled proportions;
the cloth reads as a solid shell, not as thin fabric.
Proportions are binding: total width is 3.5 times the canopy depth from rim to
apex, and the cords plus handle together are 1.4 times the canopy depth.
Square, 1024 x 1024 pixels, transparent background, the object centred and
filling 85% of the frame, nothing touching the edges.
STYLE BLOCK — modern hand-painted 2.5D game art, soft matte surfaces, rounded
volumes, gentle form shading, no visible brush strokes, no outlines, no cel
shading, no pixel art, no photographic texture. Lighting: bright neutral ambient
fill, one warm key light from the upper left front (#FFF4E2), one cool rim light
from behind right (#DFE8FF); matte roughness, no specular highlights, no hard
cast shadows.
NEGATIVE — no text, no letters, no watermark, no logo, no brand mark, no person,
no character, no hands, no rigging harness, no backpack, no straps, no military
gear, no camouflage, no stripes, no pattern on the cloth, no frame, no
background, no ground, no shadow on the background, no sky, no clouds, no glossy
plastic, no metallic sheen, no thin transparent fabric, no ropes tangled.
```

**3D-Prompt** (für Text→3D, falls ohne Referenzbild gearbeitet wird):

```
A low-poly game asset: a small open parachute canopy for a cartoon character.
A shallow dome of cream cloth with six radial gores and a scalloped rim, a small
round apex, four thin cords running down from the rim to a short cylindrical
wooden handle. Symmetrical about the vertical axis. Chunky toy-like proportions,
thick-walled, no thin sheets. Total width 3.5 times the canopy depth.
Matte cream cloth (#D8CBB4), dark cord (#4A4238), warm wood (#6B5A46). No
pattern, no stripes, no logo, no text. Single closed mesh, watertight, no
interior faces, no floating parts.
```

**Format und Größe.**

| | Vorgabe |
|---|---|
| Datei | `art-src/wuselwerker/schirm.glb` |
| Achsen | **+Y nach oben**, Kuppel öffnet nach unten, +Z nach vorn |
| Ursprung | Mittelpunkt der **Krempenebene** (der weiteste Kreis), auf x = 0 und z = 0 |
| Normierung | Hüllbox exakt **1,0 Einheit breit** in x, mittig auf x und z |
| Dreiecke | ≤ 4000 |
| Material | **eines**, PBR metallic-roughness, Metallanteil 0, Rauheit 0,85–0,95 |
| Textur | eine, ≤ 512 × 512, JPEG im GLB eingebettet (wie beim Figurenmodell) |
| Dateigröße | ≤ 400 kB — **zählt nicht gegen das Budget** |

Die letzte Zeile ist wichtig: Das GLB liegt in `art-src/` und wird nur beim
Backen gebraucht. Ausgeliefert wird das Blatt. Der Zuwachs an
`src/art/wuselwerker.webp` durch vier bebilderte `floating`-Zellen beträgt
erfahrungsgemäß 2–4 kB.

**Einbauweg.** Gebacken. Drei Änderungen, alle klein und alle nötig:

1. **`art-src/wuselwerker/figur.json`** bekommt einen Abschnitt
   `"anbau": { "floating": { "modell": "schirm.glb", "breite": 8.6, "hoehe": 13.7 } }` —
   Breite und Höhe in logischen Pixeln.
2. **`scripts/bake-figur.mjs`** lädt das Anbauteil und hängt es **nach**
   `window.eiche()` an `wurzel`. Das ist zwingend: `eiche()` misst mit
   `Box3.setFromObject(wurzel)` die Gesamthöhe und würde einen vorher
   angehängten Schirm mitmessen und die Eichung verderben. Position
   `(0, hoehe × 0,07175, 0)` in geeichten Einheiten, Maßstab
   `breite × 0,07175 / 1,0` (die Normierung auf 1,0 Einheit Breite macht diese
   Zeile trivial), keine Eigendrehung — dadurch steht der Schirm in jeder Pose
   senkrecht über der Mittellinie und dreht sich mit `wurzel.rotation.y = dreh`
   mit. Angehängt nur für die Zeile, die ihn in `anbau` nennt; danach wieder
   entfernt.
3. **`src/render/werkzeug.ts`**: `FUEHRT.floating` gilt weiterhin für das
   Erdmännchen (dessen Modell hat kein Anbauteil), aber nicht mehr für den
   Wuselwerker. Ein Eintrag in `FUEHRT_TIER`-Manier, umgekehrt: eine
   Ausschlussliste je Figur.

**Abnahmekriterium.**
- Der Backvorgang läuft ohne Anschnittfehler durch. Das ist die eigentliche
  Prüfung, und sie ist automatisch.
- Die gemessene Höhe der Zeile `floating` steigt von 12,8 auf **14,5 bis 16,2**
  logische Pixel. Unter 14,5 ist der Schirm zu klein, über 16,2 schneidet er an.
- Die gemessene Breite der Zeile bleibt **unter 11,0** logischen Pixeln (heute
  9,8; die Zellhälfte misst 8,5).
- Die Überdeckung der Silhouetten von `falling` und `floating` (`.ueberdeckung.py`)
  fällt von den gemessenen **81 %** auf **unter 62 %**. Das ist der Zweck des
  Schirms, in einer Zahl.
- In allen vier Bildern der Zeile steht der Schirm auf derselben Seite der Figur
  (waagerechter Versatz der Kuppelmitte ≤ 0,3 logische Pixel) — genau der Fehler,
  gegen den die Mittellinie gewählt wurde.
- Das GLB enthält genau ein Netz und ein Material.

---

### 3.11 Vordergrundsaum

**Zweck.** Der billigste Tiefentrick, den es gibt: ein dunkles, unscharfes Band
unmittelbar vor der Kamera am unteren Bildrand. Es macht aus dem Spielfeld einen
Raum, durch den man hindurchsieht, statt einer Fläche, auf die man draufsieht.

**Prompt:**

```
A seamless horizontally tiling foreground silhouette band for a 2D
side-scrolling game: the very near edge of a grassy bank seen from just above
it, a soft irregular crest of grass tufts and two or three low weeds along the
top edge, everything else solid below. Straight-on side view, orthographic.
Rendered as an almost flat dark silhouette with only a hint of internal form —
this is the nearest layer and reads as a shape, not as detail. The crest
occupies the upper third of the frame; the lower two thirds are solid.
Everything above the crest is solid flat magenta #FF00FF to be keyed out.
Single dark green-black hue (#1E2A20 body, #2C3A2C where the light catches the
tufts), no other colours.
Must tile seamlessly left to right; no tuft is cut by either edge.
Aspect ratio 6.4:1, 1024 x 160 pixels.
STYLE BLOCK — modern hand-painted 2.5D game art, soft matte surfaces, no
visible brush strokes, no outlines, no cel shading, no pixel art, no
photographic texture. Bright neutral ambient fill only.
NEGATIVE — no text, no letters, no watermark, no logo, no UI, no frame, no
vignette, no film grain, no noise, no photorealism, no flowers, no insects, no
characters, no sky, no horizon, no depth of field, no lens blur.
```

**Format und Größe.** `kulisse-saum.webp`, 1024 × 160 (= 256 × 40 logische
Pixel), WebP mit Alpha, Qualität 70, **≤ 6 kB**.

**Einbauweg.** Eingebettet, `src/art/ui/kulisse-saum.webp`. In `scene.ts` als
**letzte** Schicht vor den Partikeln, mit Parallaxfaktor 1,25 (schneller als der
Vordergrund — das ist der Punkt) und 3 bis 4 Pixel Weichzeichnung am oberen Rand,
die im Bild schon drin sein darf.

**Abnahmekriterium.** Naht unauffindbar. Der Saum verdeckt höchstens 6 % der
Höhe des Spielfelds (bei 248 CSS-Pixeln also ≤ 15 CSS-Pixel) — mehr nimmt
Spielfläche weg, und Spielfläche ist teurer als Stimmung. Datei ≤ 6 kB.

---

### 3.12 App- und Startsymbol

**Zweck.** `build-single.mjs` setzt heute ein handgeschriebenes SVG als Favicon:
ein sandfarbener Kopf über einem türkisen Rumpf. Das ist die Figur aus einer
früheren Fassung des Spiels und hat mit der ausgelieferten — blaues Haar, grüne
Tunika — nichts mehr zu tun. Das Symbol ist das Erste, was jemand von diesem
Spiel sieht, und es zeigt eine Figur, die es nicht gibt.

**Prompt:**

```
A mobile app icon: the head of a small chubby cartoon worker seen from the
front, filling 70% of the frame, on a solid rounded-square background. Very
large round head, a huge voluminous mass of deep blue hair (#3851B6, highlights
#3D59C8) covering the top and sides, warm tan skin (#D29059), two large friendly
round eyes, a small mouth, the collar of a green tunic (#486820) just visible at
the bottom edge. A narrow amber headband (#FFC93C) runs across the hair. The
background is a single flat deep slate colour (#1B2536) with a very subtle
lighter halo behind the head; no pattern, no gradient banding.
The silhouette must stay readable at 32 x 32 pixels: no element narrower than
1/16 of the frame width.
Square, 512 x 512 pixels, opaque background, no rounded corner mask baked in —
deliver the full square.
STYLE BLOCK — modern hand-painted 2.5D game art, soft matte surfaces, rounded
volumes, gentle form shading, no visible brush strokes, no outlines, no cel
shading, no pixel art. Lighting: bright neutral ambient fill, one warm key light
from the upper left front (#FFF4E2), one cool rim light from behind right
(#DFE8FF); matte roughness, no specular highlights.
NEGATIVE — no text, no letters, no numbers, no watermark, no signature, no logo,
no brand mark, no frame, no border, no vignette, no film grain, no noise, no
photorealism, no glossy plastic, no neon, no hat, no helmet, no glasses, no
beard, no visible ears, no green hair, no blue tunic, no realistic human face.
```

**Format und Größe.** `symbol.webp`, aus dem 512er auf **192 × 192**
heruntergerechnet, WebP verlustbehaftet Qualität 82, **≤ 4 kB**. Anzeige: 16–32
Pixel im Reiter, 180 Pixel auf dem Startbildschirm.

**Einbauweg.** Eingebettet, aber **nicht** über Vite: als Data-URI direkt in
`scripts/build-single.mjs`, in `<link rel="icon">` und zusätzlich
`<link rel="apple-touch-icon">`. Der vorhandene SVG-Einzeiler entfällt.

**Abnahmekriterium.** Auf 32 × 32 verkleinert sind Haarmasse, Gesicht und Band
noch als drei getrennte Flächen zu erkennen. Kein grünes Haar, keine blaue
Tunika. Datei ≤ 4 kB.

---

### 3.13 Lebenslaterne und Nachschubtafel

**Zweck.** Die Merkliste sieht eine tägliche Zahl von Leben/Versuchen vor, ein
Fenster „Video ansehen" bei Aufbrauch und später ein kaufbares Paket. Dafür
braucht es genau zwei Bilder: ein **Zählsymbol** in der Kopfzeile und ein
**Motiv** für die Tafel.

**Warum eine Laterne und kein Herz.** Das Spiel benutzt bereits eine brennende
Laterne als Rastzeichen auf der Weltkarte (`weltkarte.ts`, `laterne()`), mit
genau der Bedeutung „hier ist etwas geschafft, hier brennt Licht". Ein Herz wäre
ein zweites Vokabular für dieselbe Sache. Eine brennende Laterne = ein Versuch,
eine erloschene = ein verbrauchter.

**Prompt (zwei Mal laufen lassen):**

```
A single game object on a fully transparent background, seen straight from the
front, slightly from above, centred and filling 80% of the frame. A small
old-fashioned hand lantern: a stout warm-brass frame (#6C5636 with #C9A86A
highlights), four glass panes, a ring handle on top, a broad base.
Square, 128 x 128 pixels, transparent background (alpha).

STATE (use exactly one per generation):
A  LIT    — the glass glows warm amber (#FFE1A0 core, #FFC93C at the panes) and
   throws a soft warm halo just beyond the frame of the lantern; the brass is
   bright and warm.
B  SPENT  — the glass is dark and empty (#2C3344), no glow at all, the brass is
   desaturated and cool (#3A4152); the shape is identical to state A in every
   dimension, only the values and colours differ.

STYLE BLOCK — modern hand-painted 2.5D game art, soft matte surfaces, rounded
volumes, gentle form shading, no visible brush strokes, no outlines, no cel
shading, no pixel art. Lighting: bright neutral ambient fill, one warm key light
from the upper left front (#FFF4E2), one cool rim light from behind right
(#DFE8FF); matte roughness, no specular highlights.
NEGATIVE — no text, no letters, no numbers, no watermark, no logo, no brand
mark, no frame, no border, no background, no drop shadow onto the transparency,
no sparkles, no lens flare, no rays, no candle wax, no rope, no chain, no hand,
no character, no photorealism, no glossy plastic, no neon.
```

**Prompt für die Tafel:**

```
An illustration for a small dialogue panel in a mobile game, no text: a group of
four tiny chubby workers sitting and standing around a single lit lantern at
dusk, on a low grassy ledge, waiting. Two of them look up expectantly, one
leans against the lantern post, one sits with its chin in its hands. The mood is
patient and friendly, not sad. Around them the ground falls away into soft
darkness; the lantern is the only light source and pools warm amber (#FFE1A0)
across the group.
THE WORKERS: very large round heads, huge voluminous BLUE hair (#3851B6), short
GREEN tunics (#486820), warm tan skin (#D29059), tiny legs, two large friendly
eyes each. Never green hair with a blue tunic.
Composition: the group sits in the lower left two thirds; the upper right third
stays calm and dark so a headline can be placed there.
Aspect ratio 8:5, 512 x 320 pixels, opaque background.
STYLE BLOCK — modern hand-painted 2.5D game art, soft matte surfaces, rounded
volumes, gentle form shading, no visible brush strokes, no outlines, no cel
shading, no pixel art, no photographic texture. Lighting: one warm key light
from the lantern itself, cool ambient fill from above; matte roughness, no
specular highlights, no lens flare.
NEGATIVE — no text, no letters, no numbers, no watermark, no signature, no logo,
no brand mark, no UI elements, no buttons, no coins, no money, no gems, no
timers, no clocks, no frames, no borders, no vignette, no film grain, no noise,
no photorealism, no tears, no sad faces, no green hair with blue tunic.
```

**Format und Größe.** `laterne.webp` 256 × 128 (zwei Zellen à 128, ≤ 4 kB) und
`tafel-leben.webp` 512 × 320 (≤ 10 kB), zusammen **≤ 14 kB**. Anzeige der
Laterne 22–26 CSS in der Kopfzeile, der Tafel 256 × 160 CSS.

**Einbauweg.** Eingebettet, `src/art/ui/`. Gezeichnet in `hud.ts` (Kopfzeile,
neben der Zeit) und in einer neuen `drawLebenTafel()` in `overlays.ts`.

**Abnahmekriterium.** Die beiden Laternenzustände haben deckungsgleiche Umrisse
(Abweichung ≤ 2 Bildpunkte) — sonst springt das Symbol beim Verbrauchen. Auf
24 × 24 verkleinert sind sie eindeutig zu unterscheiden. Die Tafel hält ihre
ruhige Ecke oben rechts (Helligkeitsschwankung dort ≤ 20 Stufen). Zusammen
≤ 14 kB.

---

### 3.14 Belohnungsembleme

**Zweck.** `welten.ts` kennt vier Sorten Belohnung — `werkzeug`, `zeit`,
`komfort`, `schmuck` — und ordnet sie ausdrücklich nach ihrer Wirkung auf
ungespielte Rätsel. Am Weltentor steht davon heute nur Text. Vier Zeichen machen
aus der Belohnungstafel eine Belohnung.

**Prompt (vier Mal laufen lassen):**

```
A single game reward icon on a fully transparent background, seen straight from
the front, slightly from above, centred and filling 78% of the frame, with a
soft elliptical contact shadow beneath. Bold, chunky, three-dimensional, the
silhouette readable at 40 x 40 pixels.
Square, 128 x 128 pixels, transparent background (alpha).

SUBJECT (use exactly one per generation):
1  TOOL     — a crossed spade and wedge tied with a short cord, warm wood
   (#6B5A46) and dark iron (#3A3430), with one amber highlight (#FFC93C).
2  TIME     — a stout hourglass with a wooden frame (#6B5A46) and warm glowing
   sand (#FFC93C) running through it.
3  COMFORT  — a large ornate key with a round bow and a chunky bit, warm brass
   (#C9A86A) with darker recesses (#6C5636).
4  ORNAMENT — a wide golden ribbon band tied in a simple loop, gold (#FFD23F)
   with deeper amber shadows (#B8862A), no gemstones.

STYLE BLOCK — modern hand-painted 2.5D game art, soft matte surfaces, rounded
volumes, gentle form shading, no visible brush strokes, no outlines, no cel
shading, no pixel art. Lighting: bright neutral ambient fill, one warm key light
from the upper left front (#FFF4E2), one cool rim light from behind right
(#DFE8FF); matte roughness, no specular highlights.
NEGATIVE — no text, no letters, no numbers, no watermark, no logo, no brand
mark, no frame, no border, no background, no drop shadow onto the transparency,
no glow, no sparkles, no starbursts, no coins, no money, no gems, no chrome, no
neon, no thin lines.
```

**Format und Größe.** Ein Blatt `belohnungen.webp`, 512 × 128 (vier Zellen à
128), WebP mit Alpha, Qualität 82, **≤ 6 kB**. Anzeige 40–56 CSS.

**Einbauweg.** Eingebettet, `src/art/ui/belohnungen.webp`. In `weltkarte.ts` in
den Torbogen und in die Belohnungstafel.

**Abnahmekriterium.** Auf 40 × 40 verkleinert sind alle vier unterscheidbar
(Prüfung wie bei den Berufsknöpfen: mindestens drei von vier richtig zugeordnet).
Blatt ≤ 6 kB.

---

## 4. Was ausdrücklich prozedural bleibt — und warum

Diese Liste ist genauso wichtig wie die obere. Wer sie nicht führt, bekommt
Bilder für Dinge, die als Bild schlechter werden.

| Sache | Warum kein Bild |
|---|---|
| **Das Gelände selbst** | Die Maske ändert sich pixelgenau bei jedem Spatenstich. Eine gemalte Geländegrafik müsste an jeder denkbaren Schnittkante stimmen; aus der Maske gerechnet stimmt jede Kante von selbst. Steht so begründet in `terrainView.ts` und bleibt gültig. Das Relief aus §3.3 kommt **obendrauf**, nicht anstelle. |
| **Himmelsverlauf** | Ein Verlauf zwischen drei Stützstellen. Als Bild kostet er Kilobyte und gewinnt nichts. |
| **Ausgangstor und Einstiegsluke** | Beide sind je Level anders groß (`level.exit` ist ein Rechteck aus der Leveldatei) und beide bewegen sich: Die Luke fährt ihre Klappen auf, das Tor pulst. Ein Bild müsste in beliebigen Seitenverhältnissen stimmen. |
| **Kontaktschatten, Partikel, Schutt, Explosion** | Sie hängen an gemessenen Zahlen aus dem Blatt (`clip.fuss`) und an der Simulation. |
| **Stirnband, Warnlampe, Werkzeug an der Hand** | Sie hängen an Ankerpunkten je Einzelbild und tragen die Berufsfarbe zur Laufzeit. |
| **Weg, Levelpunkte, Sterne, Laternen auf der Karte** | Zustandsabhängig. |
| **Lupe, Übersichtskarte, Schieber, Kopfzeile** | Bedienelemente. |

Drei Verbesserungen am „moderner"-Eindruck sind **reiner Code** und brauchen
keinen Prompt — sie gehören trotzdem in dieselbe Runde wie §3.1:

1. **Farbstich je Thema** über das ganze Spielfeld: eine sehr schwache
   Multiplikationsschicht (2–4 %), die Vorder- und Hintergrund zusammenbindet.
2. **Randabdunklung** (Vignette) über das Spielfeld, 6–8 % an den Ecken. Der
   billigste Griff, der ein Bild zu einem Bild macht.
3. **Höhenstaffelung der Sättigung**: die hinterste Kulissenschicht zusätzlich um
   15 % entsättigen. Zusammen mit der Aufhellung ist das die vollständige
   Luftperspektive, und sie kostet eine Zeile.

---

## 5. Größenbudget

**Bedarf:**

| Grafik | roh | eingebettet (+37 %) |
|---|---|---|
| Kulisse fern / mitte / nah | 42 kB | 58 kB |
| Wolkenband | 8 kB | 11 kB |
| Erd-Relief | 6 kB | 8 kB |
| Vordergrundsaum | 6 kB | 8 kB |
| Berufsknöpfe | 16 kB | 22 kB |
| Titelbild | 40 kB | 55 kB |
| Wortmarke | 12 kB | 16 kB |
| Welttafeln (5) | 40 kB | 55 kB |
| Weltembleme | 10 kB | 14 kB |
| Avatare | 26 kB | 36 kB |
| App-Symbol | 4 kB | 5 kB |
| Laterne + Tafel | 14 kB | 19 kB |
| Belohnungsembleme | 6 kB | 8 kB |
| **Summe** | **230 kB** | **315 kB** |

**Gegenfinanzierung.** `src/art/index.ts` liefert heute **drei** Figurenblätter
aus, obwohl `FIGUR` auf `wuselwerker` steht. Der Kommentar dort nennt das eine
bewusste Entscheidung („kostet rund neunzig Kilobyte und ist es wert" — inzwischen
sind es mehr). Wer die neue Grafik will, zahlt sie hier:

| Datei | roh | eingebettet |
|---|---|---|
| `murmel.webp` | 94 kB | 129 kB |
| `erdmaennchen.webp` | 119 kB | 163 kB |
| **frei** | **213 kB** | **292 kB** |

Dazu kommen `murmel.atlas.json` (10 kB) und `erdmaennchen.atlas.json` (14 kB),
die als Javascript ins Bündel wandern — sie sind in der Rechnung unten
vorsichtshalber **nicht** angesetzt.

**Ergebnis:** 618 kB − 292 kB + 315 kB = **rund 641 kB**. Der ganze Bedarf dieser
Liste kostet netto **23 kB**.

**Entschieden am 2026-08-12: gestrichen.** Die beiden Blätter sind aus
`src/art/` zu ihren Quelldaten gezogen (`art-src/murmel/`,
`art-src/erdmaennchen/`) und damit aus dem Bau; die Tests prüfen sie dort
weiter, und der Rückweg steht am `FIGUR`-Kommentar in `src/art/index.ts`.
Das Budget dieser Liste ist damit gedeckt.

**Prüfregel für jede Lieferung:** Nach dem Einbau `npm run build:single` laufen
lassen und die Größe von `spielen.html` ablesen. Sie ist die einzige Zahl, die
zählt.

---

## 6. Rangfolge nach Wirkung

Von oben nach unten: Was dem Spiel am meisten bringt, zuerst.

| # | Grafik | Warum hier | Kosten |
|---|---|---|---|
| **1** | **Kulissenband, drei Schichten** (§3.1) | Der ausdrückliche Wunsch. Die Kulisse ist in jeder Sekunde Spielzeit sichtbar und ist heute die flachste Fläche im Bild. Nichts sonst verändert den Gesamteindruck so stark. | 58 kB |
| **2** | **Berufsknöpfe** (§3.4) | Die einzige Fläche, die der Spieler wirklich bedient — achtmal je Level. Sie tragen heute einfarbige Piktogramme und lehren den Farbcode nicht, den die Figur auf dem Feld benutzt. | 22 kB |
| **3** | **Wolkenband** (§3.2) | Zweitgrößter Anteil an der Fläche, kleinster Preis der ganzen Liste. Gehört mit §3.1 in eine Runde, sonst passen Himmel und Hügel nicht zusammen. | 11 kB |
| **4** | **Wortmarke** (§3.6) | Ohne Bild gibt es keinen Titel — die Einzeldatei darf keine Schrift nachladen. Billig, und Voraussetzung für §3.5. | 16 kB |
| **5** | **Titelbild** (§3.5) | Der erste Eindruck. Teuerster Einzelposten, deshalb erst nach den Dingen, die im Spiel wirken. | 55 kB |
| **6** | **Erd-Relief** (§3.3) | Die Erde ist die halbe Bildfläche. Wirkt leiser als die Kulisse, aber auf mehr Pixeln, und kostet fast nichts. | 8 kB |
| **7** | **Schirm als `.glb`** (§3.10) | Behebt einen echten, messbaren Fehler (81 % Überdeckung von `falling` und `floating`) und kostet **kein** Budget, weil das Modell nicht ausgeliefert wird. Nur eine Pose betroffen — deshalb nicht weiter oben. | ≈ 3 kB |
| **8** | **Welttafeln + Weltembleme** (§3.7, §3.8) | Der zweite ausdrückliche Wunsch. Sie setzen den Umbau auf ein senkrechtes Band voraus, sind also an Code gebunden, der noch nicht existiert. | 69 kB |
| **9** | **Avatare** (§3.9) | Gebraucht, sobald es Anmeldung und Bestenliste gibt — beides steht noch aus. Bis dahin Grafik ohne Ort. | 36 kB |
| **10** | **Vordergrundsaum** (§3.11) | Schöner Effekt, aber er nimmt Spielfläche weg. Erst zeigen, dann entscheiden. | 8 kB |
| **11** | **App-Symbol** (§3.12) | Winzige Wirkung, aber heute schlicht **falsch**: Das Favicon zeigt eine Figur, die es im Spiel nicht mehr gibt. Vier Kilobyte, eine halbe Stunde. | 5 kB |
| **12** | **Belohnungsembleme** (§3.14) | Vier Symbole für eine Tafel, die man je Welt einmal sieht. | 8 kB |
| **13** | **Lebenslaterne + Tafel** (§3.13) | Hängt vollständig an einer Mechanik, die es noch nicht gibt, und deren Zahlen ein anderer Subagent erst untersucht. Zuletzt. | 19 kB |

**Wenn nur eine Runde bezahlt wird:** §3.1, §3.2, §3.4 und §3.3 zusammen —
99 kB eingebettet, vollständig durch das Streichen von `murmel.webp` gedeckt, und
sie treffen genau die beiden Punkte, die die Merkliste unter „Grafik" nennt.
