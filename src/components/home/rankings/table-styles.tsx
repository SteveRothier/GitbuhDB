import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const HOME_EXPLORER = {
  pageBg: "#050508",
  tableBg: "#0d0d12",
  link: "#8b94f6",
  linkHover: "#a5aeff",
  muted: "#9ca3af",
  title: "#ffffff",
  rowBorder: "rgba(255, 255, 255, 0.06)",
} as const;

export function RankingsTableCard({ children }: { children: ReactNode }) {
  return (
    <section className="min-w-0">
      <div
        className="overflow-hidden rounded-[10px] ring-1 ring-inset ring-white/[0.04]"
        style={{ backgroundColor: HOME_EXPLORER.tableBg }}
      >
        {children}
      </div>
    </section>
  );
}

export const RANKINGS_TABLE_TITLE_HEAD = cn(
  "px-4 py-3 text-left align-middle text-base font-semibold tracking-tight text-white",
);

export const RANKINGS_TABLE_COL_HEAD = cn(
  "px-4 py-3 align-middle text-xs font-semibold whitespace-nowrap text-white",
);

export const RANKINGS_TABLE_ROW = cn(
  "group border-b border-[rgba(255,255,255,0.06)] transition-colors last:border-0",
  "hover:bg-white/[0.04]",
);

export const RANKINGS_TABLE_CELL = "px-4 py-3 align-middle text-sm";

export const RANKINGS_TABLE_EMPTY = "px-4 py-4 text-sm text-[#9ca3af]";

export const RANKINGS_TABLE_MUTED = "text-[#9ca3af]";

export const RANKINGS_LINK_CLASS = cn(
  "font-medium transition-colors",
  "text-[#8b94f6] hover:text-[#a5aeff]",
);
