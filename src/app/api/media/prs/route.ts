// Server-backed PR log storage — reads/writes `data/tina-media-prs.json` on the base branch
function jsonResponse(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET() {
  try {
    const token = process.env.GITHUB_TOKEN ?? process.env.TINA_GITHUB_TOKEN;
    const repository = process.env.GITHUB_REPOSITORY;
    if (!token || !repository) return jsonResponse({ logs: [] }, 200);
    const [owner, repo] = repository.split("/");
    const baseBranch = process.env.GITHUB_BASE_BRANCH || "main";
    const path = "data/tina-media-prs.json";
    const ghHeaders = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" };

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(baseBranch)}`, { headers: ghHeaders });
    if (!res.ok) {
      // if not found, return empty
      return jsonResponse({ logs: [] }, 200);
    }
    const json = await res.json();
    const content = json?.content || "";
    const decoded = Buffer.from(content, "base64").toString("utf8");
    try {
      const logs = JSON.parse(decoded || "[]");
      return jsonResponse({ logs }, 200);
    } catch (e) {
      return jsonResponse({ logs: [] }, 200);
    }
  } catch (err) {
     
    console.error("/api/media/prs GET error", err);
    return jsonResponse({ logs: [] }, 200);
  }
}

export async function POST(req: Request) {
  try {
    const token = process.env.GITHUB_TOKEN ?? process.env.TINA_GITHUB_TOKEN;
    const repository = process.env.GITHUB_REPOSITORY;
    if (!token || !repository) return jsonResponse({ error: "server not configured" }, 500);
    const body = await req.json();
    const { url, action, filename } = body || {};
    if (!url || !action) return jsonResponse({ error: "missing fields" }, 400);

    const [owner, repo] = repository.split("/");
    const baseBranch = process.env.GITHUB_BASE_BRANCH || "main";
    const path = "data/tina-media-prs.json";
    const ghHeaders = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" };

    // Fetch existing file if present
    const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(baseBranch)}`, { headers: ghHeaders });
    let logs: unknown[] = [];
    let sha: string | undefined = undefined;
    if (getRes.ok) {
      const getJson = await getRes.json();
      sha = getJson?.sha;
      const content = getJson?.content || "";
      try {
        logs = JSON.parse(Buffer.from(content, "base64").toString("utf8") || "[]");
      } catch (e: unknown) {
        logs = [];
      }
    }

    const entry = { url, action, filename: filename ?? null, ts: Date.now() };
    logs.unshift(entry);

    const newContent = Buffer.from(JSON.stringify(logs, null, 2)).toString("base64");

    const putBody: Record<string, unknown> = { message: `Tina media logs: add ${action}`, content: newContent, branch: baseBranch };
    if (sha) putBody.sha = sha;

    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
      method: "PUT",
      headers: ghHeaders,
      body: JSON.stringify(putBody),
    });

    if (!putRes.ok) {
      const txt = await putRes.text().catch(() => "");
      return jsonResponse({ error: "failed to persist logs", details: txt }, 500);
    }
    const putJson = await putRes.json();
    return jsonResponse({ ok: true, commit: putJson?.commit ?? null }, 200);
  } catch (err) {
     
    console.error("/api/media/prs POST error", err);
    return jsonResponse({ error: "server error" }, 500);
  }
}
