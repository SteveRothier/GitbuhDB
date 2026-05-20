"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRepoSearch } from "@/hooks/use-repo-search";

export function RepoSearch({ className }: { className?: string }) {
  const {
    query,
    setQuery,
    results,
    loading,
    open,
    setOpen,
    shouldSearch,
    navigate,
    handleSubmit,
  } = useRepoSearch();

  return (
    <div className={`relative w-full max-w-xl ${className ?? ""}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            role="searchbox"
            autoComplete="off"
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
