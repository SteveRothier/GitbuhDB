"use client";

import Link from "next/link";
import { Suspense } from "react";
import { BarChart3, Moon } from "lucide-react";
import { RepoSearch } from "@/components/search/repo-search";

function TopNavInner() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0b0e14]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4 sm:gap-4 lg:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 text-white hover:opacity-90"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-violet-600 text-white">
            <BarChart3 className="size-4" aria-hidden />
          </span>
          <span className="hidden text-base font-semibold tracking-tight sm:inline">
            GitHub Tracker
          </span>
        </Link>

        <div className="relative mx-2 hidden min-w-0 flex-1 md:block md:max-w-md lg:max-w-xl">
          <RepoSearch className="w-full" />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 lg:inline">
            ⌘K
          </kbd>
        </div>

        <button
          type="button"
          className="ml-auto shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-white/5"
          aria-label="Thème"
        >
          <Moon className="size-5" />
        </button>
      </div>

      <div className="border-t border-white/[0.06] px-4 pb-3 md:hidden">
        <RepoSearch className="w-full" />
      </div>
    </header>
  );
}

function TopNavFallback() {
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-white/[0.06] bg-[#0b0e14]" />
  );
}

export function TopNav() {
  return (
    <Suspense fallback={<TopNavFallback />}>
      <TopNavInner />
    </Suspense>
  );
}
