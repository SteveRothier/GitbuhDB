import { TopNav } from "@/components/layout/top-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0b0e14]">
      <TopNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
