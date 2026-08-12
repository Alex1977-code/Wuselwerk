/**
 * Figurenprobe: alle Posen mit Werkzeug und Signalschicht, wie im Spiel.
 *
 * **Nicht nachgebaut, sondern aufgerufen.** Die Probe benutzt `SpriteAtlas`
 * selbst; was hier steht, steht deshalb auch im Spiel. Eine Probe, die den
 * Zeichenweg nachbildet, prueft ihre eigene Nachbildung.
 */
import { SpriteAtlas, loadImage } from '../src/render/atlas';
import { findAtlasSource } from '../src/art';
import { State, type Wusel } from '../src/core/types';
import { WUSEL_H } from '../src/core/constants';

const POSEN: [string, State | null, string | null][] = [
  ['walking', State.WALKING, null],
  ['falling', State.FALLING, null],
  ['floating', State.FLOATING, 'floater'],
  ['climbing', State.CLIMBING, 'climber'],
  ['hoisting', State.HOISTING, 'climber'],
  ['building', State.BUILDING, 'builder'],
  ['bashing', State.BASHING, 'basher'],
  ['mining', State.MINING, 'miner'],
  ['digging', State.DIGGING, 'digger'],
  ['blocking', State.BLOCKING, 'blocker'],
  ['saving', State.SAVED, null],
  ['dying', State.DYING, null],
  ['spaehen', null, null],
];

const SKALEN = [3, 6, 12];

async function main() {
  // `?figur=` waehlt das Blatt. Ohne Angabe die Figur des Spiels.
  const wahl = new URLSearchParams(location.search).get('figur');
  const quelle = wahl ? findAtlasSource(wahl) : findAtlasSource();
  if (!quelle) throw new Error('kein Blatt');
  const img = await loadImage(quelle.url);
  if (!img) throw new Error('Blatt nicht geladen');
  const atlas = new SpriteAtlas(img, quelle.manifest);

  const c = document.getElementById('c') as HTMLCanvasElement;
  const ctx = c.getContext('2d')!;

  const spalten = 8;
  const zellen = SKALEN.map((s) => Math.round(WUSEL_H * s * 1.7));
  const zeilH = Math.max(...zellen) + 8;
  const breit = 96 + SKALEN.reduce((a, s, i) => a + spalten * zellen[i] + 24, 0);
  c.width = breit;
  c.height = POSEN.length * zeilH + 8;

  // `?nackt` laesst Hintergrund und Beschriftung weg. Das ist die Fassung, aus
  // der sich die Ueberdeckung der Silhouetten messen laesst: Mit Untergrund
  // muesste die Messung ihn aus der Farbe zurueckraten, und der Schatten unter
  // der Figur faellt dabei mal so, mal so aus.
  const nackt = new URLSearchParams(location.search).has('nackt');
  if (!nackt) {
    ctx.fillStyle = '#1a1c20';
    ctx.fillRect(0, 0, c.width, c.height);
  }
  ctx.font = '12px system-ui, sans-serif';

  POSEN.forEach(([name, zustand, skill], r) => {
    const y0 = 4 + r * zeilH;
    if (!nackt) {
      ctx.fillStyle = r % 2 ? '#26282e' : '#1f2126';
      ctx.fillRect(0, y0, c.width, zeilH - 2);
      ctx.fillStyle = '#c8ccd4';
      ctx.fillText(`${name}${skill ? ` · ${skill}` : ''}`, 6, y0 + zeilH / 2);
    }

    const clip = quelle.manifest.clips[name];
    const bilder = clip ? clip.holds.length : 1;

    let x0 = 96;
    SKALEN.forEach((s, si) => {
      const zw = zellen[si];
      for (let f = 0; f < Math.min(bilder, spalten); f++) {
        const w: Wusel = {
          id: r * 100 + f, x: 0, y: 0, dir: 1,
          state: zustand ?? State.WALKING,
          timer: 0, skill: skill as never, fallDist: 0, fuse: 0, alive: true,
        } as unknown as Wusel;
        // Der Ausschnitt wird so gelegt, dass der Fusspunkt der Figur genau in
        // der unteren Mitte der Kachel landet — `drawWusel` rechnet ihn selbst
        // aus `sx`/`standY`, und den Weg soll die Probe nicht umgehen.
        const v = {
          ox: 0, oy: 0, scale: s,
          box: { x: x0 + f * zw + zw / 2, y: y0 + zeilH - 6 - s, w: zw, h: zeilH },
        };
        atlas.drawWusel(ctx, v, w, 1, Infinity, name, f);
      }
      x0 += spalten * zw + 24;
    });
  });

  (window as unknown as { fertig: boolean }).fertig = true;
}
main();
