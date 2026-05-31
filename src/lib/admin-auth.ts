function getExpectedAdminKey() {
  return process.env.ADMIN_API_KEY ?? process.env.CONSENT_ADMIN_KEY ?? null;
}

export function isAuthorizedAdminRequest(req: Request) {
  const expected = getExpectedAdminKey();
  if (!expected) return false;

  const headerKey = req.headers.get("x-admin-key") ?? req.headers.get("x-consent-admin-key") ?? "";
  return headerKey === expected;
}

export function requireAdminAuth(req: Request) {
  if (isAuthorizedAdminRequest(req)) return null;

  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: {
      "Content-Type": "application/json",
      "WWW-Authenticate": 'ApiKey realm="admin"',
    },
  });
}