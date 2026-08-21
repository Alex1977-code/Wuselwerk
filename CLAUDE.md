# Wuselwerk — Arbeitsregeln

## Prompts werden immer vollstaendig ausgegeben

Wer einen Prompt fuer ein Bild- oder Modellwerkzeug bekommt, bekommt ihn
**ganz und zum direkten Einsetzen** — nie als Ausschnitt, nie als „ersetze
Absatz X durch". Auch dann nicht, wenn sich nur ein Absatz geaendert hat.
Ein Ausschnitt zwingt den Empfaenger, ihn von Hand zusammenzusetzen, und
genau dabei entstehen die Fassungen, die niemand mehr nachvollziehen kann.

Die geltende Fassung steht in `docs/figur-neubau.md` §2 und ist die einzige
Quelle. Wer sie aendert, aendert sie dort und gibt danach den ganzen Block aus.

## Gemessen statt behauptet

Jede Zahl in Kommentar, Commit oder Antwort stammt aus einer Datei, einem
Lauf oder einer Messung — und die Stelle wird genannt. Was sich nicht
belegen laesst, kommt weg oder wird als unsicher gekennzeichnet.

Die Werkzeuge dafuer liegen in `art-src/figur-umbau/`:

| Werkzeug | misst |
|---|---|
| `koerper/silhouette.py` | Breite durch Hoehe bei Spielgroesse |
| `koerper/haaranteil.py` | Anteil des Haares an Hoehe und Flaeche |
| `posen/umrisswechsel.py` | Bewegung je Bildpaar |
| `galerie.mjs` | Musterkarte aller Posen aus dem laufenden Spiel |
| `schuss.mjs` | Bildschirmfoto aus dem laufenden Spiel |
| `schwungprobe.mjs` | aufeinanderfolgende Bilder um ein Ereignis herum |

## Die Lesegrenze

Zwei Merkmale lesen sich bei Spielgroesse erst ab **0,9 logischen Pixeln**
Abstand einzeln. Alles, was feiner geteilt ist, verschmilzt — unabhaengig
davon, wie gut es auf dem Blatt aussieht.
