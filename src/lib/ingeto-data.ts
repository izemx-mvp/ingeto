export const CATEGORIES = [
  "Topographie et Bathymétrie",
  "Lasergrammétrie",
  "Expertise immobilière",
  "Photogrammétrie",
  "BIM",
  "SIG",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const MARKET_STEPS = [
  "Identifié",
  "Analysé",
  "Dossier vérifié",
  "Documents générés",
  "Soumis",
  "Résultat",
] as const;

export type MarketStatus = (typeof MARKET_STEPS)[number];

export type Requirement = {
  label: string;
  detail: string;
  resources: string;
};

export type PublicMarket = {
  id: string;
  ref: string;
  aoNumber: string;
  cpsRef: string;
  rcRef: string;
  caution: number;
  visiteLieux: boolean;
  client: string;
  objet: string;
  category: Category;
  budget: number;
  deadline: string;
  zone: string;
  status: MarketStatus;
  partialInfo: boolean;
  manuallyCompleted?: boolean;
  isNew?: boolean;
  summary: string;
  requirements: Requirement[];
  checklist: { label: string; done: boolean }[];
  documentsGenerated: boolean;
  history: { date: string; label: string }[];
};

/** « AO-2026-ONCF-207 » → « AO N° 207/2026/ONCF » */
export const aoNumberOf = (ref: string) => {
  const parts = ref.split("-");
  const num = parts[parts.length - 1] ?? "001";
  const sigle = parts.slice(2, parts.length - 1).join("-") || "MO";
  return `AO N° ${num}/2026/${sigle}`;
};

export const cautionOf = (budget: number) => Math.round((budget * 0.015) / 1000) * 1000;

const req = (cat: Category, ref: string): Requirement[] => [
  {
    label: `Certificat de Qualification et Classification (${cat})`,
    detail: `Le CPS du marché ${aoNumberOf(ref)} exige un Certificat de Qualification et Classification, secteur topographie / géomètre, classe 2 minimum, en cours de validité à la date d'ouverture des plis.`,
    resources: "Certificat n° QC-TOPO-2024/318 valable jusqu'au 31/12/2027 + attestation OIGT",
  },
  {
    label: "Caution provisoire et cautionnement définitif",
    detail:
      "Le Règlement de Consultation (RC) fixe une caution provisoire à constituer par attestation bancaire, restituée après jugement des offres ; le cautionnement définitif est de 3 % du montant du marché.",
    resources: "Ligne de caution bancaire Attijariwafa Bank — plafond 1 200 000 MAD",
  },
  {
    label: "Moyens matériels dédiés (article du CPS)",
    detail:
      "Station totale robotisée, GNSS RTK rattaché au réseau national, scanner 3D et drone certifié DGAC pour les levés spéciaux.",
    resources: "2 stations Leica TS16, 3 récepteurs GNSS, scanner RTC360, drone DJI M300 RTK",
  },
  {
    label: "Références de prestations similaires (3 dernières années)",
    detail:
      "Trois attestations de bonne exécution délivrées par des maîtres d'ouvrage publics, de nature et d'importance comparables.",
    resources: "Portefeuille INGETO : ANCFCC, ONCF, OCP, ADM",
  },
  {
    label: "Attestation de visite des lieux",
    detail:
      "Le RC exige la participation à la visite des lieux organisée par le maître d'ouvrage ; l'attestation délivrée sur place est une pièce du dossier technique.",
    resources: "Chef de brigade de la zone + procès-verbal de visite",
  },
  {
    label: "Délai d'exécution, planning et livrables",
    detail:
      "Planning en phases avec jalons de remise, rapport hebdomadaire, plans DWG géoréférencés Lambert Maroc, nuages E57 et rapport PDF signé par l'IGT.",
    resources: "Brigade dédiée + cellule bureau d'études (3 techniciens DAO)",
  },
];

const checklist = (complete: boolean, ref: string, budget: number) => [
  { label: `Cahier des Prescriptions Spéciales (CPS ${ref}) téléchargé et analysé`, done: true },
  { label: `Règlement de Consultation (RC ${ref}) — pièces exigées relevées`, done: true },
  {
    label: `Caution provisoire de ${cautionOf(budget).toLocaleString("fr-MA")} MAD constituée`,
    done: complete,
  },
  {
    label: "Certificat de Qualification et Classification (topographie) en cours de validité",
    done: complete,
  },
  { label: "Attestation fiscale (Direction Générale des Impôts) de moins de 1 an", done: true },
  { label: "Attestation CNSS de moins de 1 an", done: true },
  { label: "Extrait du registre de commerce (modèle J)", done: true },
  { label: "Déclaration sur l'honneur signée et cachetée", done: true },
  { label: "Attestation de visite des lieux (si exigée par le RC)", done: complete },
  { label: "Attestations de bonne exécution (3 références similaires)", done: true },
  { label: "Bordereau des prix — détail estimatif renseigné", done: complete },
];


type Seed = {
  ref: string;
  client: string;
  objet: string;
  category: Category;
  budget: number;
  deadline: string;
  zone: string;
  status: MarketStatus;
};

const seeds: Seed[] = [
  {
    ref: "AO-2026-ANCFCC-014",
    client: "ANCFCC",
    objet: "Mise à jour cadastrale de 1 800 ha en zone périurbaine",
    category: "SIG",
    budget: 2450000,
    deadline: "2026-10-02",
    zone: "Rabat-Salé-Kénitra",
    status: "Analysé",
  },
  {
    ref: "AO-2026-ONCF-207",
    client: "ONCF",
    objet: "Levé topographique du tracé ferroviaire Kénitra – Sidi Kacem (42 km)",
    category: "Topographie et Bathymétrie",
    budget: 4180000,
    deadline: "2026-09-28",
    zone: "Rabat-Salé-Kénitra",
    status: "Dossier vérifié",
  },
  {
    ref: "AO-2026-OCP-089",
    client: "OCP",
    objet: "Scan 3D lasergrammétrique du complexe de traitement de Jorf Lasfar",
    category: "Lasergrammétrie",
    budget: 3120000,
    deadline: "2026-10-15",
    zone: "Casablanca-Settat",
    status: "Identifié",
  },
  {
    ref: "AO-2026-ADM-031",
    client: "ADM (Autoroutes du Maroc)",
    objet: "Photogrammétrie par drone du chantier d'élargissement A3",
    category: "Photogrammétrie",
    budget: 1780000,
    deadline: "2026-09-20",
    zone: "Rabat-Salé-Kénitra",
    status: "Documents générés",
  },
  {
    ref: "AO-2026-CDG-052",
    client: "CDG Développement",
    objet: "Étude d'implantation du lotissement Zenata Nord (86 lots)",
    category: "Topographie et Bathymétrie",
    budget: 990000,
    deadline: "2026-11-06",
    zone: "Casablanca-Settat",
    status: "Soumis",
  },
  {
    ref: "AO-2026-ONEE-118",
    client: "ONEE - Branche Eau",
    objet: "Bathymétrie du barrage Sidi Mohammed Ben Abdellah",
    category: "Topographie et Bathymétrie",
    budget: 1450000,
    deadline: "2026-10-24",
    zone: "Rabat-Salé-Kénitra",
    status: "Analysé",
  },
  {
    ref: "AO-2026-AURB-006",
    client: "Agence Urbaine de Rabat-Salé",
    objet: "Constitution d'un SIG urbain multi-couches (voirie, réseaux, bâti)",
    category: "SIG",
    budget: 2050000,
    deadline: "2026-12-01",
    zone: "Rabat-Salé-Kénitra",
    status: "Identifié",
  },
  {
    ref: "AO-2026-CT-TEM-023",
    client: "Commune de Témara",
    objet: "Bornage et délimitation de 340 ha de terrains communaux",
    category: "Expertise immobilière",
    budget: 620000,
    deadline: "2026-09-30",
    zone: "Rabat-Salé-Kénitra",
    status: "Dossier vérifié",
  },
  {
    ref: "AO-2026-CT-CASA-077",
    client: "Commune de Casablanca",
    objet: "Maquette BIM du marché municipal de Derb Sultan",
    category: "BIM",
    budget: 1330000,
    deadline: "2026-11-18",
    zone: "Casablanca-Settat",
    status: "Identifié",
  },
  {
    ref: "AO-2026-ANCFCC-021",
    client: "ANCFCC",
    objet: "Travaux de délimitation cadastrale du domaine forestier (Zaër)",
    category: "Expertise immobilière",
    budget: 870000,
    deadline: "2026-10-09",
    zone: "Rabat-Salé-Kénitra",
    status: "Analysé",
  },
  {
    ref: "AO-2026-ONCF-233",
    client: "ONCF",
    objet: "Lasergrammétrie de 12 ouvrages d'art de la ligne Casa – Marrakech",
    category: "Lasergrammétrie",
    budget: 2380000,
    deadline: "2026-10-30",
    zone: "Marrakech-Safi",
    status: "Identifié",
  },
  {
    ref: "AO-2026-OCP-102",
    client: "OCP",
    objet: "Suivi topographique mensuel des stocks miniers de Khouribga",
    category: "Photogrammétrie",
    budget: 1190000,
    deadline: "2026-09-25",
    zone: "Béni Mellal-Khénifra",
    status: "Soumis",
  },
  {
    ref: "AO-2026-ADM-044",
    client: "ADM (Autoroutes du Maroc)",
    objet: "Levé topographique et profils en travers – échangeur de Bouznika",
    category: "Topographie et Bathymétrie",
    budget: 760000,
    deadline: "2026-11-12",
    zone: "Casablanca-Settat",
    status: "Identifié",
  },
  {
    ref: "AO-2026-ONEE-131",
    client: "ONEE - Branche Électricité",
    objet: "SIG des servitudes de lignes HT de la région de l'Oriental",
    category: "SIG",
    budget: 1560000,
    deadline: "2026-12-08",
    zone: "Oriental",
    status: "Identifié",
  },
  {
    ref: "AO-2026-CDG-061",
    client: "CDG Développement",
    objet: "Expertise immobilière d'un portefeuille de 24 actifs tertiaires",
    category: "Expertise immobilière",
    budget: 1080000,
    deadline: "2026-10-21",
    zone: "Rabat-Salé-Kénitra",
    status: "Analysé",
  },
  {
    ref: "AO-2026-CT-AGD-009",
    client: "Commune d'Agadir",
    objet: "Bathymétrie du port de plaisance et du chenal d'accès",
    category: "Topographie et Bathymétrie",
    budget: 1410000,
    deadline: "2026-11-27",
    zone: "Souss-Massa",
    status: "Identifié",
  },
  {
    ref: "AO-2026-AURB-014",
    client: "Agence Urbaine de Kénitra",
    objet: "Photogrammétrie aérienne pour orthophoto urbaine 5 cm/px",
    category: "Photogrammétrie",
    budget: 2270000,
    deadline: "2026-10-05",
    zone: "Rabat-Salé-Kénitra",
    status: "Dossier vérifié",
  },
  {
    ref: "AO-2026-ONCF-241",
    client: "ONCF",
    objet: "Maquette BIM de la gare de Salé Tabriquet (rénovation)",
    category: "BIM",
    budget: 1920000,
    deadline: "2026-12-15",
    zone: "Rabat-Salé-Kénitra",
    status: "Identifié",
  },
  {
    ref: "AO-2026-ANCFCC-035",
    client: "ANCFCC",
    objet: "Levé topographique régulier de 12 secteurs de remembrement",
    category: "Topographie et Bathymétrie",
    budget: 540000,
    deadline: "2026-09-18",
    zone: "Fès-Meknès",
    status: "Résultat",
  },
  {
    ref: "AO-2026-CT-SAL-058",
    client: "Commune de Salé",
    objet: "Numérisation lasergrammétrique de la médina (façades et ruelles)",
    category: "Lasergrammétrie",
    budget: 1650000,
    deadline: "2026-11-03",
    zone: "Rabat-Salé-Kénitra",
    status: "Identifié",
  },
];

const summaryOf = (s: Seed) =>
  `Le portail des marchés publics publie l'appel d'offres ouvert ${aoNumberOf(s.ref)} porté par ${s.client}, portant sur ${s.objet.toLowerCase()} (${s.category.toLowerCase()}). Budget estimatif de ${s.budget.toLocaleString("fr-MA")} MAD, caution provisoire de ${cautionOf(s.budget).toLocaleString("fr-MA")} MAD, zone d'exécution : ${s.zone}. Le CPS et le RC ont été dépouillés par l'agent IA : le Certificat de Qualification et Classification requis est détenu, les moyens matériels sont disponibles et trois références comparables sont mobilisables.`;


const stepIndex = (s: MarketStatus) => MARKET_STEPS.indexOf(s);

export function buildMarket(s: Seed, index: number): PublicMarket {
  const idx = stepIndex(s.status);
  const partial = index % 5 === 2;
  return {
    id: s.ref,
    ref: s.ref,
    aoNumber: aoNumberOf(s.ref),
    cpsRef: `CPS n° ${s.ref.split("-").slice(2).join("/")}`,
    rcRef: `RC n° ${s.ref.split("-").slice(2).join("/")}`,
    caution: cautionOf(s.budget),
    visiteLieux: index % 3 !== 1,
    client: s.client,
    objet: s.objet,
    category: s.category,
    budget: s.budget,
    deadline: s.deadline,
    zone: s.zone,
    status: s.status,
    partialInfo: partial,
    summary: summaryOf(s),
    requirements: req(s.category, s.ref),
    checklist: checklist(idx >= 2, s.ref, s.budget),

    documentsGenerated: idx >= 3,
    history: MARKET_STEPS.slice(0, idx + 1).map((step, i) => ({
      date: `2026-0${Math.min(9, 6 + Math.floor(i / 2))}-${String(4 + i * 3).padStart(2, "0")} 09:${String(12 + i * 7).padStart(2, "0")}`,
      label: `Étape « ${step} » atteinte`,
    })),
  };
}

export const initialPublicMarkets: PublicMarket[] = seeds.map(buildMarket);

/** Pool de marchés candidats utilisé par « Lancer la veille » — filtré selon la configuration. */
export const candidatePool: Seed[] = [
  {
    ref: "AO-2026-ANCFCC-047",
    client: "ANCFCC",
    objet: "Levé topographique de 9 secteurs d'immatriculation d'ensemble",
    category: "Topographie et Bathymétrie",
    budget: 1240000,
    deadline: "2026-11-20",
    zone: "Rabat-Salé-Kénitra",
    status: "Identifié",
  },
  {
    ref: "AO-2026-ONCF-259",
    client: "ONCF",
    objet: "Scan 3D des tunnels ferroviaires de la ligne du Rif",
    category: "Lasergrammétrie",
    budget: 2870000,
    deadline: "2026-12-04",
    zone: "Tanger-Tétouan-Al Hoceïma",
    status: "Identifié",
  },
  {
    ref: "AO-2026-OCP-117",
    client: "OCP",
    objet: "Photogrammétrie drone du parc à résidus de Benguerir",
    category: "Photogrammétrie",
    budget: 1490000,
    deadline: "2026-11-14",
    zone: "Marrakech-Safi",
    status: "Identifié",
  },
  {
    ref: "AO-2026-ADM-058",
    client: "ADM (Autoroutes du Maroc)",
    objet: "SIG des emprises et acquisitions foncières autoroutières",
    category: "SIG",
    budget: 1880000,
    deadline: "2026-12-19",
    zone: "Casablanca-Settat",
    status: "Identifié",
  },
  {
    ref: "AO-2026-CDG-074",
    client: "CDG Développement",
    objet: "Maquette BIM du pôle bureaux Casa Anfa (18 000 m²)",
    category: "BIM",
    budget: 2140000,
    deadline: "2026-12-22",
    zone: "Casablanca-Settat",
    status: "Identifié",
  },
  {
    ref: "AO-2026-CT-TEM-036",
    client: "Commune de Témara",
    objet: "Expertise immobilière des équipements publics communaux",
    category: "Expertise immobilière",
    budget: 480000,
    deadline: "2026-10-28",
    zone: "Rabat-Salé-Kénitra",
    status: "Identifié",
  },
  {
    ref: "AO-2026-ONEE-146",
    client: "ONEE - Branche Eau",
    objet: "Bathymétrie de 4 retenues collinaires du Haouz",
    category: "Topographie et Bathymétrie",
    budget: 720000,
    deadline: "2026-11-09",
    zone: "Marrakech-Safi",
    status: "Identifié",
  },
  {
    ref: "AO-2026-AURB-022",
    client: "Agence Urbaine de Témara",
    objet: "SIG du plan d'aménagement et contrôle des autorisations",
    category: "SIG",
    budget: 930000,
    deadline: "2026-11-30",
    zone: "Rabat-Salé-Kénitra",
    status: "Identifié",
  },
  {
    ref: "AO-2026-CT-SAL-069",
    client: "Commune de Salé",
    objet: "Lasergrammétrie du théâtre municipal avant restauration",
    category: "Lasergrammétrie",
    budget: 640000,
    deadline: "2026-12-11",
    zone: "Rabat-Salé-Kénitra",
    status: "Identifié",
  },
  {
    ref: "AO-2026-ANCFCC-053",
    client: "ANCFCC",
    objet: "Photogrammétrie de contrôle des titres fonciers ruraux",
    category: "Photogrammétrie",
    budget: 1120000,
    deadline: "2026-12-06",
    zone: "Fès-Meknès",
    status: "Identifié",
  },
];

/* ---------------- Marchés privés ---------------- */

export type PrivateStatus = "À analyser" | "Correspond" | "Ne correspond pas" | "À vérifier";

export type PrivateDeal = {
  id: string;
  ref: string;
  client: string;
  clientType: string;
  objet: string;
  document: string;
  receivedAt: string;
  budget: number;
  status: PrivateStatus;
  justification: string;
  contact?: string | undefined;
  checklist?: { label: string; done: boolean }[] | undefined;
  documentsGenerated?: boolean | undefined;
  history?: { date: string; label: string }[] | undefined;

};

/** Pièces demandées par un client privé (offre commerciale, pas de CPS). */
export const privateChecklist = (deal: PrivateDeal) => [
  { label: `Cahier des charges client « ${deal.document} » analysé`, done: true },
  { label: "Devis détaillé et bordereau des prix unitaires", done: deal.status === "Correspond" },
  { label: "Attestation d'assurance Responsabilité Civile professionnelle", done: true },
  { label: "Attestation d'inscription à l'Ordre National des IGT (OIGT)", done: true },
  { label: "Extrait du registre de commerce (modèle J)", done: true },
  {
    label: "Références de prestations similaires (3 attestations)",
    done: deal.status !== "À analyser",
  },
  { label: "Planning d'exécution et délai proposé", done: deal.status === "Correspond" },
  { label: "Note sur les moyens humains et matériels affectés", done: deal.status === "Correspond" },
  { label: "Visite de reconnaissance du site réalisée", done: deal.status === "Correspond" },
];

export const privateHistory = (deal: PrivateDeal) => [
  { date: `${deal.receivedAt} 08:40`, label: `Consultation reçue — document « ${deal.document} »` },
  { date: `${deal.receivedAt} 08:41`, label: "Indexation du document par l'agent Marché Privé" },
  ...(deal.status === "À analyser"
    ? []
    : [{ date: `${deal.receivedAt} 09:12`, label: `Analyse IA terminée — ${deal.status}` }]),
];

/** Complète une consultation privée avec sa fiche détaillée. */
export const withDealDetail = (deal: PrivateDeal): PrivateDeal => ({
  ...deal,
  contact: deal.contact ?? `Service achats — ${deal.client}`,
  checklist: deal.checklist ?? privateChecklist(deal),
  history: deal.history ?? privateHistory(deal),
  documentsGenerated: deal.documentsGenerated ?? deal.status === "Correspond",
});


export const initialPrivateDeals: PrivateDeal[] = [
  {
    id: "PRV-2026-041",
    ref: "PRV-2026-041",
    client: "Groupe Chaabi Immobilier",
    clientType: "Promoteurs immobiliers",
    objet: "Levé topographique et plan côté d'un terrain de 4,2 ha à Bouknadel",
    document: "cahier-charges-chaabi.pdf",
    receivedAt: "2026-09-08",
    budget: 210000,
    status: "Correspond",
    justification:
      "Le cahier des charges relève de la topographie classique, la zone (Rabat-Salé-Kénitra) et le type de client (promoteur immobilier) figurent dans vos critères marché privé. Documents types disponibles : attestation de référence, CV IGT, planning type.",
  },
  {
    id: "PRV-2026-042",
    ref: "PRV-2026-042",
    client: "Sté Ciments de l'Atlas",
    clientType: "Entreprises industrielles",
    objet: "Scan 3D lasergrammétrique de la ligne de production de Ben Ahmed",
    document: "consultation-cimat.pdf",
    receivedAt: "2026-09-06",
    budget: 470000,
    status: "À vérifier",
    justification:
      "La prestation correspond à la lasergrammétrie, mais le document ne précise ni le délai d'exécution ni le format de livrables attendu. Une vérification humaine est requise avant chiffrage.",
  },
  {
    id: "PRV-2026-043",
    ref: "PRV-2026-043",
    client: "M. Bennani (particulier)",
    clientType: "Particuliers",
    objet: "Bornage contradictoire d'une parcelle de 1 200 m² à Aïn Aouda",
    document: "demande-bennani.pdf",
    receivedAt: "2026-09-05",
    budget: 18000,
    status: "Correspond",
    justification:
      "Prestation d'expertise immobilière / bornage standard, dans votre zone d'intervention principale. Aucun document manquant.",
  },
  {
    id: "PRV-2026-044",
    ref: "PRV-2026-044",
    client: "Atlantic Steel Industries",
    clientType: "Entreprises industrielles",
    objet: "Étude géotechnique et sondages de sol d'une plateforme logistique",
    document: "appel-atlantic-steel.pdf",
    receivedAt: "2026-09-04",
    budget: 320000,
    status: "Ne correspond pas",
    justification:
      "La prestation demandée est une étude géotechnique (sondages, essais de laboratoire) qui ne fait pas partie des catégories de service d'INGETO.",
  },
  {
    id: "PRV-2026-045",
    ref: "PRV-2026-045",
    client: "Résidences Al Boustane",
    clientType: "Promoteurs immobiliers",
    objet: "Photogrammétrie drone mensuelle d'un chantier de 320 logements",
    document: "cdc-al-boustane.pdf",
    receivedAt: "2026-09-02",
    budget: 260000,
    status: "À analyser",
    justification: "",
  },
  {
    id: "PRV-2026-046",
    ref: "PRV-2026-046",
    client: "Cabinet Notarial Alaoui",
    clientType: "Particuliers",
    objet: "Expertise de valeur de 3 villas à Harhoura",
    document: "mission-notaire-alaoui.pdf",
    receivedAt: "2026-08-30",
    budget: 42000,
    status: "À analyser",
    justification: "",
  },
  {
    id: "PRV-2026-047",
    ref: "PRV-2026-047",
    client: "Marina Bouregreg SA",
    clientType: "Entreprises industrielles",
    objet: "Bathymétrie du plan d'eau et du quai de plaisance",
    document: "consultation-marina.pdf",
    receivedAt: "2026-08-28",
    budget: 380000,
    status: "Correspond",
    justification:
      "Bathymétrie : catégorie couverte, matériel disponible (sondeur multifaisceaux), zone Rabat-Salé. Références comparables : ONEE, Commune d'Agadir.",
  },
  {
    id: "PRV-2026-048",
    ref: "PRV-2026-048",
    client: "Immo Zaër Promotion",
    clientType: "Promoteurs immobiliers",
    objet: "Plan de lotissement et implantation de 74 lots à Sidi Yahya Zaër",
    document: "dossier-immo-zaer.pdf",
    receivedAt: "2026-08-26",
    budget: 195000,
    status: "À vérifier",
    justification:
      "Le dossier ne comporte pas le plan d'aménagement approuvé, pièce indispensable pour cadrer l'implantation. À réclamer au client.",
  },
];

/* ---------------- Brigades ---------------- */

export type BrigadeStatus = "Active" | "En intervention" | "Sans nouvelles";

export type BrigadeMember = { name: string; role: string };
export type BrigadeEquipment = {
  name: string;
  serial: string;
  state: "Opérationnel" | "En maintenance" | "À étalonner";
};
export type BrigadeReport = { date: string; text: string; author: string };
export type BrigadeComm = {
  date: string;
  kind: "Rapport" | "Relance" | "Appel" | "Mission" | "Message";
  text: string;
};
export type BrigadeMission = {
  ref: string;
  chantier: string;
  client: string;
  start: string;
  end: string;
  delivered: string;
};

export type Brigade = {
  id: string;
  name: string;
  chef: string;
  phone: string;
  zone: string;
  location: string;
  coords: string;
  status: BrigadeStatus;
  marketRef?: string;
  chantier: string;
  progress: number;
  lastReportDate: string;
  daysSinceReport: number;
  lastReport: string;
  relanceSentAt?: string;
  members: BrigadeMember[];
  equipment: BrigadeEquipment[];
  reports: BrigadeReport[];
  comms: BrigadeComm[];
  missions: BrigadeMission[];
  perf: { punctuality: number; reportRate: number; avgDelay: number; missionsYear: number };
};

export const initialBrigades: Brigade[] = [
  {
    id: "BRG-N",
    name: "Brigade Nord — Rabat-Kénitra",
    chef: "Y. Ouazzani",
    phone: "+212 661 24 18 07",
    zone: "Rabat-Salé-Kénitra",
    location: "Kénitra – Sidi Kacem (PK 12+400)",
    coords: "34.2610° N, -6.5802° O",
    status: "En intervention",
    marketRef: "AO-2026-ONCF-207",
    chantier: "Levé du tracé ferroviaire Kénitra – Sidi Kacem",
    progress: 62,
    lastReportDate: "2026-09-10",
    daysSinceReport: 0,
    lastReport:
      "8,4 km de tracé levés, 320 points GNSS RTK rattachés au réseau national. Zone marécageuse au PK 9 à retraiter.",
    members: [
      { name: "Y. Ouazzani", role: "Chef de brigade — IGT" },
      { name: "R. Sekkat", role: "Opérateur station totale" },
      { name: "K. Zniber", role: "Aide-topographe" },
      { name: "N. Filali", role: "Technicien DAO terrain" },
    ],
    equipment: [
      { name: "Station totale Leica TS16", serial: "TS16-4412", state: "Opérationnel" },
      { name: "GNSS RTK Leica GS18", serial: "GS18-2201", state: "Opérationnel" },
      { name: "Véhicule 4x4 Hilux", serial: "12345-A-6", state: "Opérationnel" },
      { name: "Niveau numérique DNA03", serial: "DNA-0917", state: "À étalonner" },
    ],
    reports: [
      {
        date: "2026-09-10",
        author: "Y. Ouazzani",
        text: "8,4 km levés, 320 points GNSS rattachés. Zone marécageuse PK 9 à retraiter au prochain passage.",
      },
      {
        date: "2026-09-06",
        author: "Y. Ouazzani",
        text: "Reconnaissance du tracé PK 0 à PK 12 terminée, implantation de 14 repères de calage.",
      },
      {
        date: "2026-09-02",
        author: "R. Sekkat",
        text: "Installation du campement de chantier, contrôle du rattachement au réseau national validé.",
      },
    ],
    comms: [
      { date: "2026-09-10 17:42", kind: "Rapport", text: "Rapport de terrain reçu (8,4 km levés)." },
      { date: "2026-09-08 09:15", kind: "Appel", text: "Point d'avancement téléphonique avec la direction." },
      { date: "2026-09-01 08:00", kind: "Mission", text: "Affectation au dossier AO-2026-ONCF-207." },
    ],
    missions: [
      {
        ref: "AO-2025-ADM-118",
        chantier: "Levé autoroutier Rabat – Kénitra",
        client: "ADM",
        start: "2025-11-04",
        end: "2026-01-28",
        delivered: "Plans DWG + rapport IGT",
      },
      {
        ref: "PRV-2025-088",
        chantier: "Bornage lotissement Bouknadel",
        client: "Groupe Chaabi Immobilier",
        start: "2025-09-08",
        end: "2025-10-17",
        delivered: "PV de bornage contradictoire",
      },
    ],
    perf: { punctuality: 94, reportRate: 96, avgDelay: 1.4, missionsYear: 9 },
  },
  {
    id: "BRG-C",
    name: "Brigade Casablanca-Settat",
    chef: "H. El Amrani",
    phone: "+212 662 71 40 33",
    zone: "Casablanca-Settat",
    location: "Jorf Lasfar – complexe OCP",
    coords: "33.1180° N, -8.6180° O",
    status: "Active",
    marketRef: "AO-2026-OCP-089",
    chantier: "Scan 3D lasergrammétrique du complexe de traitement",
    progress: 64,
    lastReportDate: "2026-09-09",
    daysSinceReport: 1,
    lastReport:
      "14 stations de scan réalisées sur 22, recouvrement conforme. Nuage brut de 41 Go transféré au bureau d'études.",
    members: [
      { name: "H. El Amrani", role: "Chef de brigade — IGT" },
      { name: "T. Lahlou", role: "Opérateur scanner 3D" },
      { name: "A. Chraibi", role: "Technicien nuage de points" },
    ],
    equipment: [
      { name: "Scanner Leica RTC360", serial: "RTC-8830", state: "Opérationnel" },
      { name: "GNSS RTK Trimble R12", serial: "R12-5541", state: "Opérationnel" },
      { name: "Station totale Leica TS16", serial: "TS16-4419", state: "En maintenance" },
    ],
    reports: [
      {
        date: "2026-09-09",
        author: "H. El Amrani",
        text: "14 stations de scan sur 22, recouvrement conforme. Nuage brut 41 Go transféré.",
      },
      {
        date: "2026-09-05",
        author: "T. Lahlou",
        text: "Cibles de calage posées sur la ligne de traitement, autorisation HSE obtenue.",
      },
    ],
    comms: [
      { date: "2026-09-09 18:05", kind: "Rapport", text: "Rapport de terrain reçu (14/22 stations)." },
      { date: "2026-09-04 11:20", kind: "Message", text: "Consignes HSE du maître d'ouvrage transmises." },
      { date: "2026-08-28 08:00", kind: "Mission", text: "Affectation au dossier AO-2026-OCP-089." },
    ],
    missions: [
      {
        ref: "AO-2025-OCP-054",
        chantier: "Scan 3D atelier de maintenance Khouribga",
        client: "OCP",
        start: "2025-06-02",
        end: "2025-08-14",
        delivered: "Nuage E57 + maquette BIM",
      },
    ],
    perf: { punctuality: 91, reportRate: 92, avgDelay: 1.8, missionsYear: 7 },
  },
  {
    id: "BRG-RT",
    name: "Brigade Rabat-Témara",
    chef: "S. Bouhaddou",
    phone: "+212 663 08 55 12",
    zone: "Rabat-Salé-Kénitra",
    location: "Témara – terrains communaux secteur 3",
    coords: "33.9280° N, -6.9060° O",
    status: "Active",
    marketRef: "AO-2026-CT-TEM-023",
    chantier: "Bornage et délimitation de terrains communaux",
    progress: 78,
    lastReportDate: "2026-09-08",
    daysSinceReport: 2,
    lastReport: "112 bornes implantées, PV de bornage contradictoire signé par 3 riverains.",
    members: [
      { name: "S. Bouhaddou", role: "Chef de brigade — IGT" },
      { name: "M. Idrissi", role: "Opérateur station totale" },
      { name: "O. Baddou", role: "Aide-topographe" },
    ],
    equipment: [
      { name: "Station totale Topcon GT-1200", serial: "GT-7712", state: "Opérationnel" },
      { name: "GNSS RTK Leica GS18", serial: "GS18-2208", state: "Opérationnel" },
    ],
    reports: [
      {
        date: "2026-09-08",
        author: "S. Bouhaddou",
        text: "112 bornes implantées, PV contradictoire signé par 3 riverains présents.",
      },
      {
        date: "2026-09-03",
        author: "S. Bouhaddou",
        text: "Convocation des riverains effectuée avec la commune, 2 parcelles litigieuses signalées.",
      },
    ],
    comms: [
      { date: "2026-09-08 16:30", kind: "Rapport", text: "Rapport de terrain reçu (112 bornes)." },
      { date: "2026-09-02 10:05", kind: "Appel", text: "Coordination avec le service technique communal." },
    ],
    missions: [
      {
        ref: "AO-2025-CT-TEM-011",
        chantier: "Plan de restructuration du quartier Al Wifak",
        client: "Commune de Témara",
        start: "2025-10-01",
        end: "2025-12-19",
        delivered: "Plans côtés + couche SIG",
      },
    ],
    perf: { punctuality: 97, reportRate: 98, avgDelay: 1.1, missionsYear: 11 },
  },
  {
    id: "BRG-S",
    name: "Brigade Sud — Marrakech-Agadir",
    chef: "A. Aït Baha",
    phone: "+212 665 33 92 47",
    zone: "Souss-Massa / Marrakech-Safi",
    location: "Agadir – port de plaisance",
    coords: "30.4200° N, -9.6100° O",
    status: "Sans nouvelles",
    marketRef: "AO-2026-CT-AGD-009",
    chantier: "Bathymétrie du port de plaisance et du chenal",
    progress: 34,
    lastReportDate: "2026-09-02",
    daysSinceReport: 8,
    lastReport: "Reconnaissance du chenal effectuée, sondeur en cours d'étalonnage.",
    members: [
      { name: "A. Aït Baha", role: "Chef de brigade — IGT" },
      { name: "L. Boukhris", role: "Hydrographe" },
      { name: "F. Ouhssaine", role: "Pilote d'embarcation" },
    ],
    equipment: [
      { name: "Sondeur multifaisceaux R2Sonic", serial: "R2S-3390", state: "À étalonner" },
      { name: "Centrale inertielle Applanix", serial: "APX-1180", state: "Opérationnel" },
      { name: "Embarcation hydrographique", serial: "HYD-02", state: "Opérationnel" },
    ],
    reports: [
      {
        date: "2026-09-02",
        author: "A. Aït Baha",
        text: "Reconnaissance du chenal effectuée, sondeur multifaisceaux en cours d'étalonnage sur zone de référence.",
      },
    ],
    comms: [
      { date: "2026-09-02 15:10", kind: "Rapport", text: "Dernier rapport de terrain reçu." },
      { date: "2026-08-24 08:00", kind: "Mission", text: "Affectation au dossier AO-2026-CT-AGD-009." },
    ],
    missions: [
      {
        ref: "AO-2025-ANP-076",
        chantier: "Bathymétrie du port de pêche de Sidi Ifni",
        client: "Agence Nationale des Ports",
        start: "2025-05-12",
        end: "2025-07-30",
        delivered: "MNT bathymétrique + rapport",
      },
    ],
    perf: { punctuality: 78, reportRate: 71, avgDelay: 4.6, missionsYear: 6 },
  },
  {
    id: "BRG-O",
    name: "Brigade Est — Fès-Oujda",
    chef: "M. Berrada",
    phone: "+212 667 15 60 84",
    zone: "Fès-Meknès / Oriental",
    location: "Oujda – couloir lignes HT",
    coords: "34.6810° N, -1.9110° O",
    status: "Sans nouvelles",
    marketRef: "AO-2026-ONEE-131",
    chantier: "Relevé des servitudes de lignes haute tension",
    progress: 41,
    lastReportDate: "2026-09-03",
    daysSinceReport: 7,
    lastReport: "Premier tronçon de 18 km relevé, accès difficile sur le secteur de Taourirt.",
    members: [
      { name: "M. Berrada", role: "Chef de brigade — IGT" },
      { name: "H. Ammari", role: "Opérateur GNSS" },
      { name: "S. Kabbaj", role: "Aide-topographe" },
    ],
    equipment: [
      { name: "GNSS RTK Trimble R12", serial: "R12-5548", state: "Opérationnel" },
      { name: "Drone DJI M300 RTK", serial: "M300-0442", state: "En maintenance" },
      { name: "Véhicule 4x4 Land Cruiser", serial: "67890-B-5", state: "Opérationnel" },
    ],
    reports: [
      {
        date: "2026-09-03",
        author: "M. Berrada",
        text: "Premier tronçon de 18 km relevé. Accès difficile secteur Taourirt, appui d'un guide local nécessaire.",
      },
    ],
    comms: [
      { date: "2026-09-03 17:55", kind: "Rapport", text: "Dernier rapport de terrain reçu." },
      { date: "2026-08-30 09:40", kind: "Message", text: "Autorisation de survol ONEE transmise à la brigade." },
    ],
    missions: [
      {
        ref: "AO-2025-ONEE-091",
        chantier: "Relevé de servitudes ligne 225 kV Fès – Taza",
        client: "ONEE - Branche Électricité",
        start: "2025-04-07",
        end: "2025-06-25",
        delivered: "Plans de servitude + SIG",
      },
    ],
    perf: { punctuality: 82, reportRate: 76, avgDelay: 3.9, missionsYear: 8 },
  },
];

/* ---------------- Facturation & décomptes ---------------- */

export const TVA_RATE = 0.2;
export const RETENUE_GARANTIE_RATE = 0.07;

export type InvoiceStatus = "Brouillon" | "Émis" | "Payé";

export type InvoiceUnit = {
  label: string;
  unit: string;
  qty: number;
  unitPrice: number;
  progress: number;
};

export type Invoice = {
  id: string;
  ref: string;
  decompteNo: number;
  marketRef: string;
  client: string;
  period: string;
  units: InvoiceUnit[];
  amount: number;
  status: InvoiceStatus;
  issuedAt?: string;
  paidAt?: string;
  dueAt?: string;
  history: { date: string; label: string }[];
};

const total = (u: InvoiceUnit[]) => u.reduce((s, x) => s + x.qty * x.unitPrice, 0);

/** Montants réglementaires d'un décompte : HT, TVA 20 %, retenue de garantie 7 %. */
export const invoiceTotals = (inv: Invoice) => {
  const ht = inv.amount;
  const tva = ht * TVA_RATE;
  const ttc = ht + tva;
  const retenue = ht * RETENUE_GARANTIE_RATE;
  return { ht, tva, ttc, retenue, net: ttc - retenue };
};

const mk = (
  ref: string,
  decompteNo: number,
  marketRef: string,
  client: string,
  period: string,
  units: InvoiceUnit[],
  status: InvoiceStatus,
  dates: { issuedAt?: string; paidAt?: string; dueAt?: string } = {},
): Invoice => ({
  id: ref,
  ref,
  decompteNo,
  marketRef,
  client,
  period,
  units,
  amount: total(units),
  status,
  ...dates,
  history: [
    { date: "2026-09-01 09:10", label: `Décompte n° ${decompteNo} créé en brouillon` },
    ...(dates.issuedAt ? [{ date: `${dates.issuedAt} 11:30`, label: "Décompte émis au maître d'ouvrage" }] : []),
    ...(dates.paidAt ? [{ date: `${dates.paidAt} 14:05`, label: "Encaissement constaté" }] : []),
  ],
});

export const initialInvoices: Invoice[] = [
  mk(
    "DEC-2026-031",
    4,
    "AO-2026-ONCF-207",
    "ONCF",
    "Août 2026",
    [
      { label: "Km de tracé levé", unit: "km", qty: 18, unitPrice: 42000, progress: 72 },
      { label: "Point GNSS rattaché", unit: "point", qty: 640, unitPrice: 180, progress: 68 },
      { label: "Plan DWG livré", unit: "plan", qty: 12, unitPrice: 3200, progress: 60 },
    ],
    "Payé",
    { issuedAt: "2026-09-02", paidAt: "2026-09-09", dueAt: "2026-10-02" },
  ),
  mk(
    "DEC-2026-032",
    2,
    "AO-2026-OCP-089",
    "OCP",
    "Août 2026",
    [
      { label: "Station de scan 3D", unit: "station", qty: 22, unitPrice: 9800, progress: 64 },
      { label: "Traitement nuage de points", unit: "jour", qty: 9, unitPrice: 4600, progress: 45 },
    ],
    "Émis",
    { issuedAt: "2026-09-03", dueAt: "2026-10-03" },
  ),
  mk(
    "DEC-2026-033",
    3,
    "AO-2026-CT-TEM-023",
    "Commune de Témara",
    "Août 2026",
    [
      { label: "Borne implantée", unit: "borne", qty: 340, unitPrice: 420, progress: 78 },
      { label: "PV de bornage", unit: "PV", qty: 14, unitPrice: 1800, progress: 70 },
    ],
    "Émis",
    { issuedAt: "2026-09-04", dueAt: "2026-10-04" },
  ),
  mk(
    "DEC-2026-034",
    5,
    "AO-2026-ADM-031",
    "ADM (Autoroutes du Maroc)",
    "Juillet 2026",
    [
      { label: "Vol drone", unit: "hectare", qty: 260, unitPrice: 950, progress: 88 },
      { label: "Orthophoto 5 cm/px", unit: "hectare", qty: 260, unitPrice: 380, progress: 82 },
    ],
    "Payé",
    { issuedAt: "2026-08-05", paidAt: "2026-08-28", dueAt: "2026-09-05" },
  ),
  mk(
    "DEC-2026-035",
    1,
    "AO-2026-AURB-014",
    "Agence Urbaine de Kénitra",
    "Août 2026",
    [
      { label: "Vol photogrammétrique", unit: "km²", qty: 34, unitPrice: 21000, progress: 40 },
      { label: "Aérotriangulation", unit: "bloc", qty: 3, unitPrice: 48000, progress: 33 },
    ],
    "Brouillon",
  ),
  mk(
    "DEC-2026-036",
    6,
    "AO-2026-ONEE-118",
    "ONEE - Branche Eau",
    "Juillet 2026",
    [
      { label: "Profil bathymétrique", unit: "km", qty: 46, unitPrice: 6800, progress: 90 },
      { label: "MNT bathymétrique", unit: "unité", qty: 2, unitPrice: 34000, progress: 100 },
    ],
    "Payé",
    { issuedAt: "2026-08-02", paidAt: "2026-08-21", dueAt: "2026-09-02" },
  ),
  mk(
    "DEC-2026-037",
    1,
    "AO-2026-CDG-052",
    "CDG Développement",
    "Août 2026",
    [
      { label: "Lot implanté", unit: "lot", qty: 86, unitPrice: 1350, progress: 43 },
      { label: "Plan d'implantation", unit: "plan", qty: 4, unitPrice: 7400, progress: 50 },
    ],
    "Brouillon",
  ),
  mk(
    "DEC-2026-038",
    2,
    "AO-2026-ANCFCC-014",
    "ANCFCC",
    "Août 2026",
    [
      { label: "Hectare cadastré", unit: "hectare", qty: 1800, unitPrice: 720, progress: 55 },
      { label: "Couche SIG livrée", unit: "couche", qty: 6, unitPrice: 12500, progress: 60 },
    ],
    "Émis",
    { issuedAt: "2026-09-05", dueAt: "2026-10-05" },
  ),
];

export const invoiceUnitTemplates: Record<string, InvoiceUnit[]> = {
  "AO-2026-ONCF-207": [
    { label: "Km de tracé levé", unit: "km", qty: 11, unitPrice: 42000, progress: 62 },
    { label: "Point GNSS rattaché", unit: "point", qty: 380, unitPrice: 180, progress: 58 },
  ],
  "AO-2026-OCP-089": [
    { label: "Station de scan 3D", unit: "station", qty: 8, unitPrice: 9800, progress: 64 },
    { label: "Traitement nuage de points", unit: "jour", qty: 5, unitPrice: 4600, progress: 48 },
  ],
  "AO-2026-CT-TEM-023": [
    { label: "Borne implantée", unit: "borne", qty: 128, unitPrice: 420, progress: 78 },
    { label: "PV de bornage", unit: "PV", qty: 6, unitPrice: 1800, progress: 65 },
  ],
  "AO-2026-CT-AGD-009": [
    { label: "Profil bathymétrique", unit: "km", qty: 22, unitPrice: 6800, progress: 34 },
    { label: "Sondage de contrôle", unit: "sondage", qty: 40, unitPrice: 640, progress: 30 },
  ],
};

/** Historique facturé / encaissé des six derniers mois (MAD HT). */
export const billingMonths = [
  { month: "Avr.", facture: 1240000, encaisse: 1180000 },
  { month: "Mai", facture: 1620000, encaisse: 1410000 },
  { month: "Juin", facture: 1385000, encaisse: 1330000 },
  { month: "Juil.", facture: 1890000, encaisse: 1520000 },
  { month: "Août", facture: 2310000, encaisse: 1740000 },
  { month: "Sept.", facture: 1460000, encaisse: 620000 },
];


export const fmtMAD = (n: number) =>
  `${n.toLocaleString("fr-MA", { maximumFractionDigits: 0 })} MAD`;

export const fmtDate = (d: string) => {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
};
