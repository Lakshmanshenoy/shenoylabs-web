import { describe, it, expect, vi, beforeEach } from "vitest";

import * as route from "../src/app/media/[...path]/route";

describe("media delete route (dry-run)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN || "test-token";
    process.env.GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || "owner/repo";
    process.env.GITHUB_BASE_BRANCH = process.env.GITHUB_BASE_BRANCH || "main";
  });

  it("attempts to create branch, delete file and open PR", async () => {
    const calls: Array<{ url: string; init?: any }> = [];

    // stub global fetch to simulate GitHub API
    (global as any).fetch = vi.fn(async (input: any, init?: any) => {
      const url = typeof input === "string" ? input : input?.url;
      calls.push({ url, init });

      if (url.includes("/git/ref/heads/")) {
        return { ok: true, json: async () => ({ object: { sha: "base-sha" } }), text: async () => JSON.stringify({ object: { sha: "base-sha" } }) };
      }

      if (url.endsWith("/git/refs")) {
        return { ok: true, json: async () => ({}), text: async () => "{}" };
      }

      if (url.includes("/contents/")) {
        // GET: file metadata
        if (!init || (init && init.method === undefined)) {
          return { ok: true, json: async () => ({ sha: "file-sha" }), text: async () => "{}" };
        }
        // DELETE
        if (init && init.method === "DELETE") {
          return { ok: true, json: async () => ({ commit: { sha: "commit-sha" } }), text: async () => "{}" };
        }
      }

      if (url.endsWith("/pulls")) {
        return { ok: true, json: async () => ({ html_url: "https://github.com/pr/1", number: 1 }), text: async () => "{}" };
      }

      return { ok: true, json: async () => ({}), text: async () => "{}" };
    });

    const req = { url: "https://example.local/media/images/test-file.txt" } as any;
    const res: any = await (route as any).DELETE(req);
    const body = await res.json();
    // debug output on failure
    // eslint-disable-next-line no-console
    console.log('media-delete test result body:', body);
    // eslint-disable-next-line no-console
    console.log('fetch calls:', calls.map((c) => c.url));

    expect(body.ok).toBe(true);
    expect(body.pr?.url).toBe("https://github.com/pr/1");
    expect((global as any).fetch).toHaveBeenCalled();
    expect(calls.some((c) => c.url.includes("/git/ref/heads/main"))).toBe(true);
    expect(calls.some((c) => decodeURIComponent(c.url).includes("/contents/public/images/test-file.txt"))).toBe(true);
  });
});
