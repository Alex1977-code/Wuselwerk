import type { ThemeId } from '../levels/types';

export interface Palette {
  skyTop: string;
  /** Mitte des Himmelsverlaufs — ohne sie wird aus dem Himmel eine Rampe. */
  skyMid: string;
  skyBottom: string;
  hills: string[];
  /** Fusston je Hügelschicht. Der Verlauf dorthin gibt den Schichten Luft. */
  hillsDeep: string[];
  earth: number;
  /**
   * Der Ton tief unten. Erde ist nicht eine Farbe mit Helligkeitsverlauf,
   * sondern **zwei Farben**: Oben, wo Luft und Wurzeln sind, ist sie warm und
   * hell; unten, wo sie verdichtet und feucht ist, kühler und satter. Nur die
   * Helligkeit zu senken macht daraus eine angestrichene Wand.
   */
  earthDeep: number;
  /** Kiesel und Steine in der Erde. Grauer als sie — sonst sieht man sie nicht. */
  pebble: number;
  /** Unberührte Oberfläche — Grasnarbe. */
  crust: number;
  /**
   * Der dunkle Saum direkt unter der Narbe.
   *
   * Er ist der Grund, warum eine Wiese von der Seite nach Wiese aussieht: Unter
   * dem Grün liegt kein Braun, sondern erst eine dunkle Schicht aus Wurzelwerk.
   * Ohne sie stossen zwei Flächen stumpf aneinander, und das Auge liest die
   * Grasnarbe als aufgemalten Streifen.
   */
  crustDark: number;
  /** Dicke der Narbe in Bildpunkten. Eine Höhle hat keinen Rasen. */
  crustThickness: number;
  rock: number;
  steel: number;
  brick: number;
  /** Frisch freigelegtes Material ist heller (GDD §6). */
  freshBoost: number;
  glow: string;
  /**
   * Der Dunstschleier ueber der Kulisse — Luftperspektive als **Verlauf**.
   *
   * Er liegt ueber Himmel und Huegeln und **unter** Terrain und Figuren:
   * Was klar ist, ist nah und begehbar; was verdunstet, ist Hintergrund.
   *
   * Frueher war er eine flache Deckfarbe. Aber Dunst sammelt sich zum
   * Horizont hin — oben ist die Luft klar, unten steht sie dick. Ein
   * Verlauf von duenn (Weltdach) nach dicht (Horizontband) ist das
   * staerkste Tiefensignal, das eine einzige Flaeche hergibt; die flache
   * Fuellung hat es verschenkt. Deshalb Farbe und Dichte getrennt:
   * `rgb` als Tripel fuer den `rgba()`-Bau, `oben`/`unten` als Alphas.
   */
  dunst: { rgb: string; oben: number; unten: number };
}

const GRASS: Palette = {
  // Heller Tag statt Nacht. Die Helligkeit sitzt im Himmel und in den fernen
  // Hügeln, nicht in der Erde: Die Figur läuft auf der Erde, und ihr violettes
  // Haar (L* 49) braucht dort den Helligkeitsabstand nach unten. Eine
  // aufgehellte Erde hätte die Figur genau da verschluckt, wo sie am längsten
  // steht — deshalb wird die Erde wärmer und satter, aber nicht heller.
  skyTop: '#2f74b8',
  skyMid: '#69aadd',
  skyBottom: '#c6e6f2',
  // Luftperspektive: Was weit weg ist, ist heller und blasser, nicht dunkler.
  // Vorher war es umgekehrt, und die Ferne lag als dunkler Wall hinter dem
  // Spielfeld.
  // Die nächste Schicht ist deutlich dunkler als die fernen. Nicht nur wegen
  // der Luftperspektive: Die Figuren laufen direkt davor, und ihr violettes
  // Haar (L* 49) braucht dort einen Untergrund, der nicht auf derselben
  // Helligkeit liegt. Ein sattes Mittelgrün wäre hübsch und würde die Figur
  // verschlucken.
  hills: ['#a5cbdd', '#7aa8bd', '#4a7f69'],
  hillsDeep: ['#8fbbd0', '#5e8ea6', '#33604e'],
  earth: 0x7a5230,
  earthDeep: 0x452c19,
  pebble: 0x93867a,
  /** Unberührte Oberfläche — Grasnarbe. */
  crust: 0x63b23f,
  crustDark: 0x35601f,
  crustThickness: 3,
  rock: 0x6b7480,
  steel: 0x9aa5b5,
  brick: 0xc98246,
  /** Frisch freigelegtes Material ist heller (GDD §6). */
  freshBoost: 30,
  glow: '#ffe6a8',
  dunst: { rgb: '198, 230, 242', oben: 0.03, unten: 0.24 },
};

/**
 * Welt 6 — Sonnenhang.
 *
 * Dieselbe Wiese wie im Grasland, vier Stunden spaeter am Tag. Die Trennung
 * liegt im **Licht**, nicht in der Grundfarbe: Der Himmel geht von Altrosa
 * ueber Pfirsich zu Dunstweiss am Horizont, die Narbe ist trockenes
 * Goldgras statt frischem Gruen, die Erde warmer Terrakotta statt kuehlem
 * Braun. Zwei gruene Welten hintereinander vertragen keine Neufaerbung
 * derselben Kulisse — sie brauchen eine andere Tageszeit.
 */
const SONNENHANG: Palette = {
  // Heller Tag statt Nacht. Die Helligkeit sitzt im Himmel und in den fernen
  // Hügeln, nicht in der Erde: Die Figur läuft auf der Erde, und ihr violettes
  // Haar (L* 49) braucht dort den Helligkeitsabstand nach unten. Eine
  // aufgehellte Erde hätte die Figur genau da verschluckt, wo sie am längsten
  // steht — deshalb wird die Erde wärmer und satter, aber nicht heller.
  skyTop: '#8a5f7a',
  skyMid: '#e8a86a',
  skyBottom: '#f4dcc0',
  // Luftperspektive: Was weit weg ist, ist heller und blasser, nicht dunkler.
  // Vorher war es umgekehrt, und die Ferne lag als dunkler Wall hinter dem
  // Spielfeld.
  // Die nächste Schicht ist deutlich dunkler als die fernen. Nicht nur wegen
  // der Luftperspektive: Die Figuren laufen direkt davor, und ihr violettes
  // Haar (L* 49) braucht dort einen Untergrund, der nicht auf derselben
  // Helligkeit liegt. Ein sattes Mittelgrün wäre hübsch und würde die Figur
  // verschlucken.
  hills: ['#e6c9a8', '#c9a37e', '#8a8a44'],
  hillsDeep: ['#d3b191', '#ac8663', '#5f6330'],
  earth: 0x8a5330,
  earthDeep: 0x4e2a17,
  pebble: 0x93867a,
  /** Unberührte Oberfläche — Grasnarbe. */
  crust: 0xc8b23f,
  crustDark: 0x6b5a1c,
  crustThickness: 3,
  rock: 0xb09a78,
  steel: 0x9aa5b5,
  brick: 0xc98246,
  /** Frisch freigelegtes Material ist heller (GDD §6). */
  freshBoost: 30,
  glow: '#ffd79a',
  dunst: { rgb: '240, 200, 160', oben: 0.03, unten: 0.2 },
};

/**
 * Welt 7 — Wipfelweide.
 *
 * Ein Wald von oben. Der Unterschied zum Sonnenhang ist wieder das Licht,
 * und diesmal seine RICHTUNG: Hier kommt es von oben durchs Laub statt von
 * der Seite, und der Blick endet nicht an einem Horizont, sondern in
 * Nebelbaendern zwischen Staemmen. Darum bleicht der Himmel nach OBEN ins
 * Milchweiss aus, statt nach unten — und darum ist alles blaugruen: die
 * Farbe von Schatten unter Blaettern.
 */
const WIPFEL: Palette = {
  // Heller Tag statt Nacht. Die Helligkeit sitzt im Himmel und in den fernen
  // Hügeln, nicht in der Erde: Die Figur läuft auf der Erde, und ihr violettes
  // Haar (L* 49) braucht dort den Helligkeitsabstand nach unten. Eine
  // aufgehellte Erde hätte die Figur genau da verschluckt, wo sie am längsten
  // steht — deshalb wird die Erde wärmer und satter, aber nicht heller.
  skyTop: '#eaf4ec',
  skyMid: '#a9cfc0',
  skyBottom: '#4d7f6e',
  // Luftperspektive: Was weit weg ist, ist heller und blasser, nicht dunkler.
  // Vorher war es umgekehrt, und die Ferne lag als dunkler Wall hinter dem
  // Spielfeld.
  // Die nächste Schicht ist deutlich dunkler als die fernen. Nicht nur wegen
  // der Luftperspektive: Die Figuren laufen direkt davor, und ihr violettes
  // Haar (L* 49) braucht dort einen Untergrund, der nicht auf derselben
  // Helligkeit liegt. Ein sattes Mittelgrün wäre hübsch und würde die Figur
  // verschlucken.
  hills: ['#b6d3c4', '#7fae99', '#3f7a63'],
  hillsDeep: ['#9cbfae', '#5f8d79', '#2b5a49'],
  earth: 0x6b5237,
  earthDeep: 0x33251a,
  pebble: 0x93867a,
  /** Unberührte Oberfläche — Grasnarbe. */
  crust: 0x3fae86,
  crustDark: 0x1f5b46,
  crustThickness: 3,
  rock: 0x7d6a52,
  steel: 0x9aa5b5,
  brick: 0xc98246,
  /** Frisch freigelegtes Material ist heller (GDD §6). */
  freshBoost: 30,
  glow: '#d6f0c8',
  dunst: { rgb: '190, 220, 205', oben: 0.05, unten: 0.3 },
};

const CRYSTAL: Palette = {
  // Die Höhle bleibt kühl, aber sie war schwarz. Jetzt leuchtet sie von innen.
  skyTop: '#1b2450',
  skyMid: '#38508f',
  skyBottom: '#6f8ecd',
  hills: ['#7d92c9', '#5d72ab', '#44548a'],
  hillsDeep: ['#6a7fb8', '#4a5d93', '#33406e'],
  earth: 0x4a5788,
  earthDeep: 0x232c52,
  pebble: 0x7c86ab,
  // In der Höhle ist die „Narbe" kein Rasen, sondern die angeleuchtete Kante
  // des Gesteins. Deshalb nur ein Bildpunkt dick: Ein drei Punkte breiter
  // heller Streifen sähe aus wie Moos, und Moos wächst nicht unter Tage.
  crust: 0x8aa5e8,
  crustDark: 0x2f3a66,
  crustThickness: 1,
  rock: 0x3d4a6f,
  steel: 0x9aa5b5,
  brick: 0xd59a4a,
  freshBoost: 34,
  glow: '#bfe6ff',
  dunst: { rgb: '150, 190, 235', oben: 0.04, unten: 0.22 },
};

const RUST: Palette = {
  // Das Rostwerk liegt im Freien, aber unter einem Arbeitshimmel: staubig,
  // warm, mit einem Horizont wie hinter Schmelzoefen. Kein Blau — Blau ist
  // die Farbe der Figur, und die soll hier vor Braun und Grau stehen.
  skyTop: '#4d4f5e',
  skyMid: '#8a7f83',
  skyBottom: '#d9bc95',
  // Halden statt Huegel: Schuttkegel, hinten ausgeblichen, vorn dunkel.
  hills: ['#b0a294', '#83766a', '#57493c'],
  hillsDeep: ['#9c8f82', '#6a5e52', '#3e3229'],
  // Asche und Schutt statt Erde — grabbar, aber muede.
  earth: 0x6e5c49,
  earthDeep: 0x3b2f25,
  pebble: 0x8d837a,
  // Die Narbe ist eine Rosthaut: oxydiert, warm, zwei Bildpunkte dick.
  crust: 0xc06a32,
  crustDark: 0x6e3a1a,
  crustThickness: 2,
  rock: 0x5c554e,
  steel: 0x9aa5b5,
  brick: 0xd59a4a,
  freshBoost: 30,
  glow: '#ffd9a0',
  dunst: { rgb: '212, 190, 160', oben: 0.04, unten: 0.25 },
};

const FROST: Palette = {
  // Die Frostklamm ist hoch und hell: Winterlicht von oben, Eis, das den
  // Fels ueberzieht. Kalt, aber freundlich — keine Nacht, ein klarer
  // Wintertag in einer Schlucht.
  skyTop: '#3b6ea8',
  skyMid: '#7fb2d9',
  skyBottom: '#e8f3f8',
  hills: ['#c9dded', '#9dbdd6', '#6d8fae'],
  hillsDeep: ['#b3cde2', '#7fa4c2', '#527392'],
  // Gefrorener Grund: blaugrauer Firn statt brauner Erde.
  earth: 0x8195ad,
  earthDeep: 0x46586e,
  pebble: 0xa8b6c6,
  // Die Narbe ist Schnee.
  crust: 0xf0f6fb,
  crustDark: 0x9fb8cd,
  crustThickness: 3,
  rock: 0x5f7089,
  steel: 0x9aa5b5,
  brick: 0xd59a4a,
  freshBoost: 26,
  glow: '#d8f0ff',
  dunst: { rgb: '220, 238, 248', oben: 0.05, unten: 0.3 },
};

const MAGMA: Palette = {
  // Der Schlot: Daemmerhimmel ueber dem Krater, Gluthitze von unten. Die
  // Waerme sitzt unten im Bild — Licht aus der Tiefe, nicht vom Himmel.
  skyTop: '#2b2030',
  skyMid: '#5c3040',
  skyBottom: '#c96a3a',
  hills: ['#7a4a48', '#5c3438', '#3d2228'],
  hillsDeep: ['#653c3e', '#48282e', '#2c181e'],
  // Verbrannter Grund, aschgrau-braun mit warmem Stich.
  earth: 0x5e4438,
  earthDeep: 0x2e1f1a,
  pebble: 0x7d675c,
  // Die Narbe ist verkohlte Kruste mit Glutriss-Farbe.
  crust: 0x8a4a30,
  crustDark: 0x3d201a,
  crustThickness: 2,
  rock: 0x4f4048,
  steel: 0x9aa5b5,
  brick: 0xd59a4a,
  freshBoost: 34,
  glow: '#ffb35c',
  dunst: { rgb: '200, 110, 70', oben: 0.03, unten: 0.22 },
};

export function paletteFor(theme: ThemeId): Palette {
  switch (theme) {
    case 'crystal':
      return CRYSTAL;
    case 'rust':
      return RUST;
    case 'frost':
      return FROST;
    case 'magma':
      return MAGMA;
    case 'sonnenhang':
      return SONNENHANG;
    case 'wipfel':
      return WIPFEL;
    default:
      return GRASS;
  }
}
