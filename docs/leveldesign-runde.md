# Die Leveldesign-Runde

Auftrag des Auftraggebers (woertlich): "aus meiner sicht sind die level zu
einfach und wiederholen bereits ab welt 1 sollte anspruchsvoller sein."

Fuenf Beitraege in echter Wechselrede, jeweils gegen die Dateien geprueft:
Leveldesigner-Analyse -> Spielkritiker -> Designer-Antwort (Fassung 2) ->
Marketing-Leitplanken -> finale Synthese. Nichts davon ist umgesetzt; die
Synthese unten ist der abgestimmte Plan.

---

# Beitrag 1 — Leveldesigner: Analyse und Entwurf (Fassung 1)

# Gutachten Schwierigkeitskurve „Wuselwerk" (64 Level)

Quellen: `/home/user/Wuselwerk/src/levels/index.ts`, `welt2.ts`–`welt5.ts`, `welten.ts`, Musterlösungen in `/home/user/Wuselwerk/tests/levels.test.ts` (PLANS).

## 1. Diagnose

**1.1 Verzeihung (Werkzeugausgabe minus Par):** W1 Ø +8,9 · W2 Ø +7,5 · W3 Ø +5,4 · W4 Ø +4,5 · W5 erbt die Quelllisten unverändert. Spitzen ausgerechnet im Finale: w5-14 gibt +14 über Par aus, w5-15 +10, w1-10/w2-12 je +14. Nirgends zwingt der Vorrat zur Musterlösung; der Par-Stern ist die einzige Härte im Spiel.

**1.2 Quote:** Regelfall 60–80 %. In den Prüfungen kippt sie nach unten: w3-10, w3-13 und w5-15 verlangen 6 von 16 (37 %) — im Finale dürfen zehn Figuren verloren gehen.

**1.3 Uhren:** Meist das 2–3-Fache der Planlaufzeit. Wirklich beißend nur w4-12 (70 s) und w3-09 (90 s). W5 „halbiert" ungleichmäßig: w5-15 hat 240 s statt 260 — 8 % schneller ist keine Beschleunigung.

**1.4 Entscheidungen:** Typisch 1–2 echte Entscheidungen pro Musterlösung (Par zählt persönliche Gaben mehrfach: w1-09 „Par 12" = eine Entscheidung, zwölfmal getippt). Maximum im ganzen Spiel: 5 (w4-14). Kein Level verlangt zwei gleichzeitige Baustellen an getrennten Orten; Mehrwege gibt es nicht, Köder sind in W3 angekündigt, aber kaum gebaut, tödliche angekündigte Fallen: null — „Sackgassen strafen mit Warten" gilt bis ins Finale.

**1.5 Klone (Plan wörtlich wiederverwendet, PLANS-Tabelle):** 25 von 64 Leveln (39 %). W2: w2-04=w1-03, w2-07=w1-04, w2-08=w1-08, w2-09=w1-05 (koordinatengleich), w2-10=w1-09, w2-12=w1-10; beinahe: w2-03≈w1-06, w2-06≈w1-07 (nur die Naht verschoben). W3: w3-05=w1-04, w3-09=w2-11. W4: w4-06≈w4-02, w4-12=w4-03, w4-10≈w4-05. W5: alle 15 — w5-01=w4-01, w5-02=w1-01, w5-03=w1-03, w5-04=w1-07, w5-05=w1-08, w5-06=w2-11, w5-07=w2-05, w5-08=w1-05, w5-09=w1-06, w5-10=w2-07, w5-11=w3-06, w5-12=w3-04, w5-13=w3-11, w5-14=w1-10, w5-15=w3-13. Der Schirmregen steht damit viermal im Spiel (w1-04, w2-07, w3-05, w5-10), die Ader-Schacht-Geometrie dreimal (w1-05, w2-09, w5-08), die Grasland-Prüfung dreimal, w2-11/w3-09/w5-06 dreifach.

**1.6 Urteil zu W5:** „Der Schlot erfindet nichts, er beschleunigt" trüge nur, wenn die Beschleunigung die Lösung ändert. Sie tut es messbar nicht: PLANS mappt alle 15 Level auf alte Planfunktionen, der Dateikopf sagt es selbst („gelten wörtlich weiter"). Gleiche Musterlösung = gleiches Rätsel. Dazu sind es Dritt- und Viertaufgüsse von Geometrien, die W2 bereits aufgegossen hat, bei unveränderter Verzeihung und Quote. Der Auftraggeber liest richtig — das ist Wiederholung, keine Identität.

## 2. Entwurf

**2.1 Globale Stellschrauben** (beweisbar, weil deterministisch: Planlaufzeit in Ticks messen, Uhr = Faktor × Planzeit): Überschuss auf Par+3 (W1), +2 (W2/W3), +1 (W4/W5); Uhrfaktor 2,5 / 2,0 / 1,6 / 1,4 / 1,2; Prüfungsquoten ≥ total−4; in W4/W5 releaseRate ≥ 55 bei hoher minReleaseRate — Drosseln darf nicht alles lösen.

**2.2 W2:** Die sechs Klone entklonen: spiegeln, Adern/Nähte verschieben, eine tragende Zahl ändern, bis der W1-Plan im Test scheitert (roter Test = bewiesen anders). Die eigene Weltregel „die Decke gehört zum Level" endlich nutzen: Kletterer-Umkehr am Deckel als Routing-Element.

**2.3 W3:** Beste Substanz (Mehrschritt) — behalten. Die angekündigten Köder wirklich bauen (Gräber vor Stahlsohle); w3-10/w3-13: Quote 6/16 → 10/16.

**2.4 W4:** Quoten anziehen (viele 50-%-Level); w4-14: 8 → 12/16. w4-12 ist das eine Remake, das trägt, weil 70 s wirklich beißen — die Blaupause für W5.

**2.5 W5 als Remix statt Kopie:** Jedes Level kombiniert zwei bewiesene Geometrien (Bausteine koordinatentreu übernehmen, Planfragmente bleiben beweisbar), Uhr 1,2×, Überschuss ≤ Par+1, Quote ≥ total−3. Reine Kopien nur, wo die Uhr den gemütlichen Plan nachweislich entwertet.

**2.6 Fünf Umbauten im Detail:**

- **(a) w1-10:** builder 2, digger 2, basher 2, blocker 1, floater 2 (miner raus); Zeit 180 s; Quote 12/16. Musterlösung unverändert (planLevel10) — Überschuss +14 → +6.
- **(b) w2-09 entklont:** Deckel wie gehabt; Ader 1 Stahl y372, x0–500; Ader 2 y408, x360–960; Tür x420/y382 auf Ader 2. Schacht bei x520–529 (rechts vom Aderende, 68 px Fall < 78), Stollen ~90 px nach links. digger 2, basher 2, blocker 1; Par 2; 120 s; 15/20. Der alte w1-05-Plan (graben bei 690) endet auf Stahl — beweisbar anders.
- **(c) w3-04:** Zeit 130 s (≈1,3× gemessene Planzeit), bomber 2→1, Quote 17/20, Rate 70 bleibt: Jetzt muss gedrosselt, früh geblockt und die Sprengung ins Fenster zwischen Brücke 1 und Pulkankunft gelegt werden.
- **(d) w5-08 als Remix (w1-05 × w3-01):** Stahlplatte y372, x120–940, mit einer sichtbar gefärbten 20-px-Rostlücke bei x520 — Falle mit Vorwarnung: überall sonst steht der Gräber auf Stahl. Sohle y408, x360–960, Tür x420. Grabfenster 9 px < 20-px-Lücke, 68 px Fall, Stollen links. digger 2, basher 2, blocker 1, bomber 1 (Köder: die Platte hat keine Naht); Par 2; 90 s; Rate 60; 17/20.
- **(e) w5-15:** Geometrie behalten, Härte echt machen: climber 8, bomber 2, basher 2 (Rest raus: +10 → +2); Quote 7/16 — der achte Kletterer sprengt sich am Riegel, sieben kommen durch; Zeit ≈170 s (1,25× Planzeit), Rate 75. Plan = planRost13 mit n=8, wörtlich beweisbar.

**2.7 Später (Sim, nur vormerken):** zweite Falltür (echte Doppeltruppen) und steigende Lava als angekündigte Uhr im Schlot.

## 3. Position zu Welt 1

Lehrgang bleibt Lehrgang: w1-01 bis w1-07 nicht anfassen — ein Konzept pro Level, der Überschuss ist dort Didaktik. Härter werden darf das Kapitel „Prüfung": w1-08 Zeit 150 → 120 s; w1-09 climber/floater 8/8 → 7/7; w1-10 wie 2.6(a). Neulinge verliert man an Härte am Anfang, nicht am Kapitelende; Quote bleibt ≤ 80 %, tödliche Fallen bleiben draußen. Das Sterntor vor w1-07 (12 Sterne, `welten.ts`) leistet die eigentliche Arbeit: Es macht die Par-Sterne zum Pflichtstoff — genau deshalb dürfen die drei Prüfungslevel streng sein.

---

# Beitrag 2 — Spielkritiker: Gegenrede

# Spielkritik zum Entwurf (gegen die Dateien geprüft)

**Vorab:** Die Diagnose stimmt. Stichproben bestätigt: w5-04 ist koordinatengleich w1-07 (`welt5.ts` Z.118–128 = `index.ts` Z.208–218), w5-14 = w1-10, w5-15 = w3-13 bis auf 240 statt 260 s; PLANS mappt alle 15 W5-Level auf Altpläne (`levels.test.ts` Z.835–849). Die Umbauten (b) und (d) sind echte Rätselarbeit, (c) ist die richtige Sorte Härte. Der Rest des Entwurfs hält sein eigenes Niveau nicht.

**1. Zu zahm:** Von fünf konkreten Umbauten sind zwei (a, e) nur Vorratskürzung plus Uhr — gleiches Rätsel, weniger Verzeihung. Das globale Programm (2.1) ist fast ausschließlich Uhr/Quote/Überschuss. Bei Ein-Zug-Leveln greift die Uhr gar nicht ins Rätsel: w5-02 (eine Graber-Zuweisung, Sekunde 5) und w5-04 (eine Bombe) bleiben mit 1,2×-Uhr dieselben Aufgaben, nur der Erstversuch wird tödlich. Und der vierfache Schirmregen (w1-04/w2-07/w3-05/w5-10, identischer planLevel4) wird diagnostiziert (1.5) — und von keiner Maßnahme berührt.

**2. Unfair:** (e) w5-15 ist Nullmarge: Nur Kletterer verlassen die Grube, 8 Kletterer minus Sprengopfer = 7, Quote 7 — ein Fehltipp im Rate-75-Pulk = Niederlage = 1 von 5 Tagesleben. `leben-entwurf.md` warnt wörtlich vor „künstlichen Schwierigkeitsspitzen, die Leben fressen" (Kinder- und Familienspiel!); der Entwurf erwähnt das Lebensystem mit keinem Wort. Dazu verletzen 9-px-Grabfenster (2.6 b/d) die hauseigene Touch-Doktrin („ein Tippziel braucht 44", `welten.ts` Z.121). Und die Uhrformel Faktor × optimale Planzeit macht bei 1,2× den Lernversuch systematisch zum verlorenen Leben — „erst sterben, dann verstehen" als Bauprinzip.

**3. Rechenfehler — Entwurf schlägt Unlösbares vor:** 2.3 fordert w3-10 auf 10/16. Unmöglich: Hinter dem Stahlkamm (120 px, Fallgrenze 78) überlebt nur Kletterer+Schirm, je 8 im Vorrat — Maximum 8 Gerettete. Ebenso kollidiert die Regel „Prüfungsquote ≥ total−4" (2.1) mit w3-13/w5-15 (Grubengeometrie deckelt bei ~8) und 2.6(e) widerspricht 2.5 („≥ total−3" = 13, gesetzt: 7). Der Entwurf setzt Quoten, statt sie gegen PLANS nachzurechnen.

**4. Klon-Urteil:** Didaktik ist die *erste* Übersetzung mit neuer Pointe (w2-04 als Kristall-Abgrund: legitim). Faulheit ist der Dritt-Aufguss bei unverändertem Plan/Par/Quote: w5-14 ist die *dritte* Portion w1-10 (nach w2-12), Naht+Riegel steht fünfmal im Spiel (w3-11, w3-13, w4-14, w5-13, w5-15). Das W5-Urteil des Designers ist korrekt — aber seine Therapie liefert für 14 von 15 Leveln nur Zahlenknöpfe.

## Nachforderungen

**K1** W5: Rot-Test als Abnahmekriterium *pro Level* — der geerbte Plan muss unter den neuen Werten scheitern, sonst wird gestrichen. Lieber 10 echte Level als 15 Aufgüsse. Sofortkandidaten: w5-13 (teilt den ganzen Ostflügel mit w5-15) und w5-10 (vierter Schirmregen).

**K2** w5-02/w5-04: Uhrformel dort verboten — Ein-Zug-Level brauchen neue Geometrie oder fliegen; Beispiel: w5-04 mit *zwei* Nähten, nur eine liegt über der Halle.

**K3** Alle neuen Quoten (w3-10, w3-13, w4-14, w5-15) gegen die Vorratsobergrenzen der Geometrie nachrechnen und per Plan beweisen, bevor sie in den Entwurf kommen.

**K4** w5-15: Marge ≥ 1 Figur (climber 9 oder Quote 6), Rate ≤ 60 — oder Niederlage im Finale kostet kein Leben.

**K5** Grabfenster ≥ 20 px sichtbar gefärbt (wie 2.6 d, gut) statt 9-px-Blindpicks (2.6 b); Präzision gehört ins Terrain, nicht in den Daumen.

**K6** Selbstdiagnose 1.4 einlösen: mindestens zwei Level mit zwei *gleichzeitigen* Arbeitsfronten — heute machbar per Blocker-Split (planLevel3 sprengt den Blocker längst frei), z. B. Umbau w4-10 (zwei Wächterkanten existieren). Nicht auf die zweite Falltür (2.7) vertagen.

**K7** Je ein konkretes Level (Koordinaten + Plan) für die fehlenden Rätseltypen: sichtbare-aber-unverstandene Lösung, attraktive Falschlösung, Release-Rate als Lösungselement (Regler existiert: minReleaseRate), Kletterer-Deckel-Routing (2.2 ist bisher Parole).

**K8** Uhrfaktor W5 ≥ 1,5 statt 1,2 — oder: Scheitern *allein an der Uhr* (Quote sonst erreicht) kostet kein Leben. Härte darf Denken bestrafen, nicht das Kennenlernen.

---

# Beitrag 3 — Leveldesigner: Antwort, Fassung 2 (Delta)

# Antwort des Leveldesigners — Fassung 2 (Delta)

Alle Zitate gegen die Dateien geprüft; Testlauf `tests/levels.test.ts` heute grün (70/70), alle Aussagen zu PLANS bleiben belegbar.

## Zu den Nachforderungen

**K1 — angenommen.** Rot-Test wird Abnahmekriterium pro W5-Level: geerbter Plan muss unter neuen Werten scheitern, sonst fliegt das Level. w5-10 (vierter Schirmregen) und w5-13 (Ostflügel-Doppel zu w5-15) werden gestrichen und ersetzt; W5 darf auf 12 Level schrumpfen. Die Sterntore (vor w1-08 und w3-08, `welten.ts` Z.221/256) liegen beide vor W5 — die Sternökonomie bleibt unberührt. Zusätzlich w3-05 entklonen: Schirmregen dann 2× statt 4×.

**K2 — angenommen.** w5-02/w5-04 bekommen neue Geometrie, siehe K7(iii).

**K3 — angenommen, mit Korrektur.** Der Rechenfehler ist real: w3-10 deckelt bei 8 (climber 8/floater 8, `welt3.ts` Z.295; Stahlkamm 120 px, Z.304, dahinter tödlicher Fall — nur die Doppelbegabten überleben). Neu: w3-10 8/16. Die Pauschalregel „Prüfungsquote ≥ total−4" (2.1) wird gestrichen und ersetzt durch eine Messregel: **Quote = im Testlauf gemessene Rettungszahl der Musterlösung minus Marge (Prüfungen: Marge 1–2)**. Keine Quote kommt mehr ohne Messung in den Entwurf.

**K4 — angenommen.** w5-15: climber 9, Quote 7, Rate 60 (Marge 2 Fehltipps). Plan = planRost13 mit n=9 (`levels.test.ts` Z.508 ff.), weiter wörtlich beweisbar.

**K5 — angenommen.** (b) wird auf das Muster von (d) umgebaut: sichtbar gefärbte Rostlücke ≥ 24 px statt 9-px-Blindfenster. Die 44-px-Doktrin (`welten.ts` Z.121) gilt künftig als Baugesetz für jedes Zielfenster.

**K6 — angenommen.** w4-10 „Vier Kanten" ist der Kandidat: zwei offene Kanten existieren (`welt4.ts` Z.295–298), digger 4/blocker 3 liegen bereit. Umbau: Uhr 220→150 s, Rate 55/min 30 — beide Wächter müssen stehen, *während* der Schacht gegraben wird; nacheinander reicht die Uhr nicht. Blocker-Freisprengung ist als Planmechanik bewiesen (planLevel3, `levels.test.ts` Z.73–77). Zweites Doppelfront-Level: ein W5-Ersatz aus K1.

**K7 — angenommen, drei konkrete Level für vier Typen:**
- *(i) Release-Rate als Lösung* — w2-05 v2 „Taktgeber": Geometrie bleibt, Uhr 100 s (Planzeit bei Rate 45 länger). Lösbar nur: bei Start auf minReleaseRate 25 drosseln, nach Brückenschluss auf 99. Beweisbar: `w.setReleaseRate` existiert (`sim.test.ts` Z.298), Plan = Altplan + zwei Rate-Aufrufe.
- *(ii) Deckel-Routing + sichtbare-aber-unverstandene Lösung* — neues w2-13 „Unterm Deckel": Exit sichtbar auf Podest y150 (x560–640), direkter Weg tödlich (120-px-Abgrund, keine Schirme). Wand x600 von Sohle bis Deckel y84; Kletterer kehrt am Deckel um und fällt 66 px < 78 aufs Podest. climber 3, blocker 1, Par 2.
- *(iii) Attraktive Falschlösung* — w5-04 v2 (erfüllt K2): zwei sichtbare Nähte, die nähere liegt über Stahlsohle (Bombe verpufft sichtbar), nur die fernere über der Halle. bomber 2 — ein Irrtum erlaubt.

**K8 — Alternative angenommen.** Ich übernehme die angebotene Herzschutzregel statt Faktor 1,5: **Niederlage allein an der Uhr (Quote sonst erreicht) kostet kein Leben** — wird in `leben-entwurf.md` verankert, passt zu dessen Warnung vor lebensfressenden Spitzen. W5-Uhrfaktor moderat auf 1,4.

**Abwehr (einziger Punkt):** Kritik 1 trifft (e), aber nicht (a). w1-10 ist das Abschluss-Prüfungslevel des Lehrgangs — eine Prüfung fragt Gelerntes unter Knappheit ab, sie stellt nichts Neues. „Gleiches Rätsel, weniger Verzeihung" ist dort Absicht, nicht Faulheit. (a) bleibt.

## Delta-Übersicht

**Bleibt:** Diagnose; W1-Position (w1-01–07 unangetastet, (a) unverändert); (c) und (d) wörtlich; W3-Substanzurteil; Stellschrauben Überschuss/Uhrfaktoren W1–W4.

**Geändert:** Quotenformel → Messregel (K3); w3-10 8/16, w3-13/w4-14-Quoten erst nach Messung; (b) mit 24-px-Sichtfenster; (e) 9/7/Rate 60; W5: Rot-Test-Abnahme, 1,4×, w5-10/w5-13 raus, ggf. 12 Level.

**Neu:** w4-10 v2 (Doppelfront), w2-13 (Deckel-Routing), w2-05 v2 (Rate), w5-04 v2 (Falschlösung), Herzschutzregel im Lebenssystem.

---

# Beitrag 4 — Marketing-Manager: Leitplanken

# Marketing-Stellungnahme zu Fassung 1+2 (Schwierigkeitsoffensive)

Gelesen: `docs/leben-entwurf.md`, `docs/merkliste.md`, `src/levels/welten.ts` (Sterntore: vorIndex 6/12 Sterne in W1, vorIndex 7/40 Sterne in W3).

## 1. Retention vs. Frust — die Rechnung

Eine Sitzung sind 10–15 Minuten, also 5–8 Levelversuche. Heute sind echte Niederlagen selten (der 13-s-Rücklauf fängt Fehler im Level ab) — 5 Leben binden praktisch nie. Nach der Verschärfung gilt: Bei Erstversuch-Niederlagenquote p endet der Tag nach ~5/p Versuchen. p=20 % → 25 Versuche, unkritisch. p=40 % → Budget leer in Sitzung 2. p=60 % → Tag endet nach ~15 Minuten, mitten in der Frust-Schleife, letzter Eindruck des Tages: Niederlage. Genau das nennt der Leben-Entwurf wörtlich als verbotene „künstliche Schwierigkeitsspitze".

Kritischster Punkt der Fassung 2: **Marge 1 bei der Messregel heißt ein Fehltipp = Niederlage.** Als Prüfungshärte legitim, als Regelfall ein Leben-Fresser. Die Herzschutzregel (K8) ist dagegen die wichtigste Zusage des Designers an die Retention: Sie macht die Uhr — den Hauptträger der neuen Härte (Faktor 2,5→1,2/1,4) — lebensneutral. Sie muss **vor** den Verschärfungen live sein, nicht danach.

Onboarding: w1-01–07 unantastbar — der Designer sagt das selbst, ich nagle es fest. Die Erstsitzung reicht bis ~w1-08; w1-08 mit 120 s ist nur mit aktiver Herzschutzregel akzeptabel. (a) w1-10 trage ich mit: +6 über Par ist noch verzeihend, und das 12-Sterne-Tor davor hat den Spieler bereits trainiert.

## 2. Wo Schwierigkeit dem Geschäft nützt

Der Par-Stern ist unsere einzige Re-Engagement-Mechanik, die der Leben-Entwurf erlaubt (keine Push-Nachrichten, keine Timer). Verknappung auf Par+1/+2 macht den dritten Stern echt — und das 40-Sterne-Tor vor w3-08 erzeugt dann organisch Tages-Wiederkehr über Nachsammeln alter Level: Gratis-Content-Verlängerung. Zahlt voll ein.

Ebenfalls einzahlend: die **neuen Mechaniken** (w2-13 Deckel-Routing, w2-05 v2 Taktgeber, w4-10 Doppelfront, w5-04 sichtbare Falschlösung). Das sind teilbare Aha-Momente — Mundpropaganda entsteht aus „ich hab's kapiert", nie aus „die Uhr war knapper". Reine Zahlenverschärfung bindet nicht, sie filtert nur.

**Zum W5-Klonkonzept:** 15/15 Kopien ist ein Bewertungs-Killer. Rezensionen schreiben überproportional die, die durchspielen oder am Ende abspringen — „ab Welt 5 wiederholt sich alles" ist die klassische 3-Sterne-Rezension, die Installs kostet. Remix + Rot-Test-Abnahme ist richtig; **12 ehrliche Level schlagen 15 mit Kopien.** Streichung von w5-10/w5-13: volle Zustimmung. Nur: Wo „64 Level" beworben wird, muss die Zahl mitziehen oder Ersatz kommen.

## 3. Leitplanken

**M1** — Lehrgang lebensfrei: In w1-01–07 kostet keine Niederlage ein Leben; Werte dieser Level eingefroren.

**M2** — Herzschutzregel (Uhr-Niederlage bei erreichter Quote = kein Lebenabzug) wird in `leben-entwurf.md` verankert und **vor** jeder Levelverschärfung ausgeliefert.

**M3** — Erstversuch-Niederlagenquote (Playtest, später Telemetrie): erstes Drittel jeder Welt < 35 %, Prüfungslevel ≤ 60 %; kein Level darf im Schnitt mehr als 2 Leben pro Spieler und Tag kosten, sonst Rückbau.

**M4** — Quoten-Marge ≥ 2 als Regelfall; Marge 1 nur in maximal einem Prüfungslevel pro Welt.

**M5** — Keine unangekündigte Tödlichkeit: jede Falle sichtbar markiert (24-px-Regel, verpuffende Bombe als Lehrsignal); jede neue Härte-Mechanik debütiert in einem Level, dessen Niederlage per M1/M2 kein Leben kostet oder das direkt hinter einem Sterntor liegt.

**M6** — W5: Rot-Test bleibt Abnahmekriterium ohne Ausnahme; lieber 12 Level als Kopien; Levelzahl-Kommunikation (Store, Titel) wird angepasst.

**M7** — Keine Wertänderung ohne Messlauf: Tick-Messung der Musterlösung vor dem Entwurf (K3-Messregel), dokumentierte Marge, und nach Launch beobachtete Niederlagenquoten mit ausdrücklicher Erlaubnis zum Zurückdrehen.

Gesamturteil: Fassung 2 ist geschäftlich tragfähig — der Designer hat an den richtigen Stellen nachgegeben (Messregel, Herzschutz, Rot-Test). Meine Bedingungen sind M1–M3 als Auslieferungsreihenfolge, nicht als Wunschliste.

---

# Beitrag 5 — Leveldesigner: Finale Synthese (der Plan)

# Finaler Plan: Schwierigkeitskurve „Wuselwerk" (Fassung 3, verbindlich)

Verrechnet: Fassung 2, Spielkritik K1–K8, Marketing M1–M7. Konfliktentscheidungen stehen kursiv im Text, je ein Satz.

## (a) Leitsätze

1. Härte entsteht aus Rätseln, nicht aus Zahlen: Jede Verschärfung braucht eine neue Entscheidung im Lösungsplan, sonst unterbleibt sie — Uhr, Quote und Überschuss sind Begleiter, nie Träger.
2. Kein Wert ohne Messung: Quote = im Testlauf gemessene Rettungszahl der Musterlösung minus Marge, Uhr = Faktor × gemessene Planzeit (2,5/2,0/1,6/1,4/1,4), Überschuss = Par+3/+2/+2/+1/+1. *Konflikt Marge: M4 schlägt meine Messregel-Marge 1 — Regelfall Marge ≥ 2, Marge 1 höchstens in einem Prüfungslevel je Welt, weil ein Familienspiel keine Nullmargen verkauft.*
3. Kein Klon in dritter Portion: Zweitübersetzung mit neuer Pointe ist Didaktik, Drittaufguss fliegt; Rot-Test (der geerbte Plan scheitert unter den neuen Werten, sonst wird gestrichen) ist Abnahmekriterium für jedes veränderte Level.
4. Härte kostet Denkzeit, nie Kennenlern-Leben: Herzschutzregel (Uhr-Niederlage bei erreichter Quote = kein Lebensabzug) und lebensfreier Lehrgang w1-01–07 gehen **vor** jeder Verschärfung live. *Konflikt Reihenfolge: M2 gewinnt gegen „parallel ausliefern" — ohne Herzschutz wird der 1,4×-Erstversuch systematisch zum verlorenen Leben.*
5. Präzision gehört ins Terrain, nicht in den Daumen: Zielfenster ≥ 24 px, sichtbar gefärbt; die 44-px-Tippdoktrin (`welten.ts`) ist Baugesetz; jede Falle ist angekündigt.
6. w1-01–07 bleiben eingefroren; die Kurve steigt an Kapitelenden und je Welt, nie am Weltanfang.
7. Jede Welt bekommt mindestens eine Mechanik, die es vorher nicht gab (Rate-Regler, Deckel-Routing, Doppelfront, Falschlösung) — Aha-Momente binden, knappere Uhren filtern nur.

## (b) Maßnahmenliste

| Level | Maßnahme | Wie |
|---|---|---|
| w1-08 | schärfen | Zeit 150→120 s — erst nach Live-Gang der Herzschutzregel |
| w1-09 | schärfen | climber/floater 8/8→7/7 |
| w1-10 | schärfen | Vorrat builder 2/digger 2/basher 2/blocker 1/floater 2, 180 s, Quote 12/16; Plan bleibt planLevel10 |
| W1 | unverändert: | w1-01–07 (M1, Werte eingefroren, lebensfrei) |
| w2-03/06/08 | schärfen | je eine tragende Zahl/Position ändern, bis der W1-Altplan im Test rot ist |
| w2-05 | umbauen | Blaupause 2 „Taktgeber" |
| w2-09 | umbauen | Adern versetzen + Schacht mit 24-px-Sichtlücke nach Muster Blaupause 5; Par 2, 120 s, 15/20 |
| w2-10 | schärfen | spiegeln, Stahlhaut 40 px versetzen, bis w1-09-Plan rot |
| w2-12 | schärfen | Schlucht- und Deckelkante verschieben bis planLevel10 rot; Uhrfaktor 2,0 |
| w2-13 | NEU | Blaupause 1 „Unterm Deckel" |
| W2 | unverändert: | w2-01, w2-02, w2-04, w2-07, w2-11 (Erstübersetzungen mit eigener Pointe) |
| w3-04 | schärfen | 130 s, bomber 2→1, Quote 17/20, Rate 70 bleibt |
| w3-05 | umbauen | Schirmregen entklonen (Schachtlage + Blockerpflicht), planLevel4 muss rot sein |
| w3-06/07 | schärfen | Köder nachrüsten (je +1 Gräber vor Stahlsohle), Par unverändert |
| w3-10 | schärfen | Quote 8/16 (Geometriedeckel: nur climber+floater überleben den Kamm) |
| w3-13 | schärfen | Quote erst nach Messlauf, Marge 2 |
| W3 | unverändert: | w3-01–03, 08, 09, 11, 12 (Mehrschritt-Substanz) |
| w4-02/04/05 | schärfen | 50-%-Quoten per Messregel anziehen, Marge ≥ 2 |
| w4-10 | umbauen | Blaupause 3 „Vier Kanten v2" (Doppelfront) |
| w4-14 | schärfen | Quote nach Messlauf (Ziel 12/16, erst rechnen — K3) |
| W4 | unverändert: | w4-01, 03, 06–09, 11–13; w4-12 bleibt wörtlich (das Remake, das trägt) |
| w5-02 | umbauen | zweiter Ascheschacht, nur einer liegt über der Tür — Ein-Zug wird Entscheidung |
| w5-04 | umbauen | Blaupause 4 „Heiße Naht v2" (Falschlösung) |
| w5-08 | umbauen | Blaupause 5 „Doppelader v2" (Remix) |
| w5-10 | ersetzen | vierter Schirmregen raus → neues Doppelfront-Level (zweites zu K6) |
| w5-13 | ersetzen | Ostflügel-Doppel zu w5-15 raus → neues Rate-Regler-Level |
| w5-14 | ersetzen | dritte Portion w1-10 raus → Remix aus zwei W4-Bausteinen (Kaskade × Klamm-Brücke) |
| w5-15 | schärfen | climber 9, bomber 2, basher 2, Quote 7/16, Rate 60, ~170 s; Plan = planRost13 mit n=9 |
| w5-01/03/05/06/07/09/11/12 | schärfen | Uhrfaktor 1,4, Überschuss ≤ Par+1; Abnahme nur bei rotem Altplan, sonst ersetzen |

## (c) Fünf Umbau-Blaupausen

**1. w2-13 „Unterm Deckel" (neu — Deckel + sichtbare, unverstandene Lösung).** 720×540. Deckel x0/y60/720×24 (Unterseite y84). Boden West: x0/y330/600×210, Eingang x90/y280. Wand x600/y144/26×396, Westflanke Stahlhaut x600/y144/8×396; Krone y144, Spalt zum Deckel 60 px. Ostboden erhöht x626/y214/94×326; Tür x660/y194/32×26 (6 px im Boden, ab Sekunde 1 sichtbar). Werkzeuge: climber 8, builder 3 (Köder), blocker 1; total 10, Quote 6 (Marge 2); 120 s; Rate 40/min 25; Par 6. Lösung: Kletterer der Reihe nach zuweisen — sie erklettern x600, laufen über die 26-px-Krone, fallen 70 px (< 78) auf y214, Tür. Falschlösung: Die Brückenkette steigt, stößt am Deckel y84 an, der Bauer dreht um — sichtbar verpufft, niemand stirbt; die Decke *verbietet* den Bauweg, genau das ist ihr Debüt als Bauteil. (Die Kletterer-Umkehr am Deckel selbst bleibt vorgemerkt, bis eine Sim-Probe das Fallverhalten misst.)

**2. w2-05 v2 „Taktgeber" (Rate als Lösung).** Geometrie wörtlich wie heute (Deckel y70; Boden x0/y300/720×240; Kammer x100/y410/180×70 EMPTY; Eingang 560/240, Tür 150/454). Neu: 100 s statt 150; minReleaseRate 20. Werkzeuge miner 2, blocker 1 (digger raus); Par 1. Lösung: (1) sofort Rate auf 20 drosseln — der Pulk bleibt klein, niemand verpendelt Wegzeit vor der ungeöffneten Kammer; (2) Bagger bei x430, 2:1-Schräge bricht bei x208 in die Kammerdecke; (3) Rate auf 99 — die Nachzügler fallen direkt in die fertige Schräge. Abnahme: Plan mit Rate-Zügen grün, Altplan ohne sie rot (Uhr im Messlauf so kalibrieren, dass genau das gilt). Rate-Züge kosten kein Par — der dritte Stern bleibt erreichbar.

**3. w4-10 v2 „Vier Kanten" (Doppelfront).** Geometrie wörtlich (Deckel y60; Etage x0/y220/480×58; Terrasse x120/y290/240×330 mit Tür x224/y270; Tiefböden y520 beidseits — Kantenfall 230 px, angekündigt tödlich, Pulk startet eingezäunt auf der Etage). Neu: 150 s statt 220; Rate 55/min 30; digger 3, blocker 2; Par 4; Quote nach Messlauf (Ziel 12/16, Marge ≥ 2). Lösung: (1) Rate auf 30; (2) Schacht A bei x150 durch die Etage; (3) erster Gelandete wird Wächter an der Westkante x130; (4) noch während A läuft Schacht B bei x330; (5) erster B-Gelandete Wächter an der Ostkante x345; Pulk sickert durch beide Schächte zur Tür. Die Uhr ist so bemessen (Messlauf), dass Nacheinander-Arbeit scheitert — das erste Level mit zwei gleichzeitigen Arbeitsfronten, per Blocker-Mechanik längst bewiesen (planLevel3).

**4. w5-04 v2 „Heiße Naht" (attraktive Falschlösung).** 720×540, Eingang x100/y300, Tür x420/y386 begraben. Narbe x0/y339/720×2 EARTH; Platte x0/y341/720×3 STEEL. Naht A x260/y341/4×3 EARTH — darunter Stahlsohle x236/y344/52×10 STEEL, **sichtbar stahlgrau gefärbt (24-px-Regel)**: Die Sprengung öffnet die Platte, der Krater endet auf Metall, verpufft sichtbar, kostet nur den Sprengmeister. Naht B x455/y341/4×3 EARTH über Erdreich (ground x0/y405/720×135); Krater bei B legt die Tür frei. Beide Nähte tragen 24-px-Rostränder. Werkzeuge: bomber 2 (ein Irrtum erlaubt), digger 1, blocker 1; Par 1; 90 s; Rate 50/min 25; total 20, Quote nach Messlauf (Ziel 14–16, Marge ≥ 2). Rot-Test: Altplan sprengt bei x351 — dort ist keine Naht mehr.

**5. w5-08 v2 „Doppelader" (Remix w1-05 × w3-01).** 960×540, Eingang x160/y280, Tür x420/y390/32×24 (6 px in der Sohle). Boden x0/y340/960×200 EARTH; Platte x120/y372/820×14 STEEL mit **24-px-Rostlücke** x520/y372/24×14 EARTH, rostrot gefärbt — überall sonst steht der Gräber auf Stahl; Sohle x360/y408/600×12 STEEL. Werkzeuge: digger 2, basher 2, blocker 1, bomber 1 (Köder: die Platte hat keine Naht); Par 2; 90 s; Rate 60/min 30; total 20, Quote nach Messlauf (Ziel 17/20). Lösung: (1) Gräber in der Lücke — Schacht y340→408, 68 px Fall < 78; (2) Rammer auf der Sohle 68 px nach links zur Tür; Pulk fällt nach und folgt dem Stollen. Rot-Test: der w1-05-Plan gräbt rechts vom alten Aderende x600 und endet hier auf der durchgehenden Platte.

## (d) Reihenfolge

- **Paket 1 — Fundament (≈2–3 Tage, größter Effekt je Aufwand):** Herzschutzregel + lebensfreier Lehrgang in `leben-entwurf.md` verankern und implementieren (M1/M2); Messwerkzeug: Tick-Laufzeit und Rettungszahl jeder Musterlösung als Testreport; Rot-Test-Harness. Ohne dieses Paket ist keine Verschärfung auslieferbar.
- **Paket 2 — Zahlenpass W1–W4 (≈2 Tage):** w1-08/09/10, Überschuss- und Uhrfaktoren, alle Quoten per Messregel (w3-10 8/16 usw.), w3-04, w5-15-Werte; reine Datenänderungen plus Testanpassung.
- **Paket 3 — Neue Mechaniken (≈4–5 Tage):** die fünf Blaupausen plus w2-09; je Level neuer Musterlösungsplan in PLANS, Sim-Probe für die Deckel-Umkehr.
- **Paket 4 — Sanierung & Entklonung (≈4–6 Tage):** Rot-Test-Abnahme aller W5-Level, Ersatz für w5-10/w5-13/w5-14, w2/w3-Entklonungen, Store-Text-Abgleich.

## (e) Offene Entscheidungen (Auftraggeber)

1. **Levelzahl:** 64 halten (drei Ersatzlevel in Paket 4) oder auf 61 schrumpfen und die Kommunikation anpassen? *Empfehlung: 64 halten — drei ehrliche Ersatzlevel sind billiger als jede Änderung der beworbenen Zahl (M6).*
2. **Reichweite der Herzschutzregel:** nur Uhr-Niederlagen lebensneutral, oder auch knapp verfehlte Quote (eine Figur)? *Empfehlung: nur Uhr — eindeutig messbar und nicht ausnutzbar; Quoten-Gnade leisten die Margen aus M4.*
3. **Finale w5-15:** Marge 2 (climber 9, Quote 7, Rate 60) oder zusätzlich lebensneutrale Niederlage im Finallevel? *Empfehlung: Marge 2 genügt — die Uhr kostet dort dank Herzschutz ohnehin kein Leben, und ein Finale darf beißen.*

---

