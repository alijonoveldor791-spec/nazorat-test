// Sahifaning ko'rinishi va amallarini mahalliy DOM orqali boshqaradi.
function normalizeName(value) {
  return value.trim().toLowerCase().replace(/['‘ʼ]/g, "'").replace(/\s+/g, ' ');
}
export { normalizeName };
