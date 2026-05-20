"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useRepoSearch } from "@/hooks/use-repo-search";
import { POPULAR_REPO_TAGS } from "@/lib/types";
import { cn } from "@/lib/utils";

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

  const showDropdown =
    shouldSearch && open && (results.length > 0 || loading);

  const scrollable = !loading && results.length > 4;

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border/60 bg-[#111827] shadow-lg shadow-primary/5",
          showDropdown && "shadow-xl",
        )}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex">
            <div className="relative flex min-w-0 flex-1">
              <input
                type="text"
                role="searchbox"
                autoComplete="off"
                placeholder="Rechercher un dépôt GitHub..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => shouldSearch && setOpen(true)}
                className="h-14 w-full bg-transparent py-0 pl-5 pr-10 text-base outline-none placeholder:text-muted-foreground [&::-ms-clear]:hidden"
              />
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setOpen(false);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                  aria-label="Effacer la recherche"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="flex h-14 shrink-0 items-center gap-2 border-l border-white/[0.06] bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Search className="size-4" />
              Rechercher
            </button>
          </div>
        </form>

        {showDropdown && (
          <ul
            className={cn(
              "border-t border-white/[0.06] py-1",
              scrollable
                ? "search-dropdown-scroll max-h-72 overflow-y-auto"
                : "overflow-hidden",
            )}
          >
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
                    className="flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
                    onClick={() => {
                      const [owner, repo] = item.full_name.split("/");
                      navigate(owner, repo);
                    }}
                  >
                    <span className="font-medium text-foreground">
                      {item.full_name}
                    </span>
                    {item.description && (
                      <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>

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
