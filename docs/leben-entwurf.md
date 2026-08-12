# Leben und Versuche — Entwurf und Begründung

Stand: August 2026. Umgesetzt in `src/leben.ts` (Regeln) und `src/game.ts`
(Verbuchung, Chip, Tafel). Die Merkliste verlangte: begrenzte Versuche pro
Tag, ein Fenster mit „Video ansehen" bei leerem Vorrat, später kaufbare
Pakete, Testmodus unbegrenzt — und dass ein **Marketing-Subagent**
untersucht, wie viele Leben es täglich sein sollen. Dieses Dokument ist das
Ergebnis dieser Untersuchung und die daraus abgeleiteten Entscheidungen.

## Empfehlung: 5 Leben pro Tag

Fünf ist der Genre-Anker (Candy Crush, Royal Match und Gardenscapes nutzen
alle fünf) und wird von Spielern intuitiv verstanden. Entscheidend für
Wuselwerk: Der 13-Sekunden-Zeitrücklauf fängt die meisten Fehler bereits
**im** Level ab — echte Niederlagen sind deutlich seltener als im
Match-3-Genre, und Siege kosten nichts. Fünf Leben decken damit realistisch
zwei bis drei Sitzungen à 10–15 Minuten ab; die Grenze trifft fast nur die
„Frust-Schleife" (immer wieder am selben Level scheitern), also genau die
Stelle, an der eine Pause ohnehin sinnvoll ist. Bei erst 22 (später 64)
Leveln bremst das Budget nebenbei den Content-Verbrauch. Weniger (drei)
fühlt sich geizig an, mehr (acht bis zehn) macht das System wirkungslos.

## Regeln

| Frage | Antwort |
|---|---|
| Wann wird abgezogen? | Nur bei **explizit verlorenem** Level — und bei Abbruch/Neustart **nach** der Schnupperfrist von 30 s, sonst umgeht man den Verlust per Aufgeben. Die ersten 30 s sind frei: Reinschnuppern kostet nichts. |
| Doppelt zählen? | Nie. Ein Levellauf verbucht höchstens ein Leben (`lebenVerbucht`), auch wenn auf den Abbruch noch eine Niederlage folgt. |
| Auffüllung | **Voll-Reset um Mitternacht** (lokale Gerätezeit). Keine Regeneration über den Tag, kein Countdown. |
| Video | 1 Video = 1 Leben, sofort spielbar. **Höchstens 3 pro Tag.** Danach freundlich: „Genug gewuselt für heute — morgen geht's weiter!" statt weiterer Angebote. |
| Testmodus | `?test` in der Adresse: System vollständig aus, keine Anzeige. |
| Käufe | Merkliste, nicht Gegenwart. Nichts davon ist eingebaut. |

## Warum Tagesbudget statt Regeneration

Zeit-Regeneration (1 Leben je 30 min) ist eine Re-Engagement-Mechanik: Sie
soll Spieler mehrfach täglich zurückholen und passt zu Spielen mit hoher
Fehlschlagsrate und endlosem Content. Wuselwerk hat beides nicht: Der
Zeitrücklauf übernimmt die Fehlerverzeihung bereits im Level, und der
Levelvorrat ist begrenzt. Das Tagesbudget ist zudem für Eltern und Kinder
transparent („heute ist Schluss, morgen gibt es neue"), wirkt als
natürliche, gesunde Spielzeitgrenze statt als Terminwecker, und ist
technisch wie kommunikativ simpler: ein Reset statt einer Timer-Anzeige.

## Zwei Warnungen (Kinder- und Familienspiel)

1. **Keine Rewarded Ads ohne Elternschranke.** „Video ansehen für Leben"
   gegenüber einem frustrierten Kind ist ein Dark Pattern und kollidiert mit
   Google-Play-Families-Policy / COPPA / DSGVO-K. Sobald echte Werbefilme
   eingebaut werden, gehört die Video-Option hinter ein Parental Gate — oder
   sie fliegt raus, und das Budget steigt dafür auf sechs bis sieben Leben.
   **Bis dahin läuft kein Film:** Der Knopf sagt ehrlich „In dieser Fassung
   ohne Werbefilm — der Tipp genügt."
2. **Kein Druck- und Rückhol-Marketing.** Keine Countdown-Timer („nächstes
   Leben in 27:14"), keine Push-Nachrichten („Deine Leben sind zurück!"),
   keine künstlichen Schwierigkeitsspitzen, die Leben fressen und in den
   Kauf treiben. Leben dürfen Pausen erzeugen — nie Kaufdruck oder
   Termin-Zwang.

## Bau

- `src/leben.ts` — Regeln als reine Funktionen (`tests/leben.test.ts`
  rechnet sie nach), Speicher unter `wuselwerk.leben.v1` mit derselben
  Vorsicht wie der Fortschritt: ohne `localStorage` gibt es einfach jeden
  Tag frische Leben.
- Anzeige: Herz-Chip oben rechts auf der Karte; die Tafel erscheint erst,
  wenn ein Level **gestartet** werden soll und der Vorrat leer ist — nicht
  beim blossen Ansehen der Karte.
