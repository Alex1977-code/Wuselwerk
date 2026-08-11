# Wuselwerk — MVP-Prototyp

Spielbarer Prototyp nach dem Game Design Document. Er baut die Schritte 1–5 der
MVP-Reihenfolge (GDD §13) und beantwortet damit genau die Frage, an der laut
Dokument alles hängt:

> *Wenn das Antippen einer 12 Pixel großen Figur sich präzise anfühlt,
> funktioniert das Spiel. Wenn nicht, rettet auch die schönste Grafik nichts.*

Der Prototyp läuft als Webseite und ist damit **sofort auf dem Handy testbar** —
kein Store, keine Installation, kein Build auf dem Gerät.

## Starten

```bash
npm install
npm run dev        # danach die angezeigte Netzwerkadresse am Handy öffnen
```

Für den Test am Gerät: `npm run dev` gibt eine Adresse wie
`http://192.168.x.x:5173/` aus. Handy ins gleiche WLAN, Adresse öffnen,
zum Startbildschirm hinzufügen — dann läuft es im Vollbild ohne Browserleisten.

```bash
npm test           # 60 Tests: Simulation, Zielen, Lösbarkeit, Determinismus
npm run typecheck
npm run build
node scripts/smoke.mjs   # spielt Level 1 im echten Browser durch, legt Screenshots in shots/
```

## Was drin ist

| GDD | Umgesetzt |
|---|---|
| §3.1 Fokuszeit | Finger auf dem Glas → 25 % Geschwindigkeit, unbegrenzt, kein Balken. Gemessen: 16 statt 60 Ticks/s. |
| §3.2 Lupe | Runder Ausschnitt 2,5× **oberhalb** des Daumens, weicht am oberen Rand nach unten aus. |
| §3.3 Intelligentes Zielen | Fangradius sucht die nächste Figur, **für die der Beruf gültig ist**. Auswahl-Fächer, wenn zwei Kandidaten dicht beieinander stehen. |
| §3.5 Daumen-Layout | Untere ~26 % Steuerung, acht Berufe im Bogen, Freisetzungsrate als senkrechter Schieber links, erst Beruf → dann Figur, Skill bleibt aktiv. |
| §3.5 Einhändig schwenken | Übersichtskarte unten rechts, zugleich Schieber. Ziehen ohne gewählten Beruf schwenkt. Randmarken zeigen Ausgang und Figuren ausserhalb des Bildes. Auto-Kamera folgt dem Median. |
| §4 Berufe | Alle acht Klassiker plus Freisetzungsrate und Selbstzerstörung. |
| §5 Aus den 90ern | Pixelgenau zerstörbares Terrain, Stahl, Falltür, leuchtende Ausgangstür, Rettungsquote-Balken, sture Läufer ohne Wegfindung, sichtbares Sterben. |
| §6 Grafik | Terrainmaske in logischer Auflösung, frisch gegrabenes Material heller als altes, Grasnarbe nur auf unberührter Oberfläche, Partikel, Parallax, Bildschirmschütteln nur bei Sprengungen, Berufe an der Silhouette erkennbar. |
| §7 Sound & Haptik | Alles zur Laufzeit synthetisiert, keine Tondateien. Eigenes Arbeitsgeräusch je Beruf, Sprengcountdown als lautester Ton, gestapelter Rettungsjingle, tiefer Puls bei jedem Verlust. Vibration bei Vergabe, Tod und Sprengung. |
| §8 Level | Fünf Testlevel, ein neues Konzept pro Level, drei Sterne, Par erst nach dem ersten Sieg sichtbar, Fortschritt lokal gespeichert. |
| §11 Technik | Deterministische Simulation, feste Tickrate 60 Hz, Ganzzahlpositionen, Terrain als Materialmaske, Kollision direkt auf der Maske, Renderauflösung von der Simulation entkoppelt. |

## Aufbau

```
src/core/      Simulation — kennt weder DOM noch Canvas, komplett testbar
  terrain.ts   Materialmaske, Zerstörung, Dirty-Rects, Klonen
  world.ts     Tickschleife, Zustandsautomat aller Berufe
  skills.ts    Gültigkeitsregeln (Grundlage des intelligenten Zielens)
src/levels/    Leveldefinitionen und Mal-Befehle, deterministisch aus einem Startwert
src/render/    Kamera, Terrain-Leinwand, Figuren, Lupe, HUD, Overlays
src/input/     Zielauswahl und Auswahl-Fächer (rein rechnerisch, ohne DOM)
src/game.ts    Orchestrierung, Eingabe, Spielschleife
```

Die Simulation ist bewusst engine-agnostisch: kein Zufall, kein Gleitkomma,
keine Renderer-Abhängigkeit. Eine spätere Portierung nach Godot (GDD §11) kann
diese Dateien als Referenzimplementierung nehmen — und der **Zeitrücklauf
(§3.4)** lässt sich ohne Umbau nachrüsten, weil `Terrain.clone()` und der
Figurenzustand schon vollständig serialisierbar sind.

## Bewusste Abweichungen vom Dokument

- **Terrain 960×540 statt 960×600.** Hochformat: bei 300 logischen Pixeln
  Sichtbreite passt die Höhe so ohne störendes Vertikalscrollen.
- **Levelbreiten 480–960.** Level 1 ist absichtlich schmal, damit der Anfänger
  die Tür nicht verfehlt.
- **Web statt Godot.** Bewusst gewählt, um §3.1–3.3 sofort am Daumen zu prüfen.

## Noch nicht gebaut (nach MVP-Reihenfolge §13, Schritt 6–7)

Zeitrücklauf (§3.4), Magnetiker/Springer (§4, ab Welt 4), Fallen (§5),
weitere Welten (§6), Leveleditor und Tagesrätsel (§9).

### Zum Ton im Einzelnen

Alle Geräusche entstehen zur Laufzeit über die Web Audio API. Das ist keine
Sparmassnahme, sondern Bedingung: Der Prototyp lässt sich nur deshalb in eine
einzige HTML-Datei packen, weil er nichts nachlädt.

Zwei bewusste Abweichungen vom Dokument:

- **Statt Dauertönen pro Beruf klingt jeder Arbeitsschritt einzeln.** Auf einem
  Handylautsprecher verschmieren übereinandergelegte Dauertöne zu Matsch,
  während die Dichte der Schläge sofort verrät, wie viele Figuren arbeiten —
  dieselbe Information, nur lesbarer.
- **Die Musik ist eine eigene schlichte Schleife, kein Arrangement.** §7
  schlägt gemeinfreie Volksmelodien vor; das ist eine Kompositionsaufgabe und
  gehört in eine eigene Runde. Die jetzige Schleife trägt die Stimmung und
  hält den Prototyp frei von fremdem Material.

Der Rettungsjingle nutzt eine Fünftonleiter: Gestapelte Töne klingen dadurch
immer zusammen, egal in welcher Reihenfolge gerettet wird. So entsteht bei
einer Massenrettung von selbst eine Melodie.

**Haptik nur unter Android.** Die Vibrations-Schnittstelle des Browsers gibt es
in Safari auf dem iPhone nicht — dort bleibt das Spiel still. Diese Rückmeldung
wäre erst in einer nativen Fassung möglich.

## Grafik einwerfen

Der Renderer zeichnet die Figuren prozedural — das bleibt die **Rückfallebene**
und funktioniert immer. Darüber liegt ein Sprite-Lader:

```bash
npm run atlas:template   # schreibt die Malvorlage nach src/art/
```

Die Vorlage entsteht aus dem prozeduralen Zeichner selbst, hat also garantiert
das richtige Zellraster (24 × 24 logisch) und den richtigen Fusspunkt (12, 20).
Zelle für Zelle übermalen, Dateinamen behalten, fertig — der Lader findet das
Paar `src/art/*.png` + `src/art/*.atlas.json` beim Bauen von allein. Kein Code
muss angefasst werden, und es gibt keine Netzanfrage, die ins Leere laufen
kann.

**Die Rückfallebene greift je Figur, nicht je Spiel.** Kann ein Blatt einen
Zustand nicht bedienen, zeichnet der prozedurale Weg genau diesen Zustand
weiter. Halbfertige Grafik ist damit jederzeit spielbar.

Bildzahl und Haltedauer je Zustand sind **nicht frei wählbar** — sie hängen an
den Taktraten der Simulation und stehen in `docs/grafik-integration.md`,
ausformuliert in `DEFAULT_MANIFEST` (`src/render/atlas.ts`). Zwei Punkte daraus
sind leicht zu übersehen: `DIG_INTERVAL` ist prim, deshalb trägt jeder Clip
eine Haltedauer **je Bild**; und Bild eins ist immer das Wirkungsbild, weil die
Simulation bei `timer % interval === 0` arbeitet.

## Bildausschnitt und Übersicht

Auf drei Bildschirmbreiten Level und sechs Zoll Anzeige ist die eigentliche
Frage nicht "wie bewege ich das Bild", sondern "woher weiss ich, dass da noch
etwas ist". Vier Dinge greifen ineinander:

- **Übersichtskarte unten rechts.** Sie zeigt Geländeschnitt, Figuren, Ausgang
  und das Sichtfenster als Rahmen — und ist zugleich der Schieber: Antippen
  oder Ziehen springt dorthin. Der Geländeschnitt entsteht durch schlichtes
  Herunterskalieren der Terrain-Leinwand, deshalb erscheinen gegrabene Stollen
  sofort auch in der Übersicht.
- **Ziehen mit einem Finger schwenkt**, solange kein Beruf gewählt ist. Dann
  gibt es ohnehin nichts zu vergeben. Das behebt einen echten Fehler der ersten
  Fassung: Schwenken brauchte zwei Finger und widersprach damit der Vorgabe
  "einhändig spielbar".
- **Randmarken.** Ist der Ausgang ausserhalb des Bildes, zeigt ein Pfeil am
  Rand dorthin. Links und rechts stehen kleine Zähler, wie viele Figuren gerade
  ausserhalb laufen.
- **Auto-Kamera auf dem Median statt dem Mittelwert.** Beim Mittelwert zieht
  eine einzelne weit entfernte Figur die Kamera genau zwischen zwei Gruppen —
  dorthin, wo nichts passiert. Der Median bleibt beim Pulk; wo die Ausreisser
  stecken, sagen Karte und Randmarken.

Zwei Finger bleiben für den Zoom (1× bis 3×). Der Knopf unten links stellt die
Auto-Kamera wieder an.

## Fragen für den Spieltest

Der Prototyp ist gebaut, um diese Fragen mit dem Daumen zu beantworten — nicht
am Schreibtisch:

1. **Der Rammer greift nur, wenn die Wand schon in Reichweite ist.** Das ist
   originalgetreu und beim Levelbau zweimal aufgefallen: Man muss die Figur in
   einem Fenster von wenigen Pixeln antippen. Die Fokuszeit macht daraus rund
   eine halbe Sekunde Realzeit. **Reicht das, oder braucht der Rammer einen
   kurzen Anlauf?** Das ist die wichtigste offene Frage — sie betrifft §2
   (Panik-Management) gegen §3 (Fingermotorik) direkt.
2. **Sind 25 % die richtige Fokusgeschwindigkeit?** Zu langsam nimmt die Panik
   raus, zu schnell hilft es nicht.
3. **Sitzt die Lupe richtig?** 100 Punkt über dem Finger, Radius 54.
4. **Springt der Auswahl-Fächer zu oft an — oder zu selten?**
5. **Level 4 verlangt sechs Schirme, also sechs Tipps unter Zeitdruck.**
   Ist das spannend oder lästig?

## Prüfstand

`npm test` deckt ab: Terrainoperationen inklusive Stahl, jeden Beruf einzeln,
Lauf- und Fallregeln, Skill-Gültigkeit, die Zielauswahl samt Fächer, sowie für
**jedes der fünf Level eine durchgespielte Musterlösung innerhalb des
Par-Budgets**. Zwei identische Läufe ergeben denselben Zustands-Hash — der
Determinismus, den Zeitrücklauf und Ranglisten später brauchen.

`node scripts/smoke.mjs` startet einen echten Chromium bei 390×844, misst die
Fokuszeit, vergibt einen Beruf per Fingerdruck, öffnet den Auswahl-Fächer und
spielt Level 1 zu Ende. Screenshots landen in `shots/`.
