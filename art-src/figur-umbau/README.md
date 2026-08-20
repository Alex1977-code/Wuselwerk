# Figur-Umbau — die Werkstatt hinter der Entscheidung

Hier liegen die Messwerkzeuge und Prototypen aus der Entwurfsrunde vom
20.08.2026, in der drei Zeichner unabhängig Vorschläge zur Überarbeitung der
Spielfigur gebaut und ausgemessen haben. Der Auftraggeber hat daraus
**Fassung E** gewählt: schlanker Körper (B/H 0,47), Staffelmähne aus fünf
Strähnen, übertriebene Posen.

`wahl.png` ist das Blatt, auf dem entschieden wurde.

## Warum das hier liegt und nicht in `art-src/proben/`

`art-src/proben/` ist per `.gitignore` ausgenommen — dort gehört
Wegwerfmaterial hin, und die Beweisbilder dieser Runde (elf Megabyte) sind
genau das. Der **Code** ist es nicht: In ihm stecken die Zahlen, an denen
die Entscheidung hängt, und ohne ihn müsste jede spätere Korrektur die
ganze Messrunde wiederholen.

## Was die Runde gemessen hat — die vier Zahlen, die tragen

1. **Kontrast schlägt Länge.** Haarblau `#3851B6` steht vor dem Himmel mit
   WCAG 3,07, vor der grünen Tunika mit **1,08** — also gar nicht. Eine
   Strähne vor oder hinter dem Rumpf ist unsichtbar; nur was *außerhalb*
   des Umrisses hängt, zählt. Alle Varianten sind am Anteil freier
   Haartinte gemessen, demselben Maß, an dem die alten `drawHaarZacken` mit
   4,2 % gescheitert sind.
2. **Eine einzelne Strähne zerfällt nie.** Schon 0,35 logische Pixel breit
   und 1,5 lang bleibt sie ein durchgehender Strich. Die Grenze ist nicht
   die Länge, sondern der **Abstand**: Zwei Strähnen lesen sich erst ab
   rund 0,9 logischen Pixeln einzeln.
3. **Ungleiche Längen sind die Bedingung, nicht die Zierde.** Gleich lang
   verschmelzen 73 % aller Spitzenpaare, gestaffelt 0 bis 2 %. Seitlich hat
   der Kopf 8,5 Pixel, nach unten 8 freie — bei 17 px trennen sich
   Strähnen über die Länge, nicht über die Breite.
4. **Schlanker macht das Haar lesbar.** Ein je Seite 0,6 lp schmalerer
   Rumpf hebt die freie Haartinte von 41,5 auf 67,1 % (gehen). Die beiden
   Aufträge „zu dick" und „sieht aus wie eine Kappe" ziehen in dieselbe
   Richtung.

## Was gemessen durchgefallen ist

- **Sechs dünne Fäden** (0,36 lp): 71 % der Spitzenpaare unter der
  Lesegrenze — wieder eine blaue Wolke, nur weiter unten.
- **Der lange Schweif** (9,6 lp): liest sich als Draht und berührt in 32
  von 66 Bildern den Zellrand.
- **Strähnen unter 0,75 lp Dicke**: halb Saum, halb Haar — sie lesen sich
  schwarz statt blau.
- **Die Schläfenlocke**: feuert in 0 von 66 Bildern. Der gezeichnete Weg
  kann nur dort ansetzen, wo die gebackene Masse endet; eine Locke vor dem
  Gesicht braucht Geometrie im Modell.
