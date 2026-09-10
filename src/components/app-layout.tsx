import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Building2,
  FileStack,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Search,
  Settings2,
  Truck,
  User,
  Landmark,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LOGO, USER } from "@/lib/branding";
import { useStore } from "@/lib/app-store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/configuration", label: "Configuration", icon: Settings2 },
  { to: "/marches-publics", label: "Marchés Publics", icon: Landmark },
  { to: "/marches-prives", label: "Marchés Privés", icon: Building2 },
  { to: "/dossiers", label: "Dossiers & Relances", icon: FileStack },
  { to: "/brigades", label: "Brigades Terrain", icon: Truck },
  { to: "/facturation", label: "Facturation & Décompte", icon: Receipt },
] as const;

export function AppLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { sidebarCollapsed, toggleSidebar, activity, markActivityRead, markets } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [quick, setQuick] = useState("");
  const unread = activity.filter((a) => a.unread).length;

  const go = () => {
    const q = quick.trim().toUpperCase();
    if (!q) return;
    const found = markets.find((m) => m.ref.toUpperCase() === q);
    if (found) {
      navigate({ to: "/marches-publics/$ref", params: { ref: found.ref } });
      setQuick("");
    } else {
      toast.error("Aucun dossier avec cette référence");
    }
  };

  return (
    <div className="aurora-bg min-h-screen bg-background">
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 260 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden border-r border-border bg-card/85 backdrop-blur-xl"
      >
        <div
          className={cn(
            "flex h-20 shrink-0 items-center border-b border-border px-3",
            sidebarCollapsed ? "justify-center" : "justify-start px-5",
          )}
        >
          <img
            src={LOGO}
            alt="INGETO"
            className={cn("w-auto object-contain", sidebarCollapsed ? "h-7" : "h-9")}
          />
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            const link = (
              <Link
                to={to}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  sidebarCollapsed && "justify-center px-0",
                  active
                    ? "bg-accent-soft font-medium text-primary"
                    : "text-foreground/75 hover:bg-muted hover:text-foreground",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-primary" />
                )}
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <AnimatePresence initial={false}>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="truncate"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
            return sidebarCollapsed ? (
              <Tooltip key={to}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            ) : (
              <div key={to}>{link}</div>
            );
          })}
        </nav>
        <div className="border-t border-border p-2">
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              sidebarCollapsed && "justify-center px-0",
            )}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-[18px] w-[18px]" />
            ) : (
              <PanelLeftClose className="h-[18px] w-[18px]" />
            )}
            {!sidebarCollapsed && <span>Réduire</span>}
          </button>
        </div>
      </motion.aside>

      <motion.div
        animate={{ marginLeft: sidebarCollapsed ? 64 : 260 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex min-h-screen flex-col"
      >
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="relative w-full max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={quick}
              onChange={(e) => setQuick(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && go()}
              placeholder="Aller à… (réf. exacte, ex. AO-2026-ONCF-207)"
              className="pl-9"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Popover onOpenChange={(o) => o && markActivityRead()}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {unread > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                      {unread}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-96 p-0">
                <div className="border-b border-border px-4 py-3">
                  <p className="font-display text-sm">Activité des agents IA</p>
                </div>
                <ScrollArea className="max-h-80">
                  <div className="divide-y divide-border">
                    {activity.slice(0, 8).map((a) => (
                      <div key={a.id} className="px-4 py-3">
                        <p className="text-sm leading-snug">{a.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{a.time}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border px-2 py-1.5 transition-colors hover:bg-muted">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      {USER.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm sm:inline">Abdelmoutalib Karroum</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm">{USER.name}</p>
                  <p className="text-xs font-normal text-muted-foreground">{USER.role}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast("Profil INGETO — démonstration")}>
                  <User className="mr-2 h-4 w-4" /> Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/" })}>
                  <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 px-4 py-6 sm:px-6 lg:px-8"
        >
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl text-foreground sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
          {children}
        </motion.main>
      </motion.div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Identifié: "bg-secondary text-primary",
    Analysé: "bg-accent-soft text-primary",
    "Dossier vérifié": "bg-accent/15 text-accent",
    "Documents générés": "bg-primary/10 text-primary",
    Soumis: "bg-success/15 text-success",
    Résultat: "bg-success/20 text-success",
    Correspond: "bg-success/15 text-success",
    "Ne correspond pas": "bg-destructive/10 text-destructive",
    "À vérifier": "bg-warning/20 text-warning",
    "À analyser": "bg-secondary text-muted-foreground",
    Active: "bg-success/15 text-success",
    "En intervention": "bg-accent-soft text-primary",
    "Sans nouvelles": "bg-destructive/10 text-destructive",
    Brouillon: "bg-secondary text-muted-foreground",
    Émis: "bg-accent-soft text-primary",
    Payé: "bg-success/15 text-success",
  };
  return (
    <Badge variant="secondary" className={cn("border-0 font-medium", map[status] ?? "")}>
      {status}
    </Badge>
  );
}
