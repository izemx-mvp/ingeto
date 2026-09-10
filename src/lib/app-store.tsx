import { createContext, useCallback, useEffect, useContext, useMemo, useState, type ReactNode } from "react";
import {
  CATEGORIES,
  MARKET_STEPS,
  buildMarket,
  candidatePool,
  initialBrigades,
  initialInvoices,
  initialPrivateDeals,
  initialPublicMarkets,
  invoiceUnitTemplates,
  withDealDetail,
  type Brigade,
  type Category,
  type Invoice,
  type InvoiceStatus,
  type InvoiceUnit,
  type PrivateDeal,
  type PrivateStatus,
  type PublicMarket,
} from "./ingeto-data";


export type Config = {
  categories: Category[];
  zones: string[];
  budgetMin: number;
  budgetMax: number;
  keywordsInclude: string[];
  keywordsExclude: string[];
  capabilities: string[];
  clientTypes: string[];
  docTypes: string[];
};

export const CAPABILITIES = [
  "IGT assermenté (OIGT)",
  "Qualification classe 2 – topographie",
  "Drone certifié DGAC",
  "Scanner 3D Leica RTC360",
  "Sondeur multifaisceaux",
  "Licence Revit / BIM",
  "Certification ISO 9001",
];

export const CLIENT_TYPES = [
  "Promoteurs immobiliers",
  "Particuliers",
  "Entreprises industrielles",
];

export type Activity = { id: string; label: string; time: string; unread: boolean };

const initialActivity: Activity[] = [
  {
    id: "a1",
    label: "Agent Marché Public a identifié 4 nouveaux appels d'offres correspondant à vos critères",
    time: "il y a 20 min",
    unread: true,
  },
  {
    id: "a2",
    label: "Agent Vérification a détecté une pièce manquante sur AO-2026-OCP-089",
    time: "il y a 55 min",
    unread: true,
  },
  {
    id: "a3",
    label: "Brigade Nord a remonté son rapport de terrain",
    time: "il y a 2h",
    unread: true,
  },
  {
    id: "a4",
    label: "Agent Documents a généré le mémoire technique de AO-2026-ADM-031",
    time: "il y a 5h",
    unread: false,
  },
  {
    id: "a5",
    label: "Agent Marché Privé a analysé la consultation de Marina Bouregreg SA — correspond",
    time: "hier, 17:42",
    unread: false,
  },
  {
    id: "a6",
    label: "Agent Facturation a calculé le décompte d'août pour l'ONCF (DEC-2026-031)",
    time: "hier, 09:15",
    unread: false,
  },
];

type Store = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
  configValidated: boolean;
  saveConfig: () => void;
  markets: PublicMarket[];
  runVeille: () => PublicMarket[];
  advanceMarket: (ref: string) => void;
  markManuallyCompleted: (ref: string) => void;
  generateDocuments: (ref: string) => void;
  clearNewFlags: () => void;
  deals: PrivateDeal[];
  importDeal: (fileName: string) => void;
  analyseDeal: (id: string) => PrivateStatus;
  generateDealDocuments: (id: string) => void;
  toggleDealCheck: (id: string, index: number) => void;
  brigades: Brigade[];
  relanceBrigade: (id: string, message?: string) => void;
  assignMission: (id: string, marketRef: string, chantier: string) => void;
  invoices: Invoice[];
  generateDecompte: () => Invoice;
  setInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  activity: Activity[];
  markActivityRead: () => void;
  pushActivity: (label: string) => void;
};


const StoreContext = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [config, setConfig] = useState<Config>({
    categories: [...CATEGORIES],
    zones: ["Rabat-Salé-Kénitra", "Casablanca-Settat"],
    budgetMin: 400000,
    budgetMax: 5000000,
    keywordsInclude: ["levé topographique", "bornage", "scan 3D"],
    keywordsExclude: ["géotechnique", "forage"],
    capabilities: CAPABILITIES.slice(0, 5),
    clientTypes: [...CLIENT_TYPES],
    docTypes: [
      "Attestation de référence",
      "CV de l'ingénieur géomètre topographe",
      "Planning type d'exécution",
      "Bordereau de prix unitaires",
    ],
  });
  const [configValidated, setConfigValidated] = useState(false);
  const [markets, setMarkets] = useState<PublicMarket[]>(initialPublicMarkets);
  const [deals, setDeals] = useState<PrivateDeal[]>(() =>
    initialPrivateDeals.map(withDealDetail),
  );

  const [brigades, setBrigades] = useState<Brigade[]>(initialBrigades);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [activity, setActivity] = useState<Activity[]>(initialActivity);

  // La session conserve la configuration et l'état de la sidebar entre les rechargements.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ingeto-session");
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        config?: Config;
        configValidated?: boolean;
        sidebarCollapsed?: boolean;
      };
      if (saved.config) setConfig(saved.config);
      if (saved.configValidated) setConfigValidated(true);
      if (saved.sidebarCollapsed) setSidebarCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        "ingeto-session",
        JSON.stringify({ config, configValidated, sidebarCollapsed }),
      );
    } catch {
      /* ignore */
    }
  }, [config, configValidated, sidebarCollapsed]);


  const pushActivity = useCallback((label: string) => {
    setActivity((prev) => [
      { id: `${Date.now()}-${Math.random()}`, label, time: "à l'instant", unread: true },
      ...prev,
    ]);
  }, []);

  const saveConfig = useCallback(() => setConfigValidated(true), []);
  const toggleSidebar = useCallback(() => setSidebarCollapsed((c) => !c), []);

  const runVeille = useCallback((): PublicMarket[] => {
    const existing = new Set(markets.map((m) => m.ref));
    const eligible = candidatePool.filter((c) => {
      if (existing.has(c.ref)) return false;
      if (!config.categories.includes(c.category)) return false;
      if (config.zones.length > 0 && !config.zones.includes(c.zone)) return false;
      if (c.budget < config.budgetMin || c.budget > config.budgetMax) return false;
      const text = `${c.objet} ${c.category}`.toLowerCase();
      if (config.keywordsExclude.some((k) => k.trim() && text.includes(k.toLowerCase())))
        return false;
      return true;
    });
    const picked = eligible.slice(0, Math.min(5, Math.max(3, eligible.length)));
    const built = picked.map((s, i) => ({
      ...buildMarket(s, i + markets.length),
      status: MARKET_STEPS[0],
      documentsGenerated: false,
      isNew: true,
      history: [
        {
          date: new Date().toISOString().slice(0, 16).replace("T", " "),
          label: "Marché identifié par l'agent de veille",
        },
      ],
    }));
    if (built.length) {
      setMarkets((prev) => [...built, ...prev]);
      pushActivity(
        `Agent Marché Public a identifié ${built.length} nouveaux appels d'offres correspondant à vos critères`,
      );
    }
    return built;
  }, [markets, config, pushActivity]);

  const clearNewFlags = useCallback(
    () => setMarkets((prev) => prev.map((m) => (m.isNew ? { ...m, isNew: false } : m))),
    [],
  );

  const advanceMarket = useCallback(
    (ref: string) => {
      setMarkets((prev) =>
        prev.map((m) => {
          if (m.ref !== ref) return m;
          const i = MARKET_STEPS.indexOf(m.status);
          if (i >= MARKET_STEPS.length - 1) return m;
          const next = MARKET_STEPS[i + 1]!;
          return {
            ...m,
            status: next,
            checklist: i + 1 >= 2 ? m.checklist.map((c) => ({ ...c, done: true })) : m.checklist,
            documentsGenerated: m.documentsGenerated || i + 1 >= 3,
            history: [
              ...m.history,
              {
                date: new Date().toISOString().slice(0, 16).replace("T", " "),
                label: `Étape « ${next} » atteinte`,
              },
            ],
          };
        }),
      );
      pushActivity(`Dossier ${ref} a progressé dans le circuit de soumission`);
    },
    [pushActivity],
  );

  const markManuallyCompleted = useCallback((ref: string) => {
    setMarkets((prev) =>
      prev.map((m) => (m.ref === ref ? { ...m, manuallyCompleted: true, partialInfo: false } : m)),
    );
  }, []);

  const generateDocuments = useCallback(
    (ref: string) => {
      setMarkets((prev) =>
        prev.map((m) => {
          if (m.ref !== ref) return m;
          const i = Math.max(MARKET_STEPS.indexOf(m.status), 3);
          return {
            ...m,
            status: MARKET_STEPS[i]!,
            documentsGenerated: true,
            checklist: m.checklist.map((c) => ({ ...c, done: true })),
            history: [
              ...m.history,
              {
                date: new Date().toISOString().slice(0, 16).replace("T", " "),
                label: "Dossier validé par l'utilisateur — 4 documents générés",
              },
            ],
          };
        }),
      );
      pushActivity(`Agent Documents a généré les 4 pièces de soumission de ${ref}`);
    },
    [pushActivity],
  );

  const importDeal = useCallback(
    (fileName: string) => {
      const n = 49 + deals.filter((d) => d.ref.startsWith("PRV-2026")).length;
      const ref = `PRV-2026-${String(n).padStart(3, "0")}`;
      setDeals((prev) => [
        withDealDetail({
          id: ref,
          ref,
          client: "Client à qualifier",
          clientType: "Entreprises industrielles",
          objet: `Document importé — ${fileName}`,
          document: fileName,
          receivedAt: new Date().toISOString().slice(0, 10),
          budget: 0,
          status: "À analyser",
          justification: "",
        }),
        ...prev,
      ]);

      pushActivity(`Document « ${fileName} » importé dans les marchés privés (${ref})`);
    },
    [deals, pushActivity],
  );

  const analyseDeal = useCallback(
    (id: string): PrivateStatus => {
      const deal = deals.find((d) => d.id === id);
      let status: PrivateStatus = "À vérifier";
      let justification =
        "Le document est incomplet : type de client non identifié ou pièces types manquantes dans votre stock. Vérification humaine requise.";
      if (deal) {
        const matchesClient = config.clientTypes.includes(deal.clientType);
        const text = deal.objet.toLowerCase();
        const excluded = config.keywordsExclude.some((k) => k.trim() && text.includes(k.toLowerCase()));
        const matchesCategory = config.categories.some((c) =>
          text.includes((c.split(" ")[0] ?? "").toLowerCase()),
        );
        if (excluded) {
          status = "Ne correspond pas";
          justification = `La prestation contient un mot-clé exclu de votre configuration. Elle sort du périmètre de service d'INGETO.`;
        } else if (matchesClient && matchesCategory) {
          status = "Correspond";
          justification = `Type de client « ${deal.clientType} » ciblé dans votre configuration, prestation rattachée à une de vos catégories de service, et ${config.docTypes.length} documents types disponibles pour constituer l'offre.`;
        } else if (matchesClient) {
          status = "À vérifier";
          justification = `Le type de client correspond, mais la nature exacte de la prestation n'a pas pu être rattachée à une catégorie de service. Complément d'information à demander au client.`;
        } else {
          status = "Ne correspond pas";
          justification = `Le type de client « ${deal.clientType} » n'est pas ciblé dans vos critères marché privé.`;
        }
      }
      setDeals((prev) =>
        prev.map((d) =>
          d.id === id
            ? withDealDetail({
                ...d,
                status,
                justification,
                checklist: undefined,
                history: [
                  ...(d.history ?? []),
                  {
                    date: `${new Date().toISOString().slice(0, 10)} ${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`,
                    label: `Analyse IA terminée — ${status}`,
                  },
                ],
                documentsGenerated: false,
              })
            : d,
        ),
      );

      pushActivity(`Agent Marché Privé a analysé ${id} — ${status.toLowerCase()}`);
      return status;
    },
    [deals, config, pushActivity],
  );

  const nowStamp = () => {
    const d = new Date();
    return `${d.toISOString().slice(0, 10)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const relanceBrigade = useCallback(
    (id: string, message?: string) => {
      const today = new Date().toISOString().slice(0, 10);
      setBrigades((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                relanceSentAt: today,
                status: "Active",
                comms: [
                  {
                    date: nowStamp(),
                    kind: "Relance" as const,
                    text:
                      message?.trim() ||
                      "Relance de la direction : rapport de terrain demandé sous 24 h.",
                  },
                  ...b.comms,
                ],
              }
            : b,
        ),
      );
      pushActivity(`Relance envoyée à ${brigades.find((b) => b.id === id)?.name ?? id}`);
    },
    [brigades, pushActivity],
  );

  /** Affecte une brigade à un dossier : chantier, statut et journal mis à jour. */
  const assignMission = useCallback(
    (id: string, marketRef: string, chantier: string) => {
      setBrigades((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                marketRef,
                chantier,
                status: "En intervention",
                progress: 0,
                comms: [
                  {
                    date: nowStamp(),
                    kind: "Mission" as const,
                    text: `Nouvelle affectation : ${marketRef} — ${chantier}`,
                  },
                  ...b.comms,
                ],
              }
            : b,
        ),
      );
      pushActivity(
        `${brigades.find((b) => b.id === id)?.name ?? id} affectée au dossier ${marketRef}`,
      );
    },
    [brigades, pushActivity],
  );

  const generateDecompte = useCallback((): Invoice => {
    const pool: { marketRef: string; client: string; units: InvoiceUnit[] }[] = [
      {
        marketRef: "AO-2026-ONCF-207",
        client: "ONCF",
        units: invoiceUnitTemplates["AO-2026-ONCF-207"] ?? [],
      },
      {
        marketRef: "AO-2026-OCP-089",
        client: "OCP",
        units: invoiceUnitTemplates["AO-2026-OCP-089"] ?? [],
      },
      {
        marketRef: "AO-2026-CT-TEM-023",
        client: "Commune de Témara",
        units: invoiceUnitTemplates["AO-2026-CT-TEM-023"] ?? [],
      },
      {
        marketRef: "AO-2026-CT-AGD-009",
        client: "Commune d'Agadir",
        units: invoiceUnitTemplates["AO-2026-CT-AGD-009"] ?? [],
      },
    ];
    const pick = pool[invoices.length % pool.length]!;
    const { marketRef, client, units } = pick;
    const ref = `DEC-2026-${String(39 + invoices.length - initialInvoices.length).padStart(3, "0")}`;
    const inv: Invoice = {
      id: ref,
      ref,
      decompteNo: invoices.filter((i) => i.marketRef === marketRef).length + 1,
      marketRef,
      client,
      period: "Septembre 2026",
      units,
      amount: units.reduce((s, u) => s + u.qty * u.unitPrice, 0),
      status: "Brouillon",
      history: [{ date: nowStamp(), label: "Décompte calculé par l'agent Facturation" }],
    };
    setInvoices((prev) => [inv, ...prev]);
    pushActivity(`Agent Facturation a généré le décompte ${ref} (${client})`);
    return inv;
  }, [invoices, pushActivity]);

  /** Transitions de statut : Brouillon → Émis → Payé. */
  const setInvoiceStatus = useCallback(
    (id: string, status: InvoiceStatus) => {
      const today = new Date().toISOString().slice(0, 10);
      setInvoices((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                status,
                ...(status === "Émis"
                  ? {
                      issuedAt: today,
                      dueAt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
                    }
                  : {}),
                ...(status === "Payé" ? { paidAt: today } : {}),
                history: [
                  ...(i.history ?? []),
                  {
                    date: nowStamp(),
                    label:
                      status === "Émis"
                        ? "Décompte émis au maître d'ouvrage"
                        : status === "Payé"
                          ? "Encaissement constaté"
                          : "Décompte remis en brouillon",
                  },
                ],
              }
            : i,
        ),
      );
      pushActivity(`Décompte ${id} — statut « ${status} »`);
    },
    [pushActivity],
  );

  /** Génère les pièces de l'offre commerciale d'une consultation privée. */
  const generateDealDocuments = useCallback(
    (id: string) => {
      setDeals((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                documentsGenerated: true,
                history: [
                  ...(d.history ?? []),
                  { date: nowStamp(), label: "Agent Documents a généré l'offre commerciale" },
                ],
              }
            : d,
        ),
      );
      pushActivity(`Agent Documents a généré l'offre commerciale de ${id}`);
    },
    [pushActivity],
  );

  const toggleDealCheck = useCallback((id: string, index: number) => {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              checklist: (d.checklist ?? []).map((c, i) =>
                i === index ? { ...c, done: !c.done } : c,
              ),
            }
          : d,
      ),
    );
  }, []);


  const markActivityRead = useCallback(
    () => setActivity((prev) => prev.map((a) => ({ ...a, unread: false }))),
    [],
  );

  const value = useMemo<Store>(
    () => ({
      sidebarCollapsed,
      toggleSidebar,
      config,
      setConfig,
      configValidated,
      saveConfig,
      markets,
      runVeille,
      advanceMarket,
      markManuallyCompleted,
      generateDocuments,
      clearNewFlags,
      deals,
      importDeal,
      analyseDeal,
      generateDealDocuments,
      toggleDealCheck,
      brigades,
      relanceBrigade,
      assignMission,
      invoices,
      generateDecompte,
      setInvoiceStatus,

      activity,
      markActivityRead,
      pushActivity,
    }),
    [
      sidebarCollapsed,
      toggleSidebar,
      config,
      configValidated,
      saveConfig,
      markets,
      runVeille,
      advanceMarket,
      markManuallyCompleted,
      generateDocuments,
      clearNewFlags,
      deals,
      importDeal,
      analyseDeal,
      generateDealDocuments,
      toggleDealCheck,
      brigades,
      relanceBrigade,
      assignMission,
      invoices,
      generateDecompte,
      setInvoiceStatus,

      activity,
      markActivityRead,
      pushActivity,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside AppStoreProvider");
  return ctx;
}
