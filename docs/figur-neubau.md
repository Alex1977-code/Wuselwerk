# Figur-Neubau — Auftrag an GPT Image 2 und Tripo

**Stand: 21.08.2026.** Die Spielfigur wird extern neu erstellt: ein Blatt aus
GPT Image 2, daraus ein geriggtes Modell aus Tripo. Diese Datei enthält den
Prompt zum direkten Einsetzen (§2), die Einstellungen für Tripo (§3) und die
Bedingungen, an denen das Ergebnis gemessen wird (§4 bis §7).

Alle Zahlen darin sind **gemessen**, nicht angenommen. Woher sie stammen, steht
jeweils dabei.

---

## §1 Warum überhaupt neu

Zwei Rückmeldungen zur alten Figur, beide inzwischen nachgemessen:

**„zu dick".** Breite durch Höhe der Silhouette lag bei **0,73**; der Mensch
liegt bei 0,35 bis 0,45. Behoben ist das bisher durch eine Stauchung beim
Backen (`schmal`/`tief` 0,64 in `art-src/wuselwerker/figur.json`) — das drückt
die Figur auf 0,47, verzerrt aber die Textur mit. Eine Figur, die schon schlank
modelliert ist, braucht die Stauchung nicht.

**„sieht aus wie eine Kappe".** Die Haarmasse des gelieferten Modells reichte
von y 0,252 bis 0,998 bei einer Figurenhöhe von 0,998 — **drei Viertel der
Figur waren Haar**, als geschlossene glatte Schale über Schultern und Rücken bis
auf Hüfthöhe. Behoben ist das bisher, indem der Backvorgang die Schale auf ein
Ellipsoid stutzt und der Renderer fünf Strähnen dazuzeichnet.

Beide Reparaturen bleiben im Code stehen und bleiben nützlich — die gezeichneten
Strähnen tragen die Bewegung, die ein gebackenes Blatt nicht kann. Was der
Neubau ändern soll, ist die **Vorlage**: schlank statt gestaucht, und eine
Haarmasse, die schon als Masse mit Locken kommt statt als Helm, den man
kleinschneiden muss.

### 1.1 Was ausdrücklich NICHT geändert wird

Die Proportionen. Dreizehn Posendateien, das Zellmass 17,003 logische Pixel,
der Werkzeugansatz, das Stirnband und die Strähnenwurzeln sind an dieser
Körperbauart vermessen. Der Prompt in §2 hält sie deshalb fest. Eine Variante
mit längeren Beinen steht in §8 — sie ist begründet, aber sie kostet eine
Messrunde.

---

## §2 Der Prompt für GPT Image 2

Wörtlich einsetzen, ohne Auslassung.

```
A cheerful cartoon workman character, mascot for a puzzle game about tiny
workers who dig through earth and rescue each other. Completely original
character design.

SHEET: one wide image holding four views of the SAME character in a single
row, evenly spaced, every view exactly the same height and standing on one
shared baseline: front view, then left side view, then back view, then right
side view. Orthographic — each view is straight on, flat, with no perspective
and no foreshortening, as a modeller's turnaround sheet.

POSE, identical in all four views: standing upright in a relaxed A-pose, feet
flat on the ground about a shoulder width apart, arms hanging down and out from
the body at roughly forty degrees so a clear gap of background shows between
each arm and the torso, hands open and relaxed, head level.

BUILD: a small sturdy workman, three heads tall, with a big round head and a
SLIM body. The shoulders span about one and a third head widths, the chest and
waist are narrow, the arms and legs are slim rounded tubes. The legs are short —
the hip sits about an eighth of the total height above the ground — and end in
blunt rounded boots with a clear gap of background between the feet. Trim
rather than chunky: at its widest point, arms aside, the body is barely wider
than the head.

HAIR, the signature feature: a heavy crop of vivid blue hair sitting on the
skull. It is built from eight to ten separate thick locks with deep cut grooves
between them, each groove about as deep as a lock is thick, so the mass reads as
distinct locks rather than one smooth helmet. It rises about two thirds of a
head height above the crown and sweeps upward and slightly back. At the sides it
comes down over the temples and ends level with the jaw; at the back it ends at
the nape of the neck. The forehead stays clear above the eyebrows. The hair
hugs the head — nothing hangs onto the shoulders or down the back.

FACE: two large round eyes with big dark pupils and one bright catchlight each,
set WIDE APART — the gap between them is about a quarter of the head width, so
they stay two separate shapes when the picture is made very small. A small round
button nose, round full cheeks, and a small closed friendly smile. Two short
eyebrows in the hair colour sit on the forehead above the eyes. Every feature is
painted flat and clean, large and simple.

OUTFIT: a green work tunic with a high collar and long sleeves finished with a
turned-back cuff at each wrist, a narrow darker belt at the waist, darker green
work trousers, and blunt rounded boots in the same darker green. Simple rounded
mitten hands with no separate fingers, one solid shape each, in the skin
colour. The clothing is plain and well worn, with no pattern and no lettering.

COLOUR, these exact values, laid down as clean flat areas with only soft
shading: hair #3c5cd4, with #24399a in the grooves between the locks and a
lighter #6a86e8 catching the light along the top edge of each lock; face and
hands #eca46c; tunic #649434; belt, trousers and boots #444c2c; eye whites
#e4e4e4 with near-black pupils. Blue appears only in the hair. Green appears
only in the clothing.

RENDER: flat even light from the front so every surface keeps its own colour,
with just enough soft shading to show the roundness of each form. No cast
shadow, no ground plane, no reflections. Plain empty background, fully
transparent, identical in all four views. The whole figure fits inside every
view with a small even margin all round.

LEGIBILITY: the design must stay readable at thirteen pixels tall — one blue
mass on top, a light face with two clearly separate dark eyes, a green body,
two separated legs. Every shape big, every boundary clean.

Wide image, 1536 x 1024.
```

### 2.1 Warum dieser Prompt keine Ausschlussliste hat

Beim Ankerbild der ersten Figur (`docs/grafik-ankerbild-a0.md` §2.1) wurden vier
Anläufe vom Filter abgewiesen. Der Auslöser war nachweislich die
**Ausschlussliste** — vor allem jede Erwähnung von Bedeckung und Körper, auch
verneinend. Die einzige Fassung, die durchkam, hatte gar keine.

> **Nur beschreiben, was auf dem Bild sein soll.** Was nicht darauf soll, bleibt
> unerwähnt. Eine Ausschlussliste beschreibt dem Filter genau das, was man nicht
> will.

Der Prompt oben hält sich daran, wo es zählt: Kleidung und Körper stehen
ausschliesslich positiv. Die wenigen Verneinungen betreffen nur die Darstellung
(kein Schlagschatten, kein Muster, keine Schrift) — diese Sorte war in allen
durchgegangenen Fassungen unschädlich.

### 2.2 Wenn das Blatt nicht zusammenpasst

Vier Ansichten in einem Bild sind der Regelfall, aber Bildmodelle halten die
Figur nicht immer über alle vier konstant. Zwei Rückfallwege, in dieser
Reihenfolge:

1. **Zwei Ansichten statt vier.** Vorn und Seite reichen Tripo. Im SHEET-Absatz
   „four views … front view, then left side view, then back view, then right
   side view" ersetzen durch „two views … front view, then left side view".
2. **Nachgenerieren statt neu würfeln.** Die gelungene Vorderansicht als
   Referenzbild in die Bildbearbeitung geben und nur die fehlende Ansicht
   erzeugen lassen („the same character, seen from the left side, same height,
   same colours, same pose").

Abnahmekriterium für das Blatt, ehe es zu Tripo geht: gleiche Höhe, gleiche
Farben, gleiche Haarmenge in allen Ansichten.

---

## §3 Was Tripo damit tun soll

| Schritt | Einstellung | Warum |
|---|---|---|
| Eingabe | **Multiview** (front / left / back / right), je Ansicht eine eigene Datei | Der Hinterkopf entscheidet über die Haarkante, und dort sitzen die Strähnenwurzeln. Aus einer einzigen Ansicht rät das Modell ihn. |
| Modell | jeweils neueste Fassung | — |
| Textur | **an**, Basisfarbe genügt, 512 oder 1024 px | Die Backkette liest ausschliesslich `baseColorTexture`. |
| PBR | aus oder egal | Metall- und Rauheitskarten werden nicht gelesen. |
| Netzdichte | mittel, rund **5000 Dreiecke** | Das alte Modell hat 4964. Weniger frisst die Haarrillen, mehr bringt bei 13 Pixeln nichts. |
| Rigging | **Auto-Rigging, humanoid** | Ohne Rig ist die Figur unbrauchbar — siehe §4. |
| Animation | **keine** | Alle Bewegung entsteht beim Backen aus den Posendateien. |
| Ausgabe | **GLB**, Textur eingebettet | Die Skripte lesen genau das. |

Die Datei kommt nach `art-src/wuselwerker/wuselwerker-rig.glb`.

---

## §4 Die harten Bedingungen der Backkette

Was hier verletzt wird, bricht den Bau — nicht das Aussehen.

| # | Bedingung | Erzwungen durch | Bei Verstoss |
|---|---|---|---|
| 1 | **Ein einziges gehäutetes Netz.** Kein getrenntes Haar-, Augen- oder Kleidungsnetz. | `bake-figur.mjs` und `haar-bauen.mjs` nehmen das **erste** `isSkinnedMesh` und ignorieren alles weitere | Die Figur wird halb gebacken |
| 2 | **Tripo-Knochennamen.** Gebraucht werden namentlich: `Spine01`, `Spine02`, `NeckTwist01`, `NeckTwist02`, `Head`, `L_/R_Upperarm`, `L_/R_Forearm`, `L_/R_Hand`, `L_/R_Thigh`, `L_/R_Calf`, `L_/R_Foot` | dreizehn Posendateien in `art-src/wuselwerker/posen/` sowie der Werkzeugansatz | Jede Pose, deren Knochen fehlt, bleibt in der Ruhelage stehen |
| 3 | **Knochen `Head` muss existieren** | `haar-bauen.mjs` wirft „Knochen Head fehlt" | Abbruch |
| 4 | **Mindestens 300 Ecken werden als Haar erkannt**, geprüft über die Textur: `b > r+24` **und** `b > g+16` | `haar-bauen.mjs` wirft „Zu wenig Haarecken erkannt" | Abbruch |
| 5 | **Haut wird erkannt** über `r > 118`, `r >= g`, `r > b` | dieselbe Einstufung | Kopfmass und Augenlinie fallen aus |
| 6 | **Dunkle Augen im Gesicht**, Texturprobe `r<80`, `g<80`, `b<100`, und zwar in einem Fenster von \|x\| < 0,26, y zwischen 0,48 und 0,80, vorne am Kopf | die Augenmessung in `haar-bauen.mjs` | Die Augenlinie wird 0, das Stutzen der Kappe verrechnet sich |
| 7 | **Genau eine Basisfarbtextur am Werkstoff.** Keine Ecken-Farben, keine reine Materialfarbe | die Einstufung liest `netz.material.map` | Abbruch |
| 8 | **Höhe rund 1,0 Modelleinheit, Y nach oben, Gesicht nach +z, Sohle bei y = 0** | die Fensterschranken in Bedingung 6 sind absolut | Die Augen werden nicht gefunden |
| 9 | **Keine Animationsspuren** | — | Sie werden ignoriert, schaden also nicht, blähen aber die Datei |

Bedingung 2 ist die gefährlichste, weil sie **stumm** scheitert: Ein anderes
Skelett (etwa Mixamo mit `mixamorig:LeftArm`) lädt anstandslos, und die Figur
steht danach in allen dreizehn Posen in derselben Haltung da.

### 4.1 Was das Blatt zusätzlich braucht, damit es gut aussieht

| Bedingung | Warum |
|---|---|
| **Blau nur im Haar** | Alles Blaue wird als Haar eingestuft — auch ein blauer Gürtel. Er würde mitgestutzt und mit dem Schwungknochen mitschwingen. |
| **Tiefe Rillen zwischen den Locken** | Das Spreizen (`schaerfe 2,4`, `kegel 12 Grad`) verstärkt vorhandenes Relief. Es kann keines erfinden. Am alten Modell war gemessen: Lappen ja, **Amplitude nein** — und bei 52 Gerätepunkten verschmolzen sie zu einer blauen Wolke. |
| **Haar hört am Kiefer auf** | Was tiefer hängt, wird ohnehin weggestutzt; es kostet nur Dreiecke. |
| **Stirn frei** | Sonst sitzen die Strähnenwurzeln auf dem Pony, und die gezeichneten Strähnen fallen quer über Auge und Mund. |
| **Augen weit auseinander** | Bei 13 Pixeln Figurenhöhe misst der Kopf 3,4 logische Pixel. Zwei Augen, die enger als ein Viertel der Kopfbreite stehen, verschmelzen zu einem Fleck. |

---

## §5 Die Palette

Gemessen an der Basisfarbtextur des alten Modells (512×512 JPEG, aus dem GLB
gezogen), jeweils der häufigste Ton der Fläche:

| Fläche | Farbe | L\* |
|---|---|---|
| Haar | `#3c5cd4` | 43,3 |
| Haut (Gesicht, Hände) | `#eca46c` | 73,2 |
| Tunika | `#649434` | 56,2 |
| Gürtel, Hose, Stiefel | `#444c2c` | 30,8 |
| Augapfel | `#e4e4e4` | — |

Zwei Töne im Prompt sind **neu und abgeleitet**, weil das alte Modell keine
ausgeprägten Locken hatte und deshalb weder Rille noch Glanz führte:
`#24399a` als Rillenton (dunkler als das Haar, gleicher Farbton) und `#6a86e8`
als Glanz (heller, gleicher Farbton).

**Die Farbkombination ist Kanon.** Blaues Haar, grüne Tunika. Grünes Haar mit
blauer Tunika ist ausgeschlossen — nicht als Geschmack, sondern weil die
gesamte Einstufung der Backkette (§4, Bedingung 4 und 5) an „blau ist Haar"
hängt und weil sieben Weltpaletten gegen diese Figur geprüft sind.

Im Spiel liest sich das Haar dunkler als die Textur, nämlich `#3851b6` — das ist
die Beleuchtung beim Backen. Der Renderer zeichnet die Strähnen in genau diesem
Ton (`src/render/haar.ts`). Ändert sich der Haarton, muss er dort nachgeführt
werden.

---

## §6 Die Masse, die es zu treffen gilt

Gelenkhöhen des alten Rigs, aus dem GLB gerechnet, bei einer Gesamthöhe von
0,998 Modelleinheiten:

| Marke | Höhe | Anteil |
|---|---|---|
| Sohle | 0,000 | 0 % |
| Hüfte | 0,120 | **12 %** |
| Taille / Spine01 | 0,178 | 18 % |
| Brust / Spine02 | 0,293 | 29 % |
| Schulter, Hals | 0,394 | 39 % |
| Kopfgelenk (Kiefer) | 0,448 | **45 %** |
| Hand | 0,249 | 25 % |
| Augenoberkante | 0,722 | **72 %** |
| Scheitel der Haut (Stirn) | 0,781 | 78 % |
| höchster Punkt (Haar) | 0,998 | 100 % |

Daraus die Merksätze für den Zeichner: **drei Köpfe hoch** (Kiefer bis
Schädeldecke misst 0,33), das Haar steht **zwei Drittel eines Kopfes** über der
Schädeldecke, die Augen sitzen auf **72 Prozent** der Figurenhöhe, und die Beine
messen **ein Achtel** der Figur.

Weitere Masse des alten Modells zum Vergleich: Hüllbox 0,904 × 0,998 × 0,689,
3240 Ecken, 4964 Dreiecke, 41 Gelenke, 1 Netz, 1 Werkstoff, keine Animation.
Kopfbreite über den Augen: 0,303.

---

## §7 Abnahme — was gemessen wird, sobald das GLB da ist

In dieser Reihenfolge. Jeder Schritt hat ein Abbruchkriterium.

1. **`node scripts/modell-pruefen.mjs <datei.glb>`** — Knochenliste, Zahl der
   Netze, Werkstoffe, Animationen, Hüllbox, dazu vier Kontrollbilder. Prüft §4
   Bedingung 1, 2, 3, 7, 8, 9.
2. **`node scripts/haar-bauen.mjs <datei.glb> art-src/wuselwerker/wuselwerker-haar.glb`**
   — meldet Einstufung (Haar/Haut/Dunkel), Augenoberkante, Kopfhalbbreite und
   was das Stutzen bewegt hat. Prüft §4 Bedingung 4, 5, 6.
3. **`node scripts/bake-figur.mjs wuselwerker`** — Blatt und Manifest. Warnt bei
   Bildern, die den Zellrand berühren.
4. **`python3 art-src/figur-umbau/koerper/silhouette.py`** — Breite durch Höhe
   bei echter Spielgrösse. Zielband **0,45 bis 0,55**. Liegt sie darüber, wird
   `schmal`/`tief` in `figur.json` nachgezogen; liegt sie darunter, hoch.
5. **`python3 art-src/figur-umbau/koerper/haaranteil.py`** — Anteil des Haares
   an Höhe und Fläche. Ziel: rund **34 % der Höhe**, nicht 58 wie am alten
   Modell vor dem Stutzen.
6. **`python3 art-src/figur-umbau/posen/umrisswechsel.py`** — Bewegung je
   Bildpaar. Der heutige Mittelwert ist 20,4 %; deutlich darunter heisst, dass
   die neuen Proportionen die Posen schlucken.
7. **`node art-src/figur-umbau/galerie.mjs <ziel.png>`** — Musterkarte aller
   dreizehn Posen aus dem laufenden Spiel, vor Himmel und vor Erde, dazu die
   Zahl, wieviel Fläche die gezeichneten Strähnen neben den Umriss legen
   (heute 7,7 %).
8. **`npx vitest run`** — 476 Prüfungen. `tests/atlas.test.ts`,
   `tests/haar.test.ts` und `tests/posen.test.ts` halten den Vertrag des
   Blattes fest.

---

## §8 Was sich danach im Projekt ändert

- **`art-src/wuselwerker/figur.json`**: Kommt die Figur schon schlank, gehen
  `schmal` und `tief` von 0,64 zurück Richtung 1,0 — der genaue Wert fällt in
  Abnahmeschritt 4. `kopfSkala` 0,82 vermutlich ebenso zurück auf 1,0, wenn der
  Kopf schon passt.
- **`scripts/haar-bauen.mjs`**: Die Stutzellipse (`stutzSeite` 2,1,
  `stutzHoch` 1,35, `stutzTief` 2,1) ist in Kopfhalbbreiten gerechnet und
  passt sich damit von selbst an. Endet das Haar schon am Kiefer, greift sie
  kaum noch — das ist der Erfolgsfall, nicht der Fehlerfall.
- **`src/render/haar.ts`**: Der Haarton `#3851b6` muss zum neuen Blatt passen.
- **Avatarblatt, App-Icon und die Berufsknöpfe** zeigen noch die alte Figur.
  Sie stammen aus vorgerenderter Grafik und müssen nach dem Neubau neu gebacken
  werden.

### 8.1 Variante: längere Beine

Gemessen und begründet, aber eine eigene Messrunde wert — deshalb nicht im
Hauptprompt.

Die Beine messen heute 0,111 Modelleinheiten. Ein Beinausschlag von dreissig
Grad bewegt damit einen halben logischen Pixel; das ist unter der Auflösung, in
der das Spiel die Figur zeigt. **Der Gang hängt deshalb ganz am Armschwung und
am Hub, nicht am Schritt** (`docs/wuselwerker.md`).

Wer das ändern will, ersetzt im BUILD-Absatz „the hip sits about an eighth of
the total height above the ground" durch „the hip sits about a fifth of the
total height above the ground" und nimmt die Höhe beim Haar zurück: „it rises
about a third of a head height above the crown". Die Figur wird dadurch weniger
Kleinkind und mehr Kobold, und die dreizehn Posen brauchen einen neuen
Durchgang durch `umrisswechsel.py`.
