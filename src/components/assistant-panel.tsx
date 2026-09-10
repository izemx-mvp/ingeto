import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LOGO, USER } from "@/lib/branding";

export type AssistantContext = {
  /** Référence affichée en en-tête du panneau (dossier public ou consultation privée). */
  reference: string;
  /** Questions proposées d'un clic. */
  suggestions: string[];
  /** Réponse de l'agent pour une question libre. */
  reply: (question: string) => string;
};

/**
 * Assistant IA de dossier, partagé par les marchés publics et privés.
 * Panneau latéral animé, questions suggérées, effet de frappe simulé.
 */
export function AssistantPanel({ reference, suggestions, reply }: AssistantContext) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setOpen(false);
  }, [reference]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const ask = (question: string) => {
    if (!question.trim()) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setDraft("");
    setTyping(true);
    setTimeout(
      () => {
        setTyping(false);
        setMessages((m) => [...m, { role: "bot", text: reply(question) }]);
      },
      800 + Math.random() * 400,
    );
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="shine fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[0_0_0_0_rgba(0,104,189,0.6)] transition-shadow hover:shadow-[0_0_36px_6px_rgba(0,104,189,0.45)]"
      >
        <Sparkles className="h-4 w-4" /> Demander à l'assistant IA
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] flex-col border-l border-border bg-card shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <img src={LOGO} alt="INGETO" className="h-7 w-auto" />
              <div className="flex-1">
                <p className="font-display text-sm">Assistant du dossier</p>
                <p className="text-xs text-muted-foreground">{reference}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <div className="flex gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-primary">
                  <Bot className="h-4 w-4" />
                </span>
                <div className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm">
                  Bonjour {USER.name.split(" ")[1]}, je connais l'intégralité du dossier {reference}.
                  Que souhaitez-vous savoir ?
                </div>
              </div>

              {messages.length === 0 && (
                <div className="space-y-2 pt-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => ask(s)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent-soft"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={msg.role === "user" ? "flex justify-end" : "flex gap-2"}
                >
                  {msg.role === "bot" && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-primary">
                      <Bot className="h-4 w-4" />
                    </span>
                  )}
                  <div
                    className={
                      msg.role === "user"
                        ? "max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                        : "max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm leading-relaxed"
                    }
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <p className="pl-10 text-xs italic text-muted-foreground">L'assistant écrit…</p>
              )}
              <div ref={bottom} />
            </div>

            <div className="flex gap-2 border-t border-border p-3">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ask(draft)}
                placeholder="Posez votre question…"
              />
              <Button size="icon" onClick={() => ask(draft)}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
