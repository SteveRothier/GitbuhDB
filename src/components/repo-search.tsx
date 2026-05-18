"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { GitHubSearchItem } from "@/lib/types";

function parseOwnerRepo(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim().replace(/^https?:\/\/github\.com\//i, "");
  const match = trimmed.match(/^([^/\s]+)\/([^/\s#?]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

export function RepoSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GitHubSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const navigate = useCallback(
    (owner: string, repo: string) => {
      setOpen(false);
      setQuery("");
      router.push(`/github/${owner}/${repo}`);
    },
    [router],
  );

  const shouldSearch = query.trim().length >= 2;

  useEffect(() => {
    if (!shouldSearch) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.items ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, shouldSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseOwnerRepo(query);
    if (parsed) {
      navigate(parsed.owner, parsed.repo);
      return;
    }
    if (results[0]) {
      const [owner, repo] = results[0].full_name.split("/");
      navigate(owner, repo);
    }
  }

  return (
    <div className={`relative w-full max-w-xl ${className ?? ""}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un repo (ex. vercel/next.js)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            className="pl-9"
          />
        </div>
      </form>

      {shouldSearch && open && (results.length > 0 || loading) && (
        <ul className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-border bg-card py-1 shadow-lg">
          {loading && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Recherche…
            </li>
          )}
          {!loading &&
            results.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-muted/50"
                  onClick={() => {
                    const [owner, repo] = item.full_name.split("/");
                    navigate(owner, repo);
                  }}
                >
                  <span className="font-medium">{item.full_name}</span>
                  {item.description && (
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {item.stargazers_count.toLocaleString("fr-FR")} stars
                    {item.language ? ` · ${item.language}` : ""}
                  </span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
