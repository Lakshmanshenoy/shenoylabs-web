export type RunwayEstimateInput = {
  cashReserve: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
};

export type RunwayEstimateOutput = {
  netBurn: number;
  runwayMonths: number;
};

// Keep inputs bounded and deterministic before any in-browser math.
export function sanitizeNumberInput(
  raw: unknown,
  min: number,
  max: number,
): number {
  const value = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

// Sanitizes free-text without storing or sending user-provided values.
export function sanitizeTextInput(raw: unknown, maxLength = 160): string {
  const value = String(raw ?? "");
  const cleaned = value.replace(/[^a-zA-Z0-9 .,:;!?@%&()_\-+/]/g, "");
  return cleaned.slice(0, maxLength).trim();
}

export function estimateRunway(input: RunwayEstimateInput): RunwayEstimateOutput {
  const cashReserve = sanitizeNumberInput(input.cashReserve, 0, 1_000_000_000);
  const monthlyRevenue = sanitizeNumberInput(input.monthlyRevenue, 0, 100_000_000);
  const monthlyExpenses = sanitizeNumberInput(input.monthlyExpenses, 0, 100_000_000);

  const netBurn = Math.max(0, monthlyExpenses - monthlyRevenue);
  const runwayMonths = netBurn === 0 ? 999 : Number((cashReserve / netBurn).toFixed(1));

  return {
    netBurn,
    runwayMonths,
  };
}
