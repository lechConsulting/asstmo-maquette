# AssMO — charte graphique

Tirée du logo. Les couleurs ne sont pas estimées à l'œil : elles sont **extraites du
fichier vectoriel** (`logo/assmo-logo-source.pdf`), donc ce sont exactement celles
posées par le graphiste.

| Rôle | Valeur | D'où ça vient |
|---|---|---|
| Bleu nuit | `#1b2a41` | tuile de l'icône, mot « Ass » |
| Orange | `#dd6b13` | chevron du toit, « MO » |
| Ardoise | `#3a4a63` | ligne de sol sous la coche |
| Crème | `#f6f4ef` | fond de la version claire |

**Un seul thème.** Le mode sombre a été retiré le 05/10/2026 : l'identité d'AssMO
est une identité claire, et la retourner en donnait une seconde — deux palettes à
tenir, deux séries de mesures, deux occasions de dériver. Les pages déclarent
`color-scheme: light` ; sans cette ligne, un navigateur réglé en sombre repeint
lui-même les champs et les listes, et on obtient des saisies noires dans une carte
blanche.

## La règle qui tient tout

**L'orange du logo ne peut pas porter de texte** : 3,39:1 en blanc sur orange,
3,09:1 sur le fond crème, pour un seuil de 4,5. En faire la couleur des boutons
aurait dégradé l'élément le plus cliqué de l'interface.

D'où la répartition, qui est une conséquence de la mesure et non un goût :

- **Orange assombri `#bd5a0d` = les actions.** Le plus vif qui porte encore du
  texte blanc — **4,53:1** — et pas un pas de plus. C'est le bouton principal.
- **Orange du logo `#dd6b13` = l'accent.** Liseré d'élément actif, soulignement
  d'onglet, anneau de focus. **Jamais un fond de texte.**
- **Orange foncé `#b0550f` = le texte orange.** Même teinte, même saturation,
  clarté ramenée à 38 % : **5,06:1** sur blanc, **4,60:1** sur crème. Liens, et
  le mot « MO » sur fond clair.
- **Bleu nuit = l'identité, et rien d'autre.** La tuile du logo, le bandeau des
  pages publiques. *Révisé le 05/10/2026* : il tenait la barre latérale sur toute
  la hauteur et tout l'écran de connexion. Un aplat sombre permanent cesse d'être
  un signal, il devient un décor — et il emporte avec lui tout ce qui aurait pu
  ressortir dessus.
- **Bleu = les données.** La rampe des phases, et rien d'autre.

## Conflits mesurés, et comment ils sont résolus

**L'orange de marque est à 7,3 d'écart perceptif du statut « serious »** (`#ec835a`),
pour un plancher de 15 : indiscernables. On ne retouche aucune des deux teintes —
l'une est la marque, l'autre appartient à une palette de statut qu'on ne thème pas.
On les sépare **par le rôle** : l'orange en accent de châssis, le statut en fond
pâle avec icône et libellé. `audit.py` vérifie qu'aucun écran n'utilise la couleur
de marque, hors les deux pages qui portent le logo.

## Phases du workflow — rampe ordinale

Les quatre phases sont **ordonnées**, donc une seule teinte qui fonce, pas quatre
couleurs : `#86b6ef` `#5598e7` `#2a78d6` `#184f95`. Tous les tests passent.

## Fonctions — catégoriel, ordre figé

L'orange est pris par la marque, le bleu par les phases, le rouge par les statuts :
il restait exactement cinq teintes utilisables, et un seul ordre qui passe.

| Fonction | Valeur |
|---|---|
| Direction | `#4a3aa7` violet |
| Administratif | `#1baf7a` aqua |
| Secrétariat technique | `#eda100` jaune |
| Bureau d'étude | `#e87ba4` magenta |
| Conducteur de travaux | `#008300` vert |

Écart le plus faible entre deux voisines : **9,1** en daltonisme protan (seuil 8),
**19,6** en vision normale (plancher 15).
Trois d'entre elles passent sous 3:1 sur blanc, d'où le badge à **fond teinté,
encre foncée et pastille pleine** — jamais du texte coloré.

Les acteurs externes (artisan, client) sont **neutres** : ce ne sont pas des
fonctions du cabinet.

## Statut

Palette fixe, jamais thémée, **toujours accompagnée d'une icône et d'un libellé** :
`#0ca30c` bon · `#fab219` avertissement · `#ec835a` sérieux · `#d03b3b` critique.
Sur fond clair, l'avertissement est à 1,79:1 : la couleur seule serait illisible.

## Typographie

**Inter**, en fonte variable — les graisses intermédiaires (550, 650, 680) sont
réelles. Chiffres proportionnels par défaut ; `tabular-nums` réservé aux colonnes
qui s'alignent.

## Logo

- `logo/assmo-icone.svg` — l'icône sur fond bleu nuit, redessinée à partir des
  tracés du PDF (512×512, rayon 110,93).
- `logo/assmo-icone-claire.svg` — la variante sur tuile crème.
- `logo/assmo-logo-source.pdf` — le fichier d'origine, trois planches.

Le nom s'écrit **AssMO**, avec « MO » en orange quand le support le permet.

## Vérification

```bash
node build.mjs && python3 audit.py
```

Toute palette modifiée se revalide avec le script de la skill `dataviz` :

```bash
node scripts/validate_palette.js "<hex,hex,…>" --mode light --surface "#ffffff"
node scripts/validate_palette.js "<hex,hex,…>" --mode dark  --surface "#19202c"
```
