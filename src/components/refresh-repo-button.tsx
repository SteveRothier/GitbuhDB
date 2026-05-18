"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RefreshRepoButton({
  owner,
  name,
}: {
  owner: string;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    setLoading(true);
    try {
      await fetch(`/api/repos/${owner}/${name}?force=1`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={loading}
    >
      <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Actualisation…" : "Actualiser"}
    </Button>
  );
}
