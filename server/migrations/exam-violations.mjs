// Eski Blobs yozuvlariga buzmasdan, takror qo'llanadigan default migratsiyasi.
export const DEFAULT_VIOLATION_LIMIT = 2;
export function violationState(row) {
  return row ? { violationCount: 0, violationLog: [], terminatedViolation: false, ...row } : row;
}
export function violationLimit(settings) {
  return settings?.violationLimit ?? DEFAULT_VIOLATION_LIMIT;
}
