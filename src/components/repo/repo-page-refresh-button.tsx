"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function RepoPageRefreshButton({
  owner,
  repo,
  className,
}: {
  owner: string;
  repo: string;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [refreshing, setRefreshing] = useState(false);
  const loading = isPending || refreshing;

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch(
        `/api/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}?force=1`,
      );
      if (!res.ok) {
        console.warn("repo page refresh failed", res.status);
      }
      startTransition(() => {
        router.refresh();
      });
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleRefresh()}
      disabled={loading}
      aria-label="Actualiser les données du dépôt"
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <RefreshCw className={cn("size-3.5", loading && "animate-spin")} aria-hidden />
      {loading ? "Actualisation…" : "Actualiser"}
    </button>
  );
}
