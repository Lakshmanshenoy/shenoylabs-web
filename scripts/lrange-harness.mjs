#!/usr/bin/env node
// Lightweight LRANGE parsing harness — pure JS copy of the unwrapping logic
function normalizeUpstashList(arr) {
  if (!arr) return [];
  if (typeof arr === 'object' && !Array.isArray(arr) && 'result' in arr && Array.isArray(arr.result)) {
    arr = arr.result;
  }
  if (typeof arr === 'string') {
    try {
      const parsed = JSON.parse(arr);
      arr = parsed;
    } catch {
      return [arr];
    }
  }
  if (Array.isArray(arr)) {
    try {
      arr = arr.flat(Infinity);
    } catch {
      arr = arr.flat();
    }
  }
  return Array.isArray(arr) ? arr : [];
}

function deepUnwrapValue(v) {
  if (v == null) return v;
  if (typeof v === 'string') {
    const s = v.trim();
    try {
      const parsed = JSON.parse(s);
      return deepUnwrapValue(parsed);
    } catch {
      return s;
    }
  }
  if (Array.isArray(v)) {
    const mapped = v.map((it) => deepUnwrapValue(it));
    if (mapped.length === 1) return mapped[0];
    return mapped;
  }
  if (typeof v === 'object') {
    const out = {};
    for (const k of Object.keys(v)) out[k] = deepUnwrapValue(v[k]);
    return out;
  }
  return v;
}

function parseForExport(arr) {
  const list = normalizeUpstashList(arr);
  const results = [];
  for (const el of list) {
    const un = deepUnwrapValue(el);
    if (Array.isArray(un)) {
      for (const it of un) {
        if (it && typeof it === 'object') results.push(it);
        else results.push({ raw: it });
      }
    } else if (un && typeof un === 'object') {
      results.push(un);
    } else {
      results.push({ raw: un });
    }
  }
  return results;
}

// Example payload shapes observed in production
const examples = [
  // double-wrapped: element is a JSON string representation of an array containing one JSON string
  '["{\\"ts\\":1670000000000,\\"subject\\":\\"alice@example.com\\"}"]',
  // simple JSON string
  '{"ts":1670000000001,"subject":"bob@example.com"}',
  // raw string
  'just-some-blob',
  // Upstash /commands envelope
  { result: ['["{\\"ts\\":1670000000002,\\"subject\\":\\"carol@example.com\\"}"]'] },
];

for (const ex of examples) {
  console.log('--- example ---');
  console.log('raw:', ex);
  console.log('normalizeUpstashList ->', normalizeUpstashList(ex));
  console.log('parseForExport ->', JSON.stringify(parseForExport(ex), null, 2));
  console.log('parseForDelete ->', JSON.stringify(normalizeUpstashList(ex).map((e) => deepUnwrapValue(e)), null, 2));
}

console.log('\nDone. Use this harness to verify LRANGE payload shapes locally.');
