"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TrendingFilters({
  defaultLanguage,
  defaultMinStars,
  period,
}: {
  defaultLanguage?: string;
  defaultMinStars?: string;
  period: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    params.set("period", period);
    const language = String(form.get("language") ?? "").trim();
    const minStars = String(form.get("minStars") ?? "").trim();
    if (language) params.set("language", language);
    if (minStars) params.set("minStars", minStars);
    router.push(`/trending?${params.toString()}`);
  }

  function clearFilters() {
    router.push(`/trending?period=${period}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-border/60 bg-card/50 p-4"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="language" className="text-xs text-muted-foreground">
          Langage
        </label>
        <Input
          id="language"
          name="language"
          placeholder="TypeScript"
          defaultValue={defaultLanguage ?? searchParams.get("language") ?? ""}
          className="w-40"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="minStars" className="text-xs text-muted-foreground">
          Stars min.
        </label>
        <Input
          id="minStars"
          name="minStars"
          type="number"
          placeholder="1000"
          defaultValue={defaultMinStars ?? searchParams.get("minStars") ?? ""}
          className="w-32"
        />
      </div>
      <Button type="submit" size="sm">
        Filtrer
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
        Réinitialiser
      </Button>
    </form>
  );
}
