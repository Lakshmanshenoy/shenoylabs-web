// Media upload route — accepts FormData (file, filename, directory) and creates a GitHub PR with the file
import { NextResponse } from 'next/server';

function jsonResponse(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: Request) {
  try {
    const token = process.env.GITHUB_TOKEN ?? process.env.TINA_GITHUB_TOKEN;
    const repository = process.env.GITHUB_REPOSITORY;
    if (!token || !repository) {
      return jsonResponse({ error: 'GITHUB_TOKEN (or TINA_GITHUB_TOKEN) and GITHUB_REPOSITORY must be set' }, 500);
    }
    const [owner, repo] = repository.split('/');
    if (!owner || !repo) {
      return jsonResponse({ error: 'GITHUB_REPOSITORY must be in owner/repo format' }, 500);
    }

    const form = await req.formData();
    const file = form.get('file') as any;
    const filenameField = form.get('filename') as string | null;
    const directoryField = form.get('directory') as string | null;
    if (!file) return jsonResponse({ error: 'no file provided' }, 400);

    const filename = filenameField || (file?.name ?? 'upload.bin');

    // compute uploadPath from request URL path if present, otherwise use filename and directory
    const url = new URL(req.url);
    const prefix = '/media/upload/';
    const pathFromParams = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : null;
    let uploadPath = pathFromParams && pathFromParams !== '' ? decodeURIComponent(pathFromParams) : (directoryField ? `${directoryField.replace(/^\/+|\/+$/g, '')}/${filename}` : filename);
    uploadPath = uploadPath.replace(/^\/+/, '');

    // target repo path (store under public so it becomes a static asset)
    const repoPath = `public/${uploadPath}`;

    // read file into buffer and base64
    const arrayBuffer = await file.arrayBuffer();
    const contentBase64 = Buffer.from(arrayBuffer).toString('base64');

    const commitMessage = `Tina media upload: ${filename}`;
    const prTitle = `Tina media upload: ${filename}`;
    const prBody = `Upload ${filename} via Tina CMS`;
    const baseBranch = process.env.GITHUB_BASE_BRANCH || 'main';
    const branchName = `tina-media-${Date.now()}`;

    // Use the tree helper endpoint internally to create a PR atomically
    const base = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`;
    const treeRes = await fetch(`${base}/api/tina/github/tree`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        changes: [{ path: repoPath, content: contentBase64, encoding: 'base64' }],
        commitMessage,
        prTitle,
        prBody,
        baseBranch,
        branchName,
      }),
    });

    if (!treeRes.ok) {
      const txt = await treeRes.text().catch(() => '');
      return jsonResponse({ error: 'failed to create media PR', details: txt }, 500);
    }
    const treeJson = await treeRes.json();

    // Construct a raw.githubusercontent URL for the uploaded file on the new branch
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branchName}/${repoPath}`;

    return jsonResponse({ success: true, src: rawUrl, pr: treeJson.pr });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('/media/upload error', err);
    return jsonResponse({ error: 'server error' }, 500);
  }
}

export async function GET() {
  return jsonResponse({ info: 'Media upload helper. POST FormData file to this endpoint.' });
}
