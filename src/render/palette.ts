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
  skyTop: '#0d1730',
  skyMid: '#22375c',
  skyBottom: '#4a6f8c',
  hills: ['#213950', '#2b4b68', '#37607f'],
  hillsDeep: ['#16273a', '#1d3348', '#24405a'],
  earth: 0x6b4a2e,
  crust: 0x4f8f3c,
  rock: 0x565d6b,
  steel: 0x8b96a6,
  brick: 0xb5713f,
  freshBoost: 30,
  glow: '#ffd98a',
};

const CRYSTAL: Palette = {
  skyTop: '#080d1f',
  skyMid: '#141d3d',
  skyBottom: '#28386a',
  hills: ['#161f3c', '#1f2c50', '#2b3a68'],
  hillsDeep: ['#0e1428', '#141c38', '#1b2648'],
  earth: 0x3e4a72,
  crust: 0x6f8ad6,
  rock: 0x35405f,
  steel: 0x8b96a6,
  brick: 0xa06be0,
  freshBoost: 34,
  glow: '#9fd8ff',
};

export function paletteFor(theme: ThemeId): Palette {
  return theme === 'crystal' ? CRYSTAL : GRASS;
}
