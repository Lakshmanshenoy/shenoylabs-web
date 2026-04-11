export function normalizeUpstashList(arr: any): any[] {
  if (!arr) return [];

  // Unwrap { result: [...] } responses
  if (typeof arr === "object" && !Array.isArray(arr) && "result" in arr && Array.isArray((arr as any).result)) {
    arr = (arr as any).result;
  }

  // If the whole payload is a JSON-encoded array/string, try to parse it
  if (typeof arr === "string") {
    try {
      const parsed = JSON.parse(arr);
      // If parsing yields an array or primitive, use it
      arr = parsed;
    } catch {
      // leave as a raw string
      return [arr];
    }
  }

  // Flatten any nested arrays to a single-level list of items
  if (Array.isArray(arr)) {
    try {
      // depth Infinity to be defensive against nested wrappers
      arr = (arr as any[]).flat(Infinity);
    } catch {
      // fallback to shallow flatten
      arr = (arr as any[]).flat();
    }
  }

  return Array.isArray(arr) ? arr : [];
}

export function deepUnwrapValue(v: any): any {
  if (v == null) return v;

  // If it's a string, try to JSON.parse it and recurse
  if (typeof v === "string") {
    const s = v.trim();
    try {
      const parsed = JSON.parse(s);
      return deepUnwrapValue(parsed);
    } catch {
      return s;
    }
  }

  // If it's an array, unwrap each element and collapse single-item arrays
  if (Array.isArray(v)) {
    const mapped = (v as any[]).map((it) => deepUnwrapValue(it));
    if (mapped.length === 1) return mapped[0];
    return mapped;
  }

  // If it's an object, recursively unwrap values
  if (typeof v === "object") {
    const out: any = {};
    for (const k of Object.keys(v)) {
      out[k] = deepUnwrapValue((v as any)[k]);
    }
    return out;
  }

  return v;
}

export function parseForExport(arr: any): any[] {
  const list = normalizeUpstashList(arr);
  const results: any[] = [];
  for (const el of list) {
    const un = deepUnwrapValue(el);
    if (Array.isArray(un)) {
      for (const it of un) {
        if (it && typeof it === "object") results.push(it);
        else results.push({ raw: it });
      }
    } else if (un && typeof un === "object") {
      results.push(un);
    } else {
      results.push({ raw: un });
    }
  }
  return results;
}

export function parseForDelete(arr: any): any[] {
  // Provide a best-effort parsed view for deletion checks (object or null)
  const list = normalizeUpstashList(arr);
  return list.map((el: any) => {
    try {
      const un = deepUnwrapValue(el);
      if (Array.isArray(un) && un.length === 1) return un[0];
      return un;
    } catch {
      return null;
    }
  });
}
