import Link from "next/link";
import React from "react";

type Props = {
  title: string;
  description?: string;
  href?: string;
};

export default function ToolCard({ title, description, href = "#" }: Props) {
  const isLink = href && href !== '#';
  const id = `card-${title.replace(/\s+/g, '-').toLowerCase()}`;

  const content = (
    <div className="rounded-lg border border-border bg-white p-4 shadow-sm hover:shadow-md transition">
      <h3 id={id} className="text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted">{description}</p>}
      <div className="mt-4">
        <span className="text-sm font-medium text-primary hover:underline">Open</span>
      </div>
    </div>
  );

  if (isLink) {
    return (
      <Link
        href={href}
        className="block p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        {content}
      </Link>
    );
  }

  return content;
}
