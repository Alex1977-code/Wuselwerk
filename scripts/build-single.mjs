/**
 * Packt den gebauten Prototyp in eine einzige HTML-Datei.
 *
 * Erzeugt zwei Fassungen aus denselben Bausteinen:
 *   dist/wuselwerk-single.html    vollständige Seite, überall direkt zu öffnen
 *   dist/wuselwerk-artifact.html  nur Seiteninhalt, für Hoster, die Rumpf und
 *                                 Kopf selbst beisteuern
 *
 * Voraussetzung: `npx vite build` lief vorher.
 */
import { readFileSync, writeFileSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const assets = readdirSync(join(DIST, 'assets'));
const jsName = assets.find((f) => f.endsWith('.js'));
const cssName = assets.find((f) => f.endsWith('.css'));
if (!jsName) throw new Error('Kein JS-Bündel in dist/assets — erst `vite build` laufen lassen.');

const js = readFileSync(join(DIST, 'assets', jsName), 'utf8');
const css = cssName ? readFileSync(join(DIST, 'assets', cssName), 'utf8') : '';

// Ein wörtliches </script> im Bündel würde den Skriptblock vorzeitig schliessen.
const safeJs = js.replace(/<\/script/gi, '<\\/script');

/**
 * Fassung um das Spielfeld. Farben und Schrift stammen aus dem HUD des Spiels
 * (src/render/hud.ts), damit Rahmen und Spiel dieselbe Sprache sprechen.
 *
 * Bewusst einthemig dunkel — aber nicht mehr aus dem ursprünglichen Grund. Das
 * Spiel war einmal eine Nachtszene; seit der Aufhellung der Palette spielt es
 * bei Tag. Der dunkle Rahmen bleibt trotzdem, und zwar jetzt als Gegensatz:
 * Ein heller Rahmen um ein helles Spielfeld lässt die Ränder ineinanderlaufen,
 * ein dunkler fasst das Bild ein. Alle Farben sind ausdrücklich gesetzt, damit
 * die Seite auf jedem Untergrund hält.
 */
const wrapperCss = `
:root {
  color-scheme: dark;
  --grund: #05070c;
  --panel: #0e131c;
  --linie: #27334a;
  --text: #dce6f5;
  --leise: #7b8ba3;
  --akzent: #ffd23f;
}
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  background: var(--grund);
  color: var(--text);
  overflow: hidden;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
}
body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
.rahmen {
  width: 100%;
  height: 100%;
  position: relative;
  background: var(--grund);
}
#spielfeld {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.fusszeile { display: none; }

/* Auf breiten Schirmen in Gerätegrösse zeigen statt breitziehen. Quer, weil
   das Spiel dorthin geht; das Hochformat funktioniert weiter, sobald das
   Fenster höher als breit ist. */
@media (min-width: 560px) {
  body { padding: 24px; box-sizing: border-box; }
  .rahmen {
    width: min(844px, calc(100vw - 48px));
    aspect-ratio: 844 / 390;
    height: auto;
    border: 1px solid var(--linie);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.55);
  }
  .fusszeile {
    display: block;
    max-width: 46ch;
    text-align: center;
    font-size: 12px;
    line-height: 1.6;
    color: var(--leise);
    margin: 0;
  }
  .fusszeile b { color: var(--akzent); font-weight: 600; }
}
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
`.trim();

const fusszeile =
  '<p class="fusszeile">Erst einen <b>Beruf</b> wählen, dann eine Figur antippen. ' +
  'Finger gedrückt halten bremst die Zeit auf ein Viertel und blendet die Lupe ein.</p>';

const body = `<title>Wuselwerk</title>
<style>
${css}
${wrapperCss}
</style>
<div class="rahmen"><canvas id="spielfeld"></canvas></div>
${fusszeile}
<script type="module">
${safeJs}
</script>`;

writeFileSync(join(DIST, 'wuselwerk-artifact.html'), body);

/**
 * Das App-Icon (scripts/make-icon.mjs → art-src/icon/).
 *
 * Zwei Wege, weil die Plattformen zwei Sprachen sprechen:
 * - Das **Favicon** kommt als Data-URI in den Kopf — funktioniert überall,
 *   auch wenn die Datei allein verschickt wird.
 * - Das **Home-Bildschirm-Icon** (apple-touch-icon) lädt iOS nicht
 *   verlässlich aus Data-URIs; es will eine echte Adresse. Deshalb legt der
 *   Build `apple-touch-icon.png` neben die Seite (Stamm und dist). Wer die
 *   einzelne Datei ohne Nachbarn öffnet, bekommt Safaris Bildschirmfoto als
 *   Rückfall — mit Nachbardatei (GitHub Pages) das echte Icon.
 */
const iconKopf = (() => {
  const klein = 'art-src/icon/icon-64.png';
  const gross = 'art-src/icon/icon-180.png';
  if (!existsSync(klein) || !existsSync(gross)) {
    console.warn('Kein Icon gefunden — `node scripts/make-icon.mjs` erzeugt es.');
    return '';
  }
  const b64 = readFileSync(klein).toString('base64');
  copyFileSync(gross, join(DIST, 'apple-touch-icon.png'));
  copyFileSync(gross, 'apple-touch-icon.png');
  return `<link rel="icon" type="image/png" href="data:image/png;base64,${b64}">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Wusel">`;
})();

writeFileSync(
  join(DIST, 'wuselwerk-single.html'),
  `<!doctype html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#05070c">
${iconKopf}
</head>
<body>
${body}
</body>
</html>
`,
);

// Dieselbe Seite noch einmal im Projektstamm und unter dist/spielen.html.
//
// Grund: GitHub Pages kennt zwei Betriebsarten. Steht die Quelle auf
// "GitHub Actions", wird dist ausgeliefert; steht sie auf "Deploy from a
// branch", der Projektstamm. Weil diese Datei an beiden Orten liegt und
// nichts nachlädt, ist sie in beiden Fällen erreichbar.
//
// Die Fassung im Stamm ist bewusst eingecheckt, obwohl sie erzeugt wird —
// nur so gibt es einen Link, der ohne Einstellungsänderung funktioniert.
// Bei jeder Änderung am Spiel muss `npm run build:single` neu laufen.
const standalone = readFileSync(join(DIST, 'wuselwerk-single.html'), 'utf8');
writeFileSync(join(DIST, 'spielen.html'), standalone);
writeFileSync('spielen.html', standalone);

const kb = (s) => `${Math.round(s.length / 1024)} kB`;
console.log(`dist/wuselwerk-single.html    ${kb(js)} Skript, alles eingebettet`);
console.log(`dist/wuselwerk-artifact.html  nur Seiteninhalt`);
console.log(`dist/spielen.html + ./spielen.html  Kopie für beide Pages-Betriebsarten`);
