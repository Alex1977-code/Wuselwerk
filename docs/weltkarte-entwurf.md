# Weltkarte — Entwurf

Stand: Welt 1 gebaut (zehn Level), Welten 2 bis 5 entworfen.
Code dazu: `src/levels/welten.ts` (Katalog), `src/progression.ts` (Regeln),
`tests/progression.test.ts` (Nachweis).

---

## 1. Wie viele Welten, welche Themen, wie viele Level

Fünf Welten, zusammen 64 Level.

| # | Welt | Thema | Level | Etappen | Palette | Musik | Belohnung am Weltende |
|---|------|-------|------:|---------|---------|-------|-----------------------|
| 1 | **Grasland** | Weiche Erde, flacher Himmel. Hier lernt man die acht Berufe. | 10 | 3 / 4 / 3 | `grass` ✅ | ✅ | **Ein Gräber mehr**, dauerhaft |
| 2 | **Kristallklamm** | Enge Schächte unter Tage, Stahl in Adern, Licht aus der Wand. | 12 | 4 / 4 / 4 | `crystal` ✅ | ✅ | **Die längere Uhr** (+25 % Zeit) |
| 3 | **Rostwerk** | Halde aus Stahl und Schrott. Wenig grabbar, alles im Weg. | 13 | 4 / 5 / 4 | `rust` ❌ | ❌ | **Ein Schirm mehr**, dauerhaft |
| 4 | **Frostklamm** | Hoch und schmal. Der Weg führt nach unten, unten wartet der Aufprall. | 14 | 5 / 5 / 4 | `frost` ❌ | ❌ | **Meisterschlüssel** (Par immer sichtbar) |
| 5 | **Schlot** | Senkrecht in den Berg. Hitze von unten, Uhr von oben. | 15 | 5 / 5 / 5 | `magma` ❌ | ❌ | **Goldenes Band** (Schmuck) |

### Warum fünf Welten

Nicht, weil fünf eine schöne Zahl ist, sondern weil die Belohnungsleiter genau
fünf tragfähige Sprossen hat (Abschnitt 2). Eine sechste Welt müsste entweder
einen dritten dauerhaften Werkzeugbonus ausschütten — und der ist die Sprosse,
bei der das Gleichgewicht bricht — oder eine Belohnung wiederholen. Beides ist
schlechter als aufzuhören.

### Warum die Levelzahl von 10 auf 15 steigt

Die Spanne ist vom Auftraggeber gesetzt (10 bis 15). Innerhalb der Spanne
steigt sie, und zwar aus zwei Gründen, die in dieselbe Richtung zeigen:

**Unterricht ist teuer, Variation ist billig.** Jedes Level der Welt 1 bringt
etwas bei, das es vorher nicht gab: senkrecht graben, waagerecht rammen,
Brücke, Schirm, Stahl, Klettern, Sprengen, Weiche, Gaben stapeln, Prüfung. Ein
elftes Level müsste entweder einen neunten Beruf erfinden oder etwas
wiederholen. Späte Welten haben dieses Problem nicht: Dort ist das Vokabular
bekannt, und die Freude liegt in der Kombination. Fünfzehn Kombinationen aus
acht Berufen und vier Materialien sind noch lange nicht ausgereizt; fünfzehn
Erklärungen hintereinander wären eine Schulstunde.

**Die erste Belohnung muss ankommen, bevor die Geduld reisst.** Zehn Level à
zwei bis vier Minuten sind rund eine halbe Stunde — zwei Fahrten mit der Bahn.
Fünfzehn Level wären fünfundvierzig Minuten bis zur ersten Belohnung, und wer
so lange nichts bekommt, hört vorher auf. Später darf der Weg länger sein: Wer
Welt 4 erreicht hat, hat schon dreimal erlebt, dass am Ende etwas steht.

### Was heute gebaut ist

Welt 1 ist vollständig: `w1-01` bis `w1-10` in `src/levels/index.ts`, alle im
Thema `grass`, alle mit nachgewiesener Musterlösung im Par-Budget. Fünf davon
sind für diesen Entwurf neu entstanden:

| # | Level | lehrt | setzt voraus | Par |
|---|-------|-------|--------------|----:|
| 6 | Die Stahlwand | Kletterer — der Weg *über* den Stahl | 5 | 6 |
| 7 | Unter dem Deckel | Sprengmeister; die Zündschnur als Vorhalt | 1, 5 | 1 |
| 8 | Die Weiche | Blocker als Weiche, Brücke unter Zeitdruck | 3 | 2 |
| 9 | Auf und ab | zwei Gaben auf einer Figur | 4, 6 | 12 |
| 10 | Prüfung im Grasland | Brücke, Schacht, Stollen | 1, 2, 3, 5 | 3 |

Der Aufbau ist gestaffelt und nicht additiv: Level 6 funktioniert nur, weil
Level 5 den Stahl eingeführt hat — die Wand ist Stahl, damit der Spieler seine
gewohnten Werkzeuge daran abprallen sieht, bevor er auf den Kletterer kommt.
Level 7 nimmt denselben Stahl und dreht ihn um: Diesmal hat er eine Naht, und
die einzige Grabung, die keine Richtung kennt, ist die Sprengung. Level 8
verlangt zum ersten Mal **zwei Dinge gleichzeitig** und setzt dafür die Brücke
aus Level 3 als bekannt voraus. Level 10 verlangt drei Handgriffe aus drei
verschiedenen Leveln in einer Reihenfolge.

Die Welten 2 bis 5 stehen im Katalog mit Namen, Bahn, Etappen und Belohnung.
Ihre Level-IDs (`w2-01` … `w5-15`) sind reserviert. **Sobald jemand ein Level
mit einer dieser IDs in `LEVELS` schreibt, erscheint es auf der Karte** — es
gibt keine zweite Stelle zu pflegen. Welten ohne ein einziges gebautes Level
lässt `weltkarte()` weg; die Karte verspricht nichts, was das Spiel nicht
halten kann.

### Was für die Welten 3 bis 5 noch fehlt

`ThemeId` in `src/levels/types.ts` kennt nur `grass` und `crystal`. Die Welten
3 bis 5 tragen deshalb im Katalog ein `themaGeplant` als Merkposten und
zeichnen ihren Kartenabschnitt bis auf Weiteres mit einer vorhandenen Palette.
Fehlend sind je Welt: ein `ThemeId`-Eintrag, eine `Palette` in
`src/render/palette.ts`, ein `Stueck` in `src/audio/music.ts` und ein Bett in
`src/audio/ambiente.ts`.

**Wichtig für den Bauplan:** Der Entwurf funktioniert vollständig mit den zwei
vorhandenen Themen. Welt 1 (Gras) ist gebaut und spielbar, Welt 2 (Kristall)
braucht Level, aber keine neue Grafik und keine neue Musik — die Höhlenpalette
und das Höhlenstück liegen heute ungenutzt im Programm, weil kein einziges
Level `crystal` verwendet. Erst Welt 3 verlangt neue Kunst.

---

## 2. Die Belohnungskurve

### Das Problem mit dem dauerhaften Gräber

Der Auftraggeber nennt als Beispiel „einen Gräber mehr". Das ist eine
verlockende Belohnung, weil sie sich sofort anfühlt — und sie ist die
gefährlichste Währung, die dieses Spiel hat. Drei Gründe:

**Sie wirkt rückwärts in fertige Entwürfe hinein.** Ein Rätsel in Wuselwerk ist
in aller Regel ein Knappheitsrätsel: „Du hast genau einen Blocker, wo setzt du
ihn?" Wer einen zweiten dazubekommt, löst nicht dasselbe Rätsel leichter — er
löst ein anderes. Und zwar in *jedem* Level, auch in denen, die zum Zeitpunkt
der Belohnung längst abgenommen und getestet waren.

**Sie summiert sich.** Nach der fünften Welt hätte jedes Level fünf zusätzliche
Werkzeuge. Level 3 („Der Abgrund", Par 4) wäre mit sechs statt einem
Brückenbauer kein Rätsel mehr, sondern eine Fingerübung. Der zehnte
Werkzeugbonus verwandelt tatsächlich jedes Rätsel in Brei — die Frage im
Auftrag ist berechtigt.

**Sie ist unumkehrbar.** Eine Belohnung wieder wegzunehmen geht nicht; der
Spieler hat sie sich verdient. Wer sie einmal ausgeschüttet hat, muss alle
künftigen Level dagegen auslegen — und damit ist jeder Entwurf für Welt 4 in
Wahrheit ein Entwurf für „Welt 4 mit drei Extrawerkzeugen".

### Drei Grenzen, die den Gräber trotzdem gangbar machen

Der Auftraggeber bekommt seine Belohnung. Sie ist im Code umgesetzt
(`werkzeugeFuer` in `src/progression.ts`), sie ist die Belohnung für Welt 1 —
und sie ist an drei Grenzen gebunden, die alle drei Probleme entschärfen:

**Grenze 1 — ein Bonus erfindet nie einen Beruf.** Er erhöht nur Berufe, die
das Level ohnehin ausgibt (`if (out[b.skill] > 0)`). Ein Level ohne
Sprengmeister bekommt durch keine Belohnung einen. Das ist der Unterschied
zwischen „mehr vom Gleichen" und „ein anderes Rätsel", und er entscheidet, ob
ein Entwurf hält.

**Grenze 2 — höchstens zwei unbedingte Werkzeugboni im ganzen Spiel**, und
beide auf Berufe, die *keinen Weg öffnen*: Gräber (geht nur nach unten, und
unten liegt selten die Sperre) und Schirmspringer (verhindert einen Tod, öffnet
nichts). Nie Rammer, Schrägbagger, Brückenbauer, Sprengmeister, Kletterer oder
Blocker — das sind die sechs, an denen die Rätsel hängen. Damit ist die Frage
nach dem zehnten Bonus beantwortet: Es gibt keinen zehnten. Es gibt zwei.

**Grenze 3 — ein Bonus kann den Durchgang kaufen, nie die Meisterschaft.** Der
dritte Stern hängt an `level.par`, also an der Zahl der *benutzten* Werkzeuge.
Ein Bonus füllt den Vorrat und rührt `par` nicht an. Wer mit doppeltem Vorrat
durchbricht, kommt durch — aber mit demselben Sternestand wie vorher. Die
Belohnung hilft dem, der feststeckt, und ist für den, der es genau wissen will,
wertlos. Genau so herum ist es richtig.

### Die Leiter

| Welt | Belohnung | Sorte | Warum sie trägt |
|---|---|---|---|
| 1 | Ein Gräber mehr | `werkzeug` | Der inerteste der acht Berufe. Erster von zwei. |
| 2 | Die längere Uhr (+25 %) | `zeit` | Zeit löst kein Rätsel, sie nimmt die Hast. Skaliert beliebig. |
| 3 | Ein Schirm mehr | `werkzeug` | Verhindert Tode, öffnet keinen Weg. **Letzter Werkzeugbonus.** |
| 4 | Meisterschlüssel | `komfort` | Par steht ab jetzt immer offen da. Zeigt mehr, spielt nicht mit. |
| 5 | Goldenes Band | `schmuck` | Hut und goldener Weg. Wirkungslos und trotzdem begehrt. |

Die Leiter fällt in der *Kraft* und steigt im *Status*. Das ist Absicht: Am
Anfang braucht der Spieler Hilfe und hat noch keinen Stolz; am Ende hat er
Können und will, dass man es sieht.

### Zwischen den Welten: der Rückenwind

Zehn bis fünfzehn Level bis zur nächsten Belohnung sind zu weit. Deshalb ist
jede Welt in **Etappen** von drei bis fünf Leveln geteilt (Welt 1: 3 / 4 / 3).
Am Ende jeder Etappe passieren drei Dinge:

1. **Rückenwind.** In allen Leveln *abgeschlossener Etappen* gibt es ab jetzt
   ein Werkzeug mehr von jedem Beruf, den das Level ausgibt. Das ist eine echte
   Verstärkung — und sie kann nichts kaputtmachen, weil sie **ausschliesslich
   rückwärts** wirkt: auf Rätsel, die der Spieler bereits gelöst hat. Sie macht
   das Nachspielen bequemer und lässt das Gleichgewicht kommender Level völlig
   unberührt. Das ist die Antwort auf die Frage, welche Belohnungen gut
   skalieren: die, die ungespielte Rätsel nie anfassen.
2. **Der Weg wird ausgebaut.** Am Rastplatz geht eine Laterne an. Die Karte
   sieht danach sichtbar anders aus.
3. **Die Musik gewinnt eine Spur.** Die Begleitmusik hat sieben einzeln
   schaltbare Ebenen (`src/audio/music.ts`). Eine Etappe mehr heisst: eine
   Ebene mehr. Das kostet keine einzige neue Datei und ist trotzdem die
   Belohnung, die man am stärksten spürt.

Die Etappen brauchen keinen eigenen Katalogeintrag: Sie ergeben sich aus dem
`chapter`-Feld der Level, das ohnehin in der Kopfzeile steht.

### Wenn man es anders will

Wer die reine Auftragsvariante möchte — *jede* Welt schüttet einen dauerhaften
Werkzeugbonus aus —, muss nur fünf Zeilen im Katalog ändern; der Typ
`Belohnung` kann es. `werkzeugeFuer` rechnet die Boni stumpf zusammen. Der
Entwurf sagt nur voraus, was dann passiert: Ab Welt 3 muss jedes neue Level
gegen einen Vorrat ausgelegt werden, der mit der Zeit weiterwächst, und die
alten Level sind dann keine Rätsel mehr, sondern Spaziergänge. Die Leiter oben
ist der Vorschlag; die Auftragsvariante ist eine Zeile Katalog entfernt.

---

## 3. Wie die Karte auf einem quer gehaltenen Handy aussieht

Bezugsmass für alle Zahlen: **640 × 360 logische Bildpunkte**, quer.

### Das Band

Die Karte ist **ein einziges waagerechtes Band** über alle Welten. Gemessen
wird in Bildschirmbreiten: `x = 1` ist eine Gerätebreite, `y` läuft von 0
(oben) bis 1 (unten) der Bandhöhe. Der Zeichner multipliziert mit der
tatsächlichen Breite — die Karte ist auflösungsfrei.

```
  0                    640                  1280                 1920  px
  ├─────────────────────┼────────────────────┼────────────────────┤
  │  KOPFZEILE: Grasland · 4/10 · ★ 9/30            [Welt ▾] [✕]  │  44 px
  ├───────────────────────────────────────────────────────────────┤
  │                                                               │
  │        ③                        ⑦                            │  Band
  │      ╱   ╲                    ╱   ╲                           │  276 px
  │    ②      ╲    ⛯          ⑥      ╲          ⛯               │
  │   ╱         ④  ╱ ╲       ╱          ⑧                        │
  │  ①            ╲╱   ⑤ ╌╌╌╌            ╲╌╌╌╌╌⑨╌╌╌╌⑩╌╌╌╌┃╤┃      │
  │  ▲                                                    Tor     │
  │  Figur                                                        │
  ├───────────────────────────────────────────────────────────────┤
  │  GRÄ +1   ★★☆              [Heim]                             │  40 px
  └───────────────────────────────────────────────────────────────┘
```

**Punktabstand: 0,24 Bildschirmbreiten = 154 px.** Diese Zahl ist keine
Geschmacksfrage, sondern folgt aus dem Finger: Ein Tippziel braucht 44 px, die
drei Sterne darüber noch einmal 40 px Höhe und rund 50 px Breite. Bei engerem
Abstand berühren sich Punkte und Sterne, bei weiterem sieht man zu wenig Weg
auf einmal.

**Damit stehen gut vier Punkte gleichzeitig im Bild**: einer hinter der Figur,
die Figur selbst, und zwei, auf die man sich freut. Das ist die eigentliche
Antwort auf die Frage, wie man fünfzehn Punkte unterbringt — **man bringt sie
nicht unter.** Ein Weltabschnitt ist breiter als der Bildschirm, und zwar
deutlich:

| Level je Welt | Abschnittsbreite | in px (640) |
|---|---|---|
| 10 | 2,68 Breiten | 1715 |
| 12 | 3,16 | 2022 |
| 13 | 3,40 | 2176 |
| 14 | 3,64 | 2330 |
| 15 | 3,88 | 2483 |

Gesamtes Band über fünf Welten: 16,76 Bildschirmbreiten ≈ 10 730 px.

Der Weg **windet sich zusätzlich**, aber nicht als Notlösung für Platz, sondern
damit er wie ein Weg aussieht und nicht wie eine Zeile: `y` schwingt um die
Bandmitte mit einem Ausschlag von 0,26 und einer Wellenlänge von sieben Leveln.
Sieben, weil der Weg damit über gut drei Punkte ansteigt und über gut drei
wieder abfällt — auf dem Bild sieht man also immer **eine ganze Bewegung**, nie
ein Sägeblatt. In absoluten Zahlen: `y` zwischen 0,24 und 0,76 der Bandhöhe,
bei 276 px Bandhöhe also zwischen 66 px und 210 px unter der Kopfzeile.

### Die Teile im Einzelnen (so, dass man sie zeichnen kann)

**Hintergrund.** Der Abschnitt jeder Welt bekommt den Himmelsverlauf und die
Hügelschichten ihrer Palette (`paletteFor(welt.kartenTheme)`) — dieselben
Formen wie im Spiel, nur ohne Terrain. Am Weltübergang blenden die beiden
Paletten über 0,3 Bildschirmbreiten ineinander. Kosten: null neue Grafik.

**Der Weg.** Eine 5 px breite Linie von Punkt zu Punkt, als weiche Kurve
(quadratische Bézier mit dem Kontrollpunkt auf halber Strecke, um 12 px zur
Wellenaussenseite versetzt). Geschaffte Abschnitte in `welt.farbe`, volle
Deckung. Noch nicht geschaffte Abschnitte gestrichelt (6 px Strich, 8 px Lücke)
in `#3a4454`.

**Ein Level: ein Kreis mit Ring**, Radius 18 px, Tippfläche 44 × 44 px.

- *Gesperrt* — keine Füllung, Ring 2 px in `#38414f`, darin ein Schloss: ein
  Rechteck 10 × 8 px und darüber ein halber Ring von 4 px Radius, beides in
  `#525c6b`. Keine Nummer, keine Sterne. Es soll leer aussehen.
- *Offen* — Füllung `#141a24`, Ring 3 px in `welt.farbe`, dazu ein zweiter,
  atmender Ring (Radius 18 + 2·sin(t)) in derselben Farbe mit 40 % Deckung. Die
  Levelnummer weiss und fett in der Mitte. **Das ist das einzige atmende
  Element der ganzen Karte** — es gibt genau ein „hier geht es weiter".
- *Geschafft* — Füllung `welt.farbe`, Ring 2 px in derselben Farbe, aufgehellt.
  Nummer dunkel. Darüber im Bogen (Radius 26 px, ±32°) drei Sterne à 7 px:
  verdiente golden (`#ffd23f`), fehlende als Umriss in `#4a5364`.

**Rastplatz am Etappenende.** Eine Laterne auf halber Strecke zwischen dem
letzten Level der Etappe und dem ersten der nächsten: ein 3 × 22 px Pfosten,
darauf eine 9 px Kugel. Etappe offen: Kugel grau, Pfosten dunkel. Etappe
geschafft: Kugel in `welt.farbe`, dazu ein Lichtschein (Radialverlauf, 34 px,
25 % Deckung). Der Lichtschein ist auch das Signal für den Rückenwind — er
liegt genau über den Leveln, die ab jetzt einfacher sind.

**Weltentor.** Am Ende jedes Abschnitts: zwei Pfosten 8 × 54 px im Abstand von
40 px, darüber ein Halbbogen von 20 px Radius, alles in `welt.farbe`,
abgedunkelt. Im Schlussstein hängt das Belohnungszeichen (30 px):

- `werkzeug` → `drawSkillIcon()` aus `src/render/icons.ts` mit einem kleinen `+1`
- `zeit` → eine Sanduhr
- `komfort` → ein Schlüssel
- `schmuck` → ein Stern mit Krone

Geschlossen: ein waagerechter Riegel über der Öffnung, das Zeichen auf 30 %
abgedunkelt, darunter in kleiner Schrift die Bedingung („Noch 6 Level"). Offen:
Der Riegel ist weg, das Zeichen leuchtet, und dahinter fängt der nächste
Himmelsverlauf an. Die letzte gebaute Welt bekommt ein Tor **ohne** Zielangabe
— `weltkarte()` liefert `torZiel: null`, und der Zeichner schreibt dann nichts
statt eines Versprechens.

**Kopfzeile**, 44 px, mitlaufend mit dem sichtbaren Abschnitt: Weltname,
Themensatz klein daneben, rechts „4/10" und der Sternestand. Ganz rechts ein
Knopf, der eine Liste der betretenen Welten aufklappt — Direktsprung, für
Leute, die nicht 10 000 px scrollen wollen.

**Fusszeile**, 40 px: links die verdienten dauerhaften Belohnungen als kleine
Marken („GRÄ +1", „SCH +1", Sanduhr +25 %). Der Spieler soll jederzeit sehen,
was er besitzt — sonst ist die Belohnung nach zwei Tagen vergessen.

### Was beim Scrollen passiert

Nur waagerecht. Senkrecht steht das Band fest; quer gehalten hat ein Handy
genau eine Zeile Platz, und eine Karte, die in zwei Richtungen wegläuft,
verliert man sofort.

- Ziehen schiebt 1 : 1, Loslassen läuft mit Reibung aus (Verzögerung ≈ 4
  Bildschirmbreiten pro Sekunde²), Anschlag an beiden Enden mit weichem
  Gummiband.
- **Kein Einrasten.** Auf einem Band mit Laternen und Toren gibt es genug
  Haltepunkte fürs Auge; Einrasten würde nur die freie Bewegung stören.
- Beim Öffnen springt die Karte ohne Bewegung dorthin, wo die Figur steht — sie
  landet auf 40 % der Breite, damit man den zurückgelegten Weg links noch sieht
  und rechts Platz für das Kommende bleibt.
- Wer die Figur aus dem Bild schiebt, bekommt am Bildrand einen **Heimpfeil**:
  ein 22 px Dreieck in `welt.farbe` mit dem Figurenkopf darin. Ein Tipp darauf
  gleitet in 0,4 s zurück.
- Ein Tipp auf einen geschafften oder offenen Punkt startet das Level. Ein Tipp
  auf einen gesperrten Punkt lässt ihn einmal wackeln (±3 px, 0,2 s) und
  blendet für 1,5 s den Grund ein („Erst *Die Weiche* schaffen").

### Warum ein Band und kein Blättern

Beides wäre vertretbar; die Entscheidung ist **ein durchgehendes Band**.

Drei Gründe. Erstens hat der Auftraggeber „durch scrollen" gesagt, und ein
Blätterwerk ist kein Scrollen. Zweitens — und das ist der eigentliche Grund —
sind die Weltentore der Höhepunkt der ganzen Fortschrittsdramaturgie. Auf einem
Band **sieht** man sie: Man scrollt zurück und kommt an dem Tor vorbei, das man
selbst geöffnet hat, mit dem Belohnungszeichen darin. Blättert man, ist der
Weltwechsel ein Seitenumbruch — also nichts. Drittens ist der Weg der Beweis:
Fünfzehn Bildschirmbreiten zurückzuscrollen dauert lang, und genau dieses
„boah, das war ein Stück" ist ein Gefühl, das man nicht geschenkt bekommt.

Der Preis ist das lange Scrollen. Den bezahlt der Weltwähler in der Kopfzeile:
ein Tipp, eine Liste der betretenen Welten, ein Sprung. Das ist billiger als
den Höhepunkt zu verschenken.

### Was jemand beim allerersten Start sieht

Nicht dreissig graue Punkte. Zwei Regeln sorgen dafür:

**Es gibt nur die Welten, die man erreicht hat.** `weltkarte()` liefert
ausschliesslich gebaute Welten, und der Zeichner zeigt davon nur, was betreten
ist, plus das **geschlossene Tor** dahinter. Beim ersten Start ist das Band
also genau 2,68 Bildschirmbreiten lang, nicht 16,76.

**Innerhalb der Welt sind alle zehn Punkte da, aber nur vier zu sehen.** Der
Bildschirm zeigt bei Punktabstand 154 px höchstens vier bis fünf Punkte. Beim
ersten Start heisst das: **ein leuchtender, atmender Punkt mit der 1, dahinter
zwei bis drei matte Schlösser, und rechts läuft der gestrichelte Weg aus dem
Bild.** Das ist kein Wall, das ist ein Versprechen. Wer neugierig ist, scrollt
weiter und sieht am Ende das Tor mit dem Gräber-Zeichen und „Noch 10 Level" —
und weiss damit ab der ersten Minute, worauf das alles hinausläuft.

Der erste Kartenaufruf spielt zusätzlich die Wanderung einmal *leer* ab: Die
Figur wird eingeblendet, macht zwei Schritte auf der Stelle und dreht sich zum
ersten Punkt. Damit ist ohne ein Wort erklärt, wer da steht und wohin es geht.

---

## 4. Sterne und Freischaltung

Es gibt drei Sterne je Level (`src/storage.ts`): Quote erreicht, alle gerettet,
unter Par gelöst.

**Sterne sperren nichts. Niemals.** Freigeschaltet wird ausschliesslich über
`won`, also über den ersten Stern. Wer die Quote schafft, geht weiter.

Das ist eine bewusste Entscheidung gegen das Übliche. Ein Sternentor („60
Sterne für Welt 3") ist leicht zu bauen und erzeugt zuverlässig genau eine
Situation: Der Spieler steht vor einer Tür, die er nicht mit Können öffnen
kann, sondern nur mit Wiederholung. Auf dem Handy, in einer Fahrt mit der Bahn,
ist das der Moment, in dem die App zugeht und nicht wiederkommt. Der dritte
Stern ist ausserdem in diesem Spiel ausgesprochen schwer — er verlangt die
Musterlösung —, und was schwer ist, darf nicht auch noch versperren.

Wofür Sterne dann da sind:

- **Sie stehen auf der Karte.** Über jedem geschafften Punkt, im Bogen. Ein
  Weltabschnitt mit lauter dreifach besternten Punkten sieht anders aus.
- **Sie summieren sich sichtbar** in Kopfzeile (Welt) und Weltwähler (gesamt).
- **Eine Welt mit voller Sternzahl bekommt ein goldenes Tor** statt eines
  farbigen. Das ist der ganze Lohn, und er reicht: Wer Sterne sammelt, sammelt
  sie für sich.

`levelZustand()` kennt zwei Regeln, und die zweite ist der Unterschied zwischen
einer Liste und einer Karte:

1. **Innerhalb einer Welt**: offen, sobald der Vorgänger geschafft ist.
2. **Am Weltanfang**: offen, sobald die *ganze* vorige Welt steht — dieselbe
   Bedingung, unter der die Belohnung fällt. Das Weltentor ist ein echtes Tor.
   Ohne diese zweite Regel könnte ein lückenhafter Spielstand in die nächste
   Welt durchrutschen, während die Belohnung ausbleibt, und der Spieler stünde
   in einer neuen Welt, ohne zu verstehen, warum er nichts bekommen hat.

---

## 5. Die Wanderung der Figur

Die Figur ist ein Wusel in Laufhaltung, gezeichnet aus demselben Atlas wie im
Spiel. Sie steht immer auf dem **ersten Level, das noch nicht geschafft ist** —
`figurStand()`. Sie ist der Stand, nicht der Zeiger: Sie zeigt nicht, was man
zuletzt gespielt hat, sondern wie weit man ist.

### Wann sie läuft

Nach dem Ergebnisbildschirm eines gewonnenen Levels. Der Spieler tippt
„Karte", das Band blendet auf und die Figur steht noch auf dem **alten** Punkt.
Dann läuft sie. `wanderung(vorher, nachher)` liefert die ganze Choreografie in
einem Stück: den Weg als Punktfolge, die Rastplätze und Tore, die dabei
aufgehen, und die Belohnungen, die dabei fallen.

### Was man dabei sieht

**Der normale Schritt** (ein Level weiter, 0,9 s): Die Kamera schiebt so, dass
die Figur auf 40 % der Breite bleibt. Die Figur läuft die Wegkurve entlang, die
gestrichelte Linie hinter ihr wird durchgezogen und nimmt die Weltfarbe an.
Kurz bevor sie ankommt, kippt der Zielpunkt von *gesperrt* auf *offen*: Das
Schloss fällt ab (12 px nach unten, dabei ausblendend), der Ring nimmt Farbe
an, der atmende Ring setzt ein. Auf dem verlassenen Punkt erscheinen die
Sterne, einer nach dem anderen im Abstand von 0,12 s.

**Der Etappenschritt** (0,9 s + 1,2 s): Wie oben, aber die Figur hält an der
Laterne an. Sie geht an, der Lichtschein wächst in 0,4 s auf, die Musik legt
eine Spur dazu, und über den Leveln der abgeschlossenen Etappe erscheint kurz
je ein kleines Aufwärtszeichen — der Rückenwind, sichtbar dort, wo er wirkt.
Dann läuft sie weiter.

**Der Weltschritt** (0,9 s + 2,6 s): Die Figur läuft bis vor das Tor und bleibt
stehen. Der Riegel hebt sich, das Belohnungszeichen im Schlussstein leuchtet
auf und wächst um 20 %, dann löst es sich und fliegt in 0,6 s in die Fusszeile,
wo es als neue Marke einrastet. Erst danach geht die Figur durch das Tor. Beim
Durchschreiten wechselt der Hintergrund auf die Palette der neuen Welt, die
Kopfzeile blendet den neuen Weltnamen ein, und die Figur landet auf dem ersten
Punkt der neuen Welt, der in diesem Moment aufgeht. Wer wegtippt,
überspringt — die Schrittfolge muss abbrechbar sein, sonst ist sie beim
dritten Mal eine Zumutung.

**Wiederholung** (0 s): Die Figur bewegt sich nicht. `wanderung(p, p)` liefert
einen Weg aus genau einem Punkt. Während man ein altes Level spielt, bleibt sie
dort stehen, wo der Stand ist; nur die Kamera fährt zum gespielten Punkt und
kommt danach zur Figur zurück.

---

## 6. Die drei offenen Fragen

### Was passiert, wenn jemand ein Level wiederholt und schlechter abschneidet?

**Nichts. Er verliert nichts.** Das gilt auf drei Ebenen, und alle drei sind
schon so gebaut:

- Der Spielstand kennt nur Bestwerte. `recordResult()` schreibt `won` als
  „oder", `stars` und `bestSaved` als Maximum, `bestSkills` als Minimum. Ein
  schlechter Lauf kann rechnerisch nichts wegnehmen.
- Die Figur rührt sich nicht. Sie steht auf dem Stand, und der Stand ist
  unverändert. Ein Nachspielen von Level 2 wirft niemanden auf Level 2 zurück.
- Eine Welt kann nicht wieder unfertig werden, also kann eine Belohnung nicht
  wieder verschwinden.

Ein Nachspielen ist sogar strikt angenehmer als der erste Durchgang: Das Level
liegt in einer abgeschlossenen Etappe, bekommt also Rückenwind, und wer schon
Belohnungen hat, spielt es mit mehr Werkzeugen und mehr Zeit. Nur den dritten
Stern bekommt man dadurch nicht geschenkt — `par` bleibt, wie es war.

Der einzige Preis ist die Zeit. Und deshalb steht auf jedem geschafften Punkt
der Sternestand: Man soll auf einen Blick sehen, ob sich das Wiederkommen
überhaupt lohnt.

### Scrollen oder Blättern?

Entschieden: **Scrollen, ein durchgehendes Band.** Begründung in Abschnitt 3;
kurz: Blättern verschenkt die Weltentore, und die sind das Beste, was diese
Karte zu bieten hat. Die Länge des Bandes wird durch den Weltwähler in der
Kopfzeile abgefedert.

### Was sieht jemand beim ersten Start?

Ein leuchtender Punkt, zwei bis drei matte Schlösser, ein Weg, der aus dem Bild
läuft, und eine Figur, die zum ersten Punkt schaut. Nicht die ganze Welt und
schon gar nicht alle fünf. Ausführlich in Abschnitt 3.

---

## 7. Spielstand: kein Übergang nötig

`wuselwerk.progress.v1` bleibt **unverändert**. Alles, was dieser Entwurf
beantwortet, folgt aus `won` und `stars` der einzelnen Level. Belohnungen
werden nicht gespeichert, sondern *hergeleitet*: Wer alle Level einer Welt
geschafft hat, hat ihre Belohnung — jedes Mal neu ausgerechnet, aus denselben
Daten.

Das ist kein Zufall, sondern der Grund für den Entwurf. Ein zweites Feld
„verdiente Belohnungen" im Spielstand wäre eine zweite Wahrheit, und zwei
Wahrheiten laufen auseinander: bei einem Umbau des Weltenkatalogs, bei einem
umbenannten Level, bei einem halb geschriebenen `localStorage`.

Was daraus folgt:

- **Ein alter Spielstand mit fünf Leveln** liest sich als „fünf geschafft, Welt
  1 zur Hälfte, keine Belohnung, Figur steht auf Level 6". Ohne eine Zeile
  Umwandlungscode.
- **Ein Spielstand mit unbekannten IDs** (umbenanntes Level) verliert genau
  dieses eine Level und sonst nichts.
- **Ein kaputter Spielstand** stürzt nicht ab: `istGeschafft` und
  `sternenZahl` prüfen die Felder, statt ihnen zu glauben. Geprüft in
  `tests/progression.test.ts` → „Fremde und alte Spielstände".

Falls später doch etwas gespeichert werden muss, das sich nicht herleiten lässt
— ein gewählter Hut, ein Übersprungrecht nach fünf Fehlversuchen —, gehört das
unter einen **eigenen Schlüssel** (`wuselwerk.schmuck.v1`) und nicht in den
Fortschritt. Dann kann das eine kaputtgehen, ohne das andere mitzunehmen.

---

## 8. Schnittstelle für den Zeichner

Alles in `src/progression.ts`, alles reine Funktionen. Der Normalfall ist **ein
Aufruf**:

```ts
const karte = weltkarte(loadProgress());
//   .welten[]            — je Welt: level[], etappen[], tor, bandStart/-Breite,
//                          geschafft, sterne, belohnung, belohnungVerdient, torZiel
//   .welten[].level[]    — id, def, nr, lauf, etappe, zustand, sterne, pos
//   .bandBreite          — Gesamtbreite in Bildschirmbreiten
//   .figur               — { weltId, levelId, pos }
//   .belohnungen[]       — was gilt
//   .geschafft / .gesamt / .sterne / .sterneMoeglich
```

Beim Laden eines Levels:

```ts
const skills = werkzeugeFuer(level, fortschritt);   // statt level.skills
const zeit   = zeitlimitFuer(level, fortschritt);   // statt level.timeLimitSec
```

Nach einem gewonnenen Level:

```ts
const schritt = wanderung(standVorher, loadProgress());
//   .weg[]              — Punktfolge, die die Figur abläuft
//   .rasten[] / .tore[] — was dabei aufgeht
//   .neueBelohnungen[]  — was dabei fällt
//   .fertigeWelten[]    — welche Welt gerade fertig wurde
```

Einzelfragen: `levelZustand`, `istFreigeschaltet`, `naechstesLevel`,
`figurStand`, `verdienteBelohnungen`, `hatKomfort`, `weltFertig`, `weltVon`,
`spielReihenfolge`, `stationen`.

Alle nehmen als letzten Parameter einen `Katalog` (Vorgabe: der echte). Der ist
für die Tests da — nur so lässt sich der Weltwechsel samt Belohnung prüfen,
solange erst eine Welt gebaut ist.
