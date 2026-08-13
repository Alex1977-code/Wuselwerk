# Merkliste

Gesammelte Vorhaben. Was erledigt ist, bleibt mit Verweis stehen — die Liste
ist auch das Gedächtnis dafür, **wo** etwas umgesetzt wurde.

## Name und Titel — erledigt

- ✅ **Fünf Buchstaben** für die Figur: **WUSEL**, Nachsatz „die
  Wuselwerker" (Stil „Sonic – the Hedgehog"). Titelbildschirm mit Parade,
  Schirmspringer und wippendem Schriftzug: `src/render/titel.ts`.

## Weltauswahl — erledigt

- ✅ **Senkrecht**: Das Band läuft die Hochachse hinauf, die erste Welt
  unten, Aufstieg über Hang-Terrassen (`src/render/weltkarte.ts`,
  `welten.ts`, Nachtrag in `docs/weltkarte-entwurf.md`).
- ✅ **Musik schon auf der Karte** (seit der Kritikrunde, Besetzung
  „karte").

## Leben und Versuche — Grundsystem erledigt

- ✅ Tagesbudget **5 Leben** (Marketing-Untersuchung samt Regeln und
  Warnungen: `docs/leben-entwurf.md`), Abzug nur bei Niederlage oder
  Abbruch nach 30 s, Mitternachts-Reset, Herz-Chip auf der Karte.
- ✅ Fenster bei leerem Vorrat: **Video ansehen → 1 Leben**, höchstens 3 am
  Tag — in dieser Fassung ehrlich ohne Werbefilm.
- ✅ **Testmodus** unbegrenzt: `?test` an der Adresse.
- ⬜ **Echte Werbevideos** — erst mit Parental Gate (siehe Entwurf, Warnung 1).
- ⬜ **Kaufbare Pakete** gegen Geld — braucht Store-Anbindung.

## Leveldesign

- ✅ **Schwierigkeitskurve nach der Design-Runde** (Auftrag: „zu einfach,
  wiederholen sich ab Welt 1"): Plan in `docs/leveldesign-runde.md`, alle
  vier Pakete umgesetzt — Herzschutzregel + lebensfreier Lehrgang,
  Messlauf (`docs/messlauf.json`) und Rot-Test-Harness, Zahlenpass
  W1–W5, fünf Blaupausen (eine im Messlauf ehrlich widerlegt und durch
  die Ostwache ersetzt), w2-13 neu, drei W5-Ersatzlevel (Glutregen,
  Kessel, Kaskade und Steg), sieben Rot-Tests.
- ✅ **Feinentklonung, Rest**: w2-06 (Nahtversatz, war schon rot),
  w2-08 (44er-Spalt verlangt die Kette), w2-12 (Schlucht +20, alte
  Brücke zu kurz), w3-05 (Tür westlich + Ostwache) — je mit Rot-Test.
  w2-03 und w2-10 sind bewusst Zweitübersetzungen ohne Rot-Test:
  Klettern ist dauerhaft, jede Geometrie, die den geerbten Kletterplan
  schlüge, schlüge jeden Plan — dort schärft der Werkzeugschnitt.
- ✅ **Mehrebenen-Konzept, Paket 0+1** (`docs/level-konzept.md`):
  Paket 0 — 16 Margen-Heilungen (Quote = Messung − 2, w2-05 als
  dokumentierte Taktgeber-Ausnahme), Niederlagen-Tafel mit
  Fortschritts-Ansage, Startklappe/Lesemodus ab Weltmitte (Karte frei,
  Uhr steht, „Los" öffnet), Minimap im Lesemodus antippbar. Paket 1 —
  w1-08 „Die Weiche" als Mini-B8 (E48/E96 auf dem Normraster, schwebende
  Platten), w2-03 „Der Kamin" (B7 + Grabungs-Finale), w2-04 „Die hohle
  Mauer" (B4-Schleife, climber+digger-Debüt, zwei Grabungen derselben
  Figur), w2-06 „Durch zwei Böden" (B1 im Kleinen, Stahl erzwingt den
  Versatz), w2-07 „Über den Deckel" (man läuft AUF dem Deckel zur Tür),
  w2-08 „Gegenstrom" (Wender, blocker+basher-Debüt). Vier neue
  Rot-Tests, alle Werte aus dem Messlauf. w1-10 trug die beschlossene
  Fassung 2 bereits.
- ✅ **Mehrebenen-Konzept, Paket 2** (Welt 3): w3-04 „Taktstrasse" als
  Rate-Fenster-Fassung (Musterlösung drosselt, Uhr an der gedrosselten
  Messung geeicht — rettet nebenbei 19 statt 18, Marge 2); w3-05 → „Die
  Galerie" (B2, floater+basher-Debüt: der Schirm arbeitet nach der
  Landung, zwei Rot-Tests); **w3-14 „Unter dem Hinweg" neu** (B3
  Haarnadel, miner+basher-Debüt: Riegel, Westschräge auf die Stahlsohle,
  Stollen zurück unter dem Hinweg zur Tür unter dem Eingang; Gräber als
  Stahl-Köder). Abnahme wörtlich nach Konzept: Rot-Test gegen **alle 65
  Altpläne** — er fand einen echten Trivialpfad (Einzelschräge zur
  Kammer), der mit Blech vor dem Riegel und einer Stahl-Ostwand
  geschlossen wurde. Damit ist die beworbene **66** wieder wahr.
- ✅ **Mehrebenen-Konzept, Paket 3** (Welt 4): w4-01 „Die Kante" als
  aktivierte Kaskade (B5: Riegel-Rammung, dann der Schacht aufs
  Zwischenbord, bevor die sichtbare 120er-Ostkante erreichbar wird; alle
  krummen 70er der Welt auf das Normraster gehoben); w4-06 → **„Das
  Doppeltor"** (B6-Routenwahl-Ersatzbau statt des erklärten
  w4-02-Klons: Stollen vom Eisboden hält das Par, der Firn-Spalt mit
  Grube, Wächter und Freisprengung ist schneller, kostet aber zwei
  Vergaben mehr und ein Leben — bomber+digger, der bisherige Köder wird
  Lösung; beide Routen grün getestet); w4-07 „Gegenwind" repariert
  (die alte Fassung rettete 12/12 mit null Zuweisungen, weil die
  Stufenkante über dem Pfeilerkopf lag — jetzt Pfeiler 96, Kletterer
  echt, Par neu gemessen auf 8); w4-10 „Vier Kanten" als **erstes
  Zwei-Fronten-Pflichtlevel** (der Schacht im Firn-Fleck teilt den Pulk
  nach Fallrichtung; die Ostfront gräbt sich im Sohlen-Stollen unter der
  Terrasse zurück — niemand kann sterben, Marge 3). Dazu w4-04 als
  nachgeholte Marge-Heilung (Messlauf zeigte Marge 1); w4-13/w4-14
  waren schon in Paket 0 bzw. der Design-Runde geheilt. Sechs neue
  Rot-Tests (darunter die beiden Konzept-Pflichten w4-07 gegen den
  Attrappen-Trick und w4-10 gegen beide Ein-Front-Altpläne), Uhren auf
  W4-Faktor 1,4 geeicht. **Zwei Blaupausen ehrlich widerlegt:** Die
  „Wiedervereinigung per Freisprengung" nach Blocker-Split kollabiert in
  diesem Regelwerk (Tür fängt eine Laufrichtung immer von selbst; die
  Fallrichtungs-Weiche des Schachts trägt den Split stattdessen), und
  die Bauer-Kette aus der Grube trägt nie — eine vom Boden steigende
  Rampe hat unter ihren ersten Stufen eine Tasche, wer westlich des
  Fußes pendelt, kommt nie zum Einstieg (gemessen; Bergung darum als
  Sohlen-Stollen). Auch die Raster-Arithmetik des Konzepts war zu
  optimistisch: Ein Bauer steigt 12, ein Kettenglied 10 — „E48 mit zwei
  Bauern" hieße in Wahrheit fünf.
  Pakete 4–5 stehen aus (Meilenstein-Check nach vier Ersatzbauten,
  Strittig 1).

## Grafik

- ✅ Der **Hintergrund im Spiel**: Anmutung **dreidimensionaler und
  moderner** — sechs Maßnahmen nach Grafik-Direktion (Dunst-Höhenverlauf,
  Himmelskörper mit Bloom, Nebelbänke auf eigener Parallaxe-Ebene, Korn
  gegen Banding, Vignette, statische Lichtbahnen), alles vorgebacken,
  `src/render/scene.ts`.
- ✅ **Gelieferte Grafiken eingebaut** (Lieferung in `grafik/`, Aufbereitung
  `scripts/grafik-aufbereiten.py`, Blätter in `src/art/ui/`): drei
  Kulissenbänder (entfärbt, zur Laufzeit je Welt eingefärbt, gespiegelt
  gekachelt — `src/render/kulisse.ts`), Wolkenband, Erd-Reliefkachel
  (nur Boden-Welten, `terrainView.ts`), gemalte Berufsknöpfe, Titelbild +
  Wortmarke (`titel.ts`), Welttafeln als Kopfplatten, Weltembleme
  (Kopfzeile + Torbogen), Bild-Laternen und Belohnungsembleme auf der
  Karte (`weltkarte.ts`). Jeder Abnehmer behält den prozeduralen Rückfall.
  **Bewusst nicht eingebaut:** `avatar_1/2` (nur zwei der zwölf Varianten,
  noch die Zu-gleich-Fassung — wartet auf die korrigierten Prompts aus
  grafikbedarf §3.9), `schirm_2D`/`Schirm_3D.glb` (Thema der
  Backe-Pipeline, §3.10), `symbol` (App-Icon kommt weiter aus dem GLB),
  `tafel` (§3.13, Mechanik fehlt noch), `kulisse_saum` (§3.11 — „erst
  zeigen, dann entscheiden": nimmt Spielfläche).
- ✅ Die **Posenknöpfe unten**: Symbol trägt die Lesbarkeit, Figur bei der
  Arbeit daneben, wo Platz ist (Rückmeldungsrunde nach der Kritik).
- ✅ **Avatare** zur Auswahl: **zwölf gemalte Porträts** vom Blatt
  (`src/art/ui/avatare.webp`, Zeichner `src/render/avatare.ts`, Liste
  `src/profil.ts`) — je Variante eigene Haarfarbe, Haarsilhouette und
  Scheibenfarbe nach der korrigierten Prompt-Liste (grafikbedarf §3.9).
  Die alte Ringfarbwahl bleibt als Rückfall, solange das Blatt nicht
  entschlüsselt ist.
- ✅ Grafikbedarf vom Grafik-Subagenten: `docs/grafikbedarf.md`.

## Spieler und Bestenliste

- ✅ **Spielername + Avatar**, lokal, Profil-Tafel auf der Karte.
- ✅ **Bilanz dieses Geräts** (Level, Sterne) in der Profil-Tafel.
- ⬜ **Weltweite Bestenliste mit Platzanzeige** — braucht Server, Konten und
  geprüfte Ergebnisse. Warum, und wie der saubere Ausbaupfad aussieht
  (Replay der deterministischen Simulation): `docs/bestenliste-entwurf.md`.
