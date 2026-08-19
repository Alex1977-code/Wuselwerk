# Grafikauftrag: drei Bilder für Welt 6 und Welt 7

Diese Datei enthält fertige Prompts zum Kopieren und die Befehle, mit denen das
Ergebnis an seinen Platz kommt. Wer sie von oben nach unten abarbeitet, braucht
nichts weiter zu wissen und nichts weiter zu fragen.

Alle Zahlen darin sind an den fünf vorhandenen Tafeln und am heutigen
Emblemblatt **gemessen**, nicht geschätzt.

---

## 1. Was fehlt — und warum

`src/render/weltkarte.ts:611` holt für jeden Weltabschnitt der Karte eine
Kopfplatte über `uiBild("welt-" + (nr + 1))`; es gibt `welt-1.webp` bis
`welt-5.webp`, also fehlt dem **Sonnenhang** (Welt 6, elf Level gebaut) seine
Tafel, und der **Wipfelweide** (Welt 7) wird sie fehlen.

Das Emblemblatt `src/art/ui/weltembleme.webp` ist 640 × 128 groß, also genau
fünf Zellen zu 128 × 128, wird aber mit dem Weltindex angesprochen
(`weltkarte.ts:934` in der Kopfzeile und `weltkarte.ts:909` am Weltentor) — der
Sonnenhang hat Index 5 und liest damit ab Bildpunkt 640 ins Leere, weshalb heute
**zwei** Stellen betroffen sind: seine Namenszeile steht ohne Emblem eingerückt,
und das Tor am Ende des Schlots sagt nicht, wohin es führt.

Dazu ein dritter, stiller Ausfall: der Belohnungsknopf des Sonnenhangs hängt
innerhalb von `if (tafel)` (`weltkarte.ts:635`) — ohne `welt-6.webp` fehlt also
auch das Zeichen des Höhenbands, nicht nur das Bild.

| Datei | Maß | Zustand |
|---|---|---|
| `src/art/ui/welt-6.webp` | 384 × 216, RGB, **ohne** Alpha, 3–9 kB | fehlt |
| `src/art/ui/welt-7.webp` | 384 × 216, RGB, **ohne** Alpha, 3–9 kB | fehlt |
| `src/art/ui/weltembleme.webp` | 640 × 128 → **896 × 128**, RGBA, ≤ 34 kB | zu kurz |

> **Wipfelweide erst später sichtbar.** `src/progression.ts:220` wirft Welten ohne
> gebautes Level aus der Karte. `welt-7.webp` und die siebte Emblemzelle liegen
> deshalb unbenutzt herum, bis die Wipfelweide ihr erstes Level hat. Das ist
> richtig so — man darf sich nur nicht wundern.

---

## 2. Was zu tun ist, wenn die Bilder da sind

Wenig. Es gibt **keinen** Verdrahtungsschritt: `src/art/ui/index.ts` findet
jede `*.webp` in dem Ordner von selbst.

```bash
cd /home/user/Wuselwerk

# --- die zwei Welttafeln -------------------------------------------------
cp DEINE-LIEFERUNG/sonnenhang.png   grafik/welt_6.png
cp DEINE-LIEFERUNG/wipfelweide.png  grafik/welt_7.png
python3 scripts/grafik-einsetzen.py tafel 6 grafik/welt_6.png
python3 scripts/grafik-einsetzen.py tafel 7 grafik/welt_7.png

# --- das Emblemblatt (baut ALLE sieben Zellen neu, siehe Abschnitt 5) ----
cp DEINE-LIEFERUNG/emblem_sonnenhang.png   grafik/weltemblem_6.png
cp DEINE-LIEFERUNG/emblem_wipfelweide.png  grafik/weltemblem_7.png
python3 scripts/grafik-einsetzen.py embleme

# --- abnehmen und einbauen ----------------------------------------------
python3 scripts/grafik-abnahme.py \
    src/art/ui/welt-6.webp src/art/ui/welt-7.webp src/art/ui/weltembleme.webp
npm run build:single
```

`einsetzen.py tafel` skaliert auf 384 × 216 und speichert als WebP mit Güte 72,
Methode 6. Weicht die Lieferung um mehr als ein Prozent von 16:9 ab, wird sie
**mittig beschnitten statt verzerrt** und das Skript sagt, was es beschnitten
hat. `abnahme.py` gibt jede Bedingung mit OK oder FEHLER aus; Rückgabewert 0
heißt: sitzt.

**Ohne `npm run build:single` ändert sich gar nichts.** Der Lader benutzt
`import.meta.glob('./*.webp', { eager: true, query: '?url' })`; das löst Vite
beim *Bauen* auf und schreibt die Bilder per `assetsInlineLimit` (512 kB je
Datei, `vite.config.ts:13`) als `data:`-URI in die eine HTML-Datei.
`scripts/build-single.mjs:184` erzeugt daraus `dist/spielen.html` und
`./spielen.html`. Hineinlegen allein reicht nicht.

Beide Skripte liegen versioniert unter `scripts/` und überleben jeden frischen
Klon. Wer lieber ohne sie arbeitet, kommt für eine Tafel auch mit dem Einzeiler
aus — er erzeugt aus den vorhandenen Quell-PNGs `welt-1.webp` bis `welt-5.webp`
**bytegleich** nach (nachgeprüft: alle fünf, SHA identisch):

```bash
python3 -c "from PIL import Image; Image.open('grafik/welt_6.png').resize((384,216), Image.LANCZOS).convert('RGB').save('src/art/ui/welt-6.webp','WEBP',quality=72,method=6)"
```

> **Diese Falle ist entschärft.** `scripts/grafik-aufbereiten.py` zählte an
> zwei Stellen ein fest verdrahtetes `range(1, 6)` und hätte
> `weltembleme.webp` beim nächsten Lauf wieder auf fünf Zellen zurück-
> geschrieben — die Arbeit wäre stillschweigend zunichte gewesen. Beide
> Schleifen zählen jetzt, was tatsächlich in `grafik/` liegt, und die
> Blattbreite folgt der Zellzahl. Wer `weltemblem_6.png` dazulegt, bekommt
> beim nächsten Lauf sechs Zellen, ohne eine Zeile Code anzufassen.

---

## 3. Prompt 1 — `welt-6.webp`, Sonnenhang

**Motiv:** vier gestufte Grasterrassen im Nachmittagslicht, die von links nach
rechts hinabtreppen; jede Kante ein senkrechter Schnitt mit Trockenmauer in der
Schnittfläche, von jeder Kante ein langer weicher Schattenkeil nach Osten. Der
Themensatz der Welt — *„Was von weitem wie eine Wiese aussieht, hat vier
Stockwerke"* — ist selbst schon das Bild.

Der vorangestellte Stilblock ist **wörtlich** der aus `docs/grafikbedarf.md`
§3.7, mit dem die fünf vorhandenen Tafeln erzeugt wurden. (Die Blöcke B und U
aus `grafik-prompts.md` §1.2 und `grafik-katalog.md` §5.2 verlangen *painterly
pixel art* mit Dithering — nachgemessen trägt `welt-1` 22 618 Farben ohne jedes
Pixelraster. Wer B oder U voranstellt, bekommt garantiert einen Stilbruch.)

Die englische Fassung ist die sicherere: Der Stilblock ist im Original
englisch, und die gängigen Generatoren treffen ihn damit zuverlässiger.

### Deutsch

```
STILBLOCK — moderne handgemalte 2.5D-Spielgrafik, weiche matte Oberflaechen,
runde Volumen, sanfte Formschattierung, keine sichtbaren Pinselstriche, keine
Umrisslinien, kein Cel-Shading, kein Pixelart, keine Fototextur. Licht: helles
neutrales Umgebungslicht, ein warmes Fuehrungslicht von vorne oben links
(#FFF4E2), ein kuehles Kantenlicht von hinten rechts (#DFE8FF); matte
Rauheit, keine Glanzlichter, keine harten Schlagschatten. Luftperspektive:
Fernes wird heller und blasser, nie dunkler. Sauber, freundlich, aufgeraeumt.

SZENE — ein bewirtschafteter Hang aus vier gestapelten Grasterrassen im
spaeten Nachmittagslicht, der vom linken zum rechten Bildrand hinabtreppt wie
eine breite Wiesentreppe. Die vier Grasflaechen liegen bei etwa 42, 54, 66 und
78 Prozent der Bildhoehe, jede beginnt weiter rechts als die darueber, sodass
alle vier Grasflaechen UND alle vier Schnittkanten gleichzeitig zu sehen sind.
Jede Terrassenkante ist ein harter senkrechter Schnitt, niemals ein runder
Huegel. In jeder Schnittflaeche: oben eine duenne Narbe aus trockenem Goldgras
(#c8b23f), darunter warme Terrakottaerde (#8a5330 bis #4e2a17), und in die
Wand eingebaut eine Trockenmauer aus hellen warmen Feldsteinen (#b09a78). Von
jeder Kante faellt ein langer Schattenkeil nach RECHTS auf die naechsttiefere
Terrasse — die Sonne steht tief und ausserhalb des Bildes LINKS. Diese
Schattenkeile sind weiche Verlaeufe im Gelaende mit unscharfem Rand, niemals
harte geworfene Kanten. Himmel als Verlauf von staubigem Altrosa (#8a5f7a)
oben ueber warmes Pfirsich (#e8a86a) zu blassem Dunstcreme (#f4dcc0) am
Horizont. Hinter den Terrassen zwei oder drei geschichtete Kammlinien in
Lavendel- und Golddunst (#e6c9a8, #c9a37e, #8a8a44), jede blasser als die
davor. Wenige Zeichen von Bewirtschaftung, nur auf den oberen Terrassen: ein
paar Zaunpfaehle, ein bis zwei runde Heuballen, ein einzelner ferner Baum —
klein, ruhig, als Silhouette. Das untere Viertel des Bildes ist der
Querschnitt der untersten Terrasse ueber die volle Breite, vom unteren
Bildrand angeschnitten: Goldgrasnarbe ueber warmer Terrakottaerde mit runden
eingebetteten Steinen. Dieses Band ist deutlich der dunkelste Teil des Bildes.

FORMAT — eine kleine illustrierte Titeltafel fuer eine Welt eines mobilen
Puzzlespiels: eine breite Landschaftsvignette von der Seite gesehen, in
flacher, fast orthografischer Seitenscroller-Perspektive, die den Charakter
dieser Welt auf einen Blick zeigt. Keine Figuren, keine Wesen, kein Text.
Aufbau: drei Tiefenbaender — eine ferne Horizontlinie, ein mittleres
Gelaendeband und eine nahe Schnittkante des Bodens entlang der unteren 25
Prozent, die das Material im Querschnitt zeigt. Die vier Ecken gehen sanft in
die umgebende Farbe ueber, damit die Tafel ohne harten Rahmen auf einer
farbigen Flaeche liegen kann.
Seitenverhaeltnis 16:9, 384 x 216 Bildpunkte, deckender Hintergrund.
SCHUTZZONEN — die fertige Tafel wird mit abgerundeten Ecken beschnitten und
unten links von einem Abzeichen ueberdeckt. In JEDER Ecke bleiben die
aeussersten 5 Prozent der Breite und 9 Prozent der Hoehe frei von allem
Wichtigen; unten links bleiben 13 Prozent der Breite und 24 Prozent der Hoehe
ruhige, detailfreie Erde. Das Bild laeuft randlos bis an alle vier Kanten.

NEGATIV — kein Text, keine Buchstaben, keine Zahlen, kein Wasserzeichen, keine
Signatur, kein Logo, keine Markenzeichen, keine Bedienelemente, keine Knoepfe,
keine Rahmen, keine Raender, keine Vignette, keine abgerundeten Bildecken,
keine Karte und keine Flaeche hinter dem Bild, kein Filmkorn, kein Rauschen,
keine Koernung, kein Fotorealismus, kein glaenzendes Plastik, kein Neon, keine
Objektivunschaerfe, keine Tiefenunschaerfe, keine Figuren, keine Wesen, keine
Menschen, keine Tiere, keine Gebaeude mit Fenstern, keine Fahrzeuge, keine
Werkzeuge, keine Isometrie, keine Dreiviertelansicht, keine Fluchtpunkte,
keine Sonnenscheibe im Bild, keine Strahlenkraenze, keine einzeln gemalten
Grashalme oder Kiesel.
```

### Englisch (empfohlen)

```
STYLE BLOCK — modern hand-painted 2.5D game art, soft matte surfaces, rounded
volumes, gentle form shading, no visible brush strokes, no outlines, no cel
shading, no pixel art, no photographic texture. Lighting: bright neutral ambient
fill, one warm key light from the upper left front (#FFF4E2), one cool rim light
from behind right (#DFE8FF); matte roughness, no specular highlights, no hard
cast shadows. Aerial perspective: distant things get lighter and paler, never
darker. Clean, friendly, uncluttered.

SCENE — a cultivated hillside of four stacked grass terraces in late afternoon
light, stepping DOWN from the left edge to the right edge like a wide staircase
of meadows. The four grass tops sit at roughly 42%, 54%, 66% and 78% of the
image height, each starting further right than the one above it, so that all
four grass surfaces AND all four cut faces are visible at once. Every terrace
edge is a hard vertical cut, never a rounded hill. Each cut face shows a thin
crust of dry golden grass on top (#c8b23f), warm terracotta earth below it
(#8a5330 down to #4e2a17), and a dry-stone retaining wall of pale warm
fieldstones (#b09a78) built into the face. From each edge a long shadow wedge
falls to the RIGHT across the terrace below — the sun is low and off-frame to
the LEFT. These wedges are soft gradients painted into the ground with blurred
edges, never hard cast shadows. Sky graded from dusty old rose (#8a5f7a) at the
top through warm peach (#e8a86a) to pale hazy cream (#f4dcc0) at the horizon.
Behind the terraces, two or three layered ridge lines in lavender and gold haze
(#e6c9a8, #c9a37e, #8a8a44), each paler than the one in front. Sparse signs of
farming on the upper terraces only: a few fence posts, one or two round hay
bales, one single distant tree — small, calm, silhouetted. The bottom quarter of
the image is the cut cross-section of the lowest terrace, running the full width
and cropped by the bottom edge: golden grass crust over warm terracotta soil
with rounded embedded stones. This band is clearly the darkest part of the
picture.

FORMAT — a small illustrated title plate for one world of a mobile puzzle game:
a wide landscape vignette seen from the side in a flat, almost orthographic
side-scroller perspective, showing the character of this world in one glance.
No characters, no creatures, no text.
Composition: three depth bands — a distant skyline, a middle band of terrain,
and a near cut edge of ground along the bottom 25% showing the material in
cross-section. The four corners fade gently into the surrounding colour so the
plate can sit on a coloured panel without a hard frame.
Aspect ratio 16:9, 384 x 216 pixels, opaque background.
SAFE AREAS — the finished plate is clipped with rounded corners and partly
covered by a small badge in the lower left. In EVERY corner, keep the outermost
5% of the width and 9% of the height free of anything important; in the lower
left keep 13% of the width and 24% of the height as quiet, detail-free ground.
The artwork runs edge to edge on all four sides.

NEGATIVE — no text, no letters, no numbers, no watermark, no signature, no logo,
no brand mark, no UI elements, no buttons, no frames, no borders, no vignette,
no rounded picture corners, no card or panel behind the image, no film grain, no
noise, no speckling, no photorealism, no glossy plastic, no neon, no lens blur,
no depth of field, no characters, no creatures, no people, no animals, no
buildings with windows, no vehicles, no tools, no isometric view, no
three-quarter view, no perspective convergence, no sun disc in frame, no visible
light rays, no individually painted blades of grass or pebbles.
```

**Woran du erkennst, dass es taugt** — drei Fragen, dreißig Sekunden:

1. Kann ich **vier** waagerechte Grasflächen zählen, und hat jede darunter eine
   **senkrechte** Wand? Wenn nein, ist es Grasland am Abend, und `welt-1.webp`
   hat einen Zwilling bekommen.
2. Ist das **untere Viertel** deutlich das Dunkelste im Bild, und läuft die
   Schnittkante als harte Waagerechte über die volle Breite? (In den fünf
   vorhandenen liegt sie bei 71–78 % der Höhe, das Vorderband ist 98–163
   Helligkeitsstufen dunkler als die Bildmitte.)
3. Sind die vier Ecken und die untere linke Ecke **leer** — Himmel oder ruhige
   Erde, kein Motiv? Was dort liegt, wird abgeschnitten oder überdeckt.

---

## 4. Prompt 2 — `welt-7.webp`, Wipfelweide

**Motiv:** der Blick zwischen den Stämmen auf Kronenhöhe. Die Äste steigen nach
rechts **hinauf** — das genaue Spiegelbild des Sonnenhangs, der nach rechts
hinabtreppt. Oben ist das Bild von der Laubdecke **geschlossen**, das Licht
fällt senkrecht durch die Lücken, und es gibt **keinen Horizont**. Der vorderste
Ast ist unten angeschnitten wie jeder andere Vordergrund — hört aber bei zwei
Dritteln der Bildbreite auf; dahinter kein Boden, nur Nebel, der aus dem Bild
sinkt. Dieser Abbruch ist die tragende Entscheidung der Tafel: Er sagt als Form,
dass der Boden hier der Ast ist und dass er ein Ende hat.

Zwei harte Verbote trennen sie vom Grasland: **kein vollständiger Baum**
(jeder Stamm wird oben *und* unten angeschnitten) und **kein Horizont**.

### Deutsch

```
STILBLOCK — moderne handgemalte 2.5D-Spielgrafik, weiche matte Oberflaechen,
runde Volumen, sanfte Formschattierung, keine sichtbaren Pinselstriche, keine
Umrisslinien, kein Cel-Shading, kein Pixelart, keine Fototextur. Licht: helles
neutrales Umgebungslicht, ein warmes Fuehrungslicht von vorne oben links
(#FFF4E2), ein kuehles Kantenlicht von hinten rechts (#DFE8FF); matte
Rauheit, keine Glanzlichter, keine harten Schlagschatten. Luftperspektive:
Fernes wird heller und blasser, nie dunkler. Sauber, freundlich, aufgeraeumt.

SZENE — der Blick von hoch oben aus dem Inneren eines alten Waldes, auf
Kronenhoehe. Der Boden ist nirgends zu sehen. Drei schwere waagerechte
Starkaeste treppen von links unten nach rechts oben HINAUF, bei etwa 78, 58
und 40 Prozent der Bildhoehe, jeder weiter rechts und weiter hinten als der
darunter; sie spannen zwischen massigen senkrechten Staemmen. Jeder Stamm wird
vom oberen UND vom unteren Bildrand angeschnitten — nirgends ein
vollstaendiger Baum, keine Baumkrone, keine Wurzel. Der obere Bildrand ist von
der Laubdecke GESCHLOSSEN: wenige grosse weiche Massen dunkelblaugruenen Laubs
(#1f5b46, #2b5a49) ueber dem oberen Viertel, dazwischen breite milchweisse
Luecken (#eaf4ec). Durch diese Luecken fallen zwei oder drei breite, fast
senkrechte Schaefte blassen Lichts GERADE NACH UNTEN und legen grosse weiche
Lichtflecken auf die Aeste; das Licht kommt von direkt oben, nie von der
Seite. Es gibt KEINEN Horizont und keinen fernen Boden: Tiefe entsteht allein
durch waagerechte Baender blassen blaugruenen Nebels (#a9cfc0, #7fae99,
#3f7a63), die zwischen den Staemmen treiben und nach hinten blasser werden.
Der vorderste Ast wird vom unteren Bildrand angeschnitten und ist im
Querschnitt zu sehen — aussen kuehle dunkle Rinde (#33251a), im Schnitt helles
warmes Kernholz mit konzentrischen Jahresringen (#7d6a52) — und er ENDET bei
etwa zwei Dritteln der Bildbreite; jenseits seiner Schnittflaeche ist gar kein
Boden mehr, nur Nebel, der aus dem unteren Bildrand sinkt. Moos (#3fae86) auf
den Oberseiten der Aeste, duenne Ranken haengen von jedem Astende herab. Das
Bild ist OBEN am hellsten und UNTEN am dunkelsten — umgekehrt zu einer
gewoehnlichen Landschaft.

FORMAT — eine kleine illustrierte Titeltafel fuer eine Welt eines mobilen
Puzzlespiels: eine breite Landschaftsvignette von der Seite gesehen, in
flacher, fast orthografischer Seitenscroller-Perspektive, die den Charakter
dieser Welt auf einen Blick zeigt. Keine Figuren, keine Wesen, kein Text.
Aufbau: drei Tiefenbaender — ein ferner Abschluss (hier die geschlossene
Laubdecke, KEINE Horizontlinie), ein mittleres Band aus Aesten und
Nebelbaendern und eine nahe Schnittkante entlang der unteren 25 Prozent, die
das Material im Querschnitt zeigt. Die vier Ecken gehen sanft in die umgebende
Farbe ueber, damit die Tafel ohne harten Rahmen auf einer farbigen Flaeche
liegen kann.
Seitenverhaeltnis 16:9, 384 x 216 Bildpunkte, deckender Hintergrund.
SCHUTZZONEN — die fertige Tafel wird mit abgerundeten Ecken beschnitten und
unten links von einem Abzeichen ueberdeckt. In JEDER Ecke bleiben die
aeussersten 5 Prozent der Breite und 9 Prozent der Hoehe frei von allem
Wichtigen; unten links bleiben 13 Prozent der Breite und 24 Prozent der Hoehe
ruhige Rinde ohne Detail — deshalb endet der vorderste Ast rechts der Mitte
und nicht in der Mitte. Das Bild laeuft randlos bis an alle vier Kanten.

NEGATIV — kein Text, keine Buchstaben, keine Zahlen, kein Wasserzeichen, keine
Signatur, kein Logo, keine Markenzeichen, keine Bedienelemente, keine Rahmen,
keine Raender, keine Vignette, keine abgerundeten Bildecken, keine Karte und
keine Flaeche hinter dem Bild, kein Filmkorn, kein Rauschen, kein
Fotorealismus, keine Objektivunschaerfe, keine Tiefenunschaerfe, keine Figuren,
keine Wesen, keine Menschen, keine Tiere, keine Vogelhaeuser, keine Huetten,
keine Bruecken, keine Seile, keine Werkzeuge, keine Isometrie, keine
Dreiviertelansicht, keine Fluchtpunkte, KEIN HORIZONT, KEIN vollstaendiger
Baum, keine Baumkrone von aussen, keine Wurzeln, kein Blaetterteppich, keine
einzeln gemalten Blaetter, keine Koernung, keine Glueckskaefer, keine
Leuchtpunkte, keine Sonnenscheibe, keine Strahlenkraenze mit harten Kanten.
```

### Englisch (empfohlen)

```
STYLE BLOCK — modern hand-painted 2.5D game art, soft matte surfaces, rounded
volumes, gentle form shading, no visible brush strokes, no outlines, no cel
shading, no pixel art, no photographic texture. Lighting: bright neutral ambient
fill, one warm key light from the upper left front (#FFF4E2), one cool rim light
from behind right (#DFE8FF); matte roughness, no specular highlights, no hard
cast shadows. Aerial perspective: distant things get lighter and paler, never
darker. Clean, friendly, uncluttered.

SCENE — the view from high inside an ancient forest, at canopy height. The
ground is nowhere in sight. Three heavy horizontal boughs stagger UPWARD from
the lower left to the upper right, at roughly 78%, 58% and 40% of the image
height, each one further right and further away than the one below, running
between massive vertical trunks. Every trunk is cropped by BOTH the top and the
bottom edge of the frame — no complete tree anywhere, no treetop, no roots. The
top of the frame is CLOSED by the canopy: a few large soft masses of dark
blue-green foliage (#1f5b46, #2b5a49) across the upper quarter, with wide
milk-white gaps between them (#eaf4ec). Two or three broad, almost vertical
shafts of pale light fall straight DOWN through those gaps and lay large soft
light patches on the boughs; the light comes from directly above, never from the
side. There is NO horizon and no distant ground: depth is given only by
horizontal bands of pale blue-green mist (#a9cfc0, #7fae99, #3f7a63) drifting
between the trunks, growing paler further back. The nearest bough is cropped by
the bottom edge and shown in cross-section — cool dark bark outside (#33251a),
pale warm heartwood with concentric growth rings in the cut (#7d6a52) — and it
ENDS at about two thirds across the width; beyond its cut end there is no ground
at all, only mist sinking out of the bottom of the picture. Moss (#3fae86) on
the upper sides of the boughs, thin vines hanging from each bough end. The image
is brightest at the TOP and darkest at the BOTTOM — the opposite of an ordinary
landscape.

FORMAT — a small illustrated title plate for one world of a mobile puzzle game:
a wide landscape vignette seen from the side in a flat, almost orthographic
side-scroller perspective, showing the character of this world in one glance.
No characters, no creatures, no text.
Composition: three depth bands — a distant closure (here the closed canopy, NOT
a skyline), a middle band of boughs and mist, and a near cut edge along the
bottom 25% showing the material in cross-section. The four corners fade gently
into the surrounding colour so the plate can sit on a coloured panel without a
hard frame.
Aspect ratio 16:9, 384 x 216 pixels, opaque background.
SAFE AREAS — the finished plate is clipped with rounded corners and partly
covered by a small badge in the lower left. In EVERY corner, keep the outermost
5% of the width and 9% of the height free of anything important; in the lower
left keep 13% of the width and 24% of the height as quiet bark with no detail —
this is why the nearest bough ends right of centre, not at centre. The artwork
runs edge to edge on all four sides.

NEGATIVE — no text, no letters, no numbers, no watermark, no signature, no logo,
no brand mark, no UI elements, no frames, no borders, no vignette, no rounded
picture corners, no card or panel behind the image, no film grain, no noise, no
photorealism, no lens blur, no depth of field, no characters, no creatures, no
people, no animals, no birdhouses, no huts, no bridges, no ropes, no tools, no
isometric view, no three-quarter view, no perspective convergence, NO HORIZON,
NO complete tree, no treetop seen from outside, no roots, no leaf carpet, no
individually painted leaves, no speckling, no fireflies, no glowing dots, no sun
disc, no hard-edged light rays.
```

**Woran du erkennst, dass es taugt:**

1. Sehe ich irgendwo einen **vollständigen Baum** oder eine **Horizontlinie**?
   Wenn ja, ist es Grasland im Nebel — nicht die Wipfelweide.
2. Ist das Bild **oben hell und unten dunkel**, und ist der obere Rand von Laub
   **zu** statt offener Himmel? Alle fünf vorhandenen Tafeln haben oben Luft;
   genau das darf diese eine nicht haben.
3. Nebeneinander mit dem Sonnenhang gehalten: Läuft die eine Treppe **hinab**
   und die andere **hinauf**? Laufen beide gleich, ist eine falsch herum
   erzeugt worden — dann Prompt nochmal mit vertauschtem „lower left / upper
   right" laufen lassen.

---

## 5. Prompt 3 — die zwei neuen Emblemzellen

**Das Blatt wird nicht neu erzeugt.** Erzeugt werden nur **zwei einzelne
Münzen**; das siebenzellige Blatt entsteht daraus rechnerisch.

Warum so und nicht anders — beides ist gemessen:

* Die fünf vorhandenen Zellen sind mit keinem Prompt wiederholbar. Ein neu
  erzeugtes Blatt zu sieben Zellen tauscht sie alle aus.
* „Zwei Zellen an das fertige Blatt anstückeln" klingt sicherer, ist es aber
  nicht: Das vorhandene `weltembleme.webp` ist verlustbehaftet; wer es öffnet
  und breiter wieder speichert, legt eine **zweite** Verlustrunde auf die alten
  Zellen.
* Der empfohlene Weg baut alle sieben Zellen aus den Quell-PNGs
  `grafik/weltemblem_1.png` … `_7.png` neu — die alten fünf also aus genau
  denselben Pixeln wie heute. Nachgemessen weichen sie danach um Median 1/255
  ab, 99. Perzentil 9, Höchstwert 25; 1,3 % der Bildpunkte über 8. Bei einer
  Anzeigegröße von 17 bis 46 Bildpunkten sieht das niemand. (Buchstäblich
  bytegleich ginge nur verlustfrei — 93,5 kB statt 26 kB, für eine Datei, die
  in die eine HTML wandert, keine Option.)

Der Befehl dazu steht schon in Abschnitt 2:

```bash
cp DEINE-LIEFERUNG/emblem_sonnenhang.png   grafik/weltemblem_6.png
cp DEINE-LIEFERUNG/emblem_wipfelweide.png  grafik/weltemblem_7.png
python3 scripts/grafik-einsetzen.py embleme
```

Das Skript stellt jede Lieferung frei, beschneidet sie mit 6 px Rand, legt sie
mittig auf ein 128er Quadrat und schreibt `896 × 128` RGBA bei Güte 82 — rund
26 kB gegen heute 21 kB. **Beide Lieferformen funktionieren, nachgeprüft:**
echtes RGBA-PNG mit Transparenz *oder* RGB-PNG mit hell gemaltem Hintergrund
(so kam die Lieferung von damals). Verlange im Zweifel echte Transparenz.

Die Münze ist ein **Gegenstand mit Luft ringsum, keine Landschaft**: Eine
Terrassenlandschaft in der Scheibe scheitert zuverlässig, weil der runde Rahmen
genau die Luft wegschneidet, an der man die Stufenkontur erkennt. Und alles muss
bei **17 Bildpunkten** noch tragen — so klein hängt das Emblem am Weltentor
(`weltkarte.ts:909`), nicht nur mit 46 in der Kopfzeile.

### 5a. Emblem Sonnenhang — dreistufige Treppe

Helle warme Münze, dunkles Zeichen: Rostwerk und Schlot sind dunkle Scheiben mit
hellem Zeichen, der Sonnenhang wird die einzige helle. Der Rand ist bewusst
**nicht** golden, sonst zwillingt er mit dem Goldrand des Schlots. Drei Stufen —
vier tragen bei 17 px nicht mehr.

```
Eine einzelne runde Spielmuenze, mittig, auf vollstaendig transparentem
Hintergrund, quadratisch, 1024 x 1024 Bildpunkte, kein Text.

Eine dicke kreisrunde Muenze, die 88 Prozent des Bildes fuellt, frontal
gesehen. Aussen ein erhabener abgeschraegter Ring aus hellem warmem Feldstein
(#b09a78) mit einem weichen hellen Glanzbogen oben links und einem kuerzeren
unten rechts, darunter eine dunkle Innenfuge. Innen eine flache Scheibe in
hellem warmem Goldocker (#d9a441).

Mittig auf der Scheibe EIN einzelner Gegenstand mit deutlich Luft ringsum:
eine freistehende dreistufige Treppe von der Seite gesehen, die von links oben
nach rechts unten absteigt, mit flachem Sockel. Der Treppenkoerper ist dunkles
warmes Terrakottabraun (#7a4526); die Trittflaeche jeder der drei Stufen traegt
oben einen hellen goldgruenen Grasstreifen (#c8b23f). Die Silhouette der drei
Stufen ist scharf und ununterbrochen gegen die goldene Scheibe und beruehrt den
Ring nicht.

Flache, vektorartige Spielsymbolgrafik, zwei bis drei flache Toene je Form,
weiche Innenfase, weicher kurzer Schlagschatten des Gegenstands auf der
Scheibe. Das Zeichen muss bei 17 Bildpunkten noch erkennbar sein.

NEGATIV — kein Text, keine Zahlen, keine Landschaft in der Muenze, keine
Szene, kein Horizont in der Muenze, keine zweiten Gegenstaende, keine Figuren,
keine duennen Linien, kein feines Detail, keine gravierte Textur, keine
Facetten, kein Metallglanz, kein Chrom, kein Gold als Material, kein Neon, kein
Leuchten, keine Funken, keine Baender, keine Wappen, kein quadratischer Rahmen,
kein Schatten ausserhalb der Muenze, kein deckender Hintergrund.
```

```
A single round game icon medallion, centred, on a fully transparent background,
square, 1024 by 1024 pixels, no text.

A thick circular coin filling 88% of the frame, seen straight on. Outer raised
bevelled rim in pale warm fieldstone (#b09a78) with a soft light highlight arc
along the upper left and a shorter one at the lower right, then a dark inner
shadow groove. Inside, a flat disc in bright warm golden ochre (#d9a441).

Centred on the disc, ONE single object with clear empty space around it on all
sides: a free-standing THREE-STEP staircase seen from the side, descending from
upper left to lower right, with a flat base. The staircase body is dark warm
terracotta brown (#7a4526); the tread of each of the three steps carries a
bright golden-green grass strip on top (#c8b23f). The silhouette of the three
steps is crisp and unbroken against the golden disc and does not touch the rim.

Flat vector-like game icon art, two or three flat tones per shape, soft inner
bevel, a short soft contact shadow of the object on the disc. Must remain
recognisable when scaled down to 17 pixels.

NEGATIVE — no text, no numbers, no landscape filling the circle, no scene, no
horizon inside the coin, no second object, no characters, no thin lines, no fine
detail, no engraved texture, no gem facets, no metallic sheen, no chrome, no
gold as a material, no neon, no glow, no sparkles, no ribbons, no heraldry, no
square frame, no drop shadow outside the coin, no opaque background.
```

### 5b. Emblem Wipfelweide — Laubdecke mit Lichtschacht

Dunkle Münze, ein einzelner heller senkrechter Balken: bei 17 px die
eindeutigste Kombination, die es gibt. **Bewusst nicht** die gespiegelte Treppe
— spiegelbildliche Formen sind das am schwersten zu trennende Paar bei dieser
Größe. Und **kein Blatt und kein Baum**, weil beides bei 17 px mit Graslands
runder Krone zwillingt; auch **kein Blattkranz**, obwohl er die Belohnung der
Welt ist — der steht schon auf `belohnungen.webp` direkt darunter.

```
Eine einzelne runde Spielmuenze, mittig, auf vollstaendig transparentem
Hintergrund, quadratisch, 1024 x 1024 Bildpunkte, kein Text.

Eine dicke kreisrunde Muenze, die 88 Prozent des Bildes fuellt, frontal
gesehen. Aussen ein erhabener abgeschraegter Ring in gedaempftem Nebelgruen
(#9cbfae) mit einem weichen hellen Glanzbogen oben links und einem kuerzeren
unten rechts, darunter eine dunkle Innenfuge. Innen eine flache Scheibe in
tiefem dunklem Blaugruen (#2b5a49).

Mittig auf der Scheibe EIN einzelnes Zeichen mit deutlich Luft ringsum: ein
dunkler waagerechter Laubdeckenbalken (#1f5b46) ueber dem oberen Drittel des
Zeichens, aus dessen Mitte EINE rechteckige Kerbe ausgeschnitten ist, und durch
diese Kerbe faellt gerade nach unten ein einzelner heller, fast weisser
senkrechter Lichtschacht (#eaf4ec), der sich nach unten leicht verbreitert.
Links und rechts des Lichtschachts steht je ein kurzer dunkler senkrechter
Stammbalken, unterhalb des Laubdeckenbalkens. Der Laubdeckenbalken beruehrt den
Ring nicht — rundum bleibt ein deutlicher Ring aus Scheibenfarbe frei.

Nur drei Toene: Dunkelblaugruen fuer Laubdecke und Staemme, fast Weiss fuer den
Lichtschacht, die Scheibenfarbe dahinter. Flache, vektorartige
Spielsymbolgrafik, weiche Innenfase. Das Zeichen muss bei 17 Bildpunkten noch
erkennbar sein.

NEGATIV — kein Text, keine Zahlen, keine Blaetter, keine Zweige, kein einzelnes
Blatt, kein ganzer Baum, keine Landschaft in der Muenze, keine Szene, kein
Horizont in der Muenze, keine Figuren, keine duennen Linien, kein feines
Detail, keine Textur, keine Strahlenkraenze mit harten Kanten, keine Funken,
kein Leuchten, keine Facetten, kein Metallglanz, kein Gold, kein Kranz, keine
Baender, kein quadratischer Rahmen, kein Schatten ausserhalb der Muenze, kein
deckender Hintergrund.
```

```
A single round game icon medallion, centred, on a fully transparent background,
square, 1024 by 1024 pixels, no text.

A thick circular coin filling 88% of the frame, seen straight on. Outer raised
bevelled rim in muted misty green (#9cbfae) with a soft light highlight arc
along the upper left and a shorter one at the lower right, then a dark inner
shadow groove. Inside, a flat disc in deep dark blue-green (#2b5a49).

Centred on the disc, ONE single symbol with clear empty space around it: a dark
horizontal canopy bar (#1f5b46) across the upper third of the symbol, with ONE
rectangular notch cut out of its middle, and falling straight down through that
notch a single bright, almost white vertical shaft of light (#eaf4ec) that
widens slightly towards the bottom. Two short dark vertical trunk bars flank the
shaft, one on each side, below the canopy bar. The canopy bar does not touch the
rim — leave a clear ring of disc colour all around the symbol.

Only three tones: dark blue-green for canopy and trunks, near-white for the
light shaft, the disc colour behind. Flat vector-like game icon art, soft inner
bevel. Must remain recognisable when scaled down to 17 pixels.

NEGATIVE — no text, no numbers, no leaves, no branches, no single leaf, no whole
tree, no landscape filling the circle, no scene, no horizon inside the coin, no
characters, no thin lines, no fine detail, no texture, no hard-edged light rays,
no sparkles, no glow, no gem facets, no metallic sheen, no gold, no wreath, no
ribbons, no square frame, no drop shadow outside the coin, no opaque background.
```

**Woran du erkennst, dass es taugt.** Nach `einsetzen.py embleme` diese
Sehprobe laufen lassen — sie legt alle sieben Zellen in den drei Größen
nebeneinander, in denen das Spiel sie wirklich zeigt:

```bash
python3 - <<'PY'
from PIL import Image
b = Image.open('src/art/ui/weltembleme.webp').convert('RGBA')
n = b.width // b.height
probe = Image.new('RGB', (n * 70, 3 * 70), (46, 52, 64))
y = 6
for s in (46, 33, 17):
    for i in range(n):
        z = b.crop((i * 128, 0, i * 128 + 128, 128)).resize((s, s), Image.LANCZOS)
        probe.paste(z, (i * 70 + (70 - s) // 2, y + (46 - s) // 2), z)
    y += 70
probe.resize((n * 140, 420), Image.NEAREST).save('probe-embleme.png')
print(f'{n} Zellen — probe-embleme.png geschrieben')
PY
```

1. Stehen **sieben** Spalten da, und sind die ersten fünf unverändert?
2. Ist in der **untersten** Zeile (17 px) in der **sechsten** Spalte noch eine
   absteigende Treppe und in der **siebten** noch ein heller senkrechter Balken
   zu erkennen?
3. Hat jede der zwei neuen Münzen noch ihren **Ring**? Fehlt er, hat der
   Freisteller ihn gefressen — siehe Abschnitt 6, Fall E2.

---

## 6. Wenn der Generator es nicht trifft

Drei Abweichungen machen zusammen fast alle Fehlversuche aus. Jeweils: was
passiert, was man an den Prompt hängt, und wie man es hinterher gerade rückt.

### 6.1 Falsche Maße, falsches Seitenverhältnis

**Das kommt fast immer.** Kaum ein Generator liefert 384 × 216; die meisten
geben 1024 × 1024 oder 1536 × 640 aus. **Das ist kein Fehler und kein Grund für
einen neuen Versuch** — `einsetzen.py tafel` skaliert auf 384 × 216 und
beschneidet bei mehr als einem Prozent Abweichung mittig auf 16:9, statt zu
verzerren.

Aufpassen muss man nur bei **quadratischen** Lieferungen: Aus 1024 × 1024 bleibt
der mittlere Streifen von 1024 × 576 übrig, oben und unten fallen je 224
Bildpunkte weg — also 22 % der Höhe. Wer das Motiv über die volle Quadrathöhe
komponieren lässt, verliert Himmel und Schnittkante. Nachsatz:

```
Output a WIDE 16:9 landscape image, not square. If the output must be square,
compose the entire scene inside the central horizontal 16:9 band and leave the
top and bottom sixth as plain continuation of sky and ground.
```

Verzerren ist nie nötig; falls doch einmal von Hand beschnitten werden soll:

```bash
python3 -c "from PIL import Image; im=Image.open('grafik/welt_6.png'); w,h=im.size; nb=min(w,int(h*16/9)); nh=int(nb*9/16); im.crop(((w-nb)//2,(h-nh)//2,(w+nb)//2,(h+nh)//2)).save('grafik/welt_6.png')"
```

### 6.2 Gemalter Rahmen, Vignette, Karte hinter dem Bild

Der zweithäufigste Fehler und der ärgerlichste, weil er **doppelt** wirkt:
Rahmen, runde Ecken und der helle Strich kommen vom Zeichner
(`weltkarte.ts:622–633`); wer sie mitmalen lässt, bekommt sie zweimal.
Gemessen: bei den fünf vorhandenen Tafeln unterscheidet sich der 2-px-Randstreifen
vom Streifen dahinter um nur 2,4 bis 11,9 Helligkeitsstufen — das Motiv läuft
ungebrochen bis an die Kante. Nachsatz:

```
The image IS the artwork, edge to edge, bleeding off all four sides. No frame,
no border, no outline around the image, no rounded corners, no vignette, no
darkened edges, no drop shadow, no card, no panel, no paper, no mockup, no
device, no presentation background.
```

Zum Geraderücken: schmalen Rand wegschneiden und wieder aufziehen — hier 3 % je
Seite; `abnahme.py` sagt danach, ob der Randsprung unter 20 liegt.

```bash
python3 -c "from PIL import Image; im=Image.open('grafik/welt_6.png'); w,h=im.size; r=0.03; im.crop((int(w*r),int(h*r),int(w*(1-r)),int(h*(1-r)))).save('grafik/welt_6.png')"
```

### 6.3 Zu viel Detail, Körnung, Pixelraster

Erkennbar an zwei Dingen: Die Datei wird zu groß (die vorhandenen fünf wiegen
5,2 bis 7,8 kB; `einsetzen.py` warnt ab 9 kB), und bei 300 Bildpunkten
Anzeigebreite wird alles zu Matsch — die Tafel wird auf dem Telefon sogar
**hoch**skaliert. Gemessen: dieselbe Komposition kostet in wenigen großen
Flächen 0,5 kB, mit Körnung übersät 8,2 kB, als Teppich aus einzeln gemalten
Blättern 22,5 kB. Häufige Ursache ist das Wort „game asset", das viele Modelle
in die Retro-Ecke zieht. Nachsatz:

```
Painted illustration, not pixel art: no pixel grid, no dithering, no hard black
outline. Few large shapes, broad clean areas of flat colour, soft gradients,
smooth surfaces. No grain, no noise, no speckling, no fine texture, no
individually painted leaves, blades of grass or pebbles. Nothing smaller than
about one percent of the image width.
```

Geht die Datei danach immer noch über 9 kB, hilft eine Stufe Güte weniger. Der
Reihe schadet das nicht — nachgemessen liegt `welt_1` bei Güte 66 noch im
Rahmen:

```bash
python3 -c "from PIL import Image; Image.open('grafik/welt_6.png').resize((384,216), Image.LANCZOS).convert('RGB').save('src/art/ui/welt-6.webp','WEBP',quality=66,method=6)"
```

### 6.4 Zwei Sonderfälle, die nur die Embleme betreffen

| Fall | Woran erkennbar | Was hilft |
|---|---|---|
| **E1 — kein Kreis, sondern ein freigestelltes Symbol** | `abnahme.py` meldet „innerhalb Radius 58 deckend" als FEHLER | Nachsatz: `A solid filled circular coin, not a cut-out symbol. The disc is completely opaque from edge to edge; transparency exists only OUTSIDE the circle.` |
| **E2 — der Ring fehlt nach dem Einsetzen** | in `probe-embleme.png` hat die Münze keinen Rand mehr | Der Freisteller flutet über helle, ungesättigte Bildpunkte (`min(r,g,b) > 185` und `max−min < 26`) von außen herein. Gemessen: ein Ring in `#c9e2d6` verschwindet **vollständig**, `#9cbfae` und `#b09a78` bleiben stehen. Nachsatz: `The rim is a clearly coloured, saturated tone — never near-white, never neutral grey.` |

### 6.5 Was in keinem Fall in den Prompt darf

Kein Markenname, kein Firmenname, keine Plattform, kein Jahrgang. Auch keine
Umschreibung, die auf ein bestimmtes altes Vorbild zeigt — weder über eine
Jahreszahl noch über den Gattungsnamen seiner Figuren noch über die Maschine,
auf der es lief. Die Anspielung allein reicht schon; sie muss nicht
ausgeschrieben sein. Kein fremder Screenshot als Referenzbild, weder als
img2img noch als Stilvorlage noch als IP-Adapter.

Und: **niemals grünes Haar mit blauer Kutte.** Der Kanon im Code ist umgekehrt —
blaues Haar (`#3e57c5`, gemessen im Sprite `src/art/wuselwerker.webp`) und
grüner Kittel (`#3b4226`); die Umkehrung ist die geschützte Gestaltung. Für
diese drei Dateien ist das eine reine Negativregel: Auf keiner der fünf
vorhandenen Tafeln und auf keinem der fünf Embleme kommt eine Figur vor, und auf
den neuen soll auch keine vorkommen.

*(Die Prompt-Bibliothek und `grafik-katalog.md` nennen die Figur teils kahl und
türkis, teils mit violetter oder roter Mähne. Beides ist überholt; maßgeblich
ist das ausgelieferte Sprite.)*

---

## Anhang — die Zahlen auf einen Blick

| Größe | Wert | Quelle |
|---|---|---|
| Tafelmaß | 384 × 216, RGB ohne Alpha | `welt-1..5.webp`, gemessen |
| Tafelgüte | WebP q=72, method=6 | erzeugt `welt-1..5` bytegleich nach |
| Tafelgewicht | 5,2 / 7,6 / 6,9 / 7,8 / 6,7 kB | Schwelle in `abnahme.py`: 3–9 kB |
| Anzeigebreite der Tafel | ≤ 300 CSS-px | `weltkarte.ts:613` |
| Eckbeschnitt | 12,8 px (Schreibtisch) bis 16,5 px (360er Telefon) | `kreisRunde(…, 10)` + `clip` |
| Abzeichen unten links | bis 50 × 51 Quellpixel | `bs = min(44, tw·0,19)` |
| Bodenkante | y = 154…169 von 216 (71–78 %) | größter Zeilenabfall in welt-1..5 |
| Vorderband gegen Bildmitte | 98–163 Helligkeitsstufen dunkler | gemessen über alle fünf |
| Emblemblatt | 896 × 128 RGBA, q=82, ≈ 26 kB | Schwelle in `abnahme.py`: ≤ 34 kB |
| Emblem-Anzeigegröße | 46 px Kopfzeile, 17–33 px Weltentor | `weltkarte.ts:931` / `:906` |
| Zuwachs in `spielen.html` | ≈ +23 kB auf 835 kB (+2,7 %) | base64, +33 % |

Die beiden Werkzeuge liegen versioniert unter `scripts/grafik-einsetzen.py`
und `scripts/grafik-abnahme.py`, die Schablonen unter `grafik/schablonen/`:
`tafel-schablone.png` zeigt die Sperrzonen einer Welttafel (18 px je Ecke,
2 px Außenrand, das Feld unten links, das der Belohnungsknopf verdeckt),
`emblem-schablone.png` die Scheibenmaße, `tafel-beschnittprobe.png` eine
echte Tafel mit eingezeichnetem Beschnitt.

Die vollständigen Messprotokolle der drei Gutachter (Technik, Stil, Motiv)
sind Wegwerfmaterial und liegen unter `art-src/proben/prompts/`; dieser
Ordner ist bewusst nicht eingecheckt. Was von ihnen Bestand hat, steht in
dieser Datei.
