"""Die uebrigen Posen spreizen — dieselbe Bewegung, groesserer Ausschlag.

Sechs Posen sind in der Entwurfsrunde neu geschrieben worden (Wuselgang,
Panikfall, Klimmzug, Ausholen, Pfannkuchen, Hocke). Die anderen sieben
brauchen kein neues Konzept, sondern nur mehr Ausschlag: Jede Groesse wird um
ihren MITTELWERT ueber alle Bilder gespreizt, Richtungen um die Mittelrichtung
herausgedreht. Die Durchschnittshaltung bleibt damit, wo sie war — es waechst
nur die Auslenkung.

Gelesen wird aus art-src/figur-umbau/posen/ (die Urfassung), geschrieben nach
art-src/wuselwerker/posen/. Damit ist der Lauf wiederholbar: Zweimal aufrufen
spreizt nicht zweimal.

Aufruf:  python3 spreizen.py <pose>=<faktor> [...]
Beispiel: python3 spreizen.py building=1.8 mining=1.6
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from verstaerker import lade, verstaerke

HIER = os.path.dirname(os.path.abspath(__file__))
QUELLE = HIER
ZIEL = os.path.join(HIER, '..', '..', 'wuselwerker', 'posen')

for arg in sys.argv[1:]:
    name, faktor = arg.split('=')
    p = lade(os.path.join(QUELLE, f'{name}.json'))
    p = verstaerke(p, float(faktor))
    p['_gespreizt'] = (
        f'Um {faktor} gespreizt (art-src/figur-umbau/posen/spreizen.py). Die Urfassung liegt '
        'daneben in art-src/figur-umbau/posen/; wer den Faktor aendert, laeuft von dort neu.'
    )
    ziel = os.path.abspath(os.path.join(ZIEL, f'{name}.json'))
    with open(ziel, 'w') as fh:
        json.dump(p, fh, indent=2, ensure_ascii=False)
        fh.write('\n')
    print(f'{name}: Faktor {faktor} -> {ziel}')
