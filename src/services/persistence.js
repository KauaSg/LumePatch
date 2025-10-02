import { DEFAULT_DETECTIONS, DEFAULT_HISTORY, DEFAULT_STOCK, DEFAULT_ITEM_SETTINGS, DEFAULT_ITEM_SETTINGS_MAP, STORAGE_KEYS } from "../constants/persistence";

const API_BASE_URL = (import.meta.env?.VITE_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
const API_TIMEOUT = 5000;

const hasWindow = typeof window !== "undefined";
const hasLocalStorage = hasWindow && typeof window.localStorage !== "undefined";

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const arrayToMap = (items) => (items || []).reduce((acc, item) => {
  if (item && item.id) {
    acc[item.id] = item;
  }
  return acc;
}, {});

const mapToArray = (map) => Object.values(map || {});

function readLocal(key, fallback) {
  if (!hasLocalStorage) return deepClone(fallback);
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return deepClone(fallback);
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[storage] Falha ao ler chave ${key}`, error);
    return deepClone(fallback);
  }
}

function writeLocal(key, value) {
  if (!hasLocalStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] Falha ao salvar chave ${key}`, error);
  }
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      signal: controller.signal,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API respondeu ${response.status}`);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function loadStock() {
  try {
    const data = await request(`/stock`);
    if (data && typeof data === "object" && !Array.isArray(data)) {
      writeLocal(STORAGE_KEYS.stock, data);
      return data;
    }
  } catch (error) {
    console.warn("Falha ao carregar estoque da API, usando localStorage", error);
  }
  return readLocal(STORAGE_KEYS.stock, DEFAULT_STOCK);
}

export async function loadItemSettings() {
  try {
    const data = await request(`/items`);
    if (Array.isArray(data)) {
      writeLocal(STORAGE_KEYS.itemSettings, data);
      return arrayToMap(data);
    }
  } catch (error) {
    console.warn("Falha ao carregar configuracoes de itens da API, usando localStorage", error);
  }
  const localData = readLocal(STORAGE_KEYS.itemSettings, DEFAULT_ITEM_SETTINGS);
  const asArray = Array.isArray(localData) ? localData : mapToArray(localData);
  if (!asArray || asArray.length === 0) {
    return { ...DEFAULT_ITEM_SETTINGS_MAP };
  }
  return arrayToMap(asArray);
}

export async function saveStock(stockSnapshot) {
  const snapshot = deepClone(stockSnapshot);
  writeLocal(STORAGE_KEYS.stock, snapshot);
  try {
    await request(`/stock`, {
      method: "PUT",
      body: JSON.stringify(snapshot),
    });
  } catch (error) {
    console.warn("Falha ao sincronizar estoque com API", error);
  }
}

export async function loadItemBatches() {
  try {
    const data = await request(`/itemBatches`);
    if (data && typeof data === "object" && !Array.isArray(data)) {
      writeLocal(STORAGE_KEYS.itemBatches, data);
      return data;
    }
  } catch (error) {
    console.warn("Falha ao carregar lotes da API, usando localStorage", error);
  }
  return readLocal(STORAGE_KEYS.itemBatches, {});
}

export async function saveItemBatches(itemId, batches) {
  const snapshot = deepClone(batches || []);
  const local = readLocal(STORAGE_KEYS.itemBatches, {});
  const next = { ...local, [itemId]: snapshot };
  writeLocal(STORAGE_KEYS.itemBatches, next);

  try {
    await request(`/itemBatches/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(snapshot),
    });
  } catch (error) {
    console.warn(`Falha ao salvar lotes do item ${itemId} na API`, error);
  }

  return snapshot;
}

export async function loadDetections() {
  try {
    const data = await request(`/detections?_sort=ts&_order=desc`);
    if (Array.isArray(data)) {
      writeLocal(STORAGE_KEYS.detections, data);
      return data;
    }
  } catch (error) {
    console.warn("Falha ao carregar detecoes da API, usando localStorage", error);
  }
  return readLocal(STORAGE_KEYS.detections, DEFAULT_DETECTIONS);
}

export async function loadHistory() {
  try {
    const data = await request(`/history?_sort=ts&_order=desc`);
    if (Array.isArray(data)) {
      writeLocal(STORAGE_KEYS.history, data);
      return data;
    }
  } catch (error) {
    console.warn("Falha ao carregar historico da API, usando localStorage", error);
  }
  return readLocal(STORAGE_KEYS.history, DEFAULT_HISTORY);
}

export async function appendDetection(detection) {
  const optimisticItem = deepClone(detection);
  const existing = readLocal(STORAGE_KEYS.detections, DEFAULT_DETECTIONS);
  writeLocal(STORAGE_KEYS.detections, [optimisticItem, ...existing]);

  try {
    const created = await request(`/detections`, {
      method: "POST",
      body: JSON.stringify(optimisticItem),
    });
    if (created) {
      writeLocal(STORAGE_KEYS.detections, [created, ...existing]);
      return created;
    }
  } catch (error) {
    console.warn("Falha ao enviar detecao para API", error);
  }

  return optimisticItem;
}

export async function appendHistory(record) {
  const existing = readLocal(STORAGE_KEYS.history, DEFAULT_HISTORY);
  const next = [record, ...existing];
  writeLocal(STORAGE_KEYS.history, next);
  try {
    await request(`/history`, {
      method: "POST",
      body: JSON.stringify(record),
    });
  } catch (error) {
    console.warn("Falha ao registrar historico na API", error);
  }
  return record;
}

export async function saveItemSetting(itemId, updates) {
  const localData = readLocal(STORAGE_KEYS.itemSettings, DEFAULT_ITEM_SETTINGS);
  const asArray = Array.isArray(localData) ? localData : mapToArray(localData);
  const currentMap = arrayToMap(asArray);
  const existing = currentMap[itemId] || { id: itemId };
  const next = { ...existing, ...updates, id: itemId };
  const nextMap = { ...currentMap, [itemId]: next };
  writeLocal(STORAGE_KEYS.itemSettings, mapToArray(nextMap));

  try {
    await request(`/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(next),
    });
  } catch (error) {
    console.warn(`Falha ao salvar configuracao do item ${itemId} na API`, error);
  }

  return next;
}

export async function clearHistory() {
  writeLocal(STORAGE_KEYS.history, DEFAULT_HISTORY);
  try {
    const existing = await request(`/history`);
    if (Array.isArray(existing)) {
      await Promise.all(existing.map((item) => request(`/history/${item.id}`, { method: "DELETE" })));
    }
  } catch (error) {
    console.warn("Falha ao limpar historico na API", error);
  }
}

export async function clearDetections() {
  writeLocal(STORAGE_KEYS.detections, DEFAULT_DETECTIONS);
  try {
    const existing = await request(`/detections`);
    if (Array.isArray(existing)) {
      await Promise.all(
        existing.map((item) =>
          request(`/detections/${item.id}`, {
            method: "DELETE",
          })
        )
      );
    }
  } catch (error) {
    console.warn("Falha ao limpar detecoes na API", error);
  }
}

export function hydrateDefaults() {
  writeLocal(STORAGE_KEYS.stock, readLocal(STORAGE_KEYS.stock, DEFAULT_STOCK));
  writeLocal(STORAGE_KEYS.detections, readLocal(STORAGE_KEYS.detections, DEFAULT_DETECTIONS));
  writeLocal(STORAGE_KEYS.history, readLocal(STORAGE_KEYS.history, DEFAULT_HISTORY));
  writeLocal(STORAGE_KEYS.itemSettings, readLocal(STORAGE_KEYS.itemSettings, DEFAULT_ITEM_SETTINGS));
  writeLocal(STORAGE_KEYS.itemBatches, readLocal(STORAGE_KEYS.itemBatches, {}));
}
