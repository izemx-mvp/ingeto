import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout, StatusBadge } from "@/components/app-layout";
import { AssistantPanel } from "@/components/assistant-panel";
import { DocPreviewDialog, downloadDoc, type DocPreviewData } from "@/components/doc-preview";
import { Gauge } from "@/components/ui-fx";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/app-store";
import { fmtDate, fmtMAD, type PrivateDeal } from "@/lib/ingeto-data";

export const Route = createFileRoute("/marches-prives/$ref")({
  head: () => ({
    meta: [
      { title: "Consultation privée — INGETO Control" },
      {
        name: "description",
        content:
          "Fiche d'une consultation privée INGETO : analyse IA, pièces de l'offre commerciale, documents générés et historique.",
      },
      { property: "og:title", content: "Consultation privée — INGETO Control" },
      {
        property: "og:description",
        content: "Analyse de correspondance, checklist de l'offre, documents et assistant de dossier.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivateDetailPage,
});

const SUGGESTIONS = [
  "Cette consultation correspond-elle à nos critères ?",
  "Quelles pièces manquent à l'offre commerciale ?",
  "Quel délai d'exécution proposer au client ?",
  "Quel est le montant estimé de la prestation ?",
];

function reply(question: string, d: PrivateDeal): string {
  const q = question.toLowerCase();
  const missing = (d.checklist ?? []).filter((c) => !c.done);
  if (q.includes("critère") || q.includes("correspond"))
    return `Analyse de ${d.ref} : statut « ${d.status} ». ${d.justification}`;
  if (q.includes("pièce") || q.includes("manque"))
    return missing.length
      ? `Il manque ${missing.length} pièce(s) : ${missing.map((m) => m.label).join(" ; ")}.`
      : "Toutes les pièces de l'offre commerciale sont réunies : le dossier peut être transmis au client.";
  if (q.includes("délai") || q.includes("planning"))
    return `Pour une prestation de ce volume (${fmtMAD(d.budget)}), le planning type est de 3 semaines de terrain et 2 semaines de bureau d'études, PV de livraison inclus.`;
  if (q.includes("montant") || q.includes("prix") || q.includes("budget"))
    return `Le budget estimé de la consultation est de ${fmtMAD(d.budget)} HT, hors TVA 20 %.`;
  return `Consultation ${d.ref} — ${d.client} (${d.clientType}). Objet : ${d.objet}. Statut d'analyse : ${d.status}.`;
}

function offerDocs(d: PrivateDeal): DocPreviewData[] {
  return [
    {
      title: `Devis détaillé — ${d.ref}`,
      subtitle: `${d.client} • ${d.clientType}`,
      meta: [
        { label: "Client", value: d.client },
        { label: "Contact", value: d.contact ?? "—" },
        { label: "Objet", value: d.objet },
        { label: "Montant estimé", value: fmtMAD(d.budget) },
      ],
      sections: [
        {
          heading: "Objet de la prestation",
          body: `${d.objet}. Prestation réalisée conformément aux normes topographiques en vigueur au Maroc, rattachement au système Lambert Maroc et livraison des plans en DWG et PDF.`,
        },
        {
          heading: "Conditions",
          body: "Validité de l'offre : 30 jours. Paiement : 40 % à la commande, 60 % à la livraison. TVA 20 % en sus.",
        },
      ],
      fileName: `${d.ref}-devis.txt`,
    },
    {
      title: `Note de moyens et planning — ${d.ref}`,
      subtitle: `${d.client}`,
      meta: [
        { label: "Brigade proposée", value: "Brigade Nord — Rabat-Kénitra" },
        { label: "Délai global", value: "5 semaines" },
      ],
      sections: [
        {
          heading: "Moyens humains et matériels",
          body: "Une brigade de 3 topographes encadrée par un ingénieur géomètre-topographe (IGT) inscrit à l'OIGT, équipée d'une station totale robotisée, de deux récepteurs GNSS RTK et d'un drone photogrammétrique.",
        },
        {
          heading: "Planning d'exécution",
          body: "Semaine 1 : reconnaissance et rattachement. Semaines 2-3 : levés de détail. Semaines 4-5 : traitement, plans côtés et remise des livrables.",
        },
      ],
      fileName: `${d.ref}-note-moyens.txt`,
    },
  ];
}

function PrivateDetailPage() {
  const { ref } = useParams({ from: "/marches-prives/$ref" });
  const { deals, analyseDeal, generateDealDocuments, toggleDealCheck } = useStore();
  const deal = deals.find((d) => d.ref === ref);
  const [preview, setPreview] = useState<DocPreviewData | null>(null);
  const [busy, setBusy] = useState(false);

  if (!deal) {
    return (
      <AppLayout title="Consultation introuvable" subtitle="Cette consultation n'existe plus.">
        <Button asChild variant="outline">
          <Link to="/marches-prives">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux marchés privés
          </Link>
        </Button>
      </AppLayout>
    );
  }

  const checklist = deal.checklist ?? [];
  const done = checklist.filter((c) => c.done).length;
  const pct = checklist.length ? Math.round((done / checklist.length) * 100) : 0;
  const docs = offerDocs(deal);

  return (
    <AppLayout
      title={`${deal.ref} — ${deal.client}`}
      subtitle={`${deal.clientType} • consultation reçue le ${fmtDate(deal.receivedAt)}`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/marches-prives">
              <ArrowLeft className="mr-2 h-4 w-4" /> Toutes les consultations
            </Link>
          </Button>
          {deal.status === "À analyser" ? (
            <Button
              className="shine"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                setTimeout(() => {
                  const result = analyseDeal(deal.id);
                  setBusy(false);
                  toast.success(`Analyse terminée : ${result}`);
                }, 1600);
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" /> Lancer l'analyse IA
            </Button>
          ) : (
            !deal.documentsGenerated && (
              <Button
                className="shine"
                onClick={() => {
                  generateDealDocuments(deal.id);
                  toast.success("Offre commerciale générée : devis et note de moyens.");
                }}
              >
                <Wand2 className="mr-2 h-4 w-4" /> Générer l'offre commerciale
              </Button>
            )
          )}
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card className="glass-card">
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <StatusBadge status={deal.status} />
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" /> {deal.document}
                </span>
              </div>
              <p className="text-sm">{deal.objet}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Client", deal.client],
                  ["Type de client", deal.clientType],
                  ["Contact", deal.contact ?? "—"],
                  ["Budget estimé", fmtMAD(deal.budget)],
                  ["TVA 20 %", fmtMAD(deal.budget * 0.2)],
                  ["Reçu le", fmtDate(deal.receivedAt)],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-lg bg-muted/60 px-3 py-2">
                    <p className="text-xs text-muted-foreground">{l}</p>
                    <p className="text-sm">{v}</p>
                  </div>
                ))}
              </div>
              {busy ? (
                <div className="shimmer h-16 rounded-xl" />
              ) : (
                <div className="rounded-xl border border-border bg-card p-4 text-sm leading-relaxed">
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Justification de l'agent d'analyse
                  </p>
                  {deal.justification || "Analyse non encore réalisée."}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <Tabs defaultValue="pieces">
                <TabsList>
                  <TabsTrigger value="pieces">Pièces de l'offre</TabsTrigger>
                  <TabsTrigger value="docs">Documents générés</TabsTrigger>
                  <TabsTrigger value="historique">Historique</TabsTrigger>
                </TabsList>

                <TabsContent value="pieces" className="space-y-3 pt-4">
                  <Gauge value={pct} label={`${done}/${checklist.length} pièces réunies`} tone="success" />
                  {checklist.map((c, i) => (
                    <label
                      key={c.label}
                      className="flex cursor-pointer items-start gap-3 rounded-lg bg-muted/60 px-3 py-2 text-sm"
                    >
                      <Checkbox
                        checked={c.done}
                        onCheckedChange={() => toggleDealCheck(deal.id, i)}
                        className="mt-0.5"
                      />
                      <span className={c.done ? "text-foreground" : "text-muted-foreground"}>
                        {c.label}
                      </span>
                    </label>
                  ))}
                </TabsContent>

                <TabsContent value="docs" className="space-y-3 pt-4">
                  {!deal.documentsGenerated ? (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                      L'offre commerciale n'a pas encore été générée pour cette consultation.
                    </div>
                  ) : (
                    docs.map((doc) => (
                      <div
                        key={doc.title}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setPreview(doc)}>
                            <Eye className="mr-1.5 h-4 w-4" /> Aperçu
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              downloadDoc(doc);
                              toast.success(`« ${doc.title} » téléchargé.`);
                            }}
                          >
                            <Download className="mr-1.5 h-4 w-4" /> Télécharger
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="historique" className="pt-4">
                  <ol className="relative space-y-4 border-l border-border pl-5">
                    {(deal.history ?? []).map((h, i) => (
                      <li key={i}>
                        <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-card bg-primary" />
                        <p className="text-xs text-muted-foreground">{h.date}</p>
                        <p className="text-sm">{h.label}</p>
                      </li>
                    ))}
                  </ol>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardContent className="space-y-3 p-6 text-sm">
              <p className="flex items-center gap-2 font-display">
                <Building2 className="h-4 w-4 text-primary" /> Client
              </p>
              <p>{deal.client}</p>
              <p className="text-xs text-muted-foreground">{deal.clientType}</p>
              <p className="text-xs text-muted-foreground">{deal.contact}</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="space-y-2 p-6 text-sm">
              <p className="flex items-center gap-2 font-display">
                <CheckCircle2 className="h-4 w-4 text-success" /> Avancement du dossier
              </p>
              <Gauge value={pct} label={`Dossier complété à ${pct} %`} tone="success" />
              <p className="flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" /> Réponse attendue sous 15 jours après la
                réception de la consultation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <AssistantPanel
        reference={deal.ref}
        suggestions={[...SUGGESTIONS]}
        reply={(q: string) => reply(q, deal)}
      />

      <DocPreviewDialog doc={preview} open={!!preview} onOpenChange={(o) => !o && setPreview(null)} />
    </AppLayout>
  );
}
