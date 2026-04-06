"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { estimateRunway, sanitizeTextInput } from "@/lib/tools-framework";

type Fields = {
  cashReserve: string;
  monthlyRevenue: string;
  monthlyExpenses: string;
  scenarioLabel: string;
};

export function LocalComputeLab() {
  const [fields, setFields] = useState<Fields>({
    cashReserve: "1000000",
    monthlyRevenue: "150000",
    monthlyExpenses: "220000",
    scenarioLabel: "Base case",
  });

  const output = useMemo(() => {
    return estimateRunway({
      cashReserve: Number(fields.cashReserve),
      monthlyRevenue: Number(fields.monthlyRevenue),
      monthlyExpenses: Number(fields.monthlyExpenses),
    });
  }, [fields.cashReserve, fields.monthlyExpenses, fields.monthlyRevenue]);

  return (
    <div className="rounded-2xl border border-border/80 bg-card/95 p-5 sm:p-6">
      <div className="mb-4 space-y-1">
        <h3 className="font-heading text-lg font-semibold">Local Compute Preview</h3>
        <p className="text-sm text-muted-foreground">
          Demo-only framework. Inputs are sanitized and computed fully in-browser.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Scenario label</span>
          <Input
            value={fields.scenarioLabel}
            onChange={(event) =>
              setFields((prev) => ({
                ...prev,
                scenarioLabel: sanitizeTextInput(event.target.value, 40),
              }))
            }
            maxLength={40}
          />
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Cash reserve</span>
          <Input
            type="number"
            min={0}
            value={fields.cashReserve}
            onChange={(event) =>
              setFields((prev) => ({ ...prev, cashReserve: event.target.value }))
            }
          />
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Monthly revenue</span>
          <Input
            type="number"
            min={0}
            value={fields.monthlyRevenue}
            onChange={(event) =>
              setFields((prev) => ({ ...prev, monthlyRevenue: event.target.value }))
            }
          />
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Monthly expenses</span>
          <Input
            type="number"
            min={0}
            value={fields.monthlyExpenses}
            onChange={(event) =>
              setFields((prev) => ({ ...prev, monthlyExpenses: event.target.value }))
            }
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3 rounded-xl bg-secondary/60 p-4 text-sm sm:grid-cols-2">
        <p className="text-muted-foreground">
          Scenario: <span className="font-medium text-foreground">{fields.scenarioLabel || "Untitled"}</span>
        </p>
        <p className="text-muted-foreground">
          Net monthly burn: <span className="font-medium text-foreground">{output.netBurn.toLocaleString()}</span>
        </p>
        <p className="text-muted-foreground sm:col-span-2">
          Estimated runway: <span className="font-medium text-foreground">{output.runwayMonths === 999 ? "No burn (infinite)" : `${output.runwayMonths} months`}</span>
        </p>
      </div>
    </div>
  );
}
