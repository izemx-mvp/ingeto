import { createFileRoute } from "@tanstack/react-router";
import { Calculator, Download, Eye, Search } from "lucide-react";
import { useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { useStore } from "@/lib/app-store";
import { fmtMAD, type Invoice } from "@/lib/ingeto-data";

export const Route = createFileRoute("/facturation")({
  head: () => ({
    meta: [
      { title: "Facturation & Décompte — INGETO Control" },
      {
        name: "description",
        content:
          "Décomptes mensuels INGETO : unités d'œuvre, quantités, montants calculés, aperçu et téléchargement des pièces.",
      },
      { property: "og:title", content: "Facturation & Décompte — INGETO Control" },
      {
        property: "og:description",
        content: "Génération et suivi des décomptes par dossier et par période.",
      },
    ],
  }),
  component: FacturationPage,
});

type SortKey = "ref" | "client" | "amount" | "period" | "status";

function invoiceDoc(inv: Invoice): DocPreviewData {
  return {
    title: `Décompte ${inv.ref}`,
    subtitle: `Période : ${inv.period} — Dossier ${inv.marketRef}`,
    meta: [
      { label: "Client", value: inv.client },
      { label: "Marché", value: inv.marketRef },
      { label: "Période", value: inv.period },
      { label: "Statut", value: inv.status },
    ],
    sections: [
      {
        heading: "Objet du décompte",
        body: `Décompte des prestations topographiques réalisées pour ${inv.client} au titre de ${inv.period}, établi sur la base des unités d'œuvre constatées contradictoirement avec le maître d'ouvrage.`,
      },
    ],
    table: {
      columns: ["Unité d'œuvre", "Quantité", "Prix unitaire (MAD)", "Montant (MAD)"],
      rows: inv.units.map((u) => [
        u.label,
        u.qty,
        u.unitPrice.toLocaleString("fr-MA"),
        (u.qty * u.unitPrice).toLocaleString("fr-MA"),
      ]),
      totalLabel: "Montant total du décompte (HT)",
      total: fmtMAD(inv.amount),
    },
    fileName: `${inv.ref}-decompte.txt`,
  };
}

function FacturationPage() {
  const { invoices, generateDecompte } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const sort = useSort<SortKey>("ref");
  const [preview, setPreview] = useState<DocPreviewData | null>(null);
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
          toast.success(`Décompte ${inv.ref} généré — ${fmtMAD(inv.amount)} (brouillon).`);
          return 100;
        }
        return next;
      });
    }, 160);
  };

  return (
    <AppLayout
      title="Facturation & Décompte"
      subtitle="Décomptes calculés à partir des unités d'œuvre remontées par les brigades."
      actions={
        <Button onClick={generate} disabled={busy}>
          <Calculator className="mr-2 h-4 w-4" /> Générer le décompte du mois
        </Button>
      }
    >
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
                    <SortHeader label="Client" sortKey="client" sort={sort} />
                  </TableHead>
                  <TableHead>Unités d'œuvre saisies</TableHead>
                  <TableHead>
                    <SortHeader label="Période" sortKey="period" sort={sort} />
                  </TableHead>
                  <TableHead>
                    <SortHeader label="Montant" sortKey="amount" sort={sort} />
                  </TableHead>
                  <TableHead>
                    <SortHeader label="Statut" sortKey="status" sort={sort} />
                  </TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((inv) => (
                  <TableRow key={inv.ref}>
                    <TableCell className="font-medium">
                      {inv.ref}
                      <span className="block text-xs text-muted-foreground">{inv.marketRef}</span>
                    </TableCell>
                    <TableCell>{inv.client}</TableCell>
                    <TableCell className="max-w-[300px] text-sm text-muted-foreground">
                      {inv.units.map((u) => (
                        <span key={u.label} className="block">
                          {u.label} — {u.qty} × {u.unitPrice.toLocaleString("fr-MA")}
                        </span>
                      ))}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{inv.period}</TableCell>
                    <TableCell className="whitespace-nowrap font-medium">
                      {fmtMAD(inv.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreview(invoiceDoc(inv))}
                        >
                          <Eye className="mr-1.5 h-4 w-4" /> Aperçu
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            downloadDoc(invoiceDoc(inv));
                            toast.success(`Décompte ${inv.ref} téléchargé.`);
                          }}
                        >
                          <Download className="mr-1.5 h-4 w-4" /> Télécharger
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <Paginator pagination={pagination} total={filtered.length} />
      </Card>

      <Dialog open={busy} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-display text-lg">Calcul du décompte</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Consolidation des unités d'œuvre du mois et application du bordereau des prix…
          </p>
          <Progress value={progress} className="mt-3" />
          <div className="shimmer mt-3 h-10 rounded-md" />
        </DialogContent>
      </Dialog>

      <DocPreviewDialog doc={preview} open={!!preview} onOpenChange={(o) => !o && setPreview(null)} />
    </AppLayout>
  );
}
