import { createFileRoute } from "@tanstack/react-router";
import { Eye, Search, Sparkles, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppLayout, StatusBadge } from "@/components/app-layout";
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
import { fmtDate, fmtMAD } from "@/lib/ingeto-data";

export const Route = createFileRoute("/marches-prives")({
  head: () => ({
    meta: [
      { title: "Marchés Privés — INGETO Control" },
      {
        name: "description",
        content:
          "Analyse IA des consultations privées d'INGETO : promoteurs, particuliers et entreprises industrielles.",
      },
      { property: "og:title", content: "Marchés Privés — INGETO Control" },
      {
        property: "og:description",
        content: "Import de documents et analyse automatique de correspondance aux critères.",
      },
    ],
  }),
  component: MarchesPrivesPage,
});

type SortKey = "ref" | "client" | "budget" | "receivedAt" | "status";

function MarchesPrivesPage() {
  const { deals, importDeal, analyseDeal } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const sort = useSort<SortKey>("receivedAt");
  const [importOpen, setImportOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysing, setAnalysing] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = deals.filter((d) => {
      if (
        needle &&
        !`${d.ref} ${d.client} ${d.objet} ${d.clientType} ${d.document}`
          .toLowerCase()
          .includes(needle)
      )
        return false;
      if (status !== "all" && d.status !== status) return false;
      return true;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sort.key === "budget") return (a.budget - b.budget) * dir;
      return String(a[sort.key]).localeCompare(String(b[sort.key]), "fr") * dir;
    });
  }, [deals, q, status, sort.key, sort.dir]);

  const pagination = usePagination(filtered.length);
  const rows = filtered.slice(pagination.start, pagination.end);
  const detailDeal = deals.find((d) => d.id === detail) ?? null;

  const startImport = () => {
    setImportOpen(true);
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = p + 12;
        if (next >= 100) {
          clearInterval(timer);
          const name = `consultation-${Date.now().toString().slice(-5)}.pdf`;
          importDeal(name);
          setImportOpen(false);
          toast.success(`Document « ${name} » importé — statut « À analyser ».`);
          pagination.reset();
          return 100;
        }
        return next;
      });
    }, 170);
  };

  const runAnalysis = (id: string) => {
    setAnalysing(id);
    setTimeout(() => {
      const result = analyseDeal(id);
      setAnalysing(null);
      toast.success(`Analyse terminée : ${result}`);
    }, 1800);
  };

  return (
    <AppLayout
      title="Marchés Privés"
      subtitle="Consultations reçues directement des clients, qualifiées par l'agent d'analyse."
      actions={
        <Button onClick={startImport}>
          <Upload className="mr-2 h-4 w-4" /> Importer un document
        </Button>
      }
    >
      <Card className="glass-card overflow-hidden p-0">
        <div className="flex flex-wrap items-end gap-3 border-b border-border p-4">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                pagination.reset();
              }}
              placeholder="Client, référence, prestation…"
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
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts d'analyse</SelectItem>
              {["À analyser", "Correspond", "Ne correspond pas", "À vérifier"].map((s) => (
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
                    <SortHeader label="Référence" sortKey="ref" sort={sort} />
                  </TableHead>
                  <TableHead>
                    <SortHeader label="Client" sortKey="client" sort={sort} />
                  </TableHead>
                  <TableHead>Prestation</TableHead>
                  <TableHead>
                    <SortHeader label="Montant" sortKey="budget" sort={sort} />
                  </TableHead>
                  <TableHead>
                    <SortHeader label="Reçu le" sortKey="receivedAt" sort={sort} />
                  </TableHead>
                  <TableHead>
                    <SortHeader label="Analyse" sortKey="status" sort={sort} />
                  </TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">
                      {d.ref}
                      <span className="block text-xs text-muted-foreground">{d.document}</span>
                    </TableCell>
                    <TableCell>
                      {d.client}
                      <span className="block text-xs text-muted-foreground">{d.clientType}</span>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <span className="line-clamp-2 text-sm text-muted-foreground">{d.objet}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {d.budget ? fmtMAD(d.budget) : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{fmtDate(d.receivedAt)}</TableCell>
                    <TableCell>
                      {analysing === d.id ? (
                        <div className="shimmer h-6 w-28 rounded-full" />
                      ) : (
                        <StatusBadge status={d.status} />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {d.status === "À analyser" ? (
                        <Button
                          size="sm"
                          disabled={analysing === d.id}
                          onClick={() => runAnalysis(d.id)}
                        >
                          <Sparkles className="mr-2 h-4 w-4" /> Lancer l'analyse IA
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setDetail(d.id)}>
                          <Eye className="mr-2 h-4 w-4" /> Voir le détail
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <Paginator pagination={pagination} total={filtered.length} />
      </Card>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-display text-lg">Import du document</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Téléversement et indexation du cahier des charges en cours…
          </p>
          <Progress value={progress} className="mt-3" />
          <div className="shimmer mt-3 h-10 rounded-md" />
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailDeal} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogTitle className="font-display text-lg">
            {detailDeal?.ref} — {detailDeal?.client}
          </DialogTitle>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">{detailDeal?.objet}</p>
            {detailDeal && <StatusBadge status={detailDeal.status} />}
            <div className="rounded-lg border border-border bg-muted/60 p-3 leading-relaxed">
              {detailDeal?.justification || "Analyse non encore réalisée."}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
