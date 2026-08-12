/**
 * Die dreizehn Posen des Wuselwerkers.
 *
 * Ein Chibi, und das aendert die Regeln gegenueber dem Erdmaennchen. Fuenfzig
 * Prozent der Figurenhoehe sind Kopf und Haar; die Beine messen 0,11
 * Modelleinheiten gegen 0,27 beim Tier. Ein Beinausschlag von dreissig Grad
 * bewegt hier einen halben logischen Pixel und ist damit unsichtbar.
 *
 * **Die Arme tragen jede Aussage.** Sie sind 0,22 lang und sitzen an
 * Schluesselbeinen von 0,20 — die Figur ist breiter als hoch im Schulterbereich.
 * Was aus ihrer Silhouette tritt, tritt seitlich heraus, und deshalb sind alle
 * Winkel hier grosszuegiger als beim Tier.
 */
import { writeFileSync, mkdirSync } from 'node:fs';

const G = Math.PI / 180;
const n = (v) => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return v.map((x) => Number((x / l).toFixed(4)));
};
/** Winkel von „senkrecht nach unten", positiv nach vorn; `quer` nach aussen. */
const glied = (grad, quer = 0) => n([quer, -Math.cos(grad * G), Math.sin(grad * G)]);
/** Winkel von „senkrecht nach oben", positiv nach vorn. */
const rumpf = (grad) => n([0, Math.cos(grad * G), Math.sin(grad * G)]);
/** Der Hals: Winkel von der Waagerechten nach oben, positiv nach vorn. */
const hals = (grad) => n([0, Math.sin(grad * G), Math.cos(grad * G)]);

/** Ein Arm. `vor` schwingt, `aus` spreizt, `knick` beugt den Ellbogen. */
const arm = (vor, aus, knick, seite) => ({
  ober: glied(vor, aus * seite),
  unter: glied(vor + knick, aus * 0.72 * seite),
});
/** Ein Bein. */
const bein = (vor, knick, seite, quer = 0.14) => ({
  ober: glied(vor, quer * seite),
  unter: glied(vor - knick, quer * 0.8 * seite),
  fuss: glied(72 + vor * 0.3, quer * 0.5 * seite),
});

/**
 * Eine Pose zusammensetzen. Alles, was nicht genannt wird, bleibt in Ruhelage —
 * und das ist die Rueckfallebene, die nie falsch aussieht.
 */
function bild({ neigung = 4, halsWinkel = 78, kopf = 0, kopfDreh = 0, aL, aR, bL, bR, maske = 0, versatz, stauch, schulter }) {
  const r = {
    Spine01: rumpf(neigung),
    Spine02: rumpf(neigung * 0.55),
    NeckTwist01: hals(halsWinkel + 6),
    NeckTwist02: hals(halsWinkel),
    L_Upperarm: aL.ober, L_Forearm: aL.unter,
    R_Upperarm: aR.ober, R_Forearm: aR.unter,
    L_Thigh: bL.ober, L_Calf: bL.unter, L_Foot: bL.fuss,
    R_Thigh: bR.ober, R_Calf: bR.unter, R_Foot: bR.fuss,
  };
  if (schulter) {
    r.L_Clavicle = n([0.94, schulter, 0]);
    r.R_Clavicle = n([-0.94, schulter, 0]);
  }
  const f = { richtung: r, maske, winkel: { Head: [kopf, kopfDreh, 0] } };
  if (versatz !== undefined) f.versatz = versatz;
  if (stauch) f.stauch = stauch;
  return f;
}

const zwei = Math.PI * 2;
const posen = {};

// --- Gehen -------------------------------------------------------------------
// Aufrecht auf zwei Beinen. Der Beinausschlag ist klein — er muss es sein, die
// Beine sind kurz —, also traegt der **Armschwung** den Gang. Gegengleich: Der
// linke Arm geht mit dem rechten Bein.
posen.walking = {
  _warum:
    'Aufrecht, gegengleicher Armschwung. Die Beine dieser Figur messen 0,11 Modelleinheiten; ' +
    'ein Ausschlag von dreissig Grad bewegt darin einen halben logischen Pixel. Der Gang ' +
    'haengt deshalb am Arm und am Hub, nicht am Bein.',
  boden: true,
  frames: Array.from({ length: 8 }, (_, i) => {
    const p = i / 8;
    const s = Math.sin(zwei * p);
    const hub = Math.abs(Math.cos(zwei * p));
    return bild({
      neigung: 7 + s * 1.5,
      kopf: -2 + s * 3,
      aL: arm(-s * 34, 0.34, 16 + hub * 10, +1),
      aR: arm(s * 34, 0.34, 16 + hub * 10, -1),
      bL: bein(s * 26, 8 + hub * 16, +1),
      bR: bein(-s * 26, 8 + hub * 16, -1),
      versatz: Number((0.016 * hub - 0.008).toFixed(4)),
      stauch: [1, Number((1 + 0.02 * hub).toFixed(4)), 1],
    });
  }),
};

// --- Fallen ------------------------------------------------------------------
posen.falling = {
  _warum: 'Arme hoch und weit, Beine gespreizt, Rumpf leicht zurueck — es zieht ihn nach oben.',
  boden: true,
  frames: Array.from({ length: 4 }, (_, i) => {
    const s = Math.sin((zwei * i) / 4);
    return bild({
      neigung: -8,
      kopf: 6,
      aL: arm(150 + s * 8, 0.52, -14, +1),
      aR: arm(150 - s * 8, 0.52, -14, -1),
      bL: bein(-16 - s * 6, 22, +1, 0.3),
      bR: bein(-16 + s * 6, 22, -1, 0.3),
      maske: 2,
    });
  }),
};

// --- Schweben ----------------------------------------------------------------
posen.floating = {
  _warum: 'Beide Arme senkrecht ueber dem Kopf am Schirm, Beine ruhig baumelnd.',
  boden: true,
  frames: Array.from({ length: 4 }, (_, i) => {
    const s = Math.sin((zwei * i) / 4);
    return bild({
      neigung: 2 + s * 3,
      kopf: 4,
      aL: arm(176, 0.12 + s * 0.04, -8, +1),
      aR: arm(176, 0.12 - s * 0.04, -8, -1),
      bL: bein(6 + s * 8, 14, +1, 0.1),
      bR: bein(6 - s * 8, 14, -1, 0.1),
      maske: 2,
    });
  }),
};

// --- Klettern ----------------------------------------------------------------
posen.climbing = {
  _warum: 'Bauch an der Wand, Arme abwechselnd hoch, Beine nachgezogen.',
  boden: true,
  frames: Array.from({ length: 4 }, (_, i) => {
    const s = Math.sin((zwei * i) / 4);
    return bild({
      neigung: 16,
      kopf: -6,
      aL: arm(150 + s * 26, 0.2, -10, +1),
      aR: arm(150 - s * 26, 0.2, -10, -1),
      bL: bein(30 - s * 18, 44, +1, 0.16),
      bR: bein(30 + s * 18, 44, -1, 0.16),
      maske: 1,
    });
  }),
};

// --- Hochziehen --------------------------------------------------------------
// Der grosse Aufschwung. Sechs Bilder von haengend bis oben, einmalig.
posen.hoisting = {
  _warum: 'Der Aufschwung ueber die Kante: aus dem Haengen ueber das Stemmen bis zum Stand.',
  boden: true,
  frames: [
    [168, 40, 26], [150, 24, 40], [120, 6, 52], [86, -6, 42], [50, -4, 22], [16, 2, 8],
  ].map(([armVor, neigung, beinVor], i) =>
    bild({
      neigung,
      kopf: -8 + i * 2,
      aL: arm(armVor, 0.22, -12 + i * 4, +1),
      aR: arm(armVor - 8, 0.22, -12 + i * 4, -1),
      bL: bein(beinVor, 40 - i * 5, +1, 0.16),
      bR: bein(beinVor - 8, 40 - i * 5, -1, 0.16),
      maske: 1,
    }),
  ),
};

// --- Bauen -------------------------------------------------------------------
posen.building = {
  _warum: 'Vorgebeugt, beide Haende legen die Planke nach vorn unten. Die Planke zeichnet der Zeichner.',
  boden: true,
  frames: Array.from({ length: 8 }, (_, i) => {
    const t = i < 5 ? i / 4 : (8 - i) / 3;
    return bild({
      neigung: 20 + t * 14,
      kopf: -12 - t * 8,
      aL: arm(52 - t * 22, 0.22, 24, +1),
      aR: arm(52 - t * 22, 0.22, 24, -1),
      bL: bein(8, 16, +1),
      bR: bein(-6, 22, -1),
      maske: 1,
    });
  }),
};

// --- Rammen ------------------------------------------------------------------
// Bild 0 ist das Wirkungsbild: Die Simulation raeumt bei timer % interval == 0.
posen.bashing = {
  _warum:
    'Waagerecht nach vorn. Bild 0 ist das Wirkungsbild — die Arme sind dort ganz gestreckt. ' +
    'Danach holt er zurueck aus.',
  boden: true,
  frames: [0, 1, 2].map((i) =>
    bild({
      neigung: 10 + i * 4,
      kopf: -4,
      aL: arm(92 - i * 22, 0.2, 6 + i * 10, +1),
      aR: arm(92 - i * 22, 0.2, 6 + i * 10, -1),
      bL: bein(14, 12, +1),
      bR: bein(-10, 18, -1),
      maske: 1,
    }),
  ),
};

// --- Schraegbaggern ----------------------------------------------------------
posen.mining = {
  _warum: 'Achse nach vorn unten, genau die Mitte zwischen Rammen und Graben.',
  boden: true,
  frames: [0, 1, 2, 3].map((i) =>
    bild({
      neigung: 24 + i * 5,
      kopf: -14,
      aL: arm(58 - i * 12, 0.2, 12 + i * 6, +1),
      aR: arm(58 - i * 12, 0.2, 12 + i * 6, -1),
      bL: bein(12, 14, +1),
      bR: bein(-10, 20, -1),
      maske: 1,
    }),
  ),
};

// --- Graben ------------------------------------------------------------------
posen.digging = {
  _warum: 'Tief gebeugt, beide Haende senkrecht nach unten am Spaten.',
  boden: true,
  frames: [0, 1, 2].map((i) =>
    bild({
      neigung: 40 + i * 6,
      kopf: -26,
      aL: arm(20 - i * 14, 0.16, 10, +1),
      aR: arm(20 - i * 14, 0.16, 10, -1),
      bL: bein(16, 24, +1),
      bR: bein(-4, 28, -1),
      maske: 1,
    }),
  ),
};

// --- Blocken -----------------------------------------------------------------
posen.blocking = {
  _warum:
    'Frontal, Arme waagerecht zu beiden Seiten, Beine breit. Die Aussage richtet sich an den ' +
    'Betrachter, deshalb steht er fast gerade zur Kamera.',
  boden: true,
  frames: [0, 1].map((i) =>
    bild({
      neigung: 0,
      kopf: 2,
      aL: arm(4, 0.96 + i * 0.02, 2, +1),
      aR: arm(4, 0.96 + i * 0.02, 2, -1),
      bL: bein(0, 4, +1, 0.34),
      bR: bein(0, 4, -1, 0.34),
      maske: 2,
      stauch: [1, 1 - i * 0.006, 1],
    }),
  ),
};

// --- Rettung -----------------------------------------------------------------
posen.saving = {
  _warum: 'Beide Arme hoch, ein Sprung, dann aus dem Bild. Einmalig.',
  boden: true,
  frames: [0, 1, 2, 3, 4, 5].map((i) => {
    const t = i / 5;
    return bild({
      neigung: -6 + t * 4,
      kopf: 10,
      aL: arm(160 + t * 14, 0.3, -16, +1),
      aR: arm(160 + t * 14, 0.3, -16, -1),
      bL: bein(-10 - t * 20, 30 + t * 20, +1, 0.2),
      bR: bein(-10 - t * 20, 30 + t * 20, -1, 0.2),
      maske: 3,
      stauch: [1 - t * 0.5, 1 - t * 0.5, 1 - t * 0.5],
      versatz: Number((t * 0.5).toFixed(3)),
    });
  }),
};

// --- Tod ---------------------------------------------------------------------
posen.dying = {
  _warum: 'Frontal: Arme hoch, dann sackt er in sich zusammen. Einmalig.',
  boden: true,
  frames: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const t = i / 7;
    return bild({
      neigung: -10 + t * 26,
      kopf: 8 - t * 26,
      aL: arm(150 - t * 130, 0.4 - t * 0.16, -10 + t * 30, +1),
      aR: arm(150 - t * 130, 0.4 - t * 0.16, -10 + t * 30, -1),
      bL: bein(4, 4 + t * 46, +1, 0.2),
      bR: bein(-4, 4 + t * 46, -1, 0.2),
      maske: 4,
      stauch: [1 + t * 0.1, 1 - t * 0.18, 1 + t * 0.1],
    });
  }),
};

// --- Spaehen -----------------------------------------------------------------
posen.spaehen = {
  _warum:
    'Ratlos umschauen: Haende in die Hueften, Kopf dreht ruckhaft. Keine Simulationslage — ' +
    'der Zeichner setzt sie ein, wenn eine laufende Figur nicht von der Stelle kommt.',
  boden: true,
  frames: [0, 0, 26, 26, -24, -24].map((dreh, i) =>
    bild({
      neigung: 2,
      kopf: 2,
      kopfDreh: dreh,
      aL: arm(-14, 0.42, 62, +1),
      aR: arm(-14, 0.42, 62, -1),
      bL: bein(2, 4, +1, 0.2),
      bR: bein(-2, 4, -1, 0.2),
      maske: i === 3 ? 4 : 2,
      stauch: [1, 1 + (i % 3 === 1 ? 0.006 : 0), 1],
    }),
  ),
};

mkdirSync('art-src/wuselwerker/posen', { recursive: true });
for (const [name, p] of Object.entries(posen)) {
  const { boden, ...rest } = p;
  writeFileSync(
    `art-src/wuselwerker/posen/${name}.json`,
    `${JSON.stringify(boden ? { ...rest, boden: true } : rest, null, 2)}\n`,
  );
}
console.log(`${Object.keys(posen).length} Posen geschrieben`);
