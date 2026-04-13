// List media files under `public/` in the repository
function jsonResponse(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(req: Request) {
  try {
    const token = process.env.GITHUB_TOKEN ?? process.env.TINA_GITHUB_TOKEN;
    const repository = process.env.GITHUB_REPOSITORY;
    if (!token || !repository) {
      return jsonResponse({ error: 'GITHUB_TOKEN (or TINA_GITHUB_TOKEN) and GITHUB_REPOSITORY must be set' }, 500);
    }
    const [owner, repo] = repository.split('/');
    if (!owner || !repo) return jsonResponse({ error: 'GITHUB_REPOSITORY must be owner/repo' }, 500);

    const baseBranch = process.env.GITHUB_BASE_BRANCH || 'main';
    // derive dir from url path
    const url = new URL(req.url);
    const prefix = '/media/list/';
    const dirPath = url.pathname.startsWith(prefix) ? decodeURIComponent(url.pathname.slice(prefix.length)) : '';
    const targetPath = dirPath ? `public/${dirPath}` : 'public';

    const ghHeaders = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' };
    const listRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(targetPath)}?ref=${encodeURIComponent(baseBranch)}`, {
      headers: ghHeaders,
    });
    if (listRes.status === 404) {
      return jsonResponse({ cursor: 0, files: [], directories: [] });
    }
    if (!listRes.ok) {
      const txt = await listRes.text().catch(() => '');
      return jsonResponse({ error: 'failed to list media', details: txt }, 500);
    }

    const data = await listRes.json();
    // data can be an array of items
    const files: Array<{ filename: string; src: string }> = [];
    const directories: string[] = [];
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.type === 'dir') {
          directories.push(item.name);
        } else if (item.type === 'file') {
          const raw = `https://raw.githubusercontent.com/${owner}/${repo}/${baseBranch}/${item.path}`;
          files.push({ filename: item.name, src: raw });
        }
      }
    }

    return jsonResponse({ cursor: 0, files, directories });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('/media/list error', err);
    return jsonResponse({ error: 'server error' }, 500);
  }
}
