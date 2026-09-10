import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AppLayout, StatusBadge } from "@/components/app-layout";
import { AssistantPanel } from "@/components/assistant-panel";
import { DocPreviewDialog, downloadDoc, type DocPreviewData } from "@/components/doc-preview";
import { Confetti } from "@/components/ui-fx";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/app-store";
import { LOGO, USER } from "@/lib/branding";
import { MARKET_STEPS, fmtDate, fmtMAD, type PublicMarket } from "@/lib/ingeto-data";

export const Route = createFileRoute("/marches-publics/$ref")({
  head: ({ params }) => ({
    meta: [
      { title: `Dossier ${params.ref} — INGETO Control` },
      {
        name: "description",
        content: `Suivi du dossier de soumission ${params.ref} : synthèse, exigences du CPS, vérification de complétude et documents générés.`,
      },
      { property: "og:title", content: `Dossier ${params.ref} — INGETO Control` },
      {
        property: "og:description",
        content: "Circuit complet de préparation d'un dossier de marché public chez INGETO.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MarketDetailPage,
});

function docsFor(m: PublicMarket): DocPreviewData[] {
  const meta = [
    { label: "Référence du marché", value: m.ref },
    { label: "Maître d'ouvrage", value: m.client },
    { label: "Catégorie", value: m.category },
    { label: "Budget estimatif", value: fmtMAD(m.budget) },
    { label: "Date limite de remise", value: fmtDate(m.deadline) },
    { label: "Zone d'exécution", value: m.zone },
  ];
  return [
    {
      title: "Mémoire technique",
      subtitle: m.objet,
      meta,
      fileName: `${m.ref}-memoire-technique.txt`,
      sections: [
        {
          heading: "Compréhension de la mission",
          body: `INGETO a analysé le CPS relatif à ${m.objet.toLowerCase()}. La prestation relève de la ${m.category.toLowerCase()} et sera conduite depuis notre siège de Témara avec une brigade dédiée sur la zone ${m.zone}.`,
        },
        {
          heading: "Méthodologie proposée",
          body: "Phase 1 — reconnaissance et rattachement au réseau géodésique national.\nPhase 2 — acquisition des données (station totale robotisée, GNSS RTK, scanner 3D ou drone selon la nature du levé).\nPhase 3 — traitement, contrôle qualité croisé et production des livrables.\nPhase 4 — remise des plans DWG géoréférencés, rapport technique signé par l'IGT et données brutes archivées.",
        },
        {
          heading: "Moyens humains et matériels",
          body: "1 ingénieur géomètre topographe assermenté, 1 chef de brigade, 3 opérateurs terrain, 2 techniciens DAO. Matériel : 2 stations totales Leica TS16, 3 récepteurs GNSS, scanner RTC360, drone M300 RTK, sondeur multifaisceaux.",
        },
      ],
    },
    {
      title: "Dossier administratif",
      subtitle: `Pièces administratives — ${m.ref}`,
      meta,
      fileName: `${m.ref}-dossier-administratif.txt`,
      sections: [
        {
          heading: "Pièces constitutives",
          body: "1. Déclaration sur l'honneur\n2. Attestation fiscale et attestation CNSS\n3. Registre de commerce (modèle J)\n4. Certificat de qualification et classification\n5. Attestations de bonne exécution (3 références)\n6. Pouvoirs du signataire",
        },
        {
          heading: "Identification du concurrent",
          body: "INGETO — Cabinet d'ingénierie topographique, Témara. Représenté par M. Abdelmoutalib Karroum, directeur.",
        },
      ],
    },
    {
      title: "Acte d'engagement",
      subtitle: `Engagement contractuel — ${m.ref}`,
      meta,
      fileName: `${m.ref}-acte-engagement.txt`,
      sections: [
        {
          heading: "Objet de l'engagement",
          body: `Le soussigné s'engage à exécuter les prestations relatives à « ${m.objet} » conformément au CPS, pour un montant global de ${fmtMAD(Math.round(m.budget * 0.94))} toutes taxes comprises.`,
        },
        {
          heading: "Délai d'exécution",
          body: "Délai global de 120 jours calendaires à compter de l'ordre de service de commencement des prestations.",
        },
      ],
    },
    {
      title: "Bordereau des prix",
      subtitle: `Détail estimatif — ${m.ref}`,
      meta,
      fileName: `${m.ref}-bordereau-prix.txt`,
      sections: [
        {
          heading: "Conditions",
          body: "Prix unitaires fermes et non révisables, établis hors taxes, incluant tous les frais de déplacement, d'hébergement et d'assurance des équipes.",
        },
      ],
      table: {
        columns: ["N°", "Désignation des prestations", "Unité", "Quantité", "Montant (MAD)"],
        rows: [
          ["1", "Reconnaissance et rattachement géodésique", "Forfait", 1, Math.round(m.budget * 0.12).toLocaleString("fr-MA")],
          ["2", `Acquisition de données — ${m.category}`, "Forfait", 1, Math.round(m.budget * 0.48).toLocaleString("fr-MA")],
          ["3", "Traitement et production des livrables", "Forfait", 1, Math.round(m.budget * 0.24).toLocaleString("fr-MA")],
          ["4", "Contrôle qualité et rapport signé", "Forfait", 1, Math.round(m.budget * 0.1).toLocaleString("fr-MA")],
        ],
        totalLabel: "Total offre INGETO (HT)",
        total: fmtMAD(Math.round(m.budget * 0.94)),
      },
    },
  ];
}

function getAssistantReply(question: string, m: PublicMarket): string {
  const q = question.toLowerCase();
  const stepIdx = MARKET_STEPS.indexOf(m.status);
  const missing = m.checklist.filter((c) => !c.done).map((c) => c.label);
  if (q.includes("budget") || q.includes("montant") || q.includes("prix"))
    return `Le budget estimatif publié pour ${m.ref} est de ${fmtMAD(m.budget)}. L'offre INGETO préparée se positionne à ${fmtMAD(Math.round(m.budget * 0.94))} HT, soit 6 % sous l'estimation du maître d'ouvrage.`;
  if (q.includes("manque") || q.includes("complet") || q.includes("pièce"))
    return missing.length
      ? `Il manque encore ${missing.length} élément(s) pour atteindre 100 % de complétude : ${missing.join(", ")}. Une fois ces pièces intégrées, le bouton « Valider et générer les documents » deviendra actif.`
      : `La checklist de ${m.ref} est complète à 100 % : documents administratifs, certificats et exigences du CPS sont couverts. Vous pouvez valider et générer les 4 pièces de soumission.`;
  if (q.includes("date") || q.includes("limite") || q.includes("délai"))
    return `La date limite de remise des plis pour ${m.ref} est le ${fmtDate(m.deadline)}. Le délai d'exécution proposé dans l'acte d'engagement est de 120 jours calendaires.`;
  if (q.includes("client") || q.includes("ouvrage") || q.includes("qui"))
    return `Le maître d'ouvrage est ${m.client}, pour une prestation de ${m.category.toLowerCase()} sur la zone ${m.zone}.`;
  if (q.includes("étape") || q.includes("statut") || q.includes("avancement"))
    return `${m.ref} est à l'étape « ${m.status} » (${stepIdx + 1}/6). ${stepIdx < 5 ? `La prochaine étape est « ${MARKET_STEPS[stepIdx + 1]} ».` : "Le circuit est terminé."}`;
  if (q.includes("exigence") || q.includes("cps"))
    return `Le CPS comporte ${m.requirements.length} exigences principales, dont : ${m.requirements
      .slice(0, 3)
      .map((r) => r.label.toLowerCase())
      .join(", ")}. Chaque exigence est détaillée dans l'onglet « Exigences du CPS » avec les ressources mobilisées.`;
  if (q.includes("document"))
    return m.documentsGenerated
      ? `Les 4 documents de soumission de ${m.ref} sont générés : mémoire technique, dossier administratif, acte d'engagement et bordereau des prix. Vous pouvez les prévisualiser ou les télécharger dans l'onglet « Documents ».`
      : `Les documents ne sont pas encore générés pour ${m.ref}. Validez d'abord la checklist de complétude dans l'onglet « Vérification du dossier ».`;
  return `Pour ${m.ref} (${m.client}, ${m.category}) : budget de ${fmtMAD(m.budget)}, date limite le ${fmtDate(m.deadline)}, étape actuelle « ${m.status} ». Posez-moi une question sur le budget, les pièces manquantes, les exigences du CPS ou la date limite.`;
}

const SUGGESTIONS = [
  "Quel est le budget de ce marché ?",
  "Que manque-t-il pour compléter le dossier ?",
  "Quand est la date limite ?",
  "Quelles sont les exigences du CPS ?",
  "Où en est l'avancement du dossier ?",
];

function MarketDetailPage() {
  const { ref } = useParams({ from: "/marches-publics/$ref" });
  const { markets, advanceMarket, markManuallyCompleted, generateDocuments } = useStore();
  const market = markets.find((m) => m.ref === ref);
  const [tab, setTab] = useState("synthese");
  const [preview, setPreview] = useState<DocPreviewData | null>(null);
  const [celebrate, setCelebrate] = useState(false);



  if (!market) {
    return (
      <AppLayout title="Dossier introuvable">
        <Card className="glass-card p-8 text-center">
          <p>Aucun dossier ne correspond à la référence « {ref} ».</p>
          <Button asChild className="mt-4">
            <Link to="/marches-publics">Retour à la liste</Link>
          </Button>
        </Card>
      </AppLayout>
    );
  }

  const stepIdx = MARKET_STEPS.indexOf(market.status);
  const complete = market.checklist.every((c) => c.done);
  const missing = market.checklist.filter((c) => !c.done);
  const documents = useMemo(() => docsFor(market), [market]);
  const tabsUnlocked = {
    synthese: true,
    cps: stepIdx >= 1,
    verification: stepIdx >= 2,
    documents: market.documentsGenerated,
    historique: true,
  };

  return (
    <AppLayout
      title={market.ref}
      subtitle={market.objet}
      actions={
        <>
          <Button asChild variant="outline">
            <Link to="/marches-publics">
              <ArrowLeft className="mr-2 h-4 w-4" /> Liste
            </Link>
          </Button>
          {stepIdx < MARKET_STEPS.length - 1 && (
            <Button
              className="shine"
              onClick={() => {
                advanceMarket(market.ref);
                const next = MARKET_STEPS[stepIdx + 1];
                if (next === "Résultat") {
                  setCelebrate(true);
                  setTimeout(() => setCelebrate(false), 3200);
                  toast.success(`Marché remporté — ${market.ref} passe au statut « Gagné ».`);
                } else {
                  toast.success(`Dossier avancé à l'étape « ${next} »`);
                }
              }}
            >
              Passer à l'étape suivante <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}

        </>
      }
    >
      <Card className="glass-card mb-6 p-6">
        <div className="relative">
          <div className="absolute left-0 right-0 top-4 h-[3px] rounded bg-border" />
          <motion.div
            className="absolute left-0 top-4 h-[3px] rounded bg-gradient-to-r from-primary-dark to-primary-glow"
            initial={{ width: 0 }}
            animate={{ width: `${(stepIdx / (MARKET_STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.6 }}
          />
          <div className="relative flex justify-between">
            {MARKET_STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 flex-col items-center gap-2 text-center">
                <span
                  className={
                    i < stepIdx
                      ? "flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      : i === stepIdx
                        ? "flex h-9 w-9 animate-pulse items-center justify-center rounded-full bg-primary-glow text-primary-foreground ring-4 ring-primary/20"
                        : "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
                  }
                >
                  {i < stepIdx ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className="hidden text-xs sm:block">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="synthese">Fiche de synthèse</TabsTrigger>
          <TabsTrigger value="cps" disabled={!tabsUnlocked.cps}>
            Exigences du CPS
          </TabsTrigger>
          <TabsTrigger value="verification" disabled={!tabsUnlocked.verification}>
            Vérification du dossier
          </TabsTrigger>
          <TabsTrigger value="documents" disabled={!tabsUnlocked.documents}>
            Documents
          </TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="synthese" className="mt-4 space-y-4">
          {market.partialInfo && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <p className="flex-1 text-sm">
                Certaines informations ne sont pas publiées par le portail pour des raisons de
                sécurité — à compléter manuellement.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  markManuallyCompleted(market.ref);
                  toast.success("Informations marquées comme complétées manuellement.");
                }}
              >
                Marquer comme complété manuellement
              </Button>
            </div>
          )}
          {market.manuallyCompleted && (
            <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-success" /> Informations complétées manuellement
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["N° d'appel d'offres", market.aoNumber],
              ["Maître d'ouvrage", market.client],
              ["Catégorie de service", market.category],
              ["Budget estimatif", fmtMAD(market.budget)],
              ["Caution provisoire", fmtMAD(market.caution)],
              ["Cautionnement définitif (3 %)", fmtMAD(Math.round(market.budget * 0.03))],
              ["Pièces de référence", `${market.cpsRef} • ${market.rcRef}`],
              ["Visite des lieux", market.visiteLieux ? "Exigée par le RC" : "Non exigée"],
              ["Date limite de remise des plis", fmtDate(market.deadline)],
              ["Zone d'exécution", market.zone],
              ["Étape du circuit", market.status],
            ].map(([label, value]) => (

              <Card key={label} className="glass-card lift">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="mt-1 font-display text-base">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-base">
                <Bot className="h-4 w-4 text-primary" /> Résumé des exigences généré par l'IA
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-foreground/85">
              {market.summary}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cps" className="mt-4">
          <Card className="glass-card p-2">
            <Accordion type="single" collapsible>
              {market.requirements.map((r, i) => (
                <AccordionItem key={r.label} value={`r${i}`}>
                  <AccordionTrigger className="px-3 text-left text-sm">{r.label}</AccordionTrigger>
                  <AccordionContent className="space-y-2 px-3 text-sm">
                    <p className="text-foreground/85">{r.detail}</p>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Ressources mobilisées : </span>
                      {r.resources}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-display text-base">Checklist de complétude</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress
                value={
                  (market.checklist.filter((c) => c.done).length / market.checklist.length) * 100
                }
              />
              <p className="text-sm">
                {complete ? (
                  <span className="font-medium text-success">Dossier 100 % complet</span>
                ) : (
                  <span className="font-medium text-destructive">
                    {missing.length} élément(s) manquant(s)
                  </span>
                )}
              </p>
              <ul className="space-y-2">
                {market.checklist.map((c) => (
                  <li key={c.label} className="flex items-center gap-2 text-sm">
                    {c.done ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <X className="h-4 w-4 text-destructive" />
                    )}
                    <span className={c.done ? "" : "text-destructive"}>{c.label}</span>
                  </li>
                ))}
              </ul>
              <Button
                disabled={!complete}
                onClick={() => {
                  generateDocuments(market.ref);
                  setTab("documents");
                  toast.success("Dossier validé — 4 documents générés.");
                }}
              >
                Valider et générer les documents
              </Button>
              {!complete && (
                <p className="text-xs text-muted-foreground">
                  La validation humaine n'est possible qu'à 100 % de complétude.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {documents.map((d) => (
              <Card key={d.title} className="glass-card lift">
                <CardContent className="flex items-start gap-4 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-primary">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="font-display text-base">{d.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{d.fileName}</p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setPreview(d)}>
                        <Eye className="mr-2 h-4 w-4" /> Aperçu
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          downloadDoc(d);
                          toast.success(`${d.title} téléchargé.`);
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" /> Télécharger
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="historique" className="mt-4">
          <Card className="glass-card p-6">
            <div className="relative space-y-6 border-l border-border pl-6">
              {market.history.map((h, i) => (
                <motion.div
                  key={`${h.date}-${i}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-card bg-primary" />
                  <p className="text-sm font-medium">{h.label}</p>
                  <p className="text-xs text-muted-foreground">{h.date}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <StatusBadge status={market.status} />
      </div>

      <Confetti show={celebrate} />
      <AssistantPanel
        reference={market.ref}
        suggestions={[...SUGGESTIONS]}
        reply={(q: string) => getAssistantReply(q, market)}
      />


      <DocPreviewDialog doc={preview} open={!!preview} onOpenChange={(o) => !o && setPreview(null)} />
    </AppLayout>
  );
}
