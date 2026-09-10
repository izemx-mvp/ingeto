import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  BellRing,
  CalendarClock,
  LayoutGrid,
  List,
  MapPin,
  Search,
  Send,
  Users,
  UserRound,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppLayout, StatusBadge } from "@/components/app-layout";
import { Gauge, KpiTile } from "@/components/ui-fx";
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
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/app-store";
import { fmtDate } from "@/lib/ingeto-data";

export const Route = createFileRoute("/brigades/")({
  head: () => ({
    meta: [
      { title: "Brigades Terrain — INGETO Control" },
      {
        name: "description",
        content:
          "Suivi des cinq brigades topographiques d'INGETO : localisation, chantier en cours, matériel, rapports de terrain et relances.",
      },
      { property: "og:title", content: "Brigades Terrain — INGETO Control" },
      {
        property: "og:description",
        content: "Localisation, rapports de terrain, performance et alertes d'absence de nouvelles.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrigadesPage,
});

const THRESHOLD = 5;

function BrigadesPage() {
  const { brigades, relanceBrigade, assignMission, markets } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [zone, setZone] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [relance, setRelance] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [assign, setAssign] = useState<string | null>(null);
  const [assignRef, setAssignRef] = useState("");

  const zones = useMemo(() => [...new Set(brigades.map((b) => b.zone))], [brigades]);

  const filtered = useMemo(
    () =>
      brigades.filter((b) => {
        const needle = q.trim().toLowerCase();
        if (
          needle &&
          !`${b.name} ${b.location} ${b.chef} ${b.chantier} ${b.zone}`.toLowerCase().includes(needle)
        )
          return false;
        if (status !== "all" && b.status !== status) return false;
        if (zone !== "all" && b.zone !== zone) return false;
        return true;
      }),
    [brigades, q, status, zone],
  );

  const alerts = brigades.filter((b) => b.daysSinceReport > THRESHOLD).length;
  const active = brigades.filter((b) => b.status !== "Sans nouvelles").length;
  const people = brigades.reduce((s, b) => s + b.members.length, 0);
  const avgDelay =
    brigades.reduce((s, b) => s + b.perf.avgDelay, 0) / Math.max(1, brigades.length);

  const relanceTarget = brigades.find((b) => b.id === relance);
  const assignTarget = brigades.find((b) => b.id === assign);
  const assignMarket = markets.find((m) => m.ref === assignRef);

  return (
    <AppLayout
      title="Brigades Terrain"
      subtitle="Cinq brigades suivies en temps réel, avec alerte automatique au-delà de 5 jours sans rapport."
      actions={
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          <Button
            size="sm"
            variant={view === "grid" ? "default" : "ghost"}
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="mr-1.5 h-4 w-4" /> Cartes
          </Button>
          <Button
            size="sm"
            variant={view === "list" ? "default" : "ghost"}
            onClick={() => setView("list")}
          >
            <List className="mr-1.5 h-4 w-4" /> Liste
          </Button>
        </div>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          label="Brigades opérationnelles"
          value={active}
          suffix={`/ ${brigades.length}`}
          icon={<Users className="h-4 w-4" />}
          tone="primary"
        />
        <KpiTile
          label="Brigades sans nouvelles > 5 jours"
          value={alerts}
          icon={<BellRing className="h-4 w-4" />}
          tone="warning"
          delay={0.05}
        />
        <KpiTile
          label="Topographes sur le terrain"
          value={people}
          icon={<UserRound className="h-4 w-4" />}
          tone="accent"
          delay={0.1}
        />
        <KpiTile
          label="Délai moyen de remontée d'un rapport"
          value={avgDelay}
          decimals={1}
          suffix="jours"
          icon={<CalendarClock className="h-4 w-4" />}
          tone="success"
          delay={0.15}
        />
      </div>

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
          <SelectTrigger className="w-[190px]">
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
        <Select value={zone} onValueChange={setZone}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les régions</SelectItem>
            {zones.map((z) => (
              <SelectItem key={z} value={z}>
                {z}
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
      ) : view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((b, i) => {
            const alert = b.daysSinceReport > THRESHOLD;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass-card lift h-full">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          to="/brigades/$id"
                          params={{ id: b.id }}
                          className="font-display text-lg hover:text-primary hover:underline"
                        >
                          {b.name}
                        </Link>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <UserRound className="h-3.5 w-3.5" /> {b.chef} • {b.members.length}{" "}
                          personnes
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
                      <div className="mt-2">
                        <Gauge value={b.progress} label={`Avancement ${b.progress} %`} tone="success" />
                      </div>
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Wrench className="h-3.5 w-3.5" /> {b.equipment.length} équipements affectés
                    </p>
                    <div className="text-sm">
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarClock className="h-3.5 w-3.5" /> Dernier rapport le{" "}
                        {fmtDate(b.lastReportDate)}
                      </p>
                      <p className="mt-1 line-clamp-2 text-foreground/85">{b.lastReport}</p>
                    </div>
                    {b.relanceSentAt && (
                      <p className="rounded-md bg-success/10 px-2 py-1 text-xs text-success">
                        Relance envoyée le {fmtDate(b.relanceSentAt)}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button asChild size="sm" variant="outline">
                        <Link to="/brigades/$id" params={{ id: b.id }}>
                          Fiche brigade
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAssign(b.id);
                          setAssignRef("");
                        }}
                      >
                        <Send className="mr-1.5 h-4 w-4" /> Affecter
                      </Button>
                      {alert && (
                        <Button
                          size="sm"
                          className="shine"
                          onClick={() => {
                            setRelance(b.id);
                            setMessage("");
                          }}
                        >
                          <BellRing className="mr-1.5 h-4 w-4" /> Relancer
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="glass-card divide-y divide-border p-0">
          {filtered.map((b) => {
            const alert = b.daysSinceReport > THRESHOLD;
            return (
              <div key={b.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-[220px] flex-1">
                  <Link
                    to="/brigades/$id"
                    params={{ id: b.id }}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {b.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {b.chef} • {b.zone}
                  </p>
                </div>
                <p className="min-w-[220px] flex-1 text-sm text-muted-foreground">{b.chantier}</p>
                <div className="w-32">
                  <Gauge value={b.progress} tone="success" />
                </div>
                <p className="w-32 text-sm">{fmtDate(b.lastReportDate)}</p>
                <StatusBadge status={b.status} />
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/brigades/$id" params={{ id: b.id }}>
                      Fiche
                    </Link>
                  </Button>
                  {alert && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setRelance(b.id);
                        setMessage("");
                      }}
                    >
                      Relancer
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <Dialog open={!!relance} onOpenChange={(o) => !o && setRelance(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-display text-lg">
            Relancer {relanceTarget?.name} ?
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Un message sera envoyé à {relanceTarget?.chef} ({relanceTarget?.phone}) pour demander un
            rapport de terrain immédiat sur le chantier « {relanceTarget?.chantier} ».
          </p>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message de relance (facultatif)…"
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRelance(null)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (relance) relanceBrigade(relance, message);
                toast.success(`Relance envoyée à ${relanceTarget?.name}.`);
                setRelance(null);
              }}
            >
              Envoyer la relance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assign} onOpenChange={(o) => !o && setAssign(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-display text-lg">
            Affecter {assignTarget?.name} à un dossier
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            La brigade passera en intervention sur le chantier du dossier choisi.
          </p>
          <Select value={assignRef} onValueChange={setAssignRef}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un dossier de marché public" />
            </SelectTrigger>
            <SelectContent>
              {markets.slice(0, 12).map((m) => (
                <SelectItem key={m.ref} value={m.ref}>
                  {m.ref} — {m.client}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssign(null)}>
              Annuler
            </Button>
            <Button
              disabled={!assignRef}
              onClick={() => {
                if (assign && assignMarket) {
                  assignMission(assign, assignMarket.ref, assignMarket.objet);
                  toast.success(`${assignTarget?.name} affectée au dossier ${assignMarket.ref}.`);
                }
                setAssign(null);
              }}
            >
              Confirmer l'affectation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
