import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <TrendingUp className="size-4" />
          </span>
          <span>GitHub Tracker</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/trending"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Trending
          </Link>
        </nav>
      </div>
    </header>
  );
}
