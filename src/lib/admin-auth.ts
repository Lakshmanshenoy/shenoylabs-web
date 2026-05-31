import { checkAdminRateLimit } from "./admin-rate-limit";

function getExpectedAdminKey() {
  return process.env.ADMIN_API_KEY ?? process.env.CONSENT_ADMIN_KEY ?? null;
}

export function isAuthorizedAdminRequest(req: Request) {
  const expected = getExpectedAdminKey();
  if (!expected) return false;

  const headerKey = req.headers.get("x-admin-key") ?? req.headers.get("x-consent-admin-key") ?? "";
  return headerKey === expected;
}

export async function requireAdminAuth(req: Request) {
  if (!isAuthorizedAdminRequest(req)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": 'ApiKey realm="admin"',
      },
    });
  }

  try {
    const rl = await checkAdminRateLimit(req);
    if (rl) return rl;
  } catch (err) {
    console.error("requireAdminAuth: rate-limit check failed", err);
  }

  return null;
}