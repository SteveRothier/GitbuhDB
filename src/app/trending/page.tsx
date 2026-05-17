export default function TrendingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Trending</h1>
      <p className="text-muted-foreground">
        Classements des repositories en croissance — disponible après la
        configuration Supabase et les cron jobs.
      </p>
    </div>
  );
}
