#!/usr/bin/env node
/* Génère les pages autonomes de la maquette AsstMO.
 *
 * Chaque fragment de `src/` commence par un en-tête JSON en commentaire :
 *   <!--meta { "id":"03", "titre":"Tableau de bord", "groupe":"Cabinet",
 *              "role":"Direction", "largeur":1440, "hauteur":1100 } -->
 *
 * Fragments réutilisables, remplacés dans le corps :
 *   {{sidebar:chantiers}}   barre latérale, l'entrée nommée est active
 *   {{topbar:Nom|NN|Fonction|classe}}
 *   {{onglets:etapes}}      onglets d'une fiche chantier
 *   {{l:cle}}               lien vers un écran, par sa clé (voir ROUTES)
 *
 * Le CSS est INLINÉ dans chaque sortie : une vignette Claude Design doit se
 * suffire à elle-même, sans dépendre d'un fichier voisin. En fin de passe, tous
 * les liens internes sont vérifiés — une cible manquante casse le build plutôt
 * que de laisser un lien mort dans la maquette.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(racine, '_jetons.css'), 'utf8');
const dossierSrc = join(racine, 'src');
const dossierOut = join(racine, 'docs');
rmSync(dossierOut, { recursive: true, force: true });
mkdirSync(dossierOut, { recursive: true });

/* ------------------------------------------------- la carte des écrans */
const ROUTES = {
  fondations:   '00-fondations.html',
  roles:        '01-roles.html',
  connexion:    '02-connexion.html',
  tableau:      '03-tableau-de-bord.html',
  ensemble:     '04-vue-d-ensemble.html',
  chantiers:    '05-chantiers.html',
  etapes:       '06-chantier-etapes.html',
  planning:     '07-chantier-planning.html',
  finances:     '08-chantier-finances.html',
  fiche:        '09-chantier-fiche-de-suivi.html',
  intervenants: '10-chantier-intervenants.html',
  messagerieCh: '11-chantier-messagerie.html',
  photos:       '12-chantier-photos.html',
  crCh:         '13-chantier-comptes-rendus.html',
  impression:   '14-chantier-impression.html',
  planningCond: '15-planning-conducteur.html',
  taches:       '16-mes-taches.html',
  messagerie:   '17-messagerie-a-traiter.html',
  mail:         '18-messagerie-un-e-mail.html',
  crRdv:        '19-compte-rendu-rdv.html',
  clients:      '20-annuaire-clients.html',
  artisans:     '21-annuaire-artisans.html',
  workflow:     '22-modele-de-workflow.html',
  bareme:       '23-bareme-d-honoraires.html',
  users:        '24-utilisateurs.html',
  moteur:       '25-moteur-d-evenements.html',
  cabinets:     '26-cabinets.html',
  artisanHome:  '27-espace-artisan.html',
  artisanDevis: '28-artisan-deposer-un-devis.html',
  artisanVenue: '29-artisan-confirmer-sa-venue.html',
  artisanPhoto: '30-artisan-photos.html',
  clientHome:   '31-espace-client.html',
  clientDevis:  '32-client-devis.html',
  clientPlan:   '33-client-planning.html',
  clientPaie:   '34-client-paiements.html',
  clientCr:     '35-client-comptes-rendus.html',
  visite:       '36-conducteur-visite-de-chantier.html',
};
const L = (cle) => {
  if (!ROUTES[cle]) throw new Error(`lien inconnu : {{l:${cle}}}`);
  return ROUTES[cle];
};

const LOGO = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="AssMO">
  <rect width="512" height="512" rx="110.93" fill="#1b2a41"/>
  <path d="M85.33 401.07H426.67" fill="none" stroke="#3a4a63" stroke-width="17.07" stroke-linecap="round"/>
  <path d="M93.87 256 256 102.4 418.13 256" fill="none" stroke="#dd6b13" stroke-width="46.93" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M179.2 298.67 234.67 354.13 341.33 238.93" fill="none" stroke="#fff" stroke-width="38.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

/* ---------------------------------------------------------------- fragments */
const NAV = [
  { groupe: 'Pilotage', items: [
    ['tableau', 'Tableau de bord', '◱', ''],
    ['ensemble', "Vue d'ensemble", '◫', ''],
    ['chantiers', 'Chantiers', '⌂', '12'],
    ['planningCond', 'Planning', '▦', ''],
    ['taches', 'Mes tâches', '✓', '7'],
  ]},
  { groupe: 'Échanges', items: [
    ['messagerie', 'Messagerie', '✉', '9'],
    ['crRdv', 'Comptes rendus', '◴', ''],
  ]},
  { groupe: "Carnet d'adresses", items: [
    ['clients', 'Clients', '☺', ''],
    ['artisans', 'Artisans', '⚒', '46'],
  ]},
  { groupe: 'Administration', items: [
    ['workflow', 'Modèles de workflow', '⇄', ''],
    ['bareme', "Barème d'honoraires", '％', ''],
    ['users', 'Utilisateurs', '◉', ''],
    ['moteur', "Moteur d'évènements", '⚙', ''],
    ['cabinets', 'Cabinets', '▣', ''],
  ]},
];

function sidebar(actif) {
  return `<aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">${LOGO}</div>
      <div><div class="brand-name">Ass<em>MO</em></div><div class="brand-sub">Agence Verdier</div></div>
    </div>
    ${NAV.map(
      (g) => `<div class="nav-group"><div class="nav-label">${g.groupe}</div>
      ${g.items
        .map(
          ([cle, nom, ico, cpt]) =>
            `<a class="nav-item${cle === actif ? ' is-active' : ''}" href="${L(cle)}">
            <span class="ico">${ico}</span><span>${nom}</span>${cpt ? `<span class="count">${cpt}</span>` : ''}</a>`,
        )
        .join('')}</div>`,
    ).join('')}
    <div class="sidebar-foot">
      <a class="nav-item" href="${L('roles')}"><span class="ico">⇥</span><span>Changer de rôle</span></a>
    </div>
  </aside>`;
}

function topbar(arg) {
  const [nom = 'Hélène Verdier', ini = 'HV', fonctions = 'Direction|fn-direction'] = (arg || '').split('@');
  const badges = fonctions
    .split(',')
    .map((f) => {
      const [lib, cls] = f.split('|');
      return `<span class="badge ${cls || 'st-neutral'}"><i class="dot"></i>${lib}</span>`;
    })
    .join(' ');
  return `<div class="topbar">
    <div class="search"><span>⌕</span><span>Rechercher un chantier, un client, un artisan…</span><span class="kbd">⌘K</span></div>
    <button class="btn btn-sm">＋ Nouveau chantier</button>
    <div class="row" style="gap:9px">${badges}
      <div class="avatar sm circle" style="background:var(--neutral)">${ini}</div>
      <div style="font-size:13px"><b>${nom}</b></div>
    </div>
  </div>`;
}

const ONGLETS = [
  ['etapes', 'Étapes', '34/62'],
  ['planning', 'Planning', ''],
  ['finances', 'Finances', ''],
  ['fiche', 'Fiche de suivi', ''],
  ['intervenants', 'Intervenants', '9'],
  ['messagerieCh', 'Messagerie', '3'],
  ['photos', 'Photos', '28'],
  ['crCh', 'Comptes rendus', '4'],
];

function onglets(actif) {
  return `<div class="tabs">${ONGLETS.map(
    ([cle, nom, cpt]) =>
      `<a class="tab${cle === actif ? ' is-active' : ''}" href="${L(cle)}">${nom}${cpt ? `<span class="count">${cpt}</span>` : ''}</a>`,
  ).join('')}</div>`;
}

const rendre = (html) =>
  html
    .replace(/\{\{sidebar:([a-zA-Z-]*)\}\}/g, (_, a) => sidebar(a))
    .replace(/\{\{topbar:?([^}]*)\}\}/g, (_, a) => topbar(a))
    .replace(/\{\{onglets:([a-zA-Z-]*)\}\}/g, (_, a) => onglets(a))
    .replace(/\{\{l:([A-Za-z]+)\}\}/g, (_, a) => L(a))
    .replace(/\{\{logo\}\}/g, () => LOGO);

/* -------------------------------------------------------------- génération */
const fichiers = readdirSync(dossierSrc).filter((f) => f.endsWith('.html')).sort();
const index = [];
const liensVus = [];

for (const fichier of fichiers) {
  const brut = readFileSync(join(dossierSrc, fichier), 'utf8');
  const m = brut.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if (!m) throw new Error(`${fichier} : en-tête <!--meta … --> manquant`);
  const meta = JSON.parse(m[1]);
  const corps = rendre(brut.slice(m[0].length));
  const sortie = `${meta.id}-${slug(meta.titre)}.html`;
  index.push({ ...meta, sortie });

  for (const h of corps.matchAll(/href="([^":#]+\.html)"/g)) liensVus.push([sortie, h[1]]);

  writeFileSync(
    join(dossierOut, sortie),
    `<!doctype html>
<!-- @dsCard group="${meta.groupe}" -->
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AssMO · ${meta.id} — ${meta.titre}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300..800&display=swap" rel="stylesheet">
<style>
${css}
</style>
</head>
<body>
<div class="mock-bar no-print">
  <span class="tagid">${meta.id}</span>
  <span>${meta.titre}</span>
  <span class="sep">·</span>
  <span style="color:#9a9a96">${meta.groupe}</span>
  ${meta.role ? `<span class="sep">·</span><span style="color:#9ec5f4">${meta.role}</span>` : ''}
  <span class="persona">
    <a href="index.html">Sommaire</a>
    <a href="${L('roles')}">Rôles</a>
    <button class="theme-toggle" id="bascule">Mode sombre</button>
  </span>
</div>
${corps}
<script>
(function () {
  var b = document.getElementById('bascule');
  var sombre = matchMedia('(prefers-color-scheme: dark)').matches;
  function peindre() {
    document.documentElement.dataset.theme = sombre ? 'dark' : 'light';
    b.textContent = sombre ? 'Mode clair' : 'Mode sombre';
  }
  peindre();
  b.addEventListener('click', function () { sombre = !sombre; peindre(); });
})();
</script>
</body>
</html>
`,
  );
}

/* Sommaire */
const groupes = [...new Set(index.map((e) => e.groupe))];
writeFileSync(
  join(dossierOut, 'index.html'),
  `<!doctype html>
<!-- @dsCard group="Fondations" -->
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AssMO — maquette, sommaire</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300..800&display=swap" rel="stylesheet">
<style>${css}</style></head>
<body><div class="content" style="max-width:940px;margin:0 auto;padding:34px 22px">
<div class="page-head"><div>
  <h1 class="page-title">AssMO — maquette</h1>
  <div class="page-sub">${index.length} écrans. Chaque page est autonome et se bascule en mode sombre.</div>
</div><div class="page-actions">
  <a class="btn" href="${L('fondations')}">Fondations</a>
  <a class="btn btn-primary" href="${L('roles')}">Commencer par les rôles</a>
</div></div>
${groupes
  .map(
    (g) => `<div class="card"><div class="card-head"><div class="card-title">${g}</div>
  <span class="muted">${index.filter((e) => e.groupe === g).length} écrans</span></div>
  <table class="tbl"><tbody>
  ${index
    .filter((e) => e.groupe === g)
    .map(
      (e) => `<tr><td class="num" style="width:48px;color:var(--ink-muted)">${e.id}</td>
      <td><a href="${e.sortie}">${e.titre}</a></td>
      <td class="right">${e.role ? `<span class="badge st-neutral">${e.role}</span>` : ''}</td></tr>`,
    )
    .join('')}
  </tbody></table></div>`,
  )
  .join('')}
</div></body></html>
`,
);

/* Contrôle des liens internes */
const existants = new Set([...index.map((e) => e.sortie), 'index.html']);
const morts = liensVus.filter(([, cible]) => !existants.has(cible));
if (morts.length) {
  console.error(`\n✕ ${morts.length} lien(s) mort(s) :`);
  for (const [depuis, cible] of morts) console.error(`   ${depuis} → ${cible}`);
  process.exitCode = 1;
} else {
  console.log(`✓ ${liensVus.length} liens internes vérifiés, aucun mort`);
}
const manquants = Object.entries(ROUTES).filter(([, f]) => !existants.has(f));
if (manquants.length) {
  console.log(`⋯ écrans encore à écrire : ${manquants.map(([c]) => c).join(', ')}`);
}
console.log(`${index.length} écrans + index.html générés dans docs/`);

function slug(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
