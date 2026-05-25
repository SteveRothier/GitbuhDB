import Link from "next/link";
import type { RepoPageExtras } from "@/lib/types";
import { cn } from "@/lib/utils";

const badge = "rounded-sm px-2 py-0.5 text-xs font-medium";

export function RepoHeaderBadges({ extras }: { extras: RepoPageExtras }) {
  const items: { key: string; label: string; className: string; href?: string }[] = [];

  if (extras.archived) {
    items.push({
      key: "archived",
      label: "Archivé",
      className: "bg-amber-500/10 text-amber-200",
    });
  }

  if (extras.disabled) {
    items.push({
      key: "disabled",
      label: "Désactivé",
      className: "bg-rose-500/10 text-rose-200",
    });
  }

  if (extras.fork && extras.parentFullName) {
    const [pOwner, pRepo] = extras.parentFullName.split("/");
    items.push({
      key: "fork",
      label: `Fork de ${extras.parentFullName}`,
      className: "bg-sky-500/10 text-sky-200",
      href: pOwner && pRepo ? `/github/${pOwner}/${pRepo}` : undefined,
    });
  } else if (extras.fork) {
    items.push({
      key: "fork",
      label: "Fork",
      className: "bg-sky-500/10 text-sky-200",
    });
  }

  if (extras.isTemplate) {
    items.push({
      key: "template",
      label: "Template",
      className: "bg-violet-500/10 text-violet-200",
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((item) =>
        item.href ? (
          <Link
            key={item.key}
            href={item.href}
            className={cn(badge, item.className, "hover:opacity-90")}
          >
            {item.label}
          </Link>
        ) : (
          <span key={item.key} className={cn(badge, item.className)}>
            {item.label}
          </span>
        ),
      )}
    </div>
  );
}
