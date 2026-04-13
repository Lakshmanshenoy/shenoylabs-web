import { test, expect } from "@playwright/test";

test("media admin upload and delete flow (mocked)", async ({ page }) => {
  // Intercept media API calls from the client and return mocked responses
  await page.route("**/media/**", async (route) => {
    const req = route.request();
    const url = req.url();
    // list
    if (url.includes("/media/list")) {
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: [{ filename: "test-file.txt", src: "https://example.com/test-file.txt" }],
          directories: ["images"],
        }),
      });
      return;
    }

    // upload
    if (url.includes("/media/upload")) {
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pr: { url: "https://github.com/pr/999" }, src: "https://raw.githubusercontent.com/owner/repo/branch/public/images/new.txt" }),
      });
      return;
    }

    // delete
    if (req.method() === "DELETE" && url.includes("/media/")) {
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true, pr: { url: "https://github.com/pr/998" } }),
      });
      return;
    }

    return route.continue();
  });

  await page.goto("/admin/media");
  await expect(page.locator("text=test-file.txt")).toBeVisible();

  // Upload a small file via the file input
  const input = page.locator('input[type=file]');
  await input.setInputFiles({ name: "new.txt", mimeType: "text/plain", buffer: Buffer.from("hello") } as any);
  await page.click("text=Upload to current directory");
  // wait for the PR link to appear in the toast
  const prLink = page.locator('a', { hasText: "View PR" });
  await prLink.waitFor({ state: "visible", timeout: 5000 });
  await expect(prLink).toHaveAttribute("href", "https://github.com/pr/999");

  // The PR should also be recorded in Recent PRs (localStorage)
  await page.waitForFunction(() => !!localStorage.getItem('tina_media_pr_log'));
  const logsAfterUpload = await page.evaluate(() => JSON.parse(localStorage.getItem('tina_media_pr_log') || '[]'));
  expect(logsAfterUpload.some((e: any) => e.url === "https://github.com/pr/999")).toBeTruthy();

  // Delete: accept the confirmation dialog
  page.once("dialog", (d) => d.accept());
  await page.click("text=Delete");
  await expect(page.locator("text=Delete PR created")).toBeVisible();
  await expect(page.locator('a[href="https://github.com/pr/998"]').nth(1)).toBeVisible();

  // Both PRs should be in localStorage logs
  const logsAfterDelete = await page.evaluate(() => JSON.parse(localStorage.getItem('tina_media_pr_log') || '[]'));
  expect(logsAfterDelete.some((e: any) => e.url === "https://github.com/pr/999")).toBeTruthy();
  expect(logsAfterDelete.some((e: any) => e.url === "https://github.com/pr/998")).toBeTruthy();

  // Clear logs and ensure list empties
  await page.click('text=Clear logs');
  await expect(page.locator('text=No PRs yet')).toBeVisible();
});
