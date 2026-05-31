import Link from "next/link";

export function KofiWidget() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Link
        href="https://ko-fi.com/lakshmanshenoy"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2.5 rounded-sm px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-95"
        style={{ backgroundColor: "#e06020" }}
      >
        {/* Ko-fi cup icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="size-4 shrink-0"
        >
          <path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7V5c0-.55-.45-1-1-1zm-1 4h-2V5h2v2zm-4 0h-2V5h2v2zM6 5h2v2H6V5zm14.25 4.84c-.34 3.05-2.86 5.37-5.88 5.16A6 6 0 0 1 10 9h2c0 1.54 1.06 2.9 2.58 3.05 1.74.17 3.17-1.2 3.17-2.88V9h.75c.82 0 1.55.63 1.68 1.44.07.45.1.91.07 1.4zM4 19h16v2H4v-2z" />
        </svg>
        Support me on Ko-fi
      </Link>
      <p className="text-xs text-muted-foreground">No account needed · Cards, PayPal, Apple Pay</p>
    </div>
  );
}
