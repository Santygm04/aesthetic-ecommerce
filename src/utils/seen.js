const PREFIX = "seen_v1";

export function markSeen(key) {
  try {
    localStorage.setItem(`${PREFIX}:${key}`, new Date().toISOString());
  } catch {}
}

export function hasUpdates(key, latestISO) {
  if (!latestISO) return false;
  try {
    const seen = localStorage.getItem(`${PREFIX}:${key}`);
    if (!seen) return true;
    return new Date(latestISO).getTime() > new Date(seen).getTime();
  } catch {
    return true;
  }
}
