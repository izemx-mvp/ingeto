import { motion } from "framer-motion";
import { Radar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useStore } from "@/lib/app-store";

const STEPS = [
  "Connexion au portail des marchés publics…",
  "Filtrage selon vos critères enregistrés…",
  "Analyse des nouvelles offres…",
  "Rapprochement avec les capacités du cabinet…",
];

export function VeilleButton({ variant = "default" }: { variant?: "default" | "outline" }) {
  const { configValidated, runVeille, clearNewFlags } = useStore();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const start = () => {
    setOpen(true);
    setStep(0);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setStep(i);
      if (i >= STEPS.length) {
        clearInterval(timer);
        const added = runVeille();
        setTimeout(() => {
          setOpen(false);
          if (added.length > 0) {
            toast.success(
              `${added.length} nouveaux marchés identifiés correspondant à vos critères.`,
            );
            setTimeout(clearNewFlags, 6000);
          } else {
            toast.info(
              "Aucun nouveau marché ne correspond à vos critères actuels — élargissez la configuration.",
            );
          }
        }, 450);
      }
    }, 650);
  };

  const btn = (
    <Button variant={variant} disabled={!configValidated} onClick={start}>
      <Radar className="mr-2 h-4 w-4" /> Lancer la veille
    </Button>
  );

  return (
    <>
      {configValidated ? (
        btn
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-not-allowed">{btn}</span>
          </TooltipTrigger>
          <TooltipContent>
            Enregistrez d'abord vos critères dans la page Configuration
          </TooltipContent>
        </Tooltip>
      )}

      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogTitle className="font-display text-lg">Veille en cours</DialogTitle>
          <Progress value={(step / STEPS.length) * 100} className="mt-2" />
          <div className="mt-4 space-y-2">
            {STEPS.map((s, i) => (
              <motion.p
                key={s}
                animate={{ opacity: i < step ? 1 : i === step ? 0.9 : 0.35 }}
                className="flex items-center gap-2 text-sm"
              >
                <span
                  className={
                    i < step
                      ? "h-2 w-2 rounded-full bg-success"
                      : i === step
                        ? "h-2 w-2 animate-pulse rounded-full bg-primary"
                        : "h-2 w-2 rounded-full bg-border"
                  }
                />
                {s}
              </motion.p>
            ))}
          </div>
          <div className="mt-4 h-10 shimmer rounded-md" />
        </DialogContent>
      </Dialog>
    </>
  );
}
