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
  /** Unberührte Oberfläche — Grasnarbe. */
  crust: number;
  rock: number;
  steel: number;
  brick: number;
  /** Frisch freigelegtes Material ist heller (GDD §6). */
  freshBoost: number;
  glow: string;
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
  /** Unberührte Oberfläche — Grasnarbe. */
  crust: 0x63b23f,
  rock: 0x6b7480,
  steel: 0x9aa5b5,
  brick: 0xc98246,
  /** Frisch freigelegtes Material ist heller (GDD §6). */
  freshBoost: 30,
  glow: '#ffe6a8',
};

const CRYSTAL: Palette = {
  // Die Höhle bleibt kühl, aber sie war schwarz. Jetzt leuchtet sie von innen.
  skyTop: '#1b2450',
  skyMid: '#38508f',
  skyBottom: '#6f8ecd',
  hills: ['#7d92c9', '#5d72ab', '#44548a'],
  hillsDeep: ['#6a7fb8', '#4a5d93', '#33406e'],
  earth: 0x4a5788,
  crust: 0x8aa5e8,
  rock: 0x3d4a6f,
  steel: 0x9aa5b5,
  brick: 0xd59a4a,
  freshBoost: 34,
  glow: '#bfe6ff',
};

export function paletteFor(theme: ThemeId): Palette {
  return theme === 'crystal' ? CRYSTAL : GRASS;
}
