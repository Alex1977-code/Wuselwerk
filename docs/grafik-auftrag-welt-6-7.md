# Grafikauftrag: drei Dateien für Welt 6 und 7

Fertige Prompts zum Kopieren, plus die zwei Befehle, mit denen das Ergebnis an
seinen Platz kommt. Wer diese Datei von oben nach unten abarbeitet, braucht
nichts weiter zu wissen.

> **Zwischenstand.** Diese Fassung ist aus eigener Messung geschrieben. Ein
> Gutachtergremium prüft parallel Technik, Stil und Motiv nach; Abweichungen
> werden hier nachgetragen, nicht in einer zweiten Datei.

---

## 1. Was fehlt — und warum

Der Lader `src/art/ui/index.ts` findet jede Datei `src/art/ui/NAME.webp` von
selbst und reicht sie über `uiBild(NAME)` heraus. Ein Abgleich der im Code
**angeforderten** gegen die **vorhandenen** Namen ergibt genau drei Lücken:

| Datei | Maß | Zustand |
|---|---|---|
| `welt-6.webp` | 384 × 216, RGB, ohne Alpha | **fehlt** |
| `welt-7.webp` | 384 × 216, RGB, ohne Alpha | **fehlt** |
| `weltembleme.webp` | 640 × 128 → **896 × 128**, RGBA | **zu kurz** |

**Die Welttafel** ist die Kopfplatte eines Weltabschnitts auf der Karte,
gezeichnet in `src/render/weltkarte.ts:611`:

```ts
const tafel = uiBild(`welt-${nr + 1}`);
```

Es gibt `welt-1` bis `welt-5`. Der Sonnenhang ist Welt 6 und hat keine; die
Wipfelweide wird Welt 7 und braucht eine.

**Das Emblemblatt** ist 640 × 128 — also genau **fünf** Zellen zu 128 × 128 —
und wird mit dem Weltindex angesprochen (`weltkarte.ts:928`):

```ts
ctx.drawImage(em, nr * em.naturalHeight, em.naturalHeight, ...);
```

Der Sonnenhang hat den Index 5 und liest damit ab Bildpunkt 640, also
vollständig außerhalb des Blattes. **Seine Kopfzeile auf der Weltkarte trägt
heute kein Emblem.** Das fällt nur deshalb nicht auf, weil ein Canvas so einen
Aufruf stillschweigend verwirft, statt zu meckern. Das Blatt muss also
wachsen, unabhängig davon, ob je eine Welttafel gemalt wird.

Alles andere ist vorhanden: `avatare`, `belohnungen`, `berufe`, `erde-relief`,
`kulisse-fern/mitte/nah`, `laternen`, `titel`, `wolken`, `wortmarke`.

---

## 2. Was zu tun ist, wenn das Bild da ist

Kurz: umwandeln, hinlegen, bauen. Es gibt **keinen** Verdrahtungsschritt — der
Lader nimmt jede Datei, die im Ordner liegt.

### Welttafel

```bash
cd /home/user/Wuselwerk
python3 - <<'PY'
from PIL import Image
QUELLE = 'ORDNER/dein-bild.png'      # <- anpassen
ZIEL   = 'src/art/ui/welt-6.webp'    # oder welt-7.webp
im = Image.open(QUELLE).convert('RGB').resize((384, 216), Image.LANCZOS)
im.save(ZIEL, 'WEBP', quality=82, method=6)
print(ZIEL, im.size, round(__import__('os').path.getsize(ZIEL)/1024, 1), 'kB')
PY
npm run build:single
```

Zielgröße: **5 bis 8 kB**, so wiegen die fünf vorhandenen Tafeln. Wird die
Datei deutlich größer, `quality` auf 75 senken — das Bild wird auf höchstens
300 CSS-Pixel Breite angezeigt, feine Details gehen ohnehin verloren.

### Emblemblatt

Nicht das ganze Blatt neu erzeugen lassen. Die fünf vorhandenen Embleme
müssen **bildgleich** bleiben, und kein Generator trifft sie zweimal. Also nur
die zwei neuen Zellen einzeln erzeugen und anhängen:

```bash
cd /home/user/Wuselwerk
python3 - <<'PY'
from PIL import Image
alt   = Image.open('src/art/ui/weltembleme.webp').convert('RGBA')   # 640x128
neu6  = Image.open('ORDNER/emblem-sonnenhang.png').convert('RGBA')  # <- anpassen
neu7  = Image.open('ORDNER/emblem-wipfelweide.png').convert('RGBA') # <- anpassen
z = alt.height                                                      # 128
blatt = Image.new('RGBA', (z * 7, z), (0, 0, 0, 0))
blatt.paste(alt, (0, 0))
blatt.paste(neu6.resize((z, z), Image.LANCZOS), (z * 5, 0))
blatt.paste(neu7.resize((z, z), Image.LANCZOS), (z * 6, 0))
blatt.save('src/art/ui/weltembleme.webp', 'WEBP', quality=90, method=6, lossless=False)
print('neu:', blatt.size)
PY
npm run build:single
```

**Wichtig:** Die neuen Zellen brauchen einen **durchsichtigen** Hintergrund.
Ein Generator, der auf Weiß liefert, macht aus dem runden Medaillon eine
weiße Kachel. Falls nötig, vorher freistellen.

---

## 3. Der Stilblock — und warum er hier neu ist

Die Prompt-Bibliothek (`docs/grafik-prompts.md` §1) hat zwei Stilblöcke, und
**beide passen nicht auf die Welttafeln.** Sie fordern Pixel-Art mit hartem
Umriss und sichtbarem Dithering. Die fünf ausgelieferten Tafeln sind aber
glatt gemalte Illustrationen ohne Pixelraster — nachgesehen, nicht vermutet.
Wer Stilblock B verwendet, bekommt ein Bild, das neben `welt-1` bis `welt-5`
wie ein Fremdkörper hängt.

Für die Welttafeln gilt deshalb dieser Block. Er beschreibt, was die
vorhandenen fünf **tatsächlich tun**:

```
STYLE BLOCK C — WUSELWERK WORLD PLATE

Smooth painted digital illustration, storybook concept-art finish. Soft
brushwork, gentle gradients, no visible pixel grid, no hard black outlines,
no cel shading. Clean and calm rather than gritty.

Camera: strictly orthographic side view, eye level, no vanishing point, no
perspective convergence, no isometric tilt, no three-quarter angle. The
horizon is a straight horizontal line.

Composition, 16:9 landscape: the lower third is a solid ground band shown in
cross-section, cut open as if a slice of the world had been lifted out — you
see the material the world is made of, edge-on. Above it, the world's own
silhouette occupies the middle band. The upper quarter is open sky or
atmosphere. Leave the four corners quiet; they get rounded off.

Depth: three clear planes separated by value, not by outline. Foreground
darkest and most saturated, middle plane lighter, far distance washed out
into coloured haze. Atmospheric perspective does all the work.

No characters, no creatures, no people, no text, no letters, no logos, no
UI, no frame, no border, no vignette, no watermark.
```

Dazu gehört der universelle Negativblock aus `docs/grafik-prompts.md` §1.3.
Bei Generatoren ohne eigenes Negativfeld hängt man ihn mit dem Vorsatz
„Avoid the following:" an. Die erste Zeile darin ist die wichtigste:
**green hair, blue robe** — die verbotene Farbkombination der Spielfigur.

---

## 4. Prompt 1 — `welt-6.webp`, Sonnenhang

**Was das Bild sagen soll:** „Was von weitem wie eine Wiese aussieht, hat vier
Stockwerke." Der Sonnenhang ist die einzige Welt, die ausschließlich *hinab*
führt, und ihre Terrassen sind gestapelt wie Stufen. Nachmittagslicht, warmes
Gold (`#d9a441`). Die Verwechslungsgefahr ist das Grasland — deshalb ist hier
**alles gestuft**, nichts ist eine sanfte Hügelkuppe, und das Licht steht tief
und schräg statt hoch und blau.

Zum Kopieren:

```
STYLE BLOCK C — WUSELWERK WORLD PLATE

Smooth painted digital illustration, storybook concept-art finish. Soft
brushwork, gentle gradients, no visible pixel grid, no hard black outlines,
no cel shading. Clean and calm rather than gritty.

Camera: strictly orthographic side view, eye level, no vanishing point, no
perspective convergence, no isometric tilt, no three-quarter angle. The
horizon is a straight horizontal line.

Composition, 16:9 landscape: the lower third is a solid ground band shown in
cross-section, cut open as if a slice of the world had been lifted out — you
see the material the world is made of, edge-on. Above it, the world's own
silhouette occupies the middle band. The upper quarter is open sky or
atmosphere. Leave the four corners quiet; they get rounded off.

Depth: three clear planes separated by value, not by outline. Foreground
darkest and most saturated, middle plane lighter, far distance washed out
into coloured haze. Atmospheric perspective does all the work.

No characters, no creatures, no people, no text, no letters, no logos, no
UI, no frame, no border, no vignette, no watermark.

SUBJECT — SUNLIT TERRACED HILLSIDE

A grassy hillside built as four stacked terraces stepping down from left to
right, seen from the side. Each terrace is a flat meadow shelf with a sheer
earth face beneath it, so the hill reads as a staircase rather than a slope.
The grass crust is a thin bright green layer on top of warm ochre soil, and
that soil is visible in cross-section along every terrace face and across
the bottom band of the picture — packed earth with a few embedded stones and
one pale horizontal seam of harder rock running through the lower terraces.

Late afternoon light raking in low from the left: long soft shadows thrown
eastwards off each terrace lip, the sunlit tops of the shelves glowing warm
gold, the shaded faces falling into cool olive. Warm golden haze in the far
distance where more terraces fade away. A calm pale sky in the upper
quarter, hazy gold near the horizon, no clouds in the centre.

Palette: meadow green, warm ochre and amber earth, honey gold light, cool
olive shadow, pale gold sky. Warm and inviting, not dramatic.

Aspect ratio 16:9.

Avoid the following: green hair, blue robe, characters, creatures, people,
text, letters, logos, watermark, signature, UI overlay, frame, border,
vignette, rounded soft hills, single smooth slope, terraced rice paddies,
water, buildings, fences, roads, isometric view, three-quarter camera,
perspective convergence, pixel art, hard black outlines, cel shading, photo
realism.
```

**Woran du erkennst, dass es taugt:**
- Man zählt die Stufen — es sind Stockwerke, keine Hügel. Wenn es aussieht wie
  `welt-1`, ist es falsch.
- Unter der Grasnarbe sieht man Erde im Schnitt, quer über den unteren Rand.
- Das Licht kommt flach von der Seite. Steht die Sonne hoch, fehlt der
  Nachmittag, und die Welt heißt nicht mehr Sonnenhang.

---

## 5. Prompt 2 — `welt-7.webp`, Wipfelweide

**Was das Bild sagen soll:** Ein Wald **von oben**, in den Kronen. Die
Wipfelweide ist der Gegensatz zum Sonnenhang: Sie führt ausschließlich
*hinauf*, und ihr Gegner ist die **Decke** — das Blätterdach, das den Weg nach
oben verschließt. Das Licht fällt senkrecht durch das Laub, es gibt keinen
Horizont. Die Verwechslungsgefahr ist doppelt: Grasland (grün) und Sonnenhang
(grün). Getrennt wird sie durch die Blickhöhe — hier ist **kein Boden**, man
ist oben, und unten verliert sich alles im Dunst.

Zum Kopieren:

```
STYLE BLOCK C — WUSELWERK WORLD PLATE

Smooth painted digital illustration, storybook concept-art finish. Soft
brushwork, gentle gradients, no visible pixel grid, no hard black outlines,
no cel shading. Clean and calm rather than gritty.

Camera: strictly orthographic side view, eye level, no vanishing point, no
perspective convergence, no isometric tilt, no three-quarter angle.

Composition, 16:9 landscape: the upper third is a dense canopy ceiling of
foliage seen edge-on, closing the picture from above. The middle band holds
massive vertical trunks and broad horizontal branch platforms. The lower
third falls away into pale green mist — there is no ground and no horizon
line. Leave the four corners quiet; they get rounded off.

Depth: three clear planes separated by value, not by outline. Nearest trunks
darkest and most saturated, middle plane lighter, far distance washed out
into pale green haze. Atmospheric perspective does all the work.

No characters, no creatures, no people, no text, no letters, no logos, no
UI, no frame, no border, no vignette, no watermark.

SUBJECT — HIGH IN THE FOREST CANOPY

The crown layer of an ancient forest, seen from within it. Two or three
enormous vertical trunks rise through the whole height of the picture and
are cut off by the top edge. Between them, wide flat branches spread
horizontally like natural platforms at several different heights, carpeted
with moss and small ferns. Above them all, a dense roof of leaves closes the
picture off — a ceiling, not an opening.

A few narrow shafts of sunlight break through gaps in that leaf ceiling and
fall straight down, vertical and slightly hazy, catching drifting motes.
Below the lowest branch the trunks disappear into soft pale mist; the forest
floor is never visible.

Palette: deep forest green, moss green, warm brown bark, pale lime where the
light hits leaves, milky green mist. Cool in the shade, warm only in the
light shafts.

Aspect ratio 16:9.

Avoid the following: green hair, blue robe, characters, creatures, animals,
people, text, letters, logos, watermark, signature, UI overlay, frame,
border, vignette, forest floor, visible ground, horizon line, open sky,
meadow, hills, treehouse, buildings, rope bridges, isometric view,
three-quarter camera, perspective convergence, aerial view of treetops from
above, pixel art, hard black outlines, cel shading, photo realism.
```

**Woran du erkennst, dass es taugt:**
- Kein Boden, kein Horizont. Sieht man Wiese oder Erdreich, ist es der
  Sonnenhang geworden.
- Oben schließt Laub das Bild — es ist eine **Decke**, kein Ausblick.
- Die Lichtstrahlen fallen **senkrecht**. Genau so steht es im Code
  (`scene.ts`: „Licht von OBEN durchs Laub, kein Horizont").

---

## 6. Prompt 3 — die zwei neuen Embleme

Die fünf vorhandenen sind runde Medaillons: eine farbige Scheibe mit dickem
Ring, darin **ein** einfaches Zeichen, weich plastisch schattiert, auf
durchsichtigem Grund. Grasland trägt einen Baum auf einem Hügel,
Kristallklamm eine Kristallgruppe, Rostwerk ein genietetes Blech, Frostklamm
Eiszapfen, Schlot einen Ofen mit Flamme.

Zwei Regeln folgen daraus, und beide sind Fallen:

1. **Welt 1 ist schon ein Baum.** Die Wipfelweide darf deshalb keiner sein.
2. Angezeigt wird das Emblem mit **46 Bildpunkten**. Alles, was feiner ist als
   ein Fünftel der Scheibe, ist weg.

Jedes Emblem **einzeln** erzeugen, 1024 × 1024, durchsichtiger Grund, dann mit
dem Befehl aus Abschnitt 2 anhängen.

```
Single round game emblem icon, centred, on a fully transparent background.

A thick circular medallion: a flat coloured disc with a raised darker rim
ring around it, softly shaded to look gently three-dimensional, like a
painted enamel badge. Inside the disc sits ONE simple bold symbol in
silhouette, filling most of the disc, painted in two or three values of a
single hue so it reads instantly at small size.

Smooth painted finish, soft gradients, no hard black outline, no cel
shading, no pixel art, no gloss highlight, no drop shadow outside the
medallion, no text, no letters, no numbers, no border decoration.

SYMBOL: [HIER EINSETZEN]

Square 1:1 composition, the medallion touching the edges with a small
margin. Transparent background, PNG with alpha.

Avoid the following: text, letters, numbers, watermark, signature, drop
shadow on the background, white background, checkerboard background,
rectangular badge, shield shape, ribbon, banner, laurel wreath, multiple
symbols, cluttered detail, photo realism, 3D render, glossy plastic.
```

Für `SYMBOL:` jeweils eine der beiden Zeilen einsetzen:

**Zelle 6 — Sonnenhang** (Scheibe warmes Gold `#d9a441`, Rand dunkles Braun):

```
SYMBOL: three broad flat terraces stepping down from upper left to lower
right, like a wide staircase cut into a hillside, with a simple half sun
disc rising behind the top step. Grass green tops, ochre earth faces.
```

**Zelle 7 — Wipfelweide** (Scheibe tiefes Waldgrün, Rand warmes Braun):

```
SYMBOL: looking straight up into a leaf canopy — a rough round opening in
dense foliage with three straight light shafts falling down through it. Deep
green leaves, pale lime light. No tree trunk, no whole tree.
```

**Woran du erkennst, dass es taugt:** Auf 46 Bildpunkte verkleinern und
ansehen. Erkennt man das Zeichen nicht mehr, ist es zu fein — bei diesen
Symbolen heißt das meist: weniger Stufen, dickere Lichtstrahlen.

---

## 7. Wenn der Generator es nicht trifft

**Er liefert Pixel-Art oder harte Umrisse.** Kommt davon, dass „game asset"
viele Modelle in die Retro-Ecke zieht. Nachsatz anhängen:

```
Painted illustration, not pixel art. No pixel grid, no dithering, no hard
black outline. Smooth soft brushwork like a children's picture book.
```

**Er kippt die Kamera** — Isometrie, Dreiviertelansicht, Fluchtpunkt. Das ist
der häufigste Fehler, weil Landschaften normalerweise so gemalt werden.
Nachsatz:

```
Flat orthographic side elevation, like a cross-section drawing or a
side-scrolling platform game background. The camera does not tilt. Vertical
lines stay vertical, horizontal lines stay horizontal, nothing converges.
```

**Er trifft die Maße nicht.** Fast alle Generatoren liefern eigene Formate.
Das ist kein Problem: Der Befehl in Abschnitt 2 skaliert auf 384 × 216. Damit
dabei nichts Wichtiges abgeschnitten wird, gilt die Regel aus dem Stilblock —
**die Ecken bleiben ruhig**. Die Tafel wird nämlich mit `kreisRunde(…, 10)`
abgerundet beschnitten; bei 300 Pixel Anzeigebreite entspricht das in der
Quelle rund **13 Bildpunkten** je Ecke. Wer dort ein Motiv platziert, verliert
es.

Falls das Bild in einem anderen Seitenverhältnis kommt, vor dem Skalieren
mittig auf 16:9 beschneiden:

```python
w, h = im.size
z = min(w, int(h * 16 / 9))
im = im.crop(((w - z) // 2, 0, (w + z) // 2, min(h, int(z * 9 / 16))))
```
