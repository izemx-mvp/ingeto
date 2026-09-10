import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Coins,
  FileStack,
  Landmark,
  Settings2,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppLayout } from "@/components/app-layout";
import { VeilleButton } from "@/components/veille-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/app-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — INGETO Control" },
      {
        name: "description",
        content:
          "Vue d'ensemble INGETO : marchés suivis, dossiers en cours, budget en jeu, brigades terrain et activité des agents IA.",
      },
      { property: "og:title", content: "Tableau de bord — INGETO Control" },
      {
        property: "og:description",
        content: "Pilotage des agents IA de veille, de soumission et de facturation d'INGETO.",
      },
    ],
  }),
  component: DashboardPage,
});

function useCountUp(value: number, duration = 1100) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return n;
}

const chartData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 7, 12 + i);
  return {
    day: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    identifies: 2 + ((i * 7) % 6) + (i % 5 === 0 ? 3 : 0),
    soumis: 1 + ((i * 3) % 4),
  };
});

function KpiCard({
  label,
  value,
  suffix,
  icon: Icon,
  to,
  search,
  delay,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: typeof Landmark;
  to: string;
  search?: Record<string, string>;
  delay: number;
}) {
  const n = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <Link to={to} search={search as never} className="block">
        <Card className="glass-card lift h-full">
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-primary">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="font-display text-2xl text-foreground">
              {n.toLocaleString("fr-MA")}
              {suffix ? <span className="ml-1 text-sm text-muted-foreground">{suffix}</span> : null}
            </p>
            <p className="text-sm leading-snug text-muted-foreground">{label}</p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function DashboardPage() {
  const { markets, deals, brigades, configValidated, activity } = useStore();
  const dossiersEnCours = markets.filter((m) => m.status !== "Résultat").length;
  const budget = markets.reduce((s, m) => s + m.budget, 0);
  const brigadesActives = brigades.filter((b) => b.status !== "Sans nouvelles").length;
  const relances =
    brigades.filter((b) => b.status === "Sans nouvelles").length +
    markets.filter((m) => m.partialInfo).length;

  return (
    <AppLayout
      title="Tableau de bord"
      subtitle="Vue consolidée de la veille, des dossiers, des brigades et de la facturation."
      actions={<VeilleButton />}
    >
      {!configValidated && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3"
        >
          <AlertTriangle className="h-5 w-5 text-warning" />
          <p className="flex-1 text-sm">
            Configurez vos critères de veille avant de lancer une recherche.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link to="/configuration">
              <Settings2 className="mr-2 h-4 w-4" /> Configurer
            </Link>
          </Button>
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Marchés suivis (publics + privés)"
          value={markets.length + deals.length}
          icon={Landmark}
          to="/marches-publics"
          delay={0}
        />
        <KpiCard
          label="Dossiers en cours"
          value={dossiersEnCours}
          icon={FileStack}
          to="/dossiers"
          delay={0.06}
        />
        <KpiCard
          label="Budget total en jeu (MAD)"
          value={budget}
          icon={Coins}
          to="/facturation"
          delay={0.12}
        />
        <KpiCard
          label="Brigades actives sur le terrain"
          value={brigadesActives}
          icon={Truck}
          to="/brigades"
          delay={0.18}
        />
        <KpiCard
          label="Relances en attente"
          value={relances}
          icon={AlertTriangle}
          to="/dossiers"
          search={{ tab: "relances" }}
          delay={0.24}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="glass-card lift lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-display text-lg">Activité des 30 derniers jours</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -20, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={4} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <RTooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="identifies"
                  name="Marchés identifiés"
                  stroke="var(--primary)"
                  fill="url(#g1)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="soumis"
                  name="Dossiers soumis"
                  stroke="var(--accent)"
                  fill="url(#g2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card lift lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Bot className="h-5 w-5 text-primary" /> Activité récente des agents IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.slice(0, 6).map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex gap-3"
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm leading-snug">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
