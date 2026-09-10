import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AppLayout, StatusBadge } from "@/components/app-layout";
import {
  EmptyState,
  Paginator,
  SortHeader,
  usePagination,
  useSort,
} from "@/components/table-tools";
import { VeilleButton } from "@/components/veille-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore } from "@/lib/app-store";
import { CATEGORIES, MARKET_STEPS, fmtDate, fmtMAD } from "@/lib/ingeto-data";

export const Route = createFileRoute("/marches-publics/")({
  head: () => ({
    meta: [
      { title: "Marchés Publics — INGETO Control" },
      {
        name: "description",
        content:
          "Veille et suivi des appels d'offres publics d'INGETO : ANCFCC, ONCF, OCP, ADM, ONEE, collectivités et agences urbaines.",
      },
      { property: "og:title", content: "Marchés Publics — INGETO Control" },
      {
        property: "og:description",
        content: "Recherche, filtrage et pilotage des dossiers de soumission aux marchés publics.",
      },
    ],
  }),
  component: MarchesPublicsPage,
});

type SortKey = "ref" | "client" | "budget" | "deadline" | "status";

function MarchesPublicsPage() {
  const { markets, configValidated } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [bMin, setBMin] = useState("");
  const [bMax, setBMax] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const sort = useSort<SortKey>("deadline");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = markets.filter((m) => {
      if (
        needle &&
        !`${m.ref} ${m.client} ${m.objet} ${m.category} ${m.zone}`.toLowerCase().includes(needle)
      )
        return false;
      if (status !== "all" && m.status !== status) return false;
      if (category !== "all" && m.category !== category) return false;
      if (bMin && m.budget < Number(bMin)) return false;
      if (bMax && m.budget > Number(bMax)) return false;
      if (from && m.deadline < from) return false;
      if (to && m.deadline > to) return false;
      return true;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sort.key === "budget") return (a.budget - b.budget) * dir;
      const av = String(a[sort.key]);
      const bv = String(b[sort.key]);
      return av.localeCompare(bv, "fr") * dir;
    });
  }, [markets, q, status, category, bMin, bMax, from, to, sort.key, sort.dir]);

  const pagination = usePagination(filtered.length);
  const rows = filtered.slice(pagination.start, pagination.end);

  const reset = () => {
    setQ("");
    setStatus("all");
    setCategory("all");
    setBMin("");
    setBMax("");
    setFrom("");
    setTo("");
    pagination.reset();
  };

  return (
    <AppLayout
      title="Marchés Publics"
      subtitle="Appels d'offres identifiés par l'agent de veille et suivis jusqu'à la soumission."
      actions={<VeilleButton />}
    >
      {!configValidated && (
        <div className="mb-5 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
          Configurez vos critères de veille avant de lancer une recherche —{" "}
          <Link to="/configuration" className="font-medium text-primary underline">
            aller à la Configuration
          </Link>
        </div>
      )}

      <Card className="glass-card overflow-hidden p-0">
        <div className="grid gap-4 border-b border-border p-4 lg:grid-cols-12">
          <div className="relative lg:col-span-4">
            <Label className="mb-1.5 block text-xs text-muted-foreground">Recherche</Label>
            <Search className="absolute left-3 top-[34px] h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                pagination.reset();
              }}
              placeholder="Référence, client, mot-clé…"
              className="pl-9"
            />
          </div>
          <div className="lg:col-span-2">
            <Label className="mb-1.5 block text-xs text-muted-foreground">Statut</Label>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                pagination.reset();
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {MARKET_STEPS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-3">
            <Label className="mb-1.5 block text-xs text-muted-foreground">
              Catégorie de service
            </Label>
            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v);
                pagination.reset();
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2 lg:col-span-3">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Budget min</Label>
              <Input
                type="number"
                value={bMin}
                onChange={(e) => {
                  setBMin(e.target.value);
                  pagination.reset();
                }}
                placeholder="0"
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Budget max</Label>
              <Input
                type="number"
                value={bMax}
                onChange={(e) => {
                  setBMax(e.target.value);
                  pagination.reset();
                }}
                placeholder="5 000 000"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 lg:col-span-4">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Date limite du</Label>
              <Input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  pagination.reset();
                }}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">au</Label>
              <Input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  pagination.reset();
                }}
              />
            </div>
          </div>
          <div className="flex items-end lg:col-span-3">
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" /> Réinitialiser les filtres
            </Button>
          </div>
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
                  <TableHead>Objet</TableHead>
                  <TableHead>
                    <SortHeader label="Budget" sortKey="budget" sort={sort} />
                  </TableHead>
                  <TableHead>
                    <SortHeader label="Date limite" sortKey="deadline" sort={sort} />
                  </TableHead>
                  <TableHead>
                    <SortHeader label="Statut" sortKey="status" sort={sort} />
                  </TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((m) => (
                  <motion.tr
                    key={m.ref}
                    initial={m.isNew ? { backgroundColor: "rgba(0,104,189,0.16)" } : false}
                    animate={{ backgroundColor: "rgba(0,0,0,0)" }}
                    transition={{ duration: 5 }}
                    className="border-b border-border transition-colors hover:bg-muted/60"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {m.ref}
                        {m.isNew && (
                          <Badge className="border-0 bg-primary text-primary-foreground">
                            Nouveau
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{m.category}</span>
                    </TableCell>
                    <TableCell>{m.client}</TableCell>
                    <TableCell className="max-w-[320px]">
                      <span className="line-clamp-2 text-sm text-muted-foreground">{m.objet}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{fmtMAD(m.budget)}</TableCell>
                    <TableCell className="whitespace-nowrap">{fmtDate(m.deadline)}</TableCell>
                    <TableCell>
                      <StatusBadge status={m.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to="/marches-publics/$ref" params={{ ref: m.ref }}>
                          Ouvrir
                        </Link>
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <Paginator pagination={pagination} total={filtered.length} />
      </Card>
    </AppLayout>
  );
}
