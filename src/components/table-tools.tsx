import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SortDir = "asc" | "desc";

export function useSort<K extends string>(initial: K) {
  const [key, setKey] = useState<K>(initial);
  const [dir, setDir] = useState<SortDir>("asc");
  const toggle = (k: K) => {
    if (k === key) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setKey(k);
      setDir("asc");
    }
  };
  return { key, dir, toggle, setKey, setDir };
}

export function SortHeader<K extends string>({
  label,
  sortKey,
  sort,
  className,
}: {
  label: string;
  sortKey: K;
  sort: { key: K; dir: SortDir; toggle: (k: K) => void };
  className?: string;
}) {
  const active = sort.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => sort.toggle(sortKey)}
      className={cn(
        "group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {label}
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

export function usePagination(totalItems: number) {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * pageSize;
  return {
    page: current,
    setPage,
    pageSize,
    setPageSize: (n: number) => {
      setPageSize(n);
      setPage(1);
    },
    pageCount,
    start,
    end: start + pageSize,
    reset: () => setPage(1),
  };
}

export function Paginator({
  pagination,
  total,
}: {
  pagination: ReturnType<typeof usePagination>;
  total: number;
}) {
  const { page, setPage, pageCount, pageSize, setPageSize } = pagination;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  );
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{total} résultat(s)</span>
        <span className="text-border">•</span>
        <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
          <SelectTrigger className="h-8 w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Précédent
        </Button>
        {pages.map((p, i) => (
          <span key={p} className="flex items-center">
            {i > 0 && p - (pages[i - 1] ?? 0) > 1 && (
              <span className="px-1 text-muted-foreground">…</span>
            )}
            <Button
              variant={p === page ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          </span>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => setPage(page + 1)}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <ArrowUpDown className="h-5 w-5" />
      </div>
      <p className="font-display text-base">{label}</p>
      <p className="text-sm text-muted-foreground">
        Ajustez votre recherche ou réinitialisez les filtres.
      </p>
    </div>
  );
}
