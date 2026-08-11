# Wuselwerk — Abnahme Basisfigur und Entscheidung Umhang

Entscheidungsvorlage, nicht Katalog. Zwei Fragen, zwei Antworten, die Zahlen dahinter.

Geprüfte Datei: `Wuselwerker_V2.glb`, Tripo, glTF 2.0, 322 kB, 3252 Vertices,
4796 Dreiecke, 41 Gelenke, 0 Animationen, eine 512 × 512 JPEG-Basisfarbtextur.
Geprüft wurde durch Parsen der Datei, Vermessen der Geometrie, orthografisches
Rastern der Silhouette und Herunterrechnen auf 12 Pixel — also entlang des
Arbeitsablaufs aus `grafik-prompts.md` §10, nur ohne Blender.

---

## Teil 1 — Basisfigur

### 1.1 Das Urteil

**Nein. Als Grundlage nicht brauchbar.** Nicht weil die Ausführung schlecht wäre —
Netz, Material und Rig sind sauber — sondern weil es **eine andere Figur ist**.

Geliefert wurde ein kahlköpfiger, ohrentragender Erwachsener im Sakko mit Hemd,
Krawatte und Halbschuhen, 3,45 Kopfhöhen groß. Bestellt war ein 2,5 Kopfhöhen
großes Wesen im Einteiler, mit Stiefeln und einem nach hinten gerichteten
Haarschopf.

Der Grund für den Fehlschlag ist wahrscheinlich nicht der Prompt, sondern die
Reihenfolge: Der Katalog stellt in §20 den Rang 0 auf — **„Ohne ein bestandenes A0
wird nichts anderes begonnen"**, und §17.1 nennt A1 als Referenz für Bild-zu-3D.
Hier hat Tripo aus reinem Text raten müssen und hat geraten, was ein Textmodell
bei „worker creature" immer rät: einen Büroangestellten.

### 1.2 Was gemessen wurde

Alle Zahlen relativ zur Figurenhöhe (Modellhöhe 0,998 Einheiten = 1,000).

| Merkmal | Vorgabe | Gemessen | |
|---|---|---|---|
| Größe in eigenen Kopfhöhen | 2,50 (§2.1, §17.1) | **3,45** | fällt |
| Kopf, Anteil der Figurenhöhe | 42 % (§2.1) | **29,0 %** | fällt |
| Kopf, Breite zu Höhe | 0,80 (4 Spalten auf 5 Zeilen) | **1,40** — er ist breiter als hoch | fällt |
| Kopfbreite / Rumpfbreite | ≤ 1,00 (§2.1) | **1,51** | fällt |
| Augenabstand, Anteil der Kopfbreite | 25 % (§2.2) | **7,4 %** → 0,3 px bei 12 px Höhe | fällt |
| Haarschopf | 2 px über, 2 px hinter dem Scheitel (§3.3) | **nicht vorhanden** | fällt |
| Ohren | keine (§17.1) | vorhanden, deutlich abstehend | fällt |
| Nase | keine (§17.1) | vorhanden, als eigene Schale | fällt |
| Augenbrauen | keine (§5.5 Negativprompt) | vorhanden, als zwei eigene Schalen | fällt |
| Kleidung | Einteiler mit Rollkragen (§17.1) | **Sakko mit Revers, Hemd, Krawatte, Taschen** | fällt |
| Stiefel | 2 von 12 Zeilen = 17 % (§2.1) | 9,2 %, und es sind flache Halbschuhe | fällt |
| Beine | so kurz, dass sie fast nur Stiefel sind | **39,5 % der Figurenhöhe**, dünn | fällt |
| Farbtrennung Haut ↔ Anzug ↔ Stiefel ↔ Hände | je Grenze ≥ 15 L\* (§2.6) | **0,0 bis 0,4 L\*** | fällt |
| Farbwerte | 4 Hex-Werte aus §5.4 | ein Farbton, Gesamtstreuung ΔH 4,8° | fällt |
| Eingebackene Umgebungsverdeckung | keine (§17.1) | vorhanden, r = −0,35, 8,1 L\* Delta | fällt |
| Haarkette im Rig | 2–3 Gelenke (§17.1 Nachbearbeitung) | **nicht vorhanden**, `Head` ist Kettenende | fällt |
| Spiegelsymmetrie | gefordert (§3.3, Prüfliste §19.9) | 90,7 % der Vertices | knapp |
| Eingebackenes Schlüssellicht | keins | **keins** — Korrelation Normale↔Helligkeit = +0,001 | **hält** |
| Geschlossenes Netz | wasserdicht (§17.1) | **0 offene Kanten, 0 nicht-mannigfaltige Kanten** | **hält** |
| Polygonzahl | moderat | 3252 V / 4796 F | **hält** |
| Material | `metallic` 0, `roughness` 0,9, kein Emissive | erfüllt | **hält** |
| Benannte Gelenkkette | für §7 und §10 | 41 Gelenke, saubere Benennung | **hält** |

**Fünf von zwanzig Punkten halten.** Die fünf, die halten, sind Handwerk. Die
fünfzehn, die fallen, sind Gestalt.

### 1.3 Der 12-Pixel-Test

Der einzige Test, der nach §2.8 und §5.1 wirklich zählt. Modell orthografisch in
Seitenansicht auf 96 Pixel Figurenhöhe gerastert, dann auf 12 Pixel
heruntergerechnet — genau der Weg aus `grafik-prompts.md` §10 Schritt 2 und 3.

**Ergebnis: eine einzige sandfarbene Säule.** Kein Kopfabsatz, kein
Schulterabsatz, keine Stiefelkante.

Die Zahlen dazu: Zwischen Kopf, Rumpf, Händen und Stiefeln liegen 0,0 bis 0,4 L\*
— innerhalb des Kopfes allein aber 27,7 L\*, innerhalb des Rumpfes 16,5 L\*. Der
Katalog reserviert 15 L\* für die *echten* Materialgrenzen (§2.6). Dieses Modell
gibt den echten Grenzen 0,1 und den zufälligen Verläufen das Doppelte des
Sollwerts. **Die stärkste Kante im Modell ist eine falsche** — und beim
Herunterrechnen gewinnt immer die stärkste.

Zusätzlich zerfällt die Silhouette in den unteren Zeilen: Die dünnen Beine
belegen in der Seitenansicht nur noch 1,4 logische Pixel Breite, gegen 2,5 bis
3,0 Pixel Rumpf. Bei 12 Pixeln ist die untere Figurenhälfte damit ein Faden,
während der Katalog dort einen 4 Pixel breiten Block und darunter 2 Zeilen
Stiefel verlangt.

### 1.4 Farbtrennung und eingebackenes Licht — die Einordnung

**Beides ist der harmloseste Teil des Befunds, und beides begründet keine
Neugenerierung.**

Die Textur wird ohnehin gelöscht. Der Katalog verlangt in §5.4 exakte
Hex-Werte und in §2.6 exakte L\*-Abstände. Kein Generator trifft Hex-Werte. Der
richtige Weg ist deshalb nicht „bessere Textur bestellen", sondern: **Textur
wegwerfen, in Blender vier flache Materialien auf die Vertexgruppen legen** — die
sind über die Gelenkzuordnung bereits sauber getrennt (Kopf 1386 Vertices, Rumpf
509, Hände 470, Füße 245). Das sind 20 bis 40 Minuten Arbeit, einmal, und danach
stimmen die Farben auf den Wert genau statt ungefähr.

Zum Licht, präziser als vermutet: **Ein eingebackenes Schlüssellicht gibt es
nicht.** Die Korrelation zwischen der Aufwärtskomponente der Flächennormale und
der Texturhelligkeit ist +0,001, der Unterschied zwischen nach oben und nach
unten weisenden Flächen ist 0,0 L\*. Was tatsächlich eingebacken ist, ist
**Umgebungsverdeckung**: Die Korrelation mit der Verdeckung beträgt −0,35, offene
Flächen liegen bei L\* 76,2, Flächen in Vertiefungen bei 68,1 — 8,1 L\* Delta,
sitzend unter dem Kinn, in den Achseln und an den Kragenkanten. Dazu kommt
gemalte Tonwertvariation.

Das ist wichtig für die Prompt-Formulierung: **„no baked shadows, no baked
highlights" hat funktioniert. „No ambient occlusion" hat nicht funktioniert.**
Der nachgebesserte Prompt muss die Verdeckung einzeln und mit anderen Worten
benennen.

Fazit dieses Punktes: **Farbe und Licht wären Blender-Arbeit. Die Geometrie ist
es nicht.** Aus 3,45 Kopfhöhen 2,50 zu machen heißt, den Kopf um 45 % zu
vergrößern, die Beine um rund 60 % zu kürzen, die Ohren und die Nase zu löschen,
das Sakko zu Revers und Krawatte abzutragen, den Einteiler neu zu bauen, die
Halbschuhe durch Stiefel zu ersetzen und danach alles neu zu häuten. Das ist
mehr Arbeit als eine Neugenerierung — und am Ende hätte man immer noch eine
Figur, deren Kopf 1,40-mal so breit wie hoch ist, weil dieses Verhältnis in der
Grundform steckt und nicht nachträglich gedreht werden kann.

> **Entscheidung: Neugenerieren. Wegen der Geometrie, ausdrücklich nicht wegen
> der Farbe und nicht wegen des Lichts.**

### 1.5 Was am Skelett wert ist

**Die Kette taugt. Sie hat nur nicht das, wofür 3D hier überhaupt gewählt wurde.**

Was gut ist: 41 Gelenke in sauberer Hierarchie —
`Root → Hip → Pelvis/Waist → Spine01 → Spine02 → NeckTwist01/02 → Head`, dazu
Clavicula, Ober- und Unterarme, Hände, Oberschenkel, Unterschenkel, Füße und
Zehen. Branchenübliche Benennung, brauchbar in Blender ohne Umbenennen. Für
alles, was §17.0 vom 3D-Weg erwartet — `hoisting`, `building`, `saving`, `dying`,
Sturz, Zerquetschen — reicht das vollständig aus. Fingergelenke fehlen und werden
bei einer Fausthand auch nie gebraucht.

Was fehlt, und es ist genau das eine:

- **Keine Haarkette.** `Head` ist das Ende der Kette; darüber sitzt nichts. §17.1
  schreibt aber ausdrücklich vor: *„Der Haarschopf braucht im Rig eine eigene
  Kette aus zwei bis drei Gelenken, sonst kann er nicht nachschwingen. Genau
  dafür ist der 3D-Weg hier gewählt."* Ohne Haargeometrie und ohne Haarkette
  liefert dieses Modell die zwölf Nachlaufregeln aus §3.5 nicht — und damit
  keinen einzigen Vorteil gegenüber dem 2D-Weg. **Das ist der teuerste Einzelmangel
  der Lieferung**, teurer als jede Proportion, weil er den Grund für das
  Verfahren aufhebt.
- **Das Rig ist leicht asymmetrisch.** `L_Thigh` liegt bei x = +0,0756,
  `R_Thigh` bei x = −0,0648; `R_Forearm` sitzt 0,007 tiefer als `L_Forearm`;
  9,3 % der Vertices haben kein Spiegelbild. Der Renderer spiegelt das Sprite
  (`ctx.scale(-1, 1)`, `grafik-integration.md` §2.4), und die Prüfliste §19.9
  verlangt den Spiegeltest. Das muss **vor** dem Posieren einmal
  X-symmetrisiert werden, nicht danach.
- **14 Twist-Gelenke sind Ballast.** `ThighTwist`, `CalfTwist`, `UpperarmTwist`,
  `ForearmTwist`, `NeckTwist` existieren für Hautverformung in Nahaufnahme. Bei
  96 Master- und 12 logischen Pixeln tun sie nichts. Nicht schädlich, nur
  Rauschen in der Auswahl.
- **0 Animationen.** Richtig so — die Posen entstehen in Blender.

Praktischer Schluss: Da die Geometrie neu muss, geht das Rig mit ihr.
Der Wert dieser Lieferung liegt woanders: **Sie beweist, dass Tripos
Auto-Rigger eine brauchbare, korrekt benannte Kette erzeugt.** Damit ist das
Hauptrisiko des 3D-Wegs abgeräumt, und §17.0 steht auf festerem Boden als vorher.

### 1.6 Der nachgebesserte Tripo-Prompt

Vorher, wichtiger als der Prompt: **Erst A0 und A1 erzeugen, dann Bild-zu-3D.**
§20 Rang 0 gilt. Der Prompt unten ist der Text-zu-3D-Rückfall und zugleich der
Begleittext für den Bild-zu-3D-Lauf.

```
A small stylised cartoon worker creature, game-ready character model, in a
T-pose with arms straight out to the sides and legs slightly apart,
perfectly symmetric about its centre plane.

Proportions — the most important part of this prompt, check it before
anything else: the whole creature is only two and a half of its own
head-heights tall. The head alone is forty percent of the total height. The
head is TALLER THAN IT IS WIDE, tall like an upright egg, never wide like a
ball. The head is NOT wider than the torso; head and torso have the same
width and the head gets its size from its height alone. The torso is
exactly as tall as the head. The legs are so short that they are almost
entirely boot, and the boots are one sixth of the total height.

Head: one smooth rounded dome. No ears at all. No nose at all. No eyebrows,
no eyelids, no eyelashes, no chin, no cheeks. Two plain round eyes placed
low on the face and set very wide apart, with a clear gap between them as
wide as one eye. One tiny simple mouth.

Hair, mandatory and load-bearing: a single thick tuft of three or four
fused strands rising from the crown and sweeping backward and upward, built
as ONE solid rounded volume welded to the skull. Not separate hairs, not
hair cards, not a flat plane, not a fringe. It stands one sixth of the body
height above the crown and reaches the same distance behind the back of the
head, and it is thick enough to remain a single solid shape at very small
size. The front upper quarter of the head stays bare so a helmet can be
fitted later. Symmetric about the centre plane.

Clothing: one single closed one-piece work overall covering torso, arms and
legs together, with a plain rolled collar at the neck. No jacket, no
lapels, no open front, no shirt, no tie, no scarf, no pockets, no belt, no
buttons, no visible seams, no cape, no cloak, no hood. Short stubby arms
ending in simple mitten hands with no separate fingers. Blunt rounded
boots, chunky and clearly taller than a shoe.

Surface: exactly four flat colour blocks and nothing else — sand on head
and hands, pink on the hair tuft, teal on the overall including arms and
legs, dark teal on the boots. Each block one single uniform colour from
edge to edge. Completely unlit and completely untextured: no baked shadows,
no baked highlights, no ambient occlusion, no cavity shading, no contact
darkening in the creases, no darkening under the chin or in the armpits, no
painted lines, no drawn detail lines, no wrinkles, no gradients, no noise.
Matte diffuse only.

Geometry: simple rounded volumes, moderate polygon count, closed watertight
mesh, no thin protruding parts, no loose accessories. Bold clear silhouette
that stays readable when the model is rendered only twelve pixels tall.
```

Der Zusatz für den **Bild-zu-3D**-Lauf, sobald A1 vorliegt — kurz halten, das
Bild trägt dann die Gestalt:

```
Rebuild the creature from the supplied orthographic turnaround exactly as
drawn. Keep its proportions unchanged: head forty percent of the total
height, head taller than wide, head no wider than the torso, boots one
sixth of the height. Keep the backward-swept hair tuft as one solid volume.
No ears, no nose, no eyebrows. One-piece overall, no jacket and no lapels.
Four flat unlit colour blocks, no baked lighting of any kind, no ambient
occlusion, no painted detail lines. Closed watertight mesh, moderate
polygon count.
```

### 1.7 Nachbearbeitung, die zur Lieferung gehört

Vier Schritte, in dieser Reihenfolge, bevor das nächste Modell abgenommen wird:

1. **Textur löschen**, vier flache Materialien mit den Werten aus §5.4 auf die
   Vertexgruppen legen. Die Grenzen prüfen: Haut ↔ Anzug 14,0 L\* ist knapp, dort
   gehört der 1-Pixel-Kragenstrich hin (§2.6).
2. **X-symmetrisieren**, Rig und Netz, vor jedem Posieren (§19.9).
3. **Haarkette nachrüsten:** zwei bis drei Gelenke von `Head` in den Schopf,
   Gewichte nur auf das Haarvolumen. Ohne diesen Schritt ist der 3D-Weg
   gegenstandslos (§17.1).
4. **Erst danach** orthografisch auf 96 Pixel Figurenhöhe rendern und den
   12-Pixel-Test aus §19.1, §19.2 und §19.12 fahren.

---

## Teil 2 — Umhang oder Kutte

### 2.1 Die Rechnung, bevor die Meinung kommt

Bezugssystem: `y` ist die Fußlinie, nach oben negativ. Die Figur belegt die
Zeilen `y−12` bis `y−1` (§2.1: Kopf 5, Rumpf 5, Stiefel 2), Kernbreite 4 Spalten
(`−2` bis `+1`), Umriss in `−3` und `+2`. Die Berufsmarken stehen in §2.1, §9 und
in `src/render/sprites.ts` 96–117.

**Was auf jeder Zeile schon sitzt:**

| Zeile | Belegt durch | Rückseite (Spalten −4/−5) frei? |
|---|---|---|
| `y−12` … `y−8` | Kopf; Helm auf `y−14`/`y−13`; Schirmdach auf `y−18`/`y−17` | Haarzone, keine Umhangzone |
| `y−9`, `y−8` | Blockerarme, Spalten `−6` … `+5` | nein |
| `y−7`, `y−6` | Blockerhände, Spalten `−5` … `−4` | **nein** |
| `y−5` | Rammerbalken (§2.1); Bashing-Balken `+2` … `+6` | ja |
| `y−4` | Bauplanke `+1` … `+7`; Andockpunkt `belly` für die Bombe (§8.3) | ja |
| `y−3` | Schrägbagger, unteres Blatt `+4` … `+6` | ja |
| `y−2`, `y−1` | Stiefel; Springerfedern (§9.10) | nein |
| `y` … `y+2` | Gräberbalken `−4` … `+3` | nein |

> **Für ein Kleidungsstück hinter der Figur bleiben drei Zeilen (`y−5`, `y−4`,
> `y−3`) und zwei Spalten (`−4`, `−5`) übrig. Sechs Pixel.**

Zum Vergleich die Zone, in der das Haar sitzt: Zeilen `y−13` bis `y−16` (§3.4
erlaubt 4 über dem Scheitel) × Spalten `−3` bis `+3` = **28 Pixel**, von denen der
Schopf im Ruhemaß acht bis zwölf braucht. Das ist der ganze Punkt: **Das Haar
belegt die einzige freie Fläche, die das Sprite noch hat. Der Umhang will in die
vollste.**

Und die sechs freien Pixel sind nicht nur wenige, sie sind die falschen. Sie
liegen auf `y−5`, `y−4`, `y−3` — genau den drei Zeilen, auf denen vorn der
Rammerbalken, die Bauplanke und das untere Schrägbaggerblatt sitzen. Der Renderer
spiegelt das Sprite (`ctx.scale(-1, 1)`). Im Gewusel laufen die Figuren in beide
Richtungen. Eine Umhangmasse auf `−4`/`−5` bei einer nach rechts laufenden Figur
steht nach der Spiegelung dort, wo eine nach links laufende Figur ihr Werkzeug
trägt. Bei 12 Pixeln liest beides gleich: **Masse auf Bauchhöhe, seitlich.** Der
Umhang wäre damit ein falsches Berufssignal — an jeder Figur, in jedem Zustand,
dauerhaft.

Dazu kommt das Farbproblem, und es ist unabhängig davon lösungsfrei. §3.1
schließt den Farbkreis durch: Gelb bis Orange = Werkzeug und Haut, Grün = GDD
§12, Türkis = Anzug, Blau = Himmel und Fels, Violett = Kristall, Rot = Gefahr,
Magenta-Rosa = Haar. **Der Kreis ist voll.** Und über Helligkeit allein geht es
auch nicht: Der Umhang grenzt an Anzug (L\* 73,4) und Stiefel (L\* 53,6) und
müsste zu beiden ≥ 15 L\* haben — frei sind nur die Bänder über 88 (heller als
Haut, in §3.1 als Knochenweiß bereits durchgefallen) und unter 39 (dort
verschwindet er im Umriss). **Es gibt keine zulässige Farbe.**

### 2.2 Entscheidung

> **Nein. Kein Umhang, keine Kutte, keine Pelerine, keine Schürze im Spielsprite.**

Nach Form durchgerechnet, damit die Ablehnung überprüfbar ist:

| Form | Belegt | Urteil |
|---|---|---|
| **Vollkutte** | `y−8` … `y−1`, alle 5 Rumpf- und beide Stiefelzeilen | Nein. Löscht Gräber (Balken auf Fußhöhe) und Springer (Federn an den Stiefeln) vollständig und nimmt der Figur die Stiefelkante, die 2 von 12 Zeilen trägt. |
| **Schulterpelerine** | `y−8` … `y−5` | Nein. Sitzt auf der Blockerhand (`−5`/`−4` auf `y−7`/`y−6`) und auf dem Rammerbalken (`y−5`). Zerstört außerdem die 1-Pixel-Schulterschräge, eines der fünf Merkmale, die nach §2.8 den Weg auf 12 Pixel überleben. |
| **Schürze vorn** | `y−5` … `y−2` | Nein, die schlechteste Variante. Liegt unmittelbar auf Rammerbalken und Schrägbaggerdiagonale, also auf der gefährlichsten Verwechslung des ganzen Spiels (§20, letzter Absatz). |
| **Halstuch** | `y−8`, ein Pixel | **Die einzige Form, die passt** — und zwar deshalb, weil sie kein neues Element ist. §2.6 setzt an die Grenze Haut ↔ Anzug (ΔL\* nur 14,0) ohnehin schon einen 1 Pixel dunklen Kragenstrich. Man darf diesen Pixel im Master und in der Werbung (§16) zu einem farbigen Tuch ausformen; bei 12 Pixeln bleibt er der Kragenstrich, der er schon ist. Er schwingt nicht — ein Pixel kann nicht schwingen. |

### 2.3 Was ein echter Umhang verdrängen würde

Es gibt keine kostenlose Ergänzung. Die Rechnung, falls der Auftraggeber trotzdem
darauf besteht, in der Reihenfolge, in der bezahlt werden müsste:

1. **Das Haar geht.** Nicht nur wegen der Fläche. §2.6 hat die härteste
   Einzelregel des Katalogs: *„Das Haar berührt den Anzug nie"*, weil ΔL\* zwischen
   Beerenrosa und Türkis nur 6,7 beträgt. Ein Umhang hängt von der Schulter
   aufwärts bis zum Halsausschnitt, also genau dorthin, wohin das Haar in
   `climbing` (hängt nach hinten), `falling` (senkrecht) und `dying` 3–4 (stürzt
   mit) fällt. Türkiser Umhang plus rosa Haar bei ΔL\* 6,7 ergibt bei 12 Pixeln
   einen Fleck. Und eine fünfte Farbe gibt es nicht (§2.1 oben).
2. **Eine Berufsmarke geht.** Damit ein Umhang sichtbar schwingt, braucht er
   mindestens zwei Spalten Weg, also `−4` bis `−6`. Dort liegen die Blockerhände
   (`−5`/`−4`) und das linke Ende des Gräberbalkens (`−4`). §2.1 sagt zum Abstand
   der drei Balken: **„Diese Grenze ist ausgereizt."** Entweder verliert der
   Blocker seine Hand oder der Gräber sein linkes Blatt — beides ein Verstoß
   gegen GDD §6, weil der Beruf dann nicht mehr an der Silhouette hängt.
3. **Oder die Figur wächst.** 12 → 14 logische Pixel schaffen zwei Zeilen. Das ist
   `WUSEL_H` in `src/core/constants.ts` und berührt `sprites.ts`, `magnifier.ts`
   und die Physikzeilen (`grafik-integration.md` §2.1). Das ist eine
   Simulationsänderung und keine Grafikaufgabe.

### 2.4 Haar und Umhang zusammen — die Kernfrage

**Nein. Man muss sich für einen Blickfang entscheiden, und die Entscheidung ist
längst gefallen.**

Drei Gründe, vom stärksten zum schwächsten:

1. **Es gibt nur eine freie Zone.** 28 Pixel über dem Scheitel, 6 hinter dem
   Rumpf, und die 6 sind die Falschsignalzone aus §2.1 oben. Zwei bewegte Massen
   brauchen zwei freie Zonen. Es gibt eine.
2. **Zwei Nachläufe sind bei 12 Pixeln nicht lesbar.** Der ganze Wert des Haares
   liegt in §3.5: Es ist das einzige Element, das nachläuft (Regel 1), und es
   bricht die Regel an genau zwei Stellen — `saving` geht voraus, `dying`
   erstarrt zuerst. Das trägt, weil es das Einzige ist, das sich so verhält. Ein
   zweiter nachlaufender Körper macht beide zu Rauschen: Bei 12 Pixeln Höhe und
   20 px/s Laufgeschwindigkeit kann das Auge einen 1-Pixel-Versatz je Bild
   auflösen, aber nicht zwei gegenläufige.
3. **Das Haar ist gemessen, der Umhang nicht.** §3.1 ist ein Ausschlussverfahren
   mit sechs Kandidaten und fünf Bedingungen. Beerenrosa ist der einzige Ton, der
   alle fünf besteht. Diese Arbeit ist getan und sie ist richtig.

**Was der Auftraggeber eigentlich will — mehr sichtbares Schwingen — ist billiger
zu haben als über ein neues Kleidungsstück.** Der Schopf hat seitlich und nach
oben keinen Spielraum mehr (§3.4 deckelt ihn bei ±3 Spalten und 4 Zeilen über dem
Scheitel, darüber beginnt das Schirmdach). Der freie Hebel ist der Kontrast: Der
Abstand zwischen Haarglanz `#ffb3d9` (L\* 81,0) und Haarschatten `#c94a8a`
(L\* 50,9) beträgt **30,2 L\* — der größte Einzelkontrast der ganzen Figur**,
größer als jede Silhouettenänderung, die man sich leisten könnte. Lässt man den
hellen Pixel je Bild um 1 Pixel den Schopf entlangwandern, flackert an Kopfhöhe
ein 30-L\*-Signal in der einzigen Zone ohne konkurrierende Marken. Das kostet
keinen Palettenplatz, keine Sperrzone und keinen einzigen Prompt außerhalb von
§3.5.

### 2.5 Folgen für den Katalog

**Noch nichts geändert.** Zwei Listen.

**Wenn die Entscheidung wie empfohlen NEIN lautet — drei kleine Korrekturen:**

- **§19.4** begründet das Kuttenverbot heute rechtlich („Rechtsprüfung … keine
  Kutte, keine Kapuze"). Das ist zu weit gegriffen und der Auftraggeber hat
  recht: Ein Umhang für sich ist rechtlich unauffällig. Die Zeile gehört
  gespalten — der Rechtspunkt behält die *Kombination* (grünes Haar plus blaue
  Kutte plus Ähnlichkeit zu einer geschützten Figur), das Kuttenverbot selbst
  wandert als Gestaltungsregel nach §2 mit der Pixelrechnung aus §2.1 oben als
  Begründung.
- **§5.5 Negativprompt** listet `cloak, cape, cowl, hooded tunic` heute im
  Rechtsabsatz. Bleibt wörtlich stehen, wandert nur in den Gestaltungsabsatz.
- **§3.5** bekommt die Glanzwanderung als 13. Zeile (der Ersatz für den Umhang).
- **§2.1** bekommt die Tabelle „was auf welcher Zeile sitzt" aus §2.1 oben als
  Beleg für den Satz „Diese Grenze ist ausgereizt".

**Wenn die Entscheidung entgegen der Empfehlung JA lautet — der Umfang:**

Abschnitte: §2.1 (Proportionstabelle), §2.5 („Kein Innenumriss" fällt), §2.6
(L\*-Tabelle, Nachbarschaftstabelle, die Regel „Haar berührt den Anzug nie"),
§2.8 (Bilanz), §3.3, §3.4 (fünfte Sperrzone), §3.5 (alle zwölf Clipzeilen
bekommen eine zweite Spalte), §5.1, §5.3 (Absatz „Hair"), §5.4 (neuer Hex-Wert),
§5.5, §9 Merkmalstabelle, §19 (Punkte 4, 13, 15 und zwei neue), §20 (Rang 0
beginnt von vorn).

Betroffene Prompts: **40 von 85.**

| Block | Prompts | |
|---|---|---|
| §6.1–6.5 Ankerbilder | 5 | A0 und A1 zuerst, alles Weitere hängt daran |
| §7.1–7.12 Zustandsblätter | 12 | |
| §8.3 Bombe | 1 | Andockpunkt `belly` auf `y−4` läge unter dem Umhang |
| §9.1–9.10 Berufsblätter | 10 | plus beide Zellen je Blatt, auch die Silhouettenzelle |
| §10.1–10.5 Todesarten | 5 | |
| §16.1–16.5 App-Symbol, Ladebild, Keyart | 5 | |
| §17.1, §17.3 Tripo | 2 | |

Nicht betroffen: die 45 Prompts für Terrain, Welten, Fallen, Effekte,
Oberfläche und Kacheln. Von den vier Blöcken in §5 werden drei geändert, und die
werden fast allen 85 vorangestellt.

---

## Was als Nächstes zu tun ist

1. **A0 erzeugen und abnehmen** (§6.1). Rang 0. Ohne bestandenes A0 kein zweiter
   Tripo-Lauf — dieser hier ist genau daran gescheitert.
2. **A1 erzeugen** (§6.2), dann Bild-zu-3D mit dem Prompt aus §1.6.
3. **Modell V3 gegen die Tabelle in §1.2 messen**, bevor irgendetwas in Blender
   angefasst wird. Die drei Zahlen, die zuerst zu prüfen sind: Kopfhöhen
   (Soll 2,5), Kopf breiter als hoch (Soll: nein), Haarschopf vorhanden
   (Soll: ja).
4. **Umhang: abgelehnt.** Der Blickfang bleibt das Haar. Wer mehr Bewegung will,
   bekommt sie über die wandernde Glanzstufe (§2.4 oben), nicht über Stoff.
