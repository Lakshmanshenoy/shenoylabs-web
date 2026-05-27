import { cn } from "@/lib/utils";

type SectionContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionContainer({ children, className }: SectionContainerProps) {
  return (
    <section className={cn("mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20", className)}>
      {children}
    </section>
  );
}
