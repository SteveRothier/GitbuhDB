"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useRepoSearch } from "@/hooks/use-repo-search";
import { POPULAR_REPO_TAGS } from "@/lib/types";

export function HeroSearch() {
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
    <div className="relative mx-auto w-full max-w-3xl">
      <form onSubmit={handleSubmit}>
        <div className="flex overflow-hidden rounded-xl border border-border/60 bg-[#111827] shadow-lg shadow-primary/5">
          <input
            type="search"
            placeholder="Rechercher un dépôt GitHub..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            className="h-14 flex-1 bg-transparent px-5 text-base outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="flex h-14 shrink-0 items-center gap-2 bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Search className="size-4" />
            Rechercher
          </button>
        </div>
      </form>

      {shouldSearch && open && (results.length > 0 || loading) && (
        <ul className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-border/60 bg-[#111827] py-1 shadow-xl">
          {loading && (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              Recherche…
            </li>
          )}
          {!loading &&
            results.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex w-full flex-col gap-0.5 px-4 py-3 text-left hover:bg-muted/30"
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
                </button>
              </li>
            ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
        <span className="text-muted-foreground">Popular searches :</span>
        {POPULAR_REPO_TAGS.map((tag) => {
          const [owner, name] = tag.split("/");
          return (
            <Link
              key={tag}
              href={`/github/${owner}/${name}`}
              className="rounded-md border border-border/50 bg-[#111827]/80 px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {tag}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
