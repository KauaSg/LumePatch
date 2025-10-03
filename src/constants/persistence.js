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
  { id: "ataduras", name: "Ataduras", unit: "rolos", min: 40, minConfidence: 0.7, shelfLifeDays: 365 },
  { id: "gaze", name: "Gaze Estéril", unit: "pacotes", min: 180, minConfidence: 0.7, shelfLifeDays: 365 },
  { id: "cateter", name: "Cateter Venoso", unit: "un", min: 100, minConfidence: 0.7, shelfLifeDays: 547 },
  { id: "stent_coronario", name: "Stent Coronário", unit: "un", min: 6, minConfidence: 0.7, shelfLifeDays: 3650 },
  { id: "fio_sutura", name: "Fio de Sutura", unit: "un", min: 160, minConfidence: 0.7, shelfLifeDays: 730 },
  { id: "compressa", name: "Compressa Cirúrgica", unit: "pacotes", min: 200, minConfidence: 0.7, shelfLifeDays: 365 },
  { id: "bisturi", name: "Bisturi", unit: "un", min: 120, minConfidence: 0.7 },
  { id: "luva_esteril", name: "Luva Estéril", unit: "pares", min: 300, minConfidence: 0.7, shelfLifeDays: 365 },
  { id: "agulha_espinal", name: "Agulha Espinal", unit: "un", min: 70, minConfidence: 0.7, shelfLifeDays: 1825 }
];

export const DEFAULT_ITEM_MAP = DEFAULT_ITEMS.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

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

