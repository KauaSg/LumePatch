import { addDays } from "./date";

export function generateBatchCode(sequence = 1, date = new Date()) {
  const iso = new Date(date).toISOString().slice(0, 10).replace(/-/g, "");
  const seq = String(sequence).padStart(2, "0");
  return `L-${iso}-${seq}`;
}

export function suggestExpiryFromShelfLife(shelfLifeDays, reference = Date.now()) {
  if (!shelfLifeDays) return null;
  return addDays(reference, shelfLifeDays);
}
