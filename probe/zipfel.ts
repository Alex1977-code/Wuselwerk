/** Alle Einzelbilder der kritischen Posen, mit und ohne Zipfel. */
import { SpriteAtlas, loadImage } from '../src/render/atlas';
import { findAtlasSource } from '../src/art';
import { State, type Wusel } from '../src/core/types';

const FAELLE: { name: string; pose: string; state: State; floater: boolean; fuse: number }[] = [
  { name: 'dying/bomber', pose: 'dying', state: State.DYING, floater: false, fuse: 60 },
  { name: 'saving/bomber', pose: 'saving', state: State.SAVING, floater: false, fuse: 60 },
  { name: 'floating/floater', pose: 'floating', state: State.FALLING, floater: true, fuse: 0 },
  { name: 'blocking/blocker', pose: 'blocking', state: State.BLOCKING, floater: false, fuse: 0 },
];

const K = 140;
const S = 26 / 12;

function wusel(f: (typeof FAELLE)[number]): Wusel {
  return {
    id: 1, x: 0, y: 0, dir: 1, state: f.state, timer: 0, fallDist: 20,
    hasFloater: f.floater, fuse: f.fuse, alive: true,
  } as unknown as Wusel;
}

function shim(ctx: CanvasRenderingContext2D, skip: number, z: { n: number }) {
  return new Proxy(ctx, {
    get(t, p) {
      if (p === 'stroke') {
        return (...a: unknown[]) => {
          const i = z.n++;
          if (i !== skip) (t.stroke as (...x: unknown[]) => void)(...a);
        };
      }
      const v = (t as unknown as Record<string | symbol, unknown>)[p];
      return typeof v === 'function' ? (v as (...x: unknown[]) => unknown).bind(t) : v;
    },
    set(t, p, v) {
      (t as unknown as Record<string | symbol, unknown>)[p] = v;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
}

async function main() {
  const quelle = findAtlasSource('wuselwerker')!;
  const img = (await loadImage(quelle.url))!;
  const atlas = new SpriteAtlas(img, quelle.manifest);

  const ZOOM = 11, AUS = 24;
  const c = document.getElementById('c') as HTMLCanvasElement;
  const ctx = c.getContext('2d')!;
  const maxF = 8;
  c.width = 130 + maxF * (AUS * ZOOM + 6);
  c.height = FAELLE.length * 2 * (AUS * ZOOM + 8) + 20;
  ctx.fillStyle = '#101216';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.font = '12px monospace';

  let y = 10;
  for (const f of FAELLE) {
    const clip = quelle.manifest.clips[f.pose];
    for (const mit of [true, false]) {
      ctx.fillStyle = '#c8ccd4';
      ctx.fillText(`${f.name} ${mit ? 'MIT' : 'OHNE'}`, 4, y + 40);
      for (let fr = 0; fr < clip.holds.length; fr++) {
        const t = document.createElement('canvas');
        t.width = t.height = K;
        const tc = t.getContext('2d')!;
        tc.fillStyle = '#69aadd';
        tc.fillRect(0, 0, K, K);
        const v = { ox: 0, oy: 0, scale: S, box: { x: K / 2, y: K * 0.8, w: K, h: K } };
        if (mit) {
          atlas.drawWusel(tc, v as never, wusel(f), 1, Infinity, f.pose, fr);
        } else {
          const z0 = { n: 0 };
          const probe = document.createElement('canvas');
          probe.width = probe.height = K;
          atlas.drawWusel(
            shim(probe.getContext('2d')!, -1, z0), v as never, wusel(f), 1, Infinity, f.pose, fr,
          );
          const z = { n: 0 };
          atlas.drawWusel(shim(tc, z0.n - 2, z), v as never, wusel(f), 1, Infinity, f.pose, fr);
        }
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          t, Math.round(K / 2 - AUS / 2) + 1, Math.round(K * 0.8 - AUS) - 2, AUS, AUS,
          130 + fr * (AUS * ZOOM + 6), y, AUS * ZOOM, AUS * ZOOM,
        );
      }
      y += AUS * ZOOM + 8;
    }
  }
  (window as unknown as { fertig: boolean }).fertig = true;
  (window as unknown as { zahlen: string[] }).zahlen = [];
}
main();
