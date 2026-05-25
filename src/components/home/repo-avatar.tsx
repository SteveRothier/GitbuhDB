import Image from "next/image";
import { cn } from "@/lib/utils";

export function RepoAvatar({
  owner,
  className,
}: {
  owner: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted",
        className,
      )}
    >
      <Image
        src={`https://github.com/${owner}.png?size=80`}
        alt=""
        width={40}
        height={40}
        className="size-full rounded-lg object-cover"
        unoptimized
      />
    </div>
  );
}
