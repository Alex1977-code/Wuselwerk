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
| `walking` | 8 | auf allen vieren, 80° Profil | unterwegs |
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

`boden` und `mitte` braucht jede Pose, die den Körper aus der Senkrechten nimmt:
Die Eichung setzt die Sohle nur einmal, in der aufrechten Ruhelage.

`lehne: 0` braucht der vierfüßige Gang — sein Rumpf liegt schon waagerecht, eine
zweite Neigung obendrauf wäre doppelt.

## Was gemessen wird und warum

Jede Zeile meldet beim Backen ihr Maß:

- **Breite** in logischen Pixeln. Die Simulation stößt mit *einer* Spalte an; was
  seitlich darüber hinaussteht, kann in einer Wand stecken, ohne dass sie davon
  weiß. Auf allen vieren sind es 12,7 statt 11,6 aufrecht.
- **Höhe.** Auf allen vieren 10,3 statt 12,3 — die Figur füllt ihren
  Kollisionskasten nicht mehr ganz aus. Das ist die bewusst hingenommene
  Ungenauigkeit: Sie ist *konservativ*, die Figur meidet Decken, unter die sie
  passen würde, statt durch welche zu rutschen.
- **Standfläche.** Die Breite des Umrisses im untersten Streifen. Daran hängt der
  Kontaktschatten: Der Rammer steht auf 4,3 logischen Pixeln, der Gräber auf 8,4,
  der Läufer auf allen vieren auf 9,7. Ein Schatten, der das nicht weiß, ist beim
  einen ein Nebel und beim anderen ein Fleck neben den Pfoten.
- **Sohle über Grund.** Wie weit die Figur schwebt oder einsinkt.
