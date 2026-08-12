/** Nur zur Pruefung: alle Posen mit Band, in Spielgroesse und vergroessert. */
import { SpriteAtlas, loadImage } from '../src/render/atlas';
import { findAtlasSource } from '../src/art';
import { State, type Wusel } from '../src/core/types';

const POSEN: [string, State, string | null, boolean][] = [
  ['walking', State.WALKING, null, true],
  ['falling', State.FALLING, null, true],
  ['floating', State.FALLING, 'floater', false],
  ['climbing', State.CLIMBING, null, false],
  ['hoisting', State.HOISTING, null, false],
  ['building', State.BUILDING, null, false],
  ['bashing', State.BASHING, null, false],
  ['mining', State.MINING, null, false],
  ['digging', State.DIGGING, null, false],
  ['blocking', State.BLOCKING, null, false],
  ['saving', State.SAVED, null, true],
  ['dying', State.DYING, null, true],
  ['spaehen', State.WALKING, null, true],
];

const q = new URLSearchParams(location.search);
const S = Number(q.get('s') ?? '2.17'); // Bildpunkte je logischem Pixel
const M = Number(q.get('m') ?? '8'); // Vergroesserung des Ergebnisses
const BG = q.get('bg') ?? '#6b5a44';

async function main() {
  const quelle = findAtlasSource('wuselwerker')!;
  const img = await loadImage(quelle.url);
  const atlas = new SpriteAtlas(img!, quelle.manifest);

  const zw = Math.round(20 * S);
  const zh = Math.round(22 * S);
  const spalten = 8;
  const klein = document.createElement('canvas');
  klein.width = spalten * zw;
  klein.height = POSEN.length * zh;
  const k = klein.getContext('2d')!;
  k.fillStyle = BG;
  k.fillRect(0, 0, klein.width, klein.height);

  POSEN.forEach(([name, zustand, skill, braucheFuse], r) => {
    const clip = quelle.manifest.clips[name];
    const bilder = clip ? clip.holds.length : 1;
    for (let f = 0; f < Math.min(bilder, spalten); f++) {
      const w = {
        id: r * 100 + f, x: 0, y: 0, dir: 1, state: zustand,
        timer: 0, skill, hasFloater: skill === 'floater',
        fallDist: 0, fuse: braucheFuse ? 40 : 0, alive: true,
      } as unknown as Wusel;
      const v = {
        ox: 0, oy: 0, scale: S,
        box: { x: f * zw + zw / 2, y: r * zh + zh - 3 * S, w: zw, h: zh },
      };
      atlas.drawWusel(k, v, w, 1, Infinity, name, f);
    }
  });

  const c = document.getElementById('c') as HTMLCanvasElement;
  c.width = klein.width * M;
  c.height = klein.height * M;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(klein, 0, 0, c.width, c.height);

  (window as unknown as { fertig: boolean }).fertig = true;
}
main();
