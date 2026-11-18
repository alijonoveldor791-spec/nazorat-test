// Natija yoki hali yakunlanmagan urinishning foydalanuvchiga ko'rinadigan holati.
export function statusLabel(row) {
  if (row.hasResult === false)
    return row.submissionStatus === 'in-progress' ? 'Davom etmoqda' : 'Boshlamagan';
  if (row.terminatedViolation) return 'Qoidabuzarlik bilan yakunlangan';
  return row.violationCount > 0 ? 'Topshirgan, qoidabuzarlik bor' : 'Topshirgan';
}
