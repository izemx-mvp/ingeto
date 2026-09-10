import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LOGO } from "@/lib/branding";

export type DocPreviewData = {
  title: string;
  subtitle: string;
  meta: { label: string; value: string }[];
  sections: { heading: string; body: string }[];
  table?: { columns: string[]; rows: (string | number)[][]; totalLabel?: string; total?: string };
  fileName: string;
};

export function downloadDoc(doc: DocPreviewData) {
  const lines: string[] = [
    "INGETO — Cabinet d'ingénierie topographique",
    "Témara, Maroc — contact@ingeto.ma",
    "".padEnd(64, "="),
    doc.title.toUpperCase(),
    doc.subtitle,
    "",
    ...doc.meta.map((m) => `${m.label} : ${m.value}`),
    "",
  ];
  doc.sections.forEach((s) => {
    lines.push(s.heading.toUpperCase(), "".padEnd(s.heading.length, "-"), s.body, "");
  });
  if (doc.table) {
    lines.push(doc.table.columns.join(" | "));
    doc.table.rows.forEach((r) => lines.push(r.join(" | ")));
    if (doc.table.total) lines.push("", `${doc.table.totalLabel ?? "Total"} : ${doc.table.total}`);
  }
  lines.push("", `Document généré le ${new Date().toLocaleString("fr-FR")} — INGETO Control`);
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = doc.fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function DocPreviewDialog({
  doc,
  open,
  onOpenChange,
}: {
  doc: DocPreviewData | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto p-0">
        {doc && (
          <div className="bg-background">
            <DialogTitle className="sr-only">{doc.title}</DialogTitle>
            <div className="flex items-center justify-between gap-4 border-b border-border bg-secondary/60 px-8 py-5">
              <img src={LOGO} alt="INGETO" className="h-9 w-auto" />
              <div className="text-right text-xs text-muted-foreground">
                <p className="font-display text-sm text-foreground">
                  INGETO — Ingénierie topographique
                </p>
                <p>Témara, Maroc · contact@ingeto.ma · +212 5 37 00 00 00</p>
              </div>
            </div>
            <div className="px-8 py-7">
              <h2 className="font-display text-xl text-primary">{doc.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{doc.subtitle}</p>
              <div className="mt-6 grid gap-3 rounded-lg border border-border bg-muted/60 p-4 sm:grid-cols-2">
                {doc.meta.map((m) => (
                  <div key={m.label} className="text-sm">
                    <span className="text-muted-foreground">{m.label} : </span>
                    <span className="font-medium">{m.value}</span>
                  </div>
                ))}
              </div>
              {doc.sections.map((s) => (
                <div key={s.heading} className="mt-6">
                  <h3 className="font-display text-sm uppercase tracking-wide text-primary">
                    {s.heading}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                    {s.body}
                  </p>
                </div>
              ))}
              {doc.table && (
                <div className="mt-6 overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/70">
                      <tr>
                        {doc.table.columns.map((c) => (
                          <th key={c} className="px-4 py-2 text-left font-display text-xs uppercase">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {doc.table.rows.map((r, i) => (
                        <tr key={i} className="border-t border-border">
                          {r.map((cell, j) => (
                            <td key={j} className="px-4 py-2">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                    {doc.table.total && (
                      <tfoot>
                        <tr className="border-t-2 border-primary/30 bg-accent-soft">
                          <td
                            className="px-4 py-2 font-display"
                            colSpan={doc.table.columns.length - 1}
                          >
                            {doc.table.totalLabel ?? "Total"}
                          </td>
                          <td className="px-4 py-2 font-display text-primary">{doc.table.total}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
              <div className="mt-8 flex items-end justify-between gap-6 border-t border-dashed border-border pt-6 text-xs text-muted-foreground">
                <p>
                  Document établi par INGETO — RC Témara · IF 40213056 · ICE 001987654000032
                  <br />
                  Signature et cachet du cabinet
                </p>
                <Button size="sm" onClick={() => downloadDoc(doc)}>
                  <Download className="mr-2 h-4 w-4" /> Télécharger
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
