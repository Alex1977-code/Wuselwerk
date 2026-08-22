# Figur-Neubau — Auftrag an GPT Image 2 und Tripo

**Stand: 21.08.2026.** Die Spielfigur wird extern neu erstellt: ein Bild aus
GPT Image 2, daraus ein geriggtes Modell aus Tripo. Diese Datei enthält den
Prompt zum direkten Einsetzen (§2), die Einstellungen für Tripo (§3) und die
Bedingungen, an denen das Ergebnis gemessen wird (§4 bis §7).

Alle Zahlen darin sind **gemessen**, nicht angenommen. Woher sie stammen, steht
jeweils dabei.

---

## §0 Der Anker — welches Bild gilt

**`art-src/wuselwerker/referenz.png`** (Kopie von `probe/wuselwerker12.png`,
1717 × 916, vier Ansichten vorn / links / hinten / rechts).

Das ist ab sofort **die** Figur. Alles, was danach kommt — Modell, Blatt,
Avatar, App-Icon —, richtet sich nach diesem Bild; wo eine ältere Datei
widerspricht, gilt dieses. Es löst die Ankerfigur A0 aus
`docs/grafik-ankerbild-a0.md` ab, die noch den türkisen Overall und das rote
Haar der ersten Figur zeigt.

Durchgemessen mit `python3 art-src/figur-umbau/blattmass.py`:

| | gemessen | Zielband | |
|---|---|---|---|
| Breite durch Höhe, vorn | 0,468 | 0,42–0,58 | ✓ |
| Augenlinie über dem Boden | 73,4 % | 48–80 % (im Code fest verdrahtet) | ✓ |
| Köpfe hoch | 3,00 | rund 3 | ✓ |
| Haut zu Haar am Kopf, bei Spielgröße | 1,82 | ab 1,0 | ✓ |
| Augenabstand | 36 % der Kopfbreite | rund 25 | weiter als bestellt |
| Haar über der Stirn | 0,30 Kopfhöhen | rund ⅓ | ✓ |
| Haar reicht herunter bis | 57,5 % der Figurenhöhe | bis zum Hals | ✓ |

Gemessene Farben (beleuchtete Vorschau, nicht die Textur — die zählt erst am
Modell): Haar `#395dab`, Haut `#ffb763`, Kleidung `#697b2d`.

**Was daraus folgt:** Die Figur kommt schon schlank an. `schmal` und `tief` in
`art-src/wuselwerker/figur.json` gehen deshalb von 0,64 zurück auf 1,0 — die
Textur wird nicht mehr gestaucht. Und weil ihr Haar 2,4 logische Pixel tiefer
endet als das der heutigen Figur, muss `LAENGE` in `src/render/haar.ts` von
7,4 auf rund 6,5 herunter, sonst schleifen die Strähnenspitzen über den Boden.

**Das Modell ist da:** `art-src/wuselwerker/wuselwerker12_3D.glb` (22.08.2026).
Es erfüllt jede harte Bedingung aus §4 auf Anhieb — ein gehäutetes Netz, 41
Gelenke in Tripo-Benennung, keine Animation, eine Basisfarbtextur, Höhe 0,998,
Sohle bei null. 3526 Ecken, 4929 Dreiecke.

Was die Kette daraus gemacht hat:

| | Wert | |
|---|---|---|
| Haarecken erkannt | 1268 | Mindestzahl 300 |
| Augenoberkante | y 0,717 | Fenster 0,48–0,80 |
| Kopfhalbbreite | 0,221 | alte Figur 0,151 |
| Stutzen zog zurück | 185 Ecken, Haarkante 0,561 → 0,647 | die alte Figur brauchte 927 |
| Breite durch Höhe, Blatt | **0,527** | Band 0,45–0,55, **ohne Stauchung** |
| Haaranteil | 31,9 % der Höhe, 25,8 % der Fläche | |
| Kopfachse, Median | 1,83 lp | alte Figur 1,61 |

Dass das Stutzen kaum noch greift, ist der Erfolgsfall: Die Kappe kommt schon
als kompakter Schnitt aus dem Modell und muss nicht mehr kleingeschnitten
werden.

Drei Zahlen sind daraufhin nachgeführt worden, alle gemessen:

- `figur.json`: `schmal`, `tief` und `kopfSkala` von 0,64 / 0,64 / 0,82 auf
  **1,0**. Die Figur kommt schlank und richtig proportioniert an.
- `haar.ts`, `ACHSE_NORM` von 1,61 auf **1,83** — der neue Kopf ist breiter,
  und die Strähnen rechnen in Kopfachsen.
- `haar.ts`, `LAENGE` von 7,4 auf **5,5** und die Dicke von 0,78 auf 0,65.
  Ungeändert legten die Strähnen 29,5 % Fläche neben den Umriss und
  überwucherten die Figur; jetzt sind es 14,3 %.

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

STYLE: a soft matte plasticine look — smooth modelled clay forms with gentle
even shading and rounded edges, like a stop-motion puppet, clean and toy-like.

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

HAIR, the signature feature: a compact crop of vivid blue hair that sits on the
top of the skull only. It leaves the whole forehead clear well above the
eyebrows and stops short of the ears, so a broad band of bare scalp and temple
shows all round between the hair and the face. The head reads as a head, and the
blue sits on it as a mark rather than covering it.

The mass is small, but the locks are LONG. Four broad locks, each about a
quarter of the head width, each drawn out into a pointed tip that hangs well
past the main mass and down past the ear — no two of them the same length, with
visible gaps of empty background between the tips, so the lower edge of the hair
is ragged and open instead of one smooth closed arc. Few, wide and long: what
has to read at thirteen pixels is the OUTLINE, not the surface. Between the
locks run deep grooves that catch a darker shade.

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
with just enough soft shading to show the roundness of each form. Evenly lit and
shadowless, standing on nothing, with matte surfaces. Plain flat light grey
background #c8c8c8, the same in every view. The whole figure fits inside every
view with a small even margin all round.

LEGIBILITY: the design must stay readable at thirteen pixels tall — one blue
mass on top with a ragged lower edge, a light face with two clearly separate
dark eyes, a green body, two separated legs. Every shape big, every boundary
clean.

Wide image, 3840 x 1024.
```

Die STYLE-Zeile hält fest, was die erste Lieferung von selbst getroffen hat: ein
weicher Knetfiguren-Look. Er ist nicht nur Geschmack — matte, glatte, runde
Formen ohne Glanzlichter sind das, womit Bild-zu-3D am besten zurechtkommt.

Für eine **einzelne** Vorderansicht (Weg A in §2.3) den SHEET-Absatz streichen,
im POSE-Absatz „identical in all four views" durch „seen straight on from the
front" ersetzen und als letzte Zeile `Portrait image, 1024 x 1536.` setzen.

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

### 2.2 Warum fünf Locken und nicht acht

Die erste Fassung dieses Prompts verlangte „eight to ten separate thick locks
with deep cut grooves". Das Bild, das zurückkam, war wieder ein geschlossener
blauer Helm — und die Rechnung sagt, dass es gar nicht anders kommen konnte.

Gemessen am heutigen Blatt, Pose `blocking`, bei echter Spielgrösse: Die
Haarmasse ist **4,55 logische Pixel** breit, auf dem Telefon neunzehn
Gerätepunkte. Die Lesegrenze dieses Projekts steht fest — zwei Merkmale lesen
sich erst ab **0,9 logischen Pixeln** Abstand einzeln (gemessen in der
Entwurfsrunde, siehe `art-src/figur-umbau/README.md`).

| Locken quer über die Masse | Breite je Locke | |
|---|---|---|
| 4 | 1,14 lp | lesbar |
| **5** | **0,91 lp** | **gerade noch lesbar** |
| 6 | 0,76 lp | verschmilzt |
| 8 | 0,57 lp | verschmilzt |
| 10 | 0,46 lp | verschmilzt |

Acht Locken waren also nicht knapp daneben, sondern **um den Faktor zwei unter
der Grenze**. Fünf ist das Maximum, und deshalb steht es jetzt so im Prompt.

Der zweite Fehler der ersten Fassung war grundsätzlicher: Sie beschrieb die
Gliederung als **Rillen**, also als Struktur INNERHALB der Masse. Genau das ist
die Sackgasse, die `scripts/haar-bauen.mjs` im Kopfkommentar festhält —
„Umriss kauft man nicht durch Hinzufügen." Was bei dreizehn Pixeln Figurenhöhe
über „Haar oder Helm" entscheidet, ist allein die **Silhouette**. Der neue
Absatz verlangt deshalb Spitzen, die über die Masse hinausragen, ungleich lang
sind und Lücken zwischen sich lassen — und zwar an der **Unterkante**, nicht
nach oben: Nach oben stehendes Haar war ausdrücklich nicht gewünscht.

### 2.2a Nachtrag: weniger Haar, mehr Kopfhaut

Die zweite Lieferung hatte die fuenf Locken und die zackige Unterkante. Beim
Ansehen in der Vorschau kam der Einwand, sie sei immer noch zu behaart: mehr
Kopfhaut, weniger Masse, dafuer laengere Straehnen — dann traegt der Kontrast,
und die wenigen Haare fallen ueber die Bewegung auf.

Nachgemessen am gebackenen Blatt gibt der Einwand recht, und zwar mit einer
Zahl, die vorher niemand angesehen hatte. Der Kontrast des Haares gegen seine
Nachbarn:

| Nachbar | WCAG |
|---|---|
| Himmel | 3,07 |
| **Haut** | **2,50** |
| Hose | 1,45 |
| Tunika | 1,31 |
| Erde | 1,05 |

**Die Haut ist nach dem Himmel die beste Nachbarschaft, die diese Figur zu
bieten hat** — fast doppelt so gut wie die Tunika. Jeder Bildpunkt Haar, der
einem Bildpunkt Haut weicht, verkauft schwachen Kontrast gegen starken.

Am vorhandenen Modell durchgespielt (die Stutzellipse enger, die Straehnen von
fuenf auf vier bei mehr Laenge und Dicke):

| | heute | enger |
|---|---|---|
| Verhaeltnis Haut zu Haar am Kopf | 0,88 | **1,25** |
| Haaranteil an der Figurenhoehe | 35,5 % | 31,3 % |
| Haaranteil an der Flaeche | 23,2 % | 19,9 % |
| freie Tinte neben dem Umriss | 7,7 % | 7,9 % |

Der Kopf zeigt damit zum ersten Mal mehr Gesicht als Frisur, und die freie
Tinte neben dem Umriss bleibt gleich — die Laenge geht nicht verloren, sie
wechselt nur den Ort. Beides steht seit dieser Runde als Vorgabe im Code
(`scripts/haar-bauen.mjs`, `src/render/haar.ts`); der HAIR-Absatz in §2 ist
entsprechend neu gefasst.

Eine Sorge hat sich nicht bestaetigt: Das Stirnband, das die Berufsfarbe traegt,
haengt an der Kopfachse und nicht an der Haarmasse. Es sieht mit der engeren
Kappe genauso aus wie vorher — nachgesehen an einem vergebenen Blocker.

### 2.3 Zwei Wege zum Blatt — der zweite ist der bessere

**Weg A, empfohlen: eine Ansicht malen, drei rechnen lassen.** GPT Image 2
liefert nur die Vorderansicht (1024 × 1536). Tripo macht daraus mit dem
Auftrag `generate_multiview_image` selbst die vier Ansichten und kettet sie über
`original_task_id` direkt in `multiview_to_model`. Einzelne Ansichten lassen
sich mit `edit_multiview_image` nachbessern (`[{"view":"back","prompt":"…"}]`).

Der Vorteil ist nicht Bequemlichkeit, sondern **Konsistenz**: Der häufigste
Fehler bei Turnaround-Blättern aus Bildmodellen ist, dass Profil und Rückseite
eine leicht andere Figur zeigen — andere Höhe, andere Frisur, anderes Gesicht.
Wer die drei übrigen Ansichten aus der einen ableiten lässt, hat das Problem
nicht.

**Weg B: das ganze Blatt malen.** Der Prompt in §2 in der Vier-Ansichten-Fassung,
3840 × 1024. Danach in vier Einzelbilder zu je 960 px schneiden, in der
Reihenfolge **front, left, back, right** — genau diese Reihenfolge erwartet
Tripos Bildliste, das Frontbild ist Pflicht, mindestens zwei Bilder braucht es.

Abnahme des Blattes, ehe es zu Tripo geht: gleiche Höhe, gleiche Farben, gleiche
Haarmenge und dieselbe Augenlinie in allen Ansichten.

### 2.4 Zwei Grenzen des Bildmodells, die den Prompt formen

**GPT Image 2 kann keinen transparenten Hintergrund.** `background:
"transparent"` wird von `gpt-image-2` mit einem Fehler abgelehnt; nur
`gpt-image-1` und `gpt-image-1.5` können es. Deshalb steht im Prompt ein flacher
Vollton `#c8c8c8` — Tripo stellt selbst frei, und ein neutrales Grau färbt die
Haarkanten beim Freistellen weniger als ein Buntton.

**Das Format ist frei, aber nicht beliebig.** `gpt-image-1.x` kennt nur
1024 × 1024, 1536 × 1024 und 1024 × 1536. `gpt-image-2` nimmt beliebige Masse,
solange Breite und Höhe durch 16 teilbar sind, das Seitenverhältnis zwischen
1:3 und 3:1 liegt und 3840 × 2160 nicht überschritten wird. Ein
Vier-Ansichten-Blatt mit brauchbarer Auflösung je Ansicht geht also nur mit
`gpt-image-2` — bei 1536 × 1024 blieben je Ansicht 384 px, und Bild-zu-3D will
mindestens rund 1024.

---

## §3 Was Tripo damit tun soll

Die Namen in der rechten Spalte sind die des offiziellen `tripo-python-sdk`;
in der Weboberfläche heissen die Schalter sinngemäss genauso.

| Schritt | Einstellung | Warum |
|---|---|---|
| Ansichten | `generate_multiview_image` aus der Vorderansicht, dann `multiview_to_model` | Der Hinterkopf entscheidet über die Haarkante, und dort sitzen die Strähnenwurzeln. Aus einem Einzelbild rät das Modell ihn. |
| Bildliste | Reihenfolge **front, left, back, right**; front ist Pflicht | so erwartet es der Auftrag |
| Textur | `texture: true`, `texture_quality: detailed`, `texture_size` 1024 oder 2048 | Die Backkette liest ausschliesslich `baseColorTexture`. Der Vorgabewert 4096 ist unnötig gross. |
| PBR | `pbr: false` | Metall- und Rauheitskarten werden nicht gelesen. |
| Teile | `generate_parts: false` | **Hart nötig.** Die Backkette nimmt das erste gehäutete Netz und ignoriert alles weitere — siehe §4, Bedingung 1. |
| Netz | `quad: false`, `face_limit` rund **5000** | Das alte Modell hat 4964 Dreiecke. Weniger frisst die Haarrillen, mehr bringt bei 13 Pixeln nichts. |
| Rigging | `rig_model`, `rig_type: biped`, **`spec: tripo`**, `model_version: v1.0-20240301` | `spec: mixamo` liefert `mixamorig:…`-Namen und macht alle dreizehn Posendateien wirkungslos. Die neuere Rig-Fassung ist für Tierskelette gedacht und fiel bei humanoiden Netzen mit asymmetrischen Ketten durch. |
| Vorprüfung | `check_riggable` vor dem Riggen | sagt, ob das Netz überhaupt riggbar ist |
| Animation | keine | Alle Bewegung entsteht beim Backen aus den Posendateien. |
| Ausgabe | **GLB**, Textur eingebettet | Die Skripte lesen genau das. |

Die Datei kommt nach `art-src/wuselwerker/wuselwerker-rig.glb`.

### 3.1 Auto-Rigging ist nicht deterministisch

`riggable: true` heisst nicht, dass ein brauchbares Skelett herauskommt.
Gemeldet sind entartete Ergebnisse — ein Arm mit neun Knochen gegen einen mit
vier, Beine ohne Gelenk, ganz fehlende Ketten. Chibi-Proportionen sind dafür
besonders anfällig, weil Hals und Schultern kurz sind.

**Deshalb: bei einem schlechten Skelett den Rigging-Auftrag wiederholen, nicht
das Modell neu erzeugen.** Was das Skelett taugt, sagt Abnahmeschritt 1 in §7 in
zehn Sekunden.

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
| **Der Umriss der Haarmasse ist offen, nicht geschlossen** | Bei 13 Pixeln Figurenhöhe entscheidet allein die Silhouette über „Haar oder Helm". Die Masse misst quer 4,55 logische Pixel; mehr als fünf Locken darüber verschmelzen (§2.2). Rillen INNERHALB der Masse zahlen darauf nicht ein — „Umriss kauft man nicht durch Hinzufügen" (`scripts/haar-bauen.mjs`). |
| **Trotzdem tiefe Rillen** | Das Spreizen (`schaerfe 2,4`, `kegel 12 Grad`) verstärkt vorhandenes Relief; erfinden kann es keines. Am alten Modell war gemessen: Lappen ja, **Amplitude nein**. Die Rillen tragen die Schattierung, die Spitzen tragen den Umriss. |
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
