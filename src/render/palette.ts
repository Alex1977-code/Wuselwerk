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
   * Der Dunstschleier ueber der Kulisse — Luftperspektive als eine Farbe.
   *
   * Er liegt ueber Himmel und Huegeln und **unter** Terrain und Figuren:
   * Was klar ist, ist nah und begehbar; was verdunstet, ist Hintergrund.
   * Halbtransparent in der Himmelsfarbe der jeweiligen Welt.
   */
  dunst: string;
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
  dunst: 'rgba(198, 230, 242, 0.16)',
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
  dunst: 'rgba(150, 190, 235, 0.15)',
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
  dunst: 'rgba(212, 190, 160, 0.16)',
};

export function paletteFor(theme: ThemeId): Palette {
  return theme === 'crystal' ? CRYSTAL : theme === 'rust' ? RUST : GRASS;
}
