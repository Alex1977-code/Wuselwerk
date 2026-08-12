# Bestenliste — was heute geht und was einen Server braucht

Die Merkliste wünscht: **weltweite Bestenliste** nach gewonnenen Leveln mit
Platzanzeige, angemeldeter Spieler mit Spielername und Avatar, im Testmodus
abschaltbar.

## Was heute eingebaut ist

- **Spielerprofil, lokal** (`src/profil.ts`): Spielername (echtes
  Eingabefeld des Geräts, höchstens zwölf Zeichen) und Avatar — sechs
  Ringfarben aus dem Berufsfarbkreis um das Porträt der Figur. Chip unten
  links auf der Karte, Tafel mit Farbwahl und Bilanz.
- **Bilanz dieses Geräts**: gewonnene Level und Sterne, in der Profil-Tafel.
  Das ist die ehrliche Fassung einer Bestenliste ohne Netz: die eigene.

## Was einen Server braucht — und warum es keinen gibt

Eine **weltweite** Liste braucht drei Dinge, die eine einzelne HTML-Datei
grundsätzlich nicht hat:

1. **Einen gemeinsamen Ort** für die Stände aller Spieler (Datenbank hinter
   einer API). Die Spieldatei läuft offline und darf zur Laufzeit nichts
   nachladen — das ist eine bewusste Grundregel des Projekts.
2. **Identität**, die mehr ist als `localStorage`: Konten, sonst besteht die
   Liste aus Duplikaten und Geistern.
3. **Vertrauen**: Ohne Server-seitige Prüfung (Replay der deterministischen
   Simulation wäre hier sogar möglich und wäre der richtige Weg!) ist jede
   eingesandte Zahl fälschbar; eine ungeprüfte Weltrangliste ist nach einer
   Woche eine Liste aus Neunmalklugen.

Der saubere Ausbaupfad, wenn es so weit ist: ein kleiner Dienst, an den ein
Client **die Eingabefolge** eines gewonnenen Levels schickt (nicht das
Ergebnis!); der Dienst spielt sie durch dieselbe deterministische Simulation
und trägt erst dann den Stand ein. Spielername + Avatar sind dann schon da,
und `?test` schaltet — wie beim Lebenssystem — alles Netzwerkige ab.
