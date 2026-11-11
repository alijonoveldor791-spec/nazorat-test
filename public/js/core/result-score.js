// Natijaning eski va DTM formatlari uchun yagona o'zbekcha ball matnini beradi.
export const formatScore = (value) => Number(value).toLocaleString('uz-UZ').replace('.', ',');
export function resultScore(result) {
  const correct = result.correctCount ?? result.score;
  return result.dtmScore === undefined
    ? correct + '/' + result.total
    : correct +
        '/' +
        result.total +
        " ta to'g'ri \u00b7 " +
        formatScore(result.dtmScore) +
        '/' +
        (result.maxScore ?? 189) +
        ' ball';
}
