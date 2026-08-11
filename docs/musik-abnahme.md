# Abnahme: die Melodien

**Stand:** abgenommen. Rückmeldung im Wortlaut: *„melodie passt, merken"*.

Dieses Dokument hält fest, was abgenommen ist, damit es nicht bei der nächsten
Änderung am Klang unbemerkt mitwandert. Die Melodien sind ab hier **gesetzt**:
Wer sie ändern will, fragt vorher. Alles andere an der Musik — Instrumentierung,
Begleitung, Groove, Mischung — ist ausdrücklich **nicht** mit abgenommen und darf
weiterentwickelt werden.

Quelle: `src/audio/music.ts`, Konstante `STUECKE`.
Abgesichert durch: `tests/musik.test.ts`.

---

## 1. Was genau abgenommen ist

| abgenommen | nicht abgenommen |
|---|---|
| die Tonfolgen beider Stücke | welche Stimme sie spielt |
| die Notenlängen und der Phrasenbau | Tempo, Lautstärke, Klangfarbe |
| die Akkordfolge je Takt | Begleitfiguren, Perkussion, Bass |
| die Tonart und der Ambitus | Mischung und Nachhall |

---

## 2. Welt 1 — Wiese

C-Dur mit lydischer Farbe, Grundton 261,63 Hz.

Das Tempo steht hier bewusst **nicht** mehr: Es ist laut Tabelle oben nicht mit
abgenommen, und es hat sich seither geändert (126 → 120, siehe
`docs/klangdesign.md` §4). Eine Zahl, die in zwei Dokumenten steht und nur in
einem gepflegt wird, ist schlimmer als keine. Der geltende Wert steht in
`STUECKE`.
Halbtöne über dem Grundton; die Zahl in Klammern ist die Länge in Achteln.

| Takt | Melodie | Akkord |
|---|---|---|
| 1 | G(2) G(1) A(1) G(2) E(2) | C |
| 2 | F(2) E(2) D(3) —(1) | F |
| 3 | G(2) G(1) A(1) G(2) C′(2) | C |
| 4 | H(2) A(2) G(4) | G |
| 5 | C′(2) H(1) A(1) G(2) **Fis**(2) | C |
| 6 | G(4) E(2) D(2) | G |
| 7 | G(2) G(1) A(1) G(2) E(2) | F |
| 8 | D(2) E(2) C(4) | G |

**Warum sie trägt.** Das Kopfmotiv **G–G–A–G** steht in Takt 1, 3 und 7 und wird
jedes Mal anders weitergeführt: einmal abwärts nach E, einmal aufwärts nach C′,
einmal nach Hause. Nicht die Menge der Töne macht eine Melodie, sondern die
Wiederkehr — beim dritten Mal weiß das Ohr schon, was kommt, und wird dann doch
überrascht.

Das **Fis** in Takt 5 ist die übermäßige Quarte, die lydische Farbe. Ein einziger
Ton außerhalb der Tonleiter gibt einem Achttakter mehr Gesicht als jede
Verzierung.

Takt 8 steht auf der **Dominante**, während die Melodie schon auf dem Grundton
liegt. Diese Reibung zieht die Schleife herum; ein Stück, das auf seinem eigenen
Schlusston zur Ruhe kommt, fängt nicht wieder an.

---

## 3. Welt 2 — Höhle

A-dorisch, Grundton 220 Hz. Zum Tempo siehe die Anmerkung bei Welt 1.

| Takt | Melodie | Akkord |
|---|---|---|
| 1 | A(2) C(2) D(2) E(2) | Am |
| 2 | D(2) C(2) H(4) | G |
| 3 | A(2) C(2) D(2) G(2) | Am |
| 4 | **Fis**(4) E(4) | D |
| 5 | A′(2) G(2) Fis(2) E(2) | G |
| 6 | D(4) C(4) | C |
| 7 | A(2) C(2) D(2) C(2) | D |
| 8 | H(2) A(6) | Am |

**Warum sie trägt.** Derselbe Bau, andere Tonleiter. Das Kopfmotiv **A–C–D**
kehrt in Takt 1, 3 und 7 wieder — dreitönig, nicht viertönig: Der vierte Ton ist
genau die Stelle, an der variiert wird.

Der Unterschied zwischen dorisch und Moll ist ein einziger Ton, die **große
Sexte (Fis)**. Sie steht an der auffälligsten Stelle des Stücks: Takt 4, allein,
lang gehalten, über einem D-Dur-Akkord. Dorisch ist die Tonart, die traurig
anfängt und dann doch nicht traurig ist — das passt zu einer Höhle, die
neugierig sein soll und nicht bedrohlich.

---

## 4. Herkunft und Rechte

Beide Melodien sind **eigene Kompositionen**. Aus dem Vorbild von 1991 ist
weder eine Melodie noch ein Klang übernommen.

Das Rezept jenes Spiels — gemeinfreie Volkslieder und Klassik neu arrangieren —
ist nachgemacht, nicht das Ergebnis: Eine Melodie aus dem 18. Jahrhundert ist
frei, ein fremdes Arrangement davon nicht, und die eigenen Melodien jenes Spiels
erst recht nicht.

---

## 5. Was die Tests festhalten

`tests/musik.test.ts` prüft am Notentext, was still kaputtginge:

1. **Jeder Takt ist genau voll.** Ein Takt mit neun Achteln verschöbe die
   Melodie ab dem zweiten Durchlauf für immer gegen die Akkorde — man hörte nur,
   dass etwas nicht stimmt, ohne zu wissen, was.
2. **Das Kopfmotiv kehrt wieder** (mindestens zweimal, gemessen über drei Töne).
3. **Die Phrasen atmen** — es gibt lange Töne an den Phrasenenden.
4. **Die Lage bleibt singbar** — höchstens zwei Oktaven Umfang.
5. **Die Melodiestimme kann halten.** Ein Stabspiel kann das nicht; eine Melodie
   daraus ist eine Folge von Punkten statt einer Linie, und genau das klang
   vorher nach Piepen.

Die Tests sichern den **Bau**, nicht die Schönheit. Ob eine Melodie schön ist,
kann kein Test sagen — dafür steht oben die Abnahme.

---

## 6. Was sich seit der Abnahme geändert hat

Nichts an den Melodien. Alles andere ist neu gemacht worden; der Entwurf dazu
steht in `docs/klangdesign.md`. Die Punkte, die man am ehesten für eine
Änderung an der Abnahme halten könnte, und warum sie keine sind:

| geändert | war das abgenommen? |
|---|---|
| Wiese: Akkordeon → Okarina | Nein — „welche Stimme sie spielt" steht ausdrücklich in der rechten Spalte. |
| Tempo 126 → 120 und 112 → 100 | Nein — „Tempo, Lautstärke, Klangfarbe". |
| Kick auf jede Viertel → Puls 3-3-2 | Nein — „Begleitfiguren, Perkussion, Bass". |
| Achtbit-Ebene entfernt | Nein — sie ist Instrumentierung, keine Melodie. |

Die Tonfolgen und die Akkordfolge in `STUECKE` sind Note für Note dieselben wie
am Tag der Abnahme.
