import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Compte progressivement de 0 jusqu'à la valeur finale. */
export function useCountUp(value: number, duration = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setN(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return n;
}

export function AnimatedNumber({
  value,
  decimals = 0,
  suffix,
  prefix,
  className,
}: {
  value: number;
  decimals?: number | undefined;
  suffix?: string | undefined;
  prefix?: string | undefined;
  className?: string | undefined;
}) {

  const n = useCountUp(value);
  return (
    <span className={className}>
      {prefix}
      {n.toLocaleString("fr-MA", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix ? <span className="ml-1 text-sm text-muted-foreground">{suffix}</span> : null}
    </span>
  );
}

/** Mini-KPI animé en carte de verre. */
export function KpiTile({
  label,
  value,
  suffix,
  decimals,
  icon,
  tone = "primary",
  delay = 0,
  hint,
}: {
  label: string;
  value: number;
  suffix?: string | undefined;
  decimals?: number | undefined;
  icon?: ReactNode;
  tone?: "primary" | "accent" | "success" | "warning";
  delay?: number;
  hint?: string | undefined;

}) {
  const tones: Record<string, string> = {
    primary: "bg-primary/12 text-primary",
    accent: "bg-accent/15 text-accent",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <Card className="glass-card lift h-full">
        <CardContent className="flex flex-col gap-2.5 p-5">
          {icon && (
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                tones[tone] ?? tones["primary"],
              )}
            >
              {icon}
            </span>
          )}

          <AnimatedNumber
            value={value}
            decimals={decimals}
            suffix={suffix}
            className="font-display text-2xl text-foreground"
          />
          <p className="text-sm leading-snug text-muted-foreground">{label}</p>
          {hint && <p className="text-xs text-muted-foreground/80">{hint}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** Jauge colorée horizontale (0 → 100). */
export function Gauge({
  value,
  max = 100,
  label,
  tone,
}: {
  value: number;
  max?: number;
  label?: string | undefined;
  tone?: "success" | "warning" | "destructive" | undefined;
}) {

  const pct = Math.max(4, Math.min(100, (value / max) * 100));
  const auto: "success" | "warning" | "destructive" =
    pct < 40 ? "success" : pct < 70 ? "warning" : "destructive";
  const t = tone ?? auto;
  const bar =
    t === "success" ? "bg-success" : t === "warning" ? "bg-warning" : "bg-destructive";
  return (
    <div className="space-y-1">
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn("h-full rounded-full", bar)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

const CONFETTI_COLORS = [
  "var(--primary)",
  "var(--primary-glow)",
  "var(--accent-glow)",
  "var(--warm)",
  "var(--success)",
];

/** Micro-célébration : confettis légers, montés le temps de l'animation. */
export function Confetti({ show }: { show: boolean }) {
  if (!show) return null;
  const pieces = Array.from({ length: 70 }, (_, i) => i);
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((i) => {
        const left = (i * 37) % 100;
        const dx = `${(((i * 53) % 40) - 20)}vw`;
        const delay = ((i * 17) % 60) / 100;
        return (
          <span
            key={i}
            className="confetti-piece absolute top-0 block rounded-[2px]"
            style={{
              left: `${left}%`,
              width: 7 + (i % 4),
              height: 11 + (i % 5),
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animationDelay: `${delay}s`,
              ["--dx" as string]: dx,
            }}
          />
        );
      })}
    </div>
  );
}
