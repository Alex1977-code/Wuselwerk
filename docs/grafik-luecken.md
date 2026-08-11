# Wuselwerk — Grafiklücken

**Was fehlt dem Spiel noch an Bildern, und womit erzeuge ich sie?**

Diese Datei ist keine weitere Promptsammlung. Sie ist der Abgleich zwischen dem, was der
Katalog beschreibt, und dem, was am 11. August 2026 tatsächlich im Spiel steckt — und für
jede Lücke ein fertiger, sofort einsetzbarer Prompt.

**Sprachregel wie im Projekt:** Erklärungen deutsch, Prompts englisch, jeder Prompt in einem
eigenen Codeblock, jeder für sich einsetzbar, keine Platzhalter zum Ausfüllen. Die
Stil-, Paletten- und Negativblöcke stehen deshalb **wörtlich in jedem Prompt** und nicht als
Verweis; ein Prompt, der erst zusammengesetzt werden muss, ist kein fertiger Prompt.

---

## §0 Was diese Datei ist

| Datei | Rolle | Verhältnis zu dieser Datei |
|---|---|---|
| `grafik-ankerbild-a0.md` | **Steht über allem.** Ankerfigur, Zellmaß 28 × 28, Fußpunkt (14, 22), Backweg vom Modell zum Blatt. | Übernommen, nicht neu erfunden. Bei Widerspruch gilt sie. |
| `grafik-katalog.md` | 5400 Zeilen: Stil, Figurenkanon, Haar, Palette, Inventar (§1), Prompts für praktisch jede Grafik. | Beschreibt, wie das Spiel aussehen **soll**. Wo ein Prompt dort brauchbar ist, wird er hier mit Quellenangabe übernommen und um das ergänzt, was zum sofortigen Einsetzen fehlt. |
| `grafik-prompts.md` | Ältere Promptbibliothek. | Stilrichtung abgelöst, Motivlisten hier als Vollständigkeitsprüfung benutzt. |
| `grafik-integration.md` | Bildzahlen, Haltedauern, Andockpunkte, Terrain-Wertebänder. | Bindend übernommen: Wertebänder 32–200 bzw. 24–232, Andockpunkte, Atlasformat. |
| **`grafik-luecken.md`** (diese) | **Die Lückenliste.** Was von alldem noch **nicht im Spiel** ist, geordnet danach, was ein Spieler zuerst sieht — mit Gewicht in Kilobyte und mit der ehrlichen Gegenprobe, wo Code besser ist als ein Bild. | — |

**Der Unterschied in einem Satz:** Der Katalog fragt „wie soll es aussehen?", diese Datei
fragt „was fehlt, was kostet es, und lohnt es sich?".

### Der Rahmen, in dem jede Entscheidung hier steht

Das Spiel ist **eine einzige, in sich geschlossene HTML-Datei**. Alles Bildmaterial wird als
Data-URI eingebettet, und Base64 bläht jedes Byte um den Faktor 4/3 auf. Gemessen am
11. August 2026:

| | Bytes | Anteil |
|---|---|---|
| `spielen.html` gesamt | 326 889 | 100 % |
| davon Figurenblatt als Data-URI | 230 883 | **70,6 %** |
| davon Programm, Ton, Bedienoberfläche, Level | ~96 000 | 29,4 % |

Das ist die eigentliche Grenze. Jede Grafik unten trägt deshalb eine Gewichtsschätzung und
eine Formatangabe — und wo eine gemalte Grafik teurer wäre als ihr Gewinn, steht dort
**„bleibt Code"** mit Begründung (§4). Ein Verlauf im Code kostet null Byte und ist auf jeder
Bildschirmgröße richtig; das ist kein Ausweichen, sondern oft die bessere Antwort.

**Und ein Befund vorweg, der den ganzen Kostenrahmen verschiebt:** Das vorhandene
Figurenblatt ist mit einem **verlustfreien Alphakanal** kodiert (ALPH-Chunk 96 263 Bytes,
VP8-Farbchunk 76 370 Bytes, dazu 456 Bytes ICC-Profil). 86,6 % des Blattes sind vollständig
durchsichtig. Neu kodiert mit `quality 80, alpha_quality 60` misst dasselbe Bild
**83 582 Bytes** — gemessen, nicht geschätzt. Das sind **89 kB weniger binär, rund 120 kB
weniger in der Datei**, ohne einen einzigen Bildpunkt Kunst zu ändern. Damit ist alles, was
diese Datei an neuen Bildern vorschlägt (~67 kB binär, ~86 kB eingebettet), **doppelt
bezahlt, bevor es erzeugt wird.** Details in §5.

---

## §1 Bestandsaufnahme

Was das Spiel heute zeigt, woher es kommt, wie gut es ist. Das ist der Befund, auf dem alles
Weitere steht.

Für `scene.ts`, `terrainView.ts`, `palette.ts`, `hud.ts` und `icons.ts` sind **Funktionsnamen
statt Zeilennummern** angegeben — an diesen fünf Dateien wird parallel gearbeitet, Zeilen
veralten. Bei allen anderen Dateien stehen Zeilennummern.

### 1.1 Der Befund

| Was der Spieler sieht | Herkunft | Beleg | Zustand |
|---|---|---|---|
| **Figur, 12 Zustände** | **Bilddatei** | `src/art/wusel.webp` 896 × 1344, `wusel.atlas.json` (`ppl: 4`, Zeile 11), gezeichnet in `src/render/atlas.ts:168–206` | **Fertig.** Gemalt, weich verkleinert. Das einzige echte Bildmaterial im Projekt — die Durchsicht des Auftraggebers stimmt. |
| Figur, prozeduraler Rückfall | Canvas-Code | `src/render/sprites.ts:160–262` (`drawWusel`), `:286–298` (`drawDying`) | Platzhalter, ausdrücklich so benannt (`grafik-ankerbild-a0.md` §6 Punkt 2). Greift nur, wenn kein Blatt geladen ist. |
| **Erde, Fels, Stahl, Ziegel** | Canvas-Code | `terrainView.ts` → `TerrainView.paint`, Korn aus `grain(x,y)` | **Schwächste Stelle des Bildes.** Eine Grundfarbe je Material plus gleichverteiltes Rauschen ±7 plus Tiefenverlauf. Bei 5-facher Vergrößerung ist das Schmirgelpapier, keine Erde. |
| Grasnarbe | Canvas-Code | `TerrainView.paint`, Zweig `openAbove && !isFresh` → `p.crust` | Eine einzige Pixelzeile in `#63b23f`. Funktioniert als Spielsignal, sieht aus wie ein Filzstiftstrich. |
| Frischer Bruchsaum | Canvas-Code | `TerrainView.paint`, `freshBoost` = 30 | **Funktioniert und muss Code bleiben** — hängt an `fresh[]`, nicht am Ort. |
| **Himmel** | Canvas-Code | `scene.ts` → `Scene.drawSky` | Dreistufiger Verlauf, an der Welthöhe verankert. Sauber gedacht, aber leer: kein einziger Gegenstand am Himmel. Sichtbare Streifenbildung im Verlauf. |
| **Hügel, drei Ebenen** | Canvas-Code | `scene.ts` → `Scene.buildHills`, `Scene.drawHills` | Aus dem Startwert erzeugte Kurven, je Schicht ein senkrechter Verlauf. Die Parallaxe stimmt. Die Flächen sind unstrukturiert — die nächste Schicht ist ein großes, glattes Grün ohne Kante, ohne Baum, ohne Dunst. |
| **Ausgangstür** | Canvas-Code | `scene.ts` → `Scene.drawExit` | Drei ineinandergesetzte Rechtecke: `#1a1208`, `palette.glow`, `#fff6dd`. Dazu ein radialer Schein, der durch Gestein leuchtet. **Der Schein ist gut, der Türkörper ist ein Platzhalter.** |
| **Falltür** | Canvas-Code | `scene.ts` → `Scene.drawHatch` | Vier Rechtecke, 34 × 12 logisch. Keine Ketten, keine Klappen, keine Warnleuchte. Offen und geschlossen unterscheiden sich in **einer Füllfarbe**. |
| Partikel | Canvas-Code | `scene.ts` → `Scene.spawnFromEvents`, `Scene.burst`, `Scene.drawParticles` | Einfarbige Quadrate, 1–2 logische Pixel, mit Schwerkraft. In Bewegung besser als im Standbild. Die Explosion ist 26 orange Quadrate. |
| **Berufssymbole** | Canvas-Code | `icons.ts` → `drawSkillIcon` | Dünne Strichzeichnungen, `lineWidth = max(1.6, s·0.13)`. Maßhaltig und eindeutig, aber sie lesen als Drahtgitter, nicht als Gegenstand. |
| **Bedienleiste, Knöpfe** | Canvas-Code | `hud.ts` → `drawControls`, `drawRateSlider`, `drawIconButton`, `drawSoundButton` | Der **fertigste** Teil des Prototyps. Drei saubere Knopfzustände, Plakette, Bogen, Schieber mit Zahl im Griff. Es fehlt genau ein Zustand: **gedrückt**. |
| Sterne | Canvas-Code | `hud.ts` → `drawStars`, `star` | Zehneck aus Polarkoordinaten. Genügt. |
| Einblendungen | Canvas-Code | `src/render/overlays.ts:74–265` | Tafel, Knöpfe, Text. Kein Bild, kein Übergang, kein Ein- oder Ausblenden. |
| Levelauswahl | Canvas-Code | `overlays.ts:198–265` (`drawMenu`) | Textkarten mit Sternen. **Kein Kartenbild je Level** — man wählt blind. |
| Übersichtskarte | Canvas-Code | `src/render/minimap.ts:43–107` | Verkleinert die Terrain-Leinwand. Zeigt eigene Stollen sofort mit — richtig gelöst. |
| Randmarken | Canvas-Code | `src/render/offscreen.ts:18–115` | Pfeil zum Ausgang, Zählmarken links/rechts. Genügt. |
| Lupe | Canvas-Code | `src/render/magnifier.ts:28–84` | Kreisrand, Fadenkreuz, Zielring. Funktioniert. |
| **Anwendungssymbol** | Inline-SVG | `index.html:15–18` | **Falsch.** Zeigt eine kahle türkise Figur ohne Mähne in der abgelösten Palette (`#0e131c`). Die Figur hat seit `aa87b08` violettes Haar. |
| Ladebild | — | existiert nicht | Braucht es auch nicht, siehe §4. |
| Wasser, Fallen, Welten 2–6 | — | existiert nicht | **Und wird auch nicht gebraucht:** Alle fünf Level in `src/levels/index.ts` tragen `theme: 'grass'`. Die `CRYSTAL`-Palette in `palette.ts` wird von keinem Level erreicht. |

### 1.2 Drei Schlüsse aus dem Befund

**Erstens: Der Auftraggeber hat recht, und zwar mit allen vier Punkten.** Boden, Ausgangstür,
Falltür, Hintergrund sind genau die vier Flächen, die heute aus den einfachsten
Canvas-Befehlen bestehen, die das Spiel kennt — Rechteck und Verlauf. Alles andere ist
deutlich weiter.

**Zweitens: Der Katalog ist an genau der Stelle am schwächsten, wo er am dringendsten
gebraucht wird.** §11.1 fordert für die Erdkachel gleichzeitig „densely packed granular earth
… small embedded pebbles … a few short root threads" **und** „no single feature large or
distinctive enough to be recognised when the tile repeats fifteen times". Bei 64 × 64 heben
sich diese beiden Forderungen auf, und was übrigbleibt, ist gleichverteiltes Rauschen — also
exakt der Boden, den das Spiel heute schon hat. Die Lücke ist hier nicht nur „Prompt fehlt",
sondern „Prompt führt zurück zum Ausgangszustand". §3.1 löst das mit einer größeren Kachel.

**Drittens: Der Katalog will Pixelkunst, das Spiel ist gemalt.** Stilblock K und U verlangen
„crisp hand-crafted pixel clusters on a strict square pixel grid", der Negativblock verbietet
„anti-aliased interior" und „noise, film grain". Das ausgelieferte Figurenblatt hat aber
`ppl: 4` und wird ausdrücklich **weich** verkleinert (`atlas.ts:190`), und das Gelände wird
ausdrücklich **weich** vergrößert (`scene.ts` → `Scene.draw`, mit einem sechszeiligen
Kommentar, der die Entscheidung begründet). Eine gepixelte Tür neben einem gemalten Gelände
neben einer gemalten Figur sieht kaputt aus. **Diese Datei stellt deshalb alle Prompts auf
„gemalt" um** und nennt bei jeder Position den geltenden `ppl`-Wert. Das ist die einzige
bewusste Abweichung vom Katalog, und sie folgt dem Code, nicht dem Geschmack.

---

## §2 Die Lücken, nach Wirkung geordnet

Nicht alphabetisch, nicht nach Aufwand: **nach dem, was ein Spieler zuerst sieht.** Die
Rangfolge 1–4 ist vom Auftraggeber gesetzt („der boden ist z.B. nicht realistisch, die
ausgangstür und eingangsluke können besser werden, hintergrund und buttons"); Rang 5–7 ergibt
sich aus der Bildfläche und der Blickdauer.

| Rang | Lücke | Warum hier | Was sie kostet, solange sie offen ist | §3 |
|---|---|---|---|---|
| **1** | **Boden: Erde, Grasnarbe, Fels** | Größte Fläche des Bildes, oft über die Hälfte. Der Spieler starrt beim Graben genau darauf, und die Rückmeldung lautet wörtlich „nicht realistisch". | Das Spielfeld sieht aus wie eingefärbtes Schmirgelpapier. Der Boden erzählt weder, wie tief man ist, noch woraus er besteht — und das ist die einzige Information, die das Spiel dauernd anzeigt und nie ausspricht. | §3.1–§3.3 |
| **2** | **Ausgangstür und Falltür** | Die zwei Fixpunkte jedes Levels (GDD §5). Der Spieler schaut die ganze Runde abwechselnd auf beide. | Das Ziel des Spiels ist ein weißes Rechteck in einem braunen. Der Einstieg ist ein grauer Balken. Die zwei Gegenstände, um die sich alles dreht, sind die einzigen ohne Gestalt. | §3.4–§3.5 |
| **3** | **Hintergrund: Wolken, Hügelkamm** | Zweitgrößte Fläche, und die erste, die man beim Aufmachen sieht. | Ein leerer Himmel über glatten Farbflächen. Die Parallaxe ist gebaut und bezahlt, aber sie hat nichts zu verschieben — Tiefe entsteht durch Gegenstände in verschiedenen Ebenen, nicht durch Farbflächen in verschiedenen Ebenen. | §3.6–§3.7 |
| **4** | **Knöpfe: Berufsbild statt Strichsymbol** | Die Leiste ist ein Viertel des Bildschirms und der Ort jeder Entscheidung. | Acht Drahtgittersymbole, die man lernen muss. Ein Bild der Figur bei der Arbeit muss man nicht lernen — und es verbindet Leiste und Spielfeld, statt sie zu trennen. **Achtung:** Der Rest der Leiste ist gut und bleibt Code (§4.7). | §3.8 |
| 5 | **Explosion** | Der lauteste Moment des Spiels, und der einzige mit Bildschirmschütteln. | 26 orange Quadrate für das dramatischste Ereignis. Die Selbstzerstörung — das Ende jeder verlorenen Runde — sieht aus wie ein Programmfehler. | §3.9 |
| 6 | **Anwendungssymbol** | Der README sagt ausdrücklich „zum Startbildschirm hinzufügen". Dann ist das Symbol das erste und letzte Bild des Spiels. | Ein Symbol, das eine Figur zeigt, die es seit vier Monaten nicht mehr gibt. Wer das Spiel auf dem Handy ablegt, hat einen kahlen türkisen Klotz auf dem Startbildschirm. | §3.10 |
| 7 | **Store-Keyart** | Braucht kein Kilobyte in der Datei, wird aber gebraucht, sobald jemand das Spiel weiterreicht. | Kein Bild zum Zeigen. Kostet heute nichts, morgen einen Tag. | §3.11 |

**Was ausdrücklich nicht in dieser Liste steht, obwohl der Katalog es führt:** Kristallhöhle,
Ewiges Eis, Zahnradfabrik, Vulkanschlund, Wolkenwerft, Bärenfalle, Presse, Feuerstrahl,
Wasser, Magnetiker, Springer. Alle fünf Level tragen `theme: 'grass'`, keine Falle ist
umgesetzt, zwei der zehn Berufe existieren nicht. Das ist Kunst für ein Spiel, das es noch
nicht gibt — und bei 320 kB Ausgangsgewicht ist das die teuerste Art, Zeit auszugeben.

---

## §3 Die Prompts

### §3.0 Wie diese Prompts gebaut sind

Jeder Prompt unten enthält **alles**, was er braucht: Stilangabe, Farbwerte, technische
Schranken, Negativliste. Keine `[PREPEND …]`-Marke, kein Verweis, nichts nachzuschlagen.
Reinkopieren und laufen lassen.

Drei Abweichungen von den Blöcken des Katalogs, jede mit Grund:

**1. Die Farbwerte stammen aus `src/render/palette.ts` im Ist-Zustand, nicht aus
`grafik-katalog.md` §5.4.** Die Palette wurde in `21e6cf1` („Tageslicht statt Nacht")
aufgehellt; die Palettensperre des Katalogs steht noch auf der Nachtfassung. Die geltenden
Werte:

| Fläche | Ist-Wert (`palette.ts`, `GRASS`) | Katalog §5.4 (überholt) |
|---|---|---|
| Erde | `#7a5230` | `#6b4a2e` |
| Grasnarbe | `#63b23f` | `#4f8f3c` |
| Fels | `#6b7480` | `#565d6b` |
| Stahl | `#9aa5b5` | `#8b96a6` |
| Gebaute Stufe | `#c98246` | `#b5713f` |
| Himmel oben / Mitte / unten | `#2f74b8` / `#69aadd` / `#c6e6f2` | `#101c33` / — / `#3d5f7d` |
| Hügel fern / mittel / nah | `#a5cbdd` / `#7aa8bd` / `#4a7f69` | `#1b2f42` / `#24415a` / `#2f5570` |
| Hügelfuß fern / mittel / nah | `#8fbbd0` / `#5e8ea6` / `#33604e` | — |
| Leuchten (Ausgang) | `#ffe6a8` | `#ffd98a` |
| Leiste / Text / Akzent (`hud.ts` `COL`) | `#1b2536` / `#eaf2ff` / `#ffc93c` | `#0e131c` / `#dce6f5` / `#ffd23f` |

Die Figurenfarben bleiben unverändert gültig (`grafik-ankerbild-a0.md` §3, §7.5): Haar
`#9d4edd` / Glanz `#c98bff` / Tiefe `#67219c`, Haut `#f4d7ac`, Oberteil `#2fc9b8`, Hose
`#3d5b78`, Schuhe `#2a2018`, Umriss `#0c1119`, Werkzeug `#ffd23f`.

**2. Gemalt statt gepixelt.** Begründung in §1.2. Konkret heißt das: keine Forderung nach
„strict square pixel grid", kein Dithering, kein „no anti-aliasing" — und im Negativteil
entfällt der Absatz über Pixelraster, weil er das Gegenteil des Gewollten verlangt.

**3. Der Negativblock ist geteilt.** `grafik-katalog.md` §5.5 mischt drei Dinge: den
Rechtsrahmen, die Haarregeln und die Pixelraster-Regeln. Der Rechtsrahmen ist nicht
verhandelbar und steht **wörtlich in jedem Prompt unten** — kein Markenname, keine
Umschreibung einer Vorlage, **niemals grünes Haar mit blauer Kutte** (GDD §12). Die
Pixelrasterzeile ist ersetzt durch die entsprechende Zeile für gemalte Bilder.

**Zur `ppl`-Angabe:** `ppl` (Bildpunkte je logischem Pixel, `atlas.ts:66–77`) entscheidet den
Look. `1` heißt Pixelkunst mit harter Vergrößerung, größer als `1` heißt gemalt mit weicher
Verkleinerung. Das Figurenblatt steht auf **4**. Damit nichts auseinanderfällt, gilt:

| Gruppe | `ppl` | Warum |
|---|---|---|
| Figur, Ausgangstür, Falltür, Kammsaum, Explosion | **4** | Gleiche Ebene wie die Figur, gleiche Vergrößerung, gleiche Weichheit. |
| Erde, Fels, Grasnarbe | **1** | Die Terrain-Leinwand ist in logischer Auflösung gebaut (`terrainView.ts`, `canvas.width = terrain.width`). Ein Texel je logischem Pixel ist alles, was hineinpasst. **Aber gemalt**, weil `Scene.draw` diese Leinwand weich vergrößert — ein hart gepixeltes Korn würde ohnehin verwaschen. |
| Wolkenband, Berufsporträts, Anwendungssymbol | entfällt | Wird in Bildschirmpunkten gezeichnet, nicht in logischen Pixeln. |

**Zur Kachelbarkeit:** Bei jeder Kachel steht ausdrücklich, **in welcher Richtung** sie
schließen muss. Waagerecht-und-senkrecht gilt nur für die Materialkacheln, weil sie in
Weltkoordinaten abgetastet werden; alles am Himmel und an der Oberfläche schließt nur
waagerecht.

---

### §3.1 Erdkachel — Rang 1

|  |  |
|---|---|
| **Zweck** | Ersetzt die Grundfarbe `earth` in `TerrainView.paint`. Wird in Weltkoordinaten abgetastet (`tex[(y & 127) * 128 + (x & 127)]`) und trägt allein die **ortsabhängige** Struktur. Tiefenverlauf, Frischesaum und Grasnarbe bleiben im Code. |
| **Zielformat / Maße** | WebP, **128 × 128** Bildpunkte = 128 × 128 logische Pixel. Undurchsichtig, kein Alpha. |
| **`ppl`** | **1** — aber gemalt, nicht gepixelt. Feinstes sinnvolles Merkmal: 3 Texel. Alles darunter verschwindet in der weichen Vergrößerung. |
| **Werkzeug** | Bildmodell auf 1024 × 1024, danach **von Hand** kachelbar machen (Halbversatz + Stempeln), auf 128 herunterrechnen, Histogramm klemmen. Rechne mit 45–60 min Nachbearbeitung je Kachel (`grafik-katalog.md` §18.4). Ein Bildmodell trifft weder die Naht noch das Wertband — es liefert die Struktur, nicht das Asset. |
| **Gewicht** | ~5–8 kB WebP bei Qualität 90–95 · **eingebettet ~7–11 kB**. Gemessen an einer Probekachel gleicher Beschaffenheit: q90 = 5 338 B, q95 = 7 918 B, verlustfrei = 23 396 B. **Verlustbehaftet nehmen, verlustfrei ist hier viermal so teuer für nichts.** |
| **Warum nicht 64 × 64 wie im Katalog** | Bei 64 × 64 wiederholt sich die Kachel auf einem 960 Pixel breiten Level fünfzehnmal. Um das zu verbergen, verlangt der Katalog „no perceptible repeating motif at all" — und genau diese Forderung macht aus der Kachel wieder das gleichverteilte Rauschen, das der Boden heute schon ist. Bei 128 × 128 sind es siebeneinhalb Wiederholungen, und mittelgroße Merkmale bis zu einem Sechstel der Kachel werden erlaubt statt verboten. Das ist der eigentliche Unterschied zwischen „Schmirgelpapier" und „Erde". Der Preis: viermal so viele Bildpunkte, also rund 5 kB statt 2 kB. Das ist er wert. |

```
Seamless tileable ground texture for a side-scrolling puzzle game with
pixel-destructible terrain. Material: soft, diggable topsoil and subsoil.
This is a hand-painted texture, not pixel art: soft brush texture, gentle
value modelling, no hard pixel grid, no dithering, no visible individual
square pixels.

Colour: base warm earth brown #7a5230. Darker pockets and cavities toward
#5a3a20. Lighter grains, dry crumbs and dust toward #9a6c44. A few cool
grey-brown stones toward #6e6250. Warm and rich rather than muddy — this is
the friendliest world of the game and its soil should look workable, not
grim.

Content, and this is what the texture is actually for: densely packed
granular earth at three clearly different scales at once. Large scale — two
or three broad, soft tonal drifts across the tile, like patches of damper
and drier soil, each about a quarter of the tile wide, with very soft
edges. Medium scale — embedded rounded pebbles and small stones between six
and eighteen pixels across, a handful of short broken root threads, a few
compacted clumps, scattered irregularly and never in rows. Small scale — a
fine even crumb grain over everything, low in contrast.

The three scales together are the requirement. A texture with only the
fine grain reads as sandpaper; a texture with only the large drifts reads
as a stain. Both failures are worse than a flat colour.

Hard technical constraints, more important than the look:

Value range: no pixel may have any red, green or blue channel below 32 or
above 200. The engine adds up to fifty on top of this texture — grain,
top-edge lightening and a plus-thirty freshly-dug rim — and subtracts up to
twenty-four for depth. Anything outside that band clips to flat white or
flat black and destroys the freshly-dug rim, which is the one thing in this
game that shows the player their own work. Check the histogram, not the
impression.

Tiling: perfectly seamless on all four edges, left to right and top to
bottom, because the renderer samples this texture in world coordinates
across the entire level. Verify by offsetting the tile by half its width
and half its height: no seam, and no single feature bright, dark or large
enough to be recognised as the same feature when the tile repeats eight
times across a screen. Individual pebbles and clumps are allowed and
wanted; one conspicuous landmark stone is not.

No directional structure of any kind. Any consistent lean in the grain, any
repeated diagonal, any faint stripe becomes a visible diagonal band running
across the whole screen once the tile repeats. Keep every feature
rotationally arbitrary.

Lighting: completely flat and even. No directional shadow, no highlight
hotspot, no vignette, no corner darkening, no ambient occlusion — the
engine supplies all depth shading itself, and any baked lighting becomes a
visible repeat.

Absolutely no grass, no vegetation, no surface crust, no topsoil line of
any kind. The grass layer is a separate asset composited on top by the
engine, and grass baked into this tile would appear deep underground.

No feature smaller than three pixels of this texture at final size: the
renderer magnifies this tile about five times with smoothing, and anything
finer turns to mush.

Deliver at exactly 128 by 128 pixels, opaque, filling the whole canvas, no
border, no frame, no label, no separator. Aspect ratio 1:1.

Avoid the following: green hair, blue robe, blue hooded gown, green-haired
creature, hooded tunic, cowl, cloak, cape, small green-haired mascot, any
recognisable existing game character, existing franchise mascot, licensed
character, brand logo, trademark, watermark, signature, artist signature,
characters, creatures, figures, faces, tools, machines, text, letters,
numbers, captions, arrows, labels, vector art, flat vector illustration,
clip art, sticker style, glossy 3D render, cel-shading, photorealistic
photograph of soil, macro photograph, JPEG artefacts, chromatic aberration,
lens flare, bloom, vignette, drop shadow, cast shadow, baked ambient
occlusion, directional lighting, visible tiling seam, mirrored or
kaleidoscopic symmetry, repeated identical stones, a single conspicuous
landmark rock, diagonal streaking, banding, perspective distortion,
three-quarter camera, isometric view, cracked dry desert mud, brickwork,
regular grid, cobblestones.
```

**Abnahmekriterium.** Vier Prüfungen, in dieser Reihenfolge, **nach dem Kodieren als WebP**
— verlustbehaftete Kompression verschiebt Werte und Nähte, und beide sind hier tragend:

1. **Halbversatz.** Kachel um 64 nach rechts und 64 nach unten rollen. Keine Naht sichtbar,
   kein Merkmal doppelt erkennbar.
2. **Achtfach.** Kachel 8 × 8 nebeneinanderlegen und auf Armlänge ansehen. Sieht man ein
   Gitter oder ein wiederkehrendes Einzelstück, ist sie durchgefallen.
3. **Histogramm.** Kein Kanal unter 32, keiner über 200. Ein einziger Ausreißer nach oben
   frisst den Frischesaum an dieser Stelle.
4. **Stollenprobe.** Ein waagerechtes Loch von 6 Pixeln Höhe und ein senkrechter Schacht von
   8 Pixeln Breite mitten durch die Kachel ausstanzen und um 5 vergrößert ansehen. Die
   Schnittkante muss aussehen wie **durchgeschnittenes Material** — gleiche Körnung an der
   Kante wie in der Fläche. Sieht man dort ein halbiertes Merkmal, das eine Oberseite hatte
   (ein Stein mit Glanzlicht, ein Grasbüschel, ein Schatten), ist die Kachel falsch gebaut.
   **Das ist die Prüfung, an der fertige Tilesets scheitern**, und sie ist die einzige, die
   diesem Spiel eigen ist: Das Gelände ist keine Kachelkarte, sondern eine Maske, die sich an
   jeder Stelle jederzeit ändert.

---

### §3.2 Grasnarbe — Rang 1

|  |  |
|---|---|
| **Zweck** | Ersetzt den Zweig `openAbove && !isFresh → p.crust` in `TerrainView.paint`. Deckschicht mit Alpha, über die Erdkachel gemischt, aber **nur auf unberührter Oberfläche** — wo frisch gegraben wurde, gibt es keine Narbe, und das ist der sichtbare Beweis der eigenen Arbeit (GDD §6). |
| **Zielformat / Maße** | WebP mit Alpha, **128 × 16** Bildpunkte = 128 × 16 logische Pixel. Liest streng von oben nach unten als Tiefe. |
| **`ppl`** | **1**, gemalt. |
| **Werkzeug** | **Von Hand.** 128 × 16 mit einer Alpharampe ist eine Viertelstunde Arbeit in jedem Bildbearbeitungsprogramm und trifft dabei die Rampe genau. Ein Bildmodell liefert bei 16 Pixeln Höhe kein verwertbares Alpha. Der Prompt unten ist die **Formvorlage** — man erzeugt ihn auf 1024 × 128 und zeichnet danach von Hand nach. |
| **Gewicht** | ~1,5 kB WebP verlustfrei · **eingebettet ~2 kB**. Hier verlustfrei, weil der Alphaverlauf tragend ist und verlustbehaftetes Alpha ihn ausfranst. |
| **Codeänderung nötig** | Ja: `TerrainView.paint` braucht die Tiefe unter der Oberkante, um die richtige Zeile der Narbe zu wählen. Der Weg steht in `grafik-integration.md` §6.5 — höchstens acht Schritte je Spalte, innerhalb des Dirty-Rects. |

```
Seamless horizontally tileable overlay strip with transparency: the grass
crust that sits on top of undisturbed soil in a side-scrolling puzzle game.
This is an overlay composited by the engine on top of a separate soil
texture, so the lower part must dissolve into transparency rather than end
at a line. Hand-painted, soft brush texture, no pixel grid, no dithering.

Layout: the strip is 16 pixels tall and reads strictly top to bottom as
increasing depth below the surface. Four bands:

Band 1, the top 4 pixels: the living surface, fully opaque, fresh grass
green #63b23f, with short individual blades and small tufts breaking
irregularly upward past the top edge of the strip in a ragged, hand-cut
rhythm — never a straight line, never an even comb. Some tufts lean, none
lean the same way.

Band 2, the next 4 pixels: dense root mat, still almost fully opaque, the
green darkening downward toward #3f7a2c, with a few dry yellowish stems
mixed in near the top of the band.

Band 3, the next 4 pixels: the transition. Alpha falls steadily from nearly
opaque to about a quarter. Individual root threads reach downward, the
colour shifting from green through olive toward earth brown #7a5230, with a
few clinging soil crumbs caught in the roots.

Band 4, the bottom 4 pixels: almost entirely transparent, only a sparse
scatter of isolated fine pale root hairs reaching down into what will be
bare soil, fading to fully transparent in the very last pixel row.

The alpha ramp is the whole point of this asset. The engine places the
strip at whatever depth the terrain surface happens to be, and that surface
is rough and uneven, so the crust must never show a horizontal edge of its
own.

Tiling: perfectly seamless left to right — the left and right edges must
join without a visible seam, and no tuft or clump may be distinctive enough
to be recognised when the strip repeats eight times across a level.
Vertical tiling is not required and must not be attempted; top and bottom
are different things.

Value range: no colour channel below 32 or above 216.

Lighting: flat and even. No directional shadow, no highlight along the top
edge, no glow. The engine handles surface lightening itself.

Deliver at exactly 128 by 16 pixels, transparent where specified, no
border, no frame, no label. Aspect ratio 8:1.

Avoid the following: green hair, blue robe, blue hooded gown, green-haired
creature, hooded tunic, cowl, cloak, cape, small green-haired mascot, any
recognisable existing game character, existing franchise mascot, licensed
character, brand logo, trademark, watermark, signature, artist signature,
characters, creatures, insects, flowers, mushrooms, text, letters, numbers,
captions, vector art, flat vector illustration, clip art, sticker style,
glossy 3D render, photorealistic photograph of a lawn, macro photograph,
turf roll, sports pitch, mown stripes, an even comb of identical blades, a
straight horizontal edge anywhere, opaque bottom row, drop shadow, cast
shadow, directional lighting, visible tiling seam, JPEG artefacts, bloom,
perspective distortion, three-quarter camera, isometric view.
```

**Abnahmekriterium.**

1. **Alphaprobe.** Die unterste Bildzeile muss vollständig durchsichtig sein — ein einziger
   deckender Pixel dort erzeugt im Spiel eine waagerechte Linie quer durch das Erdreich.
2. **Kachelprobe waagerecht.** Achtmal aneinander, keine Naht, kein wiedererkennbares Büschel.
3. **Aufsetzprobe.** Über die Erdkachel aus §3.1 legen und die Oberkante um ±3 Pixel
   verschieben. In jeder Lage muss der Übergang glaubwürdig sein — die Narbe darf nirgends
   einen eigenen Horizont zeigen.
4. **Grabprobe.** Rechts von der Mitte alles ab einer senkrechten Kante entfernen (so, wie es
   ein Rammer täte). Links Gras, rechts nackte Erde, dazwischen eine harte Kante ohne jeden
   Übergang. Genau so muss es im Spiel aussehen: **Wo gegraben wurde, wächst nichts.**

---

### §3.3 Felskachel — Rang 1

|  |  |
|---|---|
| **Zweck** | Ersetzt die Grundfarbe `rock` in `TerrainView.paint`. Fels ist das Material, an dem der Spieler lernt, dass es Abstufungen zwischen „grabbar" und „unmöglich" gibt — er muss **härter als Erde, aber nicht wie Stahl** aussehen. |
| **Zielformat / Maße** | WebP, **128 × 128**, undurchsichtig. |
| **`ppl`** | **1**, gemalt. |
| **Werkzeug** | Wie §3.1: Bildmodell auf 1024, dann von Hand kachelbar machen und herunterrechnen. |
| **Gewicht** | ~6–8 kB WebP q90–95 · **eingebettet ~8–11 kB**. Fels hat mehr harte Kanten als Erde und komprimiert etwas schlechter. |
| **Nachrang gegenüber Erde** | Fels kommt in genau **einem** der fünf Level vor (`w1-02`, ein 44 × 155 großer Block). Die Erdkachel ist auf jedem Bildschirm zu sehen, die Felskachel auf einem von fünf. Deshalb steht sie hinter der Erde, obwohl sie derselbe Arbeitsgang ist. |

```
Seamless tileable ground texture for a side-scrolling puzzle game with
pixel-destructible terrain. Material: hard but still diggable bedrock.
Hand-painted texture, not pixel art: soft brush modelling on hard-edged
forms, no pixel grid, no dithering.

Colour: base cool grey #6b7480. Dark crevices and cracks toward #4b535e.
Lighter fracture faces toward #8a93a0. A few warmer mineral inclusions
toward #7d7466. Cool and stony against the warm brown soil it sits next to
— the two materials must be distinguishable at a glance and also in
greyscale.

Content: interlocking angular stone facets of clearly varying size, the
largest no wider than a fifth of the tile, each facet a flat plane with a
slightly different value so the surface reads as broken rather than
textured. Thin dark cracks run between the blocks in an irregular network
that never forms a grid and never runs consistently in one direction. A
sparse scatter of fine mineral speckles and two or three small chipped
hollows across the whole tile.

Read intent, and this is the point of the material: it must say "slow going
but possible". Clearly harder and more angular than soil, clearly softer
and more broken than machined steel. The player tells rock from steel by
this quality alone, so keep every edge irregular and hand-broken, never
straight, never machined, never repeated.

Hard technical constraints, more important than the look:

Value range: no pixel may have any red, green or blue channel below 32 or
above 200. The engine adds up to fifty on top of this texture and subtracts
up to twenty-four; anything outside that band clips and destroys the
freshly-dug rim.

Tiling: perfectly seamless on all four edges, left to right and top to
bottom — the renderer samples this texture in world coordinates across the
whole level. Verify by offsetting by half the width and half the height.
No single facet may be large or bright enough to be recognised as the same
facet when the tile repeats eight times across a screen.

No shared direction. If several crack lines or facet edges lean the same
way, the repeated tile produces a diagonal band across the entire screen.
Rotate the orientation of every facet arbitrarily.

Lighting: completely flat and even. Facet variation is expressed as value
steps in the material itself, never as a light direction. No baked shadow,
no highlight hotspot, no vignette, no ambient occlusion.

No feature smaller than three pixels of this texture at final size: the
renderer magnifies this tile about five times with smoothing.

Deliver at exactly 128 by 128 pixels, opaque, filling the whole canvas, no
border, no frame, no label. Aspect ratio 1:1.

Avoid the following: green hair, blue robe, blue hooded gown, green-haired
creature, hooded tunic, cowl, cloak, cape, small green-haired mascot, any
recognisable existing game character, existing franchise mascot, licensed
character, brand logo, trademark, watermark, signature, artist signature,
characters, creatures, faces in the rock, tools, machines, text, letters,
numbers, captions, vector art, flat vector illustration, clip art, sticker
style, glossy 3D render, photorealistic photograph of stone, macro
photograph, crystals, gemstones, geometric crystal facets, brickwork,
masonry, mortar joints, cobblestones, a regular grid, dressed stone
blocks, drop shadow, cast shadow, baked ambient occlusion, directional
lighting, visible tiling seam, mirrored symmetry, diagonal streaking,
banding, JPEG artefacts, bloom, perspective distortion, three-quarter
camera, isometric view.
```

**Abnahmekriterium.** Dieselben vier Prüfungen wie §3.1, plus eine fünfte:

5. **Nebeneinanderprobe.** Erd- und Felskachel nebeneinander legen, entsättigen und auf
   Armlänge ansehen. Sind die beiden **allein an Helligkeit und Struktur** zu unterscheiden,
   ohne Farbe? Wenn nicht, taugt der Unterschied für farbfehlsichtige Spieler nicht (GDD §6),
   und die Kachel geht zurück.

---

### §3.4 Ausgangstür — Rang 2

|  |  |
|---|---|
| **Zweck** | Ersetzt die drei Rechtecke in `Scene.drawExit`. **Nur den Türkörper** — der radiale Lichtschein davor und dahinter bleibt Code (§4.3), weil er durch Gestein leuchten, pulsieren und mit der Zoomstufe wachsen muss. Das ist die wichtigste Aufteilung dieses ganzen Dokuments: Das Bild liefert die Gestalt, der Code liefert das Leuchten. |
| **Zielformat / Maße** | WebP mit Alpha, **ein einziges Bild**, 128 × 104 Bildpunkte = 32 × 26 logische Pixel. |
| **`ppl`** | **4** — genau wie das Figurenblatt. |
| **Werkzeug** | Bildmodell (GPT Image 2 o. ä.), danach freistellen und auf 128 × 104 herunterrechnen. Der Katalog empfiehlt in §13.2 den 3D-Weg über Tripo wegen der drei Pulsbilder — **das entfällt hier**, weil der Puls im Code bleibt und die Tür deshalb nur **einen** Zustand braucht. Ein starres Objekt in einer Ansicht ist genau das, was Bildmodelle können. |
| **Gewicht** | ~3–4 kB WebP verlustfrei mit Alpha · **eingebettet ~5 kB**. Wenige Farben, harte Kanten, kleine Fläche — verlustfrei ist hier billiger als verlustbehaftet mit Alpha. |
| **Andocken** | Die Ausgangsrechtecke der fünf Level sind **unterschiedlich groß** (40 × 20, 32 × 26, 32 × 28, 32 × 28, 32 × 24). Das Bild darf deshalb **nicht** auf `e.w × e.h` gezerrt werden, sondern wird seitenverhältnistreu auf die Rechteckhöhe skaliert und auf der Unterkante mittig aufgesetzt. Eine gezerrte Tür ist an fünf verschiedenen Stellen fünfmal falsch. |
| **Quelle** | Motiv und Anforderung aus `grafik-katalog.md` §13.2, übernommen. Geändert: ein Bild statt drei, Ist-Palette statt `#ffd98a`, gemalt statt gepixelt, Maße auf `ppl: 4` umgerechnet. |

```
A single game object, seen from the side: the level exit of a puzzle game
about small creatures being rescued. A doorway standing on an implied
ground line, which the creatures walk into to be saved. Hand-painted with
real volume — soft rounded forms, clear light and shade on every surface,
visible brush texture, a dark outline that varies in weight. Painted like a
children's book illustration.

Design: a stout stone portal frame in very dark warm brown #1a1208, roughly
as wide as it is tall, with a gently arched top and softly rounded outer
corners. The frame is thick and heavy — about a fifth of the total width on
each side — with chunky bevelled stone blocks along the arch and two small
lamps in warm amber #ffe6a8 mounted on the upper corners. The stone is worn
and rounded at every edge, never sharp, never gothic, never ruined.

The doorway opening is filled with warm light in three concentric steps:
an outer body of glow amber #ffe6a8, a brighter inner field, and a
near-white core #fff6dd at the centre, all soft-edged and blending into one
another. The light spills a little onto the inner faces of the frame and
warms the lower stones.

Chunky, rounded, slightly toy-like — heavy but friendly, a door that
promises safety rather than a tomb entrance. It sits inside soil and rock,
so it must read as built, deliberate and welcoming against raw earth.

Critical requirement: this object is the goal of every level and is often
seen through solid terrain, so its silhouette must be unmistakable when
only its upper third is visible and when it is reduced to sixteen pixels
tall. One arched dark frame, one bright interior, two small corner lamps —
nothing else.

Do not draw any halo, glow spill, light beam, light rays, radial gradient
or bloom outside the frame. The surrounding glow is drawn separately by the
game engine and any glow baked into this image would appear twice.

Lighting: soft key light from almost directly above, cool ambient fill from
below, plus the warm light of the doorway itself lighting the frame from
inside. No cast shadow, no ground shadow, no contact shadow.

Deliver as one single centred object at exactly 128 by 104 pixels, fully
transparent background, the object touching the bottom edge with its base
and leaving two pixels of clearance on the left, right and top. No ground,
no terrain, no wall, no props, no backdrop, no border, no frame around the
canvas, no label. Aspect ratio approximately 4:3.

Avoid the following: green hair, blue robe, blue hooded gown, green-haired
creature, hooded tunic, cowl, cloak, cape, small green-haired mascot, any
recognisable existing game character, existing franchise mascot, licensed
character, brand logo, trademark, watermark, signature, artist signature,
characters, creatures, figures walking through the door, text, letters,
numbers, runes, carved symbols, captions, vector art, flat vector
illustration, clip art, sticker style, glossy 3D mobile-game render,
cel-shading, photorealistic, gothic architecture, ruined masonry, skulls,
spikes, chains, cobwebs, ivy, a wooden door leaf, a closed door, hinges, a
handle, a keyhole, halo, glow outside the frame, light rays, god rays,
lens flare, bloom, sparkles, drop shadow, cast shadow on transparent
background, ground shadow, busy background, perspective distortion,
three-quarter camera, isometric view, vanishing point.
```

**Abnahmekriterium.**

1. **Silhouettenprobe.** Bild komplett schwarz füllen, auf 32 × 26 herunterrechnen. Noch als
   Tür erkennbar? Ein Torbogen, der bei dieser Größe zu einem Klotz wird, hat den Zweck
   verfehlt.
2. **Verdeckungsprobe.** Die unteren zwei Drittel abdecken. Ist das Ding immer noch
   eindeutig „das Ziel"? Genau so sieht der Spieler es, bevor er den Tunnel fertig hat.
3. **Scheinprobe.** Bild vor den vorhandenen radialen Verlauf aus `Scene.drawExit` setzen.
   Es darf **kein zweiter Lichtsaum** entstehen. Sieht man einen Ring, wo das Bild aufhört,
   war doch ein Glanz eingebacken und muss weg.
4. **Untergrundprobe.** Vor Erde `#7a5230`, vor Fels `#6b7480` und vor Himmel `#69aadd`
   halten. Der dunkle Rahmen muss in allen drei Fällen als Kante lesen.

---

### §3.5 Falltür — Rang 2

|  |  |
|---|---|
| **Zweck** | Ersetzt die vier Rechtecke in `Scene.drawHatch`. Zwei Zustände: geschlossen (vor `HATCH_OPEN_TICKS`) und offen. Heute unterscheiden sie sich in **einer** Füllfarbe — der Moment, in dem das Level anfängt, ist unsichtbar. |
| **Zielformat / Maße** | WebP mit Alpha, **ein Blatt mit 2 Zellen nebeneinander**, je 136 × 48 Bildpunkte, Blatt also 272 × 48. Entspricht 34 × 12 logischen Pixeln je Zelle — genau den Maßen, die `Scene.drawHatch` heute benutzt. |
| **`ppl`** | **4**. |
| **Werkzeug** | Bildmodell für den **geschlossenen** Zustand, danach die beiden Klappen **von Hand** nach unten drehen. Ein Bildmodell, das zwei Zustände desselben Objekts liefern soll, liefert zwei ähnliche Objekte (`grafik-katalog.md` §18.2) — für eine Klappe, die sich um 70 Grad dreht, ist das Nachzeichnen schneller als der zweite Versuch. |
| **Gewicht** | ~2,5–3,5 kB WebP verlustfrei mit Alpha · **eingebettet ~4 kB**. |
| **Andocken** | Fußpunkt der Zelle ist die **Oberkante** der Luke: gezeichnet wird bei `entrance.x` mittig, `entrance.y − 14` als Unterkante des Kastens, genau wie heute. Die Ketten laufen aus der Zelle nach oben heraus und werden dort abgeschnitten — das ist gewollt und muss im Bild als durchlaufende Kette angelegt sein, nicht als Kette mit Ende. |
| **Quelle** | `grafik-katalog.md` §13.1, übernommen. Geändert: Ist-Palette, gemalt statt gepixelt, Maße auf `ppl: 4` umgerechnet, Tripo-Empfehlung gestrichen (siehe Werkzeug). |

```
A two-state game object, seen from the side: the entrance hatch of a level
in a puzzle game about small creatures. It is a hopper hanging in mid-air
on chains, and the creatures drop out of its underside. Hand-painted with
real volume — soft rounded forms, clear light and shade on every surface,
visible brush texture, a dark outline that varies in weight. Painted like a
children's book illustration.

Design: a heavy riveted steel box, wider than it is tall, in cool grey
#9aa5b5 with darker recesses #6d7887 and bright bevels #c4cddb, with
rounded corners and dome rivets along its edges. Two thick chains rise from
its top corners and run straight up out of the top edge of the cell,
continuing past it — they must read as chains that carry on upward, never
as chains that end. A single amber #ffc93c warning lamp sits on the top
face. The underside consists of two hinged doors meeting in the middle.

Chunky, rounded-cornered, slightly toy-like industrial design: heavy but
friendly, a piece of building-site equipment rather than a weapon.

Layout: exactly 2 frames in one horizontal row, equal cells, no gap, no
border, no separator, no label, no frame number. The hatch body sits at the
identical position and identical size in both cells; only the doors and the
lamp change.

Frame 1, closed: the two underside doors flush and shut, a single dark seam
between them, the amber lamp dim and unlit, the whole object at rest.

Frame 2, open: both doors swung down and outward at about seventy degrees
so they hang like two flaps, revealing a pure black opening #0b0d12
between them, the amber lamp lit bright with a small warm spill onto the
top face and the upper rivets, and three or four small dust motes falling
from the opening.

The object must read as an industrial hopper releasing something, never as
a door in a wall. At twelve pixels of character height this hatch is about
three creatures wide, so the open state must be recognisable by the two
downward-angled flaps alone, with no other cue.

Lighting: soft key light from almost directly above, cool ambient fill from
below. No cast shadow, no ground shadow, no contact shadow — the hatch
hangs in the air and there is nothing beneath it.

Deliver at exactly 272 by 48 pixels total, two cells of 136 by 48, fully
transparent background outside the object and the chains. No ground, no
terrain, no wall, no support structure, no backdrop, no border, no label.
Aspect ratio approximately 17:3.

Avoid the following: green hair, blue robe, blue hooded gown, green-haired
creature, hooded tunic, cowl, cloak, cape, small green-haired mascot, any
recognisable existing game character, existing franchise mascot, licensed
character, brand logo, trademark, watermark, signature, artist signature,
characters, creatures, figures falling out, text, letters, numbers,
captions, warning stripes with lettering, vector art, flat vector
illustration, clip art, sticker style, glossy 3D mobile-game render,
cel-shading, photorealistic, rust, decay, grime, spikes, saw blades,
skulls, a ceiling above the hatch, a wall behind it, a floor beneath it,
chains that end inside the cell, drop shadow, cast shadow on transparent
background, ground shadow, halo, bloom, lens flare, busy background,
perspective distortion, three-quarter camera, isometric view, vanishing
point.
```

**Abnahmekriterium.**

1. **Stapelprobe.** Beide Zellen übereinanderlegen. Kasten, Ketten und Lampe müssen auf
   demselben Pixel liegen; nur Klappen und Lampenhelligkeit dürfen sich unterscheiden. Wandert
   der Kasten, springt die Luke im Spiel beim Öffnen.
2. **Zweizustandsprobe auf Entfernung.** Beide Zellen auf 34 × 12 herunterrechnen und
   nebeneinander ansehen. Der Unterschied muss **aus dem Augenwinkel** lesbar sein — offen
   und geschlossen ist das erste Ereignis jeder Runde.
3. **Kettenprobe.** Obere Bildkante prüfen: Die Ketten müssen sie **durchstoßen**, nicht davor
   enden.
4. **Randprobe.** Nichts darf über eine Zellgrenze ragen, `Scene.drawHatch` schneidet hart ab.

---

### §3.6 Wolkenband — Rang 3

|  |  |
|---|---|
| **Zweck** | Neuer Gegenstand am Himmel. `Scene.drawSky` liefert einen sauberen Verlauf und sonst nichts — und ein Verlauf allein kann keine Tiefe erzeugen, weil sich nichts darin verschieben kann. Das Wolkenband wird mit einem sehr kleinen Parallaxfaktor (~0,12) über den Himmel geschoben und ist damit das **erste** Bild, das die vorhandene, bezahlte Parallaxmechanik sichtbar macht. |
| **Zielformat / Maße** | WebP mit Alpha, **1024 × 160** Bildpunkte. Wird in Bildschirmpunkten gezeichnet, nicht in logischen Pixeln — deshalb unabhängig von der Zoomstufe und über jeder Levelgröße gleich teuer. |
| **`ppl`** | entfällt (Bildschirmpunkte). |
| **Werkzeug** | Bildmodell. Das ist die Disziplin, in der Bildmodelle wirklich stark sind: große weiche Flächen, freie Komposition, kein Raster, keine Maßhaltigkeit. Nachbearbeitung: waagerechte Naht schließen, ~20 min. |
| **Gewicht** | ~10–14 kB WebP q85 mit Alpha · **eingebettet ~14–19 kB**. Die teuerste Einzelposition dieser Liste — sie steht deshalb bewusst an dritter Stelle und nicht an erster. |
| **Kachelbar** | **nur waagerecht.** Senkrecht nie — oben ist Himmel, unten ist Horizont. |

```
A horizontally tileable band of clouds for the sky of a side-scrolling
puzzle game, on a fully transparent background. Strictly orthographic side
view, flat on, no perspective convergence, no vanishing point.

Mood: a bright, friendly early afternoon. Warm, inviting, slightly
toy-like. Rounded generous shapes, nothing dramatic, nothing stormy,
nothing grim. The sky behind this band is painted by the engine as a smooth
gradient from #2f74b8 at the top through #69aadd to a pale #c6e6f2 at the
horizon, so these clouds must sit comfortably on a mid blue and read
against both the darker top and the paler bottom of that range.

Content: soft, rounded cumulus clouds of clearly different sizes,
overlapping in two loose depth layers. Large clouds — three or four across
the width, each about a fifth of the band wide, with generous piled-up tops
and flat soft undersides. Small clouds — a scatter of eight to twelve
smaller puffs and wisps between them, some very faint. The spacing is
deliberately uneven: two clouds close together, then a wide stretch of open
sky, then a cluster. Even spacing would read as a repeating pattern the
moment the band scrolls.

Colour: cloud tops in near-white #f4fbff, bodies in #dcecf7, undersides in
a cool blue-grey #a9c6dc with a hint of warm #e8dcc8 catching the light on
the upper left of the largest tops. Nothing pure white, nothing grey enough
to look like rain.

Opacity: the clouds are soft-edged and semi-transparent at their fringes,
fully opaque only at their densest cores, so the sky gradient shows through
their edges. The top and bottom edges of the band itself must be fully
transparent for at least twelve pixels, so the band has no visible boundary
of its own.

Tiling: perfectly seamless left to right. The left and right edges must
join without a seam and without a cloud that is recognisable as the same
cloud when the band repeats. Vertical tiling is not required and must not
be attempted.

Lighting: soft, from above and slightly left, consistent across the whole
band. No dramatic contrast, no god rays, no sun disc, no moon, no stars, no
birds.

Hand-painted, soft brush texture, no pixel grid, no dithering, no hard
outlines around the clouds.

Deliver at exactly 1024 by 160 pixels, transparent background, no border,
no frame, no label, no horizon line, no ground. Aspect ratio 32:5.

Avoid the following: green hair, blue robe, blue hooded gown, green-haired
creature, hooded tunic, cowl, cloak, cape, small green-haired mascot, any
recognisable existing game character, existing franchise mascot, licensed
character, brand logo, trademark, watermark, signature, artist signature,
characters, creatures, birds, aircraft, balloons, castles in the clouds,
faces in the clouds, text, letters, numbers, captions, vector art, flat
vector illustration, clip art, sticker style, glossy 3D render,
cel-shading, photorealistic photograph of the sky, HDR photograph, storm
clouds, thunderclouds, rain, lightning, sunset colours, sunrise colours,
sun disc, sun rays, god rays, moon, stars, lens flare, bloom, an opaque
background, a painted sky gradient behind the clouds, a horizon line,
ground, hills, trees, evenly spaced identical clouds, mirrored symmetry,
visible tiling seam, drop shadow, perspective distortion, three-quarter
camera, isometric view.
```

**Abnahmekriterium.**

1. **Deckungsprobe.** Band auf einen einfarbigen `#69aadd`-Grund legen. Es darf **kein**
   rechteckiger Rand, kein Helligkeitssprung an Ober- oder Unterkante sichtbar sein. Das ist
   die Prüfung, an der generierte Wolkenbänder fast immer scheitern — sie kommen mit einem
   mitgemalten Himmel.
2. **Doppelprobe.** Zweimal aneinander, dann um die halbe Breite verschoben ansehen. Keine
   Naht, keine wiedererkennbare Wolke.
3. **Verschiebeprobe.** Band um 300 Punkte über einen festen Himmel schieben und ansehen.
   Entsteht Tiefe, oder wandert eine Tapete? Wenn es wandert, sind die Wolken zu gleichmäßig
   verteilt.
4. **Gegenprobe zum Verzicht.** Band neben dem heutigen leeren Himmel ansehen. Wenn der
   Unterschied nicht sofort ins Auge fällt, ist das Band 14 kB nicht wert — dann streichen,
   und nur §3.7 bauen.

---

### §3.7 Kammsaum — Rang 3

|  |  |
|---|---|
| **Zweck** | Ein kachelbarer Streifen aus Baum- und Buschsilhouetten mit Alpha, der **entlang der erzeugten Hügelkurve** der vordersten Schicht gezeichnet wird. Er löst das Problem, ohne das Gute wegzuwerfen: `Scene.buildHills` erzeugt je Level aus dem Startwert eine eigene Kammlinie, und die ist ein echtes Merkmal. Ein gemaltes Parallaxblatt (`grafik-katalog.md` §12.2, 2048 × 1536, ~3 × 50 kB) würde diese Linie durch dieselbe Skyline in jedem Level ersetzen — für den Preis des halben verbleibenden Budgets. Der Saum kostet ein Zehntel davon und lässt die Kurve, wo sie ist. **Neu — im Katalog gibt es diese Lösung nicht.** |
| **Zielformat / Maße** | WebP mit Alpha, **512 × 48** Bildpunkte = 128 × 12 logische Pixel. |
| **`ppl`** | **4**. |
| **Werkzeug** | Bildmodell für die Silhouetten, danach freistellen und die Unterkante begradigen. Alternativ von Hand — zwanzig runde Formen sind eine halbe Stunde. |
| **Gewicht** | ~3–5 kB WebP verlustfrei mit Alpha · **eingebettet ~4–7 kB**. |
| **Kachelbar** | **nur waagerecht.** |
| **Andocken** | Der Streifen wird mit seiner **Unterkante** auf die quadratische Hügelkurve der vordersten Schicht gelegt (`Scene.drawHills`, `layer.factor = 0.68`, Farbe `#4a7f69`, Fuß `#33604e`) und dort kachelweise entlanggezogen. Er trägt keine eigene Grundlinie — was unterhalb der Kurve läge, wäre sichtbar falsch. |
| **Ehrlich zum Nutzen** | Ein Code-Kammsaum (eine Reihe Halbkreise entlang derselben Kurve) holt schätzungsweise siebzig Prozent des Gewinns für null Kilobyte. Was das Bild zusätzlich bringt, ist **Struktur innerhalb** der Silhouette — Laubmassen, Lücken, Dunst am Fuß. **Wenn das Budget eng wird, ist das hier die erste Position, die gestrichen wird.** |

```
A horizontally tileable strip of distant treeline silhouettes for the
foreground hill layer of a side-scrolling puzzle game, on a fully
transparent background. Strictly orthographic side view, flat on, no
perspective convergence, no vanishing point.

Purpose: this strip is laid along the crest of a rolling green hill that
the game draws procedurally, so its bottom edge must be a straight,
completely opaque horizontal line across the full width — the strip has to
merge invisibly into the hill body beneath it. Everything interesting
happens above that line.

Content: a ragged treeline of rounded, generous, slightly toy-like tree and
bush shapes standing along the bottom edge. Clearly different heights and
widths — some broad low bushes about a quarter of the strip height, some
rounded trees reaching nearly the full height, a few narrow ones between
them, with irregular gaps of empty transparency where the ridge is bare.
The rhythm must be uneven: a dense clump, a gap, two single trees, a wider
clump. Nothing spiky, nothing coniferous and pointed, nothing bare or dead.

Colour and depth: this is the nearest and darkest hill layer of the scene,
so the mass is a deep green #33604e at the bottom rising to #4a7f69 at the
crowns, with a slightly lighter #5d9a7e catching the upper left of the
larger crowns. Inside the mass, suggest two or three overlapping foliage
clumps per tree by value alone — a shade darker in the hollows between
clumps — but never draw individual leaves or branches. A very faint band of
cool haze #7aa8bd at about a quarter opacity sits low between the trunks,
so the treeline separates from the hill body.

The silhouette carries everything. At final size this strip is twelve
logical pixels tall and the whole treeline is about four pixels of usable
height, so the outline of the crowns is the only thing that survives.

Tiling: perfectly seamless left to right. The left and right edges must
join without a seam, and no tree may be distinctive enough in shape or
height to be recognised as the same tree when the strip repeats six times
across a level. Vertical tiling is not required and must not be attempted.

Lighting: soft, from above and slightly left, consistent across the whole
strip. No cast shadow onto the hill, no ground shadow.

Hand-painted, soft brush texture, no pixel grid, no dithering.

Deliver at exactly 512 by 48 pixels, fully transparent above the treeline,
fully opaque along the bottom four pixel rows across the entire width, no
border, no frame, no label, no sky, no ground below the strip. Aspect ratio
32:3.

Avoid the following: green hair, blue robe, blue hooded gown, green-haired
creature, hooded tunic, cowl, cloak, cape, small green-haired mascot, any
recognisable existing game character, existing franchise mascot, licensed
character, brand logo, trademark, watermark, signature, artist signature,
characters, creatures, birds, houses, huts, fences, windmills, towers,
text, letters, numbers, captions, vector art, flat vector illustration,
clip art, sticker style, glossy 3D render, cel-shading, photorealistic
photograph of a forest, individual leaves, individual branches, bare
trees, dead trees, spiky conifers, pine trees, palm trees, autumn colours,
snow, a painted sky behind the trees, an opaque background, a visible
horizon line, evenly spaced identical trees, mirrored symmetry, visible
tiling seam, a transparent or ragged bottom edge, drop shadow, cast
shadow, bloom, lens flare, perspective distortion, three-quarter camera,
isometric view.
```

**Abnahmekriterium.**

1. **Unterkantenprobe.** Die untersten vier Bildzeilen müssen über die **volle Breite**
   vollständig deckend sein. Ein einziger durchsichtiger Pixel dort erzeugt im Spiel ein Loch
   im Hügel.
2. **Kurvenprobe.** Streifen auf eine gewellte Linie legen (nicht auf eine gerade) und
   entlangziehen. Der Saum muss der Welle folgen können, ohne dass Bäume schräg stehen — also
   dürfen keine Stämme oder Schatten eine Senkrechte behaupten, die bei geneigter Kachel
   falsch wäre.
3. **Sechsfachprobe.** Sechsmal aneinander. Kein wiedererkennbarer Baum, keine Naht.
4. **Zwölfpixelprobe.** Auf 128 × 12 herunterrechnen. Bleibt eine gezackte, lebendige
   Kammlinie — oder ein gleichmäßiger Kamm? Ein gleichmäßiger Kamm ist schlechter als der
   heutige glatte Rand.

---

### §3.8 Acht Berufsporträts für die Knöpfe — Rang 4

|  |  |
|---|---|
| **Zweck** | Ein kleines Bild der **Figur bei der Arbeit** auf jedem Berufsknopf, statt eines abstrakten Strichsymbols. Der Katalog führt in §9 zehn „Erkennungsblätter" als Referenz für die Zustandsblätter und in §15.1 abstrakte Glyphen für die Leiste — **er verbindet die beiden nirgends.** Genau das ist die Lücke: Wer das Bild auf dem Knopf gelernt hat, erkennt die Figur im Gewusel, und umgekehrt. Das halbiert die Lernkurve, und zwar an der Stelle, an der jede Entscheidung fällt. **Neu.** |
| **Zielformat / Maße** | WebP mit Alpha, **ein Blatt mit 8 Zellen nebeneinander**, je 64 × 64, Blatt 512 × 64. |
| **`ppl`** | entfällt — die Bedienoberfläche rechnet in Bildschirmpunkten. 64 × 64 gilt für doppelte Pixeldichte bei rund 32 Punkt Anzeigegröße. Quer sind die Knöpfe 78 Punkt hoch (`layout.ts:61`), es ist also reichlich Platz. |
| **Werkzeug** | **Nicht generieren — backen.** Das Repo hat den Weg schon: `art-src/wuselwerker-v4.glb` plus `scripts/bake-atlas.mjs` plus die Posendateien unter `art-src/posen/`. Acht Standbilder aus genau den Posen zu rendern, die im Spiel laufen, ist ein Nachmittag Arbeit **und garantiert**, dass Knopf und Figur dieselbe Figur zeigen. Ein Bildmodell liefert hier acht hübschere Figuren, die mit dem Spiel nichts zu tun haben — der häufigste und teuerste Fehler bei Store- und Oberflächenbildern (`grafik-katalog.md` §16). Der Prompt unten ist deshalb ausdrücklich die **Rückfallebene**, falls der Backweg nicht zur Verfügung steht. |
| **Gewicht** | ~8–11 kB WebP verlustfrei mit Alpha · **eingebettet ~11–15 kB**. |
| **Bedingung** | Nur bauen, wenn die Knöpfe mindestens 60 Punkt breit sind. Darunter (Hochformat auf schmalen Geräten, `btnW` aus `layout.ts:72`) bleibt das gefüllte Symbol aus §4.7 die bessere Anzeige. Das Spiel braucht also **beides**, und das Symbol bleibt der Rückfall. |

```
A row of eight tiny character portraits for the skill buttons of a
real-time rescue puzzle game. The same creature in eight different working
poses, each shown from the waist up, facing right, cropped square.
Completely original character design.

The creature, identical in all eight cells: a good-natured little troll.
An oversized round head with full rounded cheeks taking up almost half the
figure's height, warm sand skin #f4d7ac, two large round dark eyes set low
and wide apart, a small round button nose and a broad closed-mouth grin. On
its head an enormous shock of vivid violet hair standing up and fanning
out, taller than the head itself, built from many overlapping pointed tufts
of different lengths with a ragged wind-blown edge: base tone #9d4edd, deep
#67219c in the gaps between tufts, and one continuous bright #c98bff
highlight band along the whole upper edge. A teal one-piece work top
#2fc9b8 with a high rolled collar and turned-back cuffs, simple mitten
hands with no separate fingers. One single hard near-black #0c1119 outline,
closed all the way around the silhouette including the hair.

Hand-painted with real volume — soft rounded forms, clear light and shade
on every surface, visible brush texture. Painted like a children's book
illustration.

Layout: exactly 8 cells in one horizontal row, equal cells, no gap, no
border, no separator, no label, no text, no frame number. Each cell is
exactly 64 by 64 pixels. The head sits at the identical height and the body
at the identical scale in every cell; only pose, tool and hair position
change. The creature fills about eighty percent of its cell.

The eight poses, in reading order:
1 Climber — both mitten hands raised above the head gripping an unseen
  wall, body pressed forward, hair swept back and down.
2 Floater — holding an open amber #ffd23f umbrella dome above its head by a
  straight handle, shoulders relaxed, hair hanging.
3 Bomber — holding a round dark bomb #2a2018 against its belly with both
  hands, a short curled fuse with a bright spark at its tip, eyes wide,
  hair standing straight up in alarm.
4 Blocker — both arms stretched perfectly horizontal to the sides in a wide
  T, chin up, determined, hair short and clear of the arms so the wide arm
  silhouette stays the widest thing in the cell.
5 Builder — laying a short plank of warm brown #c98246 forward and slightly
  downward with both hands, leaning only slightly, hair hanging forward.
6 Basher — swinging a heavy amber #ffd23f hammer sideways to the right at
  shoulder height, torso twisted into the swing, hair trailing left.
7 Miner — swinging an amber #ffd23f pickaxe diagonally down and to the
  right, hair trailing up and left.
8 Digger — driving an amber #ffd23f spade straight down in front of itself
  with both hands, hair thrown upward by the motion.

The hair position must differ visibly in all eight cells and must follow
the motion one beat behind it. Eight identical hairstyles on eight
different bodies is the single most common failure of this brief.

Readability rule, more important than any other instruction here: each cell
must remain unmistakable when scaled down to 32 by 32 pixels and viewed
through a smudged phone screen. Pose and tool carry all the information;
detail carries none. The eight silhouettes must be distinguishable from one
another with all colour removed.

Lighting: soft key light from almost directly above with a slight bias to
the left, cool ambient fill from below, one narrow bright rim along the top
of the hair. No side lighting, no cast shadow, no ground shadow, no contact
shadow.

Deliver at exactly 512 by 64 pixels, fully transparent background. No
ground, no terrain, no wall, no props beyond the named tool, no backdrop,
no border, no label. Aspect ratio 8:1.

Avoid the following: green hair, blue robe, blue hooded gown, green-haired
creature, hooded tunic, cowl, cloak, cape, small green-haired mascot, any
recognisable existing game character, existing franchise mascot, licensed
character, brand logo, trademark, watermark, signature, artist signature,
long flowing hair, individual hair strands, wispy hair, ponytail, braid,
pigtails, hair covering the eyes, fringe over the forehead, beard,
moustache, eyebrows as separate hairs, fur, feathers, eight identical hair
positions, a helmet, a hard hat, a cap, a hood, vector art, flat vector
illustration, clip art, sticker style, glossy 3D mobile-game render,
cel-shading, calarts style, chibi anime, kawaii sticker, plush toy
photograph, photorealistic, realistic human proportions, detailed facial
features, teeth, separate fingers, text, letters, numbers, captions,
speech bubbles, UI panel, button frame, drop shadow, cast shadow on
transparent background, ground shadow, halo, bloom, busy background,
perspective distortion, three-quarter camera, isometric view.
```

**Abnahmekriterium.**

1. **Achtfachprobe schwarz.** Alle acht Zellen schwarz füllen, auf 32 × 32 herunterrechnen,
   nebeneinander legen. **Achtfach unterscheidbar?** Rammer, Schrägbagger und Gräber
   unterscheiden sich nur in der Werkzeugrichtung — die muss übertrieben sein, bis sie nicht
   mehr zu verwechseln ist.
2. **Haarprobe.** Bild für Bild durchsehen: Steht das Haar in jeder Zelle anders? Zwei
   gleiche Haarlagen sind ein Fehler (`grafik-katalog.md` §19 Punkt 11).
3. **Blockerprobe.** Zelle 4 muss die **breiteste** Silhouette der acht sein. Verdeckt die
   Mähne die waagerechten Arme, ist das Signal des Blockers weg — die Regel steht in
   `sprites.ts:229–236` und in `grafik-katalog.md` §3.4.
4. **Knopfprobe am Gerät.** Blatt in die Leiste einsetzen, Handy quer, Daumen davor, bei
   Sonne. Erkennt man alle acht, ohne den Namen zu lesen? Wenn nicht, bleibt das Symbol.
5. **Herkunftsprobe.** Porträt und Spielfigur nebeneinander. Ist es **dieselbe** Figur?
   Wenn das Porträt hübscher ist als die Figur, ist es falsch.

---

### §3.9 Explosion — Rang 5

|  |  |
|---|---|
| **Zweck** | Ersetzt den Doppelausstoß aus `Scene.spawnFromEvents` beim Ereignis `explode` (26 Partikel `#ff9a3c`, 12 Partikel `#5a5a5a`). Die Sprengung ist das einzige Ereignis mit Bildschirmschütteln — und die Selbstzerstörung ist das Ende jeder verlorenen Runde. Das ist der dramatischste Moment des Spiels, dargestellt durch farbige Quadrate. |
| **Zielformat / Maße** | WebP mit Alpha, **ein Blatt mit 8 Zellen nebeneinander**, je 96 × 96 Bildpunkte, Blatt 768 × 96. Entspricht 24 × 24 logischen Pixeln je Zelle — der Sprengradius ist `BOMB_RADIUS = 14`. |
| **`ppl`** | **4**. |
| **Werkzeug** | Bildmodell. Achtbildige Effektfolgen sind machbar, wenn die Zellen groß und die Formen frei sind — beides trifft hier zu. Nachbearbeitung: Zellen einzeln freistellen und mittig ausrichten, ~1 h. |
| **Gewicht** | ~9–12 kB WebP q85 mit Alpha · **eingebettet ~12–16 kB**. |
| **Codeänderung** | Die Partikel bleiben zusätzlich (§4.10) — sie tragen den Auswurf über die Kugel hinaus. Das Blatt ersetzt nur den Kern. |

```
An eight-frame explosion animation strip for a side-scrolling puzzle game,
on a fully transparent background. Strictly orthographic side view, flat
on, no perspective.

Layout: exactly 8 frames in one horizontal row, equal cells, no gap, no
border, no separator, no label, no frame number. Each cell is exactly 96 by
96 pixels. The centre of the blast sits at the exact centre of every cell,
at the identical position in all eight frames.

The sequence, a single compact ground-level burst:
Frame 1 — a small hard white-hot core #ffffff about a fifth of the cell
wide, with a thin bright amber #ffe9a8 rim, no smoke yet.
Frame 2 — the core expands to about half the cell width, now a bright
layered fireball: white centre, amber #ffe9a8 middle, hot orange #ff9a3c
outer edge, with four or five blunt tongues of flame pushing outward.
Frame 3 — the fireball is at its largest, about four fifths of the cell,
the white centre shrinking, orange dominating, the first grey smoke #5a5a5a
curling off the upper edges, small dark debris chunks #4a3320 thrown
outward in eight or nine directions.
Frame 4 — the flame breaks apart: the fireball loses its round shape into
three or four separate orange lobes, grey smoke now half the mass, debris
further out and beginning to fall.
Frame 5 — flame mostly gone, one dull orange #c96a20 heart remaining inside
a growing billow of grey #5a5a5a and lighter #8a8a8a smoke, debris at the
edges of the cell.
Frame 6 — smoke only, a rounded rolling cloud filling three quarters of the
cell, the last dull glow #8a4a18 at its base, overall opacity beginning to
fall.
Frame 7 — the smoke cloud loosens and rises slightly, breaking into
distinguishable rolling puffs, opacity about half.
Frame 8 — a thin, wide, tattered veil of grey haze across the middle of the
cell, opacity about a fifth, almost gone.

Timing rule: the difference between consecutive frames must be large. This
plays at roughly one frame every three sixtieths of a second and the whole
sequence lasts a quarter of a second — eight subtle variations of the same
cloud would read as a flicker, not as an explosion.

Shape rule: rounded, generous, slightly toy-like. Blunt tongues of flame,
rolling round smoke, chunky debris. Nothing spiky, nothing realistic,
nothing gory.

Hand-painted with real volume — soft brush texture, clear value steps
between the layers of the fireball, no pixel grid, no dithering.

Lighting: the explosion is its own light source, so it is lit from the
inside outward; there is no external key light and no cast shadow anywhere.

Deliver at exactly 768 by 96 pixels, fully transparent background outside
the flame, smoke and debris. No ground, no terrain, no crater, no shockwave
ring on the ground, no backdrop, no border, no label. Aspect ratio 8:1.

Avoid the following: green hair, blue robe, blue hooded gown, green-haired
creature, hooded tunic, cowl, cloak, cape, small green-haired mascot, any
recognisable existing game character, existing franchise mascot, licensed
character, brand logo, trademark, watermark, signature, artist signature,
characters, creatures, body parts, blood, gore, text, letters, numbers,
captions, onomatopoeia, comic-book impact words, vector art, flat vector
illustration, clip art, sticker style, glossy 3D render, cel-shading,
photorealistic, photograph of an explosion, mushroom cloud, nuclear blast,
military imagery, spiky star-shaped flash, comic starburst, lens flare,
anamorphic flare, bloom, chromatic aberration, drop shadow, cast shadow on
transparent background, ground shadow, an opaque background, eight nearly
identical frames, perspective distortion, three-quarter camera, isometric
view.
```

**Abnahmekriterium.**

1. **Abspielprobe.** Die acht Zellen mit je drei Ticks Haltedauer abspielen. Wächst,
   zerfällt, verweht es — in dieser Reihenfolge? Flackert es, sind die Bilder zu ähnlich.
2. **Mittelprobe.** Alle acht Zellen übereinanderlegen. Der Mittelpunkt muss auf demselben
   Pixel liegen, sonst springt die Explosion.
3. **Ausblendprobe.** Zelle 8 muss fast durchsichtig sein. Ein harter Abriss nach Zelle 8 ist
   schlimmer als gar keine Explosion.
4. **Untergrundprobe.** Vor Erde `#7a5230` und vor Himmel `#69aadd` ansehen. Der graue Rauch
   muss vor beidem lesen.

---

### §3.10 Startbildsymbol — Rang 6

|  |  |
|---|---|
| **Zweck** | Ersetzt das Inline-SVG in `index.html:15–18`, das eine kahle türkise Figur in der abgelösten Palette zeigt. Der README fordert ausdrücklich „zum Startbildschirm hinzufügen" — dann ist dieses Symbol das erste und das letzte Bild, das jemand vom Spiel sieht. |
| **Zielformat / Maße** | WebP oder PNG, **180 × 180** (`apple-touch-icon`). Dazu, außerhalb der Einzeldatei, eine 1024 × 1024-Fassung für einen späteren Store-Eintrag. |
| **`ppl`** | entfällt. |
| **Werkzeug** | Bildmodell. Große Fläche, freie Komposition, kein Raster — die Disziplin, in der Bildmodelle wirklich stark sind (`grafik-katalog.md` §16). |
| **Gewicht** | ~4–6 kB WebP q88 · **eingebettet ~6–8 kB**. Die 1024er Fassung wird **nicht** eingebettet. |
| **Alternative, ernst gemeint** | Ein neu gezeichnetes Inline-SVG kostet ~600 Bytes und ist bei jeder Größe scharf. Wenn nur der Browserreiter zählt, ist das die bessere Antwort (§4.14). Das gemalte Symbol lohnt sich erst, sobald das Spiel auf einem Startbildschirm liegt oder in einem Store steht. |
| **Quelle** | `grafik-katalog.md` §16.1, übernommen. Geändert: Ist-Palette statt Nachtpalette, der Widerspruch „The red hair is the single most important element" bei violettem Haar bereinigt, Maße auf 180 × 180 für den Startbildschirm. |

```
A mobile app icon for a real-time rescue puzzle game about small creatures
digging through destructible terrain. Completely original character design,
not based on any existing game or franchise.

Composition: a single creature in three-quarter front view, filling the
central two thirds of the icon, seen from slightly above, looking up at the
viewer with cheerful, slightly clueless determination.

The creature: a good-natured little troll. An oversized round head with
full rounded cheeks taking up almost half the figure's height, warm sand
skin #f4d7ac, two large round dark eyes with a single bright catchlight
each, set low on the face and wide apart, a small round button nose and a
broad closed-mouth grin pushed up into the cheeks. On its head an enormous
shock of vivid violet hair standing straight up from the whole scalp and
fanning out, taller than the head itself, built from many overlapping
pointed tufts of clearly different lengths that cross one another and give
a ragged wind-blown edge: base tone #9d4edd, deep #67219c in the gaps
between the tufts, and one continuous bright #c98bff highlight band running
along the whole upper edge. A teal one-piece work suit #2fc9b8 with a high
rolled collar and turned-back cuffs, blue-grey trousers #3d5b78, dark boots
#2a2018, simple mitten hands with no separate fingers. One single hard
near-black #0c1119 outline, closed all the way around the silhouette
including the hair. It holds a broad amber #ffd23f spade across its body.

The violet hair is the single most important element of this icon after the
face. It must be large, bright and clearly silhouetted, because it is the
one feature that distinguishes this game at thumbnail size in a list of
icons.

Background: a simple radial field from a mid sky blue #4a8cc4 at the edges
to a lighter #7ab4e0 behind the head, with a subtle warm glow #ffe6a8
behind the creature's shoulders so its silhouette separates hard from the
ground. A shallow cross-section of warm brown soil #7a5230 with a fresh
green crust #63b23f runs across the bottom fifth, with one small dug tunnel
opening visible in it.

Hand-painted with real volume — soft rounded forms, clear light and shade
on every surface, visible brush texture, painted like a children's book
illustration. Warm, inviting, friendly.

Lighting: warm key from above front-left, cool bounce from below, one
narrow bright rim along the top of the hair.

Readability rule, non-negotiable: the whole icon must remain readable at 40
by 40 pixels — one clear subject, one clear silhouette, high value
contrast, no fine detail anywhere. The violet mane and the round head must
be identifiable at that size and nothing else needs to be.

Deliver at exactly 1024 by 1024 pixels, opaque, filling the whole canvas.
No text, no logo, no title, no border, no rounded-corner mask drawn into
the image — the operating system applies the mask, so nothing important may
sit within eighty pixels of any edge. Aspect ratio 1:1.

Avoid the following: green hair, blue robe, blue hooded gown, green-haired
creature, hooded tunic, cowl, cloak, cape, small green-haired mascot, any
recognisable existing game character, existing franchise mascot, licensed
character, brand logo, trademark, watermark, signature, artist signature,
long flowing hair, individual hair strands, wispy hair, ponytail, braid,
pigtails, hair covering the eyes, fringe over the forehead, beard,
moustache, eyebrows as separate hairs, fur, feathers, a helmet, a hard hat,
a cap, a hood, red hair, pink hair, vector art, flat vector illustration,
clip art, sticker style, glossy 3D mobile-game render, cel-shading,
calarts style, chibi anime, kawaii sticker, plush toy photograph,
photorealistic, realistic human proportions, detailed facial features,
teeth, separate fingers, text, letters, numbers, captions, speech bubbles,
title lettering, a game logo, a rounded-corner mask, a drop shadow behind
the icon, a badge, a ribbon, a starburst, busy background, cluttered
composition, multiple characters, perspective distortion, isometric view.
```

**Abnahmekriterium.**

1. **Vierzigpunktprobe.** Auf 40 × 40 herunterrechnen und zwischen fremde Symbole auf einen
   echten Startbildschirm legen. Findet man es wieder?
2. **Maskenprobe.** Kreisförmig und mit abgerundetem Quadrat beschneiden. Nichts Wichtiges
   darf abgeschnitten werden.
3. **Herkunftsprobe.** Neben einen Bildschirmabzug des Spiels halten. **Dieselbe** Figur?
   Eine hübschere Figur im Symbol als im Spiel erzeugt Enttäuschung und Rückgaben
   (`grafik-katalog.md` §16, Regel für alle fünf).
4. **Rechtsprobe.** Kein grünes Haar, keine Kutte, keine Kapuze, keine fremde Marke im Bild
   (GDD §12).

---

### §3.11 Store-Keyart quer — Rang 7

|  |  |
|---|---|
| **Zweck** | Ein Bild zum Zeigen. Wird **nicht** eingebettet und kostet die Einzeldatei kein Byte. Es steht hier, weil ein Spiel, das sich fertig anfühlen soll, ein Bild braucht, das man weitergeben kann — und weil dieses Bild erfahrungsgemäß am Tag vor der Veröffentlichung fehlt. |
| **Zielformat / Maße** | PNG oder JPEG, 2560 × 1440. |
| **Werkzeug** | Bildmodell. |
| **Gewicht** | **0 kB in der Einzeldatei.** |
| **Quelle** | `grafik-katalog.md` §16.3, übernommen und auf die Ist-Palette umgestellt. |

```
Wide landscape key art for a real-time rescue puzzle game about small
creatures digging through destructible terrain, in the spirit of the
classic side-scrolling rescue puzzlers. Completely original character
design, not based on any existing game or franchise.

Composition, strictly orthographic side view with no perspective
convergence and no vanishing point: a cross-section of a grassy hillside,
cut open like a doll's house so the viewer sees both the surface and the
tunnels beneath it at once. The horizontal centre band of the image stays
calm and uncluttered.

Upper third — open daylight sky, a smooth gradient from #2f74b8 at the top
through #69aadd to a pale #c6e6f2 at the horizon, with soft rounded white
clouds, and three receding rounded hill layers along the horizon in
#a5cbdd, #7aa8bd and #4a7f69 from far to near, the nearest crowned with a
ragged treeline.

Middle and lower two thirds — a mass of warm brown soil #7a5230 with a
fresh green grass crust #63b23f along its top edge, riddled with a network
of hand-dug tunnels and vertical shafts whose edges are hard and exact, as
though cut by a mask rather than crumbled. Grey bedrock #6b7480 forms one
angular outcrop. A wooden bridge of warm brown planks #c98246 spans a gap
in the middle distance.

The creatures, about a dozen of them at clearly different sizes according
to depth, each a good-natured little troll with an oversized round head,
warm sand skin #f4d7ac, two large round dark eyes set low and wide apart, a
broad closed-mouth grin, an enormous shock of vivid violet hair #9d4edd
with bright #c98bff highlights and #67219c shadows standing up from the
crown, a teal one-piece work suit #2fc9b8, blue-grey trousers #3d5b78, dark
boots #2a2018 and a hard near-black #0c1119 outline. They are all busy at
once: one digging straight down with an amber #ffd23f spade, one hammering
sideways into a tunnel wall, one standing with both arms stretched
horizontally to block a queue, one drifting down on an amber umbrella, one
laying a plank, three walking in a line along a tunnel floor, and two
disappearing into a glowing exit door.

On the right, set into the soil, the exit: a stout dark stone portal
#1a1208 filled with warm light #ffe6a8 and a near-white core #fff6dd,
throwing a soft warm halo into the surrounding earth. It is the brightest
point of the whole picture and the eye must land there last.

Top left, hanging from two chains, a riveted steel hatch #9aa5b5 with its
underside doors open and two creatures dropping out of it, violet hair
streaming straight up in the rush of air.

Mood: warm, inviting, busy, slightly toy-like, cheerfully overwhelmed.
Nothing grim, nothing gothic, nothing gory. This is a place where small
round creatures live and work.

Hand-painted with real volume — soft rounded forms, clear light and shade,
visible brush texture, painted like a children's book illustration.
Atmospheric haze lightens and desaturates the distance; the foreground is
the darkest and most saturated plane.

Leave the left third of the image comparatively calm and low in contrast so
a title can be set over it later. Do not draw the title.

Deliver at exactly 2560 by 1440 pixels, opaque. No text, no logo, no title,
no UI overlay, no border, no watermark. Aspect ratio 16:9.

Avoid the following: green hair, blue robe, blue hooded gown, green-haired
creature, hooded tunic, cowl, cloak, cape, small green-haired mascot, any
recognisable existing game character, existing franchise mascot, licensed
character, brand logo, trademark, watermark, signature, artist signature,
long flowing hair, individual hair strands, wispy hair, ponytail, braid,
pigtails, hair covering the eyes, beard, moustache, fur, feathers, helmets,
hoods, red hair, pink hair, vector art, flat vector illustration, clip art,
sticker style, glossy 3D mobile-game render, cel-shading, calarts style,
chibi anime, photorealistic, realistic human proportions, detailed facial
features, teeth, separate fingers, blood, gore, skulls, spikes, text,
letters, numbers, captions, speech bubbles, title lettering, a game logo,
UI overlay, health bar, buttons, lens flare, heavy bloom, perspective
distortion, three-quarter camera, isometric view, vanishing point.
```

**Abnahmekriterium.**

1. **Daumennagelprobe.** Auf 300 Punkte Breite herunterrechnen. Erkennt man in zwei Sekunden,
   worum es geht — kleine Wesen, Erde, Tunnel, leuchtende Tür?
2. **Titelprobe.** Linkes Drittel prüfen: Ist dort Platz für einen Titel, ohne etwas
   Wichtiges zu verdecken?
3. **Herkunftsprobe.** Wie §3.10 Punkt 3.
4. **Rechtsprobe.** Wie §3.10 Punkt 4.

---

## §4 Was bewusst Code bleibt

Fünfzehn Positionen, bei denen eine gemalte Grafik **teurer wäre als ihr Gewinn**. Diese
Liste ist keine Verlegenheit — sie ist die Hälfte der Antwort auf die Frage, die diese Datei
stellt. Ein Verlauf im Code kostet null Byte, ist bei jeder Bildschirmgröße scharf, lässt
sich in fünf Minuten umstimmen und braucht kein Werkzeug.

| Nr | Position | Heute | Warum Code gewinnt |
|---|---|---|---|
| **4.1** | **Himmelsverlauf** | `scene.ts` → `Scene.drawSky` | Ein Verlauf ist die eine Sache, die Code besser kann als jedes Bild: null Byte, auf jeder Höhe scharf, an der **Welt** verankert statt am Bildschirm (der Kommentar in `drawSky` begründet das ausführlich und richtig), und in fünf Minuten umgestimmt. Ein gemalter Himmelsstreifen wäre 2048 Pixel breit, 40 kB schwer und würde beim Hochziehen der Kamera falsch stehen. **Was fehlt, ist nicht der Verlauf, sondern der Inhalt** — und der kommt als Wolkenband (§3.6). Zu beheben ist nur die sichtbare Streifenbildung: eine Rauschauflage von ±2 auf den Verlauf, drei Zeilen Code, null Byte. |
| **4.2** | **Hügelkörper** | `scene.ts` → `Scene.buildHills`, `Scene.drawHills` | Die Kammlinie wird je Level aus `level.seed` erzeugt — jedes Level hat seine eigene Skyline. Ein gemaltes Parallaxblatt (`grafik-katalog.md` §12.2: 2048 × 1536, geschnitten drei Streifen, ~150 kB eingebettet) würde diese Vielfalt gegen **eine** Skyline in allen fünf Levels tauschen und dafür die Hälfte des Budgets nehmen. Das ist ein schlechter Tausch. Der gezielte Zusatz ist der Kammsaum (§3.7), nicht der Ersatz. |
| **4.3** | **Lichtschein des Ausgangs** | `scene.ts` → `Scene.drawExit`, radialer Verlauf mit `pulse` | Muss durch Gestein leuchten, mit der Zoomstufe wachsen und weich pulsieren. Ein gemalter Schein wäre bei einer Zoomstufe richtig und bei allen anderen falsch, brauchte drei Pulsbilder statt einer Sinusfunktion und würde beim Übereinanderlegen mit dem Bild aus §3.4 doppelt leuchten. **Bild für die Gestalt, Code für das Licht** — das ist die tragende Aufteilung dieser Datei. |
| **4.4** | **Tiefenverlauf, Oberkantenaufhellung, Frischesaum** | `terrainView.ts` → `TerrainView.paint` | Alle drei sind **zustandsabhängig**, nicht ortsabhängig: Der Tiefenverlauf hängt an `y/height`, die Oberkantenaufhellung an `openAbove`, der Frischesaum an `fresh[]`. Eine Kachel kennt nur den Ort. `grafik-integration.md` §5.0 hat das richtig aufgeteilt und diese Aufteilung gilt unverändert. Der Frischesaum ist zusätzlich die einzige Stelle, an der der Spieler seine eigene Arbeit sieht (GDD §6) — er darf niemals aus einem Bild kommen. |
| **4.5** | **Stahlkachel** | `terrainView.ts` → `TerrainView.paint`, Zweig `MAT.STEEL` | Das Muster ist arithmetisch exakt festgelegt: Schachbrettzelle 4 logische Pixel, Niete bei `x % 8 === 4 && y % 8 === 4`. Ein Bildmodell trifft dieses Raster nie, und eine Abweichung ist als Versatz sichtbar. `grafik-katalog.md` §11.3 empfiehlt das ausdrücklich selbst — die deutlichste Empfehlung des ganzen Abschnitts, und sie ist richtig. Vier Zeilen Code schlagen 8 kB Bild. |
| **4.6** | **Gebaute Stufe** | `terrainView.ts` → `TerrainView.paint`, Zweig `MAT.BRICK` | Der Brückenbauer legt Reihen von genau **einem** Pixel Höhe. Jede Bildzeile wird einzeln gesehen; senkrechte Maserung ist im Spiel unsichtbar. Was zählt, ist allein der waagerechte 6-Pixel-Rhythmus — und der steht schon im Code (`x % 6 === 0 ? -20 : 6`). Eine Kachel würde hier buchstäblich nichts hinzufügen. |
| **4.7** | **Berufssymbole in der Leiste** | `icons.ts` → `drawSkillIcon` | Drei Gründe. Erstens **Umfärbung**: Das Symbol wird in vier Farben gezeichnet (gewählt weiß, wählbar `#eaf2ff`, aufgebraucht `#4a5a75`) — ein Bild kann das nur über einen zweiten Zeichenschritt mit Maske. Zweitens **Maßhaltigkeit**: Die Knopfbreite hängt von der Bildschirmbreite ab (`layout.ts:72`), das Symbol wird auf `min(b.w · 0.6, 30)` skaliert; ein Vektorpfad ist bei jeder Größe scharf. Drittens **Rückfall**: Wenn die Porträts aus §3.8 auf schmalen Geräten nicht passen, muss das Symbol da sein. **Was zu tun ist, kostet null Byte:** die Striche durch **gefüllte Silhouetten** ersetzen. `lineWidth = max(1.6, s·0.13)` ergibt bei 30 Punkt eine 3,9-Punkt-Linie — das liest als Drahtgitter. Dieselben Formen als geschlossene Flächen lesen als Gegenstand. |
| **4.8** | **Kopfleisten-Knöpfe und der fehlende Druckzustand** | `hud.ts` → `drawIconButton`, `drawSoundButton` | Vier runde Knöpfe mit Glyphen bei 34–38 Punkt: Dort trifft kein Bildmodell das Raster, und `grafik-katalog.md` §15.5 sagt das selbst („**Von Hand.**"). Zwei Glyphen sind heute noch Textzeichen (`'☢'`, `'❚❚'`) und damit schriftartabhängig — die sollten gezeichnete Pfade werden, aber gezeichnet, nicht gemalt. **Die eigentliche Lücke ist ein fehlender Zustand, kein fehlendes Bild:** `drawIconButton` kennt `active`, aber nichts kennt „Finger liegt gerade drauf". Ein Knopf ohne Druckzustand fühlt sich auf dem Handy tot an. Das sind zehn Zeilen und null Byte. |
| **4.9** | **Sterne** | `hud.ts` → `drawStars`, `star` | Ein Fünfzackstern aus zehn Polarpunkten. Er wird in drei Größen gebraucht (8, 15, 24 Punkt) — als Bild wären das drei Auflösungen oder ein weichgezeichneter Stern. `grafik-katalog.md` §15.6 sagt „Von Hand", und selbst das ist noch zu viel: Der Code ist bereits richtig. |
| **4.10** | **Partikel: Staub, Splitter, Funken, Rettungsfunken** | `scene.ts` → `Scene.burst`, `Scene.drawParticles` | Bis zu 320 Partikel gleichzeitig, jeder mit eigener Bahn und Schwerkraft. Als Bild wären das 320 `drawImage`-Aufrufe je Bild statt 320 `fillRect`. Der Gewinn wäre die Form eines Teilchens, das 1–2 logische Pixel groß ist und eine halbe Sekunde lebt — den sieht niemand. Der Katalog führt sie unter §14.1–§14.6 als sechs Blätter; das sind rund 40 kB für Dinge, die in Bewegung besser aussehen als im Standbild. **Einzige Ausnahme: die Explosion (§3.9)**, weil sie groß, langsam und der dramatischste Moment des Spiels ist. |
| **4.11** | **Lupenrahmen** | `magnifier.ts:74–83` | Der Rahmen wechselt die Farbe, wenn ein Ziel gefasst ist (`target ? '#ffe066' : 'rgba(255,255,255,0.5)'`) — das ist die **Rückmeldung**, auf die es bei der Lupe ankommt, und sie ist der Grund, warum der Rahmen Code sein muss. Der Prompt in `grafik-katalog.md` §15.7 ist gut gedacht, liefert aber eine feste Fassung in einer Farbe. Was fehlt, kostet null Byte: eine Schattenkante nach außen, damit der Kreis auch über hellem Himmel steht. |
| **4.12** | **Übersichtskarte** | `minimap.ts:43–107` | Sie verkleinert die laufende Terrain-Leinwand und zeigt damit gegrabene Stollen sofort mit. Kein Bild der Welt kann das, weil sich die Welt ändert. Richtig gelöst, nichts zu tun. |
| **4.13** | **Kartenbilder der Level in der Auswahl** | `overlays.ts:198–265` — **fehlt heute** | Die Auswahlkarten zeigen nur Text und Sterne; man wählt blind. Das ist eine echte Lücke, aber die Antwort ist **kein Bild**: Jedes Level ist aus `level.paint` und `level.seed` deterministisch erzeugbar, und `TerrainView` malt genau dieses Bild schon. Einmal je Level beim Öffnen des Menüs in eine kleine Leinwand rechnen, im Speicher halten — **fünf gemalte Kartenbilder für null Byte**, und sie sind immer richtig, auch wenn sich ein Level ändert. Das ist die billigste Lücke der ganzen Liste. |
| **4.14** | **Browsersymbol (Favicon)** | `index.html:15–18` | Als Inline-SVG richtig aufgehoben: bei 16, 32 und 64 Punkt scharf, ~600 Bytes, kein Netzabruf. **Es ist nur falsch gezeichnet** — kahle Figur, abgelöste Palette. Neu zeichnen mit violetter Mähne (`#9d4edd`), Haut `#f4d7ac`, Oberteil `#2fc9b8`: derselbe Preis, richtiges Bild. Das gemalte Symbol aus §3.10 ist die Ergänzung für den Startbildschirm, nicht der Ersatz. |
| **4.15** | **Bildschirmübergänge** | existiert nicht | Zwischen Menü, Einblendung und Spiel wird hart geschnitten. Das ist eine echte Lücke im „fertig anfühlen" — und sie hat kein Bild: ein Überblenden über 200 ms, ein kurzer Aufzug der Ergebnistafel, ein Aufblitzen bei der Rettung. Alles `globalAlpha` und eine Interpolation, alles null Byte. |

**Zusammenfassung §4:** Von 26 Positionen bleiben **15 im Code**. Bei sechs davon (4.1, 4.7,
4.8, 4.11, 4.13, 4.15) ist trotzdem Arbeit zu tun — sie ist nur **Programmierarbeit statt
Grafikarbeit**, und sie kostet zusammen null Kilobyte.

---

## §5 Reihenfolge der Umsetzung

### 5.1 Zuerst: das Budget zurückholen

**Bevor eine einzige neue Grafik erzeugt wird, wird das vorhandene Figurenblatt neu
kodiert.** Gemessen:

| | Bytes binär | eingebettet |
|---|---|---|
| heute (`quality` unbekannt, Alpha **verlustfrei**, ICC-Profil) | 173 144 | 230 883 |
| `quality 90, alpha_quality 70` | 109 114 | ~145 000 |
| `quality 80, alpha_quality 60` | **83 582** | **~111 000** |

86,6 % des Blattes sind vollständig durchsichtig, 8,8 % sind der weiche Saum der Mähne — und
genau dieser Saum wird heute verlustfrei gespeichert. Er wird im Spiel **weich verkleinert**
(`atlas.ts:190`, `ppl: 4`); ein verlustbehaftetes Alpha ist an dieser Stelle nicht zu sehen.
Dazu kommen 456 Bytes ICC-Profil, die für ein Sprite-Blatt reine Fracht sind.

Zusätzlich: Das Blatt ist ein 8 × 12-Raster für **60** tatsächlich benutzte Bilder. **36 von
96 Zellen sind leer** — 37,5 % der Fläche. Enges Packen spart weitere Bytes, verlangt aber
eine Änderung am Manifest und steht deshalb dahinter.

**Ergebnis:** rund 90 kB binär, rund 120 kB in der Datei, für einen Kommandozeilenaufruf. Das
ist mehr, als alles in §3 zusammen kostet. **Prüfung:** Blatt vorher und nachher im Spiel
nebeneinander, Zackenkante der Mähne bei voller Zoomstufe ansehen. Sobald der Saum
ausfranst, eine Stufe zurück.

### 5.2 Die drei Positionen, die den größten Unterschied machen

| | Was | Gewicht eingebettet | Warum genau diese |
|---|---|---|---|
| **1** | **Erdkachel** (§3.1) | ~7–11 kB | Größte Fläche des Bildes, oft über die Hälfte. Ausdrücklich beanstandet. Eine einzige Datei, keine Animation, kein Timing, keine Zellgeometrie — und der Umbau in `TerrainView.paint` ist ein Tabellenzugriff statt einer Konstanten. **Bestes Verhältnis von Wirkung zu Kilobyte im ganzen Projekt.** |
| **2** | **Ausgangstür + Falltür** (§3.4, §3.5) | ~9 kB zusammen | Zwei kleine Bilder für die zwei Gegenstände, auf die jeder Spieler die ganze Runde schaut. Sie kosten zusammen weniger als ein Zwanzigstel des Figurenblatts und verwandeln die zwei Fixpunkte jedes Levels von Rechtecken in Gegenstände. Und weil der Puls im Code bleibt, ist es **ein** Bild plus **zwei** Zellen statt der fünf, die der Katalog verlangt. |
| **3** | **Grasnarbe** (§3.2) | ~2 kB | Die billigste Position der Liste und die, die den Boden am schnellsten glaubwürdig macht: Sie ist die Kante zwischen Himmel und Erde, sie steht auf jedem Bildschirm, und sie ist heute ein Filzstiftstrich. Zwei Kilobyte. Sie muss zusammen mit §3.1 kommen — eine gute Erde unter einer schlechten Narbe sieht schlechter aus als beide schlecht. |

### 5.3 Der ganze Weg

| Rang | Was | Art | Eingebettet |
|---|---|---|---|
| 0 | Figurenblatt neu kodieren (§5.1) | Werkzeug | **−120 kB** |
| 1 | Erdkachel (§3.1) | Bild | +9 kB |
| 2 | Grasnarbe (§3.2) + Codeänderung in `TerrainView.paint` | Bild | +2 kB |
| 3 | Ausgangstür (§3.4) | Bild | +5 kB |
| 4 | Falltür (§3.5) | Bild | +4 kB |
| 5 | Berufssymbole gefüllt statt Strich (§4.7) | Code | 0 |
| 6 | Druckzustand für alle Knöpfe (§4.8) | Code | 0 |
| 7 | Kartenbilder der Level aus `TerrainView` (§4.13) | Code | 0 |
| 8 | Rauschauflage auf den Himmelsverlauf (§4.1) | Code | 0 |
| 9 | Kammsaum (§3.7) | Bild | +6 kB |
| 10 | Felskachel (§3.3) | Bild | +10 kB |
| 11 | Browsersymbol neu zeichnen (§4.14) | Code | ~0 |
| 12 | Bildschirmübergänge (§4.15) | Code | 0 |
| 13 | Wolkenband (§3.6) | Bild | +16 kB |
| 14 | Berufsporträts (§3.8) | Bild | +13 kB |
| 15 | Explosion (§3.9) | Bild | +14 kB |
| 16 | Startbildsymbol (§3.10) | Bild | +7 kB |
| 17 | Store-Keyart (§3.11) | Bild, extern | 0 |

**Bilanz.** 11 Bildpositionen, davon 10 eingebettet: **~67 kB binär, ~86 kB eingebettet.**
Zusammen mit der Neukodierung aus §5.1:

```
heute                     326 889 Bytes
− Neukodierung Figur     −120 000
+ zehn neue Grafiken      + 86 000
                          ─────────
danach                   ~293 000 Bytes
```

**Das Spiel bekommt zehn neue Grafiken und wird dabei um 34 kB leichter.** Die Grenze zwischen
„verändert den Gesamteindruck" und „verbessert Details" liegt hier zwischen Rang 8 und 9 —
bis dahin sieht man jeden Schritt sofort, danach nur noch beim Hinsehen.

---

## §6 Widersprüche in den bestehenden Dokumenten

Gefunden beim Lesen, **nicht geändert** — die Dateien bleiben, wie sie sind. Sortiert nach
Schadenswirkung: Was oben steht, führt beim Befolgen zu falscher Grafik.

**1. Der Blattvertrag im Katalog steht noch auf der alten Zelle.** `grafik-katalog.md` §5.3
verlangt „Every cell is exactly 192 by 192 pixels", Grundlinie bei 160, Mittellinie bei 96,
Figur 96 hoch. Das ist die abgelöste Zelle 24 × 24 mit Fußpunkt (12, 20) bei 8-facher
Vergrößerung. Verbindlich ist seit `grafik-ankerbild-a0.md` §4.3 die Zelle **28 × 28** mit
Fußpunkt **(14, 22)** — bei 8× also 224 × 224, Grundlinie 176, Mittellinie 112. `grafik-katalog.md`
§0 behauptet, die Geometrie sei „unverändert" aus `grafik-integration.md` §2 übernommen, und
§1.2 nennt korrekt 28 × 28 — der Block, der wörtlich in jeden Prompt kopiert werden soll,
tut es nicht. **Wer §5.3 benutzt, bekommt Blätter in der falschen Zellgröße.**

**2. Der Blattvertrag und der Negativprompt verbieten die Kameraführung des Ankers.**
`grafik-katalog.md` §5.3 fordert „strict orthographic side view facing right in every frame",
§5.5 verbietet „three-quarter camera". `grafik-ankerbild-a0.md` §7.2 stellt die Kamera
ausdrücklich **30 Grad aus dem Profil** und begründet es gemessen: im strengen Profil ist der
Hinterkopf vollständig Haar, Gesicht und Rumpf je zwei Pixel breit. Die Ankerdatei gilt, aber
die beiden Blöcke sagen wörtlich das Gegenteil und sollen wörtlich kopiert werden.

**3. Die Palettensperre steht auf der Nachtfassung.** `grafik-katalog.md` §5.4 nennt Erde
`#6b4a2e`, Grasnarbe `#4f8f3c`, Fels `#565d6b`, Stahl `#8b96a6`, Stufe `#b5713f`, Himmel
`#101c33` → `#3d5f7d`, Hügel `#1b2f42` / `#24415a` / `#2f5570`. `src/render/palette.ts` steht
seit `21e6cf1` („Tageslicht statt Nacht") auf `#7a5230`, `#63b23f`, `#6b7480`, `#9aa5b5`,
`#c98246`, `#2f74b8` → `#69aadd` → `#c6e6f2`, `#a5cbdd` / `#7aa8bd` / `#4a7f69`. **Jeder
Prompt des Katalogs, der eine Gelände- oder Himmelsfarbe nennt, ist damit falsch** — das sind
§11 vollständig, §12 vollständig, §13, §16. Ebenso die Oberflächenfarben: §5.4 nennt Leiste
`#0e131c`, Text `#dce6f5`, Akzent `#ffd23f`; `hud.ts` `COL` steht auf `#1b2536`, `#eaf2ff`,
`#ffc93c`.

**4. In der Palettensperre steckt noch ein roter Haarwert.** `grafik-katalog.md` §5.4 listet
„hair deep shadow **#5c1210**" zwischen lauter violetten Werten. `#5c1210` ist ein Rotton aus
der abgelösten Fassung; die geltende Rampe ist `#9d4edd` / `#c98bff` / `#67219c`
(`grafik-ankerbild-a0.md` §3). Ein Modell, das den Block wörtlich bekommt, malt eine violette
Mähne mit rotem Kern.

**5. Zwei Prompts widersprechen sich in sich selbst.** `grafik-katalog.md` §16.1 beschreibt
„a thick backward-swept mane of vivid violet hair #9d4edd" und sagt zwei Absätze später „The
**red** hair is the single most important element of this icon". §16.2 beschreibt „vivid
violet hair #9d4edd" und dann „The three vertical **red** hair plumes are the visual hook of
the whole image". Beide Prompts enthalten also ihre eigene Verneinung.

**6. Die Auslieferungsgröße im Integrationsdokument ist von der Wirklichkeit überholt.**
`grafik-integration.md` §2.2 und §6.6 begründen ausführlich, warum in **1×** ausgeliefert
wird: „Der Figurenatlas … liegt bei etwa 7 kB PNG … zusammen also gut 25 kB im Bündel. Das
ist die Rechtfertigung dafür, in 1× auszuliefern statt in 2× oder 4×: **Bei 4× wären es rund
400 kB, und die Einzeldatei würde unhandlich.**" Ausgeliefert wird `ppl: 4`
(`wusel.atlas.json:11`), das Blatt wiegt 169 kB und 231 kB als Data-URI, also 70,6 % von
`spielen.html`. Die Entscheidung für 4× ist begründet und richtig (`8ddbba8` „Gemalte
Darstellung statt Pixelgrafik"), aber die Warnung von damals ist eingetreten und steht
unkorrigiert daneben. §6.6 ist damit gleichzeitig der beste und der veralteste Abschnitt zum
Thema Gewicht.

**7. Der Rahmen der Einzeldatei ist noch für die Nachtfassung gebaut.**
`scripts/build-single.mjs` erklärt im Kommentar: „**Bewusst einthemig dunkel: Das Spiel ist
eine Nachtszene** und lässt sich nicht umfärben — eine helle Fassung würde dagegen schlagen",
und setzt `--grund: #05070c`, `--panel: #0e131c`, `--akzent: #ffd23f`. Seit `21e6cf1` ist das
Spiel eine Tagszene mit Himmel `#c6e6f2` am Horizont. Der Rahmen ist also für das Gegenteil
dessen gebaut, was er umrahmt — im Querformat-Bildschirmabzug sieht man das deutlich.

**8. Die Forderungen an die Erdkachel heben sich gegenseitig auf.** `grafik-katalog.md` §11.1
verlangt „densely packed granular earth … small embedded pebbles … a few short root threads,
occasional tiny stones" **und zugleich** „no perceptible repeating motif at all. There must be
no single feature large or distinctive enough to be recognised when the tile repeats fifteen
times across the screen". Bei 64 × 64 ist beides zusammen nicht erfüllbar; was ein Modell
daraus macht, ist gleichverteiltes Rauschen — also genau der Boden, den das Spiel heute schon
hat, und der beanstandet wurde. §3.1 löst das über eine größere Kachel und eine ausdrückliche
Erlaubnis für mittelgroße Merkmale.

**9. Der Katalog verlangt Pixelkunst für ein Spiel, das gemalt ist.** Stilblock K und U
fordern „crisp hand-crafted pixel clusters on a strict square pixel grid", der Negativprompt
verbietet „anti-aliased interior" und „noise, film grain". Das ausgelieferte Figurenblatt hat
`ppl: 4` und wird ausdrücklich weich verkleinert (`atlas.ts:186–192`); das Gelände wird
ausdrücklich weich vergrößert (`scene.ts` → `Scene.draw`, mit einem eigenen Begründungsblock).
Wer Katalog und Code gleichzeitig befolgt, bekommt eine gepixelte Tür neben einem gemalten
Gelände. `grafik-katalog.md` §18.1 ahnt das Problem („Der einzige Weg zu echtem Pixelart im
Spiel führt über Nachbearbeitung von Hand"), zieht aber nicht die Folgerung, dass das Spiel
inzwischen gar kein Pixelart mehr ist.

**10. `src/art/README.md` nennt das falsche Dateiformat.** Dort steht als verbindliches Paar
„`wusel.png` das Blatt / `wusel.atlas.json` die Aufteilung", und `atlas:backen` wird mit
„alle 60 Bilder → `src/art/wusel.png`" beschrieben (ebenso `grafik-ankerbild-a0.md` §7). Im
Ordner liegt `wusel.webp`. Der Lader kommt damit zurecht (`src/art/index.ts:34` prüft `.webp`
vor `.png`), die Anleitung nennt aber nur den Weg, der nicht benutzt wird.

**11. Der Kommentarkopf in `atlas.ts` nennt die falsche Zelle.** `src/render/atlas.ts:12`
schreibt „Zelle 32 × 28 logisch, Fusspunkt (16, 22)". Vierzig Zeilen tiefer setzt dieselbe
Datei `CELL_W = 28`, `CELL_H = 28`, `ANCHOR_X = 14`, `ANCHOR_Y = 22` — richtig nach
`grafik-ankerbild-a0.md` §4.3. Nur der Kommentar ist falsch, und zwar in der Breite (32 statt
28) und im Ankerpunkt (16 statt 14).

**12. Das Wertband und ein Palettenwert stimmen nicht überein.** `grafik-integration.md` §5.0
und `grafik-katalog.md` §11 legen für grabbare Materialien „kein Kanal unter 32 oder über 200"
fest. `palette.ts` setzt die gebaute Stufe auf `#c98246`, Rotkanal **201**. Praktisch
harmlos — Ziegel bekommt die Fels-Oberkantenaufhellung nicht, der ungünstigste Fall landet
bei 244 —, aber Code und Vorgabe widersprechen sich um eine Stufe, und wer die Zahl aus dem
Code als Kachelgrundton nimmt, verletzt das eigene Band.

**13. Der Katalog plant für ein größeres Spiel, als es gibt.** §1 führt 78 Grafiken für sechs
Welten, zehn Berufe, vier Fallen und Wasser. Im Spiel: fünf Level, **alle** mit
`theme: 'grass'` (`src/levels/index.ts`), acht Berufe, keine Falle, kein Wasser. Die
`CRYSTAL`-Palette in `palette.ts` wird von keinem Level erreicht. Kein Fehler, aber eine
Reihenfolgenfalle: §20 setzt die fünf weiteren Welten auf Rang 11 von 15 und die
Bedienoberfläche auf Rang 14 — obwohl die Welten 2 bis 6 nicht existieren und die
Bedienoberfläche jede Sekunde zu sehen ist.

**14. Der Katalog sagt einmal das Richtige über die Bedienoberfläche und plant dann dagegen.**
§15 stellt fest: „`icons.ts` und `hud.ts` zeichnen die Oberfläche heute sauber und maßhaltig
als Vektorpfade. Das ist der **fertigste Teil des Prototyps**. Generierte Symbole werden hier
fast sicher schlechter sein als das, was schon da ist." Das ist richtig und deckt sich mit dem
Befund in §1 hier. Trotzdem stehen §15.1 bis §15.7 als sieben Grafikpositionen im Inventar
und in der Reihenfolge. Ein Abschnitt, der von sich selbst sagt, dass er nicht gebraucht wird,
sollte nicht als Lieferposten geführt werden — §4.7 bis §4.11 hier ziehen die Folgerung.
