// Server-side helper to create a branch, commit file changes, and open a PR on GitHub.
// Used for a GitHub-backed Tina workflow (no Tina Cloud required).
// Requires env vars: GITHUB_TOKEN and GITHUB_REPOSITORY (owner/repo)

import type { NextRequest } from "next/server";

function jsonResponse(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function encodePathSegments(p: string) {
  return p.split("/").map(encodeURIComponent).join("/");
}

export async function POST(req: Request) {
  try {
    const token = process.env.GITHUB_TOKEN ?? process.env.TINA_GITHUB_TOKEN;
    const repository = process.env.GITHUB_REPOSITORY; // expected "owner/repo"
    if (!token || !repository) {
      return jsonResponse({ error: "GITHUB_TOKEN (or TINA_GITHUB_TOKEN) and GITHUB_REPOSITORY must be set" }, 500);
    }

    const [owner, repo] = repository.split("/");
    if (!owner || !repo) {
      return jsonResponse({ error: "GITHUB_REPOSITORY must be in owner/repo format" }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const changes: Array<{ path: string; content: string; message?: string }> = Array.isArray(body?.changes)
      ? body.changes
      : body?.change
      ? [body.change]
      : [];

    if (!changes.length) {
      return jsonResponse({ error: "no changes provided" }, 400);
    }

    const commitMessage = body.commitMessage || "Tina CMS edits";
    const prTitle = body.prTitle || commitMessage;
    const prBody = body.prBody || "Automated edits via Tina CMS";
    const baseBranch = body.baseBranch || process.env.GITHUB_BASE_BRANCH || "main";
    const branchName = body.branchName || `tina-edit-${Date.now()}`;

    const ghHeaders = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    };

    // 1) Get base branch commit SHA
    const baseRefRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`,
      { headers: ghHeaders },
    );
    if (!baseRefRes.ok) {
      const txt = await baseRefRes.text().catch(() => "");
      return jsonResponse({ error: "failed to read base branch", details: txt }, 500);
    }
    const baseRefJson = await baseRefRes.json();
    const baseSha = baseRefJson?.object?.sha || baseRefJson?.sha;
    if (!baseSha) return jsonResponse({ error: "could not determine base SHA" }, 500);

    // 2) Create a new branch referencing the base SHA (ignore if already exists)
    const createRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: "POST",
      headers: ghHeaders,
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: baseSha }),
    });
    if (!createRefRes.ok) {
      const txt = await createRefRes.text().catch(() => "");
      // If the branch already exists, continue — otherwise fail
      if (!txt.includes("Reference already exists")) {
        return jsonResponse({ error: "failed to create branch", details: txt }, 500);
      }
    }

    // 3) For each file change, create/update using the contents API on the new branch
    for (const ch of changes) {
      if (!ch.path) return jsonResponse({ error: "change missing path" }, 400);
      const encodedPath = encodePathSegments(ch.path);

      // try to fetch existing file to obtain sha for updates
      let existingSha: string | undefined;
      const getFileRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${baseBranch}`,
        { headers: ghHeaders },
      );
      if (getFileRes.ok) {
        try {
          const jf = await getFileRes.json();
          existingSha = jf?.sha;
        } catch {}
      }

      const contentBase64 = Buffer.from(ch.content || "", "utf8").toString("base64");
      const putBody: Record<string, unknown> = {
        message: ch.message || commitMessage,
        content: contentBase64,
        branch: branchName,
      };
      if (existingSha) putBody.sha = existingSha;

      const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`, {
        method: "PUT",
        headers: ghHeaders,
        body: JSON.stringify(putBody),
      });
      if (!putRes.ok) {
        const txt = await putRes.text().catch(() => "");
        return jsonResponse({ error: `failed to create/update ${ch.path}`, details: txt }, 500);
      }
    }

    // 4) Open a pull request from the new branch into base
    const prRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      method: "POST",
      headers: ghHeaders,
      body: JSON.stringify({ title: prTitle, head: branchName, base: baseBranch, body: prBody }),
    });
    if (!prRes.ok) {
      const txt = await prRes.text().catch(() => "");
      return jsonResponse({ error: "failed to create PR", details: txt }, 500);
    }
    const prJson = await prRes.json();

    return jsonResponse({ ok: true, pr: { url: prJson.html_url, number: prJson.number } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("/api/tina/github error", err);
    return jsonResponse({ error: "server error" }, 500);
  }
}

export async function GET() {
  return jsonResponse({ info: "GitHub-backed Tina helper. POST with changes to create a PR." });
}
