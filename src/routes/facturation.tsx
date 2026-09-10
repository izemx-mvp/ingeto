import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Banknote,
  Calculator,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Search,
  Send,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { AppLayout, StatusBadge } from "@/components/app-layout";
import { DocPreviewDialog, downloadDoc, type DocPreviewData } from "@/components/doc-preview";
import {
  EmptyState,
  Paginator,
  SortHeader,
  usePagination,
  useSort,
} from "@/components/table-tools";
import { Gauge, KpiTile } from "@/components/ui-fx";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/app-store";
import {
  billingMonths,
  fmtDate,
  fmtMAD,
  invoiceTotals,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/ingeto-data";

export const Route = createFileRoute("/facturation")({
  head: () => ({
    meta: [
      { title: "Facturation & Décompte — INGETO Control" },
      {
        name: "description",
        content:
          "Décomptes mensuels INGETO : unités d'œuvre, TVA 20 %, retenue de garantie, encaissements, aperçu et téléchargement des pièces.",
      },
      { property: "og:title", content: "Facturation & Décompte — INGETO Control" },
      {
        property: "og:description",
        content: "Génération, émission et encaissement des décomptes par dossier, période et client.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FacturationPage,
});

type SortKey = "ref" | "client" | "amount" | "period" | "status";

function invoiceDoc(inv: Invoice): DocPreviewData {
  const t = invoiceTotals(inv);
  return {
    title: `Décompte provisoire n° ${inv.decompteNo} — ${inv.ref}`,
    subtitle: `Période : ${inv.period} — Marché ${inv.marketRef}`,
    meta: [
      { label: "Maître d'ouvrage", value: inv.client },
      { label: "Marché", value: inv.marketRef },
      { label: "Période d'attachement", value: inv.period },
      { label: "Statut", value: inv.status },
      { label: "Montant net à payer", value: fmtMAD(t.net) },
    ],
    sections: [
      {
        heading: "Objet du décompte",
        body: `Décompte provisoire n° ${inv.decompteNo} des prestations topographiques réalisées pour ${inv.client} au titre de ${inv.period}, établi sur la base des unités d'œuvre constatées contradictoirement avec le maître d'ouvrage et de l'attachement signé par la brigade.`,
      },
      {
        heading: "Récapitulatif financier",
        body: `Montant hors taxes : ${fmtMAD(t.ht)} — TVA 20 % : ${fmtMAD(t.tva)} — Montant TTC : ${fmtMAD(t.ttc)} — Retenue de garantie 7 % : ${fmtMAD(t.retenue)} — Net à payer : ${fmtMAD(t.net)}.`,
      },
    ],
    table: {
      columns: [
        "Unité d'œuvre",
        "Unité",
        "Quantité",
        "Prix unitaire (MAD)",
        "Avancement",
        "Montant (MAD)",
      ],
      rows: inv.units.map((u) => [
        u.label,
        u.unit,
        u.qty,
        u.unitPrice.toLocaleString("fr-MA"),
        `${u.progress} %`,
        (u.qty * u.unitPrice).toLocaleString("fr-MA"),
      ]),
      totalLabel: "Montant net à payer (après retenue de garantie)",
      total: fmtMAD(t.net),
    },
    fileName: `${inv.ref}-decompte.txt`,
  };
}

const NEXT: Record<InvoiceStatus, InvoiceStatus | null> = {
  Brouillon: "Émis",
  "Émis": "Payé",
  "Payé": null,
};

function FacturationPage() {
  const { invoices, generateDecompte, setInvoiceStatus } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const sort = useSort<SortKey>("ref");
  const [preview, setPreview] = useState<DocPreviewData | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = invoices.filter((i) => {
      if (
        needle &&
        !`${i.ref} ${i.client} ${i.marketRef} ${i.period} ${i.units.map((u) => u.label).join(" ")}`
          .toLowerCase()
          .includes(needle)
      )
        return false;
      if (status !== "all" && i.status !== status) return false;
      return true;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sort.key === "amount") return (a.amount - b.amount) * dir;
      return String(a[sort.key]).localeCompare(String(b[sort.key]), "fr") * dir;
    });
  }, [invoices, q, status, sort.key, sort.dir]);

  const pagination = usePagination(filtered.length);
  const rows = filtered.slice(pagination.start, pagination.end);
  const detailInvoice = invoices.find((i) => i.id === detail) ?? null;

  const totals = useMemo(() => {
    const ht = invoices.reduce((s, i) => s + i.amount, 0);
    const paid = invoices.filter((i) => i.status === "Payé").reduce((s, i) => s + i.amount, 0);
    const pending = invoices.filter((i) => i.status === "Émis").reduce((s, i) => s + i.amount, 0);
    const retenue = invoices.reduce((s, i) => s + invoiceTotals(i).retenue, 0);
    return { ht, paid, pending, retenue, rate: ht ? Math.round((paid / ht) * 100) : 0 };
  }, [invoices]);

  const byClient = useMemo(() => {
    const map = new Map<string, { client: string; count: number; ht: number; paid: number }>();
    for (const i of invoices) {
      const row = map.get(i.client) ?? { client: i.client, count: 0, ht: 0, paid: 0 };
      row.count += 1;
      row.ht += i.amount;
      if (i.status === "Payé") row.paid += i.amount;
      map.set(i.client, row);
    }
    return [...map.values()].sort((a, b) => b.ht - a.ht);
  }, [invoices]);

  const generate = () => {
    setBusy(true);
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = p + 14;
        if (next >= 100) {
          clearInterval(timer);
          const inv = generateDecompte();
          setBusy(false);
          pagination.reset();
          toast.success(
            `Décompte provisoire n° ${inv.decompteNo} (${inv.ref}) généré — ${fmtMAD(inv.amount)} HT, en brouillon.`,
          );
          return 100;
        }
        return next;
      });
    }, 160);
  };

  const advance = (inv: Invoice) => {
    const next = NEXT[inv.status];
    if (!next) return;
    setInvoiceStatus(inv.id, next);
    toast.success(
      next === "Émis"
        ? `Décompte ${inv.ref} émis au maître d'ouvrage — paiement attendu sous 60 jours.`
        : `Décompte ${inv.ref} encaissé — retenue de garantie conservée.`,
    );
  };

  return (
    <AppLayout
      title="Facturation & Décompte"
      subtitle="Décomptes calculés à partir des unités d'œuvre remontées par les brigades, TVA 20 % et retenue de garantie 7 %."
      actions={
        <Button className="shine" onClick={generate} disabled={busy}>
          <Calculator className="mr-2 h-4 w-4" /> Générer le décompte du mois
        </Button>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          label="Montant facturé (HT, cumul)"
          value={totals.ht}
          suffix=" MAD"
          icon={<FileText className="h-4 w-4" />}
          tone="primary"
        />
        <KpiTile
          label="Encaissé"
          value={totals.paid}
          suffix=" MAD"
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="success"
          delay={0.05}
        />
        <KpiTile
          label="En attente de paiement"
          value={totals.pending}
          suffix=" MAD"
          icon={<Clock className="h-4 w-4" />}
          tone="warning"
          delay={0.1}
        />
        <KpiTile
          label="Retenue de garantie immobilisée"
          value={totals.retenue}
          suffix=" MAD"
          icon={<Banknote className="h-4 w-4" />}
          tone="accent"
          delay={0.15}
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card">
            <CardContent className="p-6">
              <p className="font-display">Facturé et encaissé sur six mois</p>
              <p className="mb-4 text-xs text-muted-foreground">
                Montants hors taxes, tous marchés publics et privés confondus.
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={billingMonths}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickFormatter={(v: number) => `${Math.round(v / 1000)} k`}
                    />
                    <ReTooltip
                      formatter={(v: number) => fmtMAD(v)}
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      dataKey="facture"
                      name="Facturé"
                      fill="var(--primary)"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="encaisse"
                      name="Encaissé"
                      fill="var(--accent-glow)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Card className="glass-card">
          <CardContent className="space-y-4 p-6">
            <p className="font-display">Taux de recouvrement</p>
            <Gauge value={totals.rate} label={`${totals.rate} % du facturé encaissé`} tone="success" />
            <div className="space-y-2 pt-2 text-sm">
              {(["Brouillon", "Émis", "Payé"] as InvoiceStatus[]).map((s) => {
                const list = invoices.filter((i) => i.status === s);
                return (
                  <div
                    key={s}
                    className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2"
                  >
                    <StatusBadge status={s} />
                    <span className="text-xs text-muted-foreground">
                      {list.length} décompte(s) •{" "}
                      {fmtMAD(list.reduce((acc, i) => acc + i.amount, 0))}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="decomptes">
        <TabsList className="mb-4">
          <TabsTrigger value="decomptes">Décomptes</TabsTrigger>
          <TabsTrigger value="clients">Synthèse par client</TabsTrigger>
        </TabsList>

        <TabsContent value="decomptes">
          <Card className="glass-card overflow-hidden p-0">
            <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
              <div className="relative min-w-[240px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    pagination.reset();
                  }}
                  placeholder="Décompte, client, dossier, unité d'œuvre…"
                  className="pl-9"
                />
              </div>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v);
                  pagination.reset();
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {["Brouillon", "Émis", "Payé"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {rows.length === 0 ? (
              <EmptyState label="Aucun résultat pour cette recherche" />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <SortHeader label="Décompte" sortKey="ref" sort={sort} />
                      </TableHead>
                      <TableHead>
                        <SortHeader label="Maître d'ouvrage" sortKey="client" sort={sort} />
                      </TableHead>
                      <TableHead>Unités d'œuvre saisies</TableHead>
                      <TableHead>
                        <SortHeader label="Période" sortKey="period" sort={sort} />
                      </TableHead>
                      <TableHead>
                        <SortHeader label="Montant HT" sortKey="amount" sort={sort} />
                      </TableHead>
                      <TableHead>Net à payer</TableHead>
                      <TableHead>
                        <SortHeader label="Statut" sortKey="status" sort={sort} />
                      </TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((inv) => {
                      const t = invoiceTotals(inv);
                      return (
                        <TableRow key={inv.ref}>
                          <TableCell className="font-medium">
                            {inv.ref}
                            <span className="block text-xs text-muted-foreground">
                              DP n° {inv.decompteNo} • {inv.marketRef}
                            </span>
                          </TableCell>
                          <TableCell>{inv.client}</TableCell>
                          <TableCell className="max-w-[280px] text-sm text-muted-foreground">
                            {inv.units.map((u) => (
                              <span key={u.label} className="block">
                                {u.label} — {u.qty} {u.unit} ×{" "}
                                {u.unitPrice.toLocaleString("fr-MA")}
                              </span>
                            ))}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{inv.period}</TableCell>
                          <TableCell className="whitespace-nowrap font-medium">
                            {fmtMAD(inv.amount)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm">
                            {fmtMAD(t.net)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={inv.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDetail(inv.id)}
                              >
                                <Eye className="mr-1.5 h-4 w-4" /> Détail
                              </Button>
                              {NEXT[inv.status] && (
                                <Button size="sm" onClick={() => advance(inv)}>
                                  <Send className="mr-1.5 h-4 w-4" />
                                  {inv.status === "Brouillon" ? "Émettre" : "Marquer payé"}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            <Paginator pagination={pagination} total={filtered.length} />
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card className="glass-card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Maître d'ouvrage / client</TableHead>
                    <TableHead>Décomptes</TableHead>
                    <TableHead>Facturé HT</TableHead>
                    <TableHead>Encaissé</TableHead>
                    <TableHead>Reste à recouvrer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byClient.map((c) => (
                    <TableRow key={c.client}>
                      <TableCell className="font-medium">{c.client}</TableCell>
                      <TableCell>{c.count}</TableCell>
                      <TableCell>{fmtMAD(c.ht)}</TableCell>
                      <TableCell className="text-success">{fmtMAD(c.paid)}</TableCell>
                      <TableCell className="text-warning">{fmtMAD(c.ht - c.paid)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={busy} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-display text-lg">Calcul du décompte</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Consolidation des attachements du mois et application du bordereau des prix…
          </p>
          <Progress value={progress} className="mt-3" />
          <div className="shimmer mt-3 h-10 rounded-md" />
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailInvoice} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {detailInvoice && (
            <>
              <DialogTitle className="font-display text-lg">
                Décompte provisoire n° {detailInvoice.decompteNo} — {detailInvoice.ref}
              </DialogTitle>
              <div className="space-y-4 text-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={detailInvoice.status} />
                  <span className="text-muted-foreground">
                    {detailInvoice.client} • {detailInvoice.marketRef} • {detailInvoice.period}
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    ["Émis le", detailInvoice.issuedAt ? fmtDate(detailInvoice.issuedAt) : "—"],
                    ["Échéance", detailInvoice.dueAt ? fmtDate(detailInvoice.dueAt) : "—"],
                    ["Payé le", detailInvoice.paidAt ? fmtDate(detailInvoice.paidAt) : "—"],
                  ].map(([l, v]) => (
                    <div key={l} className="rounded-lg bg-muted/60 px-3 py-2">
                      <p className="text-xs text-muted-foreground">{l}</p>
                      <p>{v}</p>
                    </div>
                  ))}
                </div>

                <div className="overflow-hidden rounded-xl border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Unité d'œuvre</TableHead>
                        <TableHead>Qté</TableHead>
                        <TableHead>P.U.</TableHead>
                        <TableHead>Avancement</TableHead>
                        <TableHead>Montant</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailInvoice.units.map((u) => (
                        <TableRow key={u.label}>
                          <TableCell>{u.label}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {u.qty} {u.unit}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {u.unitPrice.toLocaleString("fr-MA")}
                          </TableCell>
                          <TableCell className="w-28">
                            <Gauge value={u.progress} tone="success" />
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {fmtMAD(u.qty * u.unitPrice)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-1 rounded-xl border border-border bg-muted/60 p-4">
                  {(() => {
                    const t = invoiceTotals(detailInvoice);
                    return (
                      <>
                        <Line label="Montant hors taxes" value={fmtMAD(t.ht)} />
                        <Line label="TVA 20 %" value={fmtMAD(t.tva)} />
                        <Line label="Montant TTC" value={fmtMAD(t.ttc)} />
                        <Line label="Retenue de garantie 7 %" value={`- ${fmtMAD(t.retenue)}`} />
                        <div className="mt-2 flex items-center justify-between border-t border-border pt-2 font-display">
                          <span>Net à payer</span>
                          <span>{fmtMAD(t.net)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div>
                  <p className="font-display text-sm">Historique du décompte</p>
                  <ol className="mt-2 space-y-2 border-l border-border pl-4">
                    {detailInvoice.history.map((h, i) => (
                      <li key={i} className="text-xs text-muted-foreground">
                        <span className="text-foreground">{fmtDate(h.date)}</span> — {h.label}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" onClick={() => setPreview(invoiceDoc(detailInvoice))}>
                    <Eye className="mr-1.5 h-4 w-4" /> Aperçu du décompte
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      downloadDoc(invoiceDoc(detailInvoice));
                      toast.success(`Décompte ${detailInvoice.ref} téléchargé.`);
                    }}
                  >
                    <Download className="mr-1.5 h-4 w-4" /> Télécharger
                  </Button>
                  {NEXT[detailInvoice.status] && (
                    <Button onClick={() => advance(detailInvoice)}>
                      <Send className="mr-1.5 h-4 w-4" />
                      {detailInvoice.status === "Brouillon"
                        ? "Émettre le décompte"
                        : "Marquer comme payé"}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <DocPreviewDialog doc={preview} open={!!preview} onOpenChange={(o) => !o && setPreview(null)} />
    </AppLayout>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
