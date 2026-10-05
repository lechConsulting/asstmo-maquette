#!/usr/bin/env python3
"""Contrôles de mise en page de la maquette AssMO.

Je ne peux pas regarder les écrans : ces trois contrôles remplacent le coup d'œil
qui manque. Chacun vient d'un bug réellement rencontré.

  1. Structure HTML — balises non fermées ou fermées en trop.
  2. Grilles à colonnes fixes — un composant dont la mise en page dépend d'un
     nombre d'enfants précis. `.step` est une grille `30px 1fr` : l'étape
     courante n'avait qu'un enfant, qui atterrissait dans la colonne de 30 px,
     d'où un mot par ligne.
  3. Largeurs fixes dans une colonne souple — `.phone` fait 390 px et ne tient
     pas dans une colonne de `.grid-side` (~350 px) : il se faisait couper.

Lancement : python3 audit.py          (après node build.mjs)
"""
import pathlib
import re
import sys
from html.parser import HTMLParser

VIDES = {'meta', 'link', 'br', 'hr', 'img', 'input', 'source',
         'col', 'area', 'base', 'embed', 'track', 'wbr'}

# Composants dont la mise en page dépend d'un nombre d'enfants précis
ENFANTS_ATTENDUS = {'step': 2, 'mail': 3, 'gantt-row': 2, 'gantt-head': 2}

# Conteneurs qui répartissent la largeur : rien de fixe et large ne doit y entrer
GRILLES_SOUPLES = {'grid-side', 'grid-main', 'grid-2', 'grid-3'}
LARGEURS_FIXES = {'phone': 390, 'a4': 794}

defauts = []


def classes(attrs):
    return (dict(attrs).get('class') or '').split()


class Structure(HTMLParser):
    def __init__(self, nom):
        super().__init__(convert_charrefs=True)
        self.nom, self.pile = nom, []

    def handle_starttag(self, tag, attrs):
        if tag not in VIDES:
            self.pile.append((tag, self.getpos()[0]))

    def handle_endtag(self, tag):
        if tag in VIDES:
            return
        if not self.pile:
            defauts.append(f'{self.nom} : </{tag}> en trop ligne {self.getpos()[0]}')
            return
        if self.pile[-1][0] == tag:
            self.pile.pop()
            return
        for i in range(len(self.pile) - 1, -1, -1):
            if self.pile[i][0] == tag:
                oubliees = ', '.join(f'<{n}> l.{l}' for n, l in self.pile[i + 1:])
                defauts.append(f'{self.nom} : non fermé avant </{tag}> l.{self.getpos()[0]} — {oubliees}')
                del self.pile[i:]
                return
        defauts.append(f'{self.nom} : </{tag}> sans ouverture, ligne {self.getpos()[0]}')

    def fin(self):
        for nom, ligne in self.pile:
            if nom not in ('html', 'body'):
                defauts.append(f'{self.nom} : <{nom}> ligne {ligne} jamais fermé')


class MiseEnPage(HTMLParser):
    def __init__(self, nom):
        super().__init__(convert_charrefs=True)
        self.nom, self.pile = nom, []

    def handle_starttag(self, tag, attrs):
        if tag in VIDES:
            return
        cls = classes(attrs)
        style = (dict(attrs).get('style') or '').replace(' ', '')

        composant = None
        for cle in ENFANTS_ATTENDUS:
            if cle in cls:
                # une surcharge explicite des colonnes vaut intention
                if 'grid-template-columns' in style or 'display:block' in style:
                    break
                if cle == 'step' and 'is-current' in cls:
                    break
                composant = cle
                break

        grille = next((c for c in cls if c in GRILLES_SOUPLES), None)
        fixe = next((c for c in cls if c in LARGEURS_FIXES), None)

        if fixe:
            for e in self.pile:
                if e['grille']:
                    defauts.append(
                        f'{self.nom} : .{fixe} ({LARGEURS_FIXES[fixe]} px fixes) ligne {self.getpos()[0]} '
                        f'dans .{e["grille"]} ouverte ligne {e["l"]} — la colonne est plus étroite, '
                        f'le contenu sera coupé')
                    break

        if self.pile:
            self.pile[-1]['n'] += 1
        self.pile.append({'tag': tag, 'composant': composant, 'grille': grille,
                          'n': 0, 'l': self.getpos()[0]})

    def handle_endtag(self, tag):
        if tag in VIDES:
            return
        for i in range(len(self.pile) - 1, -1, -1):
            if self.pile[i]['tag'] == tag:
                e = self.pile[i]
                attendu = ENFANTS_ATTENDUS.get(e['composant'])
                if attendu is not None and e['n'] != attendu:
                    defauts.append(
                        f'{self.nom} : .{e["composant"]} ligne {e["l"]} a {e["n"]} enfant(s), '
                        f'{attendu} attendu(s) — le contenu ira dans la mauvaise colonne')
                del self.pile[i:]
                return


racine = pathlib.Path(__file__).parent
pages = sorted((racine / 'docs').glob('*.html'))
if not pages:
    sys.exit('docs/ est vide — lancez d\'abord : node build.mjs')

for page in pages:
    texte = page.read_text(encoding='utf-8')
    s = Structure(page.name)
    s.feed(texte)
    s.fin()
    m = MiseEnPage(page.name)
    m.feed(texte)

# La couleur de marque ne sort pas du châssis. Deux écrans y ont droit : les
# Fondations, qui la documentent, et la connexion, qui porte le logo en grand.
# Partout ailleurs, un écran qui la cite peint une donnée en couleur d'interface.
IDENTITE = ('00-', '02-')
marque = [(f.name, len(re.findall(r'var\(--brand\)|var\(--brand-wash\)', f.read_text(encoding='utf-8'))))
          for f in sorted((racine / 'src').glob('*.html'))]
for nom, nb in marque:
    if nb and not nom.startswith(IDENTITE):
        defauts.append(f'{nom} : {nb} usage(s) de la couleur de marque dans un écran — '
                       f'elle est réservée au châssis, utilisez la rampe de phase')

if defauts:
    print(f'✕ {len(defauts)} défaut(s) :\n')
    for d in defauts:
        print('  ', d)
    sys.exit(1)

print(f'✓ {len(pages)} pages — structure, grilles à colonnes fixes, largeurs et '
      f'usage de la couleur de marque : rien à signaler')
