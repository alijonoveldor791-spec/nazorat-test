// Eski Blobs yozuvlariga buzmasdan, takror qo'llanadigan default migratsiyasi.
export const DEFAULT_VIOLATION_LIMIT = 4;
export const VIOLATION_POLICY_VERSION = 2;
export function violationLimit(settings) {
  const value = settings?.violationLimit ?? DEFAULT_VIOLATION_LIMIT;
  return settings?.violationPolicyVersion !== VIOLATION_POLICY_VERSION && value === 2
    ? DEFAULT_VIOLATION_LIMIT
    : value;
}
export function violationSettings(settings = {}) {
  return {
    ...settings,
    violationLimit: violationLimit(settings),
    violationPolicyVersion: VIOLATION_POLICY_VERSION,
  };
}
export function violationState(row) {
  return row
    ? {
        violationCount: 0,
        violationLog: [],
        terminatedViolation: false,
        ...row,
        settings: violationSettings(row.settings),
      }
    : row;
}
