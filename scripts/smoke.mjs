/**
 * Sicht- und Bedienprobe im echten Browser bei Handygroesse.
 *
 * Prueft die drei Punkte, an denen das Projekt haengt (GDD §3.1–3.3):
 * Fokuszeit, Lupe und intelligentes Zielen — und spielt Level 1 durch.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const OUT = process.env.SHOT_DIR ?? 'shots';
const PORT = 4319;
mkdirSync(OUT, { recursive: true });

// Direkt die Binärdatei starten, nicht über npx — sonst trifft kill() nur den
// Wrapper und der Server überlebt den Testlauf.
const server = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--host', '127.0.0.1'],
  { stdio: 'ignore' },
);
server.unref();
const stopServer = () => {
  try {
    server.kill('SIGKILL');
  } catch {
    /* schon weg */
  }
};
process.on('exit', stopServer);

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/`);
      if (r.ok) return;
    } catch {
      /* noch nicht da */
    }
    await sleep(250);
  }
  throw new Error('Vorschauserver kam nicht hoch');
}

const errors = [];
const checks = [];

/**
 * Wartet, bis die Auto-Kamera zur Ruhe gekommen ist.
 *
 * Sie gleitet nach jedem Zurückholen weich zum Pulk. Wer währenddessen eine
 * Bildschirmstelle ausrechnet und dann darauf drückt, drückt auf eine
 * veraltete Stelle — je grösser der Massstab, desto weiter daneben. Das ist
 * kein Spielfehler, sondern eine Eigenheit einer folgenden Kamera; die Prüfung
 * muss sie abwarten wie ein Spieler auch.
 */
async function kameraRuhig(page, ms = 2500) {
  let vorher = null;
  for (let i = 0; i < ms / 80; i++) {
    const c = await page.evaluate(() => window.__wuselwerk.debugCamera());
    if (vorher && Math.abs(c.cx - vorher.cx) < 0.4 && Math.abs(c.cy - vorher.cy) < 0.4) return;
    vorher = c;
    await sleep(80);
  }
}

function check(name, ok, detail = '') {
  checks.push({ name, ok, detail });
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) errors.push(name);
}

async function main() {
  await waitForServer();
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  // Abgriff am Ausgang. Ohne ihn prüft man nur, ob Töne *geplant* werden —
  // und genau das war einmal grün, während in Wirklichkeit nichts zu hören
  // war, weil der Pegel 19 dB unter den Effekten lag.
  await page.addInitScript(() => {
    const orig = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (dest, ...rest) {
      if (dest?.constructor?.name === 'AudioDestinationNode') {
        const ctx = dest.context;
        if (!ctx.__tap) {
          ctx.__tap = ctx.createAnalyser();
          ctx.__tap.fftSize = 2048;
          window.__tap = ctx.__tap;
        }
        try {
          orig.call(this, ctx.__tap);
        } catch {
          /* schon verbunden */
        }
      }
      return orig.call(this, dest, ...rest);
    };
    window.__peak = () => {
      if (!window.__tap) return 0;
      const d = new Float32Array(window.__tap.fftSize);
      window.__tap.getFloatTimeDomainData(d);
      let p = 0;
      for (const v of d) p = Math.max(p, Math.abs(v));
      return p;
    };
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });

  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
  await sleep(400);
  await page.screenshot({ path: `${OUT}/01-menu.png` });

  await page.mouse.click(195, 147); // Level 1
  await sleep(300);
  await page.screenshot({ path: `${OUT}/02-intro.png` });

  await page.mouse.click(195, 507); // "Falltür öffnen"
  await sleep(2500);
  await page.screenshot({ path: `${OUT}/03-lauft.png` });

  // --- §3.1 Fokuszeit: Finger auf dem Glas -> Viertelgeschwindigkeit --------
  const t0 = await page.evaluate(() => window.__wuselwerk.debugTicks());
  await sleep(1000);
  const t1 = await page.evaluate(() => window.__wuselwerk.debugTicks());
  await page.mouse.move(195, 400);
  await page.mouse.down();
  await sleep(1000);
  const t2 = await page.evaluate(() => window.__wuselwerk.debugTicks());
  await page.mouse.up();
  const normal = t1 - t0;
  const focused = t2 - t1;
  check(
    '§3.1 Fokuszeit bremst auf rund 25 %',
    focused > 0 && focused < normal * 0.45,
    `${normal} Ticks/s normal, ${focused} Ticks/s beim Halten`,
  );

  // --- Ton: nach der ersten Geste muss der Klangkontext laufen (GDD §7) -----
  const audio = await page.evaluate(() => window.__wuselwerk.debugAudio());
  check('§7 Klangkontext nach Nutzergeste aktiv', audio?.ready === true, JSON.stringify(audio));
  check(
    '§7 Musikschleife legt Töne',
    audio?.music?.playing === true && audio.music.notes > 4,
    `${audio?.music?.notes} Schritte geplant`,
  );

  // Der eigentliche Beweis: Kommt am Ausgang genug an, um es zu hören?
  // 0,03 Spitze ist rund −30 dBFS — darunter geht Musik auf einem Handy
  // gegen die Effekte unter.
  let pegel = 0;
  for (let i = 0; i < 16; i++) {
    pegel = Math.max(pegel, await page.evaluate(() => window.__peak()));
    if (pegel >= 0.06) break;
    await sleep(150);
  }
  check('§7 Musik kommt hörbar am Ausgang an', pegel > 0.03, `Spitze ${pegel.toFixed(3)}`);
  const mutedNow = await page.evaluate(() => window.__wuselwerk.debugToggleSound());
  const mutedBack = await page.evaluate(() => window.__wuselwerk.debugToggleSound());
  check('§7 Stummschaltung schaltet um', mutedNow === true && mutedBack === false);

  // --- Sprite-Blatt und Rückfallebene ---------------------------------------
  const art = await page.evaluate(() => window.__wuselwerk.debugArt());
  check('Sprite-Blatt wird gefunden und geladen', art.atlas === true, `${art.clips} Clips`);
  await page.screenshot({ path: `${OUT}/12-atlas.png` });
  await page.evaluate(() => window.__wuselwerk.debugClearAtlas());
  await sleep(300);
  const off = await page.evaluate(() => window.__wuselwerk.debugArt());
  check('Ohne Blatt zeichnet die Rückfallebene weiter', off.atlas === false);
  await page.screenshot({ path: `${OUT}/13-prozedural.png` });
  await page.evaluate(() => window.__wuselwerk.debugUseTemplateAtlas());
  const back = await page.evaluate(() => window.__wuselwerk.debugArt());
  check('Blatt lässt sich zur Laufzeit wieder einsetzen', back.atlas === true);

  // --- Steuerung: einhändig schwenken und Übersichtskarte (GDD §3.5) --------
  const cam0 = await page.evaluate(() => window.__wuselwerk.debugCamera());
  await page.mouse.move(195, 300);
  await page.mouse.down();
  await page.mouse.move(120, 300, { steps: 8 });
  await page.mouse.up();
  const cam1 = await page.evaluate(() => window.__wuselwerk.debugCamera());
  check(
    '§3.5 Ziehen mit einem Finger schwenkt das Bild',
    cam1.follow === false && Math.abs(cam1.cx - cam0.cx) > 10,
    `cx ${cam0.cx.toFixed(0)} -> ${cam1.cx.toFixed(0)}`,
  );

  const mapBox = await page.evaluate(() => window.__wuselwerk.debugMinimapBox());
  check('Übersichtskarte vorhanden', !!mapBox, mapBox ? `${mapBox.w}x${mapBox.h}` : 'keine');
  if (mapBox) {
    await page.mouse.click(mapBox.x + mapBox.w * 0.2, mapBox.y + mapBox.h * 0.5);
    const cam2 = await page.evaluate(() => window.__wuselwerk.debugCamera());
    check(
      'Tippen auf die Karte springt dorthin',
      cam2.cx < cam1.cx - 5,
      `cx ${cam1.cx.toFixed(0)} -> ${cam2.cx.toFixed(0)}`,
    );
  }
  await page.screenshot({ path: `${OUT}/09-karte.png` });
  // Auto-Kamera wieder einschalten
  await page.evaluate(() => window.__wuselwerk.debugRecenter());

  // --- Gräber wählen -------------------------------------------------------
  const btn = await page.evaluate(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const controlsH = Math.max(148, Math.min(214, Math.round(h * 0.26)));
    const areaX = 8 + 44 + 10;
    const bw = (w - areaX - 8 - 4 * 7) / 8;
    const i = 7;
    const t = (i - 3.5) / 3.5;
    return {
      x: areaX + i * (bw + 4) + bw / 2,
      y: h - controlsH + 16 + (13 - (1 - t * t) * 13) + 24,
    };
  });
  await page.mouse.click(btn.x, btn.y);
  const sel = await page.evaluate(() => window.__wuselwerk.debugStats().selected);
  check('Beruf lässt sich wählen und bleibt aktiv', sel === 'digger', `gewählt: ${sel}`);
  await page.screenshot({ path: `${OUT}/04-graeber-gewaehlt.png` });

  // --- §3.5 mit gewähltem Beruf: der eigentliche Spielzustand --------------
  // Vorher hing das Schwenken daran, dass *kein* Beruf gewählt war — also
  // genau am Gegenteil dessen, was man beim Spielen tut. Gezogen wird über
  // leerem Himmel, wo keine Figur unter dem Finger liegt.
  const camA = await page.evaluate(() => window.__wuselwerk.debugCamera());
  await page.mouse.move(260, 200);
  await page.mouse.down();
  await page.mouse.move(150, 200, { steps: 8 });
  await page.mouse.up();
  const camB = await page.evaluate(() => window.__wuselwerk.debugCamera());
  check(
    '§3.5 Schwenken geht auch mit gewähltem Beruf',
    Math.abs(camB.cx - camA.cx) > 10,
    `cx ${camA.cx.toFixed(0)} -> ${camB.cx.toFixed(0)}`,
  );
  const nachDrag = await page.evaluate(() => window.__wuselwerk.debugStats());
  check(
    'Das Schwenken vergibt dabei keinen Beruf',
    nachDrag.skillsUsed === 0,
    `skillsUsed=${nachDrag.skillsUsed}`,
  );
  // Vor dem Zielen dorthin schauen, wo gezielt wird — genau das tut ein
  // Spieler mit der Übersichtskarte. Nötig, seit das Sichtfenster 180 statt
  // 300 logische Pixel breit ist: Pulk und Ausgangstür liegen nicht mehr
  // gleichzeitig im Bild, und die Figur über der Tür stand ausserhalb.
  // Nebeneffekt, der die Prüfung stabiler macht: Ohne Auto-Kamera wandern die
  // Bildschirmstellen zwischen Ausrechnen und Antippen nicht mehr.
  await page.evaluate(() => window.__wuselwerk.debugCenterOn(240, 300));
  await sleep(200);

  // --- §3.2/§3.3: über der Ausgangstür zielen und zuweisen ------------------
  let pos = null;
  for (let i = 0; i < 120 && !pos; i++) {
    pos = await page.evaluate(() => window.__wuselwerk.debugWalkerScreenPos(232, 248));
    if (!pos) await sleep(60);
  }
  check('Figur im Zielstreifen gefunden', !!pos);
  let shaftPlaced = false;

  // Der Schacht muss über der Tür liegen, sonst kann dieser Durchlauf gar
  // nicht gewinnen. Landet er daneben, ist das kein Spielfehler, sondern eine
  // verfehlte Zuweisung — dann neu ansetzen statt zufällig rot melden.
  const shaftOverExit = async () => {
    const d = await page.evaluate(() =>
      (window.__wuselwerk.debugStats().diggerX ?? null),
    );
    return d === null || (d >= 224 && d <= 255);
  };

  if (pos) {
    await page.mouse.move(pos.x, pos.y);
    await page.mouse.down();
    await sleep(700);
    const zielzustand = await page.evaluate(() => window.__wuselwerk.debugAim());
    check(
      '§3.3 Beim Halten liegt ein Ziel unter dem Finger',
      zielzustand.ziel !== null,
      `${JSON.stringify(zielzustand)} bei ${pos.x.toFixed(0)}/${pos.y.toFixed(0)}, Karte ${JSON.stringify(mapBox)}`,
    );
    await page.screenshot({ path: `${OUT}/05-lupe-fokuszeit.png` });
    // So spielt man wirklich: während der Fokuszeit nachjustieren, dann loslassen.
    //
    // Nur ein *kleiner* Versatz. Der Rückgabewert kann eine ganz andere Figur
    // im Zielstreifen sein, hundert Pixel entfernt; dorthin zu springen wäre
    // keine Nachjustierung, sondern ein Zug über den halben Bildschirm — und
    // den wertet das Spiel zu Recht als Schwenken (siehe PAN_SCHWELLE_ZIEL).
    const adj = await page.evaluate(() => window.__wuselwerk.debugWalkerScreenPos(236, 244));
    if (adj && Math.hypot(adj.x - pos.x, adj.y - pos.y) < 36) {
      await page.mouse.move(adj.x, adj.y);
    }
    await sleep(60);
    await page.mouse.up();
    await sleep(400);
    const st = await page.evaluate(() => window.__wuselwerk.debugStats());
    check('§3.3 Tippen vergibt den Beruf', st.skillsUsed === 1, `skillsUsed=${st.skillsUsed}`);
    shaftPlaced = await shaftOverExit();
    check('Der Schacht sitzt über der Ausgangstür', shaftPlaced);
    await page.screenshot({ path: `${OUT}/06-graebt.png` });
  }

  // --- Bis zum Ende laufen lassen ------------------------------------------
  let end = null;
  for (let i = 0; i < 90; i++) {
    await sleep(500);
    end = await page.evaluate(() => window.__wuselwerk.debugStats());
    if (end.phase === 'result') break;
  }
  await page.screenshot({ path: `${OUT}/07-ergebnis.png` });
  const wonIt = end?.phase === 'result' && end.saved >= 8;
  check(
    'Level 1 im Browser gewonnen',
    wonIt,
    `gerettet ${end?.saved}, verloren ${end?.dead}, Berufe ${end?.skillsUsed}` +
      (wonIt ? '' : shaftPlaced ? ' — Schacht sass richtig, echter Fehler' : ' — Zuweisung verfehlt, kein Spielfehler'),
  );

  // --- §3.3 Auswahl-Fächer: eigener Durchlauf mit voller Freisetzungsrate ---
  // "Nochmal" ist bei Sieg der zweite, bei Niederlage der erste Knopf.
  const wonRun = (end?.saved ?? 0) >= 8;
  const panelTop = (844 - 356) / 2;
  await page.mouse.click(195, panelTop + 232 + (wonRun ? 42 : 0) + 18);
  await sleep(300);
  await page.mouse.click(195, 507); // "Falltür öffnen"
  await page.mouse.click(btn.x, btn.y); // Gräber wählen
  await page.evaluate(() => window.__wuselwerk.debugSetRate(99));
  await sleep(2000);
  await kameraRuhig(page);

  let fanned = 0;
  for (let attempt = 0; attempt < 40 && fanned < 2; attempt++) {
    const crowd = await page.evaluate(() => window.__wuselwerk.debugCrowdScreenPos());
    if (!crowd) {
      await sleep(60);
      continue;
    }
    await page.mouse.move(crowd.x, crowd.y);
    await page.mouse.down();
    fanned = await page.evaluate(() => window.__wuselwerk.debugFanSize());
    if (fanned >= 2) {
      await page.mouse.move(crowd.x - 60, crowd.y - 60);
      await sleep(250);
      await page.screenshot({ path: `${OUT}/08-faecher.png` });
    }
    await page.mouse.up();
    if (fanned < 2) await sleep(50);
  }
  check('§3.3 Auswahl-Fächer öffnet sich', fanned >= 2, `${fanned} Kandidaten`);

  await browser.close();
  stopServer();

  const failed = checks.filter((c) => !c.ok).length;
  if (errors.length || failed) {
    console.error(`\nFEHLGESCHLAGEN (${failed} Prüfungen)\n${errors.join('\n')}`);
    process.exit(1);
  }
  console.log('\nAlle Browserprüfungen bestanden.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  stopServer();
  process.exit(1);
});
