export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Support Shenoy Labs</h1>
      <p className="mt-4 text-muted">
        Shenoy Labs is ad-free and independent. If the tools or articles helped you, consider
        supporting development.
      </p>

      <ul className="mt-6 space-y-3">
        <li>
          <a className="text-indigo-300" href="#">
            Buy Me a Coffee (placeholder)
          </a>
        </li>
        <li>
          <span className="text-muted">India (UPI): </span>
          <span className="text-foreground">your-upi@bank (placeholder)</span>
        </li>
      </ul>
    </div>
  );
}
