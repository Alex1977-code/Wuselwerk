# Grafikablage

Hier landen die erzeugten Sprite-Blätter. Der Lader findet sie von selbst —
es muss kein Code angefasst werden.

## Was hier hineingehört

Je Atlas ein Paar mit gleichem Namensstamm:

```
murmel.webp        das Blatt
murmel.atlas.json  Aufteilung, Haltedauern, Schopfanker
```

Die Aufteilung ist **nicht frei wählbar**: Zellgrösse, Fusspunkt, Bildzahl und
Haltedauer je Bild hängen an den Taktraten der Simulation. Die verbindlichen
Werte stehen in `docs/grafik-integration.md`, als Vorgabewert ausformuliert in
`src/render/atlas.ts` (`DEFAULT_MANIFEST`).

## Woher das Blatt kommt

Zwei Wege schreiben hierher, beide dieselben zwei Dateinamen. Wer zuletzt
läuft, gewinnt.

```bash
npm run atlas:backen     # aus dem 3D-Ankermodell — der übliche Weg
npm run atlas:template   # prozedurale Malvorlage — der Notweg
```

**`atlas:backen`** stellt das Ankermodell (`art-src/wuselwerker-v4.glb`) in die
Posen aus `art-src/posen/` und rendert daraus die 60 Bilder. Das ist der Weg,
über den die Grafik entsteht; beschrieben in `docs/grafik-ankerbild-a0.md` §7.

**`atlas:template`** zeichnet dasselbe Raster mit dem prozeduralen Code. Es ist
eine Malvorlage für Handarbeit und zugleich die Notlösung, falls am Modell
etwas nicht stimmt — Zellraster und Fusspunkt sind garantiert richtig, weil
derselbe Code sie auch im Spiel benutzt.

## Ausgezogene Blätter

Hier liegt nur, was das Spiel **ausliefert** — alles in diesem Ordner wandert
in die Einzeldatei. Die Blätter der Murmel und des Erdmännchens sind deshalb zu
ihren Quelldaten gezogen (`art-src/murmel/`, `art-src/erdmaennchen/`); die
Tests prüfen sie dort weiter. Zurückholen: Paar herüberkopieren und `FIGUR` in
`index.ts` umstellen — die Begründung steht dort am Kommentar.

## Rückfallebene

Fehlt hier eine Datei, oder kann ein Blatt einen Zustand nicht bedienen,
zeichnet das Spiel diesen Zustand weiter prozedural. Es bleibt also jederzeit
spielbar, auch mit halbfertiger Grafik.
