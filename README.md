# AsstMO — maquette

Maquette d'écrans pour **AsstMO**, l'assistant des maîtres d'œuvre.
Elle sert à valider le périmètre fonctionnel et la direction visuelle *avant* tout développement.

👉 **[Ouvrir la maquette](https://lechconsulting.github.io/asstmo-maquette/)**

## Ce que c'est

Des pages HTML statiques, sans dépendance ni étape de build côté navigateur.
Chaque écran est autonome (le CSS est inliné) et se bascule en clair / sombre.
Les données sont fictives mais **cohérentes d'un écran à l'autre** : le même chantier
« Extension Martin — Craponne », les mêmes artisans, les mêmes montants.

## Fabrication

```bash
node build.mjs     # src/*.html + _jetons.css → docs/
python3 audit.py   # contrôles de mise en page
```

- `_jetons.css` — jetons de design et composants.
- `src/*.html` — un fragment par écran, avec un en-tête `<!--meta … -->`.
- `build.mjs` — inline le CSS, injecte les fragments partagés (barre latérale, onglets),
  génère le sommaire et **vérifie tous les liens internes** (un lien mort casse le build).
- `audit.py` — les contrôles que l'œil ferait : balises déséquilibrées, composants dont la
  mise en page dépend d'un nombre d'enfants précis, largeurs fixes glissées dans une colonne
  souple, et usage du rouge hors du châssis. Chaque contrôle vient d'un bug réellement rencontré.

## Châssis

Repris de l'outil actuel (PBMO), jetons relevés dans son CSS : **Inter**, neutres ardoise
(fond `#f9fafb`, carte blanche), **rouge primaire `hsl(0 68% 45%)` = `#c12525`**, rayon
`.625rem`, barre latérale blanche en mode clair.

**Le rouge ne sort jamais du châssis.** Mesuré, il est à 4,8 d'écart perceptif du rouge
« critique » — le plancher est à 15, les deux sont indiscernables. Plutôt que de changer
l'une des deux teintes, on les sépare par le **rôle** : le rouge de marque n'existe qu'en
aplat sur le châssis (bouton principal, entrée de menu active, onglet actif, liens) ; le
rouge critique n'existe qu'en fond pâle avec une encre foncée, une icône et un libellé.
Aucune donnée n'est peinte en rouge de marque — d'où la règle complémentaire :
**rouge = interface, bleu = données**.

## Palette

La palette est validée par script, pas à l'œil, contre les surfaces réelles
(`#ffffff` en clair, `#191e29` en sombre) :

- **Phases du workflow** — rampe *ordinale* d'une seule teinte bleue, parce que les quatre
  phases sont ordonnées. Quatre teintes catégorielles avaient été essayées d'abord : le violet
  et le bleu se confondent en mode sombre (écart perceptif 1,9 en daltonisme protan, seuil 8).
- **Fonctions** — 5 teintes catégorielles, ordre figé, sans bleu. Écart le plus faible entre
  deux fonctions voisines : 16,3 en deutan / 19,6 en vision normale (clair), 13,0 / 19,3 (sombre).
- **Statut** — palette fixe, jamais thémée, toujours accompagnée d'une icône et d'un libellé.

Deux couleurs de fonction passent sous 3:1 sur fond clair : c'est pourquoi un badge est un
fond teinté avec une encre foncée et une pastille pleine, et jamais du texte coloré.

## Avertissement

Maquette non fonctionnelle : aucun bouton n'enregistre quoi que ce soit, aucune donnée réelle.
