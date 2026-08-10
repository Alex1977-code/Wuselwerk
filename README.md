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
| §4 Berufe | Alle acht Klassiker plus Freisetzungsrate und Selbstzerstörung. |
| §5 Aus den 90ern | Pixelgenau zerstörbares Terrain, Stahl, Falltür, leuchtende Ausgangstür, Rettungsquote-Balken, sture Läufer ohne Wegfindung, sichtbares Sterben. |
| §6 Grafik | Terrainmaske in logischer Auflösung, frisch gegrabenes Material heller als altes, Grasnarbe nur auf unberührter Oberfläche, Partikel, Parallax, Bildschirmschütteln nur bei Sprengungen, Berufe an der Silhouette erkennbar. |
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

Zeitrücklauf (§3.4), Sound und Haptik (§7), Magnetiker/Springer (§4, ab Welt 4),
Fallen (§5), weitere Welten (§6), Leveleditor und Tagesrätsel (§9).

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
