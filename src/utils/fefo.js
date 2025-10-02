import { diffInDays } from "./date";

export function sortBatchesByExpiry(batches = []) {
  return [...batches].sort((a, b) => {
    if (!a?.expiry && !b?.expiry) return a.createdAt - b.createdAt;
    if (!a?.expiry) return 1;
    if (!b?.expiry) return -1;
    const diff = diffInDays(a.expiry, b.expiry);
    if (diff === null) return a.createdAt - b.createdAt;
    if (diff !== 0) return diff;
    return a.createdAt - b.createdAt;
  });
}

export function pickFefoBatch(batches = []) {
  const sorted = sortBatchesByExpiry(batches);
  return sorted[0] || null;
}
