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
  Fassung 2 bereits. Pakete 2–5 stehen aus.

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
