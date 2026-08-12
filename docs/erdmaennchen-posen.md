# Die zwölf Posen des Erdmännchens

Was die Figur kann, was jede Pose sagt, und die beiden Fallen im Rig, die
monatelang still danebengelegen haben.

Gebacken mit `node scripts/bake-erdmaennchen.mjs`; die Posen stehen als
Richtungstabellen in `art-src/erdmaennchen/posen/*.json`, eine Datei je Pose.

## Die Leseregel

**Auf allen vieren heißt unterwegs, aufrecht heißt beschäftigt.**

Nur das Gehen läuft auf vier Beinen. Alles andere — arbeiten, fallen, klettern,
warten, sterben — steht aufrecht. Der Wechsel springt, und das ist beabsichtigt:
Er ist genau der Moment, in dem die Figur zu tun anfängt, was der Spieler ihr
aufgetragen hat.

| Pose | Bilder | Haltung | Was sie sagt |
|---|---|---|---|
| `walking` | 8 | auf allen vieren, Sprunggalopp, 72° | unterwegs |
| `falling` | 4 | aufrecht, Arme aus | fällt — bleibt senkrecht, damit die Fallhöhe lesbar bleibt |
| `floating` | 4 | aufrecht, Arme weit | hängt am Schirm |
| `climbing` | 4 | aufrecht, Arme hoch | an der Wand |
| `hoisting` | 6 | großer Aufschwung | über die Kante |
| `building` | 8 | vorgebeugt, Planke | legt die Stufe |
| `bashing` | 3 | aufrecht, Pfoten waagerecht vor | treibt geradeaus |
| `mining` | 4 | halb gebeugt, Pfoten 45° vor unten | schürft schräg |
| `digging` | 3 | tief gehockt, Nase unten | gräbt senkrecht |
| `blocking` | 2 | aufrecht, frontal | bis hierher und nicht weiter |
| `saving` | 6 | aufrecht, Arme hoch | gerettet |
| `dying` | 8 | frontal | verloren |
| `spaehen` | 6 | kerzengerade, Pfoten vor der Brust | kommt nicht weiter — **kein** Simulationszustand |

## Der Gang ist ein Sprunggalopp, kein Trab

Der erste Anlauf lief im **Trab**: diagonale Paare, gleichmäßig. Das ist die
Gangart von Hund und Pferd, und die Rückmeldung war zu Recht „so läuft kein
Erdmännchen". Eine kleine Schleichkatzenverwandtschaft **bündelt**: Vorderbeine
zusammen, Hinterbeine zusammen, eine halbe Phase versetzt, dazwischen federt der
Rücken — und einmal je Zyklus hebt der Körper ab, nicht zweimal.

Die beiden Beine eines Paares laufen sieben Hundertstel Zyklus versetzt. Ganz
gleich wäre ein Kaninchen, und bei zwölf Pixeln wäre die Silhouette dann in der
Hälfte aller Bilder ein Klotz aus zwei übereinanderliegenden Beinen.

Der **Schwanz liegt tief** und lang nach hinten (Spitze 24°). Aufgerollt war er
ein Sparmodell gegen die Zellbreite und sah aus wie ein Eichhörnchen; bei 54°
Spitze las er sich als Rattenschwanz. Hoch trägt ein Erdmännchen ihn im Stehen,
nicht im Lauf.

### Hals, Kopf und Blickwinkel hängen zusammen

Drei Zahlen, die einzeln keinen Sinn haben. Nach der Telefonprobe steckte der
Kopf zwischen den Schultern; mein erster Griff — Hals steiler **und** Kopfwinkel
höher — hat es verschlimmert, das Gesicht kippte unter den Körper und war ganz
weg. Erst ein Durchlauf über beide gemeinsam hat das Fenster gefunden:

| | | |
|---|---|---|
| Hals 30° / Kopf 150 | Kopf bleibt zwischen den Schultern | — |
| **Hals 50° / Kopf 154** | Kopf über der Schulterlinie, Maske und Schnauze sichtbar | **so** |
| Hals 70° / Kopf 170 | Kopf dreht weg | — |
| Hals 85° / Kopf 182–206 | kein Gesicht mehr | — |

Der **Blickwinkel** ist ein Kompromiss und war zuerst falsch begründet. Achtzig
Grad standen dort, weil ein Vierfüßler „nur im Profil liest". Für den *Körper*
stimmt das. Für das *Gesicht* ist es das Gegenteil — im reinen Profil ist die
Augenmaske ein Strich. Durchprobiert wurden 56, 64, 72 und 80; bei **72** bleibt
der Körper lang und die Maske sichtbar.

### Der Hals ist gestreckt, weil es keinen gibt

Der Hals dieses Modells misst **0,068 Modelleinheiten** — keinen ganzen logischen
Pixel. Aufrecht fällt das nicht auf. Waagerecht sitzt der Kopf damit unmittelbar
auf den Schultern, und die Rückmeldung dazu war eindeutig: *„Arme sind an Kopf
oder Hals beim Laufen."* Sie waren es auch.

`NeckTwist01` wird deshalb im Gehen auf das **3,2fache** skaliert und die beiden
Schlüsselbeine nach hinten geschwenkt. Der Maßstab eines Knochens vererbt sich an
seine Kinder, also wird der Kopf gegengerechnet — sonst wächst er mit. Der Hals
misst danach gut zwei logische Pixel, und der Kopf steht vor den Vorderbeinen
statt auf ihnen.

Nur im Gehen. Die aufrechten Posen behalten ihren Hals; eine gestreckte Figur
wäre dort eine Giraffe. Genau das ist beim ersten Versuch passiert, weil
`stelle()` Maßstäbe setzte, aber nie zurücksetzte — der gestreckte Hals blieb
stehen und lief in **alle elf folgenden Posen**. Zurückgesetzt wird jetzt, was
gesetzt werden kann.

Bei zwölf logischen Pixeln bleibt der Kopf klein, und was ihn lesbar macht, ist
zusätzlich die zur Laufzeit gezeichnete **Augenmaske**.

## Die dreizehnte Zeile: Spähen

Die einzige Pose, die **keinem** Simulationszustand entspricht. Die Simulation
kennt sie nicht; der Zeichner setzt sie ein, wenn eine laufende Figur seit einer
guten halben Sekunde nicht über drei Pixel hinauskommt — im Schacht, hinter einem
Blocker, in einer Sackgasse.

Sie sagt damit etwas Wahres, das man sonst nicht sieht (*dieser hier kommt nicht
weiter*), sie ersetzt das Zappeln, das die Simulation an solchen Stellen erzeugt,
und sie **passt**: Aufrecht ist die Figur 5,7 logische Pixel breit, auf allen
vieren 15,0. In einen drei Pixel breiten Grabschacht passt nur die eine von
beiden.

Das Kriterium ist nicht „gar nicht von der Stelle". Das war die erste Fassung und
sie greift im Schacht nicht: Der ist drei Pixel breit, die Figur pendelt darin,
und der Zähler fällt bei jedem Schritt zurück. Sie bewegt sich — sie kommt nur
nicht **weg**.

`DEFAULT_MANIFEST` kennt die Zeile nicht. Ein Blatt ohne sie — das Murmelblatt,
die prozedurale Rückfallebene — funktioniert unverändert weiter; der Zeichner
fragt vorher, ob es sie gibt.

## Drei Quellen von Flimmern, alle behoben

**1. Die Blickrichtung kippte zwanzig Mal je Sekunde.** In einem Schacht, dessen
Wände höher sind als `MAX_STEP`, läuft eine Figur gegen die eine Wand, dreht um,
läuft gegen die andere und dreht wieder — und `stepWalking` kommt alle drei Ticks
dran. Die Simulation ist im Recht: Eine eingesperrte Figur läuft auf und ab.
Gezeichnet sprang dabei ein dreizehn Pixel breiter waagerechter Körper von links
nach rechts, und in einer Grube voller Figuren flimmerte das halbe Bild.

`src/render/ansicht.ts` zeichnet deshalb die Richtung, in die sich die Figur
**zuletzt wirklich bewegt hat**. Wer läuft, ändert seine Stelle — dann folgt das
Bild sofort. Wer nur auf der Stelle umdreht, ändert nichts, und dann bleibt auch
das Bild stehen. Das ist reiner Ansichtszustand; die Simulation weiß nichts davon
und bleibt deterministisch.

**1b. Die Pose kippte fünfzehn Mal je Sekunde.** Ein Gräber räumt alle sieben
Ticks eine Zeile. Wer darüber steht, verliert den Boden, fällt **einen** Pixel,
landet, läuft, verliert den Boden. `walking` und `falling` wechseln sich damit
dauernd ab — und seit die eine Pose waagerecht auf vier Beinen und die andere
aufrecht ist, ist das kein Übergang mehr, sondern ein Zucken.

Ein Fall unter **drei Pixeln** ist deshalb kein Fall, sondern ein Absacken: Die
vorige Pose bleibt stehen. Dazu läuft für eine ersetzte Pose ein **eigener
Takt** — `setState` setzt `w.timer` bei jedem Zustandswechsel auf null, und ohne
den eigenen Takt bliebe die Laufbewegung im Schacht auf Bild eins stehen.
Solange der Zeichner die Pose der Simulation zeigt, bleibt es bei `w.timer`;
daran hängt die Zusage, dass Bild eins das Wirkungsbild ist.

**2. Die Figur rastete auf ganze Bildpunkte ein, das Gelände nicht.** Für ein
Pixelblatt ist das Runden richtig. Für ein gemaltes ist es ein sichtbarer Fehler:
Das Gelände gleitet beim Scrollen weich, die Figur sprang daneben in ganzen
Schritten — kein Springen, ein Zittern auf dem Boden. Gerundet wird jetzt nur
noch, wenn das Blatt tatsächlich ein Pixelraster ist (`ppl <= 1`).

**3. Der Bildindex sprang zwischen zwei Uhren.** Der hartnäckigste, weil er erst
nach den beiden anderen sichtbar wurde. Die erste Fassung entschied **je Bild**,
welche Uhr gilt: zeigt der Zeichner gerade die Pose der Simulation, dann
`w.timer`, sonst den eigenen Zähler. Im Schacht wechselt die Simulation ständig
zwischen Laufen und Fallen — und damit wechselte auch die Uhr, Bild für Bild,
zwischen zwei völlig verschiedenen Zahlen:

```
Figur 3 (läuft):  takt = 176  1  3  5  180  1  182  0  2  4  186 …
```

Der Bildindex landete dadurch jedes Bild an einer anderen Stelle des Gangzyklus.
Entschieden wird jetzt **je Posenlauf**: Wer einmal auf den eigenen Takt
gewechselt ist, bleibt darauf, bis die Pose wechselt. Gemessen im laufenden
Spiel fiel die Zahl der Rücksprünge des Bildindex von **53 auf 5** bei 350
Bildern — und die verbliebenen sind je ein einmaliger Uhrenwechsel.

Dazu ein Riegel gegen doppeltes Fortschreiben: Die **Lupe** zeichnet die Szene
ein zweites Mal, und ohne Bildstempel liefe jeder Zähler doppelt so schnell,
sobald jemand zielt.

## Die drei Grabberufe arbeiten mit den Pfoten

Keil und Spaten sind weg. Sie füllten eine Lücke, die es nicht mehr gibt, und
das ist gemessen: Die Überdeckung der Silhouetten der drei Berufe lag bei den
alten Posen bei **69,2 %** — fast dasselbe Bild, das Gerät trug den Unterschied
allein. Die neuen stehen bei 14°, 40° und 60° Rumpfneigung und kommen nackt auf
**53,7 %**.

Geblieben sind **Krallen** (kein Gegenstand, sondern das, womit ein Erdmännchen
gräbt) und die **Planke** beim Brückenbauer — die ist kein Werkzeug, sondern
das Material, aus dem gleich die Stufe wird.

Die Krallen holen von den 15,5 Punkten **nichts** zurück (54,3 statt 53,7 %);
dafür sind sie zu klein. Sie bleiben als dunkler Akzent auf einer sandbraunen
Figur, nicht als Ersatz für das Gerät.

## Zwei Fallen im Rig

Beide waren vollkommen still: kein Absturz, keine Meldung. Die Pose sah nur
nicht aus wie ihre Tabelle — und man stellt dann an den Zahlen nach, die richtig
waren.

**1. Die Achse zeigte auf einen Verdrehknochen.** `stelle()` nahm als Drehachse
eines Knochens die Stelle seines *ersten* Kindes. Dieses Rig hängt an mehrere
Gelenke einen Verdrehknochen, der an derselben Stelle sitzt — Abstand 0,0001,
normalisiert der Nullvektor. Betroffen: nahseitiger Oberarm, nahseitiger
Oberschenkel und **beide Unterarme**. Sie haben ihre Zielrichtung in allen zwölf
Posen verworfen. Das Kind wird jetzt nach *Abstand* gewählt, und wer trotzdem
keine brauchbare Achse hat, wird beim Backen genannt.

**2. Die Eigendrehung ging verloren.** `setFromUnitVectors(achse, ziel)` ersetzt
die Drehung des Knochens durch die kürzeste, die seine Achse aufs Ziel legt. Die
Achse stimmt danach — alles, was quer daran hängt, nicht. An `Spine02` sitzen die
beiden Schlüsselbeine seitlich ab, und die Ersatzdrehung verkippte sie
gegeneinander: Die **linke Schulter stand 0,144 Einheiten höher als die rechte**,
in jeder Pose, und die linke Vorderpfote erreichte den Boden nie. Jetzt wird von
der *Ruherichtung* des Kindes aufs Ziel gedreht und die Drehung auf die Ruhelage
gesetzt.

## Was eine Posendatei über ihren Platz sagen darf

| Feld | Wirkung |
|---|---|
| `dreh` | Blickwinkel in Grad; sonst gilt `DREHUNG_GRAD` im Backskript |
| `boden` | setzt die Sohle des **tiefsten** Bildes auf die Standlinie |
| `mitte` | legt den Umriss aller Bilder in die Zellmitte |
| `lehne` | zusätzliche Neigung im Zeichner; `0` schaltet `LEHNE` ab |
| `knochenSkala` | je Einzelbild: einzelne Knochen strecken (Hals im Gehen) |

`boden` und `mitte` braucht jede Pose, die den Körper aus der Senkrechten nimmt:
Die Eichung setzt die Sohle nur einmal, in der aufrechten Ruhelage.

`lehne: 0` braucht der vierfüßige Gang — sein Rumpf liegt schon waagerecht, eine
zweite Neigung obendrauf wäre doppelt.

## Was gemessen wird und warum

Jede Zeile meldet beim Backen ihr Maß:

- **Breite** in logischen Pixeln. Die Simulation stößt mit *einer* Spalte an; was
  seitlich darüber hinaussteht, kann in einer Wand stecken, ohne dass sie davon
  weiß. Auf allen vieren sind es 15,0 gegen eine Zellbreite von 17,0 — der
  Schrittausschlag der Beine ist an dieser Grenze bemessen und nicht an der
  Anatomie.
- **Höhe.** Auf allen vieren 8,6 statt 12,1 — die Figur füllt ihren
  Kollisionskasten nicht mehr ganz aus. Das ist die bewusst hingenommene
  Ungenauigkeit: Sie ist *konservativ*, die Figur meidet Decken, unter die sie
  passen würde, statt durch welche zu rutschen.
- **Standfläche.** Die Breite des Umrisses im untersten Streifen. Daran hängt der
  Kontaktschatten: Der Rammer steht auf 4,3 logischen Pixeln, der Gräber auf 8,4,
  der Läufer auf allen vieren auf 9,0. Ein Schatten, der das nicht weiß, ist beim
  einen ein Nebel und beim anderen ein Fleck neben den Pfoten.
- **Sohle über Grund.** Wie weit die Figur schwebt oder einsinkt.
