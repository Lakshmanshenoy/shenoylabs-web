"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type QuizOption = {
  label: string;
  correct?: boolean;
  explanation?: string;
};

type InlineQuizProps = {
  question: string;
  options: QuizOption[];
  explanation?: string;
  hint?: string;
};

// ─── InlineQuiz ───────────────────────────────────────────────────────────────

export function InlineQuiz({ question, options, explanation, hint }: InlineQuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const answered = selected !== null;
  const isCorrect = selected !== null && options[selected]?.correct === true;

  const handleSelect = (idx: number) => {
    if (!answered) setSelected(idx);
  };

  const handleReset = () => {
    setSelected(null);
    setShowHint(false);
  };

  return (
    <aside
      className="not-prose my-7 rounded-xl border border-primary/25 bg-primary/[0.03] px-5 py-5"
      aria-label="Inline quiz"
    >
      {/* Header */}
      <p className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
        <HelpCircle className="size-3.5" />
        Quick Check
      </p>

      {/* Question */}
      <p className="mb-4 font-heading text-base font-semibold leading-snug text-foreground">
        {question}
      </p>

      {/* Options */}
      <ul className="space-y-2" role="radiogroup" aria-label={question}>
        {options.map((opt, idx) => {
          const isSelected = selected === idx;
          const revealCorrect = answered && opt.correct;
          const revealWrong = answered && isSelected && !opt.correct;

          return (
            <li key={idx}>
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelect(idx)}
                disabled={answered}
                className={cn(
                  "w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-all duration-150",
                  !answered && "cursor-pointer hover:border-primary/40 hover:bg-primary/5",
                  answered && "cursor-default",
                  revealCorrect && "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400",
                  revealWrong && "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400",
                  !revealCorrect && !revealWrong && isSelected && "border-primary/40 bg-primary/8",
                  !revealCorrect && !revealWrong && !isSelected && "border-border/70 text-foreground/80",
                )}
              >
                <span className="flex items-center justify-between gap-3">
                  <span>{opt.label}</span>
                  {revealCorrect && <CheckCircle2 className="size-4 shrink-0 text-green-500" />}
                  {revealWrong && <XCircle className="size-4 shrink-0 text-red-500" />}
                </span>
                {answered && isSelected && opt.explanation && (
                  <p className="mt-1.5 text-[12px] leading-relaxed opacity-80">
                    {opt.explanation}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Result */}
      {answered && (
        <div
          className={cn(
            "mt-4 rounded-lg px-4 py-3 text-sm",
            isCorrect
              ? "bg-green-500/10 text-green-700 dark:text-green-400"
              : "bg-red-500/10 text-red-700 dark:text-red-400",
          )}
          role="alert"
        >
          <p className="font-semibold">{isCorrect ? "✓ Correct!" : "✗ Not quite."}</p>
          {explanation && <p className="mt-1 text-[13px] leading-relaxed opacity-90">{explanation}</p>}
        </div>
      )}

      {/* Hint + Try again */}
      <div className="mt-3 flex items-center gap-3">
        {!answered && hint && (
          <button
            type="button"
            onClick={() => setShowHint((prev) => !prev)}
            className="text-[11px] font-semibold text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            {showHint ? "Hide hint" : "Show hint"}
          </button>
        )}
        {answered && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-semibold text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Try again
          </button>
        )}
      </div>
      {showHint && hint && !answered && (
        <p className="mt-2 rounded-lg border border-border/60 bg-secondary/40 px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
          💡 {hint}
        </p>
      )}
    </aside>
  );
}
