/*
 * Weg A, zweite Fassung — Variation des Weltstuecks je Level.
 *
 * Unterschied zu `musikweg-a.mts`: Dort wurden einzelne Takte mit Operatoren
 * angestupst (im Mittel 1,2 von 8 Takten). Hier wird der Achttakter als
 * STROPHE begriffen: Kopf und Kadenz der Welt bleiben stehen, Antwort,
 * Mittelteil und Rueckfuehrung werden neu erfunden — aus dem Tonvorrat, dem
 * Rhythmusvorrat und dem Akkordvorrat DERSELBEN Welt.
 *
 * Nicht Teil des Spiels.
 */
import { ARPEGGIO, STUECKE } from '../src/audio/music';
import { LEVELS } from '../src/levels/index';

type Note = [number | null, number];
type Takt = Note[];
const TAKT = 8;
const PULSSTELLEN = [0, 3, 6];
const kl = (t: number) => ((t % 12) + 12) % 12;

type Welt0 = (typeof STUECKE)[keyof typeof STUECKE];

// --- Werkzeug ---------------------------------------------------------------

function inTakte(m: readonly (readonly [number | null, number])[]): Takt[] {
  const out: Takt[] = [];
  let cur: Takt = [];
  let sum = 0;
  for (const n of m) {
    cur.push([n[0], n[1]]);
    sum += n[1];
    if (sum === TAKT) {
      out.push(cur);
      cur = [];
      sum = 0;
    }
  }
  return out;
}
const flach = (b: Takt[]): Note[] => b.flat();
const toene = (m: readonly Note[]) => m.filter((n) => n[0] !== null).map((n) => n[0] as number);
const klassen = (m: readonly Note[]) => new Set(toene(m).map(kl));
const summe = (b: Takt) => b.reduce((a, n) => a + n[1], 0);

/** Index in die Leiter, an den Raendern gespiegelt statt gekappt. */
function spiegle(i: number, n: number): number {
  let x = i;
  let wache = 0;
  while ((x < 0 || x >= n) && wache++ < 8) {
    if (x < 0) x = -x;
    if (x >= n) x = 2 * (n - 1) - x;
  }
  return Math.max(0, Math.min(n - 1, x));
}

function ggt(a: number, b: number): number {
  return b === 0 ? a : ggt(b, a % b);
}

// --- Die Welt auseinandernehmen --------------------------------------------

interface Rhythmus {
  l: number[];
  pause: boolean[];
  /** Traegt dieser Takt einen langen Ton (>= 3 Achtel)? Zaehlt fuer B3. */
  lang: number;
}

interface Welt {
  name: string;
  quelle: Welt0;
  bars: Takt[];
  akkorde: number[];
  tief: number;
  hoch: number;
  /** Tonklassen, aus denen erzeugte Takte schoepfen duerfen. */
  alphabet: number[];
  /**
   * Die seltenen Toene der Welt und der Akkord, ueber dem die Welt sie
   * selbst singt — das Fis der Wiese steht ueber C und nirgends sonst.
   * Ein Farbton unter einem anderen Akkord ist kein Farbton, sondern ein
   * falscher Ton.
   */
  farbtoene: { klasse: number; wurzel: number }[];
  /** Absolute Tonhoehen des Alphabets im Ambitus der Welt, aufsteigend. */
  leiter: number[];
  rhythmen: Rhythmus[];
  /** Die Akkordgrundtoene, die diese Welt ueberhaupt benutzt. */
  wurzeln: number[];
  /** Tonklassen, die im Vorrat des Stuecks bleiben MUESSEN (B7 + B8). */
  pflicht: number[];
  /** Die vier Gangarten des Weltstuecks. */
  gangarten: number[];
  /** Zweitstimmen aus der jeweils anderen Klangfamilie. */
  antworten: string[];
  /** Die vorgerechneten Akkordplaene. */
  akkordplaene: number[][];
}

const GESTRICHEN = ['leier', 'streicher', 'akkordeon'];
const GEBLASEN = ['okarina', 'klarinette', 'panfloete'];
const familie = (s: string) => (GESTRICHEN.includes(s) ? 'g' : 'b');

/** Die feststehenden Takte: Kopf (1), Kopfwiederholung (3), Kadenz (8). */
const FEST = [0, 2, 7];
const FREI = [1, 3, 4, 5, 6];

function analysiere(name: string, w: Welt0): Welt {
  const bars = inTakte(w.melodie);
  const alle = toene(flach(bars));
  const tief = Math.min(...alle);
  const hoch = Math.max(...alle);

  const zaehl = new Map<number, number>();
  for (const t of alle) zaehl.set(kl(t), (zaehl.get(kl(t)) ?? 0) + 1);

  const pflicht = new Set<number>();
  for (const s of w.sfxStufen) pflicht.add(kl(s));
  for (const s of [0, 4, 7]) pflicht.add(kl(w.fanfareGrund + s));

  // Kern: was die Welt mehr als einmal sagt. Dazu der Grundton und alles,
  // was ohnehin im Vorrat bleiben muss.
  const alphabet = new Set<number>([0, ...pflicht]);
  for (const [c, n] of zaehl) if (n >= 2) alphabet.add(c);
  // Farbtoene: die Einzelstuecke der Welt (das Fis der Wiese, die kleine
  // Sexte der Klamm). Sie gehoeren NICHT ins Alphabet — sie werden gesetzt.
  // Nur Farbtoene, die in einem FREIEN Takt stehen: was ohnehin in Takt 1,
  // 3 oder 8 sitzt, bleibt von selbst erhalten und braucht keine Regel.
  const farbtoene: { klasse: number; wurzel: number }[] = [];
  for (const [c, n] of [...zaehl.entries()].sort((a, b) => a[0] - b[0])) {
    if (n > 1 || c === 0 || pflicht.has(c)) continue;
    let takt = -1;
    bars.forEach((b, i) => {
      for (const x of b) if (x[0] !== null && kl(x[0]) === c) takt = i;
    });
    if (takt < 0 || FEST.includes(takt)) continue;
    farbtoene.push({ klasse: c, wurzel: w.akkorde[takt] });
  }

  const leiter: number[] = [];
  for (let p = tief; p <= hoch; p++) if (alphabet.has(kl(p))) leiter.push(p);

  // Rhythmusvorrat: die Taktrhythmen der Welt selbst, entdoppelt. Damit ist
  // B1 (jeder Takt genau acht Achtel) baulich erfuellt und nicht geprueft.
  const rhythmen: Rhythmus[] = [];
  for (const b of bars) {
    const r: Rhythmus = {
      l: b.map((n) => n[1]),
      pause: b.map((n) => n[0] === null),
      lang: b.filter((n) => n[1] >= 3 && n[0] !== null).length,
    };
    if (!rhythmen.some((x) => x.l.join() === r.l.join() && x.pause.join() === r.pause.join())) {
      rhythmen.push(r);
    }
  }

  const wurzeln = [...new Set(w.akkorde)].sort((a, b) => a - b);
  const gangarten = [Math.round(w.bpm * 0.93), w.bpm, Math.round(w.bpm * 1.07)];
  const antworten = (familie(w.melodieStimme) === 'g' ? GEBLASEN : GESTRICHEN).slice();

  const welt: Welt = {
    name,
    quelle: w,
    bars,
    akkorde: w.akkorde.slice(),
    tief,
    hoch,
    alphabet: [...alphabet].sort((a, b) => a - b),
    farbtoene,
    leiter,
    rhythmen,
    wurzeln,
    pflicht: [...pflicht].sort((a, b) => a - b),
    gangarten,
    antworten,
    akkordplaene: [],
  };
  welt.akkordplaene = akkordplaene(welt);
  return welt;
}

/**
 * Alle zulaessigen Akkordfolgen dieser Welt.
 *
 * Die Takte 1, 3 und 8 behalten den Akkord der Welt. Die uebrigen fuenf
 * duerfen jeden Grundton nehmen, den die Welt SELBST benutzt — damit koennen
 * Hoechst- und Tiefstwert die Welt nicht verlassen (A2 und F6 sind damit
 * baulich erfuellt), und der Tonvorrat bleibt der der Welt.
 */
function akkordplaene(w: Welt): number[][] {
  const tonika = w.akkorde[0];
  const alle: number[][] = [];
  const rek = (t: number, cur: number[]) => {
    if (t === FREI.length) {
      const plan = w.akkorde.slice();
      FREI.forEach((b, k) => (plan[b] = cur[k]));
      // Jede Akkordfarbe der Welt muss vorkommen — sonst verliert die
      // Fanfare (B8) ihren Dreiklang.
      for (const r of w.wurzeln) if (!plan.includes(r)) return;
      // Takt 2 geht von der Tonika weg. Eine Antwort, die stehen bleibt,
      // ist keine.
      if (plan[1] === tonika) return;
      // Die Antwort geht woandershin als ihre Wiederholung.
      if (plan[1] === plan[3]) return;
      // Takt 7 traegt nie die Tonika: Ein Stueck, das vor der Kadenz schon
      // zu Hause ist, kommt nicht mehr herum. Alle sieben Weltstuecke
      // halten sich daran — die Regel ist abgelesen, nicht erfunden.
      if (plan[6] === tonika) return;
      // Harmonischer Stillstand: nie drei gleiche Grundtoene in Folge, und
      // die Tonika hoechstens in der Haelfte der Takte.
      for (let i = 2; i < plan.length; i++) {
        if (plan[i] === plan[i - 1] && plan[i] === plan[i - 2]) return;
      }
      if (plan.filter((r) => r === tonika).length > 4) return;
      alle.push(plan);
      return;
    }
    for (const r of w.wurzeln) rek(t + 1, [...cur, r]);
  };
  rek(0, []);
  // Gleichmaessig ausduennen statt die ersten nehmen: die lexikographisch
  // ersten Plaene unterscheiden sich nur in der letzten Stelle.
  if (alle.length <= 64) return alle;
  const s = Math.max(1, Math.floor(alle.length / 64));
  const out: number[][] = [];
  for (let i = 0; i < alle.length && out.length < 64; i += s) out.push(alle[i]);
  return out;
}

// --- Melodie bauen ----------------------------------------------------------

/**
 * Konturen als Schrittfolgen auf der Leiter. Keine davon laeuft geradeaus:
 * jede kehrt einmal um. Eine Melodie ohne Umkehr ist eine Tonleiter.
 */
const KONTUREN: number[][] = [
  [1, 1, -1, 1, -2],
  [1, -1, 2, -1, -1],
  [1, 2, -1, -1, -1],
  [1, -2, 1, 1, -1],
  [-1, 1, 1, -1, -2],
  [-1, -1, 2, 1, -1],
  [2, -1, -1, 2, -1],
  [-2, 1, 1, -1, 1],
];

/**
 * Wo die Zeile ansetzt: auf dem Akkordton, der dem Vorton am naechsten
 * liegt, oder auf dem darueber bzw. darunter. Ohne diese Wahl faengt jede
 * erzeugte Zeile derselben Welt auf demselben Ton an — der haeufigste Weg,
 * auf dem ein Verfahren seine eigene Vielfalt wieder einsammelt.
 */
const ANSATZ = [0, 1, -1];

/** Akkordtoene eines Grundtons, als Leiterindizes. */
function akkordIdx(w: Welt, wurzel: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < w.leiter.length; i++) {
    if ([0, 3, 4, 7].includes(kl(w.leiter[i] - wurzel))) out.push(i);
  }
  return out;
}

/** Der Leiterindex, der einem Zielton am naechsten liegt. */
function nahestes(kandidaten: number[], w: Welt, ziel: number): number {
  let best = kandidaten[0];
  let d = Infinity;
  for (const i of kandidaten) {
    const e = Math.abs(w.leiter[i] - ziel);
    if (e < d - 1e-9) {
      d = e;
      best = i;
    }
  }
  return best;
}

/** Ansatzton: der n-te Akkordton neben dem, der dem Vorton am naechsten liegt. */
function ansetzen(w: Welt, wurzel: number, ziel: number, versatz: number): number {
  const kand = akkordIdx(w, wurzel);
  const nah = nahestes(kand, w, ziel);
  const k = kand.indexOf(nah);
  return kand[Math.max(0, Math.min(kand.length - 1, k + versatz))];
}

function baueTakt(
  w: Welt,
  r: Rhythmus,
  kontur: number[],
  startIdx: number,
): { noten: Takt; endIdx: number } {
  const noten: Takt = [];
  let idx = startIdx;
  let erster = true;
  let k = 0;
  for (let j = 0; j < r.l.length; j++) {
    if (r.pause[j]) {
      noten.push([null, r.l[j]]);
      continue;
    }
    if (!erster) {
      idx = spiegle(idx + kontur[k % kontur.length], w.leiter.length);
      k++;
    }
    erster = false;
    noten.push([w.leiter[idx], r.l[j]]);
  }
  return { noten, endIdx: idx };
}

// --- Der Plan ---------------------------------------------------------------

interface Plan {
  r2: number;
  k2: number;
  s2: number;
  v24: number;
  r5: number;
  k5: number;
  s5: number;
  b56: number;
  t7welt: number;
  r7: number;
  k7: number;
  akk: number;
  farb: number;
  bogen: number;
}

const VERSATZ24 = [-2, -1, 1, 2];
const BEZUG56 = ['umkehr', 'sequenz+', 'sequenz-', 'wiederhol'];

function radizes(w: Welt): number[] {
  return [
    w.rhythmen.length, // r2
    KONTUREN.length, // k2
    ANSATZ.length, // s2
    VERSATZ24.length, // v24
    w.rhythmen.length, // r5
    KONTUREN.length, // k5
    ANSATZ.length, // s5
    BEZUG56.length, // b56
    2, // t7welt
    w.rhythmen.length, // r7
    KONTUREN.length, // k7
    Math.max(1, Math.min(64, w.akkordplaene.length)), // akk
    w.farbtoene.length + 1, // farb
    3, // bogen: welcher freie Takt den Scheitel traegt
  ];
}

function entziffere(w: Welt, code: number): Plan {
  const r = radizes(w);
  const v: number[] = [];
  let c = code;
  for (const b of r) {
    v.push(c % b);
    c = Math.floor(c / b);
  }
  return {
    r2: v[0], k2: v[1], s2: v[2], v24: v[3], r5: v[4], k5: v[5], s5: v[6],
    b56: v[7], t7welt: v[8], r7: v[9], k7: v[10], akk: v[11], farb: v[12],
    bogen: v[13],
  };
}

function raum(w: Welt): number {
  return radizes(w).reduce((a, b) => a * b, 1);
}

/**
 * Die Schrittweite, mit der der Planraum abgeschritten wird.
 *
 * Sie muss zum Raum teilerfremd sein (dann trifft sie jeden Plan genau
 * einmal) und in seiner Groessenordnung liegen. Eine kleine Schrittweite
 * waere der stille Fehler dieses Verfahrens: Sie laesst die hohen Stellen
 * der Zahl — Akkordplan, Farbton — nie aus der Null herauskommen, und dann
 * unterscheiden sich die Strophen nur in den Kleinigkeiten.
 */
function schrittweite(n: number): number {
  let s = Math.floor(n * 0.6180339887498949);
  if (s % 2 === 0) s++;
  for (let k = 0; k < 4096; k++) {
    const kand = s + 2 * k;
    if (kand < n && ggt(kand, n) === 1) return kand;
  }
  return 1;
}

// --- Ein Stueck aus einem Plan ---------------------------------------------

interface Erzeugt {
  melodie: Note[];
  akkorde: number[];
  farbe: number[];
  bpm: number;
  grund: number;
  melodieStimme: string;
  zweitStimme: string;
  harmonieStimme: string;
  sfxStufen: readonly number[];
  fanfareGrund: number;
  theme: string;
  /** Diagnose */
  code: number;
  plan?: Plan;
  weltstueck: boolean;
}

function baueMelodie(w: Welt, p: Plan): Takt[] | null {
  const bars: Takt[] = w.bars.map((b) => b.map((n) => [n[0], n[1]] as Note));
  const akk = w.akkordplaene.length
    ? w.akkordplaene[p.akk % w.akkordplaene.length]
    : w.akkorde.slice();

  const letzterKlang = (b: Takt): number | null => {
    for (let i = b.length - 1; i >= 0; i--) if (b[i][0] !== null) return b[i][0] as number;
    return null;
  };
  const ersterKlang = (b: Takt): number | null => {
    for (const n of b) if (n[0] !== null) return n[0] as number;
    return null;
  };

  // --- Takt 2: die Antwort auf den Kopf ---
  const start2 = ansetzen(w, akk[1], letzterKlang(bars[0]) ?? w.tief, ANSATZ[p.s2]);
  const t2 = baueTakt(w, w.rhythmen[p.r2], KONTUREN[p.k2], start2);
  bars[1] = t2.noten;

  // --- Takt 4: dieselbe Gestalt, versetzt. Das ist die Sequenz, und sie ist
  //     der Grund, warum die neue Strophe zusammenhaengt statt zu maeandern.
  const start4 = spiegle(
    nahestes(akkordIdx(w, akk[3]), w, letzterKlang(bars[2]) ?? w.tief) + VERSATZ24[p.v24],
    w.leiter.length,
  );
  const t4 = baueTakt(w, w.rhythmen[p.r2], KONTUREN[p.k2], start4);
  bars[3] = t4.noten;

  // --- Takt 5: der Mittelteil. Er darf springen — hier geht das Stueck
  //     einmal woandershin, wie in allen sieben Weltstuecken.
  const start5 = ansetzen(w, akk[4], (letzterKlang(bars[3]) ?? w.tief) + 4, ANSATZ[p.s5]);
  const t5 = baueTakt(w, w.rhythmen[p.r5], KONTUREN[p.k5], start5);
  bars[4] = t5.noten;

  // --- Takt 6: die Antwort im Mittelteil ---
  const bez = BEZUG56[p.b56];
  const k5 = KONTUREN[p.k5];
  const k6 =
    bez === 'umkehr' ? k5.map((x) => -x) : bez === 'wiederhol' ? k5 : k5.map((x) => x);
  const off = bez === 'sequenz+' ? 1 : bez === 'sequenz-' ? -1 : bez === 'wiederhol' ? -2 : 0;
  const start6 = spiegle(
    nahestes(akkordIdx(w, akk[5]), w, letzterKlang(bars[4]) ?? w.tief) + off,
    w.leiter.length,
  );
  const t6 = baueTakt(w, w.rhythmen[p.r5], k6, start6);
  bars[5] = t6.noten;

  // --- Takt 7: Rueckfuehrung. Entweder der Takt der Welt (dann steht der
  //     Kopf zum dritten Mal da, wie im Original) oder eine eigene Zeile,
  //     die in die Kadenz laeuft.
  if (p.t7welt === 0) {
    bars[6] = w.bars[6].map((n) => [n[0], n[1]] as Note);
  } else {
    const ziel = ersterKlang(bars[7]) ?? w.tief;
    const start7 = nahestes(akkordIdx(w, akk[6]), w, letzterKlang(bars[5]) ?? w.tief);
    const t7 = baueTakt(w, w.rhythmen[p.r7], KONTUREN[p.k7], start7);
    // Der letzte Ton muss in die Kadenz fuehren, nicht neben ihr landen.
    const l = t7.noten.length - 1;
    let li = l;
    while (li >= 0 && t7.noten[li][0] === null) li--;
    if (li < 0) return null;
    const kand = w.leiter
      .map((_, i) => i)
      .filter((i) => Math.abs(w.leiter[i] - ziel) <= 4 && Math.abs(w.leiter[i] - ziel) >= 1);
    if (!kand.length) return null;
    t7.noten[li] = [w.leiter[nahestes(kand, w, t7.noten[li][0] as number)], t7.noten[li][1]];
    bars[6] = t7.noten;
  }

  // --- Farbton setzen: das eine Fis der Wiese, die eine kleine Sexte der
  //     Klamm. Genau einmal, im Mittelteil, auf einer leichten Zeit — so,
  //     wie die Welt selbst ihn setzt. Ein Farbton auf schwerer Zeit waere
  //     kein Farbton mehr, sondern eine Modulation.
  if (p.farb > 0 && w.farbtoene.length) {
    const ft = w.farbtoene[(p.farb - 1) % w.farbtoene.length];
    const c = ft.klasse;
    let gesetzt = false;
    for (const bi of FREI) {
      // Nur unter dem Akkord, unter dem die Welt diesen Ton selbst singt.
      if (gesetzt || akk[bi] !== ft.wurzel) continue;
      const ziel = bars[bi];
      let pos = 0;
      for (let j = 0; j < ziel.length && !gesetzt; j++) {
        const n = ziel[j];
        if (n[0] !== null && !PULSSTELLEN.includes(pos) && n[1] <= 2) {
          const h = n[0] as number;
          for (const kand of [h + 1, h - 1, h + 2, h - 2]) {
            if (kl(kand) === c && kand >= w.tief && kand <= w.hoch) {
              ziel[j] = [kand, n[1]];
              gesetzt = true;
              break;
            }
          }
        }
        pos += n[1];
      }
    }
    // Verlangt der Plan den Farbton und ist keine Stelle dafuer da, dann ist
    // es nicht dieser Plan. Sonst waere die Ziffer eine Angabe ohne Wirkung.
    if (!gesetzt) return null;
  }

  return bars;
}

// --- Die Gesetze ------------------------------------------------------------

/** Missklaenge auf den schweren Zeiten eines Takts. */
function misstoene(bar: Takt, wurzel: number, folge: number | null): number {
  const ak = new Set([0, 3, 4, 7, 10].map((iv) => kl(wurzel + iv)));
  let pos = 0;
  let zahl = 0;
  for (let i = 0; i < bar.length; i++) {
    const n = bar[i];
    if (PULSSTELLEN.includes(pos) && n[0] !== null && n[1] >= 2 && !ak.has(kl(n[0] as number))) {
      const naechst = i + 1 < bar.length ? bar[i + 1][0] : folge;
      if (naechst === null || Math.abs(naechst - (n[0] as number)) > 2) zahl++;
    }
    pos += n[1];
  }
  return zahl;
}

/** Die musikalische Pruefung. Was hier durchfaellt, klaenge schlecht. */
function klingt(w: Welt, bars: Takt[], akk: number[]): string | null {
  const m = flach(bars);
  const t = toene(m);

  // Q1/Q2 — Spruenge und ihre Aufloesung.
  const folge: number[] = [];
  for (const n of m) if (n[0] !== null) folge.push(n[0] as number);
  for (let i = 1; i < folge.length; i++) {
    const d = folge[i] - folge[i - 1];
    if (Math.abs(d) > 7) return `Sprung ${d}`;
    if (Math.abs(d) >= 5 && i + 1 < folge.length) {
      const e = folge[i + 1] - folge[i];
      if (Math.sign(e) === Math.sign(d) || Math.abs(e) > 4) return `Sprung ${d} ohne Gegenschritt`;
    }
  }
  // Q3 — kein Ton mehr als dreimal hintereinander.
  let lauf = 1;
  for (let i = 1; i < folge.length; i++) {
    lauf = folge[i] === folge[i - 1] ? lauf + 1 : 1;
    if (lauf > 3) return 'Tonwiederholung';
  }
  // Q4 — keine Missklaenge auf schweren Zeiten.
  for (const b of FREI) {
    const naechst = bars[(b + 1) % 8].find((n) => n[0] !== null);
    const f = naechst ? (naechst[0] as number) : null;
    if (misstoene(bars[b], akk[b], f) > 0) return `Misston in Takt ${b + 1}`;
  }
  // Q5 — die freien Takte muessen sich alle unterscheiden. Zwei gleiche
  // Takte sind kein Parallelismus, sondern eine Wiederholung ohne Antwort.
  const gestalt = (b: Takt) => b.map((n) => `${n[0]}:${n[1]}`).join(',');
  const g = FREI.map((i) => gestalt(bars[i]));
  if (new Set(g).size < FREI.length) return 'freie Takte zu gleich';
  // Q5b — kein freier Takt darf auf zwei Toenen dahindaempeln.
  for (const i of FREI) {
    const th = toene(bars[i]);
    if (!th.length) return `Takt ${i + 1} leer`;
    if (new Set(th).size < Math.min(3, th.length)) return `Takt ${i + 1} zu eng`;
    if (Math.max(...th) - Math.min(...th) < 3) return `Takt ${i + 1} ohne Spanne`;
  }
  // Q5c — der Mittelteil ist der Scheitel des Stuecks. Alle sieben
  // Weltstuecke halten das ein; die Regel ist abgelesen, nicht erfunden.
  const hoehe = (ii: number[]) => Math.max(...ii.flatMap((i) => toene(bars[i])));
  if (hoehe([4, 5]) < hoehe([0, 1, 2, 3])) return 'Mittelteil liegt zu tief';
  // Q6 — die Strophe muss sich vom Weltstueck unterscheiden.
  const gleich = FREI.filter((i) => gestalt(bars[i]) === gestalt(w.bars[i])).length;
  if (gleich > 2) return 'zu nah am Weltstueck';
  // Q7 — Ambitus: nicht duempeln, aber auch nicht schreien.
  const spanne = Math.max(...t) - Math.min(...t);
  if (spanne < 7) return `Ambitus ${spanne}`;
  // Q8 — der Scheitel gehoert in die Mitte, nicht kurz vor die Kadenz.
  let scheitelTakt = -1;
  bars.forEach((b, i) => {
    for (const n of b) if (n[0] !== null && n[0] === Math.max(...t)) scheitelTakt = i;
  });
  if (scheitelTakt === 6) return 'Scheitel in Takt 7';
  // Q9 — der Grundton darf nicht in jedem freien Takt kleben.
  const grundlastig = FREI.filter((i) => bars[i].some((n) => n[0] !== null && kl(n[0]) === 0)).length;
  if (grundlastig >= 5) return 'grundtonlastig';
  // B3 baulich: drei Toene von drei Achteln oder mehr. Ohne sie hoert man
  // kein Phrasenende und damit auch keinen Anfang.
  if (m.filter((n) => n[0] !== null && n[1] >= 3).length < 3) return 'keine Atempausen';
  // B7 baulich: JEDE Stufe der Geraeuschleiter muss in der MELODIE stehen —
  // nicht in den Akkorden. Sonst steht jedes gestimmte Spielgeraeusch schief.
  const km = klassen(m);
  for (const s of w.quelle.sfxStufen) if (!km.has(kl(s))) return `Leiterstufe ${s} fehlt`;
  // B8 baulich: der Durdreiklang der Fanfare, hier reicht Melodie ODER Akkord.
  const vorrat = new Set([...km, ...akk.map(kl)]);
  for (const s of [0, 4, 7]) {
    if (!vorrat.has(kl(w.quelle.fanfareGrund + s))) return `Fanfarenton ${s} fehlt`;
  }
  return null;
}

/** Die Abnahmegesetze aus tests/musik.test.ts und den Dokumenten. */
function pruefe(p: Erzeugt, w: Welt): string[] {
  const f: string[] = [];
  const t = toene(p.melodie);

  // B1 — jeder Takt genau voll, so viele Takte wie Akkorde. Auch F1/F2.
  let imTakt = 0;
  let takte = 0;
  for (const [, l] of p.melodie) {
    if (!Number.isInteger(l) || l < 1) f.push('F1 Notenlaenge');
    imTakt += l;
    if (imTakt > TAKT) f.push('B1 Note ragt ueber die Taktgrenze');
    if (imTakt === TAKT) {
      takte++;
      imTakt = 0;
    }
  }
  if (imTakt !== 0) f.push('B1 letzter Takt unvollstaendig');
  if (takte !== p.akkorde.length) f.push(`B1 ${takte} Takte vs ${p.akkorde.length} Akkorde`);
  if (takte % 1 !== 0 || (takte * TAKT) % TAKT !== 0) f.push('F2 Raster');

  // B2 — Kopfmotiv kehrt wieder.
  const kopf = p.melodie.slice(0, 3).map((n) => n[0]);
  let treffer = 0;
  for (let i = 0; i + 3 <= p.melodie.length; i++) {
    if (p.melodie.slice(i, i + 3).every((n, k) => n[0] === kopf[k])) treffer++;
  }
  if (treffer < 2) f.push(`B2 Kopfmotiv ${treffer}x`);

  // B3 — Atempausen.
  if (p.melodie.filter((n) => n[0] !== null && n[1] >= 3).length < 3) f.push('B3 Atempausen');

  // B4 — singbare Lage.
  if (Math.max(...t) - Math.min(...t) > 24) f.push('B4 Ambitus');

  // B5/B6 — haltende Stimmen, und zwei verschiedene.
  const haltend = ['akkordeon', 'klarinette', 'panfloete', 'okarina', 'leier', 'streicher'];
  if (!haltend.includes(p.melodieStimme) || !haltend.includes(p.zweitStimme)) f.push('B5');
  if (p.melodieStimme === p.zweitStimme) f.push('B6');
  // C9 — der Wechsel muss die Klangfamilie wechseln, sonst ist er keiner.
  if (familie(p.melodieStimme) === familie(p.zweitStimme)) f.push('C9 gleiche Klangfamilie');
  // F3
  if (!['ukulele', 'kalimba'].includes(p.harmonieStimme)) f.push('F3');
  // F4
  if (!p.melodie.length) f.push('F4');

  // B7 — Geraeuschleiter aus Toenen der Melodie.
  const km = klassen(p.melodie);
  for (const s of p.sfxStufen) if (!km.has(kl(s))) f.push(`B7 Stufe ${s}`);

  // B8 — Durdreiklang auf dem Fanfarengrundton.
  const vorrat = new Set([...km, ...p.akkorde.map(kl)]);
  for (const s of [0, 4, 7]) if (!vorrat.has(kl(p.fanfareGrund + s))) f.push(`B8 ${s}`);

  // A2 — die Sechzehntelfigur bleibt unter dem Melodiefenster.
  const hoch = p.grund * Math.pow(2, (Math.max(...p.akkorde) + Math.max(...ARPEGGIO)) / 12);
  if (hoch >= 800) f.push(`A2 ${hoch.toFixed(0)} Hz`);

  // E3 — Harmoniegriff unter 800 Hz, auch bei der Halbtonschiebung.
  const harm = p.grund * Math.pow(2, (Math.max(...p.akkorde) + 1 + Math.max(...p.farbe)) / 12);
  if (harm >= 800) f.push(`E3 Harmonie ${harm.toFixed(0)} Hz`);

  // E3 — Oktavdopplung der Melodie unter 3 kHz.
  const spitze = p.grund * Math.pow(2, Math.max(...t) / 12 + 2);
  if (spitze >= 3000) f.push(`E3 Melodiespitze ${spitze.toFixed(0)} Hz`);

  // F6 — der Bass nicht tiefer als in der Welt.
  if (Math.min(...p.akkorde) < Math.min(...w.akkorde)) f.push('F6 Bass');

  return f;
}

// --- Das Verfahren ----------------------------------------------------------

const WELTEN = new Map<string, Welt>();
for (const [name, s] of Object.entries(STUECKE)) WELTEN.set(name, analysiere(name, s));

/** Die angenommenen Plaene einer Welt, in fester Reihenfolge. */
const PLAENE = new Map<string, Takt[][]>();
const PLANCODES = new Map<string, number[]>();

function plaeneVon(w: Welt, wieviele: number): { bars: Takt[]; code: number }[] {
  const raumN = raum(w);
  const s = schrittweite(raumN);
  const out: { bars: Takt[]; code: number }[] = [];
  const gesehen = new Set<string>();
  for (let j = 1; out.length < wieviele && j < 200000; j++) {
    const code = (j * s) % raumN;
    const p = entziffere(w, code);
    const bars = baueMelodie(w, p);
    if (!bars) continue;
    if (bars.some((b) => summe(b) !== TAKT)) continue;
    const akk = w.akkordplaene.length
      ? w.akkordplaene[p.akk % w.akkordplaene.length]
      : w.akkorde.slice();
    if (klingt(w, bars, akk)) continue;
    const schl = flach(bars).map((n) => `${n[0]}:${n[1]}`).join(',') + '|' + akk.join(',');
    if (gesehen.has(schl)) continue;
    gesehen.add(schl);
    out.push({ bars, code });
  }
  return out;
}

function nummer(id: string): number {
  const m = /^w\d+-(\d+)$/.exec(id);
  return m ? parseInt(m[1], 10) : 1;
}

const CACHE = new Map<string, Erzeugt>();

export function stueckFuer(levelId: string, theme: string): Erzeugt {
  const schl = theme + '/' + levelId;
  const da = CACHE.get(schl);
  if (da) return da;
  const w = WELTEN.get(theme)!;
  const q = w.quelle;
  const n = nummer(levelId);

  // Level 1 ist das abgenommene Weltstueck, Note fuer Note. Es ist die
  // Strophe, auf die sich alle anderen beziehen — und auf der Weltkarte
  // laeuft dasselbe.
  if (n <= 1) {
    const e: Erzeugt = {
      melodie: q.melodie.map((x) => [x[0], x[1]] as Note),
      akkorde: q.akkorde.slice(),
      farbe: q.farbe.slice(),
      bpm: q.bpm,
      grund: q.grund,
      melodieStimme: q.melodieStimme,
      zweitStimme: q.zweitStimme,
      harmonieStimme: q.harmonieStimme,
      sfxStufen: q.sfxStufen,
      fanfareGrund: q.fanfareGrund,
      theme,
      code: -1,
      weltstueck: true,
    };
    CACHE.set(schl, e);
    return e;
  }

  const m = n - 2;
  let liste = PLAENE.get(theme);
  if (!liste || liste.length <= m) {
    const p = plaeneVon(w, m + 4);
    PLAENE.set(theme, p.map((x) => x.bars));
    PLANCODES.set(theme, p.map((x) => x.code));
    liste = PLAENE.get(theme)!;
  }
  const bars = liste[m];
  const code = PLANCODES.get(theme)![m];
  const plan = entziffere(w, code);
  const akk = w.akkordplaene.length
    ? w.akkordplaene[plan.akk % w.akkordplaene.length]
    : w.akkorde.slice();

  // --- Die Schrauben, die nicht am Notentext haengen ---
  const gang = w.gangarten[m % 3];
  const zweit = w.antworten[Math.floor(m / 3) % w.antworten.length];
  const harm = Math.floor(m / 2) % 2 === 0 ? q.harmonieStimme : q.harmonieStimme === 'ukulele' ? 'kalimba' : 'ukulele';
  const farbe = farbvariante(w, Math.floor(m / 5) % 3, Math.max(...akk));

  const e: Erzeugt = {
    melodie: flach(bars),
    akkorde: akk,
    farbe,
    bpm: gang,
    grund: q.grund,
    melodieStimme: q.melodieStimme,
    zweitStimme: zweit,
    harmonieStimme: harm,
    sfxStufen: q.sfxStufen,
    fanfareGrund: q.fanfareGrund,
    theme,
    code,
    plan,
    weltstueck: false,
  };
  CACHE.set(schl, e);
  return e;
}

function farbvariante(w: Welt, v: number, maxAkk: number): number[] {
  const f = w.quelle.farbe.slice();
  if (v === 0) return f;
  const kand = v === 1 ? [9, 10, 11, 2] : [2, 11, 10, 9];
  for (const z of kand) {
    if (f.includes(z)) continue;
    if (!w.alphabet.includes(kl(z))) continue;
    const hoch = w.quelle.grund * Math.pow(2, (maxAkk + 1 + Math.max(...f, z)) / 12);
    if (hoch >= 800) continue;
    return [...f, z].sort((a, b) => a - b);
  }
  return f;
}

// ===========================================================================
// Lauf
// ===========================================================================

const NAMEN = ['C', 'Cis', 'D', 'Es', 'E', 'F', 'Fis', 'G', 'As', 'A', 'B', 'H'];

function bericht() {
  console.log('=== Weltanalyse ===');
  for (const [name, w] of WELTEN) {
    console.log(
      `${name.padEnd(11)} Alphabet [${w.alphabet.join(',')}]  Farbtoene [${w.farbtoene.map((x) => `${x.klasse}ueber${x.wurzel}`).join(' ')}]  ` +
        `Leiter ${w.leiter.length} (${w.tief}..${w.hoch})  Rhythmen ${w.rhythmen.length}  ` +
        `Wurzeln [${w.wurzeln.join(',')}]  Akkordplaene ${w.akkordplaene.length}  ` +
        `Gang [${w.gangarten.join('/')}]  Raum ${raum(w).toExponential(2)}`,
    );
  }

  console.log('\n=== 69 gebaute Level ===');
  let fehler = 0;
  const proWelt: Record<string, string[]> = {};
  for (const lv of LEVELS) {
    const p = stueckFuer(lv.id, lv.theme);
    const w = WELTEN.get(lv.theme)!;
    const fe = pruefe(p, w);
    if (fe.length) {
      fehler++;
      console.log(`FEHLER ${lv.id} (${lv.theme}): ${fe.join(', ')}`);
    }
    const anders = inTakte(p.melodie).filter(
      (b, i) => b.map((n) => `${n[0]}:${n[1]}`).join() !== w.bars[i].map((n) => `${n[0]}:${n[1]}`).join(),
    ).length;
    const akkAnders = p.akkorde.filter((a, i) => a !== w.akkorde[i]).length;
    (proWelt[lv.theme] ??= []).push(
      `${lv.id} ${p.weltstueck ? 'WELTSTUECK ' : `T${anders}/8 A${akkAnders}/8 `}` +
        `bpm${p.bpm} ${p.zweitStimme}/${p.harmonieStimme} farbe[${p.farbe}] akk[${p.akkorde}]`,
    );
  }
  for (const [th, z] of Object.entries(proWelt)) {
    console.log(`--- ${th} (${z.length}) ---`);
    for (const x of z) console.log('  ' + x);
  }
  console.log(`\n${LEVELS.length} Level, ${fehler} Fehler`);

  console.log('\n=== Zielausbau 7 Welten x 15 Level ===');
  let f100 = 0;
  let k100 = 0;
  const seen = new Map<string, string>();
  const wnr: Record<string, string> = {
    grass: 'w1', crystal: 'w2', rust: 'w3', frost: 'w4',
    magma: 'w5', sonnenhang: 'w6', wipfel: 'w7',
  };
  const taktStat: number[] = [];
  for (const [th, w] of WELTEN) {
    for (let i = 1; i <= 15; i++) {
      const id = `${wnr[th]}-${String(i).padStart(2, '0')}`;
      const p = stueckFuer(id, th);
      const fe = pruefe(p, w);
      if (fe.length) {
        f100++;
        console.log(`FEHLER ${id}: ${fe.join(', ')}`);
      }
      const key = th + '|' + JSON.stringify(p.melodie) + '|' + JSON.stringify(p.akkorde);
      if (seen.has(key)) {
        k100++;
        console.log(`KOLLISION ${id} == ${seen.get(key)}`);
      }
      seen.set(key, id);
      if (!p.weltstueck) {
        taktStat.push(
          inTakte(p.melodie).filter(
            (b, k) =>
              b.map((n) => `${n[0]}:${n[1]}`).join() !== w.bars[k].map((n) => `${n[0]}:${n[1]}`).join(),
          ).length,
        );
      }
    }
  }
  const mittel = taktStat.reduce((a, b) => a + b, 0) / taktStat.length;
  console.log(`105 Stuecke, ${f100} Fehler, ${k100} Kollisionen, im Mittel ${mittel.toFixed(2)} von 8 Takten neu`);

  // Determinismus
  let nd = 0;
  for (const lv of LEVELS) {
    CACHE.clear();
    PLAENE.clear();
    PLANCODES.clear();
    const a = JSON.stringify(stueckFuer(lv.id, lv.theme));
    CACHE.clear();
    PLAENE.clear();
    PLANCODES.clear();
    const b = JSON.stringify(stueckFuer(lv.id, lv.theme));
    if (a !== b) {
      nd++;
      console.log('NICHT DETERMINISTISCH ' + lv.id);
    }
  }
  console.log(`Determinismus: ${nd} Abweichungen`);
}

function zeige(id: string, th: string) {
  const p = stueckFuer(id, th);
  const w = WELTEN.get(th)!;
  const name = (h: number | null) => (h === null ? '—' : NAMEN[kl(h)] + (h >= 12 ? "'" : h < 0 ? ',' : ''));
  const zeile = (b: Takt) => b.map((n) => `${name(n[0])}(${n[1]})`).join(' ');
  const a = w.bars;
  const b = inTakte(p.melodie);
  console.log(`\n================ ${id} (${th}) ================`);
  console.log(
    `bpm ${w.quelle.bpm} -> ${p.bpm}   grund ${p.grund} Hz   ${p.melodieStimme} / ${p.zweitStimme}   ` +
      `Harmonie ${w.quelle.harmonieStimme} -> ${p.harmonieStimme}   farbe [${w.quelle.farbe}] -> [${p.farbe}]`,
  );
  console.log(`Plan-Code ${p.code}  ${JSON.stringify(p.plan)}`);
  for (let i = 0; i < 8; i++) {
    const fest = FEST.includes(i);
    console.log(
      `${fest ? 'FEST ' : '     '}T${i + 1} akk ${String(w.akkorde[i]).padStart(2)}->${String(p.akkorde[i]).padStart(2)} | Welt: ${zeile(a[i])}`,
    );
    if (!fest) console.log(`                        | neu : ${zeile(b[i])}`);
  }
  console.log('Halbtoene: ' + JSON.stringify(p.melodie));
  console.log('Akkorde:   ' + JSON.stringify(p.akkorde));
  const t = toene(p.melodie);
  console.log(
    `Melodie ${(p.grund * Math.pow(2, Math.min(...t) / 12 + 1)).toFixed(0)}..${(p.grund * Math.pow(2, Math.max(...t) / 12 + 1)).toFixed(0)} Hz, ` +
      `Arpeggiospitze ${(p.grund * Math.pow(2, (Math.max(...p.akkorde) + 12) / 12)).toFixed(0)} Hz, ` +
      `Umlauf ${((60 / p.bpm / 2) * 64).toFixed(1)} s`,
  );
  console.log('Pruefung: ' + (pruefe(p, w).join(', ') || 'ohne Befund'));
}

bericht();
for (const id of ['w3-01', 'w3-02', 'w3-03', 'w3-07']) zeige(id, 'rust');
zeige('w1-04', 'grass');
zeige('w2-06', 'crystal');

// --- Streuungsbericht: wie verschieden sind die Strophen einer Welt? -------
{
  const wnr: Record<string, string> = {
    grass: 'w1', crystal: 'w2', rust: 'w3', frost: 'w4',
    magma: 'w5', sonnenhang: 'w6', wipfel: 'w7',
  };
  console.log('\n=== Streuung je Welt (15 Level) ===');
  for (const [th, w] of WELTEN) {
    const g = (b: Takt) => b.map((n) => `${n[0]}:${n[1]}`).join(',');
    const proTakt: Set<string>[] = [0, 1, 2, 3, 4, 5, 6, 7].map(() => new Set<string>());
    const akkS = new Set<string>();
    const bpmS = new Set<number>();
    const stimmS = new Set<string>();
    for (let i = 1; i <= 15; i++) {
      const p = stueckFuer(`${wnr[th]}-${String(i).padStart(2, '0')}`, th);
      inTakte(p.melodie).forEach((b, k) => proTakt[k].add(g(b)));
      akkS.add(p.akkorde.join(','));
      bpmS.add(p.bpm);
      stimmS.add(p.zweitStimme + '/' + p.harmonieStimme);
    }
    console.log(
      `${th.padEnd(11)} verschiedene Gestalten je Takt: [${proTakt.map((s) => s.size).join(' ')}]  ` +
        `Akkordfolgen ${akkS.size}  Tempi ${bpmS.size}  Besetzungen ${stimmS.size}  ` +
        `Vorrat an Strophen ${plaeneVon(w, 60).length >= 60 ? '>=60' : plaeneVon(w, 60).length}`,
    );
  }
}

console.log('\n=== Farbton-Kontrolle (Wiese: das Fis) ===');
for (let i = 1; i <= 10; i++) {
  const id = `w1-${String(i).padStart(2, '0')}`;
  const p = stueckFuer(id, 'grass');
  const k = [...klassen(p.melodie)].sort((a, b) => a - b);
  console.log(`${id} Tonklassen [${k.join(',')}] ${k.includes(6) ? 'mit Fis' : k.includes(5) ? 'mit F' : '—'}`);
}

console.log('\n=== Ablehnungsgruende (Wiese, erste 4000 Plaene) ===');
{
  const w = WELTEN.get('grass')!;
  const raumN = raum(w);
  const s = schrittweite(raumN);
  const grund: Record<string, number> = {};
  let ok = 0;
  const farbVerteilung: Record<number, number> = { 0: 0, 1: 0, 2: 0 };
  const farbOk: Record<number, number> = { 0: 0, 1: 0, 2: 0 };
  for (let j = 1; j <= 4000; j++) {
    const code = (j * s) % raumN;
    const p = entziffere(w, code);
    farbVerteilung[p.farb] = (farbVerteilung[p.farb] ?? 0) + 1;
    const bars = baueMelodie(w, p);
    if (!bars) { grund['baut nicht'] = (grund['baut nicht'] ?? 0) + 1; continue; }
    const akk = w.akkordplaene[p.akk % w.akkordplaene.length];
    const r = klingt(w, bars, akk);
    if (r) { const k = r.replace(/\d+/g, '#'); grund[k] = (grund[k] ?? 0) + 1; continue; }
    ok++;
    farbOk[p.farb] = (farbOk[p.farb] ?? 0) + 1;
  }
  console.log(`angenommen ${ok} von 4000 (${((ok / 4000) * 100).toFixed(1)} %)`);
  console.log('farb-Ziffer im Raum:', farbVerteilung, ' angenommen:', farbOk);
  for (const [k, v] of Object.entries(grund).sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(5)}  ${k}`);
}

zeige('w1-04', 'grass');
zeige('w5-06', 'magma');

console.log('\n=== Farbton ueber 15 Level je Welt ===');
{
  const wnr: Record<string, string> = {
    grass: 'w1', crystal: 'w2', rust: 'w3', frost: 'w4',
    magma: 'w5', sonnenhang: 'w6', wipfel: 'w7',
  };
  for (const [th, w] of WELTEN) {
    if (!w.farbtoene.length) { console.log(`${th.padEnd(11)} kein freier Farbton`); continue; }
    let n = 0;
    for (let i = 1; i <= 15; i++) {
      const p = stueckFuer(`${wnr[th]}-${String(i).padStart(2, '0')}`, th);
      if (w.farbtoene.some((f) => klassen(p.melodie).has(f.klasse))) n++;
    }
    console.log(`${th.padEnd(11)} ${n} von 15 Leveln tragen einen Farbton`);
  }
}

console.log('\n=== Kosten und Kennzahlen ===');
{
  const wnr: Record<string, string> = {
    grass: 'w1', crystal: 'w2', rust: 'w3', frost: 'w4',
    magma: 'w5', sonnenhang: 'w6', wipfel: 'w7',
  };
  CACHE.clear(); PLAENE.clear(); PLANCODES.clear();
  const t0 = performance.now();
  for (const th of Object.keys(wnr)) {
    for (let i = 1; i <= 15; i++) stueckFuer(`${wnr[th]}-${String(i).padStart(2, '0')}`, th);
  }
  const t1 = performance.now();
  console.log(`105 Stuecke kalt erzeugt in ${(t1 - t0).toFixed(0)} ms`);
  CACHE.clear(); PLAENE.clear(); PLANCODES.clear();
  const t2 = performance.now();
  stueckFuer('w5-15', 'magma');
  console.log(`einzelnes Level (Nr. 15, kalt) in ${(performance.now() - t2).toFixed(1)} ms`);
  let akkD = 0, taktD = 0, n = 0;
  for (const th of Object.keys(wnr)) {
    const w = WELTEN.get(th)!;
    for (let i = 2; i <= 15; i++) {
      const p = stueckFuer(`${wnr[th]}-${String(i).padStart(2, '0')}`, th);
      akkD += p.akkorde.filter((a, k) => a !== w.akkorde[k]).length;
      taktD += inTakte(p.melodie).filter(
        (b, k) => b.map((x) => `${x[0]}:${x[1]}`).join() !== w.bars[k].map((x) => `${x[0]}:${x[1]}`).join(),
      ).length;
      n++;
    }
  }
  console.log(`im Mittel ${(taktD / n).toFixed(2)} von 8 Takten und ${(akkD / n).toFixed(2)} von 8 Akkorden neu`);
}
