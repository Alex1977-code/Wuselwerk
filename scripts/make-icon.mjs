/**
 * Baut das App-Icon aus dem Modell.
 *
 * Kein zweites Artwork: Das Icon ist der Wusel selbst — die Späher-Pose
 * (fast frontal) vor dem Tageslicht der Grasland-Welt, auf dem Boden aus
 * Grasnarbe und Erde, der das Spiel ausmacht.
 *
 * Die Figur kommt aus `art-src/icon/figur-gross.png` — einer 1344-px-Zelle,
 * die `bake-figur.mjs --icon` direkt aus dem gerigten Modell rendert. Die
 * erste Fassung skalierte das 112er-Spielblatt hoch und war sichtbar
 * verwaschen; das Modell gibt jede Groesse her.
 *
 * Ergebnis in `art-src/icon/`:
 *   icon-1024.png  Meister, für Stores und alles Weitere
 *   icon-180.png   apple-touch-icon (Home-Bildschirm)
 *   icon-64.png    Favicon
 *
 * `build-single.mjs` bettet 180 und 64 als Data-URIs in den Seitenkopf ein.
 *
 *   node scripts/bake-figur.mjs wuselwerker --icon   (einmalig: die Figur)
 *   node scripts/make-icon.mjs [--ganz]              (--ganz: stehende Figur)
 *
 * Standard ist das **Kopfporträt**: Bei sechzig Bildpunkten Kantenlaenge
 * traegt ein Gesicht, eine Ganzfigur wird zum Fleck. Die stehende Fassung
 * bleibt als Variante fuer Stellen mit mehr Platz.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

// Zellgeometrie der gerenderten Figur (bake-figur.mjs): Fusslinie und
// Koerperanteil der Zelle.
const figurPng = readFileSync('art-src/icon/figur-gross.png').toString('base64');
const FUSS_ANTEIL = (112 - 3) / 112;
const KOERPER_ANTEIL = 0.861 / 1.22;
const nah = !process.argv.includes('--ganz');

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const page = await browser.newPage({ viewport: { width: 1100, height: 1100 } });

const bilder = await page.evaluate(
  async ({ figurPng, FUSS_ANTEIL, KOERPER_ANTEIL, nah }) => {
    const img = new Image();
    img.src = `data:image/png;base64,${figurPng}`;
    await img.decode();

    const S = 1024;
    const c = document.createElement('canvas');
    c.width = S;
    c.height = S;
    const ctx = c.getContext('2d');

    // --- Himmel: der Tag der Grasland-Welt, wie auf dem Titel -------------
    const himmel = ctx.createLinearGradient(0, 0, 0, S);
    himmel.addColorStop(0, '#2f74b8');
    himmel.addColorStop(0.5, '#69aadd');
    himmel.addColorStop(0.82, '#c6e6f2');
    ctx.fillStyle = himmel;
    ctx.fillRect(0, 0, S, S);

    // Sonne: weicher Fleck oben rechts.
    const sonne = ctx.createRadialGradient(S * 0.78, S * 0.16, 0, S * 0.78, S * 0.16, S * 0.3);
    sonne.addColorStop(0, 'rgba(255, 244, 200, 0.8)');
    sonne.addColorStop(0.4, 'rgba(255, 240, 190, 0.22)');
    sonne.addColorStop(1, 'rgba(255, 240, 190, 0)');
    ctx.fillStyle = sonne;
    ctx.fillRect(0, 0, S, S);

    // Zwei Wolkenballen, damit der Himmel kein Verlauf bleibt.
    for (const [wx, wy, r, a] of [
      [S * 0.16, S * 0.15, S * 0.07, 0.75],
      [S * 0.62, S * 0.08, S * 0.055, 0.55],
    ]) {
      for (let i = 0; i < 4; i++) {
        const bx = wx + Math.sin(i * 2.4) * r * 1.1;
        const by = wy + Math.cos(i * 3.7) * r * 0.3;
        const br = r * (0.6 + 0.4 * Math.abs(Math.cos(i * 1.7)));
        const g = ctx.createRadialGradient(bx, by - br * 0.2, br * 0.2, bx, by, br);
        g.addColorStop(0, `rgba(255,255,255,${a})`);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // --- Hügel und Boden ---------------------------------------------------
    const huegel = (basis, amp, farbe) => {
      ctx.fillStyle = farbe;
      ctx.beginPath();
      ctx.moveTo(0, S);
      for (let x = 0; x <= S; x += 32) {
        ctx.lineTo(x, S * basis + Math.sin((x / S) * 4.2 + basis * 20) * S * amp);
      }
      ctx.lineTo(S, S);
      ctx.closePath();
      ctx.fill();
    };
    const bodenY = nah ? S * 0.995 : S * 0.88;
    huegel(bodenY / S - 0.115, 0.02, '#a5cbdd');
    huegel(bodenY / S - 0.055, 0.014, '#7aa8bd');
    // Erde mit Grasnarbe — der Boden, in dem gegraben wird.
    const erde = ctx.createLinearGradient(0, bodenY, 0, S);
    erde.addColorStop(0, '#7a5230');
    erde.addColorStop(1, '#452c19');
    ctx.fillStyle = erde;
    ctx.fillRect(0, bodenY, S, S - bodenY);
    ctx.fillStyle = '#35601f';
    ctx.fillRect(0, bodenY, S, S * 0.017);
    ctx.fillStyle = '#63b23f';
    ctx.fillRect(0, bodenY, S, S * 0.01);

    // --- Die Figur: Späher-Pose aus dem Modell ------------------------------
    // Ganzfigur: Fuss auf dem Boden, Figur füllt gut vier Fünftel.
    // Porträt: Fuss weit unter dem Rand, der Kopf füllt das Bild.
    const zielHoehe = nah ? S * 1.5 : S * 0.82;
    const massstab = zielHoehe / (img.height * KOERPER_ANTEIL);
    // Ein Hauch rechts der Mitte: Die Späher-Pose traegt ihre Masse links
    // des Ankers, rein mittig stand die Figur sichtbar links.
    const fx = nah ? S * 0.505 : S * 0.52;
    const fy = nah ? S * 1.46 : bodenY + S * 0.012;
    const s = zielHoehe / 15; // nur noch fuer den Schattenradius

    // Weicher Schlagschatten unter der Figur, sonst klebt sie auf dem Bild.
    if (!nah) {
      const sch = ctx.createRadialGradient(fx, fy, 0, fx, fy, s * 4.4);
      sch.addColorStop(0, 'rgba(20, 26, 16, 0.42)');
      sch.addColorStop(1, 'rgba(20, 26, 16, 0)');
      ctx.fillStyle = sch;
      ctx.save();
      ctx.translate(fx, fy);
      ctx.scale(1, 0.3);
      ctx.beginPath();
      ctx.arc(0, 0, s * 4.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      img,
      fx - (img.width / 2) * massstab,
      fy - img.height * FUSS_ANTEIL * massstab,
      img.width * massstab,
      img.height * massstab,
    );

    // --- Ausgaben -----------------------------------------------------------
    const skaliert = (gr) => {
      const k = document.createElement('canvas');
      k.width = gr;
      k.height = gr;
      const kx = k.getContext('2d');
      kx.imageSmoothingEnabled = true;
      kx.imageSmoothingQuality = 'high';
      // In zwei Stufen verkleinern — direkt von 1024 auf 64 verwischt.
      if (gr < 256) {
        const halb = document.createElement('canvas');
        halb.width = 256;
        halb.height = 256;
        const hx = halb.getContext('2d');
        hx.imageSmoothingEnabled = true;
        hx.imageSmoothingQuality = 'high';
        hx.drawImage(c, 0, 0, 256, 256);
        kx.drawImage(halb, 0, 0, gr, gr);
      } else {
        kx.drawImage(c, 0, 0, gr, gr);
      }
      return k.toDataURL('image/png');
    };
    return { g1024: c.toDataURL('image/png'), g180: skaliert(180), g64: skaliert(64) };
  },
  { figurPng, FUSS_ANTEIL, KOERPER_ANTEIL, nah },
);

await browser.close();

mkdirSync('art-src/icon', { recursive: true });
const speichern = (name, dataUrl) =>
  writeFileSync(`art-src/icon/${name}`, Buffer.from(dataUrl.split(',')[1], 'base64'));
const suffix = nah ? '' : '-ganz';
speichern(`icon-1024${suffix}.png`, bilder.g1024);
speichern(`icon-180${suffix}.png`, bilder.g180);
speichern(`icon-64${suffix}.png`, bilder.g64);
console.log(`art-src/icon/icon-{1024,180,64}${suffix}.png geschrieben`);
