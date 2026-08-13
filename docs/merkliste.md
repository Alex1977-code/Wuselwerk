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
- ⬜ **Feinentklonung, Rest**: w2-03/06/08/10/12 und w3-05 — je eine
  tragende Zahl/Position ändern, bis der geerbte Altplan im Rot-Test
  scheitert (Maßnahmenliste der Design-Runde, Paket 4).

## Grafik

- ✅ Der **Hintergrund im Spiel**: Anmutung **dreidimensionaler und
  moderner** — sechs Maßnahmen nach Grafik-Direktion (Dunst-Höhenverlauf,
  Himmelskörper mit Bloom, Nebelbänke auf eigener Parallaxe-Ebene, Korn
  gegen Banding, Vignette, statische Lichtbahnen), alles vorgebacken,
  `src/render/scene.ts`.
- ✅ Die **Posenknöpfe unten**: Symbol trägt die Lesbarkeit, Figur bei der
  Arbeit daneben, wo Platz ist (Rückmeldungsrunde nach der Kritik).
- ✅ **Avatare** zur Auswahl: sechs Ringfarben um das Porträt
  (`src/profil.ts`) — bewusst Farbwahl statt zweitem Figurenblatt.
- ✅ Grafikbedarf vom Grafik-Subagenten: `docs/grafikbedarf.md`.

## Spieler und Bestenliste

- ✅ **Spielername + Avatar**, lokal, Profil-Tafel auf der Karte.
- ✅ **Bilanz dieses Geräts** (Level, Sterne) in der Profil-Tafel.
- ⬜ **Weltweite Bestenliste mit Platzanzeige** — braucht Server, Konten und
  geprüfte Ergebnisse. Warum, und wie der saubere Ausbaupfad aussieht
  (Replay der deterministischen Simulation): `docs/bestenliste-entwurf.md`.
