"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  CheckIcon,
  CopyIcon,
  RssIcon,
  WalletIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { KofiWidget } from "@/components/support/kofi-widget";

type SupportPaymentPanelProps = {
  upiId: string;
};

const presetAmounts = [99, 249, 499, 999] as const;

type PaymentMethod = "upi" | "kofi" | "free";

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function SupportPaymentPanel({ upiId }: SupportPaymentPanelProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(249);
  const [customAmount, setCustomAmount] = useState("");
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>("upi");
  const [copied, setCopied] = useState(false);

  const effectiveAmount = useMemo(() => {
    const parsed = Number(customAmount);
    if (Number.isFinite(parsed) && parsed > 0) return Math.round(parsed);
    return selectedAmount;
  }, [customAmount, selectedAmount]);

  const upiQrImage = useMemo(() => {
    if (customAmount.trim()) {
      return "/images/support/upi-qr.png";
    }

    if (selectedAmount === 999) return "/images/support/Shenoylabschampion.png";
    if (selectedAmount === 99) return "/images/support/shenoylabscoffee.png";
    if (selectedAmount === 499) return "/images/support/shenoylabspatron.png";
    if (selectedAmount === 249) return "/images/support/shenoylabssupporter.png";

    return "/images/support/upi-qr.png";
  }, [customAmount, selectedAmount]);

  async function onCopyUpi() {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Choose an amount (INR)
        </p>
        <div className="grid gap-2 sm:grid-cols-4">
          {presetAmounts.map((amount) => {
            const active = !customAmount && selectedAmount === amount;
            return (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount("");
                }}
                className={cn(
                  "rounded-md border p-3 text-center transition-colors",
                  active
                    ? "border-primary bg-accent"
                    : "border-border hover:border-primary/70 hover:bg-accent/30",
                )}
              >
                <span className="font-heading block text-2xl leading-none text-foreground">
                  {formatInr(amount).replace(".00", "")}
                </span>
                <span className="mt-1 block text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  {amount === 99
                    ? "Coffee"
                    : amount === 249
                      ? "Supporter"
                      : amount === 499
                        ? "Patron"
                        : "Champion"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="font-heading text-2xl text-muted-foreground">INR</span>
          <input
            type="number"
            min={1}
            value={customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
            placeholder="Enter custom amount"
            className="h-11 w-full rounded-sm border border-input bg-background px-3 font-mono text-lg outline-none transition-colors focus:border-primary"
          />
        </div>
      </section>

      <section>
        <p className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Payment method
        </p>

        <div className="space-y-3">
          <article
            className={cn(
              "rounded-md border transition-shadow",
              activeMethod === "upi" ? "border-primary shadow-sm" : "border-border",
            )}
          >
            <button
              type="button"
              onClick={() => setActiveMethod("upi")}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <span className="inline-flex size-5 items-center justify-center rounded-full border border-border">
                {activeMethod === "upi" ? <CheckIcon className="size-3 text-primary" /> : null}
              </span>
              <span className="inline-flex h-8 items-center rounded bg-secondary px-2 text-xs font-semibold">UPI</span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">UPI Payment</span>
                <span className="block text-xs text-muted-foreground">GPay, PhonePe, Paytm, any UPI app</span>
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Zero fees
              </span>
            </button>

            {activeMethod === "upi" ? (
              <div className="border-t border-border p-4">
                <div className="mx-auto flex max-w-xs flex-col items-center gap-4">
                  <div className="w-full rounded-md border border-border bg-secondary/50 p-3">
                    <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-sm border border-border bg-background">
                      <Image
                        src={upiQrImage}
                        alt={`UPI QR code for ${formatInr(effectiveAmount).replace(".00", "")}`}
                        fill
                        className="object-contain"
                        sizes="176px"
                      />
                    </div>
                    <p className="mt-2 text-center font-mono text-xs text-muted-foreground">Scan with any UPI app</p>
                    <p className="mt-1 text-center font-mono text-sm font-semibold text-primary">
                      {formatInr(effectiveAmount).replace(".00", "")}
                    </p>
                  </div>

                  <div className="flex w-full items-center gap-2 rounded-sm border border-border bg-secondary/40 px-3 py-2">
                    <span className="font-mono text-sm">{upiId}</span>
                    <button
                      type="button"
                      onClick={onCopyUpi}
                      className={cn(
                        "ml-auto inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase transition-colors",
                        copied ? "border-emerald-500 text-emerald-600" : "border-border text-muted-foreground hover:text-primary",
                      )}
                    >
                      <CopyIcon className="size-3" />
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </article>

          {/* Ko-fi */}
          <article
            className={cn(
              "rounded-md border transition-shadow",
              activeMethod === "kofi" ? "border-primary shadow-sm" : "border-border",
            )}
          >
            <button
              type="button"
              onClick={() => setActiveMethod("kofi")}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <span className="inline-flex size-5 items-center justify-center rounded-full border border-border">
                {activeMethod === "kofi" ? <CheckIcon className="size-3 text-primary" /> : null}
              </span>
              <span className="inline-flex h-8 items-center rounded px-2 text-xs font-semibold text-white" style={{ background: "#e06020" }}>Ko-fi</span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">Ko-fi</span>
                <span className="block text-xs text-muted-foreground">Cards, PayPal, Apple Pay, Google Pay</span>
              </span>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                International
              </span>
            </button>

            {activeMethod === "kofi" ? (
              <div className="border-t border-border p-4">
                <p className="mb-4 text-sm italic text-muted-foreground">
                  Support via Ko-fi using cards, PayPal, Apple Pay, or Google Pay. No account needed.
                </p>
                <KofiWidget />
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Or visit{" "}
                  <Link
                    href="https://ko-fi.com/lakshmanshenoy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    ko-fi.com/lakshmanshenoy
                  </Link>{" "}
                  directly.
                </p>
              </div>
            ) : null}
          </article>

          <article
            className={cn(
              "rounded-md border transition-shadow",
              activeMethod === "free" ? "border-primary shadow-sm" : "border-border",
            )}
          >
            <button
              type="button"
              onClick={() => setActiveMethod("free")}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <span className="inline-flex size-5 items-center justify-center rounded-full border border-border">
                {activeMethod === "free" ? <CheckIcon className="size-3 text-primary" /> : null}
              </span>
              <span className="inline-flex h-8 items-center rounded bg-secondary px-2 text-xs font-semibold">Free</span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">Follow updates</span>
                <span className="block text-xs text-muted-foreground">Stay updated with new articles</span>
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Free
              </span>
            </button>

            {activeMethod === "free" ? (
              <div className="border-t border-border p-4">
                <p className="mb-3 text-sm italic text-muted-foreground">
                  You can support reach by following new publications through RSS or the articles page.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Link
                    href="/feed.xml"
                    className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-4 py-2 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase transition-colors hover:text-primary"
                  >
                    <RssIcon className="size-3.5" />
                    Subscribe via RSS
                  </Link>
                  <Link
                    href="/articles"
                    className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-4 py-2 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase transition-colors hover:text-primary"
                  >
                    <WalletIcon className="size-3.5" />
                    Read latest articles
                  </Link>
                </div>
              </div>
            ) : null}
          </article>
        </div>
      </section>
    </div>
  );
}
