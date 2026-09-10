import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BellRing,
  CalendarClock,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Users,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout, StatusBadge } from "@/components/app-layout";
import { Gauge, KpiTile } from "@/components/ui-fx";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/app-store";
import { fmtDate } from "@/lib/ingeto-data";

export const Route = createFileRoute("/brigades/$id")({
  head: () => ({
    meta: [
      { title: "Fiche brigade — INGETO Control" },
      {
        name: "description",
        content:
          "Fiche détaillée d'une brigade topographique INGETO : composition, matériel, rapports de terrain, communications et performance.",
      },
      { property: "og:title", content: "Fiche brigade — INGETO Control" },
      {
        property: "og:description",
        content: "Composition, matériel, rapports, historique de missions et indicateurs de performance.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrigadeDetailPage,
});

const STATE_TONE: Record<string, string> = {
  Opérationnel: "bg-success/12 text-success",
  "En maintenance": "bg-warning/15 text-warning",
  "À étalonner": "bg-accent-soft text-primary",
};

function BrigadeDetailPage() {
  const { id } = useParams({ from: "/brigades/$id" });
  const { brigades, relanceBrigade, assignMission, markets } = useStore();
  const brigade = brigades.find((b) => b.id === id);
  const [relanceOpen, setRelanceOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignRef, setAssignRef] = useState("");

  if (!brigade) {
    return (
      <AppLayout title="Brigade introuvable" subtitle="Cette brigade n'existe pas ou plus.">
        <Button asChild variant="outline">
          <Link to="/brigades">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux brigades
          </Link>
        </Button>
      </AppLayout>
    );
  }

  const assignMarket = markets.find((m) => m.ref === assignRef);

  return (
    <AppLayout
      title={brigade.name}
      subtitle={`${brigade.zone} — chef de brigade ${brigade.chef}`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/brigades">
              <ArrowLeft className="mr-2 h-4 w-4" /> Toutes les brigades
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setAssignOpen(true);
              setAssignRef("");
            }}
          >
            <Send className="mr-2 h-4 w-4" /> Affecter une mission
          </Button>
          <Button
            className="shine"
            onClick={() => {
              setRelanceOpen(true);
              setMessage("");
            }}
          >
            <BellRing className="mr-2 h-4 w-4" /> Relancer la brigade
          </Button>
        </div>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          label="Ponctualité sur chantier"
          value={brigade.perf.punctuality}
          suffix="%"
          tone="primary"
        />
        <KpiTile
          label="Taux de rapports transmis"
          value={brigade.perf.reportRate}
          suffix="%"
          tone="success"
          delay={0.05}
        />
        <KpiTile
          label="Délai moyen de remontée"
          value={brigade.perf.avgDelay}
          decimals={1}
          suffix="jours"
          tone="accent"
          delay={0.1}
        />
        <KpiTile
          label="Missions réalisées cette année"
          value={brigade.perf.missionsYear}
          tone="warning"
          delay={0.15}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card">
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-sm">
                    <MapPin className="h-4 w-4 text-primary" /> {brigade.location}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Coordonnées Lambert : {brigade.coords}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {brigade.phone}
                  </p>
                </div>
                <StatusBadge status={brigade.status} />
              </div>

              <div className="rounded-xl border border-border bg-muted/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Chantier en cours
                </p>
                <p className="mt-1 font-medium">{brigade.chantier}</p>
                {brigade.marketRef && (
                  <Link
                    to="/marches-publics/$ref"
                    params={{ ref: brigade.marketRef }}
                    className="mt-1 inline-block text-xs font-medium text-primary underline"
                  >
                    Voir le dossier {brigade.marketRef}
                  </Link>
                )}
                <div className="mt-3">
                  <Gauge
                    value={brigade.progress}
                    label={`Avancement des levés : ${brigade.progress} %`}
                    tone="success"
                  />
                </div>
              </div>

              <Tabs defaultValue="rapports">
                <TabsList>
                  <TabsTrigger value="rapports">Rapports de terrain</TabsTrigger>
                  <TabsTrigger value="comms">Communications</TabsTrigger>
                  <TabsTrigger value="missions">Historique missions</TabsTrigger>
                </TabsList>

                <TabsContent value="rapports" className="space-y-3 pt-4">
                  {brigade.reports.map((r, i) => (
                    <div key={i} className="rounded-lg border border-border bg-card p-3">
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarClock className="h-3.5 w-3.5" /> {fmtDate(r.date)} — {r.author}
                      </p>
                      <p className="mt-1 text-sm">{r.text}</p>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="comms" className="pt-4">
                  <ol className="relative space-y-4 border-l border-border pl-5">
                    {brigade.comms.map((c, i) => (
                      <li key={i}>
                        <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-card bg-primary" />
                        <p className="text-xs text-muted-foreground">
                          {fmtDate(c.date)} • {c.kind}
                        </p>
                        <p className="text-sm">{c.text}</p>
                      </li>
                    ))}
                  </ol>
                </TabsContent>

                <TabsContent value="missions" className="space-y-3 pt-4">
                  {brigade.missions.map((m, i) => (
                    <div key={i} className="rounded-lg border border-border bg-card p-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{m.chantier}</p>
                        <span className="text-xs text-muted-foreground">{m.ref}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {m.client} • du {fmtDate(m.start)} au {fmtDate(m.end)}
                      </p>
                      <p className="mt-1 text-xs text-success">Livrable remis : {m.delivered}</p>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardContent className="p-6">
              <p className="flex items-center gap-2 font-display">
                <Users className="h-4 w-4 text-primary" /> Composition de la brigade
              </p>
              <ul className="mt-3 space-y-2">
                {brigade.members.map((m) => (
                  <li
                    key={m.name}
                    className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm"
                  >
                    <span>{m.name}</span>
                    <span className="text-xs text-muted-foreground">{m.role}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <p className="flex items-center gap-2 font-display">
                <Wrench className="h-4 w-4 text-primary" /> Matériel affecté
              </p>
              <ul className="mt-3 space-y-2">
                {brigade.equipment.map((e) => (
                  <li key={e.serial} className="rounded-lg bg-muted/60 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span>{e.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATE_TONE[e.state] ?? ""}`}
                      >
                        {e.state}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">N° série {e.serial}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="space-y-2 p-6 text-sm">
              <p className="flex items-center gap-2 font-display">
                <MessageSquare className="h-4 w-4 text-primary" /> Dernier point
              </p>
              <p className="text-xs text-muted-foreground">
                Rapport du {fmtDate(brigade.lastReportDate)} — il y a {brigade.daysSinceReport}{" "}
                jour(s)
              </p>
              <p>{brigade.lastReport}</p>
              {brigade.relanceSentAt && (
                <p className="rounded-md bg-success/10 px-2 py-1 text-xs text-success">
                  Relance envoyée le {fmtDate(brigade.relanceSentAt)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={relanceOpen} onOpenChange={setRelanceOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-display text-lg">Relancer {brigade.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Message envoyé à {brigade.chef} ({brigade.phone}) pour obtenir un rapport de terrain
            immédiat.
          </p>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message de relance (facultatif)…"
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRelanceOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                relanceBrigade(brigade.id, message);
                toast.success(`Relance envoyée à ${brigade.name}.`);
                setRelanceOpen(false);
              }}
            >
              Envoyer la relance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-display text-lg">
            Affecter {brigade.name} à un dossier
          </DialogTitle>
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
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Annuler
            </Button>
            <Button
              disabled={!assignRef}
              onClick={() => {
                if (assignMarket) {
                  assignMission(brigade.id, assignMarket.ref, assignMarket.objet);
                  toast.success(`${brigade.name} affectée au dossier ${assignMarket.ref}.`);
                }
                setAssignOpen(false);
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
