// Centralized retention windows (defaults). Values are expressed in days
// and intended to be safe defaults — adjust per legal counsel.

export const DATA_RETENTION_DAYS = {
  serverLogs: 90,
  analytics: 395, // ~13 months
  emailMetadata: 90,
  consentEvents: 1825, // 5 years
  dsrExports: 30,
  turnstileTokenMinutes: 5,
};

export const msFromDays = (d: number) => d * 24 * 60 * 60 * 1000;

export default { DATA_RETENTION_DAYS, msFromDays };
