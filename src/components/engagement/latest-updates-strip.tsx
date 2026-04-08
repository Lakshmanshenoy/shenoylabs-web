import { Badge } from "@/components/ui/badge";

type UpdateItem = {
  date: string;
  title: string;
  status: "shipped" | "in-progress" | "planned";
};

type Props = {
  updates: UpdateItem[];
};

const statusLabel = {
  shipped: "Shipped",
  "in-progress": "In Progress",
  planned: "Planned",
} as const;

export function LatestUpdatesStrip({ updates }: Props) {
  return (
    <section className="rounded-xl border border-border/80 bg-card/95 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        Latest Updates
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {updates.slice(0, 4).map((item) => (
          <div
            key={`${item.date}-${item.title}`}
            className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1.5 text-xs"
          >
            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
              {statusLabel[item.status]}
            </Badge>
            <span className="text-muted-foreground">{item.date}</span>
            <span className="text-foreground/90">{item.title}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
