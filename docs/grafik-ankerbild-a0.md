# Ankerfigur A0 — Wuselwerker V4

**Status: verbindlich.** Diese Datei legt die Figur fest, auf die sich alle weiteren
Grafiken beziehen. Wo sie dem `grafik-katalog.md` widerspricht, gilt sie — die Stellen sind
in §5 einzeln aufgeführt.

---

## §1 Was der Anker ist

Der Anker besteht aus zwei Dateien, die dasselbe Wesen zeigen.

| | Datei | Rolle |
|---|---|---|
| **A0** | die durchgegangene GPT-Image-Erzeugung | Ursprung, Farbreferenz, Stimmung |
| **A0-3D** | `art-src/wuselwerker-v4.glb` | **Massreferenz und Quelle aller Sprites** |

Die 2D-Erzeugung ist der Ursprung, aber nicht mehr die Messlatte: Bild-zu-3D hat aus der
gemalten Mähne ein Volumen gemacht, und die beiden sind messbar verschieden (§4). Für alles,
was Geometrie ist — Zellmass, Silhouette, Überstand —, gilt **das Modell**.

**Die Figur in einem Satz:** ein gutmütiger Troll, kurz und stämmig, mit einem Kopf von
knapp halber Körperhöhe, weit auseinanderstehenden Augen, breitem geschlossenem Grinsen,
türkisem einteiligem Overall mit Rollkragen, Bundstreifen, umgeschlagenen Ärmelaufschlägen
und dunkleren Stiefeln — und einem riesigen, aufrecht stehenden roten Haarschopf, der höher
ist als der Kopf selbst.

### 1.1 Was im Modell steckt

Ausgelesen mit `node scripts/measure-model.mjs`:

| | |
|---|---|
| Erzeuger | Tripo |
| Netz | 1 Mesh, 4848 Dreiecke, 3620 Punkte |
| davon Haar | 2947 Dreiecke — **mehr als die halbe Figur** |
| Material | 1, mit einer Basisfarbtextur (JPEG) |
| Skelett | 1 Skin, **41 Gelenke**, benannt wie ein Standard-Humanoid (`Pelvis`, `Spine01/02`, `L_/R_Clavicle`, `Upperarm`, `Forearm`, `Hand`, `Thigh`, `Calf`, `Foot`, `ToeBase`, `Head`) |
| Animationen | **keine** (`animations: 0`) |
| Rohmass | 0,814 × 0,998 × 0,502 |

**Geriggt heisst hier: Skelett ja, Bewegung nein.** Die Datei enthält die Bindepose mit
einem vollständigen, sauber benannten Skelett, aber keinen einzigen Bewegungsablauf. Was das
für die Sprite-Erzeugung bedeutet, steht in §6.

### 1.2 Ansichten

`npm run modell:messen` rendert vier orthografische Ansichten nach `art-src/ansichten/`,
jeweils dreifach: ganz, nur Körper, nur Haar. Sie sind nicht eingecheckt — sie entstehen in
einer halben Minute neu und wären sonst 1,3 MB totes Gewicht im Verlauf.

---

## §2 Der Prompt, der durchging

Wörtlich, ohne Auslassung. Wer die Figur neu erzeugen muss, nimmt genau diesen Text.

```
A cheerful cartoon workman creature in a teal overall, mascot for a puzzle
game about tiny workers who dig through earth and rescue each other.
Completely original character design.

STYLE: hand-painted character illustration with real volume — soft rounded
forms with clear light and shade on every surface, a rich painterly finish
with visible brush texture, soft edges and an outline that varies in weight
and fades where the light hits. Painted like a children's book illustration.

OUTFIT: a teal one-piece work overall #2fc9b8 with a high rolled collar, long
sleeves finished with turned-back cuffs at the wrists, a narrow darker
waistband at the middle, a small seam running down each leg, and blunt
rounded boots in darker teal #1d8f85 with a turned-over top edge. Simple
mitten hands with no separate fingers. The overall is slightly baggy and well
worn, like proper work clothing.

CHARACTER: a good-natured troll. A big round head with full rounded cheeks,
taking up almost half the figure's height, slightly taller than it is wide,
with a soft rounded chin. Sand-coloured face and hands #f4d7ac. Small rounded
ears low on the head and a small round button nose.

FACE: two large round dark eyes, each with a single bright catchlight, set low
on the face and WIDE APART — the gap between them is about a quarter of the
head width, so they stay two separate shapes even when the picture is made
very small. Eyes glancing off to one side. One eyebrow raised higher than the
other. A broad closed-mouth grin pushed up into the cheeks, mischievous and
pleased with itself.

HAIR, the signature feature and clearly hair rather than anything else: an
enormous shock of vivid red hair standing straight up from the whole scalp and
fanning out, taller than the head itself, built from many overlapping pointed
tufts of clearly different lengths that cross one another and give a ragged
wind-blown edge. It is far too much hair for such a creature, and that excess
is the point. It rises about one and a quarter head heights above the crown,
spreads up to about two head widths at its widest, sits symmetrically on both
sides of the head, leaves the forehead clear and stops above the shoulders.
Colour: warm red #e5372c, deep #8f1d1c in the gaps between the tufts, and one
continuous bright #ff8a75 highlight running as an unbroken band along the
whole upper edge of the shock.

BUILD: short and stocky, bottom-heavy and rounded, with short thick arms held
out from the body so a gap of empty background shows on each side, and short
legs planted wide apart in a sturdy stance with a clear gap of background
between them.

POSE: standing, three-quarter front-right view, weight on one leg, head
tilted, mid-motion as if it just stopped walking and turned to look.

LIGHT: warm key from above front-left, soft cool bounce from below, one narrow
bright rim along the top of the hair. Enough shading to read the volume of
every form clearly, with clean open shadows and no cast shadow on the ground.

LEGIBILITY: the design must stay recognisable when reduced to twelve pixels
tall — one big head with two clearly separate eyes, a tall red mass above it,
a rounded body and two separated legs, with every shape big and simple.

Single figure, centred, fully transparent background, square 1:1, 1024 x 1024.
```

### 2.1 Warum dieser Prompt keine Ausschlussliste hat

Vier Anläufe davor wurden vom Filter abgewiesen. Der Auslöser war mit hoher
Wahrscheinlichkeit die **Ausschlussliste selbst** — nicht das, was beschrieben wurde:

| Versuch | Ausschlussliste | Ergebnis |
|---|---|---|
| 1 | u. a. „a human child", „a nude figure", „bare skin", „a loincloth" | abgewiesen |
| 2 | ohne diese Begriffe, aber weiter mit „blue robe, hood" | abgewiesen |
| 3 | Bedeckung positiv umformuliert („sand colour only on face and hands, everything else covered") | abgewiesen |
| 4 | wieder mit „blue robe, hood" | abgewiesen |
| **5** | **keine Ausschlussliste, alle Abgrenzungen positiv formuliert** | **durchgegangen** |

`blue robe, hood` steckt in drei der vier Ablehnungen und fehlt in der einzigen Fassung, die
durchkam. Auch das Ansprechen von Bedeckung — selbst verneinend, selbst „safe" gemeint —
schlug fehl. Die Lehre, die für jeden weiteren Prompt dieses Projekts gilt:

> **Nur beschreiben, was auf dem Bild sein soll.** Was nicht darauf soll, bleibt unerwähnt.
> Eine Ausschlussliste beschreibt dem Filter genau das, was man nicht will.

Die Abgrenzung, für die die Liste einmal gedacht war, erledigt die Figur inzwischen selbst:
Ein rothaariger Troll im türkisen Overall ist von nichts Geschütztem mehr in Reichweite.

---

## §3 Palette

Aus dem Prompt und der Modelltextur, beides deckungsgleich.

| Fläche | Farbe |
|---|---|
| Haar Grundton | `#9d4edd` |
| Haar Tiefe (zwischen den Strähnen) | `#67219c` |
| Haar Glanzband (obere Kante) | `#c98bff` |
| Haut (Gesicht, Hände) | `#f4d7ac` |
| Overall | `#2fc9b8` |
| Stiefel, Bund, Kragen | `#1d8f85` |
| Umriss | `#0c1119` |

**Das Haar ist violett, das Ankerbild zeigt es rot.** Die Begründung steht in
`grafik-katalog.md` §3.1 und in §7.5 hier; die Werte oben sind die geltenden. Wer die Figur
mit dem Prompt aus §2 neu erzeugt, bekommt rotes Haar und muss die drei Farbwerte im
HAIR-Block ersetzen.

**Ehrlich zum Glanzband:** Es ist mit L\* 68 der hellste Ton der Figur nach der Haut und
damit die Zeile, die die Mähne über brauner Erde trägt. Weiter aufhellen darf man es nicht —
dann nähert es sich der Haut `#f4d7ac` und die Trennung zwischen Haar und Gesicht geht
verloren.

---

## §4 Die Vermessung und das daraus folgende Zellmass

### 4.1 Warum überhaupt gemessen wird

Das gemalte Bild und das daraus erzeugte Modell sind nicht dasselbe. Die gemalte Mähne weht
etwa eine Körperhöhe nach hinten; das Modell hat daraus eine kompaktere, nach oben
strebende Masse gemacht. Welche der beiden Zahlen das Zellmass bestimmt, darf nicht
geschätzt werden — zu klein schneidet Haar ab, zu gross schleppt jedes der 60 Sprite-Bilder
leere Ränder mit.

### 4.2 Wie gemessen wird

`scripts/measure-model.mjs` lädt das Modell in einen Browser und misst **am Bild**, nicht an
der Geometrie. Zwei Kniffe machen das belastbar:

1. **Haar und Körper werden vorher getrennt**, und zwar in der *Textur*, nicht im Render.
   Im beleuchteten Bild ist der Glanz auf den Haarspitzen von Haut nicht zu unterscheiden —
   in der unbeleuchteten Textur schon. Jedes Dreieck wird einmal an seinem Schwerpunkt
   abgetastet und einsortiert; danach lassen sich beide Teile getrennt rendern.
   (Fallstrick, der hier zuschlug: glTF zählt die Texturkoordinate V **von oben**. Wer
   `1 − v` rechnet, tastet die falsche Zeile ab und bekommt eine Figur ohne Gesicht.)
2. **Der Massstab kommt vom Körper ohne Haar** — Sohle bis Scheitel, umgerechnet auf
   `WUSEL_H = 12`.

Eine bekannte Ungenauigkeit: Der Hinterkopf ist im Modell vollständig Haargeometrie, die
oberste Körperzeile ist also die Stirn und nicht der echte Scheitel. Die Bezugsstrecke fällt
dadurch etwas zu kurz aus, der Massstab etwas zu gross, der ermittelte Überstand etwas zu
gross. Das ist die unschädliche Richtung.

### 4.3 Das Ergebnis

Auf Figurenhöhe 12 umgerechnet, grösster Wert aus vier Ansichten:

| | logische Pixel |
|---|---|
| Haar über dem Scheitel | 5,4 |
| Haar neben der Körpermitte | 7,5 |
| Haar reicht herab bis unter den Scheitel | 5,3 |
| Kopfbreite von vorn | 10,6 |

Daraus die Zelle, mit ausdrücklicher Zugabe für Bewegung, die eine Ruhepose nicht zeigen
kann:

| | Rechnung | Ergebnis |
|---|---|---|
| Zeilen über dem Fusspunkt | 12 Körper + 8 Haar (im Fall steht es senkrecht, rund die Hälfte höher) + 1 Umriss + 1 Reserve | **22** |
| Spalten je Seite | 11 Haar (im Lauf weht es rund die Hälfte weiter) + 1 Umriss + 2 Reserve | **14** |
| Zeilen unter dem Fusspunkt | Staub, Squash | **6** |

> ### Verbindlich: Zelle **28 × 28**, Fusspunkt **(14, 22)**
>
> Das löst das alte Mass 24 × 24 mit Fusspunkt (12, 20) ab. Der Anker bleibt auf halber
> Zellbreite — sonst verliert die Spiegelung im Renderer ihre Versatzfreiheit.
> Blattgrösse damit **224 × 336** für 8 Spalten und 12 Zeilen.

`npm run modell:messen` prüft diese Zelle bei jedem Lauf gegen das Modell und bricht ab,
wenn ein künftiges Modell nicht mehr hineinpasst. Die Zahlen im Code stehen also nicht nur
im Kommentar, sie werden nachgehalten.

---

## §5 Was das an den bestehenden Dateien ändert

| Stelle | alt | neu |
|---|---|---|
| `grafik-integration.md` §2.1, `grafik-katalog.md` §0/§1.2 | Zelle 24 × 24, Fusspunkt (12, 20) | **28 × 28, (14, 22)** |
| `grafik-katalog.md` §2.1 | „Haar über dem Scheitel +2 bis +3" | **bis 8**, und die Masse liegt ebenso weit *hinter* dem Kopf |
| `grafik-katalog.md` §2.1 | „Der Kopf wird nicht breiter als der Rumpf" | Der Kopf **ist** breiter. Die Bedingung ist eine **gerade** Breite, nicht eine kleine |
| `grafik-katalog.md` §3.1 | Haar Beerenrosa `#ff70b8` | **Violett `#9d4edd`** (über Rot `#e5372c`, siehe §7.5) |
| `grafik-katalog.md` §6.1 | A0-Prompt mit rosa Haarschopf | der Prompt aus §2 hier |
| überall | Figur „Wusel", kahl bzw. mit Schopf | **Troll mit Mähne** |
| überall | Hochformat | **Querformat** (das Spiel läuft in beiden, gestaltet wird für quer) |

Alles andere aus `grafik-integration.md` bleibt unverändert bindend: Bildzahlen,
Haltedauern, Andockpunkte, Atlasformat, Auslieferung in 1×.

---

## §6 Offene Punkte, benannt statt übergangen

1. ~~Ohne Animationen keine Sprite-Bilder aus dem Modell.~~ **Erledigt: Die Posen stehen
   im Repo.** Das Skelett ist da und standardbenannt, Bewegungsabläufe waren es nicht — die
   Bewegung entsteht deshalb als Zahlen unter `art-src/posen/`, je Zustand eine Datei, und
   `npm run atlas:backen` macht daraus das Blatt. Der Weg ist in §7 beschrieben.
2. **Das prozedurale Rückfallbild ist ein Platzhalter, keine Umsetzung von A0.** Es hat
   die Mähne, die Farben und die Kopflastigkeit; es hat keine Arme, kein Gesicht ausser
   einem Auge und keine Trolldetails. Es soll die Figur wiedererkennbar machen, solange
   noch kein gemaltes Blatt da ist — mehr nicht.
3. **Kopfanteil noch nicht nachgezogen.** `grafik-katalog.md` §2.1 verlangt Kopf 5 Zeilen /
   Rumpf 5; im Prototyp stehen 4 / 6. Die Änderung verschiebt alle Berufsmerkmale um eine
   Zeile und ist deshalb bewusst nicht nebenbei mitgemacht worden.
4. **Die 2D-Erzeugung liegt nicht im Repo.** Nur das Modell und die daraus gerechneten
   Ansichten. Wer das Ursprungsbild ablegen will: `art-src/wuselwerker-v4.png`.

---

## §7 Vom Modell zum Sprite-Blatt

```bash
npm run atlas:backen          # alle 60 Bilder → src/art/wusel.png
node scripts/bake-atlas.mjs --clip walking    # nur ein Zustand, plus Kontrollbild in 10×
```

### 7.1 Der Weg

Modell laden → in jede Pose aus `art-src/posen/` stellen → Anbauteile setzen →
orthografisch rendern → auf Zellgrösse verkleinern → auf die Palette einrasten → Umriss
ziehen → alle Bilder zum Blatt setzen.

### 7.2 Die vier Entscheidungen, die das Ergebnis tragen

**Die Winkel gelten in Weltachsen, nicht in Knochenachsen.** Ein Rig benennt seine lokalen
Achsen beliebig; `rotation.x` bedeutet an der Schulter etwas anderes als an der Hüfte. Der
Backweg rechnet jede angegebene Drehung um: `q' = Rp⁻¹ · Q · Rp · qBind`, wobei `Rp` die
Weltdrehung des Elternknochens ist — deshalb muss von der Wurzel zu den Spitzen gearbeitet
werden. Damit heisst „−34 um X" am Oberschenkel dasselbe wie am Oberarm: nach vorn.

**Der Massstab kommt aus dem Modell.** Sohle bis Scheitel ohne Haar ist im Spiel
`WUSEL_H = 12`. Der Backweg misst diese Strecke an der Geometrie und stellt die Kamera
danach. Ein anderes Modell braucht deshalb keine Handarbeit.

**Verkleinert wird mit Mehrheitsentscheid, nicht mit Mittelwert.** Bei 9 × 9 Bildpunkten je
Zelle erzeugt ein Mittelwert Zwischentöne, die es in der Palette nicht gibt; die Mehrheit
erhält Flächen und harte Kanten. Anbauteile zählen dabei doppelt — ein Werkzeug ist dünn und
würde sonst gegen den Körper dahinter verlieren, obwohl gerade es den Beruf lesbar macht.

**Haar wird anders verkleinert als der Rest — sonst wird daraus eine Mütze.** Das war der
erste sichtbare Fehler des Backwegs, und er lohnt die Erklärung. Eine halb gedeckte Randzelle
bedeutet an den beiden Orten Verschiedenes: Am Rumpf ist sie Teil einer glatten Kante und
gehört dazu. Am Rand der Mähne ist sie entweder der Zwischenraum zwischen zwei Strähnen
oder die Spitze einer einzelnen. Behandelt man beides gleich, werden die Lücken gefüllt und
die Spitzen gekappt — übrig bleibt ein glatter roter Klotz, und die Figur sieht aus, als
trüge sie eine Mütze.

Deshalb gelten fürs Haar zwei Regeln statt einer:

| | |
|---|---|
| **Kern** | ab drei Vierteln Deckung steht die Fläche |
| **Zacke** | darunter nur, wenn die Zelle mehr Haar trägt als ihre Nachbarschaft im Mittel |

Die zweite Regel ist der Kniff: Eine herausstehende Strähne liegt über dem Mittel ihrer
Umgebung und bleibt, ein Zwischenraum liegt darunter und fällt heraus. Die Zacken folgen
damit der Geometrie des Modells und sind nicht aufgestreutes Rauschen — dieselbe Pose
ergibt immer dieselben Zacken.

Dazu kommt das Licht: wenig Grundhelligkeit, dafür ein deutliches Licht senkrecht von oben.
Flaches Licht gäbe allen Strähnen und allen Zwischenräumen denselben Ton, und nach dem
Einrasten auf drei Stufen bliebe wieder eine Fläche übrig. Erst der Helligkeitsunterschied
zwischen Strähnenrücken und Furche macht daraus Haar. Aus demselben Grund ist das Farbband
ums Haar enger gefasst als bei Haut und Anzug: `[1,07 · 0,83]` statt `[1,22 · 0,70]`.

**Die Kamera steht 30 Grad aus dem Profil.** Das ist eine Abkehr vom alten Kanon
(„strict orthographic side view") und hat einen gemessenen Grund: Im strengen Profil ist der
Hinterkopf dieser Figur vollständig Haar, das sichtbare Gesicht zwei Pixel breit und der
Rumpf ebenfalls zwei. Übrig bliebe eine rote Masse auf einem türkisen Strich. Leicht gedreht
zeigt die Figur Gesicht und Rumpfbreite. Die Laufrichtung bleibt eindeutig, und die
Spiegelung im Renderer ergibt sauber die andere Dreiviertelansicht.

### 7.3 Die Zotteln

Das Haar des Modells hängt am Kopfgelenk und ist damit starr: Es kippt mit dem Kopf, aber es
schwingt nicht. Bei 12 Pixeln ist genau dieses Nachschwingen das Erkennungszeichen der
Figur — eine Masse, die sich nie bewegt, liest als Mütze, egal wie zackig ihr Rand ist.

Deshalb bekommt jede Figur im Backweg einen festen Satz von fünf Strähnen, angehängt an das
Kopfgelenk und als vierseitige Spitzen gebaut. Sie gehören zur **Art**, nicht zur Pose, und
stehen deshalb im Backweg und nicht in den Posendateien.

Drei Zahlen, ohne die sie nicht funktionieren:

- **Das Kopfgelenk sitzt 6,1 logische Pixel über der Sohle, die Mähne reicht bis gut 11
  darüber hinaus.** Eine Strähne muss also länger als 11 sein, sonst steckt sie in der Masse
  und man sieht nichts von ihr. Der erste Versuch mit 4 Pixeln war unsichtbar, der zweite
  mit 9,5 sah aus wie Flammen; 7 bis 8 sitzt.
- **Jede Strähne hat ihre eigene Phase.** Ohne sie schlagen alle im Gleichtakt aus, und das
  sieht aus wie ein Kamm, nicht wie Haar.
- **Nur eine Strähne trägt den Glanzton.** Zwei helle Spitzen lesen als eigene Gegenstände
  neben dem Kopf, nicht als Teil der Mähne.

Wie stark geschwungen wird, kann eine Pose über `_haar` (−1 bis 1) bestimmen. Steht dort
nichts, schwingt es sanft über den Zyklus — auch ein stehender Blocker soll nicht erstarrt
wirken.

### 7.4 Die Regel, die beim Graben herauskam

**Der Rumpf beugt sich nur wenig — die Bewegung tragen die Arme.** Der Kopf ist fast die
halbe Figur, und daran hängt die Mähne. Bei 22 Grad Vorbeugung deckt sie den ganzen Körper
zu, und übrig bleibt ein roter Fleck über einem gelben Werkzeug. Bei 9 Grad liest die Figur.
Das ist keine Geschmacksfrage, sondern folgt direkt aus dem Kopfanteil dieser Figur, und
gilt für jede Pose.

### 7.5 Zwei Abweichungen vom Ankerbild, auf Ansage

Beide sind bewusst und stehen hier, damit niemand sie für Fehler hält.

**Die Kleidung ist dreiteilig statt einteilig.** Das Ankerbild zeigt einen
einteiligen türkisen Overall. Bei Spielgrösse ist das eine einfarbige Säule von
der Schulter bis zum Boden — die halbe Figur, und sie erzählt nichts. Getrennt
wird im Backweg, nicht am Modell: Haar und Haut stehen über die Textur fest,
der Stoff dazwischen wird nach **Höhe** aufgeteilt, und die Höhen kommen aus dem
Skelett (`Waist` für die Hüfte, ein Sechstel der Figurenhöhe für den Knöchel) —
nicht aus geratenen Zahlen.

| Teil | Farbe | Grund |
|---|---|---|
| Oberteil | `#2fc9b8` | hält gegen Nachthimmel *und* gegen braune Erde |
| Hose | `#3d5b78` | liegt zwischen beiden Untergründen |
| Schuhe | `#2a2018` | der dunkelste Wert der Figur — er setzt sie auf den Boden |

**Das Haar ist violett statt rot.** Das Ankerbild zeigt eine rote Mähne; die Rechnung dazu
steht in `grafik-katalog.md` §3.1. Der Kern in zwei Sätzen: Braune Erde liegt auf dem
Farbkreis bei rund 30 Grad, rotes Haar stand 24 Grad daneben — fast derselbe Farbton,
getragen allein vom Helligkeitssprung, und das genau dort, wo die Figur die meiste Zeit
läuft. Violett steht 113 Grad entfernt. Nebenbei löst es die engste Paarung der ganzen
Palette: Haar und Gefahrenrot lagen 4 Farbtongrade auseinander, jetzt sind es 275.

**Die Mähne ist ausgedünnt.** Das Modell trägt eine dichte, geschlossene
Haarkugel; bei Spielgrösse liest sie als Fläche, und einzelne Strähnen gehen
darin unter. Die Masse wird deshalb zum Kopf hin geschrumpft — waagerecht auf
74 %, senkrecht auf 86 %, weil die Höhe die Silhouette trägt und die Breite nur
die Dichte. Dafür stehen jetzt zehn statt fünf Zotteln heraus. Was übrig bleibt,
ist dieselbe Menge Haar, aber als einzelne Strähnen statt als Kugel.

### 7.6 Was am Bild gelernt wurde

Zehn Zustände wurden gebaut, gebacken und angesehen — im Schnitt achtmal je
Zustand. Drei Befunde gelten für alle und sind wichtiger als jede einzelne Pose:

**Die Arme tragen kein Pixel.** Mehrfach unabhängig nachgemessen: Die Schulter sitzt 5,4
logische Pixel über der Sohle, die gestreckte Hand reicht bis 8,3 — die Mähne steht bis
14,0. Jeder erhobene Arm endet also im Haar, in *jeder* Pose, bei jedem Winkel. Ein Agent
hat einen ganzen Durchgang darauf verwendet, sechs Armstellungen am selben Körper zu backen:
bis auf eine war keine im Bild vorhanden. Wer bei dieser Figur eine Geste über den Kopf
erzählen will, muss sie als Anbauteil bauen — der echte Arm steht im Modell trotzdem
richtig, für den Tag, an dem die Kamera sich ändert.

**Den Kopf zurückzulegen richtet die Mähne nicht auf, sondern kippt sie um.** Meine Vorgabe
für `falling` lautete „Kopf stark negativ, damit die Mähne senkrecht steht". Das ist falsch:
Die Haarmasse sitzt hinten am Kopf; bei `Head: −70` fällt sie nach hinten-unten über den
Rumpf, die Figur wird drei Zeilen kürzer und zwei breiter. Am höchsten steht der Scheitel
bei `Head: 0`. Die Vorgabe wurde zugunsten der Silhouette gebrochen — richtig so.

**Zwei Beine sind bei dieser Figurengrösse nicht zu trennen.** Vom Becken (2,9 über der
Sohle) bis zum Boden sind es drei Zeilen bei zwei bis drei Pixeln Breite. Jede Spreizung
über etwa 25 Grad verteilt das Bein auf zwei Spalten, von denen keine die Deckungsschwelle
erreicht — es löst sich auf, statt zu wandern. Vier Zustände sind unabhängig auf dieselbe
Grenze gelaufen. Die Beine sind eine Säule; erzählt wird oben.

### 7.7 Zwei Fehler im Backweg, die dabei auffielen

**Markerfarben überlebten den Renderer nicht.** `new THREE.Color(r, g, b)` setzt Werte im
linearen Arbeitsraum, der Ausgang rechnet nach sRGB — aus dem Marker `(0, 128, 255)` wurde
im Bild `(0, 188, 255)`. Reine 0 und 255 überstehen das, alles dazwischen nicht. Der
Blockermarker fiel mit exakt 60 Stufen Abstand knapp aus der Erkennung und wurde als
Anzugstürkis eingerastet: Die orangen Arme verschwanden im eigenen Ärmel. Behoben mit
`setRGB(..., SRGBColorSpace)`, das die Farbe sauber zurückrechnet; die Erkennung darf
seither eng sein.

**Die Zotteln folgten dem Kopf nicht.** Anbauteile übernahmen vom Gelenk nur die *Lage*,
nicht die *Drehung*. Für ein Werkzeug in der Faust ist das brauchbar — man richtet es
ohnehin von Hand aus. Für Haarsträhnen war es falsch: Sie standen bei jeder Pose gleich und
ragten immer rund zehn Pixel über das Kopfgelenk. Ein zusammenbrechender Wusel behielt so
eine kerzengerade Frisur, und `dying` konnte gar nicht flach werden. Anbauteile können jetzt
`folgt` setzen; gerechnet wird mit der Differenz zur Bindepose, damit die Achsen bleiben,
wie sie überall in diesem Weg gelten.

### 7.8 Was der Backweg nicht kann

- **Kein Ausblenden.** Das Blatt kennt nur Pixel. `saving` und `dying` müssen ihre
  Auflösung über Haltung und Versatz erzählen, nicht über Durchsichtigkeit.
- **Keine Verformung.** Squash und Stretch gäbe es nur über Knochen; das Modell hat dafür
  keine.
- **Nur eine Blickrichtung.** Nach links spiegelt der Renderer. Ein Merkmal, das nur auf
  einer Seite sitzt, wechselt dabei die Seite.
