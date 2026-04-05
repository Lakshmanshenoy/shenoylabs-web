import Link from "next/link";

export default function ArticlesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-zinc-900">Articles</h1>
      <p className="mt-2 text-zinc-600">Long-form content and guides.</p>

      <ul className="mt-6 space-y-4">
        <li>
          <Link href="/articles/how-much-caffeine-in-cold-brew" className="text-indigo-600 hover:underline">
            How much caffeine is in cold brew?
          </Link>
        </li>
      </ul>
    </div>
  );
}
