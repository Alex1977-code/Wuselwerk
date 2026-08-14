/* Probe fuer Weg B — echter Melodiegenerator je Level. Nicht Teil des Spiels. */
import { ARPEGGIO, STUECKE } from '../src/audio/music';
import { LEVELS } from '../src/levels/index';

type Note = [number | null, number];
const TAKT = 8;
const PULSSTELLEN = [0, 3, 6];
const kl = (t: number) => ((t % 12) + 12) % 12;
const mod = (a: number, n: number) => ((a % n) + n) % n;

// --- Seed -------------------------------------------------------------------

function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
/** Deterministischer Ziehstrom. Kein Math.random. */
class Strom {
  private s: number;
  constructor(seed: number) {
    this.s = (seed ^ 0x9e3779b9) >>> 0;
  }
  next(): number {
    let x = this.s;
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    this.s = x;
    return x;
  }
  /** Index in [0,n). */
  zieh(n: number): number {
    return this.next() % n;
  }
  /** Ein Element. */
  aus<T>(a: readonly T[]): T {
    return a[this.zieh(a.length)];
  }
}

// --- Weltklang --------------------------------------------------------------

interface Weltklang {
  /** Die sieben Stufen des Modus in Halbtoenen. */
  leiter: readonly number[];
  /** Stufe (Index in leiter), auf der das Kopfmotiv beginnt. */
  kopfGrad: number;
  /** Die Stufe, die den Modus von seinem Nachbarn unterscheidet. */
  kennGrad: number;
  /** Nur fuer Dur-Welten: der chromatische Gast (lydische Quarte). */
  kennChrom: number | null;
  /** Erlaubte Kopfkonturen dieser Welt, in Leiterschritten. */
  konturen: readonly (readonly number[])[];
  /** Akkordwurzeln je Takt, in Vorzugsreihenfolge. */
  kadenz: readonly (readonly number[])[];
  /** Zweitstimmen-Vorrat (andere Familie als die fuehrende). */
  antwort: readonly string[];
}

const WELT: Record<string, Weltklang> = {
  grass: {
    leiter: [0, 2, 4, 5, 7, 9, 11],
    kopfGrad: 4,
    kennGrad: 3,
    kennChrom: 6,
    konturen: [[0, 0, 1], [0, 0, 2], [0, 1, 2], [0, 2, 1], [0, -1, 1], [0, 1, -1]],
    kadenz: [[0], [5, 2], [0, 5], [7], [0, 5], [7, 2], [5, 0], [7]],
    antwort: ['okarina', 'panfloete'],
  },
  sonnenhang: {
    leiter: [0, 2, 4, 5, 7, 9, 11],
    kopfGrad: 4,
    kennGrad: 3,
    kennChrom: 6,
    konturen: [[0, 0, 1], [0, -1, 1], [0, 1, -1], [0, 2, 1], [0, 1, 2], [0, 0, -1]],
    kadenz: [[0], [5, 2], [0, 5], [7], [0, 5], [7, 2], [5, 0], [7]],
    antwort: ['leier', 'streicher'],
  },
  wipfel: {
    leiter: [0, 2, 4, 5, 7, 9, 11],
    kopfGrad: 4,
    kennGrad: 3,
    kennChrom: 6,
    konturen: [[0, 1, 2], [0, 2, 3], [0, 0, 2], [0, 2, 1], [0, 1, 3], [0, 0, 1]],
    kadenz: [[0], [5, 2], [0, 5], [7], [0, 5], [7, 2], [5, 0], [7]],
    antwort: ['leier', 'streicher'],
  },
  crystal: {
    leiter: [0, 2, 3, 5, 7, 9, 10],
    kopfGrad: 0,
    kennGrad: 5,
    kennChrom: null,
    konturen: [[0, 2, 3], [0, 1, 2], [0, 2, 4], [0, 1, 3], [0, 2, 1], [0, 3, 2]],
    kadenz: [[0], [10, 5], [0, 10], [5, 3], [10, 3], [3, 0], [5, 10], [0]],
    antwort: ['klarinette', 'okarina'],
  },
  rust: {
    leiter: [0, 2, 4, 5, 7, 9, 10],
    kopfGrad: 0,
    kennGrad: 6,
    kennChrom: null,
    // Rufe: Tonwiederholung, dann Sprung. Der Dialekt der Werkbank.
    konturen: [[0, 0, 2], [0, 0, 3], [0, 0, 1], [0, 2, 1], [0, 0, 4], [0, 1, 0]],
    kadenz: [[0], [10, 5], [0, 10], [5, 10], [10, 0], [5, 10], [10, 5], [0]],
    antwort: ['okarina', 'klarinette'],
  },
  frost: {
    leiter: [0, 2, 3, 5, 7, 8, 10],
    kopfGrad: 0,
    kennGrad: 5,
    kennChrom: null,
    // Terzschritte: Atem in kalter Luft.
    konturen: [[0, 2, 3], [0, 2, 4], [0, 1, 3], [0, 3, 2], [0, 2, 1], [0, 1, 2]],
    kadenz: [[0], [8, 3], [3, 10], [10, 8], [8, 3], [3, 10], [10, 8], [0]],
    antwort: ['streicher', 'leier'],
  },
  magma: {
    leiter: [0, 1, 3, 5, 7, 8, 10],
    kopfGrad: 0,
    kennGrad: 1,
    kennChrom: null,
    // Eng am Grundton: die phrygische Reibung.
    konturen: [[0, 1, 2], [0, 1, 0], [0, 1, 3], [0, 2, 1], [0, 1, -1], [0, 2, 3]],
    kadenz: [[0], [1, 3], [0, 1], [3, 1], [1, 0], [0, 3], [1, 3], [0]],
    antwort: ['leier', 'akkordeon'],
  },
};

const GESTRICHEN = ['leier', 'streicher', 'akkordeon'];
const GEBLASEN = ['okarina', 'klarinette', 'panfloete'];

// --- Rhythmustabellen -------------------------------------------------------
// Negative Zahl = Pause dieser Laenge.

/** Kopfmotiv: genau drei Toene, Summe 4 oder 6. */
const KOPF_R: readonly (readonly number[])[] = [
  [2, 1, 1], [1, 1, 2], [2, 2, 2], [2, 1, 3], [1, 2, 1], [3, 2, 1], [2, 2, 1],
];
/** Wendung nach dem Kopf, je Restlaenge. */
const WENDUNG_R: Record<number, readonly (readonly number[])[]> = {
  1: [[1]],
  2: [[2], [1, 1]],
  3: [[3], [1, 2], [2, 1]],
  4: [[2, 2], [4], [1, 1, 2], [2, 1, 1]],
  5: [[2, 3], [3, 2], [1, 2, 2]],
};
/** Phrasenende: Summe 8, letzter Eintrag ein Ton der Laenge >= 3. */
const ANTWORT_R: readonly (readonly number[])[] = [
  [2, 2, 4], [2, 2, 3, -1], [4, 4], [2, 6], [2, 1, 1, 4], [1, 1, 2, 4],
  [4, 1, 3], [3, 1, 4], [2, 2, 1, 3], [1, 1, 1, 1, 4], [2, 3, 3],
];
/** Mittelteil-Takt: Summe 8, laeuft durch (kein Zwang zum langen Schluss). */
const MITTEL_R: readonly (readonly number[])[] = [
  [2, 2, 2, 2], [2, 2, 1, 1, 2], [4, 2, 2], [2, 1, 1, 2, 2], [1, 1, 2, 2, 2],
  [2, 2, 4], [2, 2, 2, 1, 1],
];

// --- Bausteine --------------------------------------------------------------

/** Halbtoene einer Leiterstufe; Stufen ausserhalb 0..6 laufen in die Oktaven. */
function hs(grad: number, leiter: readonly number[]): number {
  return leiter[mod(grad, 7)] + 12 * Math.floor(grad / 7);
}

/**
 * Ein Lauf von `von` nach `nach` in genau `n` Toenen, letzter Ton = `nach`.
 * Die Bewegung wird gleichmaessig verteilt — daraus entstehen Schritte und
 * kleine Terzen, nie ein Sprungfeld.
 */
function lauf(von: number, nach: number, n: number, s: Strom): number[] {
  if (n <= 1) return [nach];
  const d = nach - von;
  // Gleichmaessige Verteilung der Bewegung (Bresenham): keine Klumpen, keine
  // Schritte groesser als zwei Stufen, solange |d| <= 2n.
  const moves: number[] = [];
  for (let i = 0; i < n; i++) {
    moves.push(Math.round(((i + 1) * d) / n) - Math.round((i * d) / n));
  }
  const out: number[] = [];
  let cur = von;
  for (const m of moves) {
    cur += m;
    out.push(cur);
  }
  // Drei gleiche Toene hintereinander sind kein Motiv, sondern ein Loch. Der
  // mittlere wird zur Wechselnote — gegen die Richtung der Phrase, damit die
  // Aufloesung in die Bewegung hineinfaellt.
  const gegen = d === 0 ? (s.zieh(2) === 0 ? 1 : -1) : -Math.sign(d);
  const kette = [von, ...out];
  for (let i = 1; i + 1 < kette.length; i++) {
    if (kette[i] === kette[i - 1] && kette[i] === kette[i + 1]) {
      kette[i] += gegen;
    }
  }
  return kette.slice(1);
}

/** Rhythmus + Gradfolge -> Noten. Pausen bekommen keinen Grad. */
function baue(r: readonly number[], grade: number[], leiter: readonly number[]): Note[] {
  const out: Note[] = [];
  let k = 0;
  for (const l of r) {
    if (l < 0) out.push([null, -l]);
    else out.push([hs(grade[k++], leiter), l]);
  }
  return out;
}
/** Wie viele Toene (ohne Pausen) ein Rhythmus hat. */
const tonzahl = (r: readonly number[]) => r.filter((x) => x > 0).length;

// --- Der Generator ----------------------------------------------------------

export interface Erzeugt {
  melodie: Note[];
  akkorde: number[];
  /** Farbe jetzt in LEITERSTUFEN ueber der Wurzel, nicht in Halbtoenen. */
  farbe: number[];
  bpm: number;
  grund: number;
  leiter: readonly number[];
  melodieStimme: string;
  zweitStimme: string;
  harmonieStimme: string;
  sfxStufen: readonly number[];
  fanfareGrund: number;
  theme: string;
  versuch: number;
  rueckfall: boolean;
  /** Das unveraenderte Weltstueck (Level 1) — von den Zusatzregeln ausgenommen. */
  abgenommen: boolean;
}

/** Akkordtoene der Wurzel im Modus: Grundton, Terz, Quinte, Septime. */
function akkordklassen(wurzel: number, leiter: readonly number[]): Set<number> {
  const g = leiter.indexOf(mod(wurzel, 12));
  const s = new Set<number>();
  if (g < 0) {
    for (const iv of [0, 3, 4, 7, 10]) s.add(kl(wurzel + iv));
    return s;
  }
  for (const d of [0, 2, 4, 6]) s.add(kl(hs(g + d, leiter)));
  return s;
}

/** Misstoene: Einsatz auf einer Pulsstelle, lang, kein Akkordton, ohne Aufloesung. */
function misstoene(bar: Note[], wurzel: number, leiter: readonly number[], folge: number | null): number {
  const ak = akkordklassen(wurzel, leiter);
  let pos = 0;
  let zahl = 0;
  for (let i = 0; i < bar.length; i++) {
    const n = bar[i];
    if (PULSSTELLEN.includes(pos) && n[0] !== null && n[1] >= 2 && !ak.has(kl(n[0]))) {
      const naechst = i + 1 < bar.length ? bar[i + 1][0] : folge;
      if (naechst === null || Math.abs(naechst - n[0]) > 2) zahl++;
    }
    pos += n[1];
  }
  return zahl;
}

function melodieZiehen(w: Weltklang, s: Strom): Note[][] | null {
  const L = w.leiter;
  const g0 = w.kopfGrad;

  // 1. Der Gipfel steht zuerst fest. Er ist die Decke der Melodie; alles
  //    andere wird darunter gebaut, damit der Mittelteil wirklich der hoechste
  //    Punkt ist und nicht nur eine weitere Zeile.
  const gipfel = s.aus([6, 7, 7, 8]);

  // 2. Kopfmotiv: Kontur + Rhythmus. Wird in Takt 1, 3 und 7 woertlich
  //    wiederholt — dadurch ist B2 nicht geprueft, sondern gebaut.
  const moeglich = w.konturen.filter((k) => g0 + Math.max(...k) <= gipfel - 1);
  if (!moeglich.length) return null;
  const kontur = s.aus(moeglich);
  const kopfR = s.aus(KOPF_R);
  const kopfSumme = kopfR.reduce((a, b) => a + b, 0);
  const kopfGrade = kontur.map((k) => g0 + k);
  const kopfEnde = kopfGrade[2];
  const rest = 8 - kopfSumme;
  const wR = WENDUNG_R[rest];
  if (!wR) return null;

  // 3. Drei verschiedene Wendungen: ab, auf, heim. Dass sie verschieden sein
  //    MUESSEN, ist das Gesetz „jedes Mal anders weitergefuehrt".
  const boden = g0 - 4;
  const zAb = Math.max(boden, kopfEnde + s.aus([-2, -1, -3]));
  const zAuf = Math.min(gipfel - 1, kopfEnde + s.aus([1, 2, 3]));
  const heimPool = [-1, 0, 1, 2, -2]
    .map((o) => kopfEnde + o)
    .filter((z) => z !== zAb && z !== zAuf && z >= boden && z < gipfel);
  if (!heimPool.length || zAb === zAuf) return null;
  const zHeim = s.aus(heimPool);

  const kopfTakt = (ziel: number): Note[] => {
    const r = s.aus(wR);
    return [
      ...baue(kopfR, kopfGrade, L),
      ...baue(r, lauf(kopfEnde, ziel, tonzahl(r), s), L),
    ];
  };

  // 4. Phrasenenden. Takt 4 ist der Halbschluss auf der Quinte, Takt 8 der
  //    Ganzschluss auf dem Grundton — beide fest. Das macht aus acht Takten
  //    eine Periode statt einer Folge.
  const zT2 = s.aus([0, 1, 2]);
  const zT4 = 4;
  const zT8 = 0;
  const zT6 = s.aus([0, 2, 4]);

  const bars: Note[][] = [];
  bars[0] = kopfTakt(zAb);
  {
    const r = s.aus(ANTWORT_R);
    bars[1] = baue(r, lauf(zAb, zT2, tonzahl(r), s), L);
  }
  bars[2] = kopfTakt(zAuf);
  {
    const r = s.aus(ANTWORT_R);
    bars[3] = baue(r, lauf(zAuf, zT4, tonzahl(r), s), L);
  }
  // Takt 5: beginnt auf dem Gipfel und faellt auf den Kennton.
  {
    const r = s.aus(MITTEL_R);
    const n = tonzahl(r);
    // Zielstufe = Kennton in der Lage unter dem Gipfel.
    let kz = w.kennGrad;
    while (kz + 7 <= gipfel - 2) kz += 7;
    while (kz >= gipfel - 1) kz -= 7;
    const grade = [gipfel, ...lauf(gipfel, kz, n - 1, s)];
    bars[4] = baue(r, grade, L);
  }
  {
    const r = s.aus(ANTWORT_R);
    const von = bars[4].filter((x) => x[0] !== null).length
      ? L.indexOf(mod(bars[4][bars[4].length - 1][0] ?? 0, 12))
      : 0;
    void von;
    // Von der letzten Stufe des Mittelteils weiter.
    const letzte = [...bars[4]].reverse().find((x) => x[0] !== null)!;
    const letzterGrad = gradVon(letzte[0] as number, L);
    bars[5] = baue(r, lauf(letzterGrad, zT6, tonzahl(r), s), L);
  }
  bars[6] = kopfTakt(zHeim);
  {
    const r = s.aus(ANTWORT_R.filter((x) => (x[x.length - 1] as number) >= 4));
    bars[7] = baue(r, lauf(zHeim, zT8, tonzahl(r), s), L);
  }

  // 5. Der chromatische Gast (nur Dur-Welten): die uebermaessige Quarte als
  //    Unterwechselnote zur Quinte. Sie ersetzt die Quarte dort, wo sie sich
  //    im Halbton nach oben aufloest.
  if (w.kennChrom !== null) {
    const q = hs(w.kennGrad, L); // die Quarte
    const quinte = hs(w.kennGrad + 1, L);
    for (const t of [4, 5]) {
      const b = bars[t];
      let gesetzt = false;
      for (let i = 0; i < b.length && !gesetzt; i++) {
        if (b[i][0] !== q) continue;
        const naechst = i + 1 < b.length ? b[i + 1][0] : (bars[t + 1]?.find((x) => x[0] !== null)?.[0] ?? null);
        if (naechst === quinte) {
          b[i] = [w.kennChrom, b[i][1]];
          gesetzt = true;
        }
      }
      if (gesetzt) break;
    }
  }
  return bars;
}

function gradVon(halbton: number, L: readonly number[]): number {
  const okt = Math.floor(halbton / 12);
  const i = L.indexOf(mod(halbton, 12));
  if (i < 0) return L.length - 1 + 7 * okt; // chromatischer Gast: naechste Stufe
  return i + 7 * okt;
}

// --- Akkorde: an die erzeugte Melodie angepasst -----------------------------

function akkordeFuer(w: Weltklang, bars: Note[][], grund: number, s: Strom): number[] {
  const out: number[] = [];
  for (let t = 0; t < 8; t++) {
    const pool = w.kadenz[t];
    const folge = bars[(t + 1) % 8].find((x) => x[0] !== null)?.[0] ?? null;
    let beste = pool[0];
    let bestScore = Infinity;
    const gezogen = s.zieh(97);
    pool.forEach((r, k) => {
      // A2: die Sechzehntelfigur reicht bis Wurzel + 12 Halbtoene.
      if (grund * Math.pow(2, (r + 12) / 12) >= 800) return;
      const m = misstoene(bars[t], r, w.leiter, folge);
      // Wechsel gegenueber dem Vortakt ist einen halben Punkt wert.
      const wechsel = t > 0 && out[t - 1] === r ? 0.5 : 0;
      const score = m * 4 + wechsel + ((gezogen + k) % pool.length) * 0.01;
      if (score < bestScore) {
        bestScore = score;
        beste = r;
      }
    });
    out.push(beste);
  }
  return out;
}

// --- Farbe: Leiterstufen, nie ausserhalb des Modus --------------------------

const FARBEN: readonly (readonly number[])[] = [
  [2, 4],       // Dreiklang
  [2, 4, 6],    // mit Septime
  [1, 4],       // sus2
  [3, 4],       // sus4
];

// --- Das Verfahren ----------------------------------------------------------

export function stueckFuer(levelId: string, theme: string): Erzeugt {
  const welt = STUECKE[theme as keyof typeof STUECKE];
  const w = WELT[theme];
  const nr = (() => {
    const m = /^w\d+-(\d+)$/.exec(levelId);
    return m ? parseInt(m[1], 10) : 1;
  })();

  const basis: Omit<Erzeugt, 'melodie' | 'akkorde' | 'farbe' | 'versuch' | 'rueckfall'> = {
    bpm: welt.bpm,
    grund: welt.grund,
    leiter: w.leiter,
    melodieStimme: welt.melodieStimme,
    // BEFUND: wipfel liefert heute panfloete/okarina — beide Dreieckswelle,
    // also kein hoerbarer Stimmwechsel (C9). Der Weltvorrat korrigiert das.
    zweitStimme: GESTRICHEN.includes(welt.melodieStimme) === GESTRICHEN.includes(welt.zweitStimme)
      ? w.antwort[0]
      : welt.zweitStimme,
    harmonieStimme: welt.harmonieStimme,
    sfxStufen: welt.sfxStufen,
    fanfareGrund: welt.fanfareGrund,
    theme,
  };

  // Level 1 jeder Welt ist das abgenommene Weltstueck, unveraendert.
  if (nr === 1) {
    return {
      ...basis,
      melodie: welt.melodie.map((n) => [n[0], n[1]] as Note),
      akkorde: welt.akkorde.slice(),
      farbe: [2, 4],
      versuch: 0,
      rueckfall: false,
      abgenommen: true,
    };
  }

  const s = new Strom(hash32(levelId));
  const zweit = w.antwort[hash32(levelId + '#stimme') % w.antwort.length];

  for (let versuch = 0; versuch < 24; versuch++) {
    const bars = melodieZiehen(w, s);
    if (!bars) continue;
    const akkorde = akkordeFuer(w, bars, welt.grund, s);
    const deckel = (fb: readonly number[]) => {
      let h = 0;
      for (const r of akkorde) {
        const gr = gradVon(r, w.leiter);
        h = Math.max(h, welt.grund * Math.pow(2, (r + hs(gr + Math.max(...fb), w.leiter) - hs(gr, w.leiter) + 1) / 12));
      }
      return h;
    };
    const passend = FARBEN.filter((fb) => deckel(fb) < 800);
    const farbe = passend.length ? s.aus(passend) : [2, 4];
    const p: Erzeugt = {
      ...basis,
      zweitStimme: zweit,
      melodie: bars.flat(),
      akkorde,
      farbe: farbe.slice(),
      versuch,
      rueckfall: false,
      abgenommen: false,
    };
    if (pruefe(p, welt).length === 0) return p;
  }
  // Notausgang: das Weltstueck. Darf nie vorkommen.
  return {
    ...basis,
    melodie: welt.melodie.map((n) => [n[0], n[1]] as Note),
    akkorde: welt.akkorde.slice(),
    farbe: [2, 4],
    versuch: 24,
    rueckfall: true,
    abgenommen: false,
  };
}

// --- Pruefung: die Gesetze der Bestandsaufnahme ------------------------------

function pruefe(p: Erzeugt, welt: (typeof STUECKE)[keyof typeof STUECKE]): string[] {
  const f: string[] = [];
  const L = p.leiter;
  const toene = p.melodie.map((n) => n[0]).filter((t): t is number => t !== null);
  const km = new Set(toene.map(kl));

  // B1 Takte
  let imTakt = 0;
  let takte = 0;
  for (const [, l] of p.melodie) {
    imTakt += l;
    if (imTakt > TAKT) f.push('B1 Note ragt ueber Taktgrenze');
    if (imTakt === TAKT) { takte++; imTakt = 0; }
  }
  if (imTakt !== 0) f.push('B1 letzter Takt unvollstaendig');
  if (takte !== p.akkorde.length) f.push(`B1 ${takte} Takte vs ${p.akkorde.length} Akkorde`);

  // B2 Kopfmotiv
  const kopf = p.melodie.slice(0, 3).map((n) => n[0]);
  let treffer = 0;
  for (let i = 0; i + 3 <= p.melodie.length; i++) {
    if (p.melodie.slice(i, i + 3).every((n, k) => n[0] === kopf[k])) treffer++;
  }
  if (treffer < 2) f.push(`B2 Kopfmotiv nur ${treffer}x`);

  // B3 Atem
  if (p.melodie.filter((n) => n[1] >= 3).length < 3) f.push('B3 keine Atempausen');

  // B4 Ambitus. Der Test erlaubt 24; ein Volkslied lebt in 16, und alles
  // darueber ist auf einem Telefon oben stechend.
  const ambitus = Math.max(...toene) - Math.min(...toene);
  if (ambitus > 24) f.push('B4 Ambitus');
  if (!p.abgenommen && ambitus > 16) f.push(`Ambitus ${ambitus} (Grenze 16)`);

  // B5/B6 Stimmen
  const haltend = ['akkordeon', 'klarinette', 'panfloete', 'okarina', 'leier', 'streicher'];
  if (!haltend.includes(p.melodieStimme) || !haltend.includes(p.zweitStimme)) f.push('B5');
  if (p.melodieStimme === p.zweitStimme) f.push('B6');
  const fam = (x: string) => (GESTRICHEN.includes(x) ? 'g' : GEBLASEN.includes(x) ? 'b' : '?');
  if (fam(p.melodieStimme) === fam(p.zweitStimme)) f.push('C9 gleiche Wellenfamilie');

  // B7 Geraeuschleiter
  for (const st of p.sfxStufen) if (!km.has(kl(st))) f.push(`B7 Stufe ${st} fehlt`);

  // B8 Fanfare
  const vorrat = new Set([...km, ...p.akkorde.map(kl)]);
  for (const st of [0, 4, 7]) if (!vorrat.has(kl(p.fanfareGrund + st))) f.push(`B8 ${st}`);

  // A2 Sechzehntelfigur unter 800 Hz
  const hoch = p.grund * Math.pow(2, (Math.max(...p.akkorde) + Math.max(...ARPEGGIO)) / 12);
  if (hoch >= 800) f.push(`A2 Arpeggio ${hoch.toFixed(0)} Hz`);

  // E3 Harmonie unter 800 Hz (mit der Halbtonschiebung bei knapp). Die Farbe
  // steht in LEITERSTUFEN, das Intervall haengt also an der Wurzel.
  let harm = 0;
  for (const r of p.akkorde) {
    const gr = gradVon(r, L);
    const oben = hs(gr + Math.max(...p.farbe), L) - hs(gr, L);
    harm = Math.max(harm, p.grund * Math.pow(2, (r + oben + 1) / 12));
  }
  if (harm >= 800) f.push(`E3 Harmonie ${harm.toFixed(0)} Hz`);

  // E3 Melodiedecke einschliesslich Oktavdopplung
  const spitze = p.grund * Math.pow(2, (Math.max(...toene) + 1) / 12 + 2);
  if (spitze >= 3000) f.push(`E3 Melodiespitze ${spitze.toFixed(0)} Hz`);

  // F6 Bass nicht tiefer als die Welt
  if (Math.min(...p.akkorde) < Math.min(...welt.akkorde)) f.push('F6 Bass zu tief');

  // Tessitur: die Melodie darf nicht unter die der Welt rutschen (D4)
  const wt = welt.melodie.map((n) => n[0]).filter((t): t is number => t !== null);
  const mittel = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  if (mittel(toene) < mittel(wt) - 1.5) f.push('D4 Tessitur zu tief');
  if (Math.max(...toene) < Math.max(...wt) - 3) f.push('D4 Melodie zu flach');

  // Modus: kein Ton ausserhalb Leiter + Kennton
  const erlaubt = new Set([...L.map(kl), ...(WELT[p.theme].kennChrom !== null ? [kl(WELT[p.theme].kennChrom as number)] : [])]);
  for (const t of km) if (!erlaubt.has(t)) f.push(`Modus: ${t} fremd`);

  // Kennton muss vorkommen
  const kenn = WELT[p.theme].kennChrom ?? hs(WELT[p.theme].kennGrad, L);
  if (!km.has(kl(kenn))) f.push('Kennton fehlt');

  // Sprungregel: innerhalb eines Takts hoechstens eine Quinte, ueber die
  // Taktgrenze (Phrasenanfang) hoechstens eine Oktave.
  let pos = 0;
  for (let i = 1; i < p.melodie.length; i++) {
    pos += p.melodie[i - 1][1];
    const a = p.melodie[i - 1][0], b = p.melodie[i][0];
    if (a === null || b === null) continue;
    const w = Math.abs(b - a);
    const grenze = pos % TAKT === 0 ? 12 : 7;
    if (p.abgenommen) continue;
    if (w > grenze) f.push(`Sprung ${w} Halbtoene`);
    // Der Tritonus ist der eine Sprung, den keine singbare Melodie macht.
    if (w === 6) f.push('Tritonussprung');
  }
  return f;
}

// --- Lauf -------------------------------------------------------------------

function bericht(ids: [string, string][], titel: string) {
  let fehler = 0, rueck = 0, versuche = 0, maxV = 0;
  const gesehen = new Map<string, string>();
  let koll = 0;
  for (const [id, th] of ids) {
    const p = stueckFuer(id, th);
    const f = pruefe(p, STUECKE[th as keyof typeof STUECKE]);
    versuche += p.versuch; maxV = Math.max(maxV, p.versuch);
    if (p.rueckfall) { rueck++; console.log(`RUECKFALL ${id}`); }
    if (f.length) { fehler++; console.log(`FEHLER ${id} (${th}): ${f.join(', ')}`); }
    const key = th + '|' + JSON.stringify(p.melodie);
    if (gesehen.has(key)) { koll++; console.log(`KOLLISION ${id} == ${gesehen.get(key)}`); }
    gesehen.set(key, id);
  }
  console.log(
    `${titel}: ${ids.length} Stuecke, ${fehler} Fehler, ${rueck} Rueckfaelle, ` +
    `${koll} Kollisionen, Versuche im Schnitt ${(versuche / ids.length).toFixed(2)}, hoechstens ${maxV}`,
  );
}

bericht(LEVELS.map((l) => [l.id, l.theme] as [string, string]), 'Bestand');

const WELTEN: [string, string][] = [
  ['w1', 'grass'], ['w2', 'crystal'], ['w3', 'rust'], ['w4', 'frost'],
  ['w5', 'magma'], ['w6', 'sonnenhang'], ['w7', 'wipfel'],
];
const ziel: [string, string][] = [];
for (const [wp, th] of WELTEN) for (let i = 1; i <= 15; i++) ziel.push([`${wp}-${String(i).padStart(2, '0')}`, th]);
bericht(ziel, 'Zielausbau');

// Determinismus
for (const [id, th] of ziel.slice(0, 20)) {
  if (JSON.stringify(stueckFuer(id, th)) !== JSON.stringify(stueckFuer(id, th))) console.log('NICHT DETERMINISTISCH ' + id);
}

// --- Beispiel ---------------------------------------------------------------
const NAMEN = ['C', 'Cis', 'D', 'Es', 'E', 'F', 'Fis', 'G', 'As', 'A', 'B', 'H'];
export function zeige(id: string, th: string) {
  const p = stueckFuer(id, th);
  const nm = (h: number | null) => (h === null ? '--' : NAMEN[kl(h)] + (h >= 12 ? "'" : h < 0 ? ',' : ''));
  console.log(`\n=== ${id} (${th}) versuch=${p.versuch} ===`);
  console.log(`bpm ${p.bpm} grund ${p.grund} ${p.melodieStimme}/${p.zweitStimme} ${p.harmonieStimme} farbe[${p.farbe}]`);
  let i = 0, t = 0, sum = 0;
  let zeile: string[] = [];
  for (const n of p.melodie) {
    zeile.push(`${nm(n[0])}(${n[1]})`);
    sum += n[1];
    if (sum === 8) {
      console.log(`  T${t + 1} akk ${String(p.akkorde[t]).padStart(2)} (${nm(p.akkorde[t])}) | ${zeile.join(' ')}`);
      zeile = []; sum = 0; t++;
    }
    i++;
  }
  void i;
  console.log('  melodie:', JSON.stringify(p.melodie));
  console.log('  akkorde:', JSON.stringify(p.akkorde));
  const tt = p.melodie.map((n) => n[0]).filter((x): x is number => x !== null);
  console.log(`  Melodie ${(p.grund * Math.pow(2, Math.min(...tt) / 12 + 1)).toFixed(0)}..${(p.grund * Math.pow(2, Math.max(...tt) / 12 + 1)).toFixed(0)} Hz, Arpeggiospitze ${(p.grund * Math.pow(2, (Math.max(...p.akkorde) + 12) / 12)).toFixed(0)} Hz, Umlauf ${(60 / p.bpm / 2 * 64).toFixed(1)} s`);
}

// --- Statistik --------------------------------------------------------------
{
  const alle = ziel.map(([id, th]) => stueckFuer(id, th));
  const iv: Record<number, number> = {};
  let noten = 0, amb = 0, koepfe = new Set<string>();
  for (const p of alle) {
    noten += p.melodie.length;
    const t = p.melodie.map((n) => n[0]).filter((x): x is number => x !== null);
    amb += Math.max(...t) - Math.min(...t);
    koepfe.add(p.theme + JSON.stringify(p.melodie.slice(0, 3)));
    for (let i = 1; i < p.melodie.length; i++) {
      const a = p.melodie[i - 1][0], b = p.melodie[i][0];
      if (a === null || b === null) continue;
      iv[Math.abs(b - a)] = (iv[Math.abs(b - a)] ?? 0) + 1;
    }
  }
  const sum = Object.values(iv).reduce((a, b) => a + b, 0);
  console.log(`\nStatistik ueber ${alle.length} Stuecke:`);
  console.log(`  Noten je Stueck ${(noten / alle.length).toFixed(1)}, Ambitus ${(amb / alle.length).toFixed(1)} Halbtoene`);
  console.log(`  verschiedene Kopfmotive: ${koepfe.size}`);
  console.log('  Intervalle: ' + Object.keys(iv).map(Number).sort((a, b) => a - b)
    .map((k) => `${k}:${((iv[k] / sum) * 100).toFixed(0)}%`).join(' '));
  const schritte = (iv[1] ?? 0) + (iv[2] ?? 0) + (iv[0] ?? 0);
  console.log(`  Schritt oder Wiederholung: ${((schritte / sum) * 100).toFixed(0)}%`);
}

{
  const proWelt: Record<string, Set<string>> = {};
  const kopfW: Record<string, Set<string>> = {};
  for (const [id, th] of ziel) {
    const p = stueckFuer(id, th);
    (proWelt[th] ??= new Set()).add(JSON.stringify(p.melodie));
    (kopfW[th] ??= new Set()).add(JSON.stringify(p.melodie.slice(0, 3)));
  }
  console.log('\nVielfalt je Welt (15 Level):');
  for (const th of Object.keys(proWelt))
    console.log(`  ${th.padEnd(11)} ${proWelt[th].size} verschiedene Melodien, ${kopfW[th].size} verschiedene Kopfmotive`);
}

for (const id of ['w1-04', 'w1-07', 'w2-05', 'w3-03', 'w4-09', 'w5-06', 'w6-02']) {
  zeige(id, LEVELS.find((l) => l.id === id)?.theme ?? ziel.find(([i]) => i === id)![1]);
}
