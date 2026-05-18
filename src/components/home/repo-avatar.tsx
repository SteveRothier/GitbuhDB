import Image from "next/image";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-500",
  Python: "bg-cyan-500",
  Rust: "bg-orange-500",
  Go: "bg-teal-500",
  Java: "bg-red-500",
  Ruby: "bg-rose-500",
};

export function RepoAvatar({
  owner,
  language,
}: {
  owner: string;
  language: string | null;
}) {
  const dotClass = LANGUAGE_COLORS[language ?? ""] ?? "bg-primary/60";

  return (
    <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
      <Image
        src={`https://github.com/${owner}.png?size=80`}
        alt=""
        width={40}
        height={40}
        className="size-10 rounded-lg object-cover"
        unoptimized
      />
      <span
        className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card ${dotClass}`}
        aria-hidden
      />
    </div>
  );
}
