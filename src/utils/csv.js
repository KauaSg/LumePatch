import { formatDate } from "./date";

function escape(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildHistoryCsv({ history, itemsMap, itemBatches }) {
  const headers = [
    "item",
    "type",
    "direction",
    "qty",
    "confidence",
    "batchCode",
    "expiry",
    "fefo",
    "is_correction",
    "ts",
  ];
  const lines = [headers.join(",")];

  (history || []).forEach((record) => {
    const item = itemsMap[record.itemId];
    const batches = itemBatches[record.itemId] || [];
    const batch = batches.find((entry) => entry.id === record.batchId) || {};
    const row = [
      escape(item?.name ?? record.itemId ?? ""),
      escape(record.type ?? ""),
      escape(record.direction ?? ""),
      escape(record.qty ?? 0),
      escape(record.confidence ?? ""),
      escape(batch.code ?? ""),
      escape(batch.expiry ? formatDate(batch.expiry) : ""),
      escape(record.fefo ? "true" : "false"),
      escape(record.type === "correction" ? "true" : "false"),
      escape(new Date(record.ts).toISOString()),
    ];
    lines.push(row.join(","));
  });

  return lines.join("\n");
}

export function buildCsvFileName(prefix = "movimentacoes") {
  const now = new Date();
  const formatted = now
    .toISOString()
    .replace(/[-:]/g, '-')
    .slice(0, 16);
  return `${prefix}_${formatted}.csv`;
}
