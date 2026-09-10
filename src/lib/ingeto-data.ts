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

const req = (cat: Category): Requirement[] => [
  {
    label: "Attestation de qualification et classification",
    detail: `Le CPS exige une qualification en ${cat} de classe 2 minimum, en cours de validité.`,
    resources: "Ingénieur géomètre topographe (IGT) assermenté + attestation OIGT",
  },
  {
    label: "Moyens matériels dédiés",
    detail: "Station totale robotisée, GNSS RTK, et pour les levés spéciaux drone certifié.",
    resources: "2 stations Leica TS16, 3 récepteurs GNSS, drone DJI M300 RTK",
  },
  {
    label: "Références de prestations similaires (3 ans)",
    detail: "Trois attestations de bonne exécution de prestations de nature comparable.",
    resources: "Portefeuille INGETO : ANCFCC, ONCF, OCP",
  },
  {
    label: "Délai d'exécution et planning détaillé",
    detail: "Planning en phases avec jalons de remise des livrables et rapport hebdomadaire.",
    resources: "Brigade dédiée + chef de projet",
  },
  {
    label: "Livrables et formats numériques",
    detail: "Plans DWG géoréférencés Lambert Maroc, nuages de points E57, rapport PDF signé.",
    resources: "Cellule bureau d'études (3 techniciens DAO)",
  },
];

const checklist = (complete: boolean) => [
  { label: "Déclaration sur l'honneur", done: true },
  { label: "Attestation fiscale et CNSS", done: true },
  { label: "Registre de commerce (modèle J)", done: true },
  { label: "Certificat de qualification", done: complete },
  { label: "Références techniques (3 attestations)", done: true },
  { label: "Exigences du CPS couvertes", done: complete },
  { label: "Bordereau des prix renseigné", done: complete },
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
  `Le portail publie un marché de ${s.category.toLowerCase()} porté par ${s.client}, portant sur ${s.objet.toLowerCase()}. Budget estimatif de ${s.budget.toLocaleString("fr-MA")} MAD, zone d'exécution : ${s.zone}. L'agent IA estime la correspondance avec les capacités d'INGETO à un niveau élevé : qualification requise détenue, moyens matériels disponibles, et références comparables mobilisables.`;

const stepIndex = (s: MarketStatus) => MARKET_STEPS.indexOf(s);

export function buildMarket(s: Seed, index: number): PublicMarket {
  const idx = stepIndex(s.status);
  const partial = index % 5 === 2;
  return {
    id: s.ref,
    ref: s.ref,
    client: s.client,
    objet: s.objet,
    category: s.category,
    budget: s.budget,
    deadline: s.deadline,
    zone: s.zone,
    status: s.status,
    partialInfo: partial,
    summary: summaryOf(s),
    requirements: req(s.category),
    checklist: checklist(idx >= 2),
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
};

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

export type Brigade = {
  id: string;
  name: string;
  chef: string;
  location: string;
  status: BrigadeStatus;
  marketRef?: string;
  chantier: string;
  lastReportDate: string;
  daysSinceReport: number;
  lastReport: string;
  relanceSentAt?: string;
};

export const initialBrigades: Brigade[] = [
  {
    id: "BRG-N",
    name: "Brigade Nord",
    chef: "Y. Ouazzani",
    location: "Kénitra – Sidi Kacem (PK 12+400)",
    status: "En intervention",
    marketRef: "AO-2026-ONCF-207",
    chantier: "Levé du tracé ferroviaire Kénitra – Sidi Kacem",
    lastReportDate: "2026-09-10",
    daysSinceReport: 0,
    lastReport:
      "8,4 km de tracé levés, 320 points GNSS RTK rattachés au réseau national. Zone marécageuse au PK 9 à retraiter.",
  },
  {
    id: "BRG-C",
    name: "Brigade Casablanca",
    chef: "H. El Amrani",
    location: "Jorf Lasfar – complexe OCP",
    status: "Active",
    marketRef: "AO-2026-OCP-089",
    chantier: "Scan 3D lasergrammétrique du complexe de traitement",
    lastReportDate: "2026-09-09",
    daysSinceReport: 1,
    lastReport:
      "14 stations de scan réalisées sur 22, recouvrement conforme. Nuage brut de 41 Go transféré au bureau d'études.",
  },
  {
    id: "BRG-RT",
    name: "Brigade Rabat-Témara",
    chef: "S. Bouhaddou",
    location: "Témara – terrains communaux secteur 3",
    status: "Active",
    marketRef: "AO-2026-CT-TEM-023",
    chantier: "Bornage et délimitation de terrains communaux",
    lastReportDate: "2026-09-08",
    daysSinceReport: 2,
    lastReport: "112 bornes implantées, PV de bornage contradictoire signé par 3 riverains.",
  },
  {
    id: "BRG-S",
    name: "Brigade Sud",
    chef: "A. Aït Baha",
    location: "Agadir – port de plaisance",
    status: "Sans nouvelles",
    marketRef: "AO-2026-CT-AGD-009",
    chantier: "Bathymétrie du port de plaisance et du chenal",
    lastReportDate: "2026-09-02",
    daysSinceReport: 8,
    lastReport: "Reconnaissance du chenal effectuée, sondeur en cours d'étalonnage.",
  },
  {
    id: "BRG-O",
    name: "Brigade Oriental",
    chef: "M. Berrada",
    location: "Oujda – couloir lignes HT",
    status: "Sans nouvelles",
    marketRef: "AO-2026-ONEE-131",
    chantier: "Relevé des servitudes de lignes haute tension",
    lastReportDate: "2026-09-03",
    daysSinceReport: 7,
    lastReport: "Premier tronçon de 18 km relevé, accès difficile sur le secteur de Taourirt.",
  },
];

/* ---------------- Facturation ---------------- */

export type InvoiceStatus = "Brouillon" | "Émis" | "Payé";

export type Invoice = {
  id: string;
  ref: string;
  marketRef: string;
  client: string;
  period: string;
  units: { label: string; qty: number; unitPrice: number }[];
  amount: number;
  status: InvoiceStatus;
};

const total = (u: Invoice["units"]) => u.reduce((s, x) => s + x.qty * x.unitPrice, 0);

const mk = (
  ref: string,
  marketRef: string,
  client: string,
  period: string,
  units: Invoice["units"],
  status: InvoiceStatus,
): Invoice => ({ id: ref, ref, marketRef, client, period, units, amount: total(units), status });

export const initialInvoices: Invoice[] = [
  mk(
    "DEC-2026-031",
    "AO-2026-ONCF-207",
    "ONCF",
    "Août 2026",
    [
      { label: "Km de tracé levé", qty: 18, unitPrice: 42000 },
      { label: "Point GNSS rattaché", qty: 640, unitPrice: 180 },
      { label: "Plan DWG livré", qty: 12, unitPrice: 3200 },
    ],
    "Payé",
  ),
  mk(
    "DEC-2026-032",
    "AO-2026-OCP-089",
    "OCP",
    "Août 2026",
    [
      { label: "Station de scan 3D", qty: 22, unitPrice: 9800 },
      { label: "Traitement nuage de points (jour)", qty: 9, unitPrice: 4600 },
    ],
    "Émis",
  ),
  mk(
    "DEC-2026-033",
    "AO-2026-CT-TEM-023",
    "Commune de Témara",
    "Août 2026",
    [
      { label: "Borne implantée", qty: 340, unitPrice: 420 },
      { label: "PV de bornage", qty: 14, unitPrice: 1800 },
    ],
    "Émis",
  ),
  mk(
    "DEC-2026-034",
    "AO-2026-ADM-031",
    "ADM (Autoroutes du Maroc)",
    "Juillet 2026",
    [
      { label: "Vol drone (hectare)", qty: 260, unitPrice: 950 },
      { label: "Orthophoto 5 cm/px (ha)", qty: 260, unitPrice: 380 },
    ],
    "Payé",
  ),
  mk(
    "DEC-2026-035",
    "AO-2026-AURB-014",
    "Agence Urbaine de Kénitra",
    "Août 2026",
    [
      { label: "Vol photogrammétrique (km²)", qty: 34, unitPrice: 21000 },
      { label: "Aérotriangulation (bloc)", qty: 3, unitPrice: 48000 },
    ],
    "Brouillon",
  ),
  mk(
    "DEC-2026-036",
    "AO-2026-ONEE-118",
    "ONEE - Branche Eau",
    "Juillet 2026",
    [
      { label: "Profil bathymétrique (km)", qty: 46, unitPrice: 6800 },
      { label: "MNT bathymétrique (unité)", qty: 2, unitPrice: 34000 },
    ],
    "Payé",
  ),
  mk(
    "DEC-2026-037",
    "AO-2026-CDG-052",
    "CDG Développement",
    "Août 2026",
    [
      { label: "Lot implanté", qty: 86, unitPrice: 1350 },
      { label: "Plan d'implantation", qty: 4, unitPrice: 7400 },
    ],
    "Brouillon",
  ),
  mk(
    "DEC-2026-038",
    "AO-2026-ANCFCC-014",
    "ANCFCC",
    "Août 2026",
    [
      { label: "Hectare cadastré", qty: 1800, unitPrice: 720 },
      { label: "Couche SIG livrée", qty: 6, unitPrice: 12500 },
    ],
    "Émis",
  ),
];

export const invoiceUnitTemplates: Record<string, Invoice["units"]> = {
  "AO-2026-ONCF-207": [
    { label: "Km de tracé levé", qty: 11, unitPrice: 42000 },
    { label: "Point GNSS rattaché", qty: 380, unitPrice: 180 },
  ],
  "AO-2026-OCP-089": [
    { label: "Station de scan 3D", qty: 8, unitPrice: 9800 },
    { label: "Traitement nuage de points (jour)", qty: 5, unitPrice: 4600 },
  ],
  "AO-2026-CT-TEM-023": [
    { label: "Borne implantée", qty: 128, unitPrice: 420 },
    { label: "PV de bornage", qty: 6, unitPrice: 1800 },
  ],
  "AO-2026-CT-AGD-009": [
    { label: "Profil bathymétrique (km)", qty: 22, unitPrice: 6800 },
    { label: "Sondage de contrôle", qty: 40, unitPrice: 640 },
  ],
};

export const fmtMAD = (n: number) =>
  `${n.toLocaleString("fr-MA", { maximumFractionDigits: 0 })} MAD`;

export const fmtDate = (d: string) => {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
};
