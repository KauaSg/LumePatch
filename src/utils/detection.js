import { KNOWN_LABELS } from "../constants/persistence";

export function normalizeLabel(label = "") {
  return label
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();
}

export function resolveItemId(label) {
  const normalized = normalizeLabel(label);
  if (KNOWN_LABELS.includes(normalized)) return normalized;
  return null;
}

export function confidenceToPercent(confidence = 0) {
  return Math.round((confidence || 0) * 100);
}
