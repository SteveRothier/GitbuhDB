"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { GitHubSearchItem } from "@/lib/types";

export function parseOwnerRepo(
  input: string,
): { owner: string; repo: string } | null {
  const trimmed = input.trim().replace(/^https?:\/\/github\.com\//i, "");
  const match = trimmed.match(/^([^/\s]+)\/([^/\s#?]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

export function useRepoSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GitHubSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const shouldSearch = query.trim().length >= 2;

  const navigate = useCallback(
    (owner: string, repo: string) => {
      setOpen(false);
      setQuery("");
      router.push(`/github/${owner}/${repo}`);
    },
    [router],
  );

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

  return {
    query,
    setQuery,
    results,
    loading,
    open,
    setOpen,
    shouldSearch,
    navigate,
    handleSubmit,
  };
}
