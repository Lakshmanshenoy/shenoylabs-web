// Media file operations (DELETE)
function jsonResponse(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(req: Request) {
  try {
    const token = process.env.GITHUB_TOKEN ?? process.env.TINA_GITHUB_TOKEN;
    const repository = process.env.GITHUB_REPOSITORY;
    if (!token || !repository) {
      return jsonResponse({ error: "GITHUB_TOKEN (or TINA_GITHUB_TOKEN) and GITHUB_REPOSITORY must be set" }, 500);
    }
    const [owner, repo] = repository.split("/");
    if (!owner || !repo) return jsonResponse({ error: "GITHUB_REPOSITORY must be owner/repo" }, 500);

    const url = new URL(req.url);
    const prefix = "/media/";
    const relPath = url.pathname.startsWith(prefix) ? decodeURIComponent(url.pathname.slice(prefix.length)) : null;
    if (!relPath) return jsonResponse({ error: "no path provided" }, 400);

    const repoPath = `public/${relPath}`;
    const baseBranch = process.env.GITHUB_BASE_BRANCH || "main";
    const ghHeaders = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" };

    // Resolve base commit SHA
    const baseRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`, { headers: ghHeaders });
    if (!baseRefRes.ok) {
      const txt = await baseRefRes.text().catch(() => "");
      return jsonResponse({ error: "failed to read base branch", details: txt }, 500);
    }
    const baseRefJson = await baseRefRes.json();
    const baseCommitSha = baseRefJson?.object?.sha || baseRefJson?.sha;
    if (!baseCommitSha) return jsonResponse({ error: "could not determine base SHA" }, 500);

    const branchName = `tina-media-delete-${Date.now()}`;

    // create branch
    const createRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: "POST",
      headers: ghHeaders,
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: baseCommitSha }),
    });
    if (!createRefRes.ok) {
      const txt = await createRefRes.text().catch(() => "");
      if (!txt.includes("Reference already exists")) return jsonResponse({ error: "failed to create branch", details: txt }, 500);
    }

    // Fetch file sha on base branch
    const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(repoPath)}?ref=${encodeURIComponent(baseBranch)}`, { headers: ghHeaders });
    if (!fileRes.ok) {
      const txt = await fileRes.text().catch(() => "");
      return jsonResponse({ error: "file not found on base branch", details: txt }, 404);
    }
    const fileJson = await fileRes.json();
    const fileSha = fileJson?.sha;
    if (!fileSha) return jsonResponse({ error: "could not determine file sha" }, 500);

    // Delete file on the created branch
    const deleteRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(repoPath)}`, {
      method: "DELETE",
      headers: ghHeaders,
      body: JSON.stringify({ message: `Tina media delete: ${relPath}`, sha: fileSha, branch: branchName }),
    });
    if (!deleteRes.ok) {
      const txt = await deleteRes.text().catch(() => "");
      return jsonResponse({ error: "failed to delete file", details: txt }, 500);
    }

    // Open PR
    const prRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      method: "POST",
      headers: ghHeaders,
      body: JSON.stringify({ title: `Tina media delete: ${relPath}`, head: branchName, base: baseBranch, body: `Delete ${relPath} via Tina media manager` }),
    });
    if (!prRes.ok) {
      const txt = await prRes.text().catch(() => "");
      return jsonResponse({ error: "failed to create PR", details: txt }, 500);
    }
    const prJson = await prRes.json();

    return jsonResponse({ ok: true, pr: { url: prJson.html_url, number: prJson.number } }, 200);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("/media/* error", err);
    return jsonResponse({ error: "server error" }, 500);
  }
}

export async function GET(req: Request) {
  return jsonResponse({ info: "Media file helper. DELETE this path to create a PR that removes the file." });
}
