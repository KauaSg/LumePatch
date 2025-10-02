<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { DEFAULT_DETECTIONS, DEFAULT_HISTORY, DEFAULT_STOCK, DEFAULT_ITEM_SETTINGS, DEFAULT_ITEM_SETTINGS_MAP, STORAGE_KEYS } from "../constants/persistence";
=======
=======
>>>>>>> Stashed changes
import {
  DEFAULT_ITEMS,
  DEFAULT_ITEM_MAP,
  DEFAULT_ITEM_BATCHES,
  DEFAULT_HISTORY,
  DEFAULT_RETRAIN_QUEUE,
  STORAGE_KEYS,
} from "../constants/persistence";
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

const API_BASE_URL = (import.meta.env?.VITE_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
const API_TIMEOUT = 5000;

const hasWindow = typeof window !== "undefined";
const hasLocalStorage = hasWindow && typeof window.localStorage !== "undefined";

const deepClone = (value) => JSON.parse(JSON.stringify(value));

<<<<<<< Updated upstream
<<<<<<< Updated upstream
const arrayToMap = (items) => (items || []).reduce((acc, item) => {
  if (item && item.id) {
    acc[item.id] = item;
  }
  return acc;
}, {});

const mapToArray = (map) => Object.values(map || {});
=======
const mapValues = (map) => Object.values(map || {});
>>>>>>> Stashed changes
=======
const mapValues = (map) => Object.values(map || {});
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      signal: controller.signal,
      ...options,
    });

<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes
    if (response.status === 404) {
      return null;
    }

<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    if (!response.ok) {
      throw new Error(`API respondeu ${response.status}`);
    }

    if (response.status === 204) return null;
<<<<<<< Updated upstream
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } finally {
    clearTimeout(timeoutId);
  }
}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
=======
>>>>>>> Stashed changes
export async function loadItems() {
  try {
    const data = await request(`/items`);
    if (Array.isArray(data) && data.length) {
      writeLocal(STORAGE_KEYS.items, data);
      return data.map((item) => ({ ...DEFAULT_ITEM_MAP[item.id], ...item }));
    }
  } catch (error) {
    console.warn("Falha ao carregar itens da API, usando localStorage", error);
  }
  const local = readLocal(STORAGE_KEYS.items, DEFAULT_ITEMS);
  return Array.isArray(local) ? local : mapValues(local);
}

export async function saveItem(item) {
  const current = readLocal(STORAGE_KEYS.items, DEFAULT_ITEMS);
  const asArray = Array.isArray(current) ? current : mapValues(current);
  const index = asArray.findIndex((entry) => entry.id === item.id);
  const next = index >= 0 ? [...asArray.slice(0, index), item, ...asArray.slice(index + 1)] : [...asArray, item];
  writeLocal(STORAGE_KEYS.items, next);
  try {
    await request(`/items/${item.id}`, {
      method: "PUT",
      body: JSON.stringify(item),
    });
  } catch (error) {
    console.warn(`Falha ao salvar item ${item.id} na API`, error);
  }
  return item;
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
}

export async function loadItemBatches() {
  try {
    const data = await request(`/itemBatches`);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes
    if (Array.isArray(data)) {
      const map = data.reduce((acc, entry) => {
        if (entry && entry.id) {
          acc[entry.id] = Array.isArray(entry.batches) ? entry.batches : [];
        }
        return acc;
      }, {});
      writeLocal(STORAGE_KEYS.itemBatches, map);
      return map;
    }
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    if (data && typeof data === "object" && !Array.isArray(data)) {
      writeLocal(STORAGE_KEYS.itemBatches, data);
      return data;
    }
  } catch (error) {
    console.warn("Falha ao carregar lotes da API, usando localStorage", error);
  }
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  return readLocal(STORAGE_KEYS.itemBatches, {});
=======
  return readLocal(STORAGE_KEYS.itemBatches, DEFAULT_ITEM_BATCHES);
>>>>>>> Stashed changes
=======
  return readLocal(STORAGE_KEYS.itemBatches, DEFAULT_ITEM_BATCHES);
>>>>>>> Stashed changes
}

export async function saveItemBatches(itemId, batches) {
  const snapshot = deepClone(batches || []);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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

=======
=======
>>>>>>> Stashed changes
  const current = readLocal(STORAGE_KEYS.itemBatches, DEFAULT_ITEM_BATCHES);
  const next = { ...current, [itemId]: snapshot };
  writeLocal(STORAGE_KEYS.itemBatches, next);
  try {
    await request(`/itemBatches/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ id: itemId, batches: snapshot }),
    });
  } catch (error) {
    console.warn(`Falha ao enviar lotes do item ${itemId} para API`, error);
  }
  return snapshot;
}

<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
export async function loadHistory() {
  try {
    const data = await request(`/history?_sort=ts&_order=desc`);
    if (Array.isArray(data)) {
      writeLocal(STORAGE_KEYS.history, data);
      return data;
    }
  } catch (error) {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    console.warn("Falha ao carregar historico da API, usando localStorage", error);
=======
    console.warn("Falha ao carregar histórico da API, usando localStorage", error);
>>>>>>> Stashed changes
=======
    console.warn("Falha ao carregar histórico da API, usando localStorage", error);
>>>>>>> Stashed changes
  }
  return readLocal(STORAGE_KEYS.history, DEFAULT_HISTORY);
}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
export async function appendHistory(record) {
  const current = readLocal(STORAGE_KEYS.history, DEFAULT_HISTORY);
  const next = [record, ...current];
>>>>>>> Stashed changes
=======
export async function appendHistory(record) {
  const current = readLocal(STORAGE_KEYS.history, DEFAULT_HISTORY);
  const next = [record, ...current];
>>>>>>> Stashed changes
  writeLocal(STORAGE_KEYS.history, next);
  try {
    await request(`/history`, {
      method: "POST",
      body: JSON.stringify(record),
    });
  } catch (error) {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    console.warn("Falha ao registrar historico na API", error);
=======
    console.warn("Falha ao enviar histórico para API", error);
>>>>>>> Stashed changes
=======
    console.warn("Falha ao enviar histórico para API", error);
>>>>>>> Stashed changes
  }
  return record;
}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
=======
>>>>>>> Stashed changes
export async function updateHistoryRecord(id, updates) {
  const current = readLocal(STORAGE_KEYS.history, DEFAULT_HISTORY);
  const index = current.findIndex((entry) => entry.id === id);
  if (index < 0) return null;
  const nextRecord = { ...current[index], ...updates };
  const next = [...current];
  next[index] = nextRecord;
  writeLocal(STORAGE_KEYS.history, next);
  try {
    await request(`/history/${id}`, {
      method: "PATCH",
      body: JSON.stringify(nextRecord),
    });
  } catch (error) {
    console.warn(`Falha ao atualizar histórico ${id} na API`, error);
  }
  return nextRecord;
}

export async function loadRetrainQueue() {
  try {
    const data = await request(`/retrainQueue?_sort=ts&_order=desc`);
    if (Array.isArray(data)) {
      writeLocal(STORAGE_KEYS.retrainQueue, data);
      return data;
    }
  } catch (error) {
    console.warn("Falha ao carregar fila de re-treino, usando localStorage", error);
  }
  return readLocal(STORAGE_KEYS.retrainQueue, DEFAULT_RETRAIN_QUEUE);
}

export async function appendRetrainQueue(entry) {
  const current = readLocal(STORAGE_KEYS.retrainQueue, DEFAULT_RETRAIN_QUEUE);
  const next = [entry, ...current];
  writeLocal(STORAGE_KEYS.retrainQueue, next);
  try {
    await request(`/retrainQueue`, {
      method: "POST",
      body: JSON.stringify(entry),
    });
  } catch (error) {
    console.warn("Falha ao registrar item na fila de re-treino", error);
  }
  return entry;
}

export async function deleteRetrainEntry(id) {
  const current = readLocal(STORAGE_KEYS.retrainQueue, DEFAULT_RETRAIN_QUEUE);
  const next = current.filter((entry) => entry.id !== id);
  writeLocal(STORAGE_KEYS.retrainQueue, next);
  try {
    await request(`/retrainQueue/${id}`, { method: "DELETE" });
  } catch (error) {
    console.warn(`Falha ao remover ${id} da fila de re-treino`, error);
  }
}

export async function clearRetrainQueue() {
  writeLocal(STORAGE_KEYS.retrainQueue, DEFAULT_RETRAIN_QUEUE);
  try {
    const remote = await request(`/retrainQueue`);
    if (Array.isArray(remote)) {
      await Promise.all(remote.map((entry) => request(`/retrainQueue/${entry.id}`, { method: "DELETE" })));
    }
  } catch (error) {
    console.warn("Falha ao limpar fila de re-treino remota", error);
  }
}

export function loadFilters() {
  return readLocal(STORAGE_KEYS.filters, {
    expiry: "all",
    auditType: "all",
    auditSearch: "",
    auditDateRange: null,
  });
}

export function saveFilters(filters) {
  writeLocal(STORAGE_KEYS.filters, filters);
}

export function loadUIState() {
  return readLocal(STORAGE_KEYS.ui, {
    tourDismissed: false,
    keyboardTooltipDismissed: false,
    demoMode: false,
  });
}

export function saveUIState(state) {
  writeLocal(STORAGE_KEYS.ui, state);
}

export function hydrateDefaults() {
  writeLocal(STORAGE_KEYS.items, readLocal(STORAGE_KEYS.items, DEFAULT_ITEMS));
  writeLocal(STORAGE_KEYS.itemBatches, readLocal(STORAGE_KEYS.itemBatches, DEFAULT_ITEM_BATCHES));
  writeLocal(STORAGE_KEYS.history, readLocal(STORAGE_KEYS.history, DEFAULT_HISTORY));
  writeLocal(STORAGE_KEYS.retrainQueue, readLocal(STORAGE_KEYS.retrainQueue, DEFAULT_RETRAIN_QUEUE));
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
}
