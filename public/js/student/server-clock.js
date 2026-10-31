// Taymerni qurilmaning soat o’zgarishidan mustaqil qiladi.
export function serverClock(serverNow, receivedAt = Date.now()) {
  const monotonic = performance.now(),
    anchor = Date.parse(serverNow);
  const start = Number.isFinite(anchor) ? anchor : receivedAt;
  return () => start + performance.now() - monotonic;
}
