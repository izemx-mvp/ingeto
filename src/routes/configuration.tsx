import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Lock, Plus, Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CAPABILITIES, CLIENT_TYPES, useStore, type Config } from "@/lib/app-store";
import { CATEGORIES, type Category } from "@/lib/ingeto-data";

export const Route = createFileRoute("/configuration")({
  head: () => ({
    meta: [
      { title: "Configuration de la veille — INGETO Control" },
      {
        name: "description",
        content:
          "Définissez les critères de veille des marchés publics et privés d'INGETO : catégories, zones, budgets, mots-clés et portails surveillés.",
      },
      { property: "og:title", content: "Configuration de la veille — INGETO Control" },
      {
        property: "og:description",
        content: "Critères de veille, capacités techniques et portails surveillés.",
      },
    ],
  }),
  component: ConfigurationPage,
});

function TagField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
        />
        <Button type="button" variant="outline" size="icon" onClick={add}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.length === 0 && <p className="text-xs text-muted-foreground">Aucun élément</p>}
        {values.map((v) => (
          <Badge key={v} variant="secondary" className="gap-1 border-0 bg-accent-soft text-primary">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ConfigurationPage() {
  const { config, setConfig, configValidated, saveConfig } = useStore();

  const patch = (p: Partial<Config>) => setConfig((c) => ({ ...c, ...p }));
  const toggleIn = <T extends string>(list: T[], v: T) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  return (
    <AppLayout
      title="Configuration"
      subtitle="Prérequis à toute veille : définissez les critères que vos agents IA doivent appliquer."
      actions={
        configValidated ? (
          <Badge className="border-0 bg-success/15 px-3 py-1.5 text-success">
            <CheckCircle2 className="mr-1.5 h-4 w-4" /> Configuration active
          </Badge>
        ) : (
          <Badge variant="secondary" className="border-0 px-3 py-1.5 text-muted-foreground">
            Configuration non validée
          </Badge>
        )
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card lift lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">Critères marché public</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label>Catégories de service surveillées</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    <Checkbox
                      checked={config.categories.includes(cat)}
                      onCheckedChange={() =>
                        patch({ categories: toggleIn<Category>(config.categories, cat) })
                      }
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-5">
              <TagField
                label="Zones géographiques"
                values={config.zones}
                onChange={(zones) => patch({ zones })}
                placeholder="ex. Rabat-Salé-Kénitra"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="bmin">Budget minimum (MAD)</Label>
                  <Input
                    id="bmin"
                    type="number"
                    value={config.budgetMin}
                    onChange={(e) => patch({ budgetMin: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bmax">Budget maximum (MAD)</Label>
                  <Input
                    id="bmax"
                    type="number"
                    value={config.budgetMax}
                    onChange={(e) => patch({ budgetMax: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <TagField
              label="Mots-clés à inclure"
              values={config.keywordsInclude}
              onChange={(keywordsInclude) => patch({ keywordsInclude })}
              placeholder="ex. levé topographique"
            />
            <TagField
              label="Mots-clés à exclure"
              values={config.keywordsExclude}
              onChange={(keywordsExclude) => patch({ keywordsExclude })}
              placeholder="ex. géotechnique"
            />
            <div className="space-y-3 md:col-span-2">
              <Label>Capacités techniques et certifications du cabinet</Label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {CAPABILITIES.map((c) => (
                  <label
                    key={c}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    <Checkbox
                      checked={config.capabilities.includes(c)}
                      onCheckedChange={() =>
                        patch({ capabilities: toggleIn(config.capabilities, c) })
                      }
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card lift">
          <CardHeader>
            <CardTitle className="font-display text-lg">Critères marché privé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Types de clients ciblés</Label>
              <div className="grid gap-2">
                {CLIENT_TYPES.map((t) => (
                  <label
                    key={t}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    <Checkbox
                      checked={config.clientTypes.includes(t)}
                      onCheckedChange={() => patch({ clientTypes: toggleIn(config.clientTypes, t) })}
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>
            <TagField
              label="Documents types en stock (vérification automatique)"
              values={config.docTypes}
              onChange={(docTypes) => patch({ docTypes })}
              placeholder="ex. Attestation de référence"
            />
          </CardContent>
        </Card>

        <Card className="glass-card lift">
          <CardHeader>
            <CardTitle className="font-display text-lg">Portails surveillés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/70 px-3 py-3 text-sm">
                  <Checkbox checked disabled />
                  <span className="flex-1">
                    Portail marocain des marchés publics
                    <span className="block text-xs text-muted-foreground">
                      marchespublics.gov.ma
                    </span>
                  </span>
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent>Portail principal, toujours actif</TooltipContent>
            </Tooltip>
            <p className="text-xs text-muted-foreground">
              D'autres sources (portails régionaux, presse d'annonces légales) pourront être
              ajoutées ultérieurement.
            </p>
            <Button
              className="w-full"
              onClick={() => {
                saveConfig();
                toast.success("Configuration enregistrée — la veille peut être lancée.");
              }}
            >
              <Save className="mr-2 h-4 w-4" /> Enregistrer la configuration
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
