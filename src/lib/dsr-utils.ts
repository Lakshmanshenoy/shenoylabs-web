export function normalizeUpstashList(arr: unknown): unknown[] {
  if (!arr) return [];

  const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

  // Unwrap { result: [...] } responses
  if (isRecord(arr) && "result" in arr && Array.isArray((arr as Record<string, unknown>).result)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    arr = (arr as any).result;
  }

  // If the whole payload is a JSON-encoded array/string, try to parse it
  if (typeof arr === "string") {
    try {
      const parsed = JSON.parse(arr as string) as unknown;
      arr = parsed;
    } catch {
      return [arr];
    }
  }

  // Flatten any nested arrays to a single-level list of items
  if (Array.isArray(arr)) {
    try {
      // depth Infinity to be defensive against nested wrappers
      // cast to unknown[] for TS
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      arr = (arr as any[]).flat(Infinity) as unknown[];
    } catch {
      // fallback to shallow flatten
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      arr = (arr as any[]).flat() as unknown[];
    }
  }

  return Array.isArray(arr) ? (arr as unknown[]) : [];
}

export function deepUnwrapValue(v: unknown): unknown {
  if (v == null) return v;

  // If it's a string, try to JSON.parse it and recurse
  if (typeof v === "string") {
    const s = v.trim();
    try {
      const parsed = JSON.parse(s) as unknown;
      return deepUnwrapValue(parsed);
    } catch {
      return s;
    }
  }

  // If it's an array, unwrap each element and collapse single-item arrays
  if (Array.isArray(v)) {
    const mapped = (v as unknown[]).map((it) => deepUnwrapValue(it));
    if (mapped.length === 1) return mapped[0];
    return mapped;
  }

  // If it's an object, recursively unwrap values
  if (typeof v === "object" && v !== null) {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(v as Record<string, unknown>)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      out[k] = deepUnwrapValue((v as any)[k]);
    }
    return out;
  }

  return v;
}

export function parseForExport(arr: unknown): Array<Record<string, unknown> | { raw: unknown }> {
  const list = normalizeUpstashList(arr);
  const results: Array<Record<string, unknown> | { raw: unknown }> = [];
  for (const el of list) {
    const un = deepUnwrapValue(el);
    if (Array.isArray(un)) {
      for (const it of un) {
        if (it && typeof it === "object") results.push(it as Record<string, unknown>);
        else results.push({ raw: it });
      }
    } else if (un && typeof un === "object") {
      results.push(un as Record<string, unknown>);
    } else {
      results.push({ raw: un });
    }
  }
  return results;
}

export function parseForDelete(arr: unknown): Array<unknown | null> {
  const list = normalizeUpstashList(arr);
  return list.map((el: unknown) => {
    try {
      const un = deepUnwrapValue(el);
      if (Array.isArray(un) && un.length === 1) return un[0];
      return un;
    } catch {
      return null;
    }
  });
}
