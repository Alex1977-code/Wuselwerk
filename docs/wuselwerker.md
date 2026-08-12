# Der Wuselwerker

Die dritte Figur, und die erste, die als **Chibi** kommt: ein Humanoid, bei dem
Kopf und Haar fuenfundfuenfzig Prozent der Hoehe ausmachen. Dieses Dokument haelt
fest, was daran anders ist als bei Murmel und Erdmaennchen — und was daraus
folgte.

Bauen: `node scripts/bake-figur.mjs wuselwerker`. Einstellungen in
`art-src/wuselwerker/figur.json`, Posen in `art-src/wuselwerker/posen/*.json`.

## Was gemessen wurde, bevor irgendetwas gebaut wurde

Am Rig: 41 Knochen, Tripo-Benennung, **keine Schwanzknochen** — und dieselben
fuenf entarteten Drehachsen wie beim Erdmaennchen, die der Backvorgang seit dem
letzten Durchgang selbst abfaengt. Die Proportionen:

| | Modelleinheiten | Anteil |
|---|---|---|
| Gesamthoehe | 0,998 | 100 % |
| Kopf und Haar | 0,550 | **55 %** |
| Arm | 0,225 | 23 % |
| Schluesselbein | 0,198 | 20 % |
| Bein | 0,111 | **11 %** |
| Huefte ueber der Sohle | 0,120 | 12 % |

Die beiden fetten Zahlen sind die ganze Geschichte. **Die Beine tragen nichts
bei.** Ein Beinausschlag von dreissig Grad bewegt bei 0,111 Einheiten einen
halben logischen Pixel; das ist unter der Aufloesung, in der das Spiel die Figur
zeigt. Der Gang haengt deshalb am Armschwung und am Hub, nicht am Schritt.

## Die Rechnung, die die Richtung vorgab

Als Mass fuer „sehen die Posen verschieden aus" dient die Ueberdeckung der
Silhouetten: `.ueberdeckung.py` legt je zwei Posen uebereinander und misst
Schnitt durch Vereinigung. Je hoeher, desto aehnlicher.

| | Schnitt ueber alle 78 Posenpaare |
|---|---|
| Erdmaennchen, blosses Blatt | **39,9 %** |
| Wuselwerker, blosses Blatt | **74,6 %** |

Fast doppelt so aehnlich. Der erste Verdacht war die Kopflastigkeit — er war
falsch: Beide Figuren haben 54 Prozent ihrer Flaeche in der oberen Haelfte und
beide ihre breiteste Zeile bei 38 Prozent der Hoehe. Der Unterschied liegt
woanders, und er ist nicht zu beheben:

> Das Erdmaennchen laeuft **auf allen vieren** und arbeitet aufrecht. Diese eine
> Pose ist waagerecht, fuenfzehn Pixel breit und acht hoch, waehrend alle anderen
> aufrecht und sechs Pixel breit sind. Das allein druckt den Schnitt um
> zwanzig Punkte. Ein Humanoid hat diesen Kontrast nicht und kann ihn nicht
> bekommen.

Daraus folgte die Arbeitsteilung fuer diese Figur: **Die Unterscheidbarkeit
kommt nicht aus den Posen, sie kommt aus den gezeichneten Schichten.** Das ist
dieselbe Antwort, die das Vorbild von 1991 gegeben hat — dort sahen alle Figuren
gleich aus und wurden am Geraet erkannt.

Gemessen am fertigen Bild, in Spielgroesse und mit allem, was der Zeichner
dazutut:

| | Schnitt |
|---|---|
| blosses Blatt | 74,3 % |
| mit Geraet und Stirnband | **60,0 %** |

Vierzehn Punkte, und sie liegen genau dort, wo sie gebraucht werden: Die drei
grabenden Berufe stehen bei 70 bis 76 Prozent statt bei 74 bis 82.

## Die Geraete

Alles in `src/render/werkzeug.ts`, alles gezeichnet und nicht gebacken — das
Modell enthaelt kein Werkzeug.

| Pose | Geraet | Achse |
|---|---|---|
| `bashing` | Keil | waagerecht |
| `mining` | Spaten | 45 Grad |
| `digging` | Spaten | senkrecht nach unten |
| `building` | Planke | −22 Grad, steigend |
| `floating` | **Schirm** | ueber der Figur |

Der Schirm ist neu und war die einzige echte Luecke: Der Schirmspringer hatte
als einziger Beruf keinen Gegenstand, und seine Pose — beide Arme senkrecht
hoch — ist ohne ihn die Pose eines Fallenden mit erhobenen Armen. Gemessen
ueberdeckten sich `falling` und `floating` zu 81 Prozent.

Er haengt als einziges Geraet **nicht an der Hand**, und das ist gemessen
begruendet: Beim Schweben greifen beide Figuren mit beiden Haenden nach oben,
und welche davon das Rig als „vorn" meldet, entscheidet der Drehwinkel der
Pose — beim Wuselwerker liegt sie bei x +3,15, beim Erdmaennchen bei x −4,65.
Ein Schirm dort stuende einmal rechts und einmal links neben der Figur. Sein
Ansatz ist die Mittellinie ueber dem Kopf, und die braucht keine Messung.

### Der Koerper unter dem Geraet

`KOERPER.wuselwerker` steht auf `handab: 0` und `luft: 0,06`. Das ist gemessen:
In allen sechs Posen, in denen eine Hand etwas fuehrt, liegt der gemeldete
Handpunkt zwischen 0,54 und 0,82 logischen Pixeln **innerhalb** der Silhouette,
und zwar ueberall gleich viel. Das ist keine danebenliegende Schaetzung, das ist
die Dicke des Aermels. Dieselbe Lehre wie beim Erdmaennchen: Wer echte
Handknochen hat, darf sich die Berichtigung fuer geschaetzte nicht aufhalsen.

## Das Stirnband

Die Signalschicht, `src/render/band.ts`. Murmel: Schopf ueber dem Kopf.
Erdmaennchen: Augenmaske im Gesicht. Wuselwerker: Band im Haar.

Warum weder das eine noch das andere: Fuer einen **Schopf** ist kein Platz, dort
sitzt schon die Haarmasse. Eine **Maske** kostet zu viel — diese Figur hat ein
Gesicht mit Augen und Mund, und dafuer liegen ihre Backwinkel eigens flacher als
die des Tieres. Ein Farbband quer darueber nimmt genau das weg, wofuer die
flachen Winkel bezahlt wurden.

Das Haar dagegen ist an der Ansatzlinie **acht logische Pixel breit** — die
Augenmaske des Erdmaennchens misst gut drei. Es ist das groesste Farbfeld, das
an dieser Figur unterzubringen ist.

### Drei Fehler auf dem Weg dorthin

**Erstens: das Band lag im Bild senkrecht ueber dem Gesicht.** Bei aufrechten
Posen sass es damit richtig, bei jeder Pose mit gesenktem Kopf quer in den
Augen. Der Backvorgang schreibt seitdem einen zweiten Kopfpunkt mit — die
**Stirn** —, und Gesicht plus Stirn ergeben die Hochachse des Kopfes im Bild.
Auf dem Blatt war davon nichts zu sehen: Das Blatt war richtig, nur das Band lag
daneben.

**Zweitens: die Hoehe war geraten.** `.bandsitz.py` tastet die Mittellinie des
Bandes gegen das Blatt ab und zaehlt, worauf sie faellt:

| Hoehe (in Kopfachsen) | Haar | Haut |
|---|---|---|
| 0,85 | 63 % | 27 % |
| 1,05 | 75 % | 15 % |
| 1,25 | 91 % | 3 % |
| **1,50** | **98 %** | **0 %** |

Bemerkenswert ist, welche Posen den Ausschlag gaben: nicht die stark gedrehten
Arbeitshaltungen, die im Bild am schiefsten aussahen — die lagen schon bei 0,85
zu hundert Prozent im Haar —, sondern die **frontalen**. Blocker, Spaeher und
Sterbender halten den Kopf aufrecht, und dort sass das Band mit 51 bis 58
Prozent Hautanteil quer ueber den Augen. Beim blossen Hinsehen waren mir die
schiefen aufgefallen.

**Drittens: es war ein Hakenzeichen.** Band und Zipfel waren als gefuellte
Flaechen aus Bezierkurven gebaut und liefen an beiden Enden spitz zu. Zwei
Spitzen an einem Bogen liest das Auge bei zwoelf Pixeln als Pfeil. Ein Strich
mit runden Enden und fester Dicke kann das nicht — er ist ueberall gleich breit,
und genau das macht ein Band aus.

### Der Fehler, den keine Messung gesehen hat

Das Band trug zuerst auch **ohne Auftrag** eine Farbe: ein dunkles Leder,
gedacht als Kleidungsstueck, das immer da ist. Aus dem Spiel kam zurueck:

> „irgendetwas ist am haar was dort nicht hingehoert"

Und so war es. Ein dunkelbrauner Bogen auf kraeftig blauem Haar liest sich bei
sechsundzwanzig Bildschirmpixeln Figurenhoehe nicht als Band, sondern als Zweig
im Haar. Dazu ragte das lose Ende aus der Silhouette — auch das war Absicht
gewesen („bricht den Umriss") und auch das war falsch.

Bemerkenswert ist, dass **jede Messung zufrieden war**. Das Band sass zu 98
Prozent im Haar; die Zahl stimmte. Geprueft hatte ich, ob es **sitzt**, nie, ob
es dort **hingehoert**. Und der Zipfel war ueberhaupt nicht vermessen — das
Abtastskript kannte nur den Bogen. Nachgetragen ergab es:

| Zipfellaenge (in Kopfachsen) | neben der Figur |
|---|---|
| 1,4 | 7 % |
| 1,0 | 1 % |
| **0,8** | **0 %** |

Zwei Aenderungen daraus: Das Band bleibt vollstaendig im Haar, und ohne Auftrag
gibt es **gar keines**. Das ist die Regel, die die beiden anderen Figuren schon
hatten — das Halstuch des Erdmaennchens erscheint nur bei einem Auftrag, der
Schopf der Murmel liegt sonst dicht am Koerperton. Es kostet nichts: Der
Wuselwerker ist an blauem Haar und gruener Tunika ohnehin zu erkennen, waehrend
das Erdmaennchen sandbraun auf sandbraun war und seine Augenmaske als
Kennzeichen brauchte.

Die Zuendschnur faellt nicht darunter. `schopfAuftrag` liefert bei `fuse > 0`
immer `bomber`, vor jeder anderen Regel — wer gleich hochgeht, traegt ein Band,
auch wenn er sonst nur laeuft.

### Warum alle Masse in Kopfachsen stehen

Weil die Figur nicht immer gleich gross ist. `saving` schrumpft sie beim
Entschweben auf die Haelfte, `dying` staucht sie. Ein Band in festen logischen
Pixeln blieb dabei stehen und stand zuletzt groesser da als der Kopf, den es
umspannen soll. Die gemessene Kopfachse misst in elf der dreizehn Posen 1,8 bis
1,9 Pixel und in diesen beiden weniger — in Achsen gerechnet schrumpft das Band
von selbst mit.

## Was die Zahlen der Zeilen sagen

Nach dem letzten Backen, alle dreizehn Zeilen ohne Anschnitt:

```
walking  (8) 46gr  breit  9,7px  hoch 12,8px  Stand 8,4px
falling  (4) 34gr  breit 10,3px  hoch 12,7px  Stand 6,5px
floating (4) 26gr  breit  9,8px  hoch 12,8px  Stand 6,5px
climbing (4) 40gr  breit 10,0px  hoch 12,5px  Stand 6,5px
hoisting (6) 48gr  breit 10,6px  hoch 12,8px  Stand 6,6px
building (8) 50gr  breit  9,8px  hoch 12,3px  Stand 8,1px
bashing  (3) 52gr  breit 10,2px  hoch 12,5px  Stand 6,0px
mining   (4) 54gr  breit  9,7px  hoch 12,2px  Stand 8,2px
digging  (3) 44gr  breit  9,7px  hoch 11,6px  Stand 7,7px
blocking (2)  8gr  breit 10,5px  hoch 12,7px  Stand 10,2px
saving   (6) 10gr  breit  9,9px  hoch 12,7px  Stand 6,7px
dying    (8)  0gr  breit 10,9px  hoch 12,8px  Stand 8,3px
spaehen  (6) 14gr  breit 10,4px  hoch 12,9px  Stand 8,3px
```

Die Breiten liegen alle unter elf Pixeln bei einer Zelle von siebzehn — deutlich
schmaler als das Erdmaennchen auf allen vieren mit fuenfzehn. Die Simulation
stoesst mit **einer** Spalte an; was seitlich darueber hinaussteht, kann in einer
Wand stecken, ohne dass sie davon weiss. Hier steht nichts weit hinaus.

Die Blickwinkel liegen durchweg flacher als beim Tier (46 statt 72 Grad beim
Laufen). Das ist der Preis fuer das Gesicht — und der Grund, warum die
Signalschicht ins Haar musste und nicht ins Gesicht.

## Der erste Fehlversuch, der beim Backen auffiel

Neunzehn Einzelbilder bluteten aus der Zelle, alle in den Posen ohne
Bodenkontakt: `falling`, `floating`, `saving`. Ihre Sohlen hingen bis zu einem
Pixel unter dem Zellboden, weil ihnen `boden: true` fehlte — die Marke, mit der
eine Pose sagt, dass der Backvorgang sie auf den Grund setzen soll. Bei einer
Figur, die faellt, klingt das falsch und ist es nicht: Gesetzt wird die Zelle,
nicht die Welt. Alle dreizehn tragen die Marke jetzt.

## Wo was liegt

| | |
|---|---|
| `art-src/wuselwerker/figur.json` | Modell, Kopfmassstab, Seitenversatz, Blickwinkel je Pose |
| `art-src/wuselwerker/posen/*.json` | dreizehn Posentabellen |
| `.ww.mjs` | erzeugt die dreizehn Tabellen aus Winkeln |
| `probe/figur.html` | zeichnet alle Posen mit dem **echten** Zeichner, drei Groessen |
| `.ueberdeckung.py` | Ueberdeckung der Silhouetten, bloss gegen gezeichnet |
| `.bandsitz.py` | wo die Mittellinie des Bandes landet: Haar, Haut, daneben |
| `.koepfe.py` | Kopfausschnitte aus der Spielprobe |
| `.spielprobe.mjs` | Bildschirmabzug aus dem **echten Spiel**, Handygroesse, mit Beruf |
| `src/render/band.ts` | das Stirnband |
| `src/render/werkzeug.ts` | Keil, Spaten, Planke, Krallen, Schirm |
