import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertTriangle, BellRing, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppLayout, StatusBadge } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/app-store";
import { fmtDate, fmtMAD } from "@/lib/ingeto-data";

export const Route = createFileRoute("/dossiers")({
  validateSearch: (search: Record<string, unknown>): { tab?: "dossiers" | "relances" } => ({
    tab: search.tab === "relances" ? "relances" : "dossiers",
  }),
  head: () => ({
    meta: [
      { title: "Dossiers & Relances — INGETO Control" },
      {
        name: "description",
        content:
          "Dossiers de soumission en cours et relances en attente chez INGETO : informations manquantes et brigades silencieuses.",
      },
      { property: "og:title", content: "Dossiers & Relances — INGETO Control" },
      {
        property: "og:description",
        content: "Suivi des dossiers en cours et des relances à effectuer.",
      },
    ],
  }),
  component: DossiersPage,
});

function DossiersPage() {
  const { tab } = useSearch({ from: "/dossiers" });
  const navigate = useNavigate();
  const { markets, brigades, relanceBrigade, markManuallyCompleted } = useStore();
  const [q, setQ] = useState("");

  const needle = q.trim().toLowerCase();

  const dossiers = useMemo(
    () =>
      markets
        .filter((m) => m.status !== "Résultat")
        .filter((m) => !needle || `${m.ref} ${m.client} ${m.objet}`.toLowerCase().includes(needle)),
    [markets, needle],
  );

  const relances = useMemo(() => {
    const infos = markets
      .filter((m) => m.partialInfo)
      .map((m) => ({
        kind: "dossier" as const,
        id: m.ref,
        title: m.ref,
        detail: `Informations non publiées par le portail — à compléter manuellement (${m.client})`,
        meta: `${m.category} · ${fmtMAD(m.budget)} · limite ${fmtDate(m.deadline)}`,
      }));
    const brg = brigades
      .filter((b) => b.daysSinceReport > 5)
      .map((b) => ({
        kind: "brigade" as const,
        id: b.id,
        title: b.name,
        detail: `${b.daysSinceReport} jours sans rapport de terrain — ${b.chantier}`,
        meta: `${b.location} · dernier rapport ${fmtDate(b.lastReportDate)}`,
      }));
    return [...infos, ...brg].filter(
      (r) => !needle || `${r.title} ${r.detail}`.toLowerCase().includes(needle),
    );
  }, [markets, brigades, needle]);

  const active = tab ?? "dossiers";

  return (
    <AppLayout
      title="Dossiers & Relances"
      subtitle="Dossiers en cours de préparation et actions de relance à traiter."
    >
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Tabs
          value={active}
          onValueChange={(v) =>
            navigate({ to: "/dossiers", search: { tab: v as "dossiers" | "relances" } })
          }
        >
          <TabsList>
            <TabsTrigger value="dossiers">Dossiers en cours ({dossiers.length})</TabsTrigger>
            <TabsTrigger value="relances">Relances en attente ({relances.length})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Référence, client, brigade…"
            className="pl-9"
          />
        </div>
      </div>

      {active === "dossiers" ? (
        dossiers.length === 0 ? (
          <Card className="glass-card p-12 text-center font-display">
            Aucun résultat pour cette recherche
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dossiers.map((m, i) => (
              <motion.div
                key={m.ref}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="glass-card lift h-full">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-base">{m.ref}</p>
                        <p className="text-xs text-muted-foreground">{m.client}</p>
                      </div>
                      <StatusBadge status={m.status} />
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{m.objet}</p>
                    <p className="text-sm">
                      {fmtMAD(m.budget)} · limite {fmtDate(m.deadline)}
                    </p>
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <Link to="/marches-publics/$ref" params={{ ref: m.ref }}>
                        Ouvrir le dossier <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )
      ) : relances.length === 0 ? (
        <Card className="glass-card p-12 text-center font-display">
          Aucune relance en attente
        </Card>
      ) : (
        <div className="space-y-3">
          {relances.map((r, i) => (
            <motion.div
              key={`${r.kind}-${r.id}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="glass-card">
                <CardContent className="flex flex-wrap items-center gap-4 p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15 text-warning">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                  <div className="min-w-[220px] flex-1">
                    <p className="font-display text-base">{r.title}</p>
                    <p className="text-sm text-muted-foreground">{r.detail}</p>
                    <p className="text-xs text-muted-foreground">{r.meta}</p>
                  </div>
                  {r.kind === "brigade" ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        relanceBrigade(r.id);
                        toast.success(`Relance envoyée à ${r.title}.`);
                      }}
                    >
                      <BellRing className="mr-2 h-4 w-4" /> Relancer la brigade
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          markManuallyCompleted(r.id);
                          toast.success(`Informations de ${r.id} complétées manuellement.`);
                        }}
                      >
                        Marquer comme complété
                      </Button>
                      <Button asChild size="sm">
                        <Link to="/marches-publics/$ref" params={{ ref: r.id }}>
                          Ouvrir
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
