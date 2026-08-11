# Posen

Je Zustand eine Datei. Zusammen sind sie die Quelle aller Figurenbilder:
`npm run atlas:backen` stellt das Modell in jede Pose, rendert sie und setzt
daraus `src/art/wusel.png` zusammen.

## Warum Posen und nicht Animationen

Das Ankermodell ist geriggt, aber unbewegt (`docs/grafik-ankerbild-a0.md` §1.1).
Die Bewegung entsteht deshalb hier, als Zahlen im Repo — nachvollziehbar,
wiederholbar und ohne einen weiteren Werkzeugdurchlauf, sobald sich etwas ändert.

## Aufbau einer Datei

```js
export default {
  clip: 'walking',
  frames: 8,
  pose(i, t) {
    // i = Bildnummer, t = i / frames (0 bis 1)
    return {
      L_Thigh: [-25, 0, 0],       // Drehung in Grad um X, Y, Z
      _versatz: [0, 0.4],         // Verschiebung in logischen Pixeln, +y = hoch
    };
  },
};
```

## Die Drehachsen

**Die Winkel gelten in Weltachsen, nicht in Knochenachsen.** Das ist der
entscheidende Punkt: Ein Rig benennt seine Knochenachsen beliebig, und
`bone.rotation.x` bedeutet an der Schulter etwas anderes als an der Hüfte. Der
Backweg rechnet deshalb jede angegebene Drehung in die lokale Achse des
Knochens um. Was man hinschreibt, ist immer dasselbe:

| Achse | Bedeutung | positiv heißt |
|---|---|---|
| **X** | Nicken | nach **hinten** schwingen |
| **Y** | Drehen | nach **links** drehen |
| **Z** | Kippen | nach **rechts** kippen |

Die Figur schaut in ihre eigene +Z-Richtung; im Blatt zeigt sie nach rechts.
Ein Bein 25° nach vorn ist also `[-25, 0, 0]`.

## Die Gelenke

`Root` `Hip` `Pelvis` `Waist` `Spine01` `Spine02` `NeckTwist01` `NeckTwist02`
`Head` — und seitenweise mit `L_`/`R_`: `Clavicle` `Upperarm` `Forearm` `Hand`
`Thigh` `Calf` `Foot` `ToeBase`.

**Die Mähne hängt am `Head`.** Sie hat keine eigenen Knochen — sie folgt dem
Kopf. Wer das Haar bewegen will, neigt den Kopf.

## Fehlt eine Datei

Dann steht der Zustand in der Bindepose. Das Blatt ist trotzdem vollständig,
und das Spiel läuft — nur bewegt sich dieser Zustand eben nicht.
