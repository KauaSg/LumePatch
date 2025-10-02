const DAY_MS = 86_400_000;

function daysAgo(days) {
  return new Date(Date.now() - days * DAY_MS);
}

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

export function createDemoData() {
  const now = new Date();
  const items = [
    { id: "mascara", name: "Máscara Cirúrgica", unit: "un", min: 50, minConfidence: 0.7, shelfLifeDays: 365 },
    { id: "soro", name: "Soro Fisiológico", unit: "un", min: 10, minConfidence: 0.7, shelfLifeDays: 365 },
    { id: "seringa", name: "Seringa", unit: "un", min: 80, minConfidence: 0.7, shelfLifeDays: 1095 },
    { id: "luvas", name: "Luvas", unit: "pares", min: 150, minConfidence: 0.7, shelfLifeDays: 730 },
    { id: "alcool", name: "Álcool 70%", unit: "L", min: 20, minConfidence: 0.7, shelfLifeDays: 365 },
    { id: "ataduras", name: "Ataduras", unit: "rolos", min: 40, minConfidence: 0.7, shelfLifeDays: 365 },
  ];

  const itemBatches = {
    mascara: [
      {
        id: "batch-masc-1",
        itemId: "mascara",
        code: "MAS-" + toISODate(daysAgo(-30)).replace(/-/g, "") + "-01",
        qty: 180,
        expiry: toISODate(daysAgo(-15)),
        createdAt: daysAgo(40).getTime(),
      },
      {
        id: "batch-masc-2",
        itemId: "mascara",
        code: "MAS-" + toISODate(daysAgo(10)).replace(/-/g, "") + "-02",
        qty: 120,
        expiry: toISODate(daysAgo(-5)),
        createdAt: daysAgo(20).getTime(),
      },
    ],
    soro: [
      {
        id: "batch-soro-1",
        itemId: "soro",
        code: "SOR-" + toISODate(now).replace(/-/g, "") + "-01",
        qty: 80,
        expiry: toISODate(daysAgo(-60)),
        createdAt: daysAgo(50).getTime(),
      },
      {
        id: "batch-soro-2",
        itemId: "soro",
        code: "SOR-" + toISODate(daysAgo(-5)).replace(/-/g, "") + "-02",
        qty: 60,
        expiry: toISODate(daysAgo(-1)),
        createdAt: daysAgo(12).getTime(),
      },
    ],
    seringa: [
      {
        id: "batch-ser-1",
        itemId: "seringa",
        code: "SER-" + toISODate(daysAgo(-10)).replace(/-/g, "") + "-01",
        qty: 220,
        expiry: toISODate(daysAgo(120)),
        createdAt: daysAgo(90).getTime(),
      },
    ],
    luvas: [
      {
        id: "batch-luv-1",
        itemId: "luvas",
        code: "LUV-" + toISODate(daysAgo(-7)).replace(/-/g, "") + "-01",
        qty: 340,
        expiry: toISODate(daysAgo(45)),
        createdAt: daysAgo(60).getTime(),
      },
    ],
    alcool: [
      {
        id: "batch-alc-1",
        itemId: "alcool",
        code: "ALC-" + toISODate(daysAgo(-20)).replace(/-/g, "") + "-01",
        qty: 45,
        expiry: toISODate(daysAgo(30)),
        createdAt: daysAgo(35).getTime(),
      },
    ],
    ataduras: [
      {
        id: "batch-atd-1",
        itemId: "ataduras",
        code: "ATD-" + toISODate(daysAgo(-3)).replace(/-/g, "") + "-01",
        qty: 90,
        expiry: toISODate(daysAgo(20)),
        createdAt: daysAgo(25).getTime(),
      },
    ],
  };

  const history = [
    {
      id: "demo-hist-1",
      itemId: "mascara",
      batchId: "batch-masc-1",
      type: "auto",
      direction: "out",
      qty: 12,
      confidence: 0.86,
      fefo: true,
      source: "camera",
      ts: daysAgo(1).getTime(),
    },
    {
      id: "demo-hist-2",
      itemId: "mascara",
      batchId: "batch-masc-2",
      type: "correction",
      direction: "out",
      qty: 8,
      confidence: 0.61,
      fefo: true,
      oldLabel: "seringa",
      newLabel: "Máscara Cirúrgica",
      source: "ui",
      ts: daysAgo(0.5).getTime(),
    },
    {
      id: "demo-hist-3",
      itemId: "soro",
      batchId: "batch-soro-2",
      type: "auto",
      direction: "out",
      qty: 4,
      confidence: 0.9,
      fefo: true,
      source: "camera",
      ts: daysAgo(2).getTime(),
    },
    {
      id: "demo-hist-4",
      itemId: "soro",
      batchId: "batch-soro-2",
      type: "manual",
      direction: "in",
      qty: 20,
      source: "ui",
      user: "Camila",
      ts: daysAgo(3).getTime(),
    },
    {
      id: "demo-hist-5",
      itemId: "luvas",
      batchId: "batch-luv-1",
      type: "auto",
      direction: "out",
      qty: 15,
      confidence: 0.83,
      fefo: true,
      source: "camera",
      ts: daysAgo(4).getTime(),
    },
    {
      id: "demo-hist-6",
      itemId: "seringa",
      batchId: "batch-ser-1",
      type: "auto",
      direction: "out",
      qty: 18,
      confidence: 0.79,
      fefo: true,
      source: "camera",
      ts: daysAgo(5).getTime(),
    },
    {
      id: "demo-hist-7",
      itemId: "alcool",
      batchId: "batch-alc-1",
      type: "manual",
      direction: "in",
      qty: 15,
      source: "ui",
      user: "João",
      ts: daysAgo(6).getTime(),
    },
    {
      id: "demo-hist-8",
      itemId: "ataduras",
      batchId: "batch-atd-1",
      type: "auto",
      direction: "out",
      qty: 10,
      confidence: 0.88,
      fefo: true,
      source: "camera",
      ts: daysAgo(7).getTime(),
    },
  ];

  const retrainQueue = [
    {
      id: "demo-retrain-1",
      itemId: "mascara",
      oldLabel: "seringa",
      newLabel: "máscara",
      confidence: 0.61,
      ts: daysAgo(0.5).getTime(),
    },
  ];

  return {
    items,
    itemBatches,
    history,
    retrainQueue,
  };
}
