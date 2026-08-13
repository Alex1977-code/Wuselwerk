import { MAT, SKILLS, type SkillCounts } from '../core/types';
import type { LevelDef } from './types';

function sk(partial: Partial<SkillCounts>): SkillCounts {
  const out = {} as SkillCounts;
  for (const s of SKILLS) out[s] = partial[s] ?? 0;
  return out;
}

/**
 * Welt 5 — der Schlot.
 *
 * „Senkrecht in den Berg. Hitze von unten, Zeitdruck von oben."
 * (`welten.ts`). Fuenfzehn Level, drei Kapitel: **Krater**, **Ader**,
 * **Kern**.
 *
 * ## Die eine Entwurfsregel dieser Welt
 *
 * **Zwei Welten in einem Level** (Level-Konzept, Paket 4). Die Abschlusswelt
 * fuehrt nichts Neues ein — jedes Level verbindet zwei Bausteine aus zwei
 * verschiedenen Welten davor. Die alte Regel („der Schlot erfindet nichts,
 * er beschleunigt") hatte zehn von fuenfzehn Leveln als woertliche
 * Koordinaten-Klone stehen lassen; die in der Design-Runde beschlossene
 * Rot-Test-Abnahme (K1) war dort nie erfuellt. Paket 4 holt sie nach:
 * Acht Klone sind durch Zwei-Bausteine-Ersatzbauten ersetzt (darunter die
 * zwei Tripel-Meisterstuecke), zwei sind so umgebaut, dass ihr Quellplan
 * nachweislich scheitert, und jedes Level dieser Welt hat seinen eigenen
 * Rot-Test gegen den geerbten Plan. Haertebudget und Durchatmer-Takt
 * gelten unvermindert: hoechstens zwei Verstaerker je Level, und
 * spaetestens jedes dritte Level ist ein sicherer Sieg.
 */
export const WELT5_LEVELS: LevelDef[] = [
  {
    id: 'w5-01',
    name: 'Die Gabel im Krater',
    chapter: 'Krater',
    // Ersatzbau (Paket 4): B5 aktivierte Kaskade (W4) + B8 Weiche (W1).
    // Der Abstieg endet auf einer Platte mit Riegel im Osten und offener
    // Westkante 96 ueber der Sohle: Der Rammer oeffnet den sicheren
    // Ost-Ast (zweimal 48), der Waechter wendet, wer westwaerts in den
    // toedlichen Fall liefe. Beide Aeste laufen vor der Tuer zusammen;
    // die zwei Schirme im Vorrat machen die Westkante zur Kuer-Abkuerzung.
    // Gemessen: Die tickgenaue Musterloesung braucht den Waechter nicht —
    // der Rammer ist schneller als der Nachschub, niemand wendet je. Bei
    // menschlichem Tempo wenden die ersten Nachruecker sehr wohl; der
    // Waechter im Vorrat ist ihre Versicherung, und das Par laesst ihn zu.
    // Der geerbte Plan (null Zuweisungen, w4-01 alt) verliert den Pulk an
    // die Westkante — der Rot-Test haelt es fest.
    hint: 'Der Riegel sperrt den sicheren Ost-Ast, die Westkante fällt sechsundneunzig. Ramme — und stelle den Wächter, bevor der erste westwärts kippt.',
    theme: 'magma',
    width: 480,
    height: 620,
    seed: 51001,
    entrance: { x: 240, y: 140 },
    exit: { x: 300, y: 318, w: 32, h: 26 },
    total: 12,
    // Musterloesung rettet alle 12 (der Waechter faellt im Messlauf gar
    // nicht an); Quote 8 laesst Marge 4 — genug, dass auch die
    // Versicherungs-Fassung mit stehendem Waechter (11) bequem besteht.
    needed: 8,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (41,3 s), W5-Faktor.
    timeLimitSec: 60,
    releaseRate: 55,
    minReleaseRate: 30,
    skills: sk({ basher: 2, blocker: 2, floater: 2 }),
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      // Stufe 1 der Kaskade.
      { t: 'rect', x: 120, y: 200, w: 260, h: 12, mat: MAT.ROCK },
      // Die Gabel-Platte: Riegel im Osten, offene 96er-Kante im Westen.
      { t: 'rect', x: 100, y: 248, w: 320, h: 12, mat: MAT.ROCK },
      { t: 'rect', x: 392, y: 218, w: 28, h: 30, mat: MAT.ROCK },
      // Der Ost-Ast: Schelf auf halber Hoehe, beide Faelle 48.
      { t: 'rect', x: 360, y: 296, w: 120, h: 12, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 480, y: 344, h: 276, mat: MAT.EARTH, rough: 2 },
    ],
  },
  {
    id: 'w5-02',
    name: 'Unter der Kruste',
    chapter: 'Krater',
    // Ersatzbau (Paket 4): B1 Etagen mit Blankeis-Haut (W4) + B3
    // Miner-Schraege (W3) — das nie gespielte Paar miner+digger, wie es
    // die Kombinationsmatrix fuer den Turm vorsieht: Jede Etage stellt die
    // Wahl senkrecht oder schraeg, und die Stahlkruste entscheidet sie.
    // Etage 1 traegt Kruste bis auf den Firn-Ostrand — nur die Schraege
    // taucht darunter durch. Etage 2 traegt Kruste bis auf den Westrand —
    // dort ist der Schacht der richtige Griff. Niemand kann sterben.
    hint: 'Zwei Etagen, zwei Krusten: Oben taucht nur die Schräge unter das Blech, unten trägt der Schacht am Westrand. Wähle je Etage das richtige Werkzeug.',
    theme: 'magma',
    width: 480,
    height: 620,
    seed: 51002,
    entrance: { x: 140, y: 140 },
    exit: { x: 200, y: 390, w: 32, h: 26 },
    total: 12,
    // Musterloesung rettet alle 12: Quote = Messung - 3, Drittel A.
    needed: 9,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (77,9 s), W5-Faktor.
    timeLimitSec: 110,
    releaseRate: 55,
    minReleaseRate: 30,
    skills: sk({ miner: 2, digger: 2 }),
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      // Etage 1: 72er-Block, Kruste bis x400, Firn-Fenster im Osten.
      { t: 'rect', x: 0, y: 212, w: 480, h: 72, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 212, w: 400, h: 6, mat: MAT.STEEL },
      // Etage 2: 48er-Block, Kruste ab x80, Firn-Fenster im Westen. Duenn
      // mit Absicht: Wer nach dem Durchbruch in den offenen Schacht
      // laeuft, faellt Schacht plus Restluft in einem Stueck — 48 + 24
      // bleibt unter der 78er-Grenze (der erste Wurf mass 72 + 48 = 120
      // und kostete vier Leben, gemessen).
      { t: 'rect', x: 0, y: 344, w: 480, h: 48, mat: MAT.EARTH },
      { t: 'rect', x: 80, y: 344, w: 400, h: 6, mat: MAT.STEEL },
      { t: 'ground', x: 0, w: 480, y: 416, h: 204, mat: MAT.EARTH, rough: 2 },
    ],
  },
  {
    id: 'w5-03',
    name: 'Galerie in der Glut',
    chapter: 'Krater',
    // Ersatzbau (Paket 4): der Durchatmer des ersten Drittels — B2 Galerie
    // (W3) gespiegelt in neuer Silhouette: Balkon jetzt im OSTEN, die
    // Mauer mit der Tuer im Westen. Sicherer Sieg woertlich: Der Vorrat
    // traegt einen Schirm fuer JEDE Figur — wer allen auf dem Balkon die
    // Gabe gibt, verliert niemanden; die Kuer schirmt nur im Fall.
    hint: 'Der Balkon endet über der Halle, dreihundert tief. Ein Schirm für jeden — und unten öffnet ein Rammer die Mauer zur Tür.',
    theme: 'magma',
    width: 720,
    height: 540,
    seed: 51003,
    entrance: { x: 620, y: 120 },
    exit: { x: 40, y: 444, w: 32, h: 26 },
    total: 10,
    // Musterloesung rettet alle 10: Quote = Messung - 3, Drittel A.
    needed: 7,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (71,2 s), W5-Faktor.
    timeLimitSec: 100,
    releaseRate: 45,
    minReleaseRate: 20,
    skills: sk({ floater: 10, basher: 2 }),
    par: 11,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 20, mat: MAT.ROCK },
      // Der Balkon: Blech, von dessen Westkante der lange Fall beginnt.
      { t: 'rect', x: 400, y: 170, w: 320, h: 26, mat: MAT.STEEL },
      // Die Mauer mit der Tuer dahinter; der Hallenboden ist glatt, damit
      // der Rammer nach dem 2er-Versatz nie den Boden verliert (Messregel
      // aus w2-08).
      { t: 'rect', x: 120, y: 360, w: 44, h: 110, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 720, y: 470, h: 70, mat: MAT.EARTH, rough: 0 },
    ],
  },
  {
    id: 'w5-04',
    name: 'Heisse Naht',
    chapter: 'Krater',
    hint: 'Zwei Nähte, eine Wahl: Unter der einen liegt Stahl, unter der anderen der Weg. Sieh genau hin.',
    theme: 'magma',
    width: 720,
    height: 540,
    seed: 51004,
    entrance: { x: 100, y: 300 },
    exit: { x: 420, y: 386, w: 32, h: 26 },
    total: 20,
    needed: 15,
    // Uhr-Heilung (Paket 4): 1,4 x letzte Rettung (80,4 s) — die alte 90
    // stand bei Faktor 1,12, weit unter dem W5-Gesetz.
    timeLimitSec: 115,
    releaseRate: 50,
    minReleaseRate: 25,
    // Zwei Bomben fuer zwei Naehte: Ein Irrtum ist erlaubt und kostet nur
    // den Sprengmeister — die Falschloesung ist angekuendigt, nicht
    // toedlich (Blaupause 4 der Design-Runde).
    skills: sk({ bomber: 2, digger: 1, blocker: 1 }),
    par: 1,
    paint: [
      // Duenne Narbe ueber einer Stahlplatte — wie in w1-07, nur dass die
      // Platte jetzt ZWEI Naehte traegt und nur eine davon traegt.
      { t: 'rect', x: 0, y: 339, w: 720, h: 2, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 341, w: 720, h: 3, mat: MAT.STEEL },
      // Naht A — die attraktive Falsche: naeher am Eingang, aber unter ihr
      // liegt eine sichtbar stahlgraue Sohle. Der Krater oeffnet die
      // Platte und endet auf Metall; sichtbar verpufft.
      { t: 'rect', x: 260, y: 341, w: 4, h: 3, mat: MAT.EARTH },
      { t: 'rect', x: 236, y: 344, w: 52, h: 10, mat: MAT.STEEL },
      // Naht B — die echte: unter ihr nur Erde, der Krater legt den Weg
      // zur begrabenen Tuer frei.
      { t: 'rect', x: 455, y: 341, w: 4, h: 3, mat: MAT.EARTH },
      { t: 'ground', x: 0, w: 720, y: 405, h: 135, mat: MAT.EARTH, rough: 2 },
    ],
  },
  {
    id: 'w5-05',
    name: 'Schacht und Stollen',
    chapter: 'Krater',
    // Ersatzbau (Paket 4): B6 Kammer mit zwei Zugaengen (W4) in der
    // Urfassung des Konzepts — „Schacht kostet Schirm, Stollen kostet
    // Rammer und Zeit" — plus die Gaben-Etage E168 (W3-Stahllehre: die
    // Sohle faengt den Schacht). Oben: Graeber im Firn-Streifen hinter
    // der Falltuer, der Schacht endet auf der Stahlsohle im Vorraum der
    // Kammer — aber er misst 168, jeder Folger braucht den Schirm (der
    // Vorrat traegt einen fuer jeden). Seitlich: die 72er-Kaskade im
    // Osten, dann der lange Stollen zurueck in den Vorraum — ein Rammer,
    // kein Schirm, das Par. Wer nichts tut, pendelt sicher auf der
    // Kaskade: Sackgassen fangen mit Warten.
    hint: 'Zwei Tore in die Kammer: der Schacht hinter der Falltür — hundertachtundsechzig tief, nur mit Schirm. Oder die Ostkaskade und der lange Stollen. Nur einer hält das Par.',
    theme: 'magma',
    width: 480,
    height: 620,
    seed: 51005,
    entrance: { x: 60, y: 150 },
    exit: { x: 140, y: 354, w: 32, h: 26 },
    total: 12,
    // Stollenweg rettet 12, Schirmweg mit vollem Vorrat ebenso: Quote =
    // Messung - 3.
    needed: 9,
    // Uhr = 1,4 x letzte Rettung der LANGSAMEREN Route (Stollen, 66 s);
    // der Schirmschacht rettet in 35,2 s — beide Wege passen bequem.
    timeLimitSec: 95,
    releaseRate: 45,
    minReleaseRate: 20,
    skills: sk({ digger: 2, floater: 12, basher: 2 }),
    par: 1,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      // Die Hochflaeche ueber der Stahlsohle; oestlich die 72er-Kaskade.
      { t: 'rect', x: 0, y: 212, w: 340, h: 168, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 380, w: 480, h: 6, mat: MAT.STEEL },
      { t: 'rect', x: 0, y: 386, w: 480, h: 234, mat: MAT.ROCK },
      { t: 'rect', x: 340, y: 284, w: 75, h: 96, mat: MAT.EARTH },
      { t: 'rect', x: 415, y: 356, w: 65, h: 24, mat: MAT.EARTH },
      // Kammer und Vorraum: Der Vorraum liegt WESTLICH unter dem ganzen
      // Firn-Streifen und faengt jeden Schacht daraus; der Oststollen
      // bricht direkt durch die Kammer-Ostwand.
      { t: 'rect', x: 120, y: 314, w: 120, h: 66, mat: MAT.EMPTY },
      { t: 'rect', x: 0, y: 352, w: 120, h: 28, mat: MAT.EMPTY },
      // Blankeis: Deckel ueber der Kammer und Platte unter der Falltuer —
      // niemand kann den Schacht UNTER die Falltuer legen (Nachruecker
      // fielen sonst aus Tuerhoehe durch den offenen Schacht).
      { t: 'rect', x: 116, y: 212, w: 128, h: 6, mat: MAT.STEEL },
      { t: 'rect', x: 0, y: 212, w: 64, h: 6, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w5-06',
    name: 'Der Deckelpfad',
    chapter: 'Ader',
    // Ersatzbau (Paket 4): der Durchatmer des zweiten Drittels — B7
    // „die Decke ist ein Weg" (W2-07-Mechanik: Krone buendig mit der
    // Deckeloberkante, man laeuft AUF dem Deckel) in der Schlot-
    // Silhouette. Sicherer Sieg: Wer nicht klettert, wartet im Vorhof;
    // niemand kann sterben.
    hint: 'Die Wand trägt eine Krone, und die Krone ist der Weg: Oben über den Deckel — bis zur Lücke, die in die Grotte fällt.',
    theme: 'magma',
    width: 720,
    height: 540,
    seed: 51006,
    entrance: { x: 660, y: 380 },
    exit: { x: 430, y: 196, w: 32, h: 26 },
    total: 12,
    // Acht Kletterer steigen, acht kommen an: Quote = Messung - 3.
    needed: 5,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (51,2 s), W5-Faktor.
    timeLimitSec: 75,
    releaseRate: 45,
    minReleaseRate: 20,
    // +1 Kletterer (Paket 5): Ein Fehltipp verbrannte sonst die letzte Gabe.
    skills: sk({ climber: 9 }),
    par: 8,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 24, mat: MAT.ROCK },
      // Der Deckel mit der Luecke ueber der Grotte.
      { t: 'rect', x: 80, y: 160, w: 360, h: 20, mat: MAT.ROCK },
      { t: 'rect', x: 480, y: 160, w: 80, h: 20, mat: MAT.ROCK },
      // Die Wand: Krone buendig mit der Deckeloberkante.
      { t: 'rect', x: 560, y: 160, w: 26, h: 280, mat: MAT.ROCK },
      // Das Massiv unter dem Deckel, mit der Grotte und der Tuer.
      { t: 'rect', x: 80, y: 180, w: 506, h: 360, mat: MAT.ROCK },
      { t: 'rect', x: 400, y: 180, w: 100, h: 42, mat: MAT.EMPTY },
      // Der Vorhof: Pulk-Pfercht zwischen Wand und Weltrand.
      { t: 'ground', x: 586, w: 134, y: 440, h: 100, mat: MAT.EARTH, rough: 2 },
    ],
  },
  {
    id: 'w5-07',
    name: 'Schleife und Steg',
    chapter: 'Ader',
    // Ersatzbau (Paket 4): das erste Tripel-Meisterstueck —
    // climber+digger+builder, B4 Umweg-Schleife (W2) + Steg-Luecke (W4).
    // Der Anmarsch verlangt die Zweierkette ueber den 40er-Spalt; dahinter
    // wartet die bewiesene hohle Mauer aus w2-04 (Koordinaten der
    // Schleife woertlich uebernommen, die Fenster sind dort vermessen):
    // Ein Kletterer steigt auf, grabt erst die Schale bis auf den Stahl
    // (die Stufe), dann den Kern in die Galerie mit der Tuer. Der Steg
    // braucht die DREIERkette: Die Zweierkette endete sechs vor dem
    // Gegenufer, und ihr Kuppensturz in den Pfercht mass 95 (gemessen).
    hint: 'Erst der Steg über den Spalt — drei Bauer in einer Kette —, dann die hohle Mauer: hinauf, zweimal graben, erst die Schale, dann der Kern.',
    theme: 'magma',
    width: 720,
    height: 540,
    seed: 51007,
    entrance: { x: 200, y: 280 },
    exit: { x: 610, y: 438, w: 32, h: 26 },
    total: 14,
    // Musterloesung: Drossel sofort, Bruecke, Schleife — zwei fallen vor
    // fertigem Steg in den Spalt-Pfercht (72 tief, sicher) und werden per
    // Kletterer geborgen: alle 14 gerettet. Ohne Bergung bleiben 12;
    // Quote 11 laesst beides bestehen.
    needed: 11,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (71,2 s mit Bergung),
    // W5-Faktor.
    timeLimitSec: 100,
    releaseRate: 40,
    minReleaseRate: 15,
    skills: sk({ builder: 3, climber: 3, digger: 3 }),
    par: 8,
    paint: [
      { t: 'rect', x: 0, y: 70, w: 720, h: 24, mat: MAT.ROCK },
      // Westplateau A, der Spalt mit dem 40er-Pfercht-Grund (wer vor dem
      // Steg faellt, wartet sicher — und ein Kletterer holt ihn zurueck;
      // 40 flach mit Absicht: Auch der Sturz von der fertigen Stegkuppe
      // misst nur 73), Plateau B.
      { t: 'rect', x: 0, y: 340, w: 240, h: 200, mat: MAT.ROCK },
      { t: 'rect', x: 240, y: 380, w: 40, h: 160, mat: MAT.ROCK },
      { t: 'rect', x: 280, y: 340, w: 20, h: 200, mat: MAT.ROCK },
      // Ab hier die bewiesene w2-04-Schleife, Koordinaten identisch:
      // Stahlsenke, Fels, Erdkern-Mauer mit Felsschale und -kappe,
      // Galerie mit der Tuer unter der Mauer.
      { t: 'rect', x: 300, y: 400, w: 260, h: 10, mat: MAT.STEEL },
      { t: 'rect', x: 300, y: 410, w: 420, h: 130, mat: MAT.ROCK },
      { t: 'rect', x: 560, y: 336, w: 36, h: 124, mat: MAT.EARTH },
      { t: 'rect', x: 560, y: 330, w: 36, h: 6, mat: MAT.ROCK },
      { t: 'rect', x: 560, y: 336, w: 6, h: 64, mat: MAT.ROCK },
      { t: 'rect', x: 596, y: 400, w: 124, h: 140, mat: MAT.ROCK },
      { t: 'rect', x: 520, y: 430, w: 180, h: 34, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w5-08',
    name: 'Doppelader',
    chapter: 'Ader',
    hint: 'Zwei erkaltete Adern, versetzt. Der Weg dazwischen war noch nie so knapp.',
    theme: 'magma',
    width: 960,
    height: 540,
    seed: 51008,
    entrance: { x: 160, y: 280 },
    exit: { x: 420, y: 390, w: 32, h: 24 },
    total: 20,
    // Remix statt Kopie (Design-Runde, Blaupause 5): w1-05-Geometrie mal
    // w3-01-Idee. Die Platte ist durchgehend, nur eine 24 Punkte breite
    // Rostluecke bei x 520 fuehrt hinab — sichtbar, denn ueberall sonst
    // steht der Graeber auf Stahl. Unten geht es nur nach WESTEN. Der
    // w1-05-Plan (graben bei 690) endet auf der Platte; der Rot-Test
    // belegt es. Der Sprengmeister ist Koeder: Die Platte hat keine Naht.
    needed: 17,
    timeLimitSec: 90,
    releaseRate: 60,
    minReleaseRate: 30,
    skills: sk({ digger: 2, basher: 2, blocker: 1, bomber: 1 }),
    par: 2,
    paint: [
      { t: 'ground', x: 0, w: 960, y: 340, h: 200, mat: MAT.EARTH, rough: 2 },
      { t: 'rect', x: 120, y: 372, w: 820, h: 14, mat: MAT.STEEL },
      { t: 'rect', x: 520, y: 372, w: 24, h: 14, mat: MAT.EARTH },
      { t: 'rect', x: 360, y: 408, w: 600, h: 12, mat: MAT.STEEL },
    ],
  },
  {
    id: 'w5-09',
    name: 'Kaminzug',
    chapter: 'Ader',
    // Ersatzbau (Paket 4): climber+bomber — der Kaminzug mit gesprengtem
    // Podestdeckel, erstmals ausserhalb eines Finales (Kombinationsmatrix
    // B7/W5). Kletterer steigen die Westwand, kehren an der Krone um und
    // fallen 71 auf das Innenpodest im Kamin. Das Podest ist eine duenne
    // Platte ueber der Tuerkammer: Ein Sprengmeister reisst sie auf, und
    // alle fallen zur Tuer. Der Podest-Westrand ist Blankeis — dort kann
    // kein Krater entstehen, die Fall-Linie der Nachzuegler bleibt heil
    // (der Sprengtrichter oeffnet nur den Erdteil oestlich davon). Ein
    // Kragstein an der Ostwand bricht jeden Kletterversuch aus dem Kamin.
    // Der Waechter ist der Sprenganker (die w4-06-Lehre): Ein pendelnder
    // Sprengmeister explodiert an zufaelliger Stelle — ein gesprengter
    // Waechter genau dort, wo er steht.
    hint: 'Hinauf, an der Krone umkehren, aufs Podest im Kamin. Stelle den Wächter östlich des Blankeisrands — und sprenge ihn frei: Alle fallen zur Tür.',
    theme: 'magma',
    width: 480,
    height: 620,
    seed: 51009,
    entrance: { x: 100, y: 150 },
    exit: { x: 240, y: 260, w: 32, h: 26 },
    total: 12,
    // Acht steigen, einer sprengt sich frei: sieben kommen an. Quote =
    // Messung - 2.
    needed: 5,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (57,6 s), W5-Faktor.
    timeLimitSec: 85,
    releaseRate: 45,
    minReleaseRate: 20,
    skills: sk({ climber: 8, blocker: 1, bomber: 2 }),
    par: 10,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 480, h: 20, mat: MAT.ROCK },
      // Der Vorhof: Pfercht zwischen Weltrand und Kaminwand A.
      { t: 'rect', x: 0, y: 212, w: 200, h: 408, mat: MAT.ROCK },
      // Kaminwand A (Krone 72 ueber dem Vorhof) und Kaminwand B, dazu der
      // Kragstein, der Kletterer im Kamin am Ausbruch hindert.
      { t: 'rect', x: 200, y: 140, w: 26, h: 480, mat: MAT.ROCK },
      { t: 'rect', x: 286, y: 140, w: 26, h: 480, mat: MAT.ROCK },
      { t: 'rect', x: 279, y: 170, w: 7, h: 6, mat: MAT.ROCK },
      // Das Innenpodest: Blankeis-Westrand, Erddeckel ueber der Kammer.
      { t: 'rect', x: 226, y: 212, w: 60, h: 8, mat: MAT.EARTH },
      { t: 'rect', x: 226, y: 212, w: 14, h: 8, mat: MAT.STEEL },
      // Die Tuerkammer im Fels unter dem Podest.
      { t: 'rect', x: 226, y: 220, w: 60, h: 66, mat: MAT.EMPTY },
      { t: 'rect', x: 226, y: 286, w: 60, h: 334, mat: MAT.ROCK },
    ],
  },
  {
    id: 'w5-10',
    name: 'Glutregen',
    chapter: 'Ader',
    // Ersetzt den vierten Schirmregen (Design-Runde, Paket 4): Der Schirm
    // traegt hinab wie gehabt — aber die Landeinsel hat zwei sichtbare
    // Todeskanten, und die Laufrichtung der Gelandeten fuehrt geradewegs
    // auf die oestliche zu. Der erste Gelandete muss Waechter werden;
    // Westlaeufer faengt die Tuer von selbst.
    hint: 'Der Schirm bringt dich auf die Insel — und die Insel hat Kanten. Der Erste unten wird Wächter.',
    theme: 'magma',
    width: 720,
    height: 620,
    seed: 51010,
    entrance: { x: 100, y: 110 },
    // Die Tuer liegt WESTLICH der Landestelle: Gelandete laufen ostwaerts
    // auf die Kante zu — erst der Abprall am Waechter bringt sie zur Tuer.
    exit: { x: 240, y: 450, w: 32, h: 26 },
    total: 12,
    needed: 7,
    // Uhr-Heilung (Paket 4): 1,4 x letzte Rettung (57,4 s) — die alte 65
    // stand bei Faktor 1,13.
    timeLimitSec: 80,
    releaseRate: 40,
    minReleaseRate: 20,
    skills: sk({ floater: 10, blocker: 2 }),
    par: 11,
    paint: [
      { t: 'rect', x: 0, y: 50, w: 720, h: 20, mat: MAT.ROCK },
      // Der Startsims: Blech, von dessen Ostkante der lange Fall beginnt.
      { t: 'rect', x: 0, y: 170, w: 320, h: 26, mat: MAT.STEEL },
      // Die Landeinsel — 300 Punkte tiefer, mit zwei offenen Kanten.
      { t: 'rect', x: 200, y: 470, w: 280, h: 150, mat: MAT.ROCK },
      // Der Grund der Schlucht, sichtbar toedlich tief (130 Punkte).
      { t: 'ground', x: 0, w: 200, y: 600, h: 20, mat: MAT.ROCK, rough: 2 },
      { t: 'ground', x: 480, w: 240, y: 600, h: 20, mat: MAT.ROCK, rough: 2 },
    ],
  },
  {
    id: 'w5-11',
    name: 'Unter der Galerie',
    chapter: 'Kern',
    // Ersatzbau (Paket 4): das zweite Tripel-Meisterstueck —
    // miner+basher+floater, B2 Galerie (W3, hier die W4-Variante
    // floater+miner: Landung in der Halle, Schraege zur tieferen Tuer)
    // + B3 Haarnadel (W3), gespiegelt zur w3-14-Westschraege: Vom
    // Westbalkon traegt der Schirm auf die Halde, die Ostschraege des
    // Baggers trifft die Stahlsohle, und der Rammer schlaegt den
    // Sohlen-Stollen ostwaerts in die Tuerkammer. Ein Schirm fuer jeden
    // liegt im Vorrat — niemand muss sterben.
    hint: 'Der Schirm trägt vom Balkon auf die Halde. Dann ostwärts: die Schräge auf die Stahlsohle, der Stollen in die Kammer. Drei Berufe, ein Weg.',
    theme: 'magma',
    width: 720,
    height: 620,
    seed: 51011,
    entrance: { x: 80, y: 100 },
    exit: { x: 620, y: 414, w: 32, h: 26 },
    total: 12,
    // Musterloesung rettet alle 12: Quote = Messung - 3.
    needed: 9,
    timeLimitSec: 150,
    releaseRate: 45,
    minReleaseRate: 20,
    skills: sk({ floater: 12, miner: 2, basher: 2 }),
    par: 14,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 720, h: 20, mat: MAT.ROCK },
      // Der Westbalkon: Blech, von dessen Ostkante der Schirmfall beginnt.
      { t: 'rect', x: 0, y: 150, w: 240, h: 26, mat: MAT.STEEL },
      // Die Halde ueber der Stahlsohle; die Tuerkammer im Osten wartet
      // unter dem Hinweg.
      { t: 'ground', x: 0, w: 720, y: 360, h: 260, mat: MAT.EARTH, rough: 0 },
      { t: 'rect', x: 200, y: 440, w: 520, h: 12, mat: MAT.STEEL },
      { t: 'rect', x: 600, y: 376, w: 80, h: 64, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w5-12',
    name: 'Zwei Hände',
    chapter: 'Kern',
    // Umbau (Paket 4): vom w3-04-Zwilling getrennt. Der Westspalt misst
    // jetzt 44 — die geerbte Zweierkette endet mittendrin und kippt ihre
    // Laeufer in den Pfercht (K1-Rot-Test); erst die Dreierkette traegt.
    // Beide Pferchtgruende liegen auf 420: Auch der Sturz von der
    // Stegkuppe (32 hoch) misst nur 72.
    hint: 'Zwei Spalte, zwei Ketten: drei Bauer über den breiten West-, zwei über den Ostspalt. Der Wächter hält, was du dir leisten kannst.',
    theme: 'magma',
    width: 960,
    height: 540,
    seed: 51012,
    entrance: { x: 120, y: 320 },
    exit: { x: 840, y: 360, w: 32, h: 28 },
    total: 20,
    // Musterloesung rettet 19 (der Waechter wird gesprengt): Quote =
    // Messung - 3.
    needed: 16,
    // Uhr = 1,4 x letzte Rettung der Musterloesung (110,6 s), W5-Faktor.
    timeLimitSec: 155,
    releaseRate: 70,
    minReleaseRate: 30,
    // +1 Bauer (Paket 5): ein Fehltipp Reserve.
    skills: sk({ builder: 6, blocker: 1, bomber: 1 }),
    par: 7,
    paint: [
      { t: 'rect', x: 0, y: 70, w: 960, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 368, y: 380, h: 160, mat: MAT.ROCK, rough: 2 },
      { t: 'ground', x: 412, w: 228, y: 380, h: 160, mat: MAT.ROCK, rough: 2 },
      { t: 'ground', x: 664, w: 296, y: 380, h: 160, mat: MAT.ROCK, rough: 2 },
      // Beide Spalte haben einen Grund — ueberlebbar, aber ohne Rueckweg.
      { t: 'rect', x: 368, y: 420, w: 44, h: 120, mat: MAT.ROCK },
      { t: 'rect', x: 664, y: 420, w: 24, h: 120, mat: MAT.ROCK },
    ],
  },
  {
    id: 'w5-13',
    name: 'Der Kessel',
    chapter: 'Kern',
    // Ersetzt das Ostfluegel-Doppel zu w5-15 (Design-Runde, Paket 4): DAS
    // Rate-Regler-Level. Die Luke steht auf Vollgas, vor der Tuer klafft
    // eine Fanggrube — wer die halbfertige Bruecke betritt, kippt vom Ende
    // hinein und sitzt fest (lebt, aber fehlt der Quote). Vollgas fuellt
    // den Kessel, Drosseln haelt ihn leer; nach dem Schlussstein wird
    // aufgedreht. Rate-Zuege kosten kein Par. Die erste Fassung dieses
    // Slots (Sprengung im vollen Pulk) fiel im Messlauf: Die Explosion
    // reisst keine Nachbarn mit - nur Terrain.
    hint: 'Die Luke steht auf Vollgas, und die Brücke ist noch nicht fertig. Drossle den Strom — der Kessel schluckt jeden Vorwitzigen.',
    theme: 'magma',
    width: 720,
    height: 540,
    seed: 51013,
    entrance: { x: 100, y: 330 },
    exit: { x: 600, y: 360, w: 32, h: 26 },
    total: 20,
    // Marge-Heilung (Paket 5): Die Drossel-Loesung rettet 19, Quote =
    // Messung - 3 — der Kessel ist der Durchatmer des letzten Drittels
    // (Vollgas fuellt ihn weit unter die Quote, Rot-Test).
    needed: 16,
    timeLimitSec: 75,
    releaseRate: 99,
    minReleaseRate: 15,
    // +1 Bauer (Paket 5): ein Fehltipp Reserve.
    skills: sk({ builder: 3 }),
    par: 2,
    paint: [
      { t: 'rect', x: 0, y: 70, w: 720, h: 24, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 720, y: 380, h: 160, mat: MAT.EARTH, rough: 2 },
      // Der Kessel: 70 Punkte tief - ueberlebbar, ausweglos, sichtbar.
      // 24 Punkte breit, das bewiesene w1-03-Mass: Eine Bruecke schafft
      // zwei Punkte je Stein, die Zweierkette also 48 - mehr Grube waere
      // fuer den Vorrat unerreichbar (der erste Wurf mass 60 und der Bauer
      // endete mitten im Loch).
      { t: 'rect', x: 368, y: 380, w: 24, h: 70, mat: MAT.EMPTY },
    ],
  },
  {
    id: 'w5-14',
    name: 'Kaskade und Steg',
    chapter: 'Kern',
    // Ersetzt die dritte Portion w1-10 (Design-Runde, Paket 4): Remix aus
    // zwei Frost-Bausteinen — die Kaskade von w4-01 und die Brueckenluecke
    // von w4-11, mitten im Abstieg. Unter der Luecke fehlt die naechste
    // Etage sichtbar: Wer faellt, faellt 140 Punkte. Blocker haelt den
    // Pulk, Brueckenkette schliesst den Steg, die Bombe oeffnet den Weg.
    hint: 'Die Kaskade führt hinab — bis zur Lücke. Halte den Pulk, schliesse den Steg, dann sprenge den Wächter frei.',
    theme: 'magma',
    width: 480,
    height: 720,
    seed: 51014,
    entrance: { x: 340, y: 150 },
    exit: { x: 224, y: 390, w: 32, h: 26 },
    total: 14,
    // Marge-Heilung (Paket 4): Die Musterloesung rettet 10, die alte
    // Quote 9 liess nur eine Figur Vergebung — Quote = Messung - 2.
    needed: 8,
    timeLimitSec: 135,
    releaseRate: 50,
    minReleaseRate: 25,
    // +1 Bauer (Paket 5): ein Fehltipp Reserve.
    skills: sk({ builder: 3, blocker: 1, bomber: 1 }),
    par: 4,
    paint: [
      { t: 'rect', x: 0, y: 50, w: 480, h: 20, mat: MAT.ROCK },
      { t: 'rect', x: 0, y: 200, w: 380, h: 12, mat: MAT.ROCK },
      // Die geteilte Etage: 44 Punkte Luecke, und darunter — nichts.
      // Westteil bis 304: Die Luecke misst 40 Punkte - eine Zweierkette
      // (48 Punkte Spannweite) erreicht das mit zwei Steinen Reserve.
      { t: 'rect', x: 100, y: 270, w: 204, h: 12, mat: MAT.ROCK },
      // Die Ost-Etage ist DICK: Auf ihr steht der Waechter, und seine
      // Sprengung soll eine Mulde reissen, kein Loch - das w1-03-Prinzip.
      { t: 'rect', x: 344, y: 270, w: 136, h: 50, mat: MAT.ROCK },
      { t: 'rect', x: 0, y: 340, w: 280, h: 12, mat: MAT.ROCK },
      { t: 'ground', x: 0, w: 480, y: 410, h: 310, mat: MAT.EARTH, rough: 2 },
    ],
  },
  {
    id: 'w5-15',
    name: 'Prüfung im Schlot',
    chapter: 'Kern',
    // Umbau (Paket 4): vom w3-13-Zwilling getrennt — zwei Welten duerfen
    // nicht mit demselben Meisterstueck enden. Gespiegelt (Grube im
    // Osten, Blechfluegel mit Naht und Riegel im Westen; der geerbte
    // Plan greift ueberall ins Leere, K1-Rot-Test) plus B6-Zweitzugang:
    // Die Tuer im Riegel ist auf ZWEI Wegen erreichbar — seitlich ueber
    // Naht-Sprengung und Riegel-Stollen (die alte Pruefung), oder oben
    // durch die Firn-Luke im Blech direkt ueber dem Riegel (ein Graeber,
    // der Schacht endet auf der Stahl-Tuersohle). Nur die Luke haelt das
    // Par — der dritte Stern ist eine andere Route.
    hint: 'Die Grube sortiert, und die Tür im Riegel hat zwei Tore: die Naht und den Stollen — oder die Firn-Luke im Blech, senkrecht auf die Türsohle.',
    theme: 'magma',
    width: 960,
    height: 600,
    seed: 51015,
    entrance: { x: 880, y: 300 },
    exit: { x: 184, y: 414, w: 32, h: 26 },
    total: 16,
    // Neun Kletterer, die Luken-Route rettet alle neun: Quote = Messung
    // minus 2. Ein Finale darf beissen; die Uhr-Niederlage kostet dank
    // Herzschutz kein Leben.
    needed: 7,
    // Uhr = 1,4 x letzte Rettung der LANGSAMEREN Route (Naht und Riegel,
    // 87,6 s); die Luken-Route rettet in 83,5 s.
    timeLimitSec: 125,
    releaseRate: 60,
    minReleaseRate: 25,
    skills: sk({ climber: 9, digger: 2, bomber: 2, basher: 2 }),
    par: 10,
    paint: [
      { t: 'rect', x: 0, y: 60, w: 960, h: 24, mat: MAT.ROCK },
      // Der Ostboden mit der Grube: Sie faengt jeden, der nicht klettert.
      { t: 'ground', x: 580, w: 380, y: 370, h: 230, mat: MAT.ROCK, rough: 2 },
      { t: 'rect', x: 750, y: 370, w: 60, h: 68, mat: MAT.EMPTY },
      // Die Muendung der Grube ist freigeraeumt: Der raue Boden kann sonst
      // eine Zwei-Punkte-Lippe ueber den Rand woelben, und ein Kletterer
      // bricht am Ueberhang ueber der eigenen Spalte ab — endlose Schleife.
      { t: 'rect', x: 746, y: 358, w: 68, h: 12, mat: MAT.EMPTY },
      // Der Berg in der Mitte.
      { t: 'rect', x: 380, y: 300, w: 200, h: 300, mat: MAT.ROCK },
      // Der Westflügel: Blechboden mit Naht, darunter die Halle mit dem
      // Riegel — und die Firn-Luke im Blech genau ueber dem Riegel.
      { t: 'rect', x: 0, y: 368, w: 380, h: 2, mat: MAT.EARTH },
      { t: 'rect', x: 0, y: 370, w: 380, h: 3, mat: MAT.STEEL },
      { t: 'rect', x: 116, y: 370, w: 4, h: 3, mat: MAT.EARTH },
      { t: 'rect', x: 188, y: 368, w: 24, h: 5, mat: MAT.EARTH },
      // Glatt aus demselben Grund wie in „Naht und Riegel": Arbeitsboden.
      { t: 'ground', x: 0, w: 380, y: 440, h: 160, mat: MAT.ROCK, rough: 0 },
      { t: 'rect', x: 180, y: 373, w: 40, h: 67, mat: MAT.ROCK },
      // Die Stahl-Tuersohle: Der Luken-Schacht endet hier — 72 unter dem
      // Blech, mitten in der Tuer.
      { t: 'rect', x: 180, y: 440, w: 40, h: 6, mat: MAT.STEEL },
    ],
  },
];
