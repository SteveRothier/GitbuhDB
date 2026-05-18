import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RepoNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <h1 className="mb-2 text-2xl font-bold">Repository introuvable</h1>
      <p className="mb-6 text-muted-foreground">
        Ce repository n&apos;existe pas sur GitHub ou n&apos;a pas pu être chargé.
      </p>
      <Link href="/" className={cn(buttonVariants())}>
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
