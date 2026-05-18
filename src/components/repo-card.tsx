import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Repository } from "@/lib/types";

export function RepoCard({ repo }: { repo: Repository }) {
  return (
    <Link href={`/github/${repo.owner}/${repo.name}`}>
      <Card className="h-full border-border/60 bg-card/80 transition-colors hover:border-primary/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{repo.full_name}</CardTitle>
          {repo.description && (
            <CardDescription className="line-clamp-2">
              {repo.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            {repo.stars.toLocaleString("fr-FR")}
          </span>
          {repo.language && <Badge variant="secondary">{repo.language}</Badge>}
        </CardContent>
      </Card>
    </Link>
  );
}
