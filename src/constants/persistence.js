<<<<<<< Updated upstream
export const DEFAULT_STOCK = {
  soro: 20,
  mascara: 50,
  seringa: 100,
  luvas: 200,
  alcool: 30,
  termometro: 15,
  avental: 40,
  agulha: 120,
  tubo_ensaio: 300,
  pipeta: 80,
  centrifuga: 5,
  microscopio: 3,
  ataduras: 60,
};

export const DEFAULT_DETECTIONS = [];
export const DEFAULT_HISTORY = [];

export const DEFAULT_ITEM_SETTINGS = [
  { id: "soro", displayName: "Soro Fisiologico", unit: "un", minStock: 10, shelfLifeDays: 365 },
  { id: "mascara", displayName: "Mascara Cirurgica", unit: "un", minStock: 50, shelfLifeDays: 365 },
  { id: "seringa", displayName: "Seringa", unit: "un", minStock: 80, shelfLifeDays: 1095 },
  { id: "luvas", displayName: "Luvas", unit: "pares", minStock: 150, shelfLifeDays: 730 },
  { id: "alcool", displayName: "Alcool 70", unit: "l", minStock: 20, shelfLifeDays: 365 },
  { id: "termometro", displayName: "Termometro", unit: "un", minStock: 10, shelfLifeDays: 1825 },
  { id: "avental", displayName: "Avental", unit: "un", minStock: 30, shelfLifeDays: 365 },
  { id: "agulha", displayName: "Agulha", unit: "un", minStock: 100, shelfLifeDays: 1825 },
  { id: "tubo_ensaio", displayName: "Tubo de Ensaio", unit: "un", minStock: 200, shelfLifeDays: 365 },
  { id: "pipeta", displayName: "Pipeta", unit: "un", minStock: 60, shelfLifeDays: 365 },
  { id: "centrifuga", displayName: "Centrifuga", unit: "un", minStock: 2, shelfLifeDays: 1825 },
  { id: "microscopio", displayName: "Microscopio", unit: "un", minStock: 2, shelfLifeDays: 1825 },
  { id: "ataduras", displayName: "Ataduras", unit: "rolos", minStock: 40, shelfLifeDays: 365 },
];

export const DEFAULT_ITEM_SETTINGS_MAP = DEFAULT_ITEM_SETTINGS.reduce((acc, item) => {
=======
export const DEFAULT_ITEMS = [
  { id: "soro", name: "Soro Fisiológico", unit: "un", min: 10, minConfidence: 0.7, shelfLifeDays: 365 },
  { id: "mascara", name: "Máscara Cirúrgica", unit: "un", min: 50, minConfidence: 0.7, shelfLifeDays: 365 },
  { id: "seringa", name: "Seringa", unit: "un", min: 80, minConfidence: 0.7, shelfLifeDays: 1095 },
  { id: "luvas", name: "Luvas", unit: "pares", min: 150, minConfidence: 0.7, shelfLifeDays: 730 },
  { id: "alcool", name: "Álcool 70%", unit: "L", min: 20, minConfidence: 0.7, shelfLifeDays: 365 },
  { id: "termometro", name: "Termômetro", unit: "un", min: 10, minConfidence: 0.7, shelfLifeDays: 1825 },
  { id: "avental", name: "Avental", unit: "un", min: 30, minConfidence: 0.7, shelfLifeDays: 365 },
  { id: "agulha", name: "Agulha", unit: "un", min: 100, minConfidence: 0.7, shelfLifeDays: 1825 },
  { id: "tubo_ensaio", name: "Tubo de Ensaio", unit: "un", min: 200, minConfidence: 0.7, shelfLifeDays: 365 },
  { id: "pipeta", name: "Pipeta", unit: "un", min: 60, minConfidence: 0.7, shelfLifeDays: 365 },
  { id: "centrifuga", name: "Centrífuga", unit: "un", min: 2, minConfidence: 0.7, shelfLifeDays: 1825 },
  { id: "microscopio", name: "Microscópio", unit: "un", min: 2, minConfidence: 0.7, shelfLifeDays: 1825 },
  { id: "ataduras", name: "Ataduras", unit: "rolos", min: 40, minConfidence: 0.7, shelfLifeDays: 365 }
];

export const DEFAULT_ITEM_MAP = DEFAULT_ITEMS.reduce((acc, item) => {
>>>>>>> Stashed changes
  acc[item.id] = item;
  return acc;
}, {});

<<<<<<< Updated upstream
export const STORAGE_KEYS = {
  stock: "stock",
  detections: "savedDetections",
  history: "history",
  itemSettings: "itemSettings",
  itemBatches: "itemBatches",
};
=======
export const DEFAULT_ITEM_BATCHES = {};

export const DEFAULT_HISTORY = [];
export const DEFAULT_RETRAIN_QUEUE = [];

export const STORAGE_KEYS = {
  items: "items",
  itemBatches: "itemBatches",
  history: "history",
  retrainQueue: "retrainQueue",
  filters: "filters",
  ui: "uiState",
};

export const KNOWN_LABELS = DEFAULT_ITEMS.map((item) => item.id);
>>>>>>> Stashed changes
