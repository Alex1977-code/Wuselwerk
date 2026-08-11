# Wuselwerk — Grafikkatalog

**Verbindliche Grafikreferenz des Projekts.** Diese Datei legt die Stilrichtung fest und
enthält für jede einzelne Grafik des Spiels einen einsetzbaren Prompt.

**Sprachregel:** Erklärungen deutsch, Prompts englisch, jeder Prompt in einem eigenen
Codeblock, jeder Prompt für sich einsetzbar und ohne auszufüllende Lücken.

---

## §0 Was diese Datei ist — und was sie ablöst

| Datei | Status ab jetzt |
|---|---|
| **`grafik-ankerbild-a0.md`** | **Steht über allem.** Die Ankerfigur, ihr Prompt, ihr Modell, das daraus gemessene Zellmaß. Bei Widerspruch gilt sie. |
| **`grafik-katalog.md`** (diese Datei) | **Verbindlich für Stil, Figurenkanon, Haar, Palette, Prompts** — im Rahmen der Ankerdatei. |
| `grafik-prompts.md` | **Stilrichtung abgelöst.** Die Motivlisten bleiben gültig und sind hier die Vollständigkeitsprüfung. Der 3D-Weg aus §10 dort gilt unverändert. |
| `grafik-integration.md` | **Bildzahlen und Haltedauern bleiben bindend.** Die Zellgeometrie in §2.1 dort ist durch die Ankerdatei ersetzt, die Bildbeschreibungen in §3 dort durch §7 hier. |

Konkret bleibt aus `grafik-integration.md` unverändert bindend und wird hier **nicht
wiederholt**:

- Zelle **28 × 28** logisch, Master 224 × 224 (§2.1 dort, hergeleitet in `grafik-ankerbild-a0.md` §4)
- Fußpunkt in der Zelle **(14, 22)**, Ankerpunkt auf halber Zellbreite (§2.1 dort)
- Bildzahlen und Haltedauern je Zustand (§2.3 dort) — die Tabelle ist die Grundlage der
  Haaranimation in §3.3 hier
- Auslieferung in 1×, Master in 8× (§2.2 dort)
- Andockpunkte `head` / `hip` / `belly`, Anbauteil-Verfahren (§4 dort)
- Wertebänder der Terrainkacheln, 32–200 bzw. 24–232 (§5.0 dort)
- Atlasformat, Ladeweg, Einzeldatei-Build (§6 dort)

**Eine Änderung am Kanon, die alles betrifft:** Die Figur ist nicht mehr kahl. Sie trägt
Haar. Der Satz „completely bald, no hair" aus dem alten Kanon gilt nicht mehr; überall dort,
wo er in `grafik-prompts.md` und `grafik-integration.md` steht, ist er durch die
Haarbeschreibung aus §3 hier ersetzt.

**Und eine zweite, die dieser Datei vorgeht:** Seit der Ankerfigur ist der Wusel ein
**Troll mit roter Mähne**, die Zelle misst **28 × 28** und gestaltet wird für den **quer
gehaltenen** Bildschirm. Verbindlich dafür ist `grafik-ankerbild-a0.md`; die betroffenen
Stellen dieser Datei sind dort in §5 einzeln aufgeführt und hier nachgezogen. Wo doch etwas
stehen geblieben ist — Beerenrosa, kahler Kopf, Zelle 24 × 24 —, gilt die Ankerdatei.

**Rechtsrahmen unverändert (GDD §12).** In keinem Prompt, keinem Dateinamen, keinem
Referenzbild: kein Markenname, keine Umschreibung einer Vorlage, und **niemals grünes Haar
in Kombination mit blauer Kutte**. Grün als Haarfarbe scheidet aus — nicht nur juristisch,
sondern auch messbar (§3.1). Der Negativprompt in §5.5 gehört an jeden Prompt dieser Datei.

---

## §1 Inventar — alle Grafiken des Spiels

Vollständige Liste. Jede Zeile hat einen Prompt in dieser Datei.

**Spalte Zielformat:** `2D-Blatt` = mehrere Zellen in einer Reihe · `2D-Kachel` = kachelbare
Fläche · `2D-Vollbild` = eine gemalte Fläche · `3D` = Modell, das über den Weg aus
`grafik-prompts.md` §10 zu Pixeln wird.

**Spalte Werkzeug:** was tatsächlich das bessere Ergebnis liefert, nicht was theoretisch
ginge. `von Hand` heißt: Der Prompt ist eine Formvorlage, das Asset entsteht in Aseprite.

### 1.1 Figur — Anker und Studien

| Nr | Bezeichnung | Verwendungszweck | Zielformat | Größe (Auslieferung) | Werkzeug | Prompt |
|---|---|---|---|---|---|---|
| 1 | Figurenblatt **A0** | Der Ursprung. Referenz für alles Weitere | 2D-Vollbild | 1024 × 1024 Master | GPT Image 2 | §6.1 |
| 2 | Turnaround **A1** | Vorlage für 3D und Nachzeichnen | 2D-Blatt, 4 Zellen | 4 × 160 Master | GPT Image 2 | §6.2 |
| 3 | Werkzeugtafel **A2** | Referenz für alle Berufsblätter | 2D-Blatt, 10 Zellen | 10 × 128 Master | GPT Image 2 | §6.3 |
| 4 | Haarstellungsblatt | Die 8 kanonischen Haarlagen, Malvorlage | 2D-Blatt, 8 Zellen | 8 × 192 Master | GPT Image 2 | §6.4 |
| 5 | Ausdrucksblatt | 9 Gesichter, Malvorlage | 2D-Blatt, 3 × 3 | 3 × 3 × 192 Master | GPT Image 2 | §6.5 |

### 1.2 Figur — Zustandsblätter (Zelle 28 × 28, Fußpunkt (14, 22))

Bildzahl und Haltedauer stehen in `grafik-integration.md` §2.3 und sind nicht verhandelbar.

| Nr | Bezeichnung | Verwendungszweck | Zielformat | Größe | Werkzeug | Prompt |
|---|---|---|---|---|---|---|
| 6 | `walking` | Laufen — über 90 % aller Figurenbilder | 2D-Blatt, 8 Bilder | 224 × 28 | GPT Image 2 → von Hand | §7.1 |
| 7 | `falling` | Freier Fall | 2D-Blatt, 4 Bilder | 112 × 28 | GPT Image 2 → von Hand | §7.2 |
| 8 | `floating` | Sinkflug am Schirm | 2D-Blatt, 4 Bilder | 112 × 28 | GPT Image 2 → von Hand | §7.3 |
| 9 | `climbing` | Wandaufstieg | 2D-Blatt, 4 Bilder | 112 × 28 | GPT Image 2 → von Hand | §7.4 |
| 10 | `hoisting` | Über die Kante ziehen, einmalig | 2D-Blatt, 6 Bilder | 168 × 28 | Tripo | §7.5 |
| 11 | `building` | Brückenstufe legen | 2D-Blatt, 8 Bilder | 224 × 28 | Tripo | §7.6 |
| 12 | `bashing` | Waagerecht graben | 2D-Blatt, 3 Bilder | 84 × 28 | GPT Image 2 → von Hand | §7.7 |
| 13 | `mining` | Diagonal graben | 2D-Blatt, 4 Bilder | 112 × 28 | GPT Image 2 → von Hand | §7.8 |
| 14 | `digging` | Senkrecht graben | 2D-Blatt, 3 Bilder | 84 × 28 | GPT Image 2 → von Hand | §7.9 |
| 15 | `blocking` | Blockerhaltung | 2D-Blatt, 2 Bilder | 56 × 28 | GPT Image 2 | §7.10 |
| 16 | `saving` | Rettung, einmalig | 2D-Blatt, 6 Bilder | 168 × 28 | Tripo | §7.11 |
| 17 | `dying` | Allgemeiner Zusammenbruch, einmalig | 2D-Blatt, 8 Bilder | 224 × 28 | Tripo | §7.12 |

### 1.3 Anbauteile

| Nr | Bezeichnung | Verwendungszweck | Zielformat | Größe | Werkzeug | Prompt |
|---|---|---|---|---|---|---|
| 18 | Kletterhelm | Andockpunkt `head`, 3 Neigungen | 2D-Blatt, 3 Zellen | 36 × 12 | GPT Image 2 | §8.1 |
| 19 | Schirm eingeklappt | Andockpunkt `hip`, 2 Bilder | 2D-Blatt, 2 Zellen | 24 × 12 | GPT Image 2 | §8.2 |
| 20 | Bombe mit Zündschnur | Andockpunkt `belly`, 5 Bilder | 2D-Blatt, 5 Zellen | 80 × 16 | GPT Image 2 | §8.3 |
| 21 | Countdown-Ziffern 1–5 | Über dem Kopf des Sprengmeisters | 2D-Blatt, 5 Zellen | 40 × 10 | von Hand | §8.4 |

### 1.4 Die zehn Berufe — Erkennungsblätter

Kein Animationsblatt, sondern die verbindliche Kennhaltung je Beruf: Werkzeug, Haltung,
Haarlage. Vorlage für die Zustandsblätter und für die Symbole.

| Nr | Bezeichnung | Verwendungszweck | Zielformat | Größe | Werkzeug | Prompt |
|---|---|---|---|---|---|---|
| 22 | Kletterer | Kennhaltung + Silhouettentest | 2D-Blatt, 2 Zellen | 2 × 192 Master | GPT Image 2 | §9.1 |
| 23 | Schirmspringer | ebd. | 2D-Blatt, 2 Zellen | 2 × 192 Master | GPT Image 2 | §9.2 |
| 24 | Sprengmeister | ebd. | 2D-Blatt, 2 Zellen | 2 × 192 Master | GPT Image 2 | §9.3 |
| 25 | Blocker | ebd. | 2D-Blatt, 2 Zellen | 2 × 192 Master | Tripo | §9.4 |
| 26 | Brückenbauer | ebd. | 2D-Blatt, 2 Zellen | 2 × 192 Master | GPT Image 2 | §9.5 |
| 27 | Rammer | ebd. | 2D-Blatt, 2 Zellen | 2 × 192 Master | GPT Image 2 | §9.6 |
| 28 | Schrägbagger | ebd. | 2D-Blatt, 2 Zellen | 2 × 192 Master | GPT Image 2 | §9.7 |
| 29 | Gräber | ebd. | 2D-Blatt, 2 Zellen | 2 × 192 Master | GPT Image 2 | §9.8 |
| 30 | Magnetiker (ab Welt 4) | ebd. | 2D-Blatt, 2 Zellen | 2 × 192 Master | GPT Image 2 | §9.9 |
| 31 | Springer (ab Welt 4) | ebd. | 2D-Blatt, 2 Zellen | 2 × 192 Master | GPT Image 2 | §9.10 |

### 1.5 Todesarten

`DeathCause.ABYSS` bekommt keine Grafik — die Figur ist beim Sterben unterhalb des Levels
(`grafik-integration.md` §2.4). `NUKE` benutzt das Sprengungsblatt.

| Nr | Bezeichnung | `DeathCause` | Zielformat | Größe | Werkzeug | Prompt |
|---|---|---|---|---|---|---|
| 32 | Sturz — Aufprall | `SPLAT` | 2D-Blatt, 8 Bilder | 224 × 28 | Tripo | §10.1 |
| 33 | Ertrinken | (Wasserfalle) | 2D-Blatt, 8 Bilder | 224 × 28 | GPT Image 2 | §10.2 |
| 34 | Feuer | (Feuerstrahl) | 2D-Blatt, 8 Bilder | 224 × 28 | GPT Image 2 | §10.3 |
| 35 | Zerquetschen | `CRUSHED` | 2D-Blatt, 8 Bilder | 224 × 28 | Tripo | §10.4 |
| 36 | Sprengung | `EXPLOSION`, `NUKE` | 2D-Blatt, 8 Bilder | 224 × 28 | GPT Image 2 | §10.5 |
| (17) | Allgemeiner Zusammenbruch | Rückfall für alles | 2D-Blatt, 8 Bilder | 224 × 28 | Tripo | §7.12 |

### 1.6 Terrainmaterialien

| Nr | Bezeichnung | Verwendungszweck | Zielformat | Größe | Werkzeug | Prompt |
|---|---|---|---|---|---|---|
| 37 | Erde | `MAT.EARTH` | 2D-Kachel | 64 × 64 | GPT Image 2 | §11.1 |
| 38 | Fels | `MAT.ROCK` | 2D-Kachel | 64 × 64 | GPT Image 2 | §11.2 |
| 39 | Stahl | `MAT.STEEL` | 2D-Kachel | 64 × 64 | **von Hand / Skript** | §11.3 |
| 40 | Gebaute Stufe | `MAT.BRICK` | 2D-Streifen | 48 × 8 | GPT Image 2 | §11.4 |
| 41 | Grasnarbe | Deckschicht über Erde, mit Alpha | 2D-Streifen | 64 × 8 | GPT Image 2 | §11.5 |
| 42 | Bruchkantenstudie | Farbfindung frisch gegen alt, kein Asset | 2D-Vollbild | 2048 × 1024 Master | GPT Image 2 | §11.6 |

### 1.7 Die sechs Welten

Je Welt eine Materialtafel (Farbabstimmung, liefert die Werte für `palette.ts`) und ein
Parallaxblatt (vier Ebenen als Streifen, danach zerschneiden).

| Nr | Welt | Teil | Zielformat | Größe | Werkzeug | Prompt |
|---|---|---|---|---|---|---|
| 43 | Grasland | Material | 2D-Vollbild | 2048 × 512 Master | GPT Image 2 | §12.1 |
| 44 | Grasland | Parallax **A4** | 2D-Vollbild, 4 Streifen | 2048 × 1536 Master | GPT Image 2 | §12.2 |
| 45 | Kristallhöhle | Material | 2D-Vollbild | 2048 × 512 Master | GPT Image 2 | §12.3 |
| 46 | Kristallhöhle | Parallax | 2D-Vollbild, 4 Streifen | 2048 × 1536 Master | GPT Image 2 | §12.4 |
| 47 | Ewiges Eis | Material | 2D-Vollbild | 2048 × 512 Master | GPT Image 2 | §12.5 |
| 48 | Ewiges Eis | Parallax | 2D-Vollbild, 4 Streifen | 2048 × 1536 Master | GPT Image 2 | §12.6 |
| 49 | Zahnradfabrik | Material | 2D-Vollbild | 2048 × 512 Master | GPT Image 2 | §12.7 |
| 50 | Zahnradfabrik | Parallax | 2D-Vollbild, 4 Streifen | 2048 × 1536 Master | GPT Image 2 | §12.8 |
| 51 | Vulkanschlund | Material | 2D-Vollbild | 2048 × 512 Master | GPT Image 2 | §12.9 |
| 52 | Vulkanschlund | Parallax | 2D-Vollbild, 4 Streifen | 2048 × 1536 Master | GPT Image 2 | §12.10 |
| 53 | Wolkenwerft | Material | 2D-Vollbild | 2048 × 512 Master | GPT Image 2 | §12.11 |
| 54 | Wolkenwerft | Parallax | 2D-Vollbild, 4 Streifen | 2048 × 1536 Master | GPT Image 2 | §12.12 |

### 1.8 Falltür, Ausgang, Fallen

| Nr | Bezeichnung | Verwendungszweck | Zielformat | Größe | Werkzeug | Prompt |
|---|---|---|---|---|---|---|
| 55 | Falltür | Einstieg jedes Levels, 2 Zustände | 2D-Blatt, 2 Zellen | 2 × 40 × 20 | Tripo | §13.1 |
| 56 | Ausgangstür | Ziel jedes Levels, 3-Bild-Puls | 2D-Blatt, 3 Zellen | 3 × 48 × 48 | Tripo | §13.2 |
| 57 | Bärenfalle | Falle, 2 Zustände | 2D-Blatt, 2 Zellen | 2 × 40 × 24 | Tripo | §13.3 |
| 58 | Presse | Falle, 3 Zustände | 2D-Blatt, 3 Zellen | 3 × 48 × 48 | Tripo | §13.4 |
| 59 | Feuerstrahl | Falle, 4 Bilder | 2D-Blatt, 4 Zellen | 4 × 64 × 24 | GPT Image 2 | §13.5 |
| 60 | Wasser | Falle: Oberfläche, Tiefe, Spritzer | 2D-Vollbild | 2048 × 1024 Master | GPT Image 2 | §13.6 |

### 1.9 Effekte und Partikel

Die Farben stehen im Code (`scene.ts`, `spawnFromEvents`) und sind in den Prompts übernommen.

| Nr | Bezeichnung | Ereignis im Code | Zielformat | Größe | Werkzeug | Prompt |
|---|---|---|---|---|---|---|
| 61 | Grabstaub | `dig`, 3 Partikel `#8a6236` | 2D-Blatt, 6 Bilder | 6 × 16 × 16 | GPT Image 2 | §14.1 |
| 62 | Gesteinsbrocken | `brick`, 2 Partikel `#c98a52` | 2D-Blatt, 8 Zellen | 8 × 8 × 8 | GPT Image 2 | §14.2 |
| 63 | Stahlfunken | `steel`, 7 Partikel `#ffe9a8` | 2D-Blatt, 5 Bilder | 5 × 16 × 16 | GPT Image 2 | §14.3 |
| 64 | Rauchfahne | Sprengung, `#5a5a5a` | 2D-Blatt, 6 Bilder | 6 × 24 × 24 | GPT Image 2 | §14.4 |
| 65 | Explosion | `explode`, `#ff9a3c` + `#5a5a5a` | 2D-Blatt, 8 Bilder | 8 × 48 × 48 | GPT Image 2 | §14.5 |
| 66 | Rettungsfunken | `saved`, 8 Partikel `#ffe98a` | 2D-Blatt, 6 Bilder | 6 × 24 × 24 | GPT Image 2 | §14.6 |

### 1.10 Bedienoberfläche

| Nr | Bezeichnung | Verwendungszweck | Zielformat | Größe | Werkzeug | Prompt |
|---|---|---|---|---|---|---|
| 67 | Acht Berufssymbole | Skill-Leiste, 36 Punkt | 2D-Blatt, 4 × 2 | 8 × 72 × 72 | GPT Image 2 → von Hand | §15.1 |
| 68 | Zwei Spätsymbole | Magnetiker, Springer | 2D-Blatt, 2 Zellen | 2 × 72 × 72 | GPT Image 2 → von Hand | §15.2 |
| 69 | Skill-Leiste im Bogen | Rahmen unterer Bildschirmviertel | 2D-Vollbild | 1080 × 640 | GPT Image 2 | §15.3 |
| 70 | Rettungsquote-Balken | Kopfleiste, 4 Zustände | 2D-Blatt, 4 Zeilen | 1024 × 512 Master | GPT Image 2 | §15.4 |
| 71 | Kopfleisten-Knöpfe | Ton, Selbstzerstörung, Pause, Zentrieren | 2D-Blatt, 4 × 2 | 8 × 96 × 96 Master | von Hand | §15.5 |
| 72 | Sterne | Drei Wertungssterne, leer und gefüllt | 2D-Blatt, 2 Zellen | 2 × 128 × 128 Master | von Hand | §15.6 |
| 73 | Lupenrahmen | Fassung + Fadenkreuz über dem Daumen | 2D-Vollbild | 512 × 512 | GPT Image 2 | §15.7 |

### 1.11 App-Symbol, Ladebild, Store

| Nr | Bezeichnung | Verwendungszweck | Zielformat | Größe | Werkzeug | Prompt |
|---|---|---|---|---|---|---|
| 74 | App-Symbol | Startbildschirm, Store-Eintrag | 2D-Vollbild | 1024 × 1024 | GPT Image 2 | §16.1 |
| 75 | Ladebild | Erster Bildschirm beim Start, hoch | 2D-Vollbild | 1440 × 2560 | GPT Image 2 | §16.2 |
| 76 | Store-Keyart quer | Store, Presse, Website | 2D-Vollbild | 2560 × 1440 | GPT Image 2 | §16.3 |
| 77 | Store-Keyart hoch | Store hochkant, Feature-Platzierung | 2D-Vollbild | 1440 × 2560 | GPT Image 2 | §16.4 |
| 78 | Store-Werbebanner | Breitformatiges Kopfbild der Store-Seite | 2D-Vollbild | 1024 × 500 | GPT Image 2 | §16.5 |

### 1.12 3D-Modelle (Tripo)

Diese Modelle sind keine Assets, sondern Zulieferer. Der Weg Modell → orthografischer
Turnaround → Herunterrechnen → Nachziehen steht in `grafik-prompts.md` §10 und wird hier
nicht wiederholt.

| Nr | Bezeichnung | Beliefert | Zielformat | Werkzeug | Prompt |
|---|---|---|---|---|---|
| 79 | Basisfigur mit Haar, T-Pose | Nr. 6–17, 32–36 | 3D | Tripo | §17.1 |
| 80 | Werkzeug- und Ausrüstungs-Props | Nr. 18–20, 22–31 | 3D | Tripo | §17.2 |
| 81 | Blockerhaltung als eigenes Modell | Nr. 15, 25 | 3D | Tripo | §17.3 |
| 82 | Falltür und Ausgangstür | Nr. 55, 56 | 3D | Tripo | §17.4 |
| 83 | Presse und Bärenfalle | Nr. 57, 58 | 3D | Tripo | §17.5 |
| 84 | Terrainbausteine | Nr. 37–40 | 3D | Tripo | §17.6 |
| 85 | Weltrequisiten | Nr. 45–54 (Vordergrund) | 3D | Tripo | §17.7 |

**85 Prompts, 78 Grafiken.** Die Differenz sind die fünf Ankerbilder und Studien, die nie
ins Spiel kommen, sowie die Bruchkantenstudie und das Haarstellungsblatt.

---

## §2 Der knuddelige Look — verbindliche Definition

„Knuddelig" ist kein Adjektiv, das man in einen Prompt schreibt und hofft. Es ist eine
Liste von Zahlen. Hier ist sie.

**Die harte Grenze steht am Anfang, nicht am Ende:** Die Figur ist **12 logische Pixel
hoch** (`WUSEL_H`), die Silhouette mit Umriss 13. Jeder Gestaltungsentscheid unten ist
danach ausgewählt, ob er bei dieser Größe noch etwas bewirkt. Was nur im Master wirkt, ist
als solches markiert.

### 2.1 Proportion — die einzige Quelle von Niedlichkeit bei 12 Pixeln

Feine Details erzeugen Niedlichkeit erst ab etwa 32 Pixeln Figurenhöhe. Darunter erzeugt
sie ausschließlich das **Verhältnis der Massen**. Deshalb ist die Aufteilung verbindlich:

| Körperteil | Zeilen (von 12) | Anteil | Breite | Bemerkung |
|---|---|---|---|---|
| Mähne | bis +8 **über** der Figur, bis 11 **neben** der Mitte | — | bis 22 | zählt nicht zur Figurenhöhe, aber zur Silhouette — und ist dort die größte Fläche |
| Kopf | 5 | 42 % | 4 | obere zwei Ecken je 1 px abgeschrägt |
| Rumpf | 5 | 42 % | 4 | obere zwei Ecken abgeschrägt = runde Schultern |
| Stiefel | 2 | 16 % | 4 | in Standpose 1 px Zehenüberstand nach vorn |

Das ist eine **Änderung gegenüber dem Prototyp**, der Kopf 4, Rumpf 6, Stiefel 2 zeichnet
(`sprites.ts` 65–67). Der Kopf gewinnt eine Zeile, der Rumpf verliert eine. Damit ist die
Figur **rund zweieinhalb Kopfhöhen** groß statt drei — und genau dieser eine Pixel ist der
Unterschied zwischen „Arbeiter" und „knuddelig".

**Was der verlorene Rumpfpixel kostet, ehrlich:** Die Berufsmerkmale sitzen auf
Rumpfhöhen. Nach der Änderung liegt der Hammerbalken des Rammers auf Zeile `y−5`, der
Schaufelbalken des Gräbers auf `y…y+2`, die Diagonale des Schrägbaggers zwischen `y−6` und
`y+1`. Der Abstand zwischen den drei Balken bleibt bei mindestens 3 Pixeln — er trägt. Ein
zweiter Rumpfpixel weniger würde ihn brechen. **Diese Grenze ist ausgereizt.**

**Der Kopf ist breiter als der Rumpf — aber nur in gerader Breite.** Der frühere Satz
„der Kopf wird nicht breiter als der Rumpf" beruhte auf einem falsch benannten Grund. Die
Bedingung ist nicht die *Größe*, sondern die *Parität*: Die Spiegelachse liegt auf einer
Pixelkante (`grafik-integration.md` §2.1), deshalb ist jede **gerade** Breite mittig
setzbar und jede ungerade nicht. 5 Pixel scheiden aus, 6 nicht. Die Ankerfigur hat einen
Kopf von 10,6 Pixeln Breite bei 12 Pixeln Höhe gemessen (`grafik-ankerbild-a0.md` §4.3) —
sie ist ausgesprochen kopflastig, und das ist die halbe Niedlichkeit.

Die andere Hälfte ist die **Mähne**. Sie ist bei Spielgröße die größte zusammenhängende
Fläche der Figur, größer als der Kopf und größer als der Rumpf. Die Silhouette ist damit
oben deutlich breiter als unten — das ist der eigentliche Kniff dieses Entwurfs.

### 2.2 Augen

- **Zwei Augen, je genau 1 Pixel**, in reinem Umrissschwarz `#0c1119`, mit **1 Pixel
  Abstand** dazwischen. Drei der vier Kopfspalten sind damit belegt.
- **Zeile 3 von 5** des Kopfes, gerechnet von oben. Das ist die Kopfmitte und liest bei
  einem so hohen Kopf als „tief im Gesicht" — die Bedingung für Niedlichkeit.
- In der reinen Seitenansicht ist **nur ein Auge sichtbar**. Das zweite existiert nur auf
  dem Ausdrucksblatt und im App-Symbol.
- **Nur im Master und in Marketingbildern:** Pupille, Glanzpunkt, Lidschlag, Augenbraue,
  Wimper, Blickrichtung. Bei 12 Pixeln ist das Auge ein schwarzer Punkt und sonst nichts.
  Wer Emotion bei Spielgröße will, macht sie über **Kopfneigung** — das ist der einzige
  Ausdruckskanal, der bei dieser Größe funktioniert.

### 2.3 Mund

**Bei 12 Pixeln gibt es keinen Mund.** Ein Pixel unter den Augen ist bereits das Kinn. Der
Mund wird deshalb ausschließlich in drei Fällen gezeichnet, und dann als **ein einzelner
dunkler Pixel** unter dem Auge:

1. `falling` — offener Schreckmund, das Warnsignal des Spiels
2. `dying` Bild 1 — der Moment der Erkenntnis
3. `saving` Bild 3 bis 6 — das Grinsen

Überall sonst ist die untere Kopfzeile leer. Auf dem Ausdrucksblatt (§6.5) und im
App-Symbol gibt es einen echten Mund; das sind Marketinggrößen.

### 2.4 Rundungen gegen Kanten

Die Regel, die den Look zusammenhält, ist ein **Gegensatz**, keine Gleichmacherei:

| Element | Behandlung |
|---|---|
| Kopf, Schultern, Stiefelspitze, Hände, Haarspitzen | **rund** — je Ecke genau 1 Pixel Abschrägung bei 1× |
| Werkzeuge, Helm, Bombe, Paddel, Planke | **kantig** — harte 90-Grad-Ecken, keine Abschrägung |
| Terrain, Stahl, Presse | **kantig** |

Warum nur 1 Pixel Abschrägung: Eine zweistufige Rundung kostet 2 der 4 Pixel Körperbreite
und löst die Masse auf. Die Figur wird dann nicht runder, sondern dünner.

Der Gegensatz rund/kantig ist zugleich die Berufsablesung: Das kantige Ding, das aus der
runden Figur herausragt, **ist** der Beruf.

### 2.5 Konturstärke

- **Genau 1 logischer Pixel**, geschlossen, um die gesamte Silhouette einschließlich Haar,
  in `#0c1119`.
- Im 8×-Master heißt das **8 Masterpixel**, nicht 2. Das ist eine Korrektur an
  `grafik-prompts.md` §2.1, wo „two pixels thick at master scale" steht — 2 Masterpixel
  werden beim Herunterrechnen zu einem Viertelpixel und verschwinden restlos. **Alle
  Prompts dieser Datei sagen 8 Masterpixel.**
- Der Umriss ist **einfarbig**, nie ein Farbverlauf und nie farbig getönt. Er ist das
  einzige, was die Figur vor jedem der sechs Weltuntergründe rettet.
- **Kein Innenumriss.** Zwischen Kopf und Rumpf, zwischen Haar und Kopf steht kein
  schwarzer Trennstrich — dafür ist bei 12 Pixeln kein Platz. Die Trennung macht der
  Helligkeitssprung (§2.6).

### 2.6 Farbsättigung und der Helligkeitsabstand

Sättigung ist bei dieser Größe **billig** — eine Fläche von 2 × 3 Pixeln verträgt volle
Sättigung, ohne grell zu wirken, weil sie zu klein ist, um zu blenden. Der Look darf und
soll deshalb kräftig bunt sein.

**Was nicht billig ist, ist der Helligkeitsabstand.** Regel, verbindlich:

> Zwei aneinandergrenzende Flächen der Figur müssen sich um mindestens **15 L\*** unterscheiden.

Die geprüften Werte des Kanons:

| Fläche | Farbe | L\* |
|---|---|---|
| Haarglanz | `#c98bff` | 81,0 |
| Haut | `#f4d7ac` | 87,4 |
| Werkzeuggelb | `#ffd23f` | 85,9 |
| Anzug | `#2fc9b8` | 73,4 |
| **Haar Grundton** | **`#9d4edd`** | **66,8** |
| Stiefel | `#1d8f85` | 53,6 |
| Haarschatten | `#67219c` | 50,9 |
| Umriss | `#0c1119` | 5,0 |

Geprüfte Nachbarschaften:

| Grenze | ΔL\* | Urteil |
|---|---|---|
| Haar ↔ Haut | 36,1 | trägt |
| Haut ↔ Anzug | 14,0 | knapp — deshalb sitzt dort der Kragen als 1 px dunkler Strich |
| Anzug ↔ Stiefel | 19,8 | trägt |
| Haarglanz ↔ Haarschatten | 39,3 | trägt |
| **Haar ↔ Anzug** | **8,9** | **trägt nicht** |

Der letzte Wert ist die wichtigste Einzelregel dieses Katalogs:

> **Das Haar berührt den Anzug nie.** Es endet auf Schulterhöhe und wird immer vom Kopf
> (Haut, L\* 87) oder vom Hintergrund eingerahmt. Rot auf Türkis ist bei diesen Werten
> nahezu ein Helligkeitsgleichstand und verschmilzt bei 12 Pixeln zu einem Fleck.
>
> Diese Regel ist der Grund, warum die hängende Mähne auf Schulterhöhe endet und warum sie
> beim Blocker noch eine Zeile früher aufhört — dort liegen die orangen Arme (L\* 66,2),
> und Rot auf Orange verschmilzt genauso.

Zwei begründete Ausnahmen, beide unschädlich: `falling` (Haar steht senkrecht nach oben,
weit weg vom Anzug) und `dying` Bild 4–8 (der Anzug entsättigt dort ohnehin zum Umrisston
hin, siehe §7.12).

### 2.7 Lichtführung

Die Lichtrichtung ist **nicht** frei wählbar, und zwar aus einem Code-Grund: Der Renderer
spiegelt das Sprite an der Blickrichtung (`ctx.scale(-1, 1)`). Ein Schlüssellicht von links
oben wandert bei jeder zweiten Figur nach rechts oben, und dann ist die Hälfte aller Figuren
im Bild falsch beleuchtet. Deshalb gilt der Blattvertrag aus `grafik-integration.md` §3.0
unverändert weiter:

- **Schlüssellicht fast senkrecht von oben**, minimale Neigung nach links
- **kühles Aufhelllicht von unten**
- **schmales helles Rim am Scheitel** — bei Haar heißt das: auf der obersten Haarzeile
- **kein Schlagschatten, kein Bodenschatten, kein Kontaktschatten**

Bei 12 Pixeln bleibt davon exakt Folgendes übrig: **eine Zeile Glanz oben, eine Zeile
Grundton, eine Zeile Schatten unten.** Drei Stufen, mehr nicht. Genau so ist die Haarrampe
in §3.2 aufgebaut.

### 2.8 Was bei 12 Pixeln übrig bleibt — die ehrliche Bilanz

Die Tabelle, die man vor jeder Abnahme lesen sollte. Links das, was der knuddelige Entwurf
verspricht; rechts, was davon im Spiel ankommt.

| Merkmal | bei 12 px Figurenhöhe | nur Master / Marketing |
|---|---|---|
| Kopf 42 % der Höhe | **trägt** — der Haupteffekt | |
| Haar 2–3 px über dem Kopf, 2 Farbstufen | **trägt** — der zweite Haupteffekt | einzelne Strähnen, Locken, Haarspitzen |
| Haar schwingt mit | **trägt** — als 1-px-Versatz je Bild | Nachlauf über mehrere Strähnen |
| Runde Schultern | **trägt knapp** — 1 px Abschrägung | echte Kurve |
| Auge | **trägt** als 1 schwarzer Pixel | Pupille, Glanzpunkt, Lid, Wimper, Braue |
| Mund | nur in 3 Zuständen, als 1 Pixel | Mundform, Lächeln, Zähne |
| Kopfneigung | **trägt** — der einzige Ausdruckskanal | |
| Handform | verschwindet — die Hand ist 1 Pixel | Fäustling, Daumen, Griff |
| Stoffnähte, Gürtel, Kragen, Falten | verschwinden, außer 1 px Kragenstrich | alles davon |
| Stiefelprofil, Schnürung | verschwinden | alles davon |
| Rim-Light | **trägt** als 1 Pixel auf dem Haar | echter Verlauf |
| Umriss | **trägt** als 1 px | 2 px, weiche Außenkante |
| Farbsättigung | **trägt** | |
| Ambient Occlusion, weiche Verläufe | verschwinden vollständig | alles davon |

**Zusammengefasst, damit niemand sich täuscht:** Von einem hübschen 1024-Pixel-Charakterblatt
überleben genau fünf Dinge den Weg auf 12 Pixel — Kopfanteil, Haarmasse, Haarbewegung,
Kopfneigung und die drei Helligkeitsstufen. Alles andere ist Marketingmaterial. Deshalb ist
das Ankerbild A0 kein Asset, sondern eine Referenz, und deshalb steht in §18, dass jede
Figur am Ende von Hand nachgepixelt wird.

---

## §3 Das Haar

Das Gestaltungsziel: **auffälliges, mitschwingendes Haar als Signaturmerkmal aller Figuren.**
Bewegtes Haar ist eine Gestaltungsidee, die niemandem gehört. Die konkrete Kombination aus
einer bestimmten Haarfarbe und einer bestimmten Kleidung dagegen schon — deshalb steht in
§3.1 eine Messung und keine Geschmacksentscheidung.

### 3.1 Farbwahl — die Prüfung

**Die Bedingungen**, alle gleichzeitig zu erfüllen:

1. Lesbar auf **Nachthimmel** `#101c33` (L\* 10,4) bis `#3d5f7d` (L\* 39,0)
2. Lesbar auf **brauner Erde** `#6b4a2e` (L\* 34,4)
3. Nicht verwechselbar mit **Werkzeuggelb** `#ffd23f` (L\* 85,9, Farbton 46°) — sonst kippt
   die Berufsablesung, weil Gelb im ganzen Spiel „Werkzeug" bedeutet
4. Nicht verschmelzend mit der **Haut** `#f4d7ac` (L\* 87,4) — das Haar sitzt direkt darauf
5. **Kein Grün** (GDD §12)

**Maßstab: Helligkeitsunterschied vor Buntheit.** Bei 12 Pixeln Figurenhöhe ist die
Haarfläche 2 bis 3 Pixel hoch. Eine Fläche dieser Größe wird vom Auge über ihren Hell-Dunkel-
Sprung erkannt, nicht über ihren Farbton — das gilt erst recht auf einem Telefon bei Sonne
und für farbfehlsichtige Spieler (GDD §6). Die Tabelle nennt deshalb **ΔL\*** als führende
Zahl; der Farbtonabstand ΔH steht daneben, weil er über die *Verwechslung* mit Gelb
entscheidet, nicht über die Sichtbarkeit.

| Kandidat | ΔL\* Himmel oben | ΔL\* Horizont | ΔL\* Erde | ΔL\* Haut | ΔL\* Gelb | ΔH Gelb | Urteil |
|---|---|---|---|---|---|---|---|
| **Grün** (jeder Ton) | — | — | — | — | — | — | **ausgeschlossen, GDD §12** |
| Knochenweiß `#f2ead6` | +82,4 | +53,8 | +58,4 | **+5,4** | **+7,0** | **3,1°** | **fällt** — praktisch dieselbe Farbe wie Haut *und* wie Werkzeuggelb |
| Kupferorange `#ff9a3c` | +62,3 | +33,7 | +38,3 | −14,7 | −13,2 | **17,0°** | **fällt** — liest bei 12 px als Werkzeug am Kopf |
| Zyanweiß `#bfe9ff` | +79,7 | +51,1 | +55,7 | +2,7 | +4,3 | 154,7° | **fällt** — in Kristallhöhle, Eis und Wolkenwerft hellblau auf hellblau |
| Lavendel `#b98cff` | +56,3 | +27,7 | +32,3 | −20,7 | −19,1 | 142,5° | **fällt** — ΔL\* nur 11,3 und ΔH nur 3,7° zum Kristallviolett `#a06be0` |
| Magenta `#e8479a` | +45,7 | +17,1 | **+21,6** | −31,3 | −29,8 | 76,9° | **fällt** — zu dunkel für Erde und Fels, ΔL\* 0,6 zum Kristallviolett |
| **Beerenrosa `#9d4edd`** | **+56,3** | **+27,8** | **+32,3** | **−20,6** | **−19,1** | **76,1°** | **bestanden** |

> **Diese Prüfung ist von der Ankerfigur überholt.** Sie wurde geführt, als die Haarfarbe
> noch offen war. Sie ist nicht gelöscht, weil sie die Sperrzonen des Farbkreises richtig
> beschreibt und weil man wissen muss, was die getroffene Wahl kostet — aber entschieden
> ist sie nicht mehr hier, sondern in `grafik-ankerbild-a0.md`.
>
> **Es gilt: Violett `#9d4edd`.**

Violett stand in der Prüfung unten gar nicht zur Wahl — die Liste war auf Töne verengt, die
sich von Beerenrosa unterscheiden. Nachgemessen nach denselben Maßstäben:

| Haar `#9d4edd` (L\* 49,3) gegen | ΔL\* | ΔH | Urteil |
|---|---|---|---|
| Nachthimmel oben `#0d1730` | **+40** | groß | trägt |
| Horizont `#4a6f8c` | +4 | 70° | **schwach in der Helligkeit** — siehe unten |
| **Braune Erde `#6b4a2e`** | +15 | **113°** | **trägt deutlich** — nahezu gegenüber |
| Haut `#f4d7ac` | −38 | groß | trägt |
| Werkzeuggelb `#ffd23f` | −37 | 230° | trägt |
| Blockerorange `#ff7a45` | −17 | 260° | trägt |
| Gefahrenrot `#ff4d4d` | −10 | **275°** | trägt |
| Oberteil `#2fc9b8` | −22 | 100° | trägt |
| Hose `#3d5b78` | +12 | 65° | trägt; berührt es ohnehin nie |

**Was der Wechsel von Rot auf Violett gewinnt — und was er kostet:**

1. **Er löst die engste Paarung der ganzen Palette.** Haar und Gefahrenrot lagen 4
   Farbtongrade auseinander; jetzt sind es 275. Die Sonderregel, die deshalb nötig war —
   den Sprengmeister nie über den Farbton auszuzeichnen —, bleibt trotzdem stehen, aber sie
   trägt nicht mehr allein.
2. **Er löst die Paarung, die im Spiel am häufigsten vorkommt.** Braune Erde liegt auf dem
   Farbkreis bei rund 30 Grad. Rot stand 24 Grad daneben, also fast im selben Farbton, und
   wurde allein vom Helligkeitssprung getragen. Violett steht 113 Grad entfernt — nahezu
   gegenüber. Genau dort läuft die Figur die meiste Zeit.
3. **Der Preis steht am Horizont.** Gegen das helle Blau am Horizontband `#4a6f8c` bleiben
   nur 4 Helligkeitsstufen. Getragen wird das vom Farbtonabstand von 70 Grad, vom
   geschlossenen Umriss und vor allem vom **Glanzband** `#c98bff` (L\* 68), das dort +23
   gewinnt. **Daraus folgt bindend:** Die oberste Haarzeile ist immer der Glanzton, in jedem
   Bild, in jedem Zustand. Ohne sie verliert die Figur genau in Kopfhöhe ihre Kante.
4. **Eine Folgeänderung war nötig.** Die gebauten Stufen der Kristallwelt standen auf
   `#a06be0` — derselbe Farbton wie das Haar. Eine Brücke hätte dort ausgesehen wie eine
   Reihe Köpfe. Sie sind jetzt bernsteinfarben `#d59a4a`; warm gegen die kalte Höhle ist
   ohnehin das bessere Signal für „von Hand gebaut".

Die Lavawelt bleibt der Fall, den keine Haarfarbe allein löst: **Dort liegt das Terrain
hinter den Figuren unter L\* 30**, das Leuchten sitzt in der Lava und im Vordergrund, nicht
in der Wand, auf der gelaufen wird.

Die frühere Entscheidung, zum Nachlesen:

**Entscheidung (überholt): Beerenrosa `#9d4edd`.**

Die Begründung in einem Satz: Beerenrosa ist der einzige geprüfte Ton, der auf beiden echten
Hintergründen einen vollen Helligkeitsschritt gewinnt (+32 über Erde, +56 über Nachthimmel)
und gleichzeitig **dunkler** als Haut und Werkzeuggelb bleibt (−21 bzw. −19) — es hebt sich
also nach unten von Kopf und Werkzeug ab und nach oben vom Hintergrund, was bei jeder
helleren Wahl unmöglich ist.

Die längere Begründung ist ein Ausschlussverfahren durch den Farbkreis, und sie ist der
eigentliche Grund, warum die Entscheidung nicht beliebig ist:

- **Gelb bis Orange (20°–60°)** ist im Spiel als Werkzeug- und Ausrüstungsfarbe vergeben,
  dazu liegt dort die Haut. Gesperrt.
- **Grün (90°–150°)** ist gesperrt.
- **Türkis (150°–200°)** ist der Anzug. Gesperrt.
- **Blau (200°–250°)** sind Himmel, Fels und drei von sechs Welten. Gesperrt.
- **Violett (250°–300°)** ist der Kristallakzent `#a06be0`. Gesperrt für Welt 2.
- **Rot (0°–20°)** ist Gefahrenrot `#ff4d4d` und Lava. Gesperrt.
- Übrig bleibt das **Magenta-Rosa-Fenster von 300° bis 350°**. Innerhalb dieses Fensters
  entscheidet nur noch die Helligkeit, und die liegt bei Beerenrosa mit L\* 66,8 genau
  zwischen dem hellen Kopf (87) und dem dunklen Hintergrund (10–39).

**Zwei ehrliche Einschränkungen**, die man kennen sollte:

1. **Blockerorange `#ff7a45` hat L\* 66,2** — praktisch derselbe Helligkeitswert wie das
   Haar, bei nur 47° Farbtonabstand. Rosa Haar und orange Paddel liegen auf demselben
   Tonwert. Unschädlich, weil sie an verschiedenen Orten sitzen (Kopf gegen Brusthöhe) und
   weil das Blockersignal die T-Silhouette ist, nicht die Farbe — aber im Graustufentest
   sieht man es, und man muss wissen, dass man es dort sieht.
2. **Kristallviolett `#a06be0`** liegt 11 L\* unter dem Haar. Das ist die Farbe der gebauten
   Stufen in Welt 2 — kleine, waagerechte, ein Pixel hohe Reihen. Kein Flächenkonflikt, aber
   der einzige Ort im Spiel, an dem Haar und Terrain sich tonwertlich nähern.

### 3.2 Die Haarrampe

| Rolle | Farbe | L\* | bei 12 px sichtbar? |
|---|---|---|---|
| Glanz / Rim oben | `#c98bff` | 70,7 | ja, **die tragende Zeile** — nie weglassen |
| Grundton | `#9d4edd` | 51,3 | ja, die Hauptfläche |
| Schatten unten und hinten | `#67219c` | 31,4 | ja, **1 Pixel** |

Drei Stufen, mehr nicht. Sie sind im Spiel als `HAIR_LIGHT`, `HAIR`, `HAIR_DARK` in
`src/render/sprites.ts` gesetzt und weltunabhängig: Das Haar wird **nie** je Welt umgefärbt,
sonst verliert es seine Funktion als Wiedererkennungsmerkmal.

**Abweichung vom Ankerbild, mit Grund:** Dort ist das Glanzband `#ff8a75`. Bei einer Zeile
Höhe entscheidet aber der Helligkeitssprung zum Untergrund, und `#ff8a75` gewinnt über
brauner Erde zu wenig. `#c98bff` gewinnt dort einen vollen Schritt und bleibt innerhalb der
roten Rampe. Weiter Richtung Orange darf es nicht — dann nähert es sich dem Werkzeuggelb.

### 3.3 Die Frisur

Verbindlich, damit alle 85 Prompts dieselbe Figur beschreiben:

- **Eine aufrecht stehende Mähne aus vielen spitzen Strähnen unterschiedlicher Länge**, die
  aus der ganzen Kopfhaut wächst, sich überkreuzen und eine zerzauste Kante bilden. Keine
  Seitenscheitel, keine Pony-Fransen ins Gesicht, keine Zöpfe, kein Pferdeschwanz mit Band.
  Es ist absichtlich viel zu viel Haar für so ein Wesen — dieses Zuviel *ist* die Figur.
- **Ruhemaß: bis 6 Pixel über dem Scheitel, bis 8 neben der Körpermitte.** In Bewegung bis
  8 über und 11 neben — das sind zugleich die Grenzen, die die Zelle 28 × 28 hergibt
  (`grafik-ankerbild-a0.md` §4.3).
- **Die Lage der Masse erzählt den Zustand.** Haar steht der Bewegung entgegen: Beim Laufen
  weht es nach hinten, im Fall steht es senkrecht nach oben, beim Stehen und Arbeiten hängt
  es. Das ist derselbe Gedanke wie beim Blockersignal — Lage statt Farbe. Verbindlich für
  alle Zustandsblätter in §7.
- **Die Mähne ist eine geschlossene Masse, keine Einzelhaare.** Bei 12 Pixeln ist ein
  Einzelhaar unsichtbar; die Silhouette muss aus einem Stück bestehen und den Umriss tragen.
  Die Zerzaustheit entsteht am Rand der Masse, nicht durch Lücken darin.
- **Die Stirn bleibt frei.** Das obere vordere Viertel der Kopfkuppel wird nicht von Haar
  bedeckt — dort sitzt der Kletterhelm (§8.1). Die Mähne tritt hinter dem hinteren Helmrand
  wieder hervor; das ist die einzige Stelle, an der Haar und Helm sich begegnen, und sie ist
  so gebaut, dass beide sichtbar bleiben.
- **Ab der Scheitelzeile abwärts bleibt Haar hinter dem Kopf.** Das Gesicht ist die zweite
  tragende Fläche der Figur und darf nicht zuwachsen — sonst liest die Figur als roter
  Pilz. Über dem Scheitel darf die Masse nach vorn übergreifen, darunter nicht.
- **Kein Seitenmerkmal.** Der Renderer spiegelt das Sprite. Eine Strähne, die nur links
  liegt, liegt nach dem Spiegeln rechts und sieht falsch aus. Die Mähne ist deshalb in
  reiner Seitenansicht definiert und ansonsten symmetrisch gedacht.
- **Das Haar ist bei allen Figuren gleich.** Es unterscheidet keine Berufe (§3.4) und keine
  Individuen. Es ist das gemeinsame Erkennungszeichen der Art.

### 3.4 Das Haar darf die Berufsablesung nicht kaputt machen

GDD §6 verlangt: Jeder Beruf ist an der Silhouette erkennbar, nicht an der Farbe. Das Haar
ist ein Merkmal, das **alle** Figuren teilen — es kann also per Definition keinen Beruf
kennzeichnen und darf keinen verdecken. Vier Sperrzonen, in jedem Prompt wiederholt:

| Regel | Zahl | Warum |
|---|---|---|
| Haar bleibt **innerhalb ±3 logischer Pixel** von der Mittellinie | ±3 | Die Berufsmerkmale reichen weiter: Blockerarme ±6, Schirmdach ±6, Bauplanke +8, Hammer +7, Spitzhacke +7, Schaufel ±4. Bliebe das Haar nicht schmaler, würde es an der Silhouettenbreite mitreden. |
| Haar reicht **nie unter die Schulterlinie** | `y−8` | Darunter liegen Gürtel, Bombenandockpunkt (`belly`) und die Balkenhöhe des Rammers. Diese Zone bleibt frei. |
| Haar reicht **nie mehr als 4 Pixel über den Scheitel** | oberste Haarzeile `y−16`, Scheitel `y−12` | Darüber beginnt der Bereich des Schirmdachs (Oberkante `y−18`, `grafik-integration.md` §2.1). Der Schirm ist die Silhouette des Schirmspringers und muss allein oben stehen; es bleiben 2 Pixel Luft dazwischen. |
| Haar **kreuzt die Mittellinie nach vorn** nur in drei benannten Bildern | `bashing` 1, `digging` 1, `building` 1 | Genau dort ist der Vorwärtsschwung die Aussage. Überall sonst würde vorn hängendes Haar mit dem Werkzeug konkurrieren. |

**Der Prüftest dazu** (gehört in die Abnahme, §19): Alle zehn Berufe schwarz füllen, auf
12 Pixel herunterrechnen, nebeneinanderlegen. Sind sie noch zu zehnt unterscheidbar? Danach
das Haar entfernen und den Test wiederholen. **Beide Durchläufe müssen dasselbe Ergebnis
liefern.** Wenn das Haar den Test verbessert, ist es zu berufsspezifisch; wenn es ihn
verschlechtert, ist es zu groß.

### 3.5 Das Mitschwingen — Animationsregel

Das Haar ist kein Aussehen, sondern ein **Verhalten**. Zwei Grundregeln, aus denen sich
alles Weitere ableitet:

> **Regel 1 — Nachlauf.** Das Haar liegt immer **ein Bild hinter dem Kopf**. Seine Stellung
> im Bild *n* ist die Reaktion auf die Kopfbewegung zwischen Bild *n−2* und *n−1*, nicht auf
> die im Bild *n*.
>
> **Regel 2 — Überschwingen.** Wo der Körper **hart stoppt**, schwingt das Haar **über die
> Endlage hinaus** und kommt erst ein Bild später zurück. Die harten Stopps im Spiel sind:
> Hammeraufprall, Hackenbiss, Schaufelbiss, Planke abgelegt, Aufsetzen nach dem Fall,
> Zusammenbruch.

Aus beiden zusammen folgt die praktische Merkregel für das Nachpixeln: **Das Haar bewegt
sich gegenläufig zum Kopf und mit einem Bild Verspätung.** Ein Haar, das sich synchron mit
dem Kopf bewegt, wirkt wie ein aufgeklebter Klotz — das ist der häufigste Fehler.

Die Zustandsblätter in §7 tragen die Regel jeweils ausformuliert. Hier die Übersicht; die
Bildzahlen sind die aus `grafik-integration.md` §2.3 und werden nicht verändert:

| Clip | Bilder | Was das Haar tut | Regel |
|---|---|---|---|
| `walking` | 8 | Gegenphase zum Kopfnicken: Kopf am tiefsten → Haar am höchsten. Dauerhaft 1 px nach hinten geschleppt, im Scheitelpunkt 2 px. | Nachlauf |
| `falling` | 4 | Senkrecht nach oben gerissen, maximal gestreckt, fächert zwischen den Bildern um 1 px auf und zu. | Fahrtwind, kein Nachlauf |
| `floating` | 4 | Folgt der Schirmneigung **um ein Bild verzögert**: Dach kippt in Bild 2 → Haar folgt in Bild 3. Der lehrbuchhafte Fall der Regel 1. | Nachlauf |
| `climbing` | 4 | Hängt von der Wand weg nach hinten. Pumpt 1 px hoch bei jedem Griff (Bild 1 und 3), sackt bei jedem Nachfassen (2 und 4). | Nachlauf |
| `hoisting` | 6 | Bild 1 hängt senkrecht herab. Bilder 2–3 hochgerissen. Bild 3–4 klappt **nach vorn übers Gesicht** — das komische Bild. Bilder 5–6 legt sich zurück; Bild 6 ist **völlig still**. | Überschwingen, dann Ruhe |
| `building` | 8 | Schwingt beim Vorbeugen (5–7) nach vorn, beim Aufrichten (2–4) nach hinten. In Bild 1 (Planke liegt) **überschwingt es 1 px über die Stirn**, in Bild 3 zurück. | Überschwingen |
| `bashing` | 3 | Bild 1 Aufprall: Haar schießt **nach vorn über den Kopf**. Bild 2 Rückstoß: nach hinten geschleudert, am weitesten hinten. Bild 3 Ausholen: Körper geht zurück, Haar bleibt noch vorn. | Überschwingen, stärkster Fall |
| `mining` | 4 | Bild 1 Hieb: Haar peitscht **nach vorn und unten** mit der Diagonale. Bild 2 hält. Bild 3 löst sich. Bild 4 Ausholen: weit nach hinten-oben. | Überschwingen |
| `digging` | 3 | Bild 1 Biss: Haar fällt **nach vorn über das Gesicht**, tiefster Punkt. Bild 3 Wurf: nach hinten-oben geschleudert. Der größte Sprung liegt zwischen 1 und 2, passend zur Haltedauer 3-2-2. | Überschwingen |
| `blocking` | 2 | Die **einzige** Bewegung des ganzen Clips: Bild 2 hebt nur die Haarspitzen um 1 px. Körper, Arme und Paddel sind byte-identisch. | Atem |
| `saving` | 6 | **Einzige Ausnahme von Regel 1:** Das Haar geht **voraus**. Bild 2 richtet es sich schon auf, während die Fersen noch kaum vom Boden sind. Bild 6 steht es senkrecht und ist das höchste Element. | Anführen statt Nachlaufen |
| `dying` | 8 | Bild 1–2 im Schreck hochgerissen, Bild 3–4 stürzt mit ein, Bild 4 flach ausgefächert. **Ab Bild 6 vollkommen bewegungslos** — und zwar bevor der Körper zur Ruhe kommt. | Überschwingen, dann Totenstille |

**Warum die Ausnahmen wichtiger sind als die Regel:** `saving` und `dying` sind die beiden
emotionalen Auszahlungen des Spiels (GDD §2). Dass das Haar bei der Rettung **vorausgeht**
und beim Tod **zuerst stehen bleibt**, ist das, was diese 18 bzw. 26 Ticks über die reine
Bewegung hinaushebt. Ein Haar, das überall gleich nachschwingt, ist ein Effekt; eines, das
an zwei Stellen die Regel bricht, ist Gestaltung.

### 3.6 Was das Mitschwingen kostet und was der Code nicht kann

Ehrlich, damit die Planung stimmt:

- **Das Haar braucht keine eigene Ebene und keinen Code.** Es wird in jedes Körperbild
  eingebacken. Die Bildzahl bleibt bei 60 (`grafik-integration.md` §2.3), es kommt kein
  einziges Bild dazu. Das ist der Grund, warum diese Lösung überhaupt tragbar ist.
- **Der Nachlauf kostet Nachbearbeitungszeit, keine Laufzeit.** Beim Nachpixeln muss man
  jedes Bild zweimal ansehen: einmal für den Körper, einmal für das Haar mit Blick auf das
  vorige Bild. Rechnen Sie beim Laufzyklus mit einer zusätzlichen Stunde gegenüber der
  Schätzung in `grafik-prompts.md` §11.
- **Beim Richtungswechsel kann das Haar nicht nachschwingen.** `hitWall()` kippt nur `w.dir`
  und bleibt in `WALKING` (`grafik-integration.md` §2.4). Die Figur wird in **einem** Tick
  gespiegelt, das Haar springt also von hinten-links nach hinten-rechts. Es gibt genau zwei
  Möglichkeiten: den Sprung hinnehmen — bei 12 Pixeln und 20 px/s fällt er kaum auf — oder
  einen Zustand `TURNING` in `types.ts` und `world.ts` einführen und ihm 2 bis 3 Bilder
  geben. Das ist eine **Simulationsänderung** und damit keine Grafikaufgabe. Empfehlung:
  hinnehmen, bis ein Spieltest etwas anderes sagt.
- **Die Bildmodelle liefern das Mitschwingen nicht.** Sie liefern acht Bilder mit acht
  zufälligen Haarstellungen. Der Nachlauf entsteht beim Nachpixeln von Hand oder über den
  3D-Weg (§17). Siehe §18.

---

## §4 Referenzbilder — die Ankerkette

Die Frage, die über die Stimmigkeit von 85 Prompts entscheidet, ist nicht die Formulierung
der Prompts, sondern: **Welches Bild erzeugt man zuerst, und was reicht man weiter?**
Ohne Ankerbilder ergeben 85 Prompts 85 verschiedene Figuren — das passiert zuverlässig und
ist der teuerste Fehler in diesem Projekt.

### 4.1 Die fünf Anker

Die Kette ist absichtlich flach: **fünf Ankerbilder für alles.** Jeder Anker wird genau
einmal erzeugt, hart abgenommen und danach nie wieder verändert.

| Anker | Bild | Erzeugt mit | Beliefert |
|---|---|---|---|
| **A0** | Figurenblatt (§6.1) | keiner Referenz — das erste Bild überhaupt | jeden Prompt, in dem eine Figur vorkommt |
| **A1** | Turnaround (§6.2) | A0 | Tripo (§17.1), Ausdrucksblatt, Nachzeichnen |
| **A2** | Werkzeugtafel (§6.3) | A0 (für Strichstärke und Palette) | alle Berufsblätter (§9), alle Anbauteile (§8), alle Symbole (§15.1/§15.2) |
| **A3** | Materialtafel Grasland (§12.1) | keiner Referenz | alle Terrainkacheln (§11), alle fünf weiteren Weltmaterialien |
| **A4** | Parallax Grasland (§12.2) | A3 | alle fünf weiteren Parallaxblätter, beide Store-Keyarts, Ladebild |

**Reihenfolge der Erzeugung, verbindlich:** A0 → A1 → A2 → A3 → A4. Erst danach beginnt die
Serienproduktion. Wer A0 nicht abgenommen hat, darf keinen zweiten Prompt starten.

### 4.2 Warum A0 zuerst und was seine Abnahme bedeutet

A0 ist das einzige Bild dieses Katalogs, das **ohne** Referenz entsteht — es *ist* die
Referenz. Deshalb wird es nicht nach Gefallen abgenommen, sondern nach vier Messungen:

1. **Der 12-Pixel-Test.** A0 auf 12 Pixel Höhe herunterrechnen (nearest neighbour), auf
   einem Telefon ansehen. Sind Kopf, Haar und Stiefel als drei getrennte Massen erkennbar?
2. **Der Graustufentest.** Farbe entfernen. Trennen sich Haar und Kopf noch? (Sie müssen —
   ΔL\* 20,6, §2.6.)
3. **Der Proportionstest.** Kopfhöhe messen. Sie muss **42 % ± 4 %** der Figurenhöhe
   betragen (§2.1).
4. **Der Rechtstest.** Kein grünes Haar, keine Kutte, keine Kapuze, keine Ähnlichkeit zu
   einer geschützten Figur.

Ein A0, das eine dieser vier Prüfungen nicht besteht, wird **neu erzeugt, nicht repariert.**
Jede spätere Korrektur an A0 macht alles ungültig, was danach entstanden ist.

### 4.3 Wie man den Anker weiterreicht

Praktisch, ohne Werkzeugnamen zu erfinden: Bildmodelle nehmen in der Regel ein oder mehrere
Bilder als Eingabe entgegen — je nach Oberfläche als Anhang, als Stilreferenz oder als
Bildeingabe eines Bild-zu-Bild-Modus. Welche dieser Möglichkeiten im eigenen Zugang zur
Verfügung steht, gehört in der Oberfläche nachgesehen; **dieser Katalog nennt bewusst keine
Parameternamen.**

Drei Arbeitsregeln, die unabhängig vom Werkzeug gelten:

1. **Höchstens zwei Referenzbilder gleichzeitig.** A0 plus höchstens ein zweites (meist A2).
   Mehr Referenzen mitteln die Modelle zu einem Durchschnitt, und der Durchschnitt aus drei
   Bildern ist keines von ihnen.
2. **Serienweise arbeiten, nicht einzeln.** Alle zehn Berufsblätter an einem Tag, mit
   derselben Referenz und derselben Einstellung. Ein Beruf, der drei Wochen später
   nachgezogen wird, sieht anders aus — auch bei identischem Prompt.
3. **Zu jedem behaltenen Asset speichern:** vollständiger Prompt, verwendete Referenzbilder,
   Datum, Werkzeug und — falls das Werkzeug einen anbietet — der Zufallswert. Ohne diese
   Notiz ist eine Nachgenerierung in drei Monaten unmöglich.

### 4.4 Die Referenzangabe in jedem Prompt

Jeder Prompt dieser Datei trägt über dem Codeblock eine Zeile:

> **Referenz: A0** — oder A1/A2/A3/A4, oder **keine (Ankerbild)**.

Steht dort ein Anker, wird das Bild als Referenz mitgegeben. Steht „keine", wird ohne
Referenz erzeugt. Die Angabe ist Teil des Prompts und nicht optional.

---

## §5 Die Blöcke — wörtlich voranstellen

Fünf Textblöcke, die vor bzw. hinter die Einzelprompts gesetzt werden. **Wort für Wort
kopieren, nicht paraphrasieren, nicht kürzen.** Die Einzelprompts in §6 bis §17 sind so
geschrieben, dass sie auch allein funktionieren — die Blöcke verbessern die Trefferquote
deutlich, sind aber keine Lücke, die erst gefüllt werden müsste.

Reihenfolge: `[STILBLOCK K oder U]` → `[BLATTVERTRAG]` (nur bei Zustandsblättern) →
Einzelprompt → `[PALETTENSPERRE]` → `[NEGATIVPROMPT]`.

### 5.1 Stilblock K — Figuren, Objekte, Symbole

Ersetzt Stilblock A aus `grafik-prompts.md` §1.1. Zwei Änderungen gegenüber jenem: die
Konturstärke ist auf 8 Masterpixel korrigiert (§2.5), und die Lesbarkeitsgrenze ist von
16 auf **12 Pixel** verschärft, weil das die tatsächliche Figurenhöhe ist.

```
STYLE BLOCK K — WUSELWERK CUDDLY SPRITE STYLE

High-resolution pixel art rendered at 8x master scale, in the modern
pixel-art tradition where sprites are sculpted with volume rather than
flat-shaded. Chunky, soft, rounded, huggable forms with generous mass and
no thin or spindly parts anywhere.

Cuteness comes from proportion, never from fine detail: oversized head,
short limbs, wide stance, heavy rounded volumes. Every silhouette corner is
softened by exactly one pixel of diagonal at final size — a single-step
bevel, never a multi-step curve. Tools, machines and terrain are the
opposite: hard, angular, square-cornered. That contrast between the round
creature and the angular object is the core of the look and must be
obvious.

Outline: one single hard near-black #0c1119 contour, closed all the way
around the silhouette including the hair, exactly 8 pixels thick at this 8x
master scale so that it becomes exactly one pixel after downscaling. Never
thinner, never a gradient, never tinted, and no interior outlines between
body parts — separation between adjacent areas is carried by a brightness
step of at least fifteen L* units, not by a dividing line.

Palette: strictly limited, about 20 to 24 indexed colours, high saturation
permitted because the coloured areas are only a few pixels wide, but every
adjacent pair of areas must differ clearly in brightness, not only in hue.
The design must survive being converted to greyscale.

Lighting: soft key light from almost directly overhead with only a very
slight bias to the left, a cool ambient fill from below, and one narrow
bright rim along the topmost edge. No side lighting, no cast shadow, no
ground shadow, no contact shadow — sprites get mirrored horizontally by the
engine and any directional shadow would flip with them.

Rendering: crisp hand-crafted pixel clusters on a strict square pixel grid.
No half-pixels, no anti-aliasing inside flat areas, soft anti-aliasing
permitted only on the outer silhouette edge. Visible ordered dithering only
in large gradients. No airbrush softness, no vector smoothness, no glossy
plastic sheen, no bloom.

Readability rule, non-negotiable and more important than any other
instruction here: the shape must remain unmistakable when downscaled to 12
pixels tall. Silhouette carries all information; colour is decoration only.
```

### 5.2 Stilblock U — Umgebungen, Parallax, Keyart

```
STYLE BLOCK U — WUSELWERK ENVIRONMENT STYLE

High-resolution painterly pixel art, side-scrolling platform-game
perspective, strictly orthographic side view with no vanishing point and no
perspective convergence.

Modern dynamic lighting layered over a pixel base: volumetric light shafts,
coloured bounce light, atmospheric haze that desaturates and lightens with
distance, and gentle depth-of-field blur on the farthest layers only.

Mood: warm, inviting and slightly toy-like even where the world is
dangerous. Rounded, generous shapes in the landscape silhouettes; nothing
spiky, nothing grim, nothing gothic. The world should look like a place
where small round creatures live, not like a ruin.

Palette discipline: 24 to 32 indexed colours per layer, deliberate value
separation between depth layers so each layer reads as its own plane even
in greyscale. Foreground darkest and most saturated, distance progressively
lighter, cooler and hazier.

Rendering: hand-painted pixel clusters, visible ordered dithering in
gradients and fog, hard silhouette edges on nearby geometry, softened edges
in the far distance. Composition leaves the horizontal centre band calm and
uncluttered — gameplay happens there and must stay legible.

No characters, no creatures, no text, no logos, no UI elements, no
foreground props unless explicitly requested.
```

### 5.3 Blattvertrag — vor jedes Zustandsblatt in §7

Übernimmt die Geometrie aus `grafik-integration.md` §2 und §3.0 unverändert. Die einzige
Ergänzung ist der Absatz zum Haar.

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
tall from the ground contact line upward, not counting the hair. These
values do not vary between frames for any reason; the whole sheet must
overlay perfectly when the cells are stacked.

Body proportions, identical in every frame: head 40 pixels tall, torso 40
pixels tall, boots 16 pixels tall, all 32 pixels wide, measured at this
master scale. The head is the largest single mass of the figure.

Hair, present in every frame: a single upswept mane of many overlapping
pointed strands of different lengths rising from the crown, in vivid violet, base tone #9d4edd,
highlight #c98bff along the topmost edge, shadow #67219c underneath. At
rest it reaches 48 pixels above the crown and 64 pixels behind the back of
the head at this master scale; in motion up to 56, and never more than 64.
The hair is one closed mass carrying its own outline, never individual
strands of hair. It never touches the suit, never reaches below shoulder
height, and never extends more than 88 pixels left or right of the centre
line. The front upper quarter of the head dome stays clear of hair.

Nothing may cross a cell border. Tools, limbs, hair and equipment stay
inside their own cell.

Direction: strict orthographic side view facing right in every frame. Only
this one direction is drawn. The engine mirrors the sprite horizontally for
the other direction, so the design must survive being flipped: no writing,
no numerals, no asymmetric badge, no marking or hair detail that only makes
sense on one side.

Lighting: a soft key light from almost directly above with only a very
slight bias to the left, a cool ambient fill from below, and a thin bright
rim along the top of the hair. No strong side lighting, no cast shadow, no
ground shadow, no contact shadow.

Background: fully transparent. No ground, no terrain, no wall, no props, no
backdrop, no dust and no particles unless the frame description explicitly
asks for them — particles are separate assets composited by the engine.

Readability rule, non-negotiable: the silhouette must remain unmistakable
when the cell is downscaled to 24 by 24 pixels and the figure is therefore
12 pixels tall. Silhouette carries all information.
```

### 5.4 Palettensperre — hinter jeden Prompt

Erweitert den Block aus `grafik-prompts.md` §1.4 um die vier Haarwerte.

```
PALETTE LOCK — WUSELWERK

Character: hair vivid violet #9d4edd, hair highlight #c98bff, hair shadow
#67219c, hair deep shadow #5c1210, skin warm sand #f4d7ac, suit teal
#2fc9b8, deep suit teal #1d8f85, equipment amber #ffd23f, outline
near-black #0c1119, blocker warning orange #ff7a45, danger red #ff4d4d.

Grassland terrain: soil brown #6b4a2e, grass crust #4f8f3c, rock grey
#565d6b, indestructible steel #8b96a6, built brick step #b5713f, warm glow
#ffd98a.

Grassland sky and parallax: sky top #101c33, sky at horizon #3d5f7d, far
hills #1b2f42, mid hills #24415a, near hills #2f5570.

Crystal cave: soil #3e4a72, glowing crust #6f8ad6, rock #35405f, crystal
violet #a06be0, cold glow #9fd8ff, sky top #0a0f22, sky bottom #1d2b52.

Particles: dig dust #8a6236, brick chips #c98a52, steel sparks #ffe9a8,
explosion flame #ff9a3c, explosion smoke #5a5a5a, rescue sparkle #ffe98a.

UI: panel #0e131c, raised panel #18202e, hairline #27334a, text #dce6f5,
dimmed text #7b8ba3, accent amber #ffd23f, success #4fd18b, failure
#e05a4a.

Use these values as the indexed palette. Do not introduce additional hues
outside this set except for light bloom and particle sparks. The hair
colour is never re-tinted per world.
```

### 5.5 Negativprompt — an jeden Prompt

Bei Modellen ohne eigenes Negativfeld als Absatz mit dem Vorsatz „Avoid the following:"
anhängen.

```
NEGATIVE PROMPT — WUSELWERK

green hair, blue robe, blue hooded gown, green-haired creature, hooded
tunic, cowl, cloak, cape, small green-haired mascot, any recognisable
existing game character, existing franchise mascot, licensed character,
brand logo, trademark, watermark, signature, artist signature

long flowing hair, individual hair strands, wispy hair, ponytail, braid,
pigtails, hair covering the eyes, fringe over the forehead, beard,
moustache, eyebrows as separate hairs, fur, feathers

vector art, flat vector illustration, smooth vector shapes, corporate flat
design, clip art, sticker style, glossy 3D mobile-game render, cel-shading,
calarts style, chibi anime, kawaii sticker, plush toy photograph

blurry, smeared, soft focus on the subject, anti-aliased interior, mixed
pixel sizes, inconsistent pixel grid, upscaling artefacts, JPEG artefacts,
noise, film grain, chromatic aberration, lens flare, bloom on sprites

photorealistic, realistic human proportions, detailed facial features,
teeth, fingers, text, letters, numbers, captions, speech bubbles, UI
overlay, health bar, drop shadow, cast shadow on transparent background,
checkerboard pattern rendered as image content, busy background, cluttered
composition, perspective distortion, three-quarter camera, isometric view
```

---

## §6 Die Ankerbilder

### 6.1 A0 — Figurenblatt

**Erledigt.** Die Ankerfigur steht, und zwar zweifach: als durchgegangene Erzeugung und als
daraus gebautes 3D-Modell `art-src/wuselwerker-v4.glb`.

Der Prompt, der sie erzeugt hat, steht **wörtlich in `grafik-ankerbild-a0.md` §2** — dort
und nur dort, damit es keine zweite, langsam abweichende Fassung gibt. Wer die Figur neu
erzeugen muss, nimmt diesen Text.

Drei Dinge daraus, die für alle folgenden Prompts dieser Datei gelten:

1. **Keine Ausschlussliste.** Vier Anläufe wurden vom Filter abgewiesen; der wahrscheinliche
   Auslöser war die Ausschlussliste selbst, nicht das Beschriebene. Der Negativprompt aus
   §5.5 wird deshalb **nicht mehr angehängt** — alle Abgrenzungen werden positiv formuliert.
   Die Herleitung steht in `grafik-ankerbild-a0.md` §2.1.
2. **Die Figur heißt intern Wusel und ist ein Troll.** Gutmütig, kurz, stämmig, Kopf von
   knapp halber Körperhöhe, weit auseinanderstehende Augen mit je einem Glanzpunkt, breites
   geschlossenes Grinsen.
3. **Der Overall ist beschrieben, nicht nur benannt:** Rollkragen, umgeschlagene
   Ärmelaufschläge, schmaler Bundstreifen, Beinnaht, Stiefel mit umgeschlagenem Rand.

### 6.2 A1 — Turnaround, vier Ansichten

Dient nicht dem Spiel — das Spiel ist reine Seitenansicht — sondern dem 3D-Modell (§17.1)
und dem Nachzeichnen. Entscheidend ist, dass der Haarschopf aus allen vier Richtungen
dieselbe Masse hat, sonst wird das Modell an der Rückseite unbrauchbar.

> **Referenz: A0.**

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Four-view turnaround sheet of the Wusel creature: a small stocky worker,
two and a half heads tall, oversized softly rounded head with warm sand
skin #f4d7ac taking up over forty percent of the body height, large round
solid black dot eyes set low and wide apart, tiny mouth line, a single
upswept mane of thick vivid violet hair #9d4edd with highlight #c98bff
and shadow #67219c rising from the crown, one-piece teal work suit #2fc9b8
with rounded shoulders and a thin darker collar line, stubby mitten arms,
blunt dark teal boots #1d8f85, hard near-black outline #0c1119.

Layout: exactly four figures in a single horizontal row, evenly spaced,
left to right: front view, right side view facing right, rear view, three-
quarter front-right view. All four identical in height, all standing on the
same horizontal ground line, all in a relaxed neutral pose with arms held
slightly away from the body so the torso outline stays readable.

Consistency is critical: identical proportions, identical palette,
identical eye size and placement, and above all an identical hair mass in
every view. The mane is symmetric about the creature's own centre plane —
in the front view it appears as a wide red cap rising behind the head, in
the side view as a backward-swept wedge, in the rear view as the largest
red shape of the sheet covering the back of the skull, and in the three-
quarter view as a combination of both. It must never look like a different
hairstyle from one view to the next.

The rear view shows a plain suit back with a single horizontal seam, no
logo, no backpack, no printed marking. The front upper quarter of the head
dome stays clear of hair in every view.

Lighting: flat neutral frontal illumination with only mild form shading, so
the sheet can be used as modelling reference. Minimise cast shadow.

Master scale: each figure 96 pixels tall from boot underside to crown, not
counting the hair, canvas 640 by 160 pixels, fully transparent background,
no ground line drawn. Aspect ratio 4:1.
```

### 6.3 A2 — Werkzeugtafel

Alle zehn Werkzeuge nebeneinander, **ohne Figur**. Das ist der Anker für sämtliche
Berufsblätter, Anbauteile und Symbole. Ein Werkzeug, das hier festgelegt ist, sieht in allen
folgenden dreißig Prompts gleich aus.

> **Referenz: A0** (nur für Strichstärke, Umriss und Palette — keine Figur im Bild).

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Tool and equipment board for a pixel-art puzzle game: exactly ten chunky
cartoon work props, each drawn on its own, no character anywhere in the
image.

Layout: exactly 10 cells in one single horizontal row, equal cells, no
gaps, no borders, no separators, no labels, no text, no numbers. Each cell
is exactly 128 by 128 pixels. Canvas 1280 by 128 pixels, aspect ratio 10:1.
Each prop is centred in its own cell and fills about eighty percent of it.

Props, in reading order:
1 A hard angular climbing helmet in amber #ffd23f with a flat forward brim,
  a low crown ridge front to back, and one small round lamp centred on the
  front of the brim.
2 An open umbrella with a shallow amber #ffd23f dome canopy, six visible
  ribs, a darker amber underside, a short straight handle and a small
  finial on top.
3 A round cannonball bomb in near-black #0c1119 with one amber highlight
  arc, a collar at the top and a short curled fuse with a bright spark.
4 A wide rectangular signal paddle in warning orange #ff7a45 with a thin
  near-black border and a short grip.
5 A short wooden plank step in warm brick brown #b5713f with two nail heads
  and one chipped end.
6 A heavy sledgehammer with a short amber #ffd23f haft and a chunky
  rectangular near-black head.
7 A pickaxe with a long amber #ffd23f handle and a curved near-black
  double-pointed head.
8 A broad flat-bladed shovel with a short amber #ffd23f handle and a wide
  near-black blade, the blade wider than the handle is long.
9 A thick horseshoe magnet with squared pole tips, the body amber #ffd23f
  and the two pole tips near-black.
10 A pair of coiled steel jump springs, one compressed and one extended,
  each a tight helix in cool grey #8b96a6 with an amber #ffd23f mounting
  plate at the top.

Style, uniform across all ten: chunky, exaggerated, oversized relative to a
real tool, square-cornered and hard-edged — deliberately the opposite of
the soft rounded creature that carries them. Flat colour blocking, one
single hard near-black #0c1119 outline of even thickness around every prop,
exactly 8 pixels thick at this master scale. No engraving, no fine detail,
no wear texture, no text on any prop.

Lighting: soft key from almost directly overhead, cool fill from below, one
narrow rim on the topmost edge. No cast shadow.

Each prop must read as its own unmistakable silhouette when its cell is
downscaled to 16 by 16 pixels. Props 6, 7 and 8 are the three most easily
confused — exaggerate the differences: hammer head rectangular and blunt,
pick head curved and pointed at both ends, shovel blade broad and flat.

Fully transparent background, no ground, no shadow, no character, no hands.
```

### 6.4 Haarstellungsblatt

Kein Spielasset, sondern die Malvorlage für die zwölf Zustandsblätter. Es zeigt die acht
kanonischen Haarlagen aus §3.5 an einem unbewegten Kopf, damit man beim Nachpixeln nicht in
jedem Blatt neu erfinden muss, wie „nach vorn übergeschlagen" aussieht.

> **Referenz: A0.**

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Hair reference sheet for a small cartoon creature. The purpose of this
sheet is to define eight fixed positions of one single hairstyle. The head
is drawn only as a carrier and must be absolutely identical in all eight
cells; only the hair changes.

The head: one large smooth softly rounded skull dome with warm sand skin
#f4d7ac, seen in strict orthographic side view facing right, one large
round solid black dot eye set low on the face, a tiny neutral mouth line,
no ears, no nose, no neck, no body. Hard near-black outline #0c1119, 8
pixels thick at this master scale.

The hair: a single upswept mane of many overlapping pointed strands of different lengths
rising from the crown, one solid closed mass with its own outline, never
individual hairs. Vivid violet base tone #9d4edd, bright highlight #c98bff
along whichever edge currently faces upward, shadow #67219c on the
underside. The front upper quarter of the head dome stays clear of hair in
every cell.

Layout: exactly 8 cells in one single horizontal row, equal cells, no gaps,
no borders, no labels, no text. Each cell is exactly 192 by 192 pixels.
Canvas 1536 by 192 pixels, aspect ratio 8:1. The head is at the identical
position and identical size in all eight cells, its crown 48 pixels below
the top edge of the cell.

Cell 1 — REST: the mane swept back and slightly up, reaching 16 pixels
above the crown and 64 pixels behind the skull. This is the neutral state.
Cell 2 — TRAILING: the mane dragged further back and flattened, as if the
creature has just started walking forward. Lower and longer than rest.
Cell 3 — LIFTED: the mane raised, fuller and rounder, its tip curling
upward, as if the head has just dropped and the hair has not yet followed.
Cell 4 — STREAMING UP: the mane pulled almost vertically upward and
stretched thin, strands slightly fanned apart, the tallest cell of the
sheet at 64 pixels above the crown.
Cell 5 — OVER THE FACE: the mane thrown forward across the top of the head,
its tip hanging down in front of the brow but never covering the eye. The
only cell where hair crosses to the front.
Cell 6 — WHIPPED FORWARD AND DOWN: the mane thrown forward and downward
along the diagonal, tip pointing to the lower right, strands compressed.
Cell 7 — FANNED FLAT: the mane splayed sideways into a wide low fan barely
above the crown, the widest and lowest cell of the sheet.
Cell 8 — LIMP: the mane hanging down and back with no lift at all, strands
drooping together, completely lifeless.

Lighting: soft key from almost directly overhead, cool fill from below, a
narrow bright rim along the topmost hair edge in every cell. No cast
shadow.

Readability: each of the eight positions must still be distinguishable from
the others when the cell is downscaled to 24 by 24 pixels, where the hair
is only two or three pixels tall. That means the differences must be in
overall direction and mass, not in strand detail.

Fully transparent background, no body, no neck, no ground, no shadow.
```

### 6.5 Ausdrucksblatt

Für Zwischensequenzen, das Ergebnisbild und die Marketingbilder. **Kein Spielasset** — bei
12 Pixeln existiert Mimik nicht (§2.2, §2.3). Trotzdem nötig, weil Menüs und Store-Bilder
Gesichter zeigen und diese Gesichter dann zur Figur passen müssen.

> **Referenz: A1.**

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Expression sheet for the Wusel creature, for menus, result screens and
promotional images only. Head and shoulders, three-quarter front view
turned slightly to the right, identical framing in every cell.

The creature: an oversized softly rounded head with warm sand skin #f4d7ac,
two large round solid black dot eyes set low and wide apart, a tiny simple
mouth, no nose, no ears, a single upswept mane of thick vivid violet
hair #9d4edd with highlight #c98bff and shadow #67219c rising from the
crown, and the top of a one-piece teal work suit #2fc9b8 with a thin darker
collar line at the bottom of each cell. Hard near-black outline #0c1119, 8
pixels thick at this master scale.

Layout: exactly 9 cells in a 3 by 3 grid, equal cells, no gaps, no borders,
no labels, no text. Each cell is exactly 256 by 256 pixels. Canvas 768 by
768 pixels, aspect ratio 1:1.

Expressions, reading order left to right then top to bottom:
1 Neutral — calm, eyes wide open, mouth a small flat line, hair at rest.
2 Cheerful — eyes as happy upward arcs, wide open grin, hair lifted.
3 Oblivious — eyes half closed, mouth a tiny circle, head tilted, hair
  drooping to one side.
4 Startled — eyes at their largest with a thin ring of skin visible around
  them, mouth a small round shout, hair yanked straight up.
5 Determined — eyes narrowed to two horizontal bars, mouth a firm flat
  line, chin slightly raised, hair swept hard back.
6 Straining — eyes squeezed shut into tight arcs, mouth an open effort
  square, cheeks bunched, hair fanned outward.
7 Terrified — eyes huge and trembling, mouth a wide open wail, hair
  standing on end and splayed.
8 Delighted — eyes closed in two upward crescents, mouth an open beaming
  smile, hair bouncing upward at its fullest.
9 Exhausted — eyelids heavy and drooping, mouth a small wobbling line,
  head sunk between the shoulders, hair completely limp.

Emotion is carried by eye shape, mouth shape, head tilt and hair position
together — never by eyebrows, wrinkles, sweat drops, blush marks or any
comic-book symbol. There are no eyebrows on this creature.

Lighting: soft key from almost directly overhead, cool fill from below, a
narrow bright rim along the top of the hair. No cast shadow.

Fully transparent background, no ground, no props, no speech bubbles.
```

---

## §7 Zustandsblätter der Figur

**Bildzahl, Haltedauer und Zellgeometrie stehen in `grafik-integration.md` §2.3 und §3.0 und
werden hier nicht wiederholt.** Diese Blätter ersetzen die Bildbeschreibungen aus §3 jener
Datei — Maße und Takte bleiben unverändert.

Zwei Regeln aus der Integrationsdatei, die für das Verständnis der Blätter unerlässlich sind
und deshalb jeweils in Erinnerung gerufen werden:

- **Bild 1 ist das Wirkungsbild.** Der Arbeitstick fällt immer auf Index 0. Hammerschlag,
  Hackenhieb, Schaufelbiss und das Legen der Stufe liegen deshalb auf Bild 1.
- **Der Renderer bewegt die Figur, nicht das Blatt.** Kein Blatt zeigt Fortbewegung; die
  Grundlinie steht in jeder Zelle still.

Vor jedem dieser Prompts stehen `[STILBLOCK K]` und `[BLATTVERTRAG]`, dahinter
`[PALETTENSPERRE]` und `[NEGATIVPROMPT]`.

### 7.1 `walking` — 8 Bilder

Der meistgesehene Clip des Spiels. Das Haar arbeitet hier in **Gegenphase** zum Kopfnicken:
Wenn der Körper am tiefsten steht, ist das Haar noch oben, weil es der Bewegung um ein Bild
hinterherhängt. Das ist bei 12 Pixeln ein Versatz von einem Pixel — und genau dieser eine
Pixel ist der Unterschied zwischen „läuft" und „hüpft steif".

> **Referenz: A0.**

```
[PREPEND STYLE BLOCK K]
[PREPEND SHEET CONTRACT]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Walk cycle of the Wusel creature: a small stocky worker, two and a half
heads tall, oversized rounded head with warm sand skin #f4d7ac, one round
black dot eye set low, tiny mouth line, a upswept mane of thick
vivid violet hair #9d4edd with highlight #c98bff and shadow #67219c,
one-piece teal work suit #2fc9b8 with rounded shoulders, stubby mitten
arms, blunt dark teal boots #1d8f85, hard near-black outline #0c1119.

Exactly 8 frames in one row. Canvas 1536 by 192 pixels, aspect ratio 8:1.

The cycle covers two full steps. Read the frames as one continuous loop
where frame 8 leads seamlessly back into frame 1. The engine moves the
character forward — the frames must NOT show forward travel, the ground
contact line stays fixed.

Frame 1 — contact, left boot forward and flat, right boot behind and about
to leave the ground, torso upright, arms in mild opposition.
Frame 2 — down, weight over the front boot, body at its lowest, knees
absorbing.
Frame 3 — passing, rear boot swinging through directly beneath the body,
torso at mid height.
Frame 4 — up, body at its highest point of the cycle, rear boot rising for
the next contact.
Frames 5 to 8 — the identical motion with the legs and arms exchanged.

The head bobs by 16 pixels at this master scale between the lowest and the
highest frame, and never looks where it is going: it stays tilted a few
degrees down and forward throughout, cheerfully oblivious.

The hair, and this is the most important part of the sheet: the mane is
permanently dragged backward by the forward motion, sitting 16 pixels
further back than at rest, and it lags one frame behind the head. When the
body is at its lowest (frames 2 and 6) the hair is still at its highest and
fullest, lifted 56 pixels above the crown. When the body is at its highest
(frames 4 and 8) the hair has caught up and compressed down onto the crown,
only 8 pixels above it and dragged 24 pixels back. Frames 1, 3, 5 and 7 sit
between those two extremes. The hair therefore moves in opposition to the
head, never in step with it, and it must be visibly in a different position
in every single one of the eight frames.

No motion blur, no speed lines, no dust.
```

### 7.2 `falling` — 4 Bilder

Das Warnsignal des Spiels: „Die braucht Hilfe." Deshalb ist es das einzige Blatt, in dem
das Haar **senkrecht steht** — die Fahrtwindsilhouette ist mit nichts anderem im Spiel zu
verwechseln, und sie liest bei 12 Pixeln als eine Figur, die um zwei Pixel höher wirkt als
sie ist.

> **Referenz: A0.**

```
[PREPEND STYLE BLOCK K]
[PREPEND SHEET CONTRACT]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Free-fall loop of the Wusel creature (oversized rounded head with warm sand
skin #f4d7ac, backward-swept vivid violet hair mane #9d4edd with highlight
#c98bff and shadow #67219c, teal one-piece suit #2fc9b8, dark teal boots
#1d8f85, near-black outline #0c1119), falling without any equipment.

Exactly 4 frames in one row. Canvas 768 by 192 pixels, aspect ratio 4:1.

Important: the engine moves the character downward. The frames must NOT
show downward travel — the ground contact line stays fixed. Only the pose
changes.

Frame 1 — both arms thrown straight up above the head, legs trailing
slightly behind, body stretched into a narrow vertical shape, mouth open in
a small round shout, eye wide.
Frame 2 — arms flailing outward and slightly back, one leg kicking forward,
body twisting a few degrees.
Frame 3 — arms back up and crossing near the wrists, both legs splayed
apart, the widest frame of the loop.
Frame 4 — arms sweeping down and outward, legs together again, leading back
into frame 1.

The hair in this clip does not lag behind the body — the airflow holds it.
It is dragged straight up by the rush of air in all four frames, stretched
to its maximum of 64 pixels above the crown at this master scale and
narrowed to a thin vertical plume. Between the frames only the fan of the
strands changes: frame 1 the strands are pressed tightly together, frame 2
fanned slightly apart, frame 3 fanned widest with one strand flicking
sideways, frame 4 gathering back together. The plume never leans forward
and never crosses the arms.

The whole loop must read as helpless, uncontrolled and slightly comical,
and as clearly distinct from the calm descent under an umbrella. This is
the player's warning signal that a creature needs help, so the difference
must survive downscaling to 12 pixels tall: keep the arms above the head in
at least three of the four frames, and keep the vertical hair plume in all
four — arms up plus hair up is the whole signal.
```

### 7.3 `floating` — 4 Bilder

Das Lehrbuchbeispiel für Regel 1 aus §3.5. Der Schirm kippt, und das Haar folgt **ein Bild
später**. Wer nur diesen einen Clip richtig macht, hat das Prinzip verstanden.

> **Referenz: A0** und **A2** (für den Schirm).

```
[PREPEND STYLE BLOCK K]
[PREPEND SHEET CONTRACT]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Slow descent loop of the Wusel creature hanging beneath an open umbrella
(oversized rounded head with warm sand skin #f4d7ac, backward-swept berry
red hair mane #9d4edd with highlight #c98bff and shadow #67219c, teal
one-piece suit #2fc9b8, dark teal boots #1d8f85, near-black outline
#0c1119).

Exactly 4 frames in one row. Canvas 768 by 192 pixels, aspect ratio 4:1.

Equipment, drawn as part of this sheet: a small open umbrella held above
the head in both mitten hands. Canopy in amber #ffd23f with a darker amber
underside, six visible ribs, a shallow dome, a short straight handle, a
small finial on top. The canopy is exactly 96 pixels wide at this master
scale — twice the body width — and its top edge sits 144 pixels above the
ground contact line, so it reaches close to but never past the top of the
cell. The hair must stay clearly below the canopy with a visible gap.

The engine moves the character downward. The frames must NOT show downward
travel — only a gentle sway.

Frame 1 — canopy level, body hanging straight down, legs relaxed with toes
pointing down, head calm and level.
Frame 2 — canopy tipped a few degrees to the right, body swinging slightly
that way, legs trailing the swing.
Frame 3 — canopy level again, canopy edge lifted a little as if catching
air, body at the bottom of its swing.
Frame 4 — canopy tipped a few degrees to the left, body swinging back.

The hair follows the sway with exactly one frame of delay, and this delay
is the point of the sheet. In frame 1 the mane lies at rest, swept back. In
frame 2, while the canopy tips right, the hair has not moved yet and still
lies where it was in frame 1. In frame 3 the hair swings right and lifts —
reacting to the tilt that happened in the previous frame — while the canopy
is already level again. In frame 4 the hair drifts back through the centre
as the canopy tips the other way. The hair is therefore never in the same
phase as the canopy, and the largest hair displacement of the sheet is in
frame 3.

The silhouette must read as one wide dome on a narrow stem at 12 pixels
tall: top-heavy, calm, in complete contrast to the free-fall loop. Never
confusable with the arms-wide blocker, whose wide element sits at chest
height and is straight, not domed.
```

### 7.4 `climbing` — 4 Bilder

Die Wand nimmt der Figur eine Seite. Das Haar fällt deshalb **von der Wand weg** — und
dieser Umstand ist zugleich der Silhouettengewinn: eine schmale Figur mit einem rosa Keil
auf der Rückseite ist bei 12 Pixeln eindeutig als Kletterer lesbar.

> **Referenz: A0.**

```
[PREPEND STYLE BLOCK K]
[PREPEND SHEET CONTRACT]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Wall-climbing loop of the Wusel creature (oversized rounded head with warm
sand skin #f4d7ac, backward-swept vivid violet hair mane #9d4edd with
highlight #c98bff and shadow #67219c, teal one-piece suit #2fc9b8, dark
teal boots #1d8f85, near-black outline #0c1119), climbing a vertical
surface that is NOT drawn.

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

The hair hangs away from the implied wall, to the left, and pumps with the
climb one frame behind it. On the two planting frames 1 and 3 the mane is
kicked upward by the pull, reaching 56 pixels above the crown. On the two
reaching frames 2 and 4 it sags back down to 40 pixels above the crown and
droops further back. The hair must never appear between the body and the
implied wall, and never above the raised hand.

The creature is a climber and therefore always wears the helmet — but the
helmet is a separate attachment layer and must NOT be drawn on this sheet.
Leave the front upper quarter of the head dome clear and unobstructed; the
hair behind it stays.

The silhouette at 12 pixels tall must read as "flat against a wall, one arm
high, red wedge on the back": narrower than a walker, with at least one
arm above head height in every frame.
```

### 7.5 `hoisting` — 6 Bilder, einmalig

Der komischste Moment im Spiel, und der einzige, in dem das Haar **über das Gesicht klappt**
und die Figur damit kurz blind aussehen lässt. Bild 6 wird 12 Ticks gehalten und muss völlig
still sein — auch das Haar.

> **Referenz: A0.**

```
[PREPEND STYLE BLOCK K]
[PREPEND SHEET CONTRACT]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

One-shot pull-up sequence of the Wusel creature (oversized rounded head
with warm sand skin #f4d7ac, backward-swept vivid violet hair mane #9d4edd
with highlight #c98bff and shadow #67219c, teal one-piece suit #2fc9b8,
dark teal boots #1d8f85, near-black outline #0c1119), hauling itself over
the top edge of a wall that is NOT drawn.

Exactly 6 frames in one row. Canvas 1152 by 192 pixels, aspect ratio 6:1.
This sequence plays once and does not loop.

The implied ledge edge runs horizontally at the height of the ground
contact line. The engine raises the character; the frames must NOT show
vertical travel. The ground contact line stays fixed in every cell and
marks the implied ledge.

Frame 1 — hanging: both mitten hands hooked over the implied edge at the
ground contact line, arms straight, body dangling below, boots loose. The
hair hangs straight down behind the head, completely limp, its tip below
the crown.
Frame 2 — pulling: elbows bending hard, shoulders rising toward the hands,
head coming up, boots swinging forward to find the wall. The hair is
yanked upward by the acceleration and streams up and back.
Frame 3 — chest over: torso folding forward across the edge, one knee
lifting, arms taking the weight, the most awkward and most comic frame. The
hair overshoots forward across the top of the head and its tip hangs down
in front of the brow, but never covers the eye.
Frame 4 — knee up: one boot planted on the ledge, the other still hanging,
body crouched low and wide. The hair is still forward, beginning to fall
back.
Frame 5 — rising: both boots on the ledge, body straightening out of a deep
crouch, arms swinging forward for balance. The hair swings back through the
vertical and overshoots slightly to the rear.
Frame 6 — standing on the edge, upright, weight settled, one boot slightly
ahead, ready to walk on. The hair has settled into its exact rest position.
This frame is held nearly twice as long as the others, so it must read as a
stable resting pose, not as a transition: nothing in it may look like it is
still moving, the hair least of all.

Leave the front upper quarter of the head dome clear — the climbing helmet
is a separate attachment layer.
```

### 7.6 `building` — 8 Bilder

Harte Zusatzbedingung aus `world.ts`: Am Zyklusende springt der Körper 2 px nach vorn und
1 px nach oben. Bild 8 muss deshalb lückenlos in ein versetztes Bild 1 übergehen. Das Haar
hilft dabei: Es überschwingt in Bild 1 nach vorn und verdeckt damit den Sprung.

> **Referenz: A0** und **A2** (für die Planke).

```
[PREPEND STYLE BLOCK K]
[PREPEND SHEET CONTRACT]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Bridge-building work cycle of the Wusel creature (oversized rounded head
with warm sand skin #f4d7ac, backward-swept vivid violet hair mane #9d4edd
with highlight #c98bff and shadow #67219c, teal one-piece suit #2fc9b8,
dark teal boots #1d8f85, near-black outline #0c1119), laying one plank step
per cycle.

Exactly 8 frames in one row. Canvas 1536 by 192 pixels, aspect ratio 8:1.

Equipment: a small amber #ffd23f tool belt at the waist with two spare
planks tucked in behind the back, and one plank step in warm brick brown
#b5713f being handled. A laid plank is 48 pixels long and 8 pixels thick at
this master scale.

Frame 1 — the placement frame, the single most important frame of the
sheet: the plank is fully down and in place, lying flat and level, its far
end reaching forward and slightly up, both mitten hands just leaving it.
The creature is bent forward from the hips at about thirty degrees, front
knee bent, rear leg braced back, head down watching the work. Because the
body has just stopped hard, the hair overshoots forward across the top of
the head, its tip reaching just past the brow — the only frame of this
sheet in which hair crosses to the front.
Frames 2 and 3 — straightening up, both hands empty and swinging back
toward the belt. The hair falls back across the crown in frame 2 and has
returned behind the head by frame 3.
Frame 4 — upright, one hand at the belt, pulling the next plank free. The
hair is at its highest and fullest, lifted well above the crown.
Frames 5 and 6 — bringing the new plank forward and down, body folding back
into the forward lean. The hair swings forward with the lean but stays
behind the crown, one frame behind the body.
Frame 7 — plank held just above its target position, arms extended low and
forward, body at full lean. The hair is at its most forward-leaning point
short of crossing the brow.
Frame 8 — plank touching down, weight shifting onto the front foot. This
frame must lead seamlessly into frame 1 shifted 16 pixels forward and 8
pixels up at this master scale, because the engine moves the body by that
amount at the end of every cycle.

Silhouette test: the forward lean plus the plank produce a clear diagonal
rising to the upper right in frames 1, 7 and 8 — the exact opposite
direction to the miner's downward diagonal. At 12 pixels tall the figure
must read as "leaning forward, something sticking out ahead and slightly
up".
```

Der Prototyp lässt die Planke weiß blinken, wenn nur noch drei Stufen übrig sind
(`BUILD_WARN_AT`). Das bleibt eine **Tönung im Code**, keine zweite Bildreihe.

### 7.7 `bashing` — 3 Bilder

Der stärkste Fall von Regel 2. Drei Bilder, ein Hammerschlag, und das Haar macht in diesen
drei Bildern die komplette Peitschenbewegung: vor, zurück, hängengeblieben. Wenn ein
Bildgenerator irgendwo scheitert, dann hier — dieses Blatt gehört von Hand fertiggestellt.

> **Referenz: A0** und **A2** (für den Vorschlaghammer).

```
[PREPEND STYLE BLOCK K]
[PREPEND SHEET CONTRACT]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Horizontal digging work cycle of the Wusel creature (oversized rounded head
with warm sand skin #f4d7ac, backward-swept vivid violet hair mane #9d4edd
with highlight #c98bff and shadow #67219c, teal one-piece suit #2fc9b8,
dark teal boots #1d8f85, near-black outline #0c1119), swinging a
sledgehammer straight forward into a wall that is NOT drawn.

Exactly 3 frames in one row. Canvas 576 by 192 pixels, aspect ratio 3:1.

Equipment: a heavy sledgehammer with a short amber #ffd23f haft and a
chunky rectangular near-black head, gripped in both mitten hands.

Frame 1 — impact, the frame on which the engine removes terrain: the hammer
is thrust fully forward at belly height, its head clear of the body outline
to the right, the haft level and horizontal. Torso rotated into the blow,
rear foot dug in, front knee bent, head pushed forward, shoulders
compressed into a small squash. The body has stopped dead and the hair has
not: the mane shoots forward over the top of the head, its tip past the
brow, strands compressed together. This is the furthest forward the hair
goes anywhere in the game.
Frame 2 — recoil: the hammer rebounds up and back, the body straightening,
head snapping back a little. The hair is flung the other way and is now at
its furthest back, streaming almost horizontally behind the skull, fully
extended to 32 pixels behind the head at this master scale.
Frame 3 — wind-up: the hammer drawn back over the shoulder, both arms
raised, body coiled and leaning back, the widest wind-up the stubby arms
allow. The body is already travelling backward but the hair is only now
coming back forward through the vertical, lifted high above the crown —
hair and body move in opposite directions in this frame. This leads
straight back into frame 1.

Silhouette test: in frame 1 the hammer forms a solid horizontal bar at
belly height projecting forward — level, never angled. That bar height is
the only readable difference from the miner (bar angled down) and the
digger (bar at foot height), so keep it exactly at mid-body height and make
it thick. The hair must never reach down to the height of that bar.

No rubble, no dust, no impact sparks — those are separate particle assets.
```

### 7.8 `mining` — 4 Bilder

Der Schacht läuft 2 px vor je 1 px ab, rund 27°. Das Haar peitscht **mit** dieser Diagonale
— das ist das einzige Blatt, in dem die Haarbewegung die Grabrichtung wiederholt und damit
verstärkt.

> **Referenz: A0** und **A2** (für die Spitzhacke).

```
[PREPEND STYLE BLOCK K]
[PREPEND SHEET CONTRACT]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Diagonal digging work cycle of the Wusel creature (oversized rounded head
with warm sand skin #f4d7ac, backward-swept vivid violet hair mane #9d4edd
with highlight #c98bff and shadow #67219c, teal one-piece suit #2fc9b8,
dark teal boots #1d8f85, near-black outline #0c1119), driving a pickaxe
forward and downward into ground that is NOT drawn.

Exactly 4 frames in one row. Canvas 768 by 192 pixels, aspect ratio 4:1.

Equipment: a pickaxe with a long amber #ffd23f handle and a curved
near-black double-pointed head, gripped in both mitten hands.

Frame 1 — strike, the frame on which the engine removes terrain: the
pickaxe is driven forward and down at exactly twenty-seven degrees below
horizontal, two units forward for every one unit down, its point reaching
toward the lower right of the cell and well outside the body outline. Body
crouched and rotated into the strike, rear leg extended, front leg bent
under the body, head down and forward. The hair whips forward and downward
along the same twenty-seven degree diagonal, its tip pointing to the lower
right just past the brow, echoing the direction of the blow.
Frame 2 — the pick bites and the body compresses over it, shoulders
dropping, the shaft angle unchanged. The hair is still forward and down but
has begun to compress and bunch.
Frame 3 — the pick is levered back out, body beginning to rise, shaft
swinging up through horizontal. The hair releases and sweeps back across
the crown, passing through its rest position.
Frame 4 — full wind-up, the pick raised behind and above the shoulder, body
coiled, ready to strike again. The hair has overshot to the rear and up,
reaching its highest and furthest-back point of the sheet. This must lead
into frame 1 shifted 16 pixels forward and 8 pixels down at this master
scale, because the engine moves the body by that amount at the end of every
cycle.

Silhouette test: the pickaxe makes one long clean unbroken diagonal running
from the upper left of the body to the lower right. That downward diagonal
is the only reliable difference from the builder, whose diagonal points
upward. Keep the shaft long and unbroken so the angle survives downscaling
to 12 pixels tall. The hair reinforces the same diagonal in frames 1 and 2
and must never cut across it in the opposite direction.
```

### 7.9 `digging` — 3 Bilder, Haltedauer 3-2-2

Der einzige Clip mit ungleicher Haltedauer, weil `DIG_INTERVAL = 7` prim ist. Die
Ungleichheit gehört sichtbar gemacht: Der größte Positionssprung des Haares liegt zwischen
Bild 1 und 2, dort wo auch die Haltedauer wechselt.

> **Referenz: A0** und **A2** (für die Schaufel).

```
[PREPEND STYLE BLOCK K]
[PREPEND SHEET CONTRACT]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Vertical digging work cycle of the Wusel creature (oversized rounded head
with warm sand skin #f4d7ac, backward-swept vivid violet hair mane #9d4edd
with highlight #c98bff and shadow #67219c, teal one-piece suit #2fc9b8,
dark teal boots #1d8f85, near-black outline #0c1119), shovelling straight
down into ground that is NOT drawn.

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
hole. This is the lowest, most compact silhouette of the sheet. The hair
falls forward over the top of the head and hangs down in front of the brow,
following the head's plunge — it must not cover the eye, and it must not
reach below shoulder height.
Frame 2 — the lift: the blade rises to knee height carrying a small load,
the body beginning to straighten, one shoulder leading. The hair is thrown
clear of the face in a single large movement and is already back behind the
crown — this is by far the biggest change between any two frames of this
sheet.
Frame 3 — the toss and reset: the blade swung out to the side and up, load
thrown clear, body at its most upright, already twisting back down. The
hair is flung up and back to its highest point, strands fanned. Leads
straight into frame 1.

Silhouette test: in frame 1 the shovel forms a wide horizontal bar at the
very bottom of the figure, at foot level. At 12 pixels tall that low bar
must not be mistakable for the basher's bar, which sits at mid-body height.
Keep frame 1 clearly the lowest and widest of the three, and keep the hair
in frame 1 clearly the lowest of the three as well.

No soil, no dust, no debris.
```

### 7.10 `blocking` — 2 Bilder

Der einzige Zustand ohne Simulationstakt. Ein völlig unbewegtes Sprite zwischen 59 laufenden
sieht tot aus — und das Haar ist die **einzige** Stelle, an der dieser Clip sich bewegen
darf. Alles andere ist byte-identisch, damit der Blocker unverrückbar wirkt.

> **Referenz: A0** und **A2** (für die Paddel).

```
[PREPEND STYLE BLOCK K]
[PREPEND SHEET CONTRACT]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Two-frame idle of the Wusel creature in its blocking stance (oversized
rounded head with warm sand skin #f4d7ac, backward-swept vivid violet hair
mane #9d4edd with highlight #c98bff and shadow #67219c, teal one-piece suit
#2fc9b8, dark teal boots #1d8f85, near-black outline #0c1119).

Exactly 2 frames in one row. Canvas 384 by 192 pixels, aspect ratio 2:1.

Equipment: two wide rectangular signal paddles in warning orange #ff7a45
with a thin near-black border, one gripped in each mitten hand, plus a
matching orange chest band across the suit.

Pose: the torso turned slightly toward the viewer while the boots stay in
side-view profile, both arms stretched horizontally straight out to left
and right at chest height, elbows locked, paddles held vertical at the
ends. Total arm span exactly 96 pixels at this master scale — the same as
the figure's height, and the widest silhouette in the game. Legs planted
wide and firm, knees straight, head level, jaw set, eye narrowed with total
conviction. The creature is a living road block and knows it.

Frame 1 — the stance at rest, the hair in its exact neutral position.
Frame 2 — byte-identical to frame 1 in every respect except the hair: the
tips of the mane lift by 8 pixels at this master scale, as if in a faint
breath of air, and the eye blinks half shut. Arm span, arm height, paddle
position, boot position, torso and head outline are unchanged, pixel for
pixel. The hair is the only thing in this clip that moves, and that is
deliberate: it proves the creature is alive without making it look like it
might give way.

Silhouette test: a hard letter T with a heavy base, readable as "stop" at
12 pixels tall. It must never be confused with the umbrella descent, whose
wide element sits above the head and is domed rather than straight. The
hair must stay well inside the arm span and must never break the straight
top line of the arms.
```

### 7.11 `saving` — 6 Bilder, einmalig

Die einzige Stelle im Spiel, an der das Haar der Bewegung **vorausgeht** statt
nachzulaufen. Ein Sog von oben greift zuerst am Leichtesten an — das ist physikalisch
plausibel und gestalterisch der Moment, auf den das ganze Level hinarbeitet.

Aufstieg und Ausblenden bleiben im Code (`grafik-integration.md` §3.11); das Blatt zeigt nur
die Haltungsänderung auf fester Grundlinie.

> **Referenz: A0.**

```
[PREPEND STYLE BLOCK K]
[PREPEND SHEET CONTRACT]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

One-shot rescue sequence of the Wusel creature (oversized rounded head with
warm sand skin #f4d7ac, backward-swept vivid violet hair mane #9d4edd with
highlight #c98bff and shadow #67219c, teal one-piece suit #2fc9b8, dark
teal boots #1d8f85, near-black outline #0c1119) being drawn into the exit
and saved.

Exactly 6 frames in one row. Canvas 1152 by 192 pixels, aspect ratio 6:1.
This sequence plays once and does not loop.

The engine handles both the upward drift and the fade to transparency. Do
not paint any fade, opacity change or vertical travel into the frames:
every frame is fully opaque and the ground contact line stays fixed in all
six cells, exactly as in every other sheet.

The hair leads the body throughout this sequence instead of trailing it —
this is the only clip in the game where that happens, and it is the whole
emotional point of the sheet. In every frame the hair is one step further
into the movement than the body is.

Frame 1 — still standing flat, head turning up toward an unseen warm light
above, eye widening. The hair has already begun to rise and float, lifted
clear of the crown although the body has not moved at all.
Frame 2 — up on tiptoes, heels lifted off the contact line, arms starting
to lift away from the body, expression turning from surprise to delight.
The hair is standing well up, strands separating and floating.
Frame 3 — the boots tuck up under the body, knees folding, arms out and up,
a broad grin: the creature is being lifted, not jumping. The hair streams
nearly straight up.
Frame 4 — legs dangling relaxed below the tucked knees, arms overhead, head
tipped back, eye closed in a happy arc. The hair is fully vertical and
stretched.
Frame 5 — the body slims into a narrower vertical shape as if being drawn
upward, boots pointing straight down, arms pressed together above the head.
The hair is stretched to its maximum of 64 pixels above the crown at this
master scale and gathered into a single fine plume.
Frame 6 — the most stretched pose, body at its narrowest and tallest, arms
fully extended up, unmistakably happy, the hair plume at full extension and
brightest. The head and hair must stay clear of the top of the cell.

A warm rim light #ffd98a from above grows stronger across the six frames,
strongest on the top of the hair and on the shoulders. This is the only
place in the character set where a coloured light is baked in, because the
exit glow is always the same warm tone. The warm light must not wash the
red of the hair out to white — keep the hair's own hue readable.
```

### 7.12 `dying` — 8 Bilder, einmalig

Das Gegenstück zu §7.11 und die zweite Regelverletzung: Das Haar **hört vor dem Körper auf,
sich zu bewegen.** Stilles Haar über einem noch zuckenden Körper ist das, was aus einer
Squash-Animation einen Tod macht. Wer diese drei Bilder wirklich still hält, bekommt die
Empathie aus GDD §2 geschenkt.

> **Referenz: A0.**

```
[PREPEND STYLE BLOCK K]
[PREPEND SHEET CONTRACT]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

One-shot generic collapse sequence of the Wusel creature (oversized rounded
head with warm sand skin #f4d7ac, backward-swept vivid violet hair mane
#9d4edd with highlight #c98bff and shadow #67219c, teal one-piece suit
#2fc9b8, dark teal boots #1d8f85, near-black outline #0c1119): the default
death used when no cause-specific animation applies.

Exactly 8 frames in one row. Canvas 1536 by 192 pixels, aspect ratio 8:1.
This sequence plays once and does not loop.

Frame 1 — the moment of realisation: standing, both arms flung up, eye
huge, mouth a small round shout. The hair is yanked straight up in shock,
fully extended and fanned.
Frame 2 — the legs buckle, knees folding inward, body dropping to two
thirds height, arms still up. The hair is still up but beginning to topple
backward.
Frame 3 — full collapse, the body folding down onto itself, head sinking
between the shoulders, arms flopping outward. The hair falls with the head
and swings forward across the crown.
Frame 4 — maximum squash: the whole creature flattened to about a third of
its height and spread wider than its normal stance, a single thin ring of
pale dust around the base. The hair is splayed flat into a wide low fan
across the top of the flattened shape, the widest the hair ever gets.
Frame 5 — settling, the flattened shape relaxing, one mitten hand still
raised and then falling. The hair fan settles by a few pixels and comes to
rest. From here on it does not move again.
Frame 6 — motionless, the outline softening, the teal desaturating one step
toward the outline tone. The hair is in exactly the same position as in
frame 5, pixel for pixel, and its red desaturates one step toward the
shadow tone #67219c.
Frame 7 — the shape reduced further, colours flattening toward a single
dull tone, the dust ring drifting outward and thinning. The hair is
unchanged in position and has desaturated another step.
Frame 8 — a small motionless heap no taller than a quarter of the original
figure, one recognisable boot shape, one last flat wisp of red still
visible, and a last wisp of dust.

The stillness is the point: the hair stops moving one frame before the body
does, and frames 6, 7 and 8 must be genuinely, completely still. Any
residual hair movement in those three frames destroys the effect.

No blood, no gore, no red fluid, no detached limbs. The weight comes from
the squash and from the abrupt stillness of frames 6 to 8.

At 12 pixels tall the sequence must read unmistakably as "that one is gone",
distinguishable at a glance from the rescue sequence, which rises and
brightens where this one flattens and dulls.
```

---

## §8 Anbauteile

Warum Anbauteile statt gebackener Kombinationen, wie die Andockpunkte heißen und wie sie
gespiegelt werden, steht in `grafik-integration.md` §4 und wird hier nicht wiederholt. Neu
ist nur eine Bedingung, die aus dem Haar folgt:

> **Der Helm sitzt auf der Stirn, das Haar hinter ihm.** Der Andockpunkt `head` liegt
> weiterhin auf dem Scheitel. Weil das Haar in die Körperbilder eingebacken ist und der Helm
> darüber gezeichnet wird, muss der Helm **hinten offen** sein — sonst schneidet er den
> Schopf ab. Deshalb hat er keinen Nackenschutz und keine hintere Kante.

### 8.1 Kletterhelm — 3 Neigungen

> **Referenz: A2.**

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Attachment asset: a climbing helmet for a small cartoon worker creature,
drawn on its own so an engine can pin it onto a character sprite. The head
it belongs on is a large smooth dome with a thick mane of hair sweeping
backward from the crown; the helmet must sit on the front and top of that
dome like a shell, with its inner curve matching a dome of 32 pixels
diameter at this master scale.

Design: a hard angular helmet in amber #ffd23f with a flat forward brim, a
low crown ridge running front to back, a chin strap suggested as two short
dark lines at the sides, and one small round lamp centred on the front of
the brim with a pale warm core. Hard near-black outline #0c1119, 8 pixels
thick at this master scale, the same weight as the character outline.

Critically: the helmet is open at the back. It covers the forehead, the
crown and the front half of the skull and then simply ends in a clean edge
— no neck guard, no rear rim, no strap crossing the back of the head. The
creature's hair emerges behind that edge, so anything the helmet adds at
the back would cut the hair off.

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

Fully transparent background, no head drawn, no hair drawn, no shadow, no
character. At 12 pixels of character height the helmet is barely two pixels
tall — it must therefore change the front of the head silhouette from round
to squared-off and add visible height at the brow. That change is the
entire purpose of the asset.
```

### 8.2 Schirm eingeklappt — 2 Bilder

> **Referenz: A2.**

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Attachment asset: a furled umbrella carried at the hip of a small cartoon
worker creature, drawn on its own so an engine can pin it onto a character
sprite.

Design: a tightly closed umbrella in amber #ffd23f with a darker amber
binding strap around the middle, a short straight handle with a simple
hooked end, a small finial at the tip, and the ribs visible as three fine
darker lines along the furled canopy. Hard near-black outline #0c1119, 8
pixels thick at this master scale, the same weight as the character
outline. Total length 32 pixels at this master scale, thickness 16 pixels.

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

### 8.3 Bombe mit Zündschnur — 5 Bilder

> **Referenz: A2.**

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

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
Cell 4 — a short stub of fuse, the spark large and hot, a warm glow #ff7a45
spilling onto the top of the sphere.
Cell 5 — the fuse is gone to a nub at the collar, the spark a small white
flash, the whole sphere rim-lit in danger red #ff4d4d.

The fuse curl rises on the side away from the viewer's reading direction
and must stay narrow, because on the character it passes close to the red
hair mane and the two must not merge into one shape. Keep the fuse thin and
its spark small and white rather than red in cells 1 to 3.

Strict side view facing right. The engine mirrors the sheet, so nothing may
identify a left or a right side.

Fully transparent background, no character, no arms, no shadow. At 12
pixels of character height this asset is a round bulge at belly height with
a thin curl above the shoulder — that combination must read as "carrying
something round and lit" and must not be confusable with an object held
above the head.
```

### 8.4 Countdown-Ziffern 1 bis 5

**Ehrlich vorweg:** Diesen Streifen sollte man nicht generieren lassen. Fünf Glyphen à
5 × 7 Pixel sind eine Viertelstunde Handarbeit und werden von keinem Bildmodell auf dem
Raster getroffen. Der Prompt ist eine **Formvorlage**, kein Lieferant.

> **Referenz: keine.**

```
[PREPEND STYLE BLOCK K]
[APPEND NEGATIVE PROMPT]

Pixel-font asset: the five numerals 1, 2, 3, 4 and 5, for a countdown
displayed above a character in a pixel-art game. Nothing else — no other
digits, no letters, no punctuation, no frame.

Design: heavy blocky numerals in bright amber #ffdf5e with a hard
near-black outline #0c1119 eight pixels thick at this master scale and a
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

## §9 Die zehn Berufe — Erkennungsblätter

**Der wichtigste Abschnitt für die Spielbarkeit.** GDD §6: Jeder Beruf ist an der Silhouette
erkennbar, nicht an der Farbe. Diese zehn Blätter sind keine Animationen, sondern die
verbindliche **Kennhaltung** je Beruf — die eine Pose, an der man den Beruf im Gewusel
erkennt. Aus ihnen leiten sich die Zustandsblätter (§7) und die Symbole (§15.1/§15.2) ab.

Jedes Blatt hat **zwei Zellen**: die Kennhaltung in Farbe und dieselbe Pose als reine
schwarze Silhouette. Die zweite Zelle ist keine Zierde — sie ist der Abnahmetest aus §19,
mitgeliefert. Ein Beruf, dessen schwarze Zelle nicht von den anderen neun zu unterscheiden
ist, geht zurück.

**Die Merkmalstabelle**, an der sich alle zehn Prompts orientieren. Die Zahlen sind die
logischen Pixel aus `constants.ts`:

| Beruf | Kennmerkmal | Ort | Ausdehnung |
|---|---|---|---|
| Kletterer | Helm, Arme über Kopf, flach an der Wand | Kopf + oben | schmalste Silhouette |
| Schirmspringer | Schirmdach, gewölbt | über dem Kopf | ±6 |
| Sprengmeister | runde Bombe + Zündschnurbogen | Bauch + Schulter | kompakt |
| Blocker | zwei waagerechte Arme, gerade | Brusthöhe | ±6, breiteste |
| Brückenbauer | Diagonale nach **oben** vorn | Hüfte bis vorn oben | +8 |
| Rammer | waagerechter Balken | **Bauchhöhe** | +7 |
| Schrägbagger | Diagonale nach **unten** vorn, 27° | quer durch | +7 |
| Gräber | waagerechter Balken | **Fußhöhe** | ±4 |
| Magnetiker | Hufeisen, offen nach vorn | Brusthöhe | +5 |
| Springer | gestauchte Hocke, Federn an den Stiefeln | unten | niedrigste |

Die drei kritischen Verwechslungen sind **Rammer / Schrägbagger / Gräber** — alle drei sind
„Balken vorn". Sie unterscheiden sich ausschließlich durch **Höhe und Winkel** des Balkens.
Diese Unterscheidung ist in jedem der drei Prompts ausdrücklich benannt.

### 9.1 Kletterer

> **Referenz: A0** und **A2**.

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Key-pose sheet for the Climber, one of ten job roles of the Wusel creature:
a small stocky worker, two and a half heads tall, oversized rounded head
with warm sand skin #f4d7ac, one round black dot eye set low, tiny mouth,
a upswept mane of thick vivid violet hair #9d4edd with highlight
#c98bff and shadow #67219c, one-piece teal work suit #2fc9b8, stubby mitten
arms, blunt dark teal boots #1d8f85, hard near-black outline #0c1119, 8
pixels thick at this master scale.

Layout: exactly 2 cells in one horizontal row, equal cells, no gaps, no
borders, no labels, no text. Each cell is exactly 192 by 192 pixels. Canvas
384 by 192 pixels, aspect ratio 2:1. The figure is in the identical
position and at the identical size in both cells, its boot underside 160
pixels below the top edge, its centre line 96 pixels from the left edge of
its own cell.

Cell 1 — the key pose in full colour. Strict orthographic side view facing
right. The creature is pressed flat against an implied vertical wall on its
right, which is NOT drawn: chest and knees touching it, body as narrow as
it ever gets, head tilted up. The upper mitten hand is planted high above
head height, the lower hand at chest height. It wears an angular amber
#ffd23f climbing helmet with a flat forward brim and a small centred lamp,
open at the back so the red hair mane emerges behind it. The hair hangs
away from the wall, to the left, lifted by the climb.

Cell 2 — the identical pose rendered as a pure solid silhouette: every
pixel of the figure, helmet and hair filled with flat near-black #0c1119,
no interior detail, no colour, no outline, against the same fully
transparent background. This cell exists so the silhouette can be checked
against the other nine job roles.

Recognition rule: at 12 pixels tall this job must read as "narrow, flat,
one arm above the head, squared-off head". It is the narrowest of the ten
roles, and that narrowness plus the raised arm is the entire signal.

Lighting: soft key from almost directly overhead, cool fill from below, a
narrow bright rim on the top of the helmet. No cast shadow, no ground, no
wall, no props.
```

### 9.2 Schirmspringer

> **Referenz: A0** und **A2**.

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Key-pose sheet for the Floater, one of ten job roles of the Wusel creature:
a small stocky worker, two and a half heads tall, oversized rounded head
with warm sand skin #f4d7ac, one round black dot eye set low, tiny mouth,
a upswept mane of thick vivid violet hair #9d4edd with highlight
#c98bff and shadow #67219c, one-piece teal work suit #2fc9b8, stubby mitten
arms, blunt dark teal boots #1d8f85, hard near-black outline #0c1119, 8
pixels thick at this master scale.

Layout: exactly 2 cells in one horizontal row, equal cells, no gaps, no
borders, no labels, no text. Each cell is exactly 192 by 192 pixels. Canvas
384 by 192 pixels, aspect ratio 2:1. The figure is in the identical
position and at the identical size in both cells, its boot underside 160
pixels below the top edge, its centre line 96 pixels from the left edge of
its own cell.

Cell 1 — the key pose in full colour. Strict orthographic side view facing
right. The creature hangs beneath a small open umbrella held above the head
in both mitten hands: shallow dome canopy in amber #ffd23f with a darker
underside, six visible ribs, short straight handle, small finial on top.
The canopy is exactly 96 pixels wide at this master scale — twice the body
width — and its top edge sits 144 pixels above the boot underside. The body
hangs straight down, legs relaxed, toes pointing down, head calm and level,
expression serene. The hair sits at rest below the canopy with a clear gap
between hair and canopy underside.

Cell 2 — the identical pose rendered as a pure solid silhouette: every
pixel of the figure, umbrella and hair filled with flat near-black #0c1119,
no interior detail, no colour, no outline, against the same fully
transparent background.

Recognition rule: at 12 pixels tall this job must read as "one wide dome on
a narrow stem", top-heavy and calm. The domed, curved top edge is the only
reliable difference from the Blocker, whose wide element is straight and
sits at chest height rather than above the head. Keep the canopy visibly
curved and keep the body beneath it narrow.

Lighting: soft key from almost directly overhead, cool fill from below, a
narrow bright rim along the top of the canopy. No cast shadow, no ground,
no props.
```

### 9.3 Sprengmeister

> **Referenz: A0** und **A2**.

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Key-pose sheet for the Bomber, one of ten job roles of the Wusel creature:
a small stocky worker, two and a half heads tall, oversized rounded head
with warm sand skin #f4d7ac, one round black dot eye set low, a backward-
swept mane of thick vivid violet hair #9d4edd with highlight #c98bff and
shadow #67219c, one-piece teal work suit #2fc9b8, stubby mitten arms, blunt
dark teal boots #1d8f85, hard near-black outline #0c1119, 8 pixels thick at
this master scale.

Layout: exactly 2 cells in one horizontal row, equal cells, no gaps, no
borders, no labels, no text, no numerals. Each cell is exactly 192 by 192
pixels. Canvas 384 by 192 pixels, aspect ratio 2:1. The figure is in the
identical position and at the identical size in both cells, its boot
underside 160 pixels below the top edge, its centre line 96 pixels from the
left edge of its own cell.

Cell 1 — the key pose in full colour. Strict orthographic side view facing
right. The creature stands upright and clutches a round cannonball bomb
against its belly with both mitten arms: a near-black #0c1119 sphere 40
pixels across at this master scale with one amber #ffd23f highlight arc and
a collar at the top. A thin curled fuse in warm sand #f4d7ac rises from the
collar past the shoulder and burns at its tip with a small white spark and
a wisp of grey smoke. The creature looks down at the bomb with an
expression of mild, misplaced pride. The hair is at rest and clearly
separate from the fuse curl — the two must not merge into one shape.

Cell 2 — the identical pose rendered as a pure solid silhouette: every
pixel of the figure, bomb, fuse and hair filled with flat near-black
#0c1119, no interior detail, no colour, no outline, against the same fully
transparent background.

Recognition rule: at 12 pixels tall this job must read as "round bulge at
belly height with a thin curl rising past the shoulder". The bulge must
widen the lower body outline visibly, and the fuse curl must stay thin
enough not to be confused with the hair above it.

Lighting: soft key from almost directly overhead, cool fill from below. No
cast shadow, no ground, no props, no explosion.
```

### 9.4 Blocker

> **Referenz: A0** und **A2**. Für dieses Blatt ist **Tripo** der bessere Weg (§17.3): Die
> Armspanne muss exakt stimmen, und ein Modell hält sie über alle Ableitungen konstant.

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Key-pose sheet for the Blocker, one of ten job roles of the Wusel creature:
a small stocky worker, two and a half heads tall, oversized rounded head
with warm sand skin #f4d7ac, round black dot eyes set low, a backward-swept
mane of thick vivid violet hair #9d4edd with highlight #c98bff and shadow
#67219c, one-piece teal work suit #2fc9b8, stubby mitten arms, blunt dark
teal boots #1d8f85, hard near-black outline #0c1119, 8 pixels thick at this
master scale.

Layout: exactly 2 cells in one horizontal row, equal cells, no gaps, no
borders, no labels, no text. Each cell is exactly 192 by 192 pixels. Canvas
384 by 192 pixels, aspect ratio 2:1. The figure is in the identical
position and at the identical size in both cells, its boot underside 160
pixels below the top edge, its centre line 96 pixels from the left edge of
its own cell.

Cell 1 — the key pose in full colour. The torso is turned slightly toward
the viewer while the boots stay in side-view profile facing right. Both
arms are stretched perfectly horizontally straight out to left and right at
chest height, elbows locked, with a wide rectangular signal paddle in
warning orange #ff7a45 with a thin near-black border held vertical in each
mitten hand. A matching orange band crosses the chest. Total arm span
exactly 96 pixels at this master scale — the same as the figure's height,
and the widest silhouette in the whole game. Legs planted wide and firm,
knees straight, head level, jaw set, eyes narrowed with total conviction.
The hair is swept back and stays well inside the arm span.

Cell 2 — the identical pose rendered as a pure solid silhouette: every
pixel of the figure, paddles and hair filled with flat near-black #0c1119,
no interior detail, no colour, no outline, against the same fully
transparent background.

Recognition rule: at 12 pixels tall this job must read as a hard letter T
with a heavy base — the arms form one unbroken straight horizontal line at
chest height. Straightness is the whole signal: the moment that line curves
it becomes the Floater's umbrella. Keep the arms perfectly level and the
hair clear of that line.

Lighting: soft key from almost directly overhead, cool fill from below. No
cast shadow, no ground, no props.
```

### 9.5 Brückenbauer

> **Referenz: A0** und **A2**.

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Key-pose sheet for the Builder, one of ten job roles of the Wusel creature:
a small stocky worker, two and a half heads tall, oversized rounded head
with warm sand skin #f4d7ac, one round black dot eye set low, a backward-
swept mane of thick vivid violet hair #9d4edd with highlight #c98bff and
shadow #67219c, one-piece teal work suit #2fc9b8, stubby mitten arms, blunt
dark teal boots #1d8f85, hard near-black outline #0c1119, 8 pixels thick at
this master scale.

Layout: exactly 2 cells in one horizontal row, equal cells, no gaps, no
borders, no labels, no text. Each cell is exactly 192 by 192 pixels. Canvas
384 by 192 pixels, aspect ratio 2:1. The figure is in the identical
position and at the identical size in both cells, its boot underside 160
pixels below the top edge, its centre line 96 pixels from the left edge of
its own cell.

Cell 1 — the key pose in full colour. Strict orthographic side view facing
right. The creature is bent forward from the hips at about thirty degrees,
front knee bent, rear leg braced back, head down watching the work, and has
just laid a plank step in warm brick brown #b5713f flat in front of itself:
48 pixels long and 8 pixels thick at this master scale, its far end
reaching forward and slightly upward out past the body. Both mitten hands
are just leaving the plank. A small amber #ffd23f tool belt at the waist
carries two spare planks tucked in behind the back. The hair has overshot
forward across the top of the head, its tip just past the brow, because the
body has stopped hard.

Cell 2 — the identical pose rendered as a pure solid silhouette: every
pixel of the figure, plank, belt and hair filled with flat near-black
#0c1119, no interior detail, no colour, no outline, against the same fully
transparent background.

Recognition rule: at 12 pixels tall this job must read as "leaning forward,
a bar sticking out ahead and slightly UP". That upward angle is the only
reliable difference from the Miner, whose bar points down. Keep the plank
long, unbroken and clearly rising to the right.

Lighting: soft key from almost directly overhead, cool fill from below. No
cast shadow, no ground, no terrain.
```

### 9.6 Rammer

> **Referenz: A0** und **A2**.

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Key-pose sheet for the Basher, one of ten job roles of the Wusel creature:
a small stocky worker, two and a half heads tall, oversized rounded head
with warm sand skin #f4d7ac, one round black dot eye set low, a backward-
swept mane of thick vivid violet hair #9d4edd with highlight #c98bff and
shadow #67219c, one-piece teal work suit #2fc9b8, stubby mitten arms, blunt
dark teal boots #1d8f85, hard near-black outline #0c1119, 8 pixels thick at
this master scale.

Layout: exactly 2 cells in one horizontal row, equal cells, no gaps, no
borders, no labels, no text. Each cell is exactly 192 by 192 pixels. Canvas
384 by 192 pixels, aspect ratio 2:1. The figure is in the identical
position and at the identical size in both cells, its boot underside 160
pixels below the top edge, its centre line 96 pixels from the left edge of
its own cell.

Cell 1 — the key pose in full colour, the moment of impact. Strict
orthographic side view facing right. The creature thrusts a heavy
sledgehammer fully forward at belly height with both mitten hands: short
amber #ffd23f haft, chunky rectangular near-black head, the haft perfectly
level and horizontal, the head clear of the body outline to the right.
Torso rotated into the blow, rear foot dug in, front knee bent, head pushed
forward, shoulders compressed into a small squash. The hair has shot
forward over the top of the head, its tip past the brow.

Cell 2 — the identical pose rendered as a pure solid silhouette: every
pixel of the figure, hammer and hair filled with flat near-black #0c1119,
no interior detail, no colour, no outline, against the same fully
transparent background.

Recognition rule: at 12 pixels tall this job must read as "solid horizontal
bar projecting forward at MID-BODY height". Bar height is the only
difference from the Digger, whose bar is at foot level, and bar angle is
the only difference from the Miner, whose bar points down at twenty-seven
degrees. Keep this bar exactly level, exactly at mid-body height, and
thick. The hair must never drop to bar height.

Lighting: soft key from almost directly overhead, cool fill from below. No
cast shadow, no ground, no wall, no rubble, no sparks.
```

### 9.7 Schrägbagger

> **Referenz: A0** und **A2**.

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Key-pose sheet for the Miner, one of ten job roles of the Wusel creature: a
small stocky worker, two and a half heads tall, oversized rounded head with
warm sand skin #f4d7ac, one round black dot eye set low, a backward-swept
mane of thick vivid violet hair #9d4edd with highlight #c98bff and shadow
#67219c, one-piece teal work suit #2fc9b8, stubby mitten arms, blunt dark
teal boots #1d8f85, hard near-black outline #0c1119, 8 pixels thick at this
master scale.

Layout: exactly 2 cells in one horizontal row, equal cells, no gaps, no
borders, no labels, no text. Each cell is exactly 192 by 192 pixels. Canvas
384 by 192 pixels, aspect ratio 2:1. The figure is in the identical
position and at the identical size in both cells, its boot underside 160
pixels below the top edge, its centre line 96 pixels from the left edge of
its own cell.

Cell 1 — the key pose in full colour, the moment of the strike. Strict
orthographic side view facing right. The creature drives a pickaxe forward
and downward at exactly twenty-seven degrees below horizontal — two units
forward for every one unit down — with both mitten hands: long amber
#ffd23f handle, curved near-black double-pointed head, the point reaching
toward the lower right and well outside the body outline. Body crouched and
rotated into the strike, rear leg extended, front leg bent under the body,
head down and forward. The hair whips forward and downward along the same
twenty-seven degree diagonal, echoing the blow.

Cell 2 — the identical pose rendered as a pure solid silhouette: every
pixel of the figure, pickaxe and hair filled with flat near-black #0c1119,
no interior detail, no colour, no outline, against the same fully
transparent background.

Recognition rule: at 12 pixels tall this job must read as one long clean
unbroken diagonal running from the upper left of the body to the lower
right. That downward direction is the only reliable difference from the
Builder, whose diagonal rises. Keep the shaft long, straight and unbroken
so the angle survives downscaling.

Lighting: soft key from almost directly overhead, cool fill from below. No
cast shadow, no ground, no terrain, no debris.
```

### 9.8 Gräber

> **Referenz: A0** und **A2**.

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Key-pose sheet for the Digger, one of ten job roles of the Wusel creature:
a small stocky worker, two and a half heads tall, oversized rounded head
with warm sand skin #f4d7ac, one round black dot eye set low, a backward-
swept mane of thick vivid violet hair #9d4edd with highlight #c98bff and
shadow #67219c, one-piece teal work suit #2fc9b8, stubby mitten arms, blunt
dark teal boots #1d8f85, hard near-black outline #0c1119, 8 pixels thick at
this master scale.

Layout: exactly 2 cells in one horizontal row, equal cells, no gaps, no
borders, no labels, no text. Each cell is exactly 192 by 192 pixels. Canvas
384 by 192 pixels, aspect ratio 2:1. The figure is in the identical
position and at the identical size in both cells, its boot underside 160
pixels below the top edge, its centre line 96 pixels from the left edge of
its own cell.

Cell 1 — the key pose in full colour, the moment of the bite. Strict
orthographic side view facing right. Legs braced wide apart, torso bent
deeply forward and down, both arms straight down between the legs, holding
a broad flat-bladed shovel: short amber #ffd23f handle, wide near-black
blade 64 pixels across at this master scale — wider than the creature's
stance — held horizontal and driven just below the boot underside. Head
lowered, looking straight down into the hole. This is the lowest and most
compact pose of all ten job roles. The hair falls forward over the top of
the head and hangs in front of the brow without covering the eye.

Cell 2 — the identical pose rendered as a pure solid silhouette: every
pixel of the figure, shovel and hair filled with flat near-black #0c1119,
no interior detail, no colour, no outline, against the same fully
transparent background.

Recognition rule: at 12 pixels tall this job must read as "wide horizontal
bar at the VERY BOTTOM, at foot level, under a compact crouched body". Bar
height is the only difference from the Basher, whose bar is at mid-body
height. Make this the lowest and widest-at-the-bottom of the ten roles.

Lighting: soft key from almost directly overhead, cool fill from below. No
cast shadow, no ground, no soil, no dust.
```

### 9.9 Magnetiker (ab Welt 4)

> **Referenz: A0** und **A2**.

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Key-pose sheet for the Magnetiser, one of ten job roles of the Wusel
creature, unlocked in the fourth world: a small stocky worker, two and a
half heads tall, oversized rounded head with warm sand skin #f4d7ac, one
round black dot eye set low, a upswept mane of thick vivid violet hair
#9d4edd with highlight #c98bff and shadow #67219c, one-piece teal work suit
#2fc9b8, stubby mitten arms, blunt dark teal boots #1d8f85, hard near-black
outline #0c1119, 8 pixels thick at this master scale.

Layout: exactly 2 cells in one horizontal row, equal cells, no gaps, no
borders, no labels, no text. Each cell is exactly 192 by 192 pixels. Canvas
384 by 192 pixels, aspect ratio 2:1. The figure is in the identical
position and at the identical size in both cells, its boot underside 160
pixels below the top edge, its centre line 96 pixels from the left edge of
its own cell.

Cell 1 — the key pose in full colour. Strict orthographic side view facing
right. The creature stands with feet planted and holds a thick horseshoe
magnet out in front of its chest with both mitten hands: amber #ffd23f
body, two squared near-black pole tips, the opening of the horseshoe
pointing forward to the right, the whole magnet 40 pixels across at this
master scale. Three short concentric arcs of pale cyan #9fd8ff energy
radiate forward from between the pole tips, each a hard-edged pixel arc,
none reaching more than 40 pixels beyond the magnet. Body leaning slightly
back against the pull, head up, expression braced and pleased with itself.
The hair is pulled forward at the tips by the field, angled toward the
magnet — the only role where the hair leans toward the tool.

Cell 2 — the identical pose rendered as a pure solid silhouette: every
pixel of the figure, magnet and hair filled with flat near-black #0c1119,
with the energy arcs OMITTED entirely, against the same fully transparent
background.

Recognition rule: at 12 pixels tall this job must read as "a forked block
held out in front of the chest, opening forward". The fork is the signal:
keep the gap between the two pole tips at least 16 master pixels wide so it
survives downscaling and does not fill in to a solid brick.

Lighting: soft key from almost directly overhead, cool fill from below. No
cast shadow, no ground, no props.
```

### 9.10 Springer (ab Welt 4)

> **Referenz: A0** und **A2**.

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Key-pose sheet for the Jumper, one of ten job roles of the Wusel creature,
unlocked in the fourth world: a small stocky worker, two and a half heads
tall, oversized rounded head with warm sand skin #f4d7ac, one round black
dot eye set low, a upswept mane of thick vivid violet hair #9d4edd
with highlight #c98bff and shadow #67219c, one-piece teal work suit
#2fc9b8, stubby mitten arms, blunt dark teal boots #1d8f85, hard near-black
outline #0c1119, 8 pixels thick at this master scale.

Layout: exactly 2 cells in one horizontal row, equal cells, no gaps, no
borders, no labels, no text. Each cell is exactly 192 by 192 pixels. Canvas
384 by 192 pixels, aspect ratio 2:1. The figure is in the identical
position and at the identical size in both cells, its boot underside 160
pixels below the top edge, its centre line 96 pixels from the left edge of
its own cell.

Cell 1 — the key pose in full colour, the instant before the leap. Strict
orthographic side view facing right. The creature is crouched into a deep
compressed squat, knees fully folded, body squashed to about two thirds of
its normal height and correspondingly wider, both arms swung back behind
the body, head thrust forward and up looking at the far side of a gap.
Under each boot sits a tight coiled steel jump spring in cool grey #8b96a6
with an amber #ffd23f mounting plate, both springs fully compressed to
flat discs. The hair is compressed down onto the crown by the squat,
lagging behind the coming leap.

Cell 2 — the identical pose rendered as a pure solid silhouette: every
pixel of the figure, springs and hair filled with flat near-black #0c1119,
no interior detail, no colour, no outline, against the same fully
transparent background.

Recognition rule: at 12 pixels tall this job must read as "squashed low and
wide, arms swept back, coiled". It is the shortest of the ten roles — the
Digger crouches too, but the Digger has a wide bar at foot level and this
one has none. Keep the space in front of the Jumper completely empty; the
absence of a tool in front is part of the signal.

Lighting: soft key from almost directly overhead, cool fill from below. No
cast shadow, no ground, no props, no motion lines.
```

---

## §10 Todesarten

GDD §5: „Sie sterben sichtbar — Sturz, Ertrinken, Feuer, Zerquetschen. Jeder Tod hat eine
eigene Animation. Das darf ruhig ein bisschen wehtun."

Alle fünf Blätter benutzen **dieselbe Bildzahl und dieselbe Haltedauer wie `dying`**:
8 Bilder, 3-3-3-3-3-3-4-4 = 26 Ticks (`grafik-integration.md` §2.3). Damit sind sie ohne
Codeänderung austauschbar; der Renderer wählt nur die Zeile nach `DeathCause`.

**Die gemeinsame Regel aus §3.5 gilt in allen fünf:** Das Haar hört **vor** dem Körper auf,
sich zu bewegen. Ab Bild 6 ist es still. Das ist der einzige Grund, warum eine 26-Tick-
Animation überhaupt als Tod und nicht als Umfallen liest.

**Und die Grenze, die nicht überschritten wird:** kein Blut, keine Innereien, keine
abgetrennten Gliedmaßen, keine roten Flüssigkeiten. Das Gewicht kommt aus Squash, Farbverlust
und plötzlicher Stille. Die Zielgruppe ist 35+ mit Nostalgiebindung (GDD §10), nicht ein
Horrorpublikum, und das Spiel muss in jedem Store durchgehen.

### 10.1 Sturz — Aufprall (`SPLAT`)

> **Referenz: A0.** Für dieses Blatt ist **Tripo** der bessere Weg (§17.1): Ein Aufprall
> lebt vom exakten Squash-Verlauf über acht Bilder, und den hält kein Bildmodell konsistent.

```
[PREPEND STYLE BLOCK K]
[PREPEND SHEET CONTRACT]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

One-shot impact death sequence of the Wusel creature (oversized rounded
head with warm sand skin #f4d7ac, backward-swept vivid violet hair mane
#9d4edd with highlight #c98bff and shadow #67219c, teal one-piece suit
#2fc9b8, dark teal boots #1d8f85, near-black outline #0c1119): hitting the
ground after falling too far.

Exactly 8 frames in one row. Canvas 1536 by 192 pixels, aspect ratio 8:1.
This sequence plays once and does not loop.

Frame 1 — the last instant of the fall, arms above the head, body stretched
vertically, mouth a small round shout, hair pulled straight up by the
airflow. Boots just touching the ground contact line.
Frame 2 — first contact: the boots flatten and spread, the legs compress
into the torso, the head still travelling down, the hair still straight up.
Frame 3 — maximum squash: the whole creature flattened to about one third
of its height and spread nearly twice its normal width, the head squeezed
into a wide oval, arms shot out sideways. The hair is slammed flat outward
into a low wide red fan, wider than the body — the single widest hair
shape in the game.
Frame 4 — the smallest rebound: the shape springs back up by a fifth of its
height and narrows slightly, the hair lifting a little at the tips. This is
the only upward motion of the sequence and it must be small.
Frame 5 — settling down again, flatter than frame 4 but not as flat as
frame 3, arms dropping, a thin ring of pale dust spreading outward around
the base.
Frame 6 — motionless. The teal desaturates one step toward the outline
tone, the red hair desaturates toward #67219c. The hair is in exactly the
same position as in frame 5, pixel for pixel.
Frame 7 — the shape reduced further, colours flattening toward a single
dull tone, the dust ring drifting wider and thinning. Hair unchanged.
Frame 8 — a small motionless flattened heap no taller than a quarter of the
original figure, one recognisable boot shape at one end, one flat wisp of
faded red at the other, and a last thin trace of dust.

The sequence must read as sudden, hard and heavy — everything happens in
frames 2 and 3, and the remaining five frames are consequences. No blood,
no gore, no red fluid, no detached limbs, no cracked ground drawn into the
sprite.
```

### 10.2 Ertrinken

Wasser ist eine Falle aus GDD §5. Der Ertrinkungstod ist der **langsamste** der fünf und
der einzige, bei dem die Figur nach unten aus dem Bild verschwindet — das Blatt zeigt das
Absacken trotzdem nicht als Bewegung, sondern als Haltung, weil die Grundlinie fest ist.

> **Referenz: A0.**

```
[PREPEND STYLE BLOCK K]
[PREPEND SHEET CONTRACT]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

One-shot drowning death sequence of the Wusel creature (oversized rounded
head with warm sand skin #f4d7ac, backward-swept vivid violet hair mane
#9d4edd with highlight #c98bff and shadow #67219c, teal one-piece suit
#2fc9b8, dark teal boots #1d8f85, near-black outline #0c1119): sinking in
deep water. The water itself is NOT drawn — it is a separate asset
composited by the engine.

Exactly 8 frames in one row. Canvas 1536 by 192 pixels, aspect ratio 8:1.
This sequence plays once and does not loop. The ground contact line stays
fixed in every cell; the sinking is expressed through posture, buoyancy and
colour, never through vertical travel.

Frame 1 — panic: arms thrashing straight up above the head, body upright
and stiff, mouth a wide round gasp, eye enormous. The hair is lifted and
splayed by the water, floating outward rather than swept back — from this
frame on the hair behaves as if weightless, drifting instead of falling.
Frame 2 — one arm reaching higher than the other, body twisting, three
round air bubbles rising from the mouth in a diagonal line.
Frame 3 — arms sinking to shoulder height, body slumping, legs starting to
drift apart, five smaller bubbles.
Frame 4 — the body goes limp and rolls slowly forward, arms hanging out
from the shoulders, head tipping down, eye half closed, two last bubbles.
Frame 5 — fully limp, arms and legs hanging loosely downward, head bowed,
body drifting a few degrees off vertical. The hair fans slowly out above
the head, weightless. This is the last frame in which anything moves.
Frame 6 — motionless. The whole figure cools and darkens by one step, the
teal shifting toward a colder tone and the skin losing warmth. The hair is
in exactly the same position as in frame 5 and desaturates toward #67219c.
Frame 7 — darker again, the outline softening, the figure reading as
further away below the surface, colours converging toward a single dull
blue-grey. Hair unchanged in position.
Frame 8 — a dark, almost monochrome limp silhouette with only a faint trace
of red left in the hair, the last thing still identifiable.

Distinct from every other death in one respect the player must catch at 12
pixels tall: this one keeps the creature's full height and shape and takes
away its colour, whereas the impact and crushing deaths flatten it. Nothing
here squashes.

No blood, no gore, no red fluid, no water surface, no splash, no ripples.
```

### 10.3 Feuer

> **Referenz: A0.**

```
[PREPEND STYLE BLOCK K]
[PREPEND SHEET CONTRACT]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

One-shot burning death sequence of the Wusel creature (oversized rounded
head with warm sand skin #f4d7ac, backward-swept vivid violet hair mane
#9d4edd with highlight #c98bff and shadow #67219c, teal one-piece suit
#2fc9b8, dark teal boots #1d8f85, near-black outline #0c1119): caught in a
flame jet. The flame jet itself is NOT drawn — it is a separate asset.

Exactly 8 frames in one row. Canvas 1536 by 192 pixels, aspect ratio 8:1.
This sequence plays once and does not loop.

Frame 1 — the catch: the creature freezes mid-stride, arms flung up, mouth
a round shout, eye huge, the whole figure rim-lit in amber #ffd23f from the
right. Small flame licks in amber and orange #ff7a45 appear along the right
side of the body. The hair is snatched straight upward by the rising heat.
Frame 2 — the flames spread up the body, the figure hopping on one foot,
arms windmilling. The hair is fully vertical, its tips already brightening
toward amber.
Frame 3 — fully alight: hard-edged flame clusters in white-hot core, amber
middle and orange fringe cover the shoulders and back, the body a dark
shape inside them, arms out wide. The hair is now indistinguishable in
colour from the flame and reads as part of it.
Frame 4 — the body begins to shrink and hunch, knees bending, the outline
starting to blacken from the boots upward, the flame at its largest.
Frame 5 — collapsing into a crouch, the figure two thirds charred to a flat
dark tone, the flame receding to the shoulders and head. The hair has burnt
back to a short stub and stops moving here.
Frame 6 — motionless, kneeling heap, the whole figure a uniform dark
charcoal with a few orange embers glowing at the edges. Hair stub
unchanged, now dark.
Frame 7 — the embers cooling to dull red, the shape settling one step
lower, thin grey smoke rising in two thin columns.
Frame 8 — a small motionless dark heap about a third of the original
height, one last ember, one thin wisp of smoke, and no red left anywhere.

The loss of the red hair is the readable signal of this particular death:
it is the only death in the game in which the creature's signature colour
disappears completely, and at 12 pixels tall that is exactly what the
player registers.

No blood, no gore, no charred flesh detail, no skull, no screaming face
beyond the shout in frame 1.
```

### 10.4 Zerquetschen (`CRUSHED`)

> **Referenz: A0.** Für dieses Blatt ist **Tripo** der bessere Weg (§17.1): Der Squash muss
> volumenerhaltend aussehen, und genau das ist an einem Modell trivial und an einem
> Bildmodell nicht zu bekommen.

```
[PREPEND STYLE BLOCK K]
[PREPEND SHEET CONTRACT]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

One-shot crushing death sequence of the Wusel creature (oversized rounded
head with warm sand skin #f4d7ac, backward-swept vivid violet hair mane
#9d4edd with highlight #c98bff and shadow #67219c, teal one-piece suit
#2fc9b8, dark teal boots #1d8f85, near-black outline #0c1119): flattened
from above by a descending press. The press itself is NOT drawn — it is a
separate asset composited by the engine.

Exactly 8 frames in one row. Canvas 1536 by 192 pixels, aspect ratio 8:1.
This sequence plays once and does not loop. Everything is compressed
downward from an implied flat plate above; the compression must look
volume-preserving, so whatever the figure loses in height it gains in
width.

Frame 1 — standing normally, looking up, eye wide, both arms raised in a
futile push against something above. The hair is pressed down flat onto the
crown by the plate.
Frame 2 — compressed to four fifths height and correspondingly wider, knees
bending outward, arms buckling at the elbows, mouth a small round shout.
The hair squeezes out sideways from under the plate.
Frame 3 — compressed to three fifths, the head sinking into the shoulders,
the torso bulging at the sides, arms splayed straight out horizontally.
Frame 4 — compressed to two fifths, the head no longer distinguishable from
the torso, the whole figure a wide bulging cushion, boots squeezed out to
the sides. The hair is forced out into a wide flat red fan on both sides,
level with the top of the shape.
Frame 5 — maximum compression to about one sixth of the original height and
two and a half times its width: a flat wide slab with a slight bulge at the
centre, boots and mitten hands still recognisable at the outer ends. This
is the last frame in which anything moves. A thin ring of dust puffs out
sideways along the ground.
Frame 6 — motionless. The slab desaturates one step, teal toward the
outline tone, red toward #67219c. Position identical to frame 5, pixel for
pixel.
Frame 7 — the slab relaxes very slightly and flattens further, colours
converging toward one dull tone, the dust drifting outward and thinning.
Frame 8 — a flat motionless wide slab about one eighth of the original
height, one boot shape at one end, one flat trace of faded red at the
other, and the last of the dust.

The horror is entirely in the geometry: this is the only death in which the
figure ends up wider than it is tall. That extreme aspect ratio is the
signal and must be unmistakable at 12 pixels.

No blood, no gore, no red fluid, no detached limbs, no press drawn.
```

### 10.5 Sprengung (`EXPLOSION`, `NUKE`)

Der häufigste Tod im Spiel, weil er der einzige ist, den der Spieler **absichtlich**
auslöst — beim Sprengmeister und bei der Selbstzerstörung. Er darf deshalb als einziger
komisch statt tragisch sein.

> **Referenz: A0.**

```
[PREPEND STYLE BLOCK K]
[PREPEND SHEET CONTRACT]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

One-shot explosion death sequence of the Wusel creature (oversized rounded
head with warm sand skin #f4d7ac, backward-swept vivid violet hair mane
#9d4edd with highlight #c98bff and shadow #67219c, teal one-piece suit
#2fc9b8, dark teal boots #1d8f85, near-black outline #0c1119): blown up by
the bomb it was carrying.

Exactly 8 frames in one row. Canvas 1536 by 192 pixels, aspect ratio 8:1.
This sequence plays once and does not loop. Nothing may leave its own cell,
so the blast is kept compact and tall rather than wide.

Frame 1 — the last instant: the creature stands still, clutching the bomb
at its belly, eye squeezed shut, shoulders hunched, resigned rather than
terrified. The hair stands straight up in anticipation. This frame is
almost calm and that contrast is the joke.
Frame 2 — ignition: a small hard white flash at belly height, the figure
lit from within, the outline briefly white-hot, the body stretched upward
by a few pixels. The hair is blown outward into a starburst.
Frame 3 — the blast: a tight ball of hard-edged flame clusters in
white-hot core, amber #ff9a3c middle and orange #ff7a45 fringe, filling the
lower two thirds of the cell, with the creature's dark silhouette still
faintly visible inside it, arms and legs flung outward.
Frame 4 — the fireball at its largest, nearly filling the cell, edges
breaking into lobes, the figure no longer recognisable. Six or seven small
dark chunks and one intact boot fly outward but stay inside the cell.
Frame 5 — the fire collapses into a rising column of grey #5a5a5a smoke,
the base still glowing amber, the chunks falling back down. This is the
last frame in which anything of the creature moves.
Frame 6 — smoke only, a fat rolling column with a dull orange glow at its
base, and on the ground a small dark scorch smudge with one recognisable
boot lying on its side.
Frame 7 — the smoke thinning and drifting upward and slightly to one side,
the glow gone, the scorch and boot unchanged.
Frame 8 — a last thin wisp of smoke, the scorch smudge, the boot, and one
tiny surviving mane of faded red hair lying beside it. That mane is the
punchline and must be clearly visible at 12 pixels.

Hard-edged pixel clusters throughout — no soft airbrushed fire, no bloom,
no lens flare. The blast is bright but never washes out to pure white for
more than one frame.

No blood, no gore, no red fluid, no body parts other than the intact boot.
```

---

## §11 Terrainmaterialien

**Die Wertebänder sind nicht verhandelbar und stehen in `grafik-integration.md` §5.0.**
Kurz zur Erinnerung, warum: Der Renderer addiert auf jeden Kachelwert Korn, Oberkanten-
aufhellung und den Frischesaum von +30 (`freshBoost`) und zieht Tiefenabdunklung ab. Verlässt
die Kachel das Band, klemmt `clamp255()` — und dann verschwindet genau dort die frische
Bruchkante, die laut GDD §6 die eigene Arbeit sichtbar machen soll. Die Bänder stehen in
jedem Prompt unten mit drin, weil sie Teil der Anweisung an das Modell sind.

Ein zweiter Punkt aus derselben Quelle, der oft übersehen wird: Die Kacheln werden in
**Weltkoordinaten** abgetastet. Jede Richtungstendenz in der Struktur wird dadurch zur
sichtbaren Diagonale über den ganzen Bildschirm.

### 11.1 Erde — 64 × 64 logisch

> **Referenz: A3.**

```
[PREPEND STYLE BLOCK U]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

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

### 11.2 Fels — 64 × 64 logisch

> **Referenz: A3.**

```
[PREPEND STYLE BLOCK U]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

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

### 11.3 Stahl — 64 × 64 logisch

**Ehrlich vorweg, und das ist die deutlichste Empfehlung dieses Abschnitts:** Diese Kachel
sollte man **nicht generieren lassen.** Das Raster ist im Code exakt festgelegt
(`terrainView.ts`: Schachbrettzelle 4 logische Pixel, Niete bei `x % 8 == 4 && y % 8 == 4`)
und damit arithmetisch ableitbar. Ein zwanzigzeiliges Skript malt sie aus der Formel und
trifft auf den Pixel; ein Bildmodell trifft sie nie. Der Prompt ist als **Musterbild** für
Fase, Niete und Kratzer gedacht — man baut danach nach.

> **Referenz: A3.**

```
[PREPEND STYLE BLOCK U]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

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

Value range: no pixel below 24 or above 232 on any channel.

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

### 11.4 Gebaute Stufe — 48 × 8 logisch

Das einzige Material, das der Spieler erzeugt, und das mit Abstand dünnste: Der
Brückenbauer legt Reihen von genau **einem** Pixel Höhe. Jede Bildzeile der Kachel wird
deshalb einzeln und isoliert gesehen — senkrechte Maserung ist im Spiel unsichtbar. Was
zählt, ist allein der waagerechte 6-Pixel-Rhythmus.

> **Referenz: A3.**

```
[PREPEND STYLE BLOCK U]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

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
texture, drawn as an 8-pixel-wide dark notch running the full height of the
strip. Between the seams the plank body is one step lighter, with a small
nail head near each seam and a slightly chipped, irregular edge along the
top row. Exactly eight seams across the strip.

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

### 11.5 Grasnarbe — Deckschicht mit Alpha, 64 × 8 logisch

Die Narbe liegt nur dort, wo `openAbove && !isFresh` gilt. Wo frisch gegraben wurde, gibt es
keine Narbe — das ist der sichtbare Beweis der eigenen Arbeit und darf durch die Textur nicht
aufgeweicht werden.

> **Referenz: A3.**

```
[PREPEND STYLE BLOCK U]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Seamless horizontally tileable overlay strip: the grass crust that sits on
top of undisturbed soil in a side-scrolling game. This is an overlay with
transparency, composited by the engine on top of a separate soil texture.

Layout: the strip is 8 logical pixels tall, 64 pixels of this master
texture, and reads strictly top to bottom as depth below the surface.

Row band 1, the topmost 8 master pixels: the surface itself, fully opaque,
lush grass green #4f8f3c, with a few individual blades and manes breaking
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
mane — the strip repeats many times across a level. No vertical tiling.

Value range: no channel below 32 or above 216.

Lighting: flat and even, no directional shadow, no highlight along the top
edge. The engine handles surface lightening.

Pixel art on a strict square pixel grid, roughly 12 colours plus alpha.

Master scale: 512 by 64 pixels, representing 64 by 8 logical game pixels at
8x. Transparent where specified. Aspect ratio 8:1.
```

### 11.6 Bruchkantenstudie

**Kein Asset.** Eine Studie zur Farbfindung, weil die frische Bruchkante die einzige Stelle
ist, an der der Spieler seine eigene Arbeit sieht (GDD §6), und weil sie im Code als
Aufhellung um 30 realisiert ist — man muss sehen, ob das für jedes Material reicht.

> **Referenz: A3.**

```
[PREPEND STYLE BLOCK U]
[APPEND NEGATIVE PROMPT]

Material study board for a game with pixel-destructible terrain, showing
how a freshly cut edge differs from settled, undisturbed material. This is
a reference image for colour decisions, not a game asset.

Layout: exactly 4 panels in one horizontal row, equal panels, thin hairline
separators, no text, no labels, no arrows. Canvas 2048 by 1024 pixels,
aspect ratio 2:1.

Every panel shows the same situation in a different material: a solid mass
of that material occupying the whole panel, with one clean tunnel bored
horizontally through the middle of it and one vertical shaft cutting down
from the top. The tunnels have hard, exact, pixel-cut edges — no crumbling
outline, no rounded mouth — because they were removed by an exact bitmask
and must look it.

Panel 1 — soil #6b4a2e with a grass crust #4f8f3c along the top. Note that
the grass crust is absent along the freshly cut edges of the tunnel, and
present only on the undisturbed original surface. That contrast is the
single most important thing this board has to show.
Panel 2 — rock #565d6b.
Panel 3 — soil again, but with an older tunnel that has already settled:
its edges are the same tone as the surrounding mass.
Panel 4 — built wooden steps #b5713f forming a staircase up through open
space, freshly laid.

In panels 1, 2 and 4 every freshly cut edge carries a rim exactly one pixel
wide at final resolution that is clearly one full value step brighter than
the material behind it — bright enough to trace the tunnel by eye from
across the image, subtle enough not to read as a glowing outline. Panel 3
has no such rim anywhere, and the difference between panel 1 and panel 3
must be obvious at a glance.

Loose crumbs and small chips lie on the tunnel floors. No characters, no
tools, no light sources, no glow, no coloured lighting — the brightening is
material, not illumination.

Flat even lighting throughout. Pixel art on a strict square pixel grid,
roughly 24 colours. Opaque.
```

---

## §12 Die sechs Welten

GDD §6 gibt jeder Welt ein eigenes Materialgesetz. Für die Grafik heißt das: **Die Welt
muss ihre Regel zeigen, bevor der Spieler sie erlebt.** Rutschiges Eis muss glänzen,
steigende Lava muss von unten leuchten, der Stahl der Fabrik muss überall präsent sein.

Je Welt zwei Blätter:

- **Materialtafel** — vier Materialien nebeneinander. Sie liefert die Farbwerte, die danach
  in `palette.ts` eingetragen werden.
- **Parallax** — die vier Tiefenebenen als **Streifen untereinander** in einem Bild. Das ist
  der entscheidende Kniff: Fordert man eine Szene, liefert das Modell eine fertig
  komponierte Szene, die man nicht mehr in Ebenen zerlegen kann. Man erzeugt vier Streifen
  und schneidet sie auseinander.

**Zum Stand der Paletten:** Grasland und Kristallhöhle stehen in `palette.ts`. Für die
vier weiteren Welten schlagen die Prompts unten Werte vor, die zur bestehenden Logik passen
(dunkler Himmel oben, hellerer Horizont, drei Hügelebenen mit steigender Helligkeit) und die
Wertebänder aus §11 einhalten. **Diese vier Paletten sind Vorschläge und müssen nach der
Abnahme in `palette.ts` nachgezogen werden.**

| Welt | `skyTop` | `skyBottom` | `hills` | `earth` | `crust` | `rock` | `glow` |
|---|---|---|---|---|---|---|---|
| Grasland | `#101c33` | `#3d5f7d` | `#1b2f42` `#24415a` `#2f5570` | `#6b4a2e` | `#4f8f3c` | `#565d6b` | `#ffd98a` |
| Kristallhöhle | `#0a0f22` | `#1d2b52` | `#121a33` `#1a2544` `#243158` | `#3e4a72` | `#6f8ad6` | `#35405f` | `#9fd8ff` |
| Ewiges Eis *(Vorschlag)* | `#0b1a2b` | `#5a8fb0` | `#14304a` `#1d4664` `#2a5f80` | `#6f96ad` | `#9ab5c6` | `#3f6a80` | `#bfe9ff` |
| Zahnradfabrik *(Vorschlag)* | `#1a1410` | `#6b4a30` | `#241c16` `#33261c` `#453325` | `#4f463c` | `#6b6055` | `#3f4a52` | `#ffb14d` |
| Vulkanschlund *(Vorschlag)* | `#1a0a10` | `#7a2a1e` | `#2a1014` `#401a18` `#58261c` | `#4a3a34` | `#8a3a22` | `#3a3436` | `#ff7a45` |
| Wolkenwerft *(Vorschlag)* | `#2a3a6b` | `#9ab4d6` | `#4a5c8a` `#6a7ca6` | `#8a9cc2` | `#a08a6a` | `#6b6f7d` | `#ffe9b0` |

Stahl bleibt in allen sechs Welten `#8b96a6` und die gebaute Stufe `#b5713f` — beides sind
Spielsignale, nicht Weltdekoration, und dürfen nie umgefärbt werden. **Ebenso das Haar.**

### 12.1 Grasland — Material (Anker A3)

> **Referenz: keine (Ankerbild).**

```
[PREPEND STYLE BLOCK U]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Material board for the world "Grassland", the tutorial world of a side-
scrolling puzzle game: soft, everything diggable, friendly and inviting.

Layout: exactly 4 seamless material swatches in one horizontal row, equal
cells, thin hairline separators, no text, no labels, no numbers. Canvas
2048 by 512 pixels, each swatch 512 by 512. Opaque. Aspect ratio 4:1.

Swatch 1 — topsoil with grass crust: body #6b4a2e, the upper eighth a lush
grass layer #4f8f3c with a few individual blades breaking the line, small
roots hanging down into the soil below.
Swatch 2 — deep soil: #6b4a2e with embedded pebbles, darker toward the
bottom, crumbly and loose, unmistakably diggable.
Swatch 3 — grey bedrock: #565d6b, angular interlocking facets, thin dark
cracks, harder than soil but still workable.
Swatch 4 — riveted steel plate: #8b96a6, dome rivets on a regular grid,
cold, machined and unmistakably indestructible.

Value range across all four swatches: no channel below 32 or above 200,
because the engine brightens freshly cut edges on top of these values.

Warm midday mood, gentle and inviting, the friendliest world in the game.
The four swatches must be distinguishable from one another in greyscale
alone, by value and by structure, not by hue.

Flat even lighting in every swatch — no directional shadow, no vignette, no
hotspot. Pixel art on a strict square pixel grid.
```

### 12.2 Grasland — Parallax (Anker A4)

> **Referenz: A3.**

```
[PREPEND STYLE BLOCK U]
[APPEND NEGATIVE PROMPT]

Parallax background layer sheet for the world "Grassland" of a side-
scrolling puzzle game. Strictly orthographic side view, no perspective
convergence, no vanishing point.

Layout, critical: exactly 4 separate horizontal strips stacked vertically
in one image, equal height, separated by thin hairline gaps, each strip a
complete independent background layer that will be cut out and scrolled at
its own speed. Do NOT compose the four into one finished scene. Canvas 2048
by 1536 pixels, each strip 2048 by 384. Aspect ratio 4:3.

Strip 1, the sky, opaque and full-bleed: a smooth vertical gradient from
deep night blue #101c33 at the top to a pale dusty blue #3d5f7d at the
bottom, with visible ordered dithering in the transition, a scatter of tiny
faint stars in the upper third, and one small soft moon disc off to one
side.
Strip 2, far hills, transparent above the silhouette: a low rolling ridge
line in flat #1b2f42, softly rounded and generous in shape, hazy, no
internal detail at all, occupying the lower two thirds of the strip.
Strip 3, mid hills, transparent above the silhouette: a taller and closer
ridge in flat #24415a with just a hint of internal value variation, a few
simple rounded tree clumps along the crest, occupying the lower three
quarters.
Strip 4, near hills, transparent above the silhouette: the closest and
darkest ridge in #2f5570, with readable rounded tree shapes, a few boulders
and a drifting band of low mist at its base, occupying almost the full
strip height.

Every strip must tile seamlessly left to right: the left and right edges
must join without a visible seam and with no landmark distinctive enough to
be recognised on repeat.

Value separation between the strips is the whole point — each must read as
its own distinct plane in greyscale. Foreground darkest and most saturated,
distance progressively lighter, cooler and hazier.

Warm, inviting, slightly toy-like. Rounded generous landscape shapes,
nothing spiky, nothing grim. No characters, no creatures, no text, no
logos, no UI, no foreground props.
```

### 12.3 Kristallhöhle — Material

> **Referenz: A3.**

```
[PREPEND STYLE BLOCK U]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Material board for the world "Crystal Cave" of a side-scrolling puzzle
game: glowing stone, deep darkness, the player's sight limited to a radius
around the creatures.

Layout: exactly 4 seamless material swatches in one horizontal row, equal
cells, thin hairline separators, no text, no labels. Canvas 2048 by 512
pixels, each swatch 512 by 512. Opaque. Aspect ratio 4:1.

Swatch 1 — crystal-bearing soil with a glowing crust: body #3e4a72, the
upper eighth a luminous mineral crust #6f8ad6 with small faceted crystal
points breaking upward out of it.
Swatch 2 — deep cave soil: #3e4a72, packed and gritty with tiny embedded
crystal specks that catch a cold light, still clearly diggable.
Swatch 3 — dark cave rock: #35405f, angular facets, deep crevices, a few
thin veins of violet #a06be0 running through it.
Swatch 4 — riveted steel plate: #8b96a6, identical in construction to every
other world's steel, cold and machined, reading as foreign to this cave.

Value range across all four swatches: no channel below 32 or above 200.

Cold, quiet, subterranean mood. The glow must be expressed as brighter
material value, never as a painted light halo — the engine adds real
lighting on top and a baked halo would double up.

The four swatches must be distinguishable in greyscale alone. Flat even
lighting in every swatch, no directional shadow, no vignette. Pixel art on
a strict square pixel grid.
```

### 12.4 Kristallhöhle — Parallax

> **Referenz: A4.**

```
[PREPEND STYLE BLOCK U]
[APPEND NEGATIVE PROMPT]

Parallax background layer sheet for the world "Crystal Cave" of a side-
scrolling puzzle game. Strictly orthographic side view, no perspective
convergence.

Layout, critical: exactly 4 separate horizontal strips stacked vertically
in one image, equal height, separated by thin hairline gaps, each strip a
complete independent background layer to be cut out and scrolled at its own
speed. Do NOT compose them into one finished scene. Canvas 2048 by 1536
pixels, each strip 2048 by 384. Aspect ratio 4:3.

Strip 1, the far cavern void, opaque and full-bleed: a vertical gradient
from near-black #0a0f22 at the top to deep indigo #1d2b52 at the bottom,
with ordered dithering in the transition and a slow drift of tiny cold
motes.
Strip 2, distant crystal formations, transparent above the silhouette: a
skyline of large blunt crystal shards in flat #121a33, softly faceted and
rounded at the tips rather than needle-sharp, hazy and without internal
detail.
Strip 3, mid crystal columns, transparent above the silhouette: closer
columns in #1a2544 with faint internal facet lines and a few glowing veins
in violet #a06be0, plus stalactites hanging down from the top edge of the
strip.
Strip 4, near cave wall, transparent above the silhouette: the closest
layer in #243158, a rugged wall edge with clustered crystals along it, some
of them glowing pale cyan #9fd8ff, and a band of cold ground mist at the
base.

Every strip tiles seamlessly left to right with no recognisable landmark.

Value separation between strips is essential; each must read as its own
plane in greyscale. The glow is expressed as brighter pixel values in the
crystals themselves, not as painted light bloom.

Rounded, blunt, slightly toy-like crystal shapes — nothing needle-sharp,
nothing menacing. No characters, no creatures, no text, no logos, no UI.
```

### 12.5 Ewiges Eis — Material

> **Referenz: A3.**

```
[PREPEND STYLE BLOCK U]
[APPEND NEGATIVE PROMPT]

Material board for the world "Eternal Ice" of a side-scrolling puzzle game.
The rule of this world is that surfaces are slippery and creatures slide
along them, so every material must visibly say "slick".

Layout: exactly 4 seamless material swatches in one horizontal row, equal
cells, thin hairline separators, no text, no labels. Canvas 2048 by 512
pixels, each swatch 512 by 512. Opaque. Aspect ratio 4:1.

Swatch 1 — packed snow with a hard glazed crust: body #6f96ad, the upper
eighth a pale wind-polished crust #9ab5c6 with a crisp horizontal glaze
line and small drift ripples.
Swatch 2 — deep firn snow: #6f96ad, granular and compacted, with faint
horizontal compression layers and a few tiny trapped air bubbles, clearly
diggable.
Swatch 3 — blue glacier ice: #3f6a80, hard translucent-looking facets with
sharp internal fracture planes, thin white stress cracks, and pale specular
glints along the facet edges. Harder than snow but still workable.
Swatch 4 — riveted steel plate: #8b96a6, identical to every other world's
steel, with a thin rime of frost gathered in its recesses.

Value range across all four swatches: no channel below 32 or above 200.
This world sits near the top of that band, so check the histogram
carefully — an ice texture that clips at the bright end loses the freshly
cut edge entirely.

Cold, bright, high-key mood. Slickness is expressed through hard specular
glints and long straight polished edges, never through a soft airbrushed
sheen.

The four swatches must be distinguishable in greyscale alone. Flat even
lighting, no directional shadow, no vignette. Pixel art on a strict square
pixel grid.
```

### 12.6 Ewiges Eis — Parallax

> **Referenz: A4.**

```
[PREPEND STYLE BLOCK U]
[APPEND NEGATIVE PROMPT]

Parallax background layer sheet for the world "Eternal Ice" of a side-
scrolling puzzle game. Strictly orthographic side view, no perspective
convergence.

Layout, critical: exactly 4 separate horizontal strips stacked vertically
in one image, equal height, separated by thin hairline gaps, each a
complete independent background layer to be cut out and scrolled at its own
speed. Do NOT compose them into one finished scene. Canvas 2048 by 1536
pixels, each strip 2048 by 384. Aspect ratio 4:3.

Strip 1, the sky, opaque and full-bleed: a vertical gradient from cold deep
blue #0b1a2b at the top to a pale washed blue #5a8fb0 at the bottom, with
ordered dithering, a faint pale sun disc low near the horizon and a thin
band of high ice cloud.
Strip 2, far mountain range, transparent above the silhouette: rounded
snow-capped peaks in flat #14304a, hazy, no internal detail, sitting in the
lower two thirds of the strip.
Strip 3, mid glacier field, transparent above the silhouette: a closer
stepped glacier terrace in #1d4664 with broad flat terraces and a few
rounded ice boulders on top, plus a suggestion of a crevasse as a darker
vertical notch.
Strip 4, near ice cliff, transparent above the silhouette: the closest and
darkest layer in #2a5f80, a blocky ice cliff edge with blunt hanging
icicles along its underside, a few pale specular glints on its upper
surfaces, and drifting snow haze at the base.

Every strip tiles seamlessly left to right with no recognisable landmark.

Value separation between strips is essential; each must read as its own
plane in greyscale, which is harder in a high-key world than anywhere else
— push the separation further than feels natural.

Rounded, blunt, generous shapes. No characters, no creatures, no text, no
logos, no UI.
```

### 12.7 Zahnradfabrik — Material

> **Referenz: A3.**

```
[PREPEND STYLE BLOCK U]
[APPEND NEGATIVE PROMPT]

Material board for the world "Gearworks" of a side-scrolling puzzle game: a
grimy industrial factory full of presses, conveyor belts and above all a
great deal of indestructible steel.

Layout: exactly 4 seamless material swatches in one horizontal row, equal
cells, thin hairline separators, no text, no labels. Canvas 2048 by 512
pixels, each swatch 512 by 512. Opaque. Aspect ratio 4:1.

Swatch 1 — soot-caked floor plating with a grimy top skin: body #4f463c,
the upper eighth an oil-darkened metal skin #6b6055 with a hard straight
edge and small spilled bolts and washers scattered along it.
Swatch 2 — compacted industrial fill: #4f463c, packed cinders, coal grit,
broken brick fragments and short wire ends, dirty but clearly diggable.
Swatch 3 — cast iron bedrock: #3f4a52, blocky angular slabs with cast seam
lines, rust blooms in warm brown gathering in the crevices, harder than the
fill but still workable.
Swatch 4 — riveted steel plate: #8b96a6, the signature material of this
world, dome rivets on a regular grid, machined bevels, faint brushed
striations, unmistakably indestructible.

Value range across all four swatches: no channel below 32 or above 200.

Warm grimy mood, oil and soot, lit as if by furnace light from somewhere
off frame — but expressed as material colour, not as a painted light.

The hardest problem of this world is that three of its four materials are
grey. They must therefore separate by structure: swatch 2 granular and
irregular, swatch 3 blocky with cast seams, swatch 4 perfectly regular with
rivets. Check them in greyscale and exaggerate the structural difference
until all four are unmistakable.

Flat even lighting, no directional shadow, no vignette. Pixel art on a
strict square pixel grid.
```

### 12.8 Zahnradfabrik — Parallax

> **Referenz: A4.**

```
[PREPEND STYLE BLOCK U]
[APPEND NEGATIVE PROMPT]

Parallax background layer sheet for the world "Gearworks" of a side-
scrolling puzzle game. Strictly orthographic side view, no perspective
convergence.

Layout, critical: exactly 4 separate horizontal strips stacked vertically
in one image, equal height, separated by thin hairline gaps, each a
complete independent background layer to be cut out and scrolled at its own
speed. Do NOT compose them into one finished scene. Canvas 2048 by 1536
pixels, each strip 2048 by 384. Aspect ratio 4:3.

Strip 1, the factory hall void, opaque and full-bleed: a vertical gradient
from sooty near-black #1a1410 at the top to a warm smoggy brown #6b4a30 at
the bottom, with ordered dithering and drifting soot motes.
Strip 2, distant machinery, transparent above the silhouette: a skyline of
large flat-toothed cogwheels, boiler drums and pipe runs in flat #241c16,
hazy and without internal detail. The cog teeth are big, blunt and rounded
— chunky toy machinery, not precision engineering.
Strip 3, mid machinery, transparent above the silhouette: closer gears,
pistons and a horizontal conveyor run in #33261c, with visible bolt heads
and a few small dull indicator lamps in amber #ffb14d.
Strip 4, near structure, transparent above the silhouette: the closest and
darkest layer in #453325, heavy riveted girders forming a rough frame along
the bottom and up the sides, thick pipes with valve wheels, hanging chains,
and a low band of warm steam at the base.

Every strip tiles seamlessly left to right with no recognisable landmark —
which is unusually hard here, because machinery is regular. Make the
repeat rhythm of gears and girders deliberately irregular in spacing.

Value separation between strips is essential; each must read as its own
plane in greyscale.

Chunky, rounded, toy-like machinery. Nothing sharp, nothing menacing, no
skulls, no hazard imagery beyond simple striped bands. No characters, no
creatures, no text, no logos, no UI.
```

### 12.9 Vulkanschlund — Material

> **Referenz: A3.**

```
[PREPEND STYLE BLOCK U]
[APPEND NEGATIVE PROMPT]

Material board for the world "Volcano Throat" of a side-scrolling puzzle
game. The rule of this world is that lava rises slowly from below and the
player is under time pressure, so the light in this world comes from
underneath.

Layout: exactly 4 seamless material swatches in one horizontal row, equal
cells, thin hairline separators, no text, no labels. Canvas 2048 by 512
pixels, each swatch 512 by 512. Opaque. Aspect ratio 4:1.

Swatch 1 — ash bed with a baked crust: body #4a3a34, the upper eighth a
cracked, heat-hardened crust #8a3a22 with a network of fine dark fissures
and a few glowing hairline cracks.
Swatch 2 — deep volcanic ash and scoria: #4a3a34, light porous granular
material with countless small round gas holes, drifted and soft, obviously
diggable.
Swatch 3 — basalt: #3a3436, blocky angular columns with flat fracture
faces, deep black crevices, and thin warm glowing seams at the very bottom
of the deepest cracks only.
Swatch 4 — riveted steel plate: #8b96a6, identical to every other world's
steel, its lower edges heat-discoloured to a faint blue and straw tarnish.

Value range across all four swatches: no channel below 32 or above 200.
The glowing seams are the hardest part: they must stay inside the band and
still read as hot, which means they win by hue and by contrast against very
dark neighbours, never by brightness alone.

Hot, oppressive, close mood. Any glow is expressed as material colour, not
as painted light bloom — the engine adds real dynamic light on top and a
baked bloom would double up.

The four swatches must be distinguishable in greyscale alone. Flat even
lighting, no directional shadow, no vignette. Pixel art on a strict square
pixel grid.
```

### 12.10 Vulkanschlund — Parallax

> **Referenz: A4.**

```
[PREPEND STYLE BLOCK U]
[APPEND NEGATIVE PROMPT]

Parallax background layer sheet for the world "Volcano Throat" of a side-
scrolling puzzle game. Strictly orthographic side view, no perspective
convergence.

Layout, critical: exactly 4 separate horizontal strips stacked vertically
in one image, equal height, separated by thin hairline gaps, each a
complete independent background layer to be cut out and scrolled at its own
speed. Do NOT compose them into one finished scene. Canvas 2048 by 1536
pixels, each strip 2048 by 384. Aspect ratio 4:3.

This world is lit from below, which inverts the usual arrangement: the
brightest values are at the bottom of every strip, not at the top.

Strip 1, the volcanic sky, opaque and full-bleed: a vertical gradient from
near-black plum #1a0a10 at the top to a hot smoky red #7a2a1e at the
bottom, ordered dithering in the transition, drifting embers rising through
it and a thick ash haze near the bottom edge.
Strip 2, far crater walls, transparent above the silhouette: distant
rounded crater rims in flat #2a1014, hazy, no internal detail, with two
thin columns of smoke rising from behind them.
Strip 3, mid rock formations, transparent above the silhouette: closer
blocky basalt outcrops in #401a18 with a few warm glowing fissures along
their lower edges and small lava dribbles frozen down their faces.
Strip 4, near foreground rock, transparent above the silhouette: the
closest layer in #58261c, heavy rounded boulders and a broken ledge along
the bottom, strongly underlit in orange #ff7a45 from an unseen lava pool
below, with rising heat shimmer as a band of ordered dithering.

Every strip tiles seamlessly left to right with no recognisable landmark.

Value separation between strips is essential; each must read as its own
plane in greyscale.

Rounded, heavy, blunt rock shapes — nothing jagged, nothing skull-like,
nothing hellish. Hot but not horrific. No characters, no creatures, no
text, no logos, no UI.
```

### 12.11 Wolkenwerft — Material

> **Referenz: A3.**

```
[PREPEND STYLE BLOCK U]
[APPEND NEGATIVE PROMPT]

Material board for the world "Cloud Yard" of a side-scrolling puzzle game.
The rule of this world is that there is very little ground and a great deal
of empty air below, so every material is a small platform floating in the
sky and must read as a thin, precious surface.

Layout: exactly 4 seamless material swatches in one horizontal row, equal
cells, thin hairline separators, no text, no labels. Canvas 2048 by 512
pixels, each swatch 512 by 512. Opaque. Aspect ratio 4:1.

Swatch 1 — weathered timber decking with a mossy top skin: body #a08a6a,
the upper eighth a pale sun-bleached surface #c8b48a with visible plank
lines running horizontally, rope lashings and a few brass tacks.
Swatch 2 — compacted sky-garden soil: #8a9cc2 tinted warm, light and airy,
full of small pale pumice pebbles and short pale roots, obviously diggable
and obviously light.
Swatch 3 — pale weathered stone ballast: #6b6f7d, rounded blocky masonry
with mortar lines, worn corners and pale lichen patches, harder than the
soil but still workable.
Swatch 4 — riveted steel plate: #8b96a6, identical to every other world's
steel, here reading as the strapping that holds the flying platforms
together.

Value range across all four swatches: no channel below 32 or above 200.
This is a high-key world and the bright end is the risk; verify the
histogram.

Bright, airy, optimistic mood, everything sun-bleached and slightly
weathered. The four swatches must be distinguishable in greyscale alone,
which is difficult here — push structural difference: planks horizontal,
soil granular, stone blocky, steel regular.

Flat even lighting, no directional shadow, no vignette. Pixel art on a
strict square pixel grid.
```

### 12.12 Wolkenwerft — Parallax

> **Referenz: A4.**

```
[PREPEND STYLE BLOCK U]
[APPEND NEGATIVE PROMPT]

Parallax background layer sheet for the world "Cloud Yard" of a side-
scrolling puzzle game. Strictly orthographic side view, no perspective
convergence.

Layout, critical: exactly 4 separate horizontal strips stacked vertically
in one image, equal height, separated by thin hairline gaps, each a
complete independent background layer to be cut out and scrolled at its own
speed. Do NOT compose them into one finished scene. Canvas 2048 by 1536
pixels, each strip 2048 by 384. Aspect ratio 4:3.

Strip 1, the high sky, opaque and full-bleed: a vertical gradient from a
deep clear blue #2a3a6b at the top to a soft pale blue #9ab4d6 at the
bottom, with ordered dithering and a warm glow near the lower edge as if
the sun sits just below the frame.
Strip 2, far cloud bank, transparent above the silhouette: a soft rolling
horizon of flat-topped cumulus in #4a5c8a, rounded and generous, no
internal detail, occupying the lower two thirds.
Strip 3, mid cloud towers and distant platforms, transparent above the
silhouette: taller cloud columns in #6a7ca6, with two or three small
distant floating timber platforms silhouetted against them, each hanging
from a simple balloon or held by a mast.
Strip 4, near clouds and rigging, transparent above the silhouette: the
closest layer in #8a9cc2, a heavy cloud shelf along the bottom with
readable rounded lobes, plus a few taut mooring ropes, a hanging block and
tackle, and a couple of small pennants stirring in the wind.

Every strip tiles seamlessly left to right with no recognisable landmark.

Value separation between strips is essential and unusually hard here,
because everything is pale. Push the separation further than feels natural:
the near clouds must be clearly darker than the far ones even though real
clouds do the opposite.

Rounded, soft, generous, optimistic shapes. Nothing stormy, nothing dark.
No characters, no creatures, no text, no logos, no UI.
```

---

## §13 Falltür, Ausgang und die vier Fallen

Falltür und Ausgang sind die **beiden Fixpunkte jedes Levels** (GDD §5): oben die Luke, aus
der sie fallen, unten die leuchtende Tür. Der Ausgang muss laut `scene.ts` sogar **durch
Gestein hindurch** leuchten, sonst findet ihn auf sechs Zoll niemand.

Die vier Fallen aus GDD §5 sind bewusst „unfair aussehend": Sie sollen aus der Entfernung
als Gefahr lesbar sein, und der Spieler soll sie trotzdem übersehen, wenn er in Panik ist.
Das ist der Unterschied zwischen einer fairen und einer billigen Falle — die Information ist
da, die Aufmerksamkeit fehlt.

**Für vier dieser sechs Motive ist Tripo der bessere Weg** (§17.4/§17.5): Falltür, Ausgang,
Presse und Bärenfalle haben **bewegliche Teile in mehreren Zuständen** — Türflügel, Ramme,
Kiefer. Ein Modell, dessen Teile man verdreht und dreimal rendert, liefert drei Zustände
derselben Geometrie. Ein Bildmodell liefert drei ähnliche Objekte.

### 13.1 Falltür — 2 Zustände

> **Referenz: keine.** Besser über Tripo, §17.4.

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Two-state asset: the entrance hatch of a level, the hanging trapdoor that
small creatures drop out of. Strict orthographic side view, hanging in
mid-air with no support structure below it.

Design: a heavy riveted steel box #8b96a6 with darker recesses #656f7d and
bright bevels #b9c3d0, wider than it is tall, with two thick chains rising
from its top corners out of the top of the frame. A bright amber #ffd23f
warning light sits on the top face. Two hinged doors form the underside.
Chunky, rounded-cornered, slightly toy-like industrial design — heavy but
friendly.

Layout: exactly 2 frames in one horizontal row, equal cells, no gaps, no
borders, no labels. The hatch is at the identical position and size in both
cells.
Frame 1 — closed: the underside doors flush and shut, a dark seam between
them, the amber light dim.
Frame 2 — open: both doors swung down and outward at about seventy degrees,
revealing a pure black opening #0b0d12 in the middle, the amber light lit
bright with a small warm glow spill onto the door edges, and a few dust
motes falling from the opening.

The object must read as an industrial hopper releasing something, not as a
door in a wall. At 12 pixels of character height the hatch is about the
width of three creatures, so the open state must be recognisable by the two
downward-angled door flaps alone.

Master scale: each cell 320 by 160 pixels, object 272 pixels wide and 96
pixels tall, representing a 34 by 12 logical pixel hatch at 8x. Canvas 640
by 160 pixels, fully transparent background. Aspect ratio 4:1.
```

### 13.2 Ausgangstür — 3-Bild-Puls

> **Referenz: keine.** Besser über Tripo, §17.4.

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

The level exit: a glowing doorway that small creatures walk into to be
saved. Strict orthographic side view, standing on an implied ground line.

Design: a dark stone portal frame #1a1208, roughly as wide as it is tall,
with a slightly arched top and softly rounded outer corners. The interior
is filled with warm light in three concentric steps: an outer body of glow
amber #ffd98a, a brighter inner field, and a near-white core #fff6dd at the
centre. A soft radial warm halo extends well beyond the frame in all
directions and fades to nothing. Two small amber lamps sit on the upper
corners of the frame.

Layout: exactly 3 frames in one horizontal row, equal cells, no gaps, no
borders, no labels, the frame itself at the identical position and size in
all three. The three frames show one gentle pulse: frame 1 dim, frame 2
medium, frame 3 bright with the halo at its largest and a few rising light
motes.

Critical requirement: this object is the only thing in a level that stays
visible through solid terrain, so the halo must be strong, warm, perfectly
radially symmetric and clearly distinguishable from every other light
source in the game. It must be identifiable at 16 pixels tall as "the
goal", even when most of it is covered.

The warm glow of this door is also the light that is baked into the rescue
animation of the creatures, so its tone must match #ffd98a exactly.

Master scale: each cell 384 by 384 pixels, the frame itself 256 pixels wide
and 208 pixels tall, representing a 32 by 26 logical pixel exit at 8x.
Canvas 1152 by 384 pixels, fully transparent background. Aspect ratio 3:1.
```

### 13.3 Bärenfalle — 2 Zustände

> **Referenz: keine.** Besser über Tripo, §17.5.

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Two-state trap asset: a spring-loaded jaw trap set into the ground. Strict
orthographic side view, resting on an implied ground line.

Design: a semicircular base plate in dark iron #4a4740 with two hinged jaws
carrying rows of blunt triangular teeth, a heavy coil spring on each side,
a small round pressure plate in the centre, and a short chain running off
to one side. Rust streaks in #8a5a3a along the metal. A thin amber #ffd23f
highlight along the tooth tips so the danger reads even in shadow. The
teeth are large and blunt rather than fine and sharp — chunky and
cartoonish, not gruesome.

Layout: exactly 2 frames in one horizontal row, equal cells, no gaps, no
borders, no labels. The base plate is at the identical position in both
cells.
Frame 1 — armed: jaws open flat to left and right, teeth pointing up, the
pressure plate raised, the springs compressed and visibly tense.
Frame 2 — sprung: jaws snapped shut into a closed triangular wedge, teeth
interlocked, a small puff of dust at the base, the chain jerked taut.

The armed state must read as a wide toothed mouth at 16 pixels tall; the
sprung state as a closed narrow wedge. The change in overall width between
the two states is the whole signal.

No blood, no remains, no creature, no bones.

Master scale: cells 320 by 192 pixels, canvas 640 by 192 pixels, fully
transparent background. Aspect ratio 10:3.
```

### 13.4 Presse — 3 Zustände

> **Referenz: keine.** Besser über Tripo, §17.5.

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Three-state trap asset: an industrial crushing press. Strict orthographic
side view.

Design: a heavy rectangular steel ram #8b96a6 with bevelled edges, dome
rivets, and a hazard stripe band of diagonal amber #ffd23f and near-black
along its lower face, mounted on two vertical guide rails that run out of
the top of the frame. A matching anvil base plate sits on the ground line
below, scarred and dented, with dark oil staining. Chunky, rounded-cornered
industrial design.

Layout: exactly 3 frames in one horizontal row, equal cells, no gaps, no
borders, no labels. The guide rails and the base plate are at the identical
position in all three cells; only the ram moves.
Frame 1 — raised: the ram at the top of its travel, the gap beneath it
clearly tall enough for a small creature to walk through, and a small green
#4fd18b indicator light on the ram.
Frame 2 — descending: the ram at half travel, motion implied by a slight
vertical smear on the guide rails, the indicator light amber #ffd23f.
Frame 3 — closed: the ram fully down onto the anvil, a hard contact spark,
dust puffing sideways from the seam, the indicator light red #ff4d4d.

The hazard stripes on the underside are the player's warning and must stay
legible at small size — make the stripes wide and few rather than fine and
many. The vertical position of the ram is the state signal and must be
unmistakable at 16 pixels tall.

Master scale: cells 384 by 384 pixels, canvas 1152 by 384 pixels, fully
transparent background. Aspect ratio 3:1.
```

### 13.5 Feuerstrahl — 4 Bilder

> **Referenz: keine.**

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Four-frame trap animation: a horizontal flame jet emitter. Strict
orthographic side view, the nozzle on the left, the jet firing to the
right.

Design: a stubby riveted iron nozzle #4a4740 with a small pilot flame and
two pressure valve wheels, mounted flush to an implied wall on the left
edge of every cell.

Layout: exactly 4 frames in one horizontal row, equal cells, no gaps, no
borders, no labels. The nozzle is at the identical position and size in all
four cells; only the flame changes.
Frame 1 — idle: only the tiny blue pilot flame at the nozzle mouth and a
wisp of heat shimmer drawn as ordered dithering.
Frame 2 — ignition: a short stubby burst of flame reaching one third across
the cell, white-hot core, amber #ffd23f middle, orange #ff7a45 fringe.
Frame 3 — full jet: a long tapering flame spanning the full cell width,
white-hot at the nozzle, cooling through amber to deep red #8a2b1e at the
tip, with turbulent lobed edges and a few detached flame licks.
Frame 4 — dying back: the jet broken into three separate rolling puffs
drifting right, smoke starting to form.

The flame must be built from hard-edged pixel clusters, not soft airbrushed
gradients, and must never bloom or glow beyond its own outline. The full
jet state must be unmistakably lethal at a glance and must be
distinguishable from the idle state by length alone.

Master scale: cells 512 by 192 pixels, canvas 2048 by 192 pixels, fully
transparent background. Aspect ratio 32:3.
```

### 13.6 Wasser

> **Referenz: A3.**

```
[PREPEND STYLE BLOCK U]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Water asset sheet for a side-scrolling puzzle game: a lethal water pool the
creatures drown in. Strict orthographic side view.

Layout: exactly 3 elements stacked vertically in one image, separated by
thin hairline gaps, no text, no labels. Canvas 2048 by 1024 pixels, aspect
ratio 2:1.

Element 1, the top third — a horizontally tileable water surface strip: a
bright specular line in pale cyan #9fd8ff along the very top, a 16-pixel
band of lighter water #4f8fb5 below it, then the body colour #2f6f96, with
small regular wave crests and ordered dithering in the transition. It must
tile seamlessly left to right with no recognisable landmark wave.

Element 2, the middle third — the deep body: a vertical gradient from
#2f6f96 down to #16324a, with faint caustic light bands drifting through it
and a few rising bubbles. Value must fall off clearly with depth so that a
submerged silhouette is visibly darker than one at the surface.

Element 3, the bottom third — a 6-frame splash sequence in one horizontal
row on a transparent strip, equal cells: a small crown splash forming,
peaking, breaking into droplets, falling back, ripple rings spreading, and
settling. Hard-edged pixel clusters, no soft spray.

The water must read as depth, not as a flat blue block. Elements 1 and 2
are opaque; element 3 sits on transparency.

Pixel art on a strict square pixel grid, ordered dithering in all
transitions, no airbrush softness, no photographic reflection, no
characters.
```

---

## §14 Effekte und Partikel

GDD §6 nennt vier Partikelarten: Staubwolken beim Graben, Gesteinsbrocken mit Physik,
Funken beim Stahlkontakt, Rauchfahne beim Sprengen. Der Prototyp erzeugt sie bereits
(`scene.ts`, `spawnFromEvents`) — mit genau den Farben und Mengen unten. Die Prompts
übernehmen sie, damit generierte Blätter und laufender Code dieselbe Sprache sprechen.

| Ereignis | Farbe im Code | Menge | Prompt |
|---|---|---|---|
| `dig` | `#8a6236` | 3 | §14.1 |
| `brick` | `#c98a52` | 2 | §14.2 |
| `steel` | `#ffe9a8` | 7, hohe Geschwindigkeit | §14.3 |
| `explode` | `#ff9a3c` + `#5a5a5a` | 26 + 12 | §14.4, §14.5 |
| `saved` | `#ffe98a` | 8 | §14.6 |

**Ehrlich zur Wirkung:** Diese sechs Blätter sind Feinschliff. Die farbigen Quadrate, die
der Prototyp heute wirft, sehen **in Bewegung** deutlich besser aus, als sie im Standbild
wirken — der Gewinn durch echte Partikelbilder ist der kleinste im ganzen Katalog. Sie
stehen hier der Vollständigkeit halber und gehören ans Ende der Reihenfolge.

### 14.1 Staubwolke beim Graben — 6 Bilder

> **Referenz: keine.**

```
[PREPEND STYLE BLOCK K]
[APPEND NEGATIVE PROMPT]

Six-frame dust puff animation for a game about digging through soil, played
once each time a creature removes a bite of earth.

Layout: exactly 6 frames in one horizontal row, equal cells, no gaps, no
borders, no labels. Each cell is exactly 128 by 128 pixels. Canvas 768 by
128 pixels, aspect ratio 6:1. The puff originates at the exact centre of
every cell.

Colour: earthy dust brown #8a6236, one step lighter toward #a87c4a at the
leading edges and one step darker toward #6b4a2e in the core. No other
hues.

Frame 1 — a tight dense knot of dust barely wider than a few pixels,
brightest and most opaque of the sequence.
Frame 2 — the knot bursts outward into three or four distinct rounded
lobes, still dense.
Frame 3 — the lobes expand and separate, small individual grains flicking
outward ahead of them.
Frame 4 — the cloud at its widest, lobes thinning and breaking apart, the
core hollowing out.
Frame 5 — mostly separated grains and thin veils, the shape losing
coherence and drifting slightly downward.
Frame 6 — a last few isolated grains and one faint veil, almost gone.

Hard-edged pixel clusters throughout, with ordered dithering used for the
thinning edges instead of soft alpha gradients. No soft airbrushed smoke,
no bloom, no glow, no motion blur.

The puff must remain a recognisable puff when the cell is downscaled to 16
by 16 pixels: keep the number of lobes low and their outlines chunky.

Fully transparent background, no ground, no character, no tool.
```

### 14.2 Gesteinsbrocken — 8 Zellen

> **Referenz: keine.**

```
[PREPEND STYLE BLOCK K]
[APPEND NEGATIVE PROMPT]

Debris chip sprite set for a game with destructible terrain: eight small
loose fragments thrown by digging and by collapsing material, each drawn as
a separate object that the engine will move with simple physics.

Layout: exactly 8 cells in one horizontal row, equal cells, no gaps, no
borders, no labels. Each cell is exactly 64 by 64 pixels. Canvas 512 by 64
pixels, aspect ratio 8:1. Each fragment is centred in its own cell.

Cells 1 to 3 — soil clods in #8a6236 with a lighter top facet #a87c4a and a
dark underside, irregular and rounded, of three clearly different sizes:
large, medium and small.
Cells 4 and 5 — rock chips in #565d6b with one bright flat facet #6f7787,
angular and wedge-shaped, two different sizes.
Cells 6 and 7 — wood splinters in warm brick brown #c98a52 with a darker
edge #8a5530, short and blocky with a chipped end, two different sizes.
Cell 8 — a single tiny grain, no larger than two pixels at final size, in
neutral #8a6236.

Every fragment is a solid opaque shape with a hard near-black #0c1119
outline, 8 pixels thick at this master scale — the same weight as the
character outline, because these chips appear right next to the creatures.

Each fragment must be a distinct silhouette at final size, and the three
material families must be distinguishable in greyscale: soil rounded, rock
angular, wood rectangular.

No rotation copies, no motion trails, no shading beyond the single facet.
Fully transparent background, no ground, no shadow.
```

### 14.3 Funken bei Stahlkontakt — 5 Bilder

> **Referenz: keine.**

```
[PREPEND STYLE BLOCK K]
[APPEND NEGATIVE PROMPT]

Five-frame spark burst animation for the moment a digging tool strikes
indestructible steel and fails. This is a feedback signal that tells the
player "this cannot be dug", so it must be sharp, bright and instantly
readable.

Layout: exactly 5 frames in one horizontal row, equal cells, no gaps, no
borders, no labels. Each cell is exactly 128 by 128 pixels. Canvas 640 by
128 pixels, aspect ratio 5:1. The impact point is at the exact centre of
every cell.

Colour: pale hot yellow #ffe9a8 at the core, amber #ffd23f in the middle,
and a brief warm orange #ff7a45 only in the trailing tips. No red, no
white-out.

Frame 1 — a single hard four-point star flash at the impact point, small
and extremely bright, with a tight ring of six or seven single-pixel sparks
just leaving it.
Frame 2 — the flash gone, twelve to fifteen individual sparks flying
outward in a fan, each drawn as a short straight two-pixel streak, longest
along the horizontal.
Frame 3 — the sparks at maximum spread and beginning to curve downward
under gravity, streaks shortening, a few already fading.
Frame 4 — half the sparks gone, the remainder falling and cooling from
yellow through amber to orange.
Frame 5 — three or four last dim points near the bottom of the cell, about
to vanish.

Hard-edged pixel clusters and straight pixel streaks only. No soft glow, no
bloom, no lens flare, no smoke.

At 16 pixels the burst must read as a hard bright star: keep frame 1
compact and extremely high contrast, because in play it is often the only
frame the player consciously sees.

Fully transparent background, no steel plate, no tool, no character.
```

### 14.4 Rauchfahne — 6 Bilder

> **Referenz: keine.**

```
[PREPEND STYLE BLOCK K]
[APPEND NEGATIVE PROMPT]

Six-frame rising smoke plume animation for the aftermath of an explosion in
a pixel-art game.

Layout: exactly 6 frames in one horizontal row, equal cells, no gaps, no
borders, no labels. Each cell is exactly 192 by 192 pixels. Canvas 1152 by
192 pixels, aspect ratio 6:1. The base of the plume sits at the bottom
centre of every cell and does not move between frames.

Colour: neutral grey #5a5a5a as the body, one step lighter toward #7a7a7a
on the upper lit edges of each lobe, one step darker toward #3c3c3c in the
shadowed undersides. A dull warm ember glow #ff9a3c only in the lowest
eighth of frames 1 and 2.

Frame 1 — a low thick knot of smoke sitting on the ground, dense and dark,
with an ember glow at its base.
Frame 2 — the knot lifts and forms a stubby column with two rounded lobes,
the glow fading.
Frame 3 — the column rises to half cell height, lobes rolling outward, the
base thinning.
Frame 4 — a full plume reaching three quarters of the cell height, four or
five rolling lobes, leaning slightly to one side.
Frame 5 — the plume detaches from the ground and drifts upward as separated
puffs, thinning through ordered dithering.
Frame 6 — three faint isolated wisps near the top of the cell, almost gone.

Hard-edged pixel clusters, ordered dithering for the thinning, no soft
airbrushed smoke, no alpha gradients, no bloom.

The plume must stay narrow enough never to leave its cell, and each frame
must be distinguishable from its neighbours by overall height — height is
the readable progression.

Fully transparent background, no ground, no fire, no crater.
```

### 14.5 Explosion — 8 Bilder

> **Referenz: keine.**

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Eight-frame explosion animation for a pixel-art puzzle game, played when a
bomb detonates and removes a circular crater from the terrain. The crater
radius in the game is 14 logical pixels, so the visible blast must be
noticeably larger than that but must stay inside its cell.

Layout: exactly 8 frames in one horizontal row, equal cells, no gaps, no
borders, no labels. Each cell is exactly 384 by 384 pixels. Canvas 3072 by
384 pixels, aspect ratio 8:1. The blast centre is at the exact centre of
every cell.

Colour: white-hot core, flame amber #ff9a3c as the body, warm orange
#ff7a45 at the fringe, smoke grey #5a5a5a for everything after the flame.
No red, no purple, no blue.

Frame 1 — a small hard white disc, no larger than a sixth of the cell,
extremely bright, with four short radial spikes.
Frame 2 — the disc expands to a third of the cell, core still white,
already ringed in amber, the outline breaking into rounded lobes.
Frame 3 — the fireball at half the cell, a clear white core inside an amber
body inside an orange fringe, twelve to sixteen dark debris chips flung
outward ahead of it.
Frame 4 — maximum extent, filling three quarters of the cell, the white
core gone, the body all amber and orange, the outline strongly lobed and
irregular, debris at its furthest.
Frame 5 — the flame collapses inward and darkens, grey smoke appearing at
the outer edges, debris beginning to fall back.
Frame 6 — mostly grey smoke in a rolling ball with only a dull amber core
left at the centre, debris falling.
Frame 7 — smoke only, expanding and thinning through ordered dithering, the
ball beginning to rise.
Frame 8 — a thin scattered ring of grey wisps and three last falling chips.

Hard-edged pixel clusters throughout. No soft airbrushed fire, no bloom, no
lens flare, no chromatic aberration — the engine applies screen shake and
chromatic aberration itself and a baked version would double up.

Fully transparent background, no terrain, no crater, no character.
```

### 14.6 Rettungsfunken — 6 Bilder

> **Referenz: keine.**

```
[PREPEND STYLE BLOCK K]
[APPEND NEGATIVE PROMPT]

Six-frame sparkle burst animation for the moment a creature reaches the
exit and is saved. This is the reward signal of the game and must feel warm
and generous rather than explosive.

Layout: exactly 6 frames in one horizontal row, equal cells, no gaps, no
borders, no labels. Each cell is exactly 192 by 192 pixels. Canvas 1152 by
192 pixels, aspect ratio 6:1. The burst originates at the bottom centre of
every cell and rises upward through the sequence.

Colour: warm pale gold #ffe98a as the body, near-white at the brightest
cores, and a soft amber #ffd98a in the fading tails. No cool tones, no
white-out.

Frame 1 — eight small four-point star motes clustered tightly at the origin
point, all the same size, all bright.
Frame 2 — the motes spread apart and begin to rise, arranged in a loose
upward fan, each still a crisp four-point star.
Frame 3 — the motes at mid height, spread wider, alternating between large
and small stars so the group has rhythm, each with a one-pixel trailing
tail below it.
Frame 4 — the motes near the top of the cell, spreading further and
starting to dim, the tails longer.
Frame 5 — half the motes gone, the remainder at the very top, small and
faint.
Frame 6 — two last faint points at the top edge.

Hard-edged pixel stars only — a four-point star is a plus sign with a
bright centre pixel. No soft glow, no bloom, no lens flare, no ring, no
halo.

The rise is the readable progression: each frame must sit visibly higher in
the cell than the one before it, so that stacked bursts from several rescued
creatures read as a rising shower.

Fully transparent background, no door, no character, no ground.
```

---

## §15 Bedienoberfläche

Die Berufssymbole sind der **zweite Ort, an dem sich die Spielbarkeit entscheidet** — nach
den Figurensilhouetten. Sie sitzen laut GDD §3.5 im Bogen in den unteren 25 % des
Bildschirms und sind **36 Punkt breit**, kleiner als eine Fingerkuppe.

Zwei Regeln, die in allen Symbolprompts stecken:

- **Gleiche Silhouettenlogik wie die Figuren.** Das Symbol des Gräbers zeigt denselben
  waagerechten Balken *unten*, den auch die Figur zeigt (§9.8). Wer die Figur gelernt hat,
  liest das Symbol — und umgekehrt. Das halbiert die Lernkurve.
- **Strichstärke absolut, nicht relativ.** Bei 36 Punkt muss die dünnste Linie mindestens
  2 Punkt haben, sonst verschwindet sie auf einem gebrauchten Display mit Fettfilm.

**Ehrlich zum Nutzen dieses Abschnitts:** `icons.ts` und `hud.ts` zeichnen die Oberfläche
heute sauber und maßhaltig als Vektorpfade. Das ist der **fertigste Teil des Prototyps**.
Generierte Symbole werden hier fast sicher schlechter sein als das, was schon da ist — die
Prompts unten sind deshalb primär **Formvorlagen für eine Handzeichnung**, nicht Lieferanten.
Das gilt besonders für §15.5 und §15.6.

### 15.1 Die acht Berufssymbole

> **Referenz: A2.**

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

UI icon set for the eight core skills of a real-time rescue puzzle game.
Flat single-colour glyphs, drawn in amber #ffd23f on a fully transparent
background, hard-edged pixel art, no gradients, no outlines, no fills other
than the glyph colour.

Layout: exactly 8 icons in a 4 by 2 grid, equal cells, each glyph centred
and occupying about eighty percent of its cell, no labels, no text, no
frames, no separators. Each cell is exactly 512 by 512 pixels. Canvas 2048
by 1024 pixels, aspect ratio 2:1.

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
  pointing diagonally down-right at about twenty-seven degrees.
8 Digger — a solid horizontal ceiling bar at the top, with a thick arrow
  pointing straight down.

Stroke weight: uniform and heavy, at least one twelfth of the cell width,
with rounded caps and joins. Arrow heads solid and large.

Test criterion: each glyph must remain unambiguous when its cell is scaled
down to 36 by 36 pixels and viewed through a smudged screen. Icons 6, 7 and
8 differ only in bar position and arrow direction — exaggerate those
differences until they are impossible to confuse.

Fully transparent background, no panel, no button well, no shadow.
```

### 15.2 Die zwei späteren Symbole

> **Referenz: A2.**

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Two additional UI icons for the same skill set of a real-time rescue puzzle
game, matching an existing set of eight. Flat single-colour glyphs in amber
#ffd23f on a fully transparent background, hard-edged pixel art, no
gradients, no outlines, no fills other than the glyph colour.

Layout: exactly 2 icons in one horizontal row, equal cells, each glyph
centred and occupying about eighty percent of its cell, no labels, no text,
no frames. Each cell is exactly 512 by 512 pixels. Canvas 1024 by 512
pixels, aspect ratio 2:1.

Icon 1, Magnetiser — a thick horseshoe magnet seen from the side with its
opening pointing right, squared pole tips, and two short concentric arcs of
attraction radiating from between the tips. The gap between the poles must
be at least a fifth of the cell width so it does not fill in when scaled
down.
Icon 2, Jumper — a simple arc trajectory rising from lower left to upper
right and back down, drawn as a dashed curve of three or four heavy dashes,
with a small solid figure silhouette at the start of the arc and a short
solid ground bar beneath each end.

Stroke weight: uniform and heavy, at least one twelfth of the cell width,
with rounded caps and joins, exactly matching the existing eight icons.

Test criterion: both glyphs must remain unambiguous at 36 by 36 pixels and
must not be confusable with an umbrella dome, which is also an arc. The
Jumper's arc is dashed and asymmetric; the umbrella's is solid and
symmetric with a vertical handle. Keep that distinction obvious.

Fully transparent background, no panel, no button well, no shadow.
```

### 15.3 Skill-Leiste im Bogen

> **Referenz: keine.**

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

UI frame asset: the skill bar of a portrait-orientation mobile puzzle game,
occupying the bottom quarter of the screen and shaped as a shallow upward
arc so eight buttons follow the natural sweep of a thumb.

Design: a dark panel #0e131c filling the lower area, its top edge a smooth
shallow arc rising slightly at the centre, with a 2-pixel hairline #27334a
along that edge and a soft inner shadow beneath it. Eight round button
wells sit along the arc, evenly spaced, each a slightly raised disc #18202e
with a thin darker rim and a subtle top bevel, each large enough for a 36
point icon plus padding.

Include three button states shown side by side below the main bar as a
small reference row: idle #18202e, pressed with a darker recessed fill and
no bevel, and selected with a 3-pixel amber #ffd23f ring and a faint amber
inner glow.

Also include a vertical slider track along the left side of the panel: a
narrow recessed channel with a chunky rounded amber handle, for the
release-rate control, with a darker locked segment at the bottom of the
channel.

No icons inside the wells, no text, no numbers — those are drawn by the
engine. Clean, functional, slightly industrial, matching a pixel-art game
without itself being lo-fi. Corners rounded and generous to match the
cuddly character style.

Master scale: canvas 1080 by 640 pixels, portrait-screen width proportions.
Transparent background outside the panel shape. Aspect ratio 27:16.
```

### 15.4 Rettungsquote-Balken

> **Referenz: keine.**

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

UI asset: the rescue-quota bar of a rescue puzzle game, showing how many
creatures have been saved against how many are required, and how many have
been lost.

Design: a long horizontal capsule-shaped track, dark #0e131c with a thin
#27334a rim and a subtle inner shadow. The saved count fills from the left
in success green #4fd18b with a lighter top highlight line and a soft glow
at its leading edge. The lost count fills from the right in failure red
#e05a4a. A distinct vertical target marker crosses the whole bar at roughly
seventy percent: a 4-pixel amber #ffd23f line with a small downward-pointing
triangle above it, marking the required quota.

Layout: exactly 4 states stacked vertically, equal spacing, no text, no
numbers, no labels.
State 1 — empty track.
State 2 — filled to about thirty percent from the left, below the target
marker, that fill in neutral #7b8ba3 rather than green because the quota is
not yet met, plus a small red segment at the right end.
State 3 — filled just past the target marker, fill in green #4fd18b, with a
small amber pulse ring at the marker, red segment unchanged.
State 4 — filled completely in green with a bright highlight sweep and a
thin amber outline around the whole capsule.

The colour switch from neutral to green at the target marker is the single
most important readability feature of this asset and must be unmistakable.

Master scale: canvas 1024 by 512 pixels, each bar 896 pixels wide and 64
pixels tall. Transparent background outside the capsules. Aspect ratio 2:1.
```

### 15.5 Kopfleisten-Knöpfe

**Von Hand.** Vier runde Knöpfe mit vier Glyphen bei rund 18 Punkt — dort trifft kein
Bildmodell das Raster. Der Prompt liefert die Formvorlage.

> **Referenz: keine.**

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

UI button set for the top bar of a portrait mobile puzzle game: four round
buttons, each shown in two states.

Layout: exactly 8 cells in a 4 by 2 grid, equal cells, no gaps, no borders,
no labels, no text. Each cell is exactly 96 by 96 pixels. Canvas 384 by 192
pixels, aspect ratio 2:1. The top row shows the idle state of each button,
the bottom row the active state directly beneath it.

Every button is a rounded square well in #161d29 with a 1-pixel #27334a rim
and a subtle top bevel in the idle state, and in the active state a fill of
#24405c with a 2-pixel amber #ffd23f rim and no bevel. The glyph inside is
drawn in #dce6f5 when idle and pure white when active.

Glyphs, in column order:
Column 1, sound — a simple speaker: a small rectangle with a triangular
horn opening to the right and two concentric arc waves. In the active state
the two arcs are replaced by a bold X cross of two straight strokes,
meaning muted.
Column 2, self-destruct — a circle with three broad blades radiating from a
small central hub, the classic three-bladed warning wheel, drawn solid. In
the active state it is filled in danger red #ff4d4d.
Column 3, pause — two thick vertical bars of equal width with a gap between
them. In the active state the two bars are replaced by a single solid right-
pointing triangle, meaning resume.
Column 4, recentre camera — a small circle with a dot at its centre and four
short tick marks at top, bottom, left and right, just outside the circle.

Stroke weight: uniform, at least one tenth of the cell width, with square
caps. Every glyph must remain unambiguous when its cell is scaled to 32 by
32 pixels.

Fully transparent background outside the button shapes, no shadow.
```

### 15.6 Sterne

**Von Hand.** Ein Fünfzackstern bei 24 Punkt ist reine Rasterarbeit.

> **Referenz: keine.**

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

UI asset: the three-star rating mark of a puzzle game, in two states.

Layout: exactly 2 cells in one horizontal row, equal cells, no gaps, no
borders, no labels, no text, no numbers. Each cell is exactly 128 by 128
pixels. Canvas 256 by 128 pixels, aspect ratio 2:1. One star is centred in
each cell at the identical position and size.

Cell 1 — the earned star: a five-pointed star with the classic proportion
where the inner radius is a little under half the outer radius, filled flat
in amber #ffd23f, with a 1-pixel brighter highlight along the upper left
edges of the points and a 1-pixel darker amber along the lower right edges.
The point tips are very slightly blunted rather than needle-sharp, to match
the rounded style of the game.
Cell 2 — the unearned star: the identical shape, identical size, identical
position, filled flat in dull slate #2a3244 with no highlight and no shadow
at all.

The two states must be distinguishable purely by brightness in greyscale,
not by hue — an earned star is bright, an unearned one is dark, and nothing
else changes.

The star must stay a clean readable five-pointed star when its cell is
scaled down to 24 by 24 pixels, which means the points must be thick at
their base and the inner angles wide. A thin elegant star turns to mush at
that size.

Fully transparent background, no glow, no sparkle, no ribbon, no frame, no
shadow.
```

### 15.7 Lupenrahmen

Die Lupe aus GDD §3.2 — runder Ausschnitt oberhalb des Fingers, 2,5-fache Vergrößerung.
`magnifier.ts` zeichnet heute nur einen Kreisrand und ein Fadenkreuz; für diesen Teil gab es
in der bisherigen Bibliothek **keinen Prompt**. Hier ist er.

Die Fassung muss über jedem Untergrund lesbar sein — Nachthimmel, Erde, Lava — und darf
gleichzeitig **nichts vom Inhalt verdecken**, denn der Inhalt ist der ganze Zweck.

> **Referenz: keine.**

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

UI asset: the circular magnifier frame of a mobile puzzle game. The player
holds a thumb on the screen and a round magnified cut-out of the game world
appears above the finger; this asset is the housing that surrounds that
cut-out. The magnified content itself is rendered by the engine and is NOT
part of this image — the entire interior of the circle is fully transparent
and must stay that way.

Layout: one single centred ring on a square canvas. Canvas 512 by 512
pixels, aspect ratio 1:1. The transparent interior opening is 432 pixels
across, centred.

Design: a chunky ring housing 40 pixels thick, built in three concentric
bands so it reads on any background whatsoever. Outermost band: a 8-pixel
hard near-black #0c1119 edge. Middle band: the body of the ring in raised
panel grey #18202e with a bright bevel #dce6f5 along its upper left arc and
a dark recess along its lower right arc, giving the ring a physical
thickness. Innermost band: a 8-pixel hairline #27334a facing the opening,
so the frame separates from bright content as well as from dark content.

Four small amber #ffd23f index marks sit on the ring at the twelve, three,
six and nine o'clock positions, each a short radial tick that does not
reach into the opening.

Inside the opening, drawn as the only marks on the transparency: a crosshair
made of four short strokes in semi-transparent white, one from each edge of
the opening pointing inward toward the centre, each reaching only a fifth
of the way in and stopping well short of the middle. The exact centre stays
completely empty — that is where the target creature will be, and anything
drawn there would hide it.

No lens glass, no reflection, no glare, no shine across the opening, no
handle, no grip, no drop shadow, no text, no numerals. The opening is
transparent, not glassy.

The whole frame must read clearly against a night-blue sky, against brown
soil and against bright lava alike, which is why it carries both a black
outer edge and a bright inner bevel.
```

---

## §16 App-Symbol, Ladebild und Store

Die einzigen Bilder des Katalogs, bei denen die Bildmodelle **wirklich stark** sind: große
Flächen, freie Komposition, kein Pixelraster, keine Maßhaltigkeit. Hier holt man den
größten Gegenwert je Stunde heraus — und hier darf der knuddelige Look alles zeigen, was
bei 12 Pixeln verlorengeht (§2.8).

**Eine Regel für alle fünf:** Die Figur auf diesen Bildern muss dieselbe sein wie im Spiel.
Der häufigste Fehler bei Store-Bildern ist eine hübschere, detailliertere Figur, die dann
mit dem Spiel nichts zu tun hat und Rückgaben erzeugt.

### 16.1 App-Symbol

> **Referenz: A0.**

```
[PREPEND STYLE BLOCK K]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Mobile app icon for a real-time rescue puzzle game about small creatures
digging through destructible terrain. Original character design, not based
on any existing game or franchise.

Composition: a single Wusel creature in three-quarter front view, filling
the central two thirds of the icon, seen from slightly above. Design as
established: oversized softly rounded head with warm sand skin #f4d7ac
taking up over forty percent of the body height, two large round solid
black dot eyes set low and wide apart, tiny open smile, a thick backward-
swept mane of vivid violet hair #9d4edd with a bright highlight #c98bff and
shadow #67219c rising from the crown and streaming back as if caught in a
breeze, one-piece teal work suit #2fc9b8, dark teal boots #1d8f85, hard
near-black outline #0c1119. It holds a broad amber #ffd23f shovel across
its body and looks up at the viewer with cheerful, slightly clueless
determination.

The red hair is the single most important element of this icon after the
face: it must be large, bright and clearly silhouetted, because it is the
one feature that distinguishes this game at thumbnail size in a store
listing.

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

Master scale: 1024 by 1024 pixels, opaque. Aspect ratio 1:1.
```

### 16.2 Ladebild

Das erste Bild, das ein Spieler vom Spiel sieht, und es steht meistens nur zwei Sekunden.
Deshalb: **ein** Motiv, ruhige untere Hälfte für den Ladebalken, keine Textfläche — den
Titel setzt die Anwendung darüber.

> **Referenz: A0** und **A4**.

```
[PREPEND STYLE BLOCK U]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Portrait loading screen for a real-time rescue puzzle game about small
creatures digging through destructible terrain. This image is shown for
only a couple of seconds while the game starts, so it must carry exactly
one idea.

Scene: a single tall vertical composition, strictly orthographic side view,
no perspective convergence. The upper half is open sky: a gradient from
deep night blue #101c33 at the top to pale dusty blue #3d5f7d, with three
receding rounded hill layers #1b2f42, #24415a, #2f5570 along the horizon
and a scatter of faint stars above.

The centre of the image, and the only subject: a riveted steel hatch
#8b96a6 hanging on two chains from the top of the frame, its underside
doors open, with exactly three small creatures dropping out of it. Each has
an oversized rounded head with warm sand skin #f4d7ac, two round black dot
eyes, a thick upswept mane of vivid violet hair #9d4edd streaming
straight upward in the rush of air, a one-piece teal work suit #2fc9b8,
dark teal boots #1d8f85 and a hard near-black outline #0c1119. Arms above
their heads, mouths open in small round shouts, cheerfully doomed. The
three vertical red hair plumes are the visual hook of the whole image.

The lower third is a calm cross-section of brown soil #6b4a2e with a green
crust #4f8f3c and one glowing exit door with a warm halo #ffd98a set into
it, small and far below. This lower third must stay simple and low in
contrast so a loading indicator can be drawn over it.

Lighting: cool from above, one warm accent from the exit glow below.

No text, no logo, no title, no UI, no progress bar drawn into the image.

Master scale: 1440 by 2560 pixels, opaque. Aspect ratio 9:16.
```

### 16.3 Store-Keyart quer

> **Referenz: A0** und **A4**.

```
[PREPEND STYLE BLOCK U]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Landscape key art for a real-time rescue puzzle game about small creatures
digging through destructible terrain. Original characters and world, not
based on any existing game or franchise.

Scene: a wide cross-section of grassland terrain cut open like a doll's
house, seen in strict orthographic side view. The upper third is sky
gradient #101c33 to #3d5f7d with three receding rounded hill layers
#1b2f42, #24415a, #2f5570. The lower two thirds are soil #6b4a2e with a
green crust #4f8f3c, riddled with hand-dug tunnels, a diagonal mine shaft,
a vertical pit, and one horizontal gallery blocked by a riveted steel plate
#8b96a6.

Cast: about twenty small creatures at work throughout the cut-away. Every
one of them has an oversized softly rounded head with warm sand skin
#f4d7ac, two round black dot eyes set low, a thick upswept mane of
vivid violet hair #9d4edd with highlight #c98bff, a one-piece teal work suit
#2fc9b8, dark teal boots #1d8f85 and a hard near-black outline #0c1119.
One swings a shovel at the bottom of the pit, one hammers sideways against
the steel with sparks flying, one places brick steps #b5713f up a ledge,
one drifts down a shaft under an amber #ffd23f umbrella, one stands
arms-wide with orange paddles as a blocker, and a small crowd marches in
single file along the surface. Each creature's hair is caught in a
different position appropriate to what it is doing — swept back on the
walkers, thrown forward on the hammering one, floating on the one under the
umbrella. That variety of hair positions is what makes the picture feel
alive.

Focal point: on the right, a glowing exit door with a strong warm halo
#ffd98a that the marching line is heading toward. On the upper left, a
riveted steel hatch on chains with creatures dropping out of it.

Lighting: warm late-afternoon key from the upper left, cool bounce in the
tunnels, warm rim light on the fresh cut edges which are one clear step
brighter than the settled soil, dust motes in the light shafts.

Leave the upper right quadrant relatively calm for a title treatment. No
text, no logo, no UI in the image.

Master scale: 2560 by 1440 pixels, opaque. Aspect ratio 16:9.
```

### 16.4 Store-Keyart hoch

> **Referenz: A0** und **A4**.

```
[PREPEND STYLE BLOCK U]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Portrait key art for a real-time rescue puzzle game about small creatures
digging through destructible terrain, for phone store listings and vertical
feature placements. Original characters and world, not based on any
existing game or franchise.

Scene: a tall vertical cross-section of terrain, seen in strict
orthographic side view, reading as a deep shaft from sky to depths. The top
eighth is sky gradient #101c33 to #3d5f7d with a riveted steel hatch
#8b96a6 on chains, doors open, three small creatures falling out of it with
arms up and vivid violet hair #9d4edd streaming vertically, one already under
an amber #ffd23f umbrella with its hair floating calmly instead.

Middle: layered terrain descending through green-crusted soil #6b4a2e, grey
rock #565d6b, and one thick horizontal band of riveted steel #8b96a6 that
the tunnels visibly stop at and route around. Hand-dug tunnels wind down
the shaft, a diagonal mine gallery cuts across, a brick #b5713f staircase
climbs a ledge, and a blocker stands arms-wide on a narrow ridge with
orange #ff7a45 paddles.

Every creature is identical in design: oversized softly rounded head with
warm sand skin #f4d7ac, two round black dot eyes set low, a thick
backward-swept vivid violet hair mane, a one-piece teal work suit #2fc9b8,
dark teal boots #1d8f85, hard near-black outline #0c1119. The red hair is
the only warm colour on the creatures and must read as a chain of bright
accents leading the eye down the shaft.

Bottom sixth: the glowing exit door with a strong warm halo #ffd98a and a
queue of creatures walking into it, small rising light motes above them.

Lighting: cool from above, warm from the exit glow below, so the vertical
composition is lit from both ends and the middle stays dark and dense.
Fresh cut edges one clear step brighter than settled material.

Leave the top fifth calm enough for a title treatment. No text, no logo, no
UI in the image.

Master scale: 1440 by 2560 pixels, opaque. Aspect ratio 9:16.
```

### 16.5 Store-Werbebanner, breit

Das breite Kopfbild einer Store-Seite. Extremes Seitenverhältnis, und der mittlere Bereich
wird auf manchen Ansichten von einem Symbol überdeckt — deshalb muss das Motiv **an den
Rändern** stattfinden.

> **Referenz: A0** und **A4**.

```
[PREPEND STYLE BLOCK U]
[APPEND PALETTE LOCK]
[APPEND NEGATIVE PROMPT]

Wide banner artwork for the store page of a real-time rescue puzzle game
about small creatures digging through destructible terrain. Original
characters and world, not based on any existing game or franchise.

Format note that drives the whole composition: this image is very wide and
short, and on some listings a square icon is overlaid across its centre.
The centre third must therefore stay calm, low in contrast and free of any
important subject. All the action belongs in the left and right thirds.

Scene: a long shallow horizontal cross-section of grassland, strictly
orthographic side view. The upper half is sky gradient #101c33 to #3d5f7d
with rounded hill layers #1b2f42, #24415a, #2f5570. The lower half is soil
#6b4a2e with a green crust #4f8f3c, cut through by one long horizontal
tunnel that runs the entire width of the image just below the surface.

Left third: a riveted steel hatch #8b96a6 on chains with three small
creatures dropping out of it, arms up, vivid violet hair #9d4edd streaming
vertically, and two more already landed and marching right along the
tunnel.

Centre third: only the empty tunnel and undisturbed soil, quiet and even in
value, with two creatures walking through it small and low in contrast.

Right third: a glowing exit door with a strong warm halo #ffd98a, a queue
of six creatures walking into it, rising light motes above them, and one
blocker standing arms-wide with orange #ff7a45 paddles turning a straggler
back toward the door.

Every creature is identical in design: oversized softly rounded head with
warm sand skin #f4d7ac, two round black dot eyes set low, a thick
backward-swept vivid violet hair mane with highlight #c98bff, a one-piece
teal work suit #2fc9b8, dark teal boots #1d8f85, hard near-black outline
#0c1119.

Lighting: warm key from the upper left, warm glow from the exit on the
right, cool bounce inside the tunnel.

No text, no logo, no title, no UI in the image.

Master scale: 1024 by 500 pixels, opaque. Aspect ratio approximately 2:1.
```

---

## §17 Tripo — wo 3D der bessere Weg ist

**Der Arbeitsablauf steht in `grafik-prompts.md` §10** — Modell in T-Pose ohne eingebackenes
Licht, orthografischer Turnaround-Render in achtfacher Zielgröße, Herunterrechnen auf 12
Pixel, Quantisieren, von Hand nachziehen. Er wird hier nicht wiederholt.

### 17.0 Wann 3D und wann nicht — die Entscheidungsregel

Ein Bildmodell erzeugt bei jedem Aufruf ein **neues** Bild. Ein 3D-Modell zeigt bei jedem
Render **dieselbe Geometrie** aus einem anderen Winkel oder in einer anderen Pose. Daraus
folgt genau eine Regel:

> **3D lohnt sich, wo dasselbe Objekt mehrfach in verschiedenen Zuständen gebraucht wird.
> 2D lohnt sich, wo ein Bild einmal gebraucht wird.**

Angewandt auf diesen Katalog:

| Motiv | Weg | Grund |
|---|---|---|
| `hoisting`, `building`, `saving`, `dying`, Sturz, Zerquetschen | **3D** | 6 bis 8 Bilder **einer** Figur, bei denen sich Kopfgröße, Körperbreite und Squash über die Sequenz nachvollziehbar verändern müssen. Genau hier driftet jedes Bildmodell. |
| `walking`, `falling`, `climbing`, `bashing`, `mining`, `digging` | 2D → Hand | Ebenfalls Sequenzen, aber mit nur 3 bis 8 Bildern und starken Extremposen. Hier ist der Handweg (zwei Posen generieren, Zwischenbilder pixeln) schneller als ein Rig. |
| Blockerhaltung | **3D** | Die Armspanne ist ein Spielsignal und muss exakt 96 Master breit sein. Ein Modell hält das über alle Ableitungen. |
| Falltür, Ausgang, Presse, Bärenfalle | **3D** | **Bewegliche Teile** in 2 bis 3 Zuständen: Türflügel, Ramme, Kiefer. Ein Modell verdrehen und dreimal rendern liefert drei Zustände **derselben** Geometrie. |
| Terrainbausteine | **3D** | Man braucht das Relief als echte Geometrie, um es orthografisch zu rendern und daraus kachelbare Flächen zu schneiden. |
| Weltrequisiten (Zahnräder, Kristalle, Eisblöcke) | **3D** | Dieselben Formen wiederholen sich über mehrere Parallaxebenen in unterschiedlicher Größe und Helligkeit. |
| Terrainkacheln, Parallax, UI, Keyart, Partikel | 2D | Einmalige Flächen ohne Zustandswechsel. Ein Modell wäre reiner Mehraufwand. |
| Ziffern, Stahlkachel, Sterne, Kopfleisten-Knöpfe | **von Hand** | Rasterarbeit. Weder 2D noch 3D trifft das Pixelraster. |

**Zu den Einstellungen, bewusst vorsichtig:** Tripo bietet Text-zu-3D und Bild-zu-3D sowie
Nachbearbeitungsschritte. Welche Optionen im eigenen Konto verfügbar sind, hängt von Tarif
und Version ab — bitte in der Oberfläche nachsehen, statt hier zitierte Parameternamen zu
erwarten. Die Prompts unten sind so geschrieben, dass sie **ohne Spezialoptionen**
funktionieren: kurz, objektbezogen, mit klaren Formaussagen. Tripo reagiert schlechter auf
lange Stilessays als Bildmodelle — deshalb sind diese Prompts deutlich kürzer als alle
anderen dieser Datei, und die Stilblöcke werden hier **nicht** vorangestellt.

**Bild-zu-3D ist der bessere Weg**, sobald A0 und A1 vorliegen. Dann dient der Textprompt
nur noch als Ergänzung zum hochgeladenen Turnaround.

### 17.1 Basisfigur mit Haar, T-Pose

Beliefert: alle Zustandsblätter (§7) und alle Todesarten (§10).

> **Referenz: A1** (Bild-zu-3D), sonst keine.

```
A small stylised cartoon worker creature, game-ready character model, T-pose
with arms straight out to the sides and legs slightly apart.

Proportions: only two and a half of its own head-heights tall. Very large
smooth rounded head making up a little over forty percent of the body
height, no ears, no nose. Two large round eyes set wide apart and low on the
face. Tiny simple mouth. Short barrel torso in a one-piece work suit with a
rolled collar, exactly as tall as the head, with softly rounded shoulders.
Short stubby arms ending in simple mitten hands with no separate fingers.
Very short legs ending in blunt rounded boots.

Hair: one single thick mane of many fused pointed strands rising from the
crown and sweeping backward and upward, modelled as one solid rounded volume
attached to the skull, not as separate hairs and not as a hair card. It
rises about half the body height above the crown and reaches the
same distance behind the skull. The front upper quarter of the head is bare
so a helmet can be fitted later. The mane is symmetric about the centre
plane of the head.

Surface: clean flat colour blocking only — sand-coloured skin on the head
and hands, red on the hair mane, teal on the torso and arms, dark teal on
the boots. Completely unlit, no baked shadows, no baked highlights, no
ambient occlusion, no gloss, matte diffuse only.

Geometry: simple rounded volumes, moderate polygon count, closed watertight
mesh, no thin protruding parts, no loose accessories, no cloth, no cape. The
hair mane must be thick and solid enough to stay visible when the model is
rendered only twelve pixels tall. Bold clear silhouette.
```

**Nachbearbeitung, die hier unbedingt dazugehört:** Der Haarschopf braucht im Rig **eine
eigene Kette aus zwei bis drei Gelenken**, sonst kann er nicht nachschwingen. Genau dafür
ist der 3D-Weg hier gewählt: Die Nachlaufregel aus §3.5 wird als Verzögerung dieser Kette
animiert, statt in acht Einzelbildern von Hand erfunden zu werden. Das ist der eigentliche
Gewinn und rechtfertigt den Aufwand allein.

### 17.2 Werkzeuge und Ausrüstung als Anbauteile

Beliefert: die Anbauteile (§8) und alle zehn Berufsblätter (§9).

> **Referenz: A2** (Bild-zu-3D), sonst keine.

```
A set of stylised cartoon tool props for a small worker character,
game-ready models, each as a separate simple object:

an angular hard hat with a flat front brim and a round forehead lamp, open
at the back with a clean rear edge and no neck guard, so that a hair mane
can pass behind it;
a small open umbrella with six ribs, a shallow dome canopy and a straight
handle;
the same umbrella furled and bound with a strap;
a round cannonball bomb with a collar and a short curled fuse;
a wide rectangular signal paddle with a short grip;
a short wooden plank step with two nail heads and one chipped end;
a short heavy sledgehammer with a blocky rectangular head;
a pickaxe with a curved double-pointed head and a long straight handle;
a broad flat-bladed shovel with a short handle;
a thick horseshoe magnet with squared pole tips;
a coiled steel jump spring with a flat mounting plate.

Style: chunky, exaggerated, oversized relative to a real tool, hard square
corners and flat faces, deliberately angular in contrast to a soft rounded
character. No fine detail, no engraving, no text.

Surface: flat single-colour blocking, warm amber for the metal and handles,
near-black for the striking heads, orange for the paddle. Completely unlit,
no baked shadows or highlights, matte diffuse only.

Geometry: moderate polygon count, closed watertight meshes, each prop
separate and centred at its own origin, no scene, no base plate, no ground.
Every prop must read as its own distinct silhouette at very small size.
```

### 17.3 Blockerhaltung als eigenes Modell

Beliefert: `blocking` (§7.10) und das Blockerblatt (§9.4).

Der Blocker ist die einzige Pose, die man **nicht** aus dem Basismodell heraus animieren
sollte: Seine Silhouette ist das Spielsignal und muss auf den Pixel stimmen.

> **Referenz: A1** (Bild-zu-3D), sonst keine.

```
The same small stylised cartoon worker creature, game-ready character model,
in a rigid blocking pose: standing frontally, feet planted wide and firm,
both arms stretched perfectly straight out to the left and right at chest
height, elbows locked, mitten hands turned so the palms face forward.

Total arm span exactly twice the height of the head. Chin slightly raised,
face set and determined, eyes narrowed.

Hair: the same single thick upswept mane rising from the crown as one
solid rounded volume, here pressed back and down against the skull, staying
well inside the arm span and never breaking the straight top line formed by
the outstretched arms.

Surface: flat colour blocking only, sand skin, red hair mane, teal
one-piece suit, dark teal boots, an orange band across the chest and an
orange rectangular paddle in each hand. Completely unlit, no baked shadows
or highlights, matte diffuse only.

Geometry: moderate polygon count, closed watertight mesh, arms thick enough
to stay visible at very small render sizes. The silhouette must read as a
solid wide letter T with a heavy base.
```

### 17.4 Falltür und Ausgangstür

Beliefert: §13.1 und §13.2. Der Grund für 3D steht in §17.0: bewegliche Teile in mehreren
Zuständen.

> **Referenz: keine.**

```
Two separate stylised game props, chunky low-detail cartoon style with
generously rounded corners.

Prop one: a hanging industrial hopper, a riveted rectangular metal box wider
than it is tall, with two hinged doors forming its underside, two thick
chain links rising from the top corners, and a small dome lamp on the top
face. Model the two doors as separate hinged parts on a real axis so they
can be posed closed and swung open to seventy degrees.

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

### 17.5 Presse und Bärenfalle

Beliefert: §13.3 und §13.4.

> **Referenz: keine.**

```
Two separate stylised game props, chunky low-detail cartoon style,
mechanical hazard devices with generously rounded corners.

Prop one: an industrial crushing press. A heavy rectangular ram block with
bevelled edges and raised rivets, mounted between two vertical guide rails,
above a scarred flat anvil base plate. Model the ram as a separate part that
slides along the rails, so it can be posed raised, half way down and fully
closed. Include a small round indicator lamp on the side of the ram as its
own separate surface.

Prop two: a spring-loaded jaw trap. A semicircular flat base plate, two
hinged jaws each carrying a row of blunt triangular teeth, a coil spring at
each hinge, a small round pressure plate in the centre and a short chain
attached to one side. Model the two jaws as separate hinged parts on a real
axis so the trap can be posed open flat and snapped shut.

Surface: flat colour blocking, cool grey steel for the press, dark rusted
iron for the trap. Completely unlit, no baked shadows or highlights, matte
diffuse only.

Geometry: moderate polygon count, closed watertight meshes, exaggerated
chunky proportions, teeth large and blunt rather than fine and sharp. No
ground plane, no scene, no background.
```

### 17.6 Terrainbausteine

Beliefert: §11.1 bis §11.4. Terrain entsteht im Spiel als Bitmaske, nicht als Modell
(GDD §11) — diese Blöcke liefern nur die **Texturgrundlage**: orthografisch rendern,
zuschneiden, kacheln.

> **Referenz: A3.**

```
A set of stylised game terrain chunks, chunky low-detail cartoon style, each
as a separate object.

Chunk one: a block of loose crumbly soil with embedded pebbles and a rough
uneven surface.
Chunk two: a block of angular faceted rock with sharp interlocking fracture
planes and deep crevices.
Chunk three: a riveted steel armour plate, perfectly flat and machined, with
a regular grid of dome-head rivets and bevelled plate seams.
Chunk four: a single wooden plank step with visible grain, two nail heads and
one chipped end.
Chunk five: a block of granular packed snow with a hard glazed upper crust.
Chunk six: a block of porous volcanic ash and scoria full of small round gas
holes.

All six chunks the same overall size, all as flat-fronted slabs suitable for
rendering in strict orthographic front view and tiling the result.

Surface: flat colour blocking only, brown for soil, grey for rock, cool grey
for steel, warm brown for the plank, pale blue-grey for the snow, dark brown
for the ash. Completely unlit, no baked shadows, no ambient occlusion, matte
diffuse only.

Geometry: moderate polygon count, closed watertight meshes, surface relief
expressed as real geometry rather than as texture detail, with no relief
feature larger than a sixth of the slab so the rendered result tiles without
a recognisable landmark. No ground plane, no scene, no background.
```

### 17.7 Weltrequisiten für die Parallaxebenen

Beliefert die Vordergrund- und Mittelebenen der Weltblätter §12.3 bis §12.12. Der Grund für
3D: Dieselben Formen erscheinen in drei Tiefenebenen in unterschiedlicher Größe und
Helligkeit — als Modell rendert man sie dreimal und bekommt dreimal dieselbe Form.

> **Referenz: keine.**

```
A set of stylised background props for the parallax layers of a side-
scrolling game, chunky low-detail cartoon style, each as a separate object,
all with generously rounded corners and blunt tips.

Prop one: a large blunt crystal cluster, five fused hexagonal shafts of
different heights with flat facets and rounded tips.
Prop two: a broad flat-toothed cogwheel with twelve big blunt teeth, a thick
rim, four spokes and a chunky central hub.
Prop three: a heavy riveted industrial girder section with bolt plates at
both ends.
Prop four: a blocky glacier ice terrace, a stepped slab with three broad
level terraces and blunt hanging icicles along one underside.
Prop five: a rounded basalt outcrop, a stack of four short vertical columns
with flat tops of different heights.
Prop six: a small floating timber platform, a rectangular deck of planks with
rope lashings, four mooring rings and a short mast.

All six the same overall height, each centred at its own origin.

Surface: flat single-colour blocking only, one colour per prop. Completely
unlit, no baked shadows, no ambient occlusion, no emissive, matte diffuse
only — these props are rendered flat and recoloured per depth layer, so any
baked lighting would fix them to one layer.

Geometry: moderate polygon count, closed watertight meshes, bold readable
silhouettes that survive being rendered small and hazy. No ground plane, no
scene, no background.
```

---

## §18 Wo die Werkzeuge scheitern — ehrlich

Die Bibliothek sagt es allgemein, die Integrationsdatei sagt es für die Maßhaltigkeit. Hier
steht, was **an diesem Katalog** scheitert, mit den zwei Punkten, die durch das Haar neu
dazukommen.

### 18.1 Die harte Wahrheit über Pixelart

**Bildmodelle liefern zuverlässig „Pixelart-Look", nicht echtes Pixelart.** Typische Fehler:
kein sauberes Pixelraster, Kantenglättung mitten in der Fläche, mehrere tausend statt
24 Farben, Halbpixel, inkonsistente Pixelgröße innerhalb eines Bildes. Für ein Spiel, dessen
Figur **12 logische Pixel** hoch ist und dessen Zelle **28 × 28** misst, ist das nicht direkt
verwertbar.

**Der einzige Weg zu echtem Pixelart im Spiel führt über Nachbearbeitung von Hand** (Aseprite
oder Vergleichbares) oder über den 3D-Weg aus §17. Die Bildmodelle sind Zulieferer für
Konzept, Hintergrund und Marketing — nicht für Sprites.

### 18.2 Was zuverlässig schiefgeht

| Anforderung | Was das Modell liefert | Was zu tun ist |
|---|---|---|
| „exakt 8 Zellen in einer Reihe" | 6, 7 oder 9 Zellen, ungleich breit | Blatt verwerfen und neu erzeugen — nicht reparieren |
| „Grundlinie in allen Zellen bei 160 px" | Grundlinie wandert um 5–15 px | Zellen einzeln freistellen, an der Fußunterkante ausrichten |
| „Figur in allen Bildern gleich groß" | Kopf wächst und schrumpft um 10–20 % | Kopfdurchmesser messen, Bilder skalieren, danach neu pixeln |
| „ein Bild je gelaufenem Pixel" | eine Pose, achtmal leicht variiert | Bild 1, 3, 5, 7 behalten, Zwischenbilder von Hand einsetzen |
| „Wert nie über 200" | Werte bis 255, oft mit hellen Glanzstellen | Tonwertkorrektur, danach Histogramm prüfen |
| „nahtlos kachelbar" | sichtbare Naht, oft mit Vignette | Halbversatz-Test, Naht übermalen, Vignette abziehen |
| „Niete bei Master (36, 36) je 64er-Block" | irgendwo, unregelmäßig | Stahlkachel gar nicht generieren, aus der Formel malen (§11.3) |
| „Anbauteil ohne Figur" | Modell malt trotzdem eine Figur dazu | Freistellen oder verwerfen |
| „exakt 5 Ziffern auf einem 5×7-Raster" | schöne Ziffern, falsches Raster | Von Hand setzen (§8.4) |

### 18.3 Die zwei neuen Fehlerquellen, die vom Haar kommen

Diese beiden stehen in keiner der bestehenden Dateien, weil es dort kein Haar gab. Sie sind
in der Praxis die häufigsten Rückläufer dieses Katalogs.

**1. Das Modell macht aus dem Schopf eine Frisur.** Der Prompt sagt „ein geschlossener
Schopf aus drei bis vier dicken Strähnen". Das Modell liefert wehendes Einzelhaar, eine
Mähne, einen Pony, manchmal einen Zopf. Bei 12 Pixeln wird daraus ein unleserlicher rosa
Matsch, weil Einzelhaare bei dieser Größe zu Rauschen zerfallen.
**Gegenmittel:** Die Negativliste in §5.5 enthält dafür einen eigenen Absatz. Trotzdem
gilt: **Ein Schopf, der beim Herunterrechnen auf 12 Pixel zu zwei bis drei zusammenhängenden
Pixeln wird, ist gut. Alles andere ist zu fein und wird verworfen.** Diesen Test macht man
am Bildschirm in zehn Sekunden.

**2. Das Modell animiert das Haar nicht mit — es kopiert es.** Fordert man acht Laufbilder,
bekommt man achtmal denselben Schopf in derselben Lage, an leicht verschiedene Köpfe
geklebt. Der Nachlauf aus §3.5 entsteht **nicht** von selbst, in keinem Bildmodell, unter
keiner Formulierung. Das ist die härteste Einschränkung dieses ganzen Katalogs.
**Gegenmittel, in dieser Reihenfolge:**
- Für die sechs kurzen Clips: Extremposen generieren, Haar von Hand mit einem Bild
  Verzögerung nachziehen. Das Haarstellungsblatt (§6.4) ist genau dafür da — man setzt die
  passende der acht Lagen ein, statt sie neu zu erfinden.
- Für die sechs längeren Sequenzen: den 3D-Weg (§17.1) mit einer Gelenkkette im Schopf.
  Dort entsteht der Nachlauf durch Verzögerung der Kette und ist danach in jeder Sequenz
  automatisch richtig.

### 18.4 Aufwandsschätzung

Ehrlich, damit die Planung stimmt. Kein generiertes Asset geht ohne Nachbearbeitung ins
Spiel. Die Werte übernehmen die Schätzung aus `grafik-prompts.md` §11 und ergänzen den
Haaraufschlag.

| Asset | Nachbearbeitung | Aufwand |
|---|---|---|
| Figur, 12 px, je Beruf | vollständig von Hand nachgepixelt | 1–2 h |
| Laufzyklus, 8 Bilder | Phasen ausrichten, Grundlinie fixieren, **Haarnachlauf einsetzen** | 4–5 h |
| Arbeitsclip, 3–4 Bilder | dito | 1,5–2 h je Clip |
| Todes- oder Rettungssequenz, 6–8 Bilder | Timing, Silhouetten, **Haarstillstand ab Bild 6** | 2–3 h je Sequenz |
| Terrainkachel | Kachelbarkeit prüfen, Naht reparieren, Palette reduzieren | 30–60 min je Kachel |
| Parallax-Ebene | zerschneiden, freistellen, kachelbar machen | 1–2 h je Welt |
| UI-Symbol | meist komplett neu gezeichnet | 20 min je Symbol |
| Keyart | Farbkorrektur, Titelfläche freiräumen, Zuschnitte | 2–3 h |
| 3D-Modell | Netz aufräumen, T-Pose korrigieren, **Haarkette riggen**, Render-Setup | 5–9 h je Modell |

**Der Haaraufschlag insgesamt: rund 15 Stunden** über den gesamten Figurenbestand. Das ist
der Preis für das Signaturmerkmal, und er ist es wert — aber er gehört in den Plan und nicht
in die Überraschungen.

### 18.5 Zu Werkzeugeinstellungen: bewusst nichts Konkretes

Welche Bildreferenz-, Zufallswert- oder Auflösungsoptionen zur Verfügung stehen, hängt vom
Werkzeug, vom Tarif und vom Stand des jeweiligen Dienstes ab. Dieser Katalog nennt deshalb
**keine Parameternamen und keine Zahlenwerte für Einstellungen.** Das Verfahren bleibt das
aus §4.3: Anker weiterreichen, in Serien arbeiten, Prompt und Einstellung zu jedem
behaltenen Asset mitspeichern.

---

## §19 Prüfliste vor der Abnahme

Jedes Asset muss diese Fragen mit Ja beantworten, sonst geht es zurück. Die ersten fünf
gelten für alles, die weiteren je nach Art.

**Für jedes Asset:**

1. **Silhouettentest.** Asset komplett schwarz füllen, auf Zielgröße herunterrechnen. Noch
   identifizierbar? Bei Berufen: von den anderen neun unterscheidbar?
2. **Graustufentest.** Farbe entfernen. Trägt das Bild noch? Wenn nicht, tut es für
   farbfehlsichtige Spieler nicht, was es soll (GDD §6).
3. **Palette eingehalten?** Nur Farben aus §5.4, plus Leuchten und Funken.
4. **Rechtsprüfung.** Kein grünes Haar, keine Kutte, keine Kapuze, keine Ähnlichkeit zu
   einer geschützten Figur, keine fremde Marke im Bild (GDD §12).
5. **12-Pixel-Test auf echtem Gerät.** Auf einem Telefon ansehen, mit dem Daumen davor, im
   Zug, bei Sonne. Das ist die einzige Umgebung, die zählt.

**Zusätzlich für Zustandsblätter:**

6. **Stapeltest.** Alle Zellen übereinanderlegen — liegen Fußunterkante und Mittellinie in
   allen Bildern auf demselben Pixel?
7. **Zellzahl.** Ist die Bildzahl exakt die aus `grafik-integration.md` §2.3? Eine mehr oder
   weniger bricht die Taktbindung.
8. **Randtest.** Ragt in irgendeinem Bild etwas über die Zellgrenze? Der Renderer schneidet
   hart ab.
9. **Spiegeltest.** Blatt waagerecht spiegeln — noch richtig beleuchtet, keine
   Seitenkennung, kein einseitiger Haarwirbel?
10. **Wirkungsbild.** Liegt der Werkzeugaufprall auf **Bild 1**?

**Zusätzlich für alles mit Haar — die vier neuen Fragen:**

11. **Haar-Nachlauftest.** Blatt Bild für Bild durchklicken. Ist die Haarstellung in
    **jedem** Bild eine andere, und liegt sie sichtbar **hinter** der Körperbewegung?
    Ein Haar, das in zwei aufeinanderfolgenden Bildern identisch steht, ist ein Fehler —
    außer in `blocking` Bild 1/2 (dort ist es umgekehrt: nur das Haar darf sich ändern) und
    in den Bildern 6 bis 8 der Todes- und Sturzsequenzen (dort muss es stillstehen).
12. **Haar-Massentest.** Auf 12 Pixel herunterrechnen. Ist der Schopf **zwei bis drei
    zusammenhängende Pixel** in zwei Helligkeitsstufen? Wird er zu einem Pixel, ist er zu
    klein; zerfällt er in einzelne Punkte, ist er zu fein.
13. **Haar-Sperrzonentest.** Bleibt das Haar innerhalb ±3 logischer Pixel von der
    Mittellinie, oberhalb der Schulterlinie und unterhalb von 4 Pixeln über dem Scheitel
    (§3.4)? Kreuzt es die Mittellinie nach vorn nur in `bashing` 1, `digging` 1 und
    `building` 1?
14. **Haar-Berührungstest.** Berührt das Haar irgendwo den Anzug? Wenn ja: Fehler. ΔL\*
    zwischen Beerenrosa und Türkis ist 6,7 und damit ein Helligkeitsgleichstand (§2.6).
    Erlaubte Ausnahmen sind nur `falling` und `dying` ab Bild 4.

**Zusätzlich für Berufe — der Doppeltest aus §3.4:**

15. Alle zehn Berufe schwarz gefüllt, auf 12 Pixel, nebeneinander: **zehnfach
    unterscheidbar?** Danach das Haar entfernen und wiederholen. **Beide Durchläufe müssen
    dasselbe Ergebnis liefern.** Verbessert das Haar den Test, ist es zu berufsspezifisch;
    verschlechtert es ihn, ist es zu groß.

**Zusätzlich für Kacheln:**

16. **Halbversatz-Test.** Textur um halbe Breite und halbe Höhe versetzen. Naht sichtbar?
    Wiedererkennbares Motiv sichtbar?
17. **Histogramm.** Liegt jeder Kanal im Band aus `grafik-integration.md` §5.0 — 32 bis 200,
    bei Stahl 24 bis 232? Wenn nicht, verschwindet die frische Bruchkante.

---

## §20 Reihenfolge — womit man anfängt

Sortiert nach sichtbarem Gewinn je Arbeitsstunde. Die Rangfolge folgt der aus
`grafik-integration.md` §7 und ist nur um die Ankerbilder und das Haar ergänzt.

| Rang | Was | Prompt |
|---|---|---|
| **0** | **A0 abnehmen.** Ohne ein bestandenes A0 wird nichts anderes begonnen. | §6.1 |
| 1 | A1, A2, A3, A4 — die vier weiteren Anker | §6.2, §6.3, §12.1, §12.2 |
| 2 | Parallax Grasland zuschneiden und einbauen: größte Bildfläche, zwei `drawImage`-Aufrufe | §12.2 |
| 3 | Terrain Erde, Fels, Grasnarbe | §11.1, §11.2, §11.5 |
| 4 | `walking` — über neun Zehntel aller Figurenbilder, und der erste Beweis für das Haar | §7.1 |
| 5 | Die vier Arbeitsclips `bashing`, `mining`, `digging`, `building` | §7.7–§7.9, §7.6 |
| 6 | `blocking`, `falling`, `floating` — Lesbarkeit im Gewusel | §7.10, §7.2, §7.3 |
| 7 | Anbauteile: Helm, Schirm, Bombe, Ziffern | §8.1–§8.4 |
| 8 | Ausgang und Falltür | §13.2, §13.1 |
| 9 | `saving` und `dying`, danach die vier Spezialtode | §7.11, §7.12, §10.1–§10.5 |
| 10 | `climbing` und `hoisting` | §7.4, §7.5 |
| 11 | Die fünf weiteren Welten | §12.3–§12.12 |
| 12 | Fallen, Stahl- und Ziegelkachel | §13.3–§13.6, §11.3, §11.4 |
| 13 | Partikel und Explosion | §14.1–§14.6 |
| 14 | Oberfläche, Symbole, Lupenrahmen | §15.1–§15.7 |
| 15 | App-Symbol, Ladebild, Store | §16.1–§16.5 |

Die Grenze zwischen „verändert den Gesamteindruck" und „verbessert Details" liegt zwischen
Rang 7 und 8. Bis dahin sieht man jeden Schritt sofort; danach nur noch beim Hinsehen.

**Die drei Berufsblätter §9.6, §9.7 und §9.8** — Rammer, Schrägbagger, Gräber — sollte man
trotz dieser Reihenfolge **vor** Rang 5 erzeugen und nebeneinanderlegen. Sie sind die
gefährlichste Verwechslung im Spiel, und wenn sie sich als schwarze Silhouetten nicht
unterscheiden, ändert das die Werkzeugformen — und dann sind alle vier Arbeitsclips
umsonst gemacht.





