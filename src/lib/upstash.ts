const rawUpstashUrl = process.env.KV_REST_API_URL ?? "";
const UPSTASH_URL = rawUpstashUrl ? rawUpstashUrl.replace(/^['\"]|['\"]$/g, "").trim() : null;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_READ_ONLY_TOKEN ?? null;

async function request(path: string, options: { method?: string; body?: unknown } = {}) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  let url: string;
  try {
    // Use the URL constructor to build a correct request URL from the base
    url = new URL(path.startsWith("/") ? path : `/${path}`, UPSTASH_URL).toString();
  } catch (err) {
    console.error("upstash invalid base URL or path", UPSTASH_URL, path, err);
    return null;
  }
  const headers: Record<string, string> = {
    Authorization: `Bearer ${UPSTASH_TOKEN}`,
  };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  try {
    const res = await fetch(url, {
      method: options.method ?? (options.body ? "POST" : "GET"),
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "<no-body>");
      console.error("upstash request failed:", url, txt);
      return null;
    }

    const j = await res.json().catch(() => null);
    // many Upstash endpoints return { result: ... }
    if (j && typeof j === "object" && "result" in j) return j.result;
    return j;
  } catch (err) {
    console.error("upstash request error", err);
    return null;
  }
}

export async function rpush(key: string, values: unknown[]) {
  return await request(`/rpush/${encodeURIComponent(key)}`, { method: "POST", body: values });
}

export async function lrange(key: string, start: number | string, stop: number | string) {
  return await request(`/lrange/${encodeURIComponent(key)}/${start}/${stop}`, { method: "GET" });
}

export async function ltrim(key: string, start: number | string, stop: number | string) {
  return await request(`/ltrim/${encodeURIComponent(key)}/${start}/${stop}`, { method: "POST" });
}

export async function delKey(key: string) {
  return await request(`/del/${encodeURIComponent(key)}`, { method: "POST" });
}

export async function getKey(key: string) {
  return await request(`/get/${encodeURIComponent(key)}`, { method: "GET" });
}

export async function setKey(key: string, value: unknown, pxMs?: number) {
  const q = pxMs ? `?px=${pxMs}` : "";
  return await request(`/set/${encodeURIComponent(key)}${q}`, { method: "POST", body: value });
}

export async function incr(key: string) {
  return await request(`/incr/${encodeURIComponent(key)}`, { method: "POST" });
}

const upstash = { request, rpush, lrange, ltrim, delKey, getKey, setKey };

export default upstash;
