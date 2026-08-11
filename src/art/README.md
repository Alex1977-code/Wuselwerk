# Grafikablage

Hier landen die erzeugten Sprite-Blätter. Der Lader findet sie von selbst —
es muss kein Code angefasst werden.

## Was hier hineingehört

Je Atlas ein Paar mit gleichem Namensstamm:

```
wusel.png          das Blatt
wusel.atlas.json   die Aufteilung
```

Die Aufteilung ist **nicht frei wählbar**: Zellgrösse, Fusspunkt, Bildzahl und
Haltedauer je Bild hängen an den Taktraten der Simulation. Die verbindlichen
Werte stehen in `docs/grafik-integration.md`, als Vorgabewert ausformuliert in
`src/render/atlas.ts` (`DEFAULT_MANIFEST`).

## Vorlage zum Übermalen erzeugen

```bash
npm run atlas:template
```

Das schreibt `wusel.png` und `wusel.atlas.json` in diesen Ordner — gezeichnet
mit dem prozeduralen Code, also im richtigen Zellraster mit richtigem
Fusspunkt. Diese Datei ist die Malvorlage: Zelle für Zelle übermalen, Raster
und Fusspunkt beibehalten, Dateinamen lassen.

## Rückfallebene

Fehlt hier eine Datei, oder kann ein Blatt einen Zustand nicht bedienen,
zeichnet das Spiel diesen Zustand weiter prozedural. Es bleibt also jederzeit
spielbar, auch mit halbfertiger Grafik.
