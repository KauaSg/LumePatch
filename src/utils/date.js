const DAY_MS = 86_400_000;

export function toDate(value) {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(value, fallback = "Sem validade") {
  const date = toDate(value);
  if (!date) return fallback;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function diffInDays(from, to) {
  const start = toDate(from ?? Date.now());
  const end = toDate(to);
  if (!start || !end) return null;
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / DAY_MS);
}

export function formatExpiryMessage(expiry) {
  const date = toDate(expiry);
  if (!date) return "Sem validade";
  const days = diffInDays(Date.now(), date);
  const formattedDate = formatDate(date);
  if (days === null) return formattedDate;
  if (days < 0) return `${formattedDate} (vencido)`;
  if (days === 0) return `${formattedDate} (vence hoje)`;
  if (days === 1) return `${formattedDate} (vence em 1 dia)`;
  return `${formattedDate} (vence em ${days} dias)`;
}

export function expiryBucket(expiry) {
  const days = diffInDays(Date.now(), expiry);
  if (days === null) return "sem_validade";
  if (days < 0) return "expired";
  if (days < 7) return "lt7";
  if (days < 30) return "lt30";
  return "all";
}

export function addDays(baseDate, days) {
  const base = toDate(baseDate ?? Date.now());
  if (!base || Number.isNaN(days)) return null;
  const result = new Date(base.getTime() + days * DAY_MS);
  return result.toISOString().slice(0, 10);
}

export { DAY_MS };
