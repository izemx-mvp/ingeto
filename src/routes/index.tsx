import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Lock, Mail, Zap } from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/login-hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOGO } from "@/lib/branding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Connexion — INGETO Control" },
      {
        name: "description",
        content:
          "Accédez au backoffice INGETO : veille des marchés publics et privés, dossiers de soumission, brigades terrain et facturation.",
      },
      { property: "og:title", content: "Connexion — INGETO Control" },
      {
        property: "og:description",
        content: "Backoffice interne du cabinet d'ingénierie topographique INGETO.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("a.karroum@ingeto.ma");
  const [password, setPassword] = useState("Ingeto@2026");

  const enter = () => navigate({ to: "/dashboard" });

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="aurora-bg flex items-center justify-center px-6 py-12 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <img src={LOGO} alt="INGETO" className="h-11 w-auto object-contain" />
          <h1 className="mt-8 font-display text-3xl">Bienvenue sur INGETO Control</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Le poste de pilotage de vos agents IA : veille des marchés, dossiers de soumission,
            brigades terrain et décomptes.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              enter();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg">
              Se connecter <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="glass-card mt-8 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" /> Accès démonstration
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Environnement de démonstration avec données mockées cohérentes — aucune donnée réelle
              n'est transmise.
            </p>
            <Button variant="outline" className="mt-3 w-full" onClick={enter} type="button">
              Connexion instantanée (démo)
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={heroImage}
          alt="Géomètre INGETO réalisant un levé topographique avec une station totale"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/90 via-primary/70 to-primary-glow/50" />
        <div className="relative flex h-full flex-col justify-end p-12 text-primary-foreground">
          <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] opacity-80">
            <Compass className="h-4 w-4" /> Témara · Maroc
          </div>
          <h2 className="mt-4 font-display text-4xl leading-tight text-primary-foreground">
            INGETO Control
          </h2>
          <p className="mt-3 max-w-md text-base opacity-90">
            De l'appel d'offres au décompte final : vos agents IA surveillent les portails,
            vérifient les dossiers et pilotent vos brigades sur le terrain.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
            {[
              ["6", "domaines d'expertise"],
              ["24/7", "veille des portails"],
              ["5", "brigades terrain"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-lg bg-white/10 p-3 backdrop-blur">
                <p className="font-display text-2xl">{v}</p>
                <p className="opacity-80">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
