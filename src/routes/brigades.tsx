import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BellRing, CalendarClock, MapPin, Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppLayout, StatusBadge } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/app-store";
import { fmtDate } from "@/lib/ingeto-data";

export const Route = createFileRoute("/brigades")({
  head: () => ({
    meta: [
      { title: "Brigades Terrain — INGETO Control" },
      {
        name: "description",
        content:
          "Suivi des brigades topographiques d'INGETO : localisation, chantier en cours, derniers rapports et relances.",
      },
      { property: "og:title", content: "Brigades Terrain — INGETO Control" },
      {
        property: "og:description",
        content: "Localisation, rapports de terrain et alertes d'absence de nouvelles.",
      },
    ],
  }),
  component: BrigadesPage,
});

const THRESHOLD = 5;

function BrigadesPage() {
  const { brigades, relanceBrigade } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [confirm, setConfirm] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      brigades.filter((b) => {
        const needle = q.trim().toLowerCase();
        if (needle && !`${b.name} ${b.location} ${b.chef} ${b.chantier}`.toLowerCase().includes(needle))
          return false;
        if (status !== "all" && b.status !== status) return false;
        return true;
      }),
    [brigades, q, status],
  );

  const target = brigades.find((b) => b.id === confirm);

  return (
    <AppLayout
      title="Brigades Terrain"
      subtitle="Cinq brigades suivies en temps réel, avec alerte automatique au-delà de 5 jours sans rapport."
    >
      <Card className="glass-card mb-6 flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nom de brigade, localisation, chef…"
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {["Active", "En intervention", "Sans nouvelles"].map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} résultat(s)</span>
      </Card>

      {filtered.length === 0 ? (
        <Card className="glass-card p-12 text-center">
          <p className="font-display">Aucun résultat pour cette recherche</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((b, i) => {
            const alert = b.daysSinceReport > THRESHOLD;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-card lift h-full">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-lg">{b.name}</p>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <UserRound className="h-3.5 w-3.5" /> {b.chef}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={b.status} />
                        {alert && (
                          <span className="alert-pulse rounded-full bg-warning/20 px-2 py-0.5 text-xs font-medium text-warning">
                            {b.daysSinceReport} j sans nouvelles
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="flex items-center gap-1.5 text-sm">
                      <MapPin className="h-4 w-4 text-primary" /> {b.location}
                    </p>
                    <div className="rounded-lg border border-border bg-muted/60 p-3 text-sm">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Chantier en cours
                      </p>
                      <p className="mt-1">{b.chantier}</p>
                      {b.marketRef && (
                        <Link
                          to="/marches-publics/$ref"
                          params={{ ref: b.marketRef }}
                          className="mt-1 inline-block text-xs font-medium text-primary underline"
                        >
                          {b.marketRef}
                        </Link>
                      )}
                    </div>
                    <div className="text-sm">
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarClock className="h-3.5 w-3.5" /> Dernier rapport le{" "}
                        {fmtDate(b.lastReportDate)}
                      </p>
                      <p className="mt-1 text-foreground/85">{b.lastReport}</p>
                    </div>
                    {b.relanceSentAt && (
                      <p className="rounded-md bg-success/10 px-2 py-1 text-xs text-success">
                        Relance envoyée le {fmtDate(b.relanceSentAt)}
                      </p>
                    )}
                    {alert && (
                      <Button size="sm" className="w-full" onClick={() => setConfirm(b.id)}>
                        <BellRing className="mr-2 h-4 w-4" /> Relancer la brigade
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-display text-lg">Relancer {target?.name} ?</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Un message sera envoyé à {target?.chef} pour demander un rapport de terrain immédiat sur
            le chantier « {target?.chantier} ».
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (confirm) relanceBrigade(confirm);
                toast.success(`Relance envoyée à ${target?.name}.`);
                setConfirm(null);
              }}
            >
              Envoyer la relance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
