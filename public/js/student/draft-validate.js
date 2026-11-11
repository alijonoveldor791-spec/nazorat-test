// Buzilgan localStorage sabab test sahifasi oq ekran bo'lib qolishini to'sadi.
export function validAttempt(value) {
  if (
    !value ||
    typeof value.attemptToken !== 'string' ||
    !Array.isArray(value.questions) ||
    !value.questions.length ||
    value.questions.length > 200
  )
    return false;
  if (
    !value.questions.every(
      (q) =>
        q &&
        (q.contentFormat === undefined || q.contentFormat === 'rich-html-v1') &&
        typeof q.q === 'string' &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        q.options.length <= 6 &&
        q.options.every((o) => typeof o === 'string')
    )
  )
    return false;
  if (
    !Array.isArray(value.answers) ||
    value.answers.length !== value.questions.length ||
    value.answers.some(
      (a, i) => a !== null && (!Number.isInteger(a) || a < 0 || a >= value.questions[i].options.length)
    )
  )
    return false;
  if (
    !value.identity ||
    typeof value.identity.name !== 'string' ||
    typeof value.identity.surname !== 'string'
  )
    return false;
  if (value.deadline && !Number.isFinite(Date.parse(value.deadline))) return false;
  return true;
}
export function normalizeAttempt(value) {
  if (!validAttempt(value)) return null;
  const current = Number.isInteger(value.current)
    ? Math.max(0, Math.min(value.current, value.questions.length - 1))
    : 0;
  const flags = Array.isArray(value.flags)
    ? value.flags.filter((i) => Number.isInteger(i) && i >= 0 && i < value.questions.length)
    : [];
  return {
    ...value,
    current,
    flags,
    serverNow: Number.isFinite(Date.parse(value.serverNow)) ? value.serverNow : undefined,
    clockReceivedAt: Number.isFinite(value.clockReceivedAt) ? value.clockReceivedAt : undefined,
    draftVersion: Number.isInteger(value.draftVersion) && value.draftVersion >= 0 ? value.draftVersion : 0,
  };
}
export function validResult(value) {
  const result = value?.result;
  if (result?.hidden === true)
    return (
      typeof result.title === 'string' &&
      typeof value.identity?.name === 'string' &&
      typeof value.identity?.surname === 'string'
    );
  return !!(
    result &&
    Number.isInteger(result.total) &&
    result.total > 0 &&
    result.total <= 200 &&
    Number.isInteger(result.score) &&
    result.score >= 0 &&
    result.score <= result.total &&
    Array.isArray(result.results) &&
    result.results.length === result.total &&
    result.results.every((r) => typeof r === 'boolean') &&
    value.identity &&
    typeof value.identity.name === 'string' &&
    typeof value.identity.surname === 'string'
  );
}
export function validReview(value) {
  return (
    Array.isArray(value) &&
    value.length <= 200 &&
    value.every(
      (q) =>
        q &&
        (q.contentFormat === undefined || q.contentFormat === 'rich-html-v1') &&
        typeof q.q === 'string' &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        q.options.length <= 6 &&
        q.options.every((o) => typeof o === 'string') &&
        Number.isInteger(q.answer) &&
        q.answer >= 0 &&
        q.answer < q.options.length &&
        (q.selected === null ||
          (Number.isInteger(q.selected) && q.selected >= 0 && q.selected < q.options.length))
    )
  );
}
