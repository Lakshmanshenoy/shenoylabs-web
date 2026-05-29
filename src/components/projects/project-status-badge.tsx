import { cn } from "@/lib/utils";

type ProjectStatusBadgeProps = {
  label: string;
  className?: string;
  dotClassName?: string;
  pulse?: boolean;
};

export function ProjectStatusBadge({
  label,
  className,
  dotClassName,
  pulse = false,
}: ProjectStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("inline-block size-2 rounded-full", dotClassName, pulse && "animate-pulse")}
      />
      {label}
    </span>
  );
}