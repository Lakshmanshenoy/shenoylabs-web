import Link from "next/link";
import React from "react";

type Props = {
  title: string;
  description?: string;
  href?: string;
};

export default function ToolCard({ title, description, href = "#" }: Props) {
  return (
    <article className="rounded-lg border border-zinc-100 bg-white p-4 shadow-sm hover:shadow-md transition">
      <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
      {description && <p className="mt-2 text-sm text-zinc-600">{description}</p>}
      <div className="mt-4">
        <Link href={href} className="text-sm font-medium text-indigo-600 hover:underline">
          Open
        </Link>
      </div>
    </article>
  );
}
