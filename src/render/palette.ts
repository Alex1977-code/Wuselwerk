import type { ThemeId } from '../levels/types';

export interface Palette {
  skyTop: string;
  skyBottom: string;
  hills: string[];
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
  skyTop: '#101c33',
  skyBottom: '#3d5f7d',
  hills: ['#1b2f42', '#24415a', '#2f5570'],
  earth: 0x6b4a2e,
  crust: 0x4f8f3c,
  rock: 0x565d6b,
  steel: 0x8b96a6,
  brick: 0xb5713f,
  freshBoost: 30,
  glow: '#ffd98a',
};

const CRYSTAL: Palette = {
  skyTop: '#0a0f22',
  skyBottom: '#1d2b52',
  hills: ['#121a33', '#1a2544', '#243158'],
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
