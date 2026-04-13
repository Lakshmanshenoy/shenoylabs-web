// Tree-based GitHub commit + PR helper for Tina (single atomic commit)
// POST JSON: { changes: [{ path, content, encoding? }], commitMessage?, prTitle?, prBody?, baseBranch?, branchName? }
// Requires env: GITHUB_TOKEN, GITHUB_REPOSITORY (owner/repo)

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
    const repository = process.env.GITHUB_REPOSITORY; // owner/repo
    if (!token || !repository) {
      return jsonResponse({ error: "GITHUB_TOKEN (or TINA_GITHUB_TOKEN) and GITHUB_REPOSITORY must be set" }, 500);
    }

    const [owner, repo] = repository.split("/");
    if (!owner || !repo) {
      return jsonResponse({ error: "GITHUB_REPOSITORY must be in owner/repo format" }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const changes: Array<{ path: string; content: string; encoding?: string }> = Array.isArray(body?.changes)
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

    // 1) Resolve base commit SHA
    const baseRefRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`,
      { headers: ghHeaders },
    );
    if (!baseRefRes.ok) {
      const txt = await baseRefRes.text().catch(() => "");
      return jsonResponse({ error: "failed to read base branch", details: txt }, 500);
    }
    const baseRefJson = await baseRefRes.json();
    const baseCommitSha = baseRefJson?.object?.sha || baseRefJson?.sha;
    if (!baseCommitSha) return jsonResponse({ error: "could not determine base SHA" }, 500);

    // 2) Get the tree SHA for the base commit
    const baseCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${baseCommitSha}`, {
      headers: ghHeaders,
    });
    if (!baseCommitRes.ok) {
      const txt = await baseCommitRes.text().catch(() => "");
      return jsonResponse({ error: "failed to fetch base commit", details: txt }, 500);
    }
    const baseCommitJson = await baseCommitRes.json();
    const baseTreeSha = baseCommitJson?.tree?.sha;
    if (!baseTreeSha) return jsonResponse({ error: "could not determine base tree sha" }, 500);

    // 3) Create blobs for all changed files
    const treeEntries: Array<{ path: string; mode: string; type: string; sha: string }> = [];
    for (const ch of changes) {
      if (!ch.path) return jsonResponse({ error: "change missing path" }, 400);
      const content = ch.content ?? "";
      const encoding = ch.encoding ?? "utf-8";

      // GitHub blob API accepts raw content + encoding. We'll send base64.
      const contentBase64 = encoding === "base64" ? content : Buffer.from(content, "utf8").toString("base64");
      const blobBody = { content: contentBase64, encoding: "base64" };

      const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
        method: "POST",
        headers: ghHeaders,
        body: JSON.stringify(blobBody),
      });
      if (!blobRes.ok) {
        const txt = await blobRes.text().catch(() => "");
        return jsonResponse({ error: `failed to create blob for ${ch.path}`, details: txt }, 500);
      }
      const blobJson = await blobRes.json();
      const blobSha = blobJson?.sha;
      if (!blobSha) return jsonResponse({ error: `blob creation returned no sha for ${ch.path}` }, 500);

      treeEntries.push({ path: ch.path, mode: "100644", type: "blob", sha: blobSha });
    }

    // 4) Create a new tree based on the base tree
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
      method: "POST",
      headers: ghHeaders,
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
    });
    if (!treeRes.ok) {
      const txt = await treeRes.text().catch(() => "");
      return jsonResponse({ error: "failed to create tree", details: txt }, 500);
    }
    const treeJson = await treeRes.json();
    const newTreeSha = treeJson?.sha;
    if (!newTreeSha) return jsonResponse({ error: "failed to obtain tree sha" }, 500);

    // 5) Create commit
    const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      method: "POST",
      headers: ghHeaders,
      body: JSON.stringify({ message: commitMessage, tree: newTreeSha, parents: [baseCommitSha] }),
    });
    if (!commitRes.ok) {
      const txt = await commitRes.text().catch(() => "");
      return jsonResponse({ error: "failed to create commit", details: txt }, 500);
    }
    const commitJson = await commitRes.json();
    const newCommitSha = commitJson?.sha;
    if (!newCommitSha) return jsonResponse({ error: "failed to obtain commit sha" }, 500);

    // 6) Create or update the branch ref to point at the new commit
    const createRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: "POST",
      headers: ghHeaders,
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: newCommitSha }),
    });
    if (!createRefRes.ok) {
      const txt = await createRefRes.text().catch(() => "");
      // If branch exists, update it instead
      if (txt.includes("Reference already exists")) {
        const updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branchName}`, {
          method: "PATCH",
          headers: ghHeaders,
          body: JSON.stringify({ sha: newCommitSha, force: false }),
        });
        if (!updateRefRes.ok) {
          const txt2 = await updateRefRes.text().catch(() => "");
          return jsonResponse({ error: "failed to update existing ref", details: txt2 }, 500);
        }
      } else {
        return jsonResponse({ error: "failed to create ref", details: txt }, 500);
      }
    }

    // 7) Open a PR
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

    return jsonResponse({ ok: true, pr: { url: prJson.html_url, number: prJson.number } }, 201);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("/api/tina/github/tree error", err);
    return jsonResponse({ error: "server error" }, 500);
  }
}

export async function GET() {
  return jsonResponse({ info: "Tree-based GitHub Tina helper. POST with changes to create PR." });
}
