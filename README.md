# INGETO Command Center

# Prompt Lovable — Backoffice INGETO (v2, spécifications détaillées)

Copiez-collez tout le bloc ci-dessous dans Lovable pour générer le backoffice.

---

## PROMPT À COLLER DANS LOVABLE

Crée une application web **backoffice / tableau de bord interne** pour **INGETO**, un cabinet marocain d'ingénierie topographique (topographie, bathymétrie, lasergrammétrie, expertise immobilière, photogrammétrie, BIM, SIG), basé à Témara, qui répond à des marchés publics **et** privés. Ce backoffice pilote des agents IA qui automatisent la veille des marchés, la vérification et la préparation des dossiers de soumission, le suivi des équipes terrain ("brigades") et la facturation.

Le design doit être somptueux, moderne, animé, du niveau d'un SaaS premium (type Linear, Vercel Dashboard, Notion). Mais la priorité absolue de ce prompt est **fonctionnelle** : chaque page listée ci-dessous décrit précisément ses boutons, filtres, barres de recherche, tris, pagination et aperçus — chacun de ces éléments doit se comporter exactement comme décrit, avec un vrai changement d'état visible côté front (pas un élément visuel statique qui ne fait rien). S'il y a un doute entre "plus joli" et "vraiment fonctionnel", choisis toujours fonctionnel.

**Règles techniques non négociables, valables sur toute l'application :**
1. Le login est un pur mock sans validation bloquante : champs en état contrôlé (`useState` + `value`/`onChange`, jamais un simple `defaultValue`), et les deux boutons de connexion redirigent systématiquement vers le tableau de bord au clic.
2. Sur **chaque** liste avec recherche/filtre/tri (Marchés Publics, Marchés Privés, Brigades Terrain, Facturation), le tableau affiché et le compteur de résultats doivent lire **exactement la même variable filtrée** calculée une seule fois — jamais deux sources de vérité différentes.
3. Chaque bouton d'action (lancer, valider, générer, relancer, importer, télécharger) doit déclencher un vrai changement d'état local (nouvel élément ajouté, statut modifié, badge mis à jour) accompagné d'un toast de confirmation — jamais un clic silencieux sans effet visible.

### 1. Identité visuelle (reprise du vrai site https://ingeto.ma)

- **Logo** (sidebar + écran de login) : `https://ingeto.ma/wp-content/uploads/2023/01/logo-transparent-scaled.png`
- **Favicon** : `https://ingeto.ma/favicon.ico`
- **Couleur principale** : bleu ingénierie profond `#005090` (extraite du logo réel) — `--primary-dark: #003a68` / `--primary-glow: #0068bd`.
- **Couleur d'accent** : bleu acier `#6995C1` (extraite du bouton CTA réel du site) — `--accent-soft: #eaf1f8` / `--accent-glow: #8fb4dd`.
- **Fond/texte** : `--background: #ffffff` / `--foreground: #14213a` / `--muted: #f4f7fb` / `--border: #e2e8f0`.
- **Polices** : "Poppins" (600-700) pour les titres, "Roboto" pour le corps — via Google Fonts, déjà utilisées sur ingeto.ma.
- **Univers visuel** : géomètre avec théodolite/station totale, drones de photogrammétrie, plans cadastraux, cartes SIG — pas d'imagerie médicale. Écran de login : grande photo de terrain topographique avec dégradé bleu marine, comme le hero du vrai site.
- **Effets** : fond avec dégradé "aurora" lent en arrière-plan (primary-glow/accent-glow, ~5-8% d'opacité), cartes en verre dépoli avec ombres teintées de bleu, cartes qui se soulèvent au survol, compteurs de KPI animés (0 → valeur finale), transitions de page en fondu (framer-motion), skeletons avec effet shimmer pendant les traitements IA simulés.

### 2. Écran de connexion

- Deux colonnes plein écran (`min-h-screen w-full`, aucune zone morte) : formulaire à gauche, photo de terrain + dégradé bleu marine à droite avec "INGETO Control" et une accroche.
- Champs pré-remplis en état contrôlé : Email `a.karroum@ingeto.ma`, mot de passe `Ingeto@2026`. Encart "Accès démonstration" + bouton "Connexion instantanée (démo)". Les deux boutons ("Se connecter" et le bouton démo) redirigent systématiquement vers `/dashboard`.

### 3. Sidebar — comportement précis

Sidebar fixe à gauche, avec un comportement de fermeture/ouverture réellement fonctionnel :
- **État ouvert** (par défaut) : largeur ~260px, logo INGETO en haut (sans texte à côté), puis la liste des 7 modules de navigation avec icône + libellé, chacun étant un lien qui charge réellement la page correspondante et affiche un indicateur visuel (fond teinté + barre latérale colorée) sur le module actif.
- **Bouton de fermeture** : en bas de la sidebar, icône chevron/hamburger avec le libellé "Réduire". Au clic, la sidebar anime sa largeur jusqu'à ~64px (transition ~200ms ease), les libellés disparaissent (fondu), seules les icônes restent centrées, et le bouton devient une icône "Agrandir" qui rouvre la sidebar au clic suivant. Un tooltip apparaît au survol de chaque icône quand la sidebar est réduite, affichant le nom du module.
- Le contenu principal (`main`) doit se réajuster en largeur à chaque changement d'état (`margin-left` animé en cohérence avec la largeur de la sidebar), jamais de saut brutal.
- L'état ouvert/réduit est mémorisé (state local, persistant tant que la session dure) pour ne pas se réinitialiser en changeant de page.
- Modules de navigation, dans cet ordre : **Tableau de bord**, **Configuration**, **Marchés Publics**, **Marchés Privés**, **Dossiers & Relances**, **Brigades Terrain**, **Facturation & Décompte**.

Header en haut de chaque page : recherche rapide "aller à" (tape une référence exacte de dossier, Entrée redirige vers sa page détail si elle existe, sinon affiche "Aucun dossier avec cette référence"), icône notifications (badge avec le nombre d'éléments non lus, ouvre un petit panneau listant les dernières activités des agents IA), avatar (M. Abdelmoutalib Karroum, INGETO) avec menu déroulant (Profil / Déconnexion → redirige vers `/`).

### 4. Page "Tableau de bord"

- 5 cartes KPI qui comptent progressivement à l'affichage : "Marchés suivis (publics + privés)", "Dossiers en cours", "Budget total en jeu (MAD)", "Brigades actives sur le terrain", "Relances en attente" — chaque carte est cliquable et redirige vers la page correspondante (ex. la carte "Relances en attente" ouvre "Dossiers & Relances" déjà filtrée sur les relances en attente).
- Graphique de l'activité des 30 derniers jours (marchés identifiés vs dossiers soumis), données mockées cohérentes avec les listes.
- Flux "Activité récente des agents IA" avec au moins 6 entrées horodatées réalistes (ex. "Agent Marché Public a identifié 4 nouveaux appels d'offres correspondant à vos critères — il y a 20 min", "Brigade Nord a remonté son rapport de terrain — il y a 2h").
- Bandeau d'avertissement si la Configuration n'est pas encore validée ("Configurez vos critères de veille avant de lancer une recherche"), avec bouton "Configurer" qui redirige vers `/configuration`. Bandeau qui disparaît réellement une fois la configuration validée (state partagé entre les pages, ex. via un contexte React global).

### 5. Page "Configuration" — prérequis réel avant toute veille

- **Critères marché public** : cases à cocher pour les 6 catégories de service (Topographie et Bathymétrie, Lasergrammétrie, Expertise immobilière, Photogrammétrie, BIM, SIG), champ zones géographiques (tags ajoutables/supprimables), budget min/max (champs numériques), mots-clés à inclure/exclure (tags dynamiques), capacités techniques/certifications du cabinet (cases à cocher ou tags).
- **Critères marché privé** : types de clients ciblés (cases à cocher : promoteurs immobiliers, particuliers, entreprises industrielles), documents types déjà en stock pour la vérification automatique (liste éditable).
- **Portails surveillés** : le portail marocain des marchés publics, coché et verrouillé par défaut (checkbox désactivée mais visible, avec tooltip "portail principal, toujours actif").
- Bouton "Enregistrer la configuration" : au clic, sauvegarde l'état (contexte global), affiche un toast de succès, fait apparaître un badge "Configuration active ✅" en haut de la page, et retire le bandeau d'avertissement du Tableau de bord et de la page Marchés Publics.
- **Effet réel et vérifiable** : les catégories cochées ici doivent correspondre exactement aux catégories utilisées pour générer/filtrer les résultats sur la page Marchés Publics (section 6) — si on décoche "Lasergrammétrie", aucun marché de cette catégorie ne doit pouvoir être "découvert" par le bouton "Lancer la veille".

### 6. Page "Marchés Publics" — cœur de l'application

**a) Liste**
- Barre d'outils : champ de recherche en temps réel (filtre sur référence, client, mot-clé — un seul champ, pas de doublon avec la recherche globale du header), 3 filtres déroulants fonctionnels (Statut, Catégorie de service, parmi les 6 de la Configuration), champ Budget min/max, plage de dates (date limite), bouton "Réinitialiser les filtres" qui remet tout à zéro et recharge la liste complète.
- Tableau avec tri fonctionnel sur chaque colonne cliquable (Référence, Client, Budget, Date limite, Statut) — un clic trie ascendant, un second clic trie descendant, avec une icône flèche qui reflète l'état.
- Pagination fonctionnelle (10/25/50 lignes par page, numéros de page cliquables + précédent/suivant), le total affiché ("X résultat(s)") et les lignes du tableau proviennent strictement de la même liste filtrée (voir règle technique n°2).
- Génère **20 marchés publics mockés réalistes**, clients marocains plausibles pour un cabinet de topographie : **ANCFCC**, **ONCF**, **OCP**, **CDG**, **ADM (Autoroutes du Maroc)**, **ONEE**, communes/collectivités territoriales, Agence Urbaine. Prestations réalistes : levé topographique de tracé ferroviaire, bornage de terrain agricole, scan 3D de site industriel, mise à jour cadastrale, étude d'implantation de lotissement, photogrammétrie par drone de chantier.

**b) Bouton "Lancer la veille" — recherche liée à la Configuration**
- Situé en haut de la page (et sur le Tableau de bord), désactivé tant que la Configuration n'est pas validée (avec tooltip expliquant pourquoi).
- Au clic : animation de traitement (barre de progression + étapes textuelles qui défilent : "Connexion au portail des marchés publics… Filtrage selon vos critères… Analyse des nouvelles offres…", ~2-3 secondes au total).
- À la fin de l'animation : **3 à 5 nouveaux marchés apparaissent dans le tableau**, avec un badge "Nouveau" visible pendant quelques secondes (highlight coloré qui s'estompe), et leurs caractéristiques (catégorie, budget, zone) doivent être cohérentes avec les critères actuellement enregistrés dans la Configuration — génère cette correspondance réellement en code (filtre un pool de marchés candidats mockés selon les critères de config, plutôt que d'ajouter des lignes aléatoires sans lien avec la configuration).
- Toast de confirmation : "X nouveaux marchés identifiés correspondant à vos critères."
- Chaque nouveau marché est au statut "Identifié" (étape 1 du stepper décrit ci-dessous), prêt à être ouvert.

**c) Détail d'un marché**
- Stepper à 6 étapes (Identifié → Analysé → Dossier vérifié → Documents générés → Soumis → Résultat), ligne de connexion qui se remplit en dégradé selon la progression, point pulsant sur l'étape actuelle, bouton "Passer à l'étape suivante" qui fait réellement avancer le dossier (change son statut, débloque l'onglet suivant, toast de confirmation).
- Onglets qui ne se débloquent qu'à l'étape atteinte : **Fiche de synthèse** / **Exigences du CPS** / **Vérification du dossier** / **Documents** / **Historique**.
- **Fiche de synthèse** : budget, client, référence, catégorie, résumé des exigences généré par l'IA. Si le marché mocké appartient au sous-ensemble "informations partiellement indisponibles" (prévois environ 1 marché sur 5 dans ce cas), affiche une alerte claire : "Certaines informations ne sont pas publiées par le portail pour des raisons de sécurité — à compléter manuellement" avec un bouton "Marquer comme complété manuellement".
- **Exigences du CPS** : tableau des exigences, chaque ligne cliquable pour dérouler un accordéon avec plus de détails (justification, ressources mobilisées).
- **Vérification du dossier** : checklist de complétude (documents administratifs, certificats requis, éléments du CPS couverts) avec statut "100% complet" ou liste de ce qui manque en rouge, et un bouton **"Valider et générer les documents"** — ce bouton représente la validation humaine explicite demandée par le client (pas d'automatisation totale à cette étape) et ne devient actif que si la checklist est à 100%.
- **Documents** : dès validation, génération automatique et systématique de 4 documents (mémoire technique, dossier administratif, acte d'engagement, bordereau des prix), chacun avec boutons **Aperçu** (modal de prévisualisation soigné, mise en page façon vrai document avec en-tête INGETO) et **Télécharger** (déclenche un vrai téléchargement de fichier généré côté client).
- **Historique** : timeline verticale animée (ligne + points), horodatée, un événement par changement d'étape réel.
- **Assistant IA du dossier** : bouton flottant "Demander à l'assistant IA" (glow animé, toujours visible en scrollant), ouvre un panneau coulissant à droite (~400px) avec avatar INGETO, bulles de conversation, 4-5 questions suggérées cliquables au premier ouverture (ex. "Quel est le budget de ce marché ?", "Que manque-t-il pour compléter le dossier ?", "Quand est la date limite ?"), indicateur "L'assistant écrit…" (~800-1200ms) avant chaque réponse, réponses générées par une fonction unique `getAssistantReply(question, dossier)` fondée sur les données réelles du dossier ouvert. Le panneau se ferme via un bouton dédié et se réinitialise (nouvelle conversation) si on change de dossier.

### 7. Page "Marchés Privés"

- Liste avec recherche + filtre par statut d'analyse (À analyser / Correspond / Ne correspond pas / À vérifier) + pagination fonctionnelle, mêmes règles que la section 6a (une seule source de vérité pour compteur et tableau).
- Bouton "Importer un document" : ouvre un modal simulant un upload (barre de progression ~1,5s), puis ajoute réellement une nouvelle ligne "À analyser" en haut de la liste avec toast de confirmation.
- Chaque ligne "À analyser" a un bouton "Lancer l'analyse IA" : animation de traitement puis le statut passe à Correspond/Ne correspond pas/À vérifier selon une comparaison simulée avec les critères marché privé de la Configuration, avec une justification textuelle affichée en cliquant sur "Voir le détail".

### 8. Page "Brigades Terrain"

- Cartes pour chaque brigade (au moins 4 : Brigade Nord, Brigade Casablanca, Brigade Rabat-Témara, Brigade Sud), avec recherche par nom/localisation et filtre par statut (Active / En intervention / Sans nouvelles) fonctionnels.
- Chaque carte affiche : localisation actuelle, dossier/chantier en cours (lien cliquable vers le marché correspondant si applicable), date et résumé du dernier rapport remonté, et un badge d'alerte animé (pulsation orange/rouge) si aucune nouvelle depuis plus d'un seuil défini (ex. 5 jours).
- Bouton "Relancer la brigade" sur les cartes en alerte : simule l'envoi d'un message (modal de confirmation + toast), et met à jour un indicateur "Relance envoyée le [date]" sur la carte.

### 9. Page "Facturation & Décompte"

- Tableau avec recherche, filtre par statut (Brouillon / Émis / Payé) et pagination fonctionnelle, listant par dossier : unités d'œuvre saisies, quantités, montant calculé, statut.
- Bouton "Générer le décompte du mois" : animation de traitement puis ajout réel d'une nouvelle ligne "Brouillon" avec le montant calculé à partir des unités d'œuvre mockées du dossier concerné, toast de confirmation.
- Boutons **Aperçu** (modal de prévisualisation façon vraie facture/décompte officiel) et **Télécharger** (téléchargement de fichier réel) fonctionnels sur chaque ligne.

### 10. Exigences transverses

- Stack : React + Tailwind + shadcn/ui + framer-motion, responsive complet.
- Données mockées cohérentes entre toutes les pages (un même marché/dossier garde les mêmes infos partout où il apparaît — dashboard, liste, détail, chat IA).
- Toasts de confirmation sur chaque action listée ci-dessus, états vides soignés ("Aucun résultat pour cette recherche"), mode clair uniquement.
- **Avant de livrer, vérifie concrètement** (pas en supposant que le code "devrait" marcher) : que recherche + filtres + tri + pagination mettent bien à jour le même tableau affiché sur CHAQUE page qui en a un ; que "Lancer la veille" fait bien apparaître de nouveaux marchés cohérents avec la Configuration enregistrée ; que les boutons Aperçu et Télécharger produisent un effet réel (modal qui s'ouvre, fichier qui se télécharge) ; que la sidebar se réduit et se rouvre correctement ; que les deux boutons de connexion redirigent systématiquement.

---

*Prompt préparé à partir de la fiche besoins d'INGETO (M. Abdelmoutalib Karroum) et du design réel extrait de https://ingeto.ma/ (logo, favicon, couleurs, polices).*

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dbff3e1d-220d-4cde-aaa8-dddddd76358f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
