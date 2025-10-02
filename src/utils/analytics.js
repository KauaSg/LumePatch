import { diffInDays, expiryBucket } from "./date";

export function sumItemStock(itemId, itemBatches) {
  const batches = itemBatches[itemId] || [];
  return batches.reduce((total, batch) => total + (batch.qty || 0), 0);
}

export function findNextBatch(itemId, itemBatches) {
  const batches = itemBatches[itemId] || [];
  return batches
    .filter((batch) => (batch.qty || 0) > 0)
    .sort((a, b) => {
      if (!a.expiry && !b.expiry) return a.createdAt - b.createdAt;
      if (!a.expiry) return 1;
      if (!b.expiry) return -1;
      const diff = new Date(a.expiry).getTime() - new Date(b.expiry).getTime();
      if (diff !== 0) return diff;
      return a.createdAt - b.createdAt;
    })[0];
}

export function calculateKpis(history = []) {
  const totals = history.reduce(
    (acc, record) => {
      const type = record.type;
      if (type === "auto") acc.auto += 1;
      if (type === "manual") acc.manual += 1;
      if (type === "correction") acc.correction += 1;
      if (type === "auto" && !record.reverted) acc.autoNoCorrection += 1;
      return acc;
    },
    { auto: 0, manual: 0, correction: 0, autoNoCorrection: 0 }
  );

  const denom = totals.auto + totals.manual + totals.correction;
  const autoRate = denom > 0 ? totals.auto / denom : null;
  const accuracy = totals.auto > 0 ? totals.autoNoCorrection / totals.auto : null;

  return { autoRate, accuracy };
}

export function countExpiringItems(items = [], itemBatches = {}) {
  return items.reduce((acc, item) => {
    const batches = itemBatches[item.id] || [];
    const hasExpiring = batches.some((batch) => {
      const bucket = expiryBucket(batch.expiry);
      return bucket === "lt30" || bucket === "lt7" || bucket === "expired";
    });
    return hasExpiring ? acc + 1 : acc;
  }, 0);
}

export function filterItemsByExpiry(items = [], itemBatches = {}, filter = "all") {
  if (filter === "all") return items;
  return items.filter((item) => {
    const batches = itemBatches[item.id] || [];
    if (!batches.length) return false;
    return batches.some((batch) => expiryBucket(batch.expiry) === filter);
  });
}

export function buildItemForecasts(history = [], itemBatches = {}) {
  const windowDays = 14;
  const now = Date.now();
  const start = now - windowDays * 86_400_000;
  const usageMap = new Map();

  history.forEach((record) => {
    if (record.direction !== "out") return;
    if (!record.ts || record.ts < start) return;
    if (record.qty === undefined || record.qty === null) return;
    const key = record.itemId;
    usageMap.set(key, (usageMap.get(key) || 0) + Math.max(0, record.qty));
  });

  const forecasts = {};

  usageMap.forEach((totalQty, itemId) => {
    const avgDaily = totalQty / windowDays;
    const stock = sumItemStock(itemId, itemBatches);
    const daysToZero = avgDaily > 0 ? stock / avgDaily : null;
    if (daysToZero !== null && daysToZero <= 7) {
      forecasts[itemId] = { avgDaily, daysToZero };
    }
  });

  return forecasts;
}

export function buildExpiryBuckets(itemBatches = {}) {
  const buckets = { all: new Set(), lt7: new Set(), lt30: new Set(), expired: new Set() };
  Object.entries(itemBatches).forEach(([itemId, batches = []]) => {
    batches.forEach((batch) => {
      const bucket = expiryBucket(batch.expiry);
      if (bucket === "lt7") buckets.lt7.add(itemId);
      if (bucket === "lt30") buckets.lt30.add(itemId);
      if (bucket === "expired") buckets.expired.add(itemId);
      buckets.all.add(itemId);
    });
  });
  return buckets;
}

export function describeExpiry(batch) {
  if (!batch?.expiry) return "Sem validade";
  const days = diffInDays(Date.now(), batch.expiry);
  const formatted = new Date(batch.expiry).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  if (days === null) return formatted;
  if (days < 0) return `${formatted} (vencido)`;
  if (days === 0) return `${formatted} (vence hoje)`;
  if (days === 1) return `${formatted} (vence em 1 dia)`;
  return `${formatted} (vence em ${days} dias)`;
}
