<<<<<<< Updated upstream
import React, { useRef, useEffect, useState } from "react";
import * as tmImage from "@teachablemachine/image";
=======
import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
>>>>>>> Stashed changes
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Container,
  Box
} from "@mui/material";
<<<<<<< Updated upstream
import { ThemeProvider, createTheme, alpha } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import InventoryIcon from "@mui/icons-material/Inventory";
import AddIcon from "@mui/icons-material/Add";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import HistoryIcon from "@mui/icons-material/History";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import Dashboard from "./Dashboard";
import { DEFAULT_DETECTIONS, DEFAULT_HISTORY, DEFAULT_STOCK, DEFAULT_ITEM_SETTINGS_MAP } from "./constants/persistence";
import {
  loadStock as loadPersistedStock,
  saveStock as persistStock,
  appendDetection as persistDetection,
  clearDetections as purgeDetections,
  loadItemSettings as loadPersistedItemSettings,
  saveItemSetting as persistItemSetting,
  loadItemBatches as loadPersistedItemBatches,
  saveItemBatches as persistItemBatches,
  loadHistory as loadPersistedHistory,
  appendHistory as persistHistory,
  clearHistory as purgeHistory,
} from "./services/persistence";

const TEACHABLE_MODEL_URL = "/teachable/";
const TARGET_LABELS = [
  "soro",
  "mascara",
  "seringa",
  "luvas",
  "alcool",
  "termometro",
  "avental",
  "agulha",
  "tubo de ensaio",
  "pipeta",
  "centrifuga",
  "microscopio",
  "ataduras",
];
const TEACHABLE_PROB_THRESHOLD = 0.85;
=======
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import DetectionView from "./pages/DetectionView";
import DashboardView from "./pages/DashboardView";
import AuditView from "./pages/AuditView";
import RetrainQueueView from "./pages/RetrainQueueView";
import BatchDetailView from "./pages/BatchDetailView";
import ExportCsvButton from "./components/ExportCsvButton";
import GuidedTour from "./components/GuidedTour";
import InstallPwaPrompt from "./components/InstallPwaPrompt";
import { AppStateProvider } from "./state/AppStateContext";
>>>>>>> Stashed changes
<<<<<<< Updated upstream

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const EXPIRY_WARNING_DAYS = 7;

const formatDate = (iso) => {
  if (!iso) return "Sem validade";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Sem validade";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const describeExpiry = (info) => {
  if (!info || !info.nextBatch?.expiresAt) return "Sem validade";
  const label = formatDate(info.nextBatch.expiresAt);
  const diffDays = info.diffDays;
  if (typeof diffDays !== "number") return label;
  if (diffDays < 0) return `${label} (vencido)`;
  if (diffDays === 0) return `${label} (vence hoje)`;
  if (diffDays === 1) return `${label} (vence em 1 dia)`;
  return `${label} (vence em ${diffDays} dias)`;
};
=======
>>>>>>> Stashed changes

const theme = createTheme({
  palette: {
    primary: { main: "#1565c0" },
    secondary: { main: "#42a5f5" },
    success: { main: "#2e7d32" },
    warning: { main: "#f9a825" },
    error: { main: "#d32f2f" },
    background: {
      default: "#f5f7fb",
      paper: "#ffffff",
    },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
});

<<<<<<< Updated upstream
// Componente para exibir o nível de estoque com cores
const StockLevelIndicator = ({ quantity, lowStockThreshold = 10, unit = "un" }) => {
  const getColor = () => {
    if (quantity === 0) return "error";
    if (quantity <= lowStockThreshold) return "warning";
    return "success";
  };
=======
const NAV_ITEMS = [
  { label: "Detecção", path: "/deteccao" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Auditoria", path: "/auditoria" },
  { label: "Fila de Aprendizado", path: "/fila" },
];
>>>>>>> Stashed changes

function NavigationTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const current = React.useMemo(() => {
    if (location.pathname.startsWith("/lote/")) return "/deteccao";
    const match = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path));
    return match ? match.path : false;
  }, [location.pathname]);

  const handleChange = (_event, value) => {
    navigate(value);
  };

  return (
<<<<<<< Updated upstream
    <Chip
      icon={getIcon()}
      label={`${quantity} ${unit}`}
      color={getColor()}
      variant={quantity === 0 ? "filled" : "outlined"}
      size="small"
      sx={{ fontWeight: 600 }}
    />
  );
};

// Componente de card de estoque personalizado
const StockCard = ({ itemName, quantity, onAddStock, onConfigure, metadata, expiryInfo }) => {
  const displayName = metadata?.displayName || itemName.replace(/_/g, " ");
  const unit = metadata?.unit || "un";
  const threshold = typeof metadata?.minStock === "number" ? metadata.minStock : 10;
  const isOutOfStock = quantity === 0;
  const isLowStock = !isOutOfStock && quantity <= threshold;
  const diffDays = expiryInfo?.diffDays;
  const isExpired = typeof diffDays === "number" && diffDays < 0;
  const isExpiringSoon = typeof diffDays === "number" && diffDays >= 0 && diffDays <= EXPIRY_WARNING_DAYS;
  const expiryStatusLabel = describeExpiry(expiryInfo);

  let backgroundGradient = `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`;
  let borderColor = alpha(theme.palette.success.main, 0.3);
  if (isOutOfStock || isExpired) {
    backgroundGradient = `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`;
    borderColor = alpha(theme.palette.error.main, 0.3);
  } else if (isLowStock || isExpiringSoon) {
    backgroundGradient = `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`;
    borderColor = alpha(theme.palette.warning.main, 0.3);
  }

  return (
    <Card 
      sx={{ 
        height: 156,
        background: backgroundGradient,
        border: `2px solid ${borderColor}`,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 2,
      }}
    >
      <Box>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 600,
            color: (isOutOfStock || isExpired) ? "error.main" : "text.primary",
            textTransform: "capitalize",
            mb: 0.5
          }}
        >
          {displayName}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
          Minimo: {threshold} {unit}
        </Typography>
        <Typography
          variant="caption"
          color={isExpired ? "error.main" : isExpiringSoon ? "warning.main" : "text.secondary"}
          sx={{ display: "block", mb: 0.75 }}
        >
          Validade: {expiryStatusLabel}
        </Typography>
        <StockLevelIndicator quantity={quantity} unit={unit} lowStockThreshold={threshold} />
      </Box>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Tooltip title={`Configurar ${displayName}`}>
          <IconButton 
            size="small" 
            onClick={() => onConfigure(itemName)}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) }
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={`Adicionar estoque para ${displayName}`}>
          <IconButton 
            size="small" 
            onClick={() => onAddStock(itemName)}
            sx={{ 
              bgcolor: "primary.main",
              color: "white",
              "&:hover": { bgcolor: "primary.dark" }
            }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Card>
=======
    <Tabs
      value={current}
      onChange={handleChange}
      textColor="inherit"
      indicatorColor="secondary"
      variant="scrollable"
      scrollButtons="auto"
    >
      {NAV_ITEMS.map((item) => (
        <Tab key={item.path} value={item.path} label={item.label} />
      ))}
    </Tabs>
>>>>>>> Stashed changes
  );
}

function BatchDetailRoute() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  if (!batchId) {
    return <Navigate to="/deteccao" replace />;
  }
  return <BatchDetailView batchId={batchId} onBack={() => navigate(-1)} />;
}

function AppShell() {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <AppBar position="static" elevation={0} color="primary">
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            LumePatch
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <ExportCsvButton />
        </Toolbar>
        <NavigationTabs />
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/deteccao" replace />} />
          <Route path="/deteccao" element={<DetectionView />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/auditoria" element={<AuditView />} />
          <Route path="/fila" element={<RetrainQueueView />} />
          <Route path="/lote/:batchId" element={<BatchDetailRoute />} />
          <Route path="*" element={<Navigate to="/deteccao" replace />} />
        </Routes>
      </Container>
      <Box sx={{ position: "fixed", bottom: 24, right: 24, width: 320 }}>
        <InstallPwaPrompt />
      </Box>
      <GuidedTour />
    </Box>
  );
}

export default function App() {
<<<<<<< Updated upstream
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const modelRef = useRef(null);
  const loopRef = useRef(false);

  const [loadingText, setLoadingText] = useState("Inicializando câmera...");
  const [modalOpen, setModalOpen] = useState(false);
  const [pending, setPending] = useState(null);
  const [history, setHistory] = useState(DEFAULT_HISTORY);
  const [itemSettings, setItemSettings] = useState(() => ({ ...DEFAULT_ITEM_SETTINGS_MAP }));
  const [itemBatches, setItemBatches] = useState({});

  // NOVO: quantidade a confirmar (opcional)
  const [confirmQty, setConfirmQty] = useState("");

  // Estado do estoque
  const [stock, setStock] = useState(DEFAULT_STOCK);

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockItem, setStockItem] = useState("soro");
  const [stockQty, setStockQty] = useState(0);
  const [stockExpiry, setStockExpiry] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const [itemConfig, setItemConfig] = useState({ open: false, itemId: null });
  const [itemConfigForm, setItemConfigForm] = useState({ displayName: "", unit: "", minStock: "", shelfLifeDays: "" });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

  useEffect(() => {
    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapPersistence() {
      try {
        const [initialStock, initialItemSettings, initialBatches, initialHistory] = await Promise.all([
          loadPersistedStock(),
          loadPersistedItemSettings(),
          loadPersistedItemBatches(),
          loadPersistedHistory(),
        ]);

        if (!cancelled) {
          setStock(initialStock);
          setHistory(initialHistory || []);
          setItemSettings({ ...DEFAULT_ITEM_SETTINGS_MAP, ...initialItemSettings });
          setItemBatches(initialBatches || {});
        }
      } catch (error) {
        console.warn("Não foi possível carregar dados persistidos", error);
      }
    }

    bootstrapPersistence();

    return () => {
      cancelled = true;
    };
  }, []);


  const toItemId = (value = "") => value.toLowerCase().replace(/\s+/g, "_");
  const getItemMeta = (id) => {
    const key = toItemId(id);
    return itemSettings[key] || DEFAULT_ITEM_SETTINGS_MAP[key] || { id: key, displayName: key.replace(/_/g, " ") };
  };
  const getItemDisplayName = (id) => getItemMeta(id).displayName || toItemId(id).replace(/_/g, " ");
  const getItemUnit = (id) => getItemMeta(id).unit || "un";
  const getItemMinStock = (id) => {
    const meta = getItemMeta(id);
    return typeof meta.minStock === "number" ? meta.minStock : 10;
  };
  const getItemShelfLife = (id) => {
    const meta = getItemMeta(id);
    return typeof meta.shelfLifeDays === "number" ? meta.shelfLifeDays : 0;
  };

  const getItemBatches = (id) => {
    const key = toItemId(id);
    const batches = itemBatches[key] || [];
    return [...batches].sort((a, b) => {
      const aTime = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
      const bTime = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
      if (aTime === bTime) {
        return new Date(a.addedAt || 0).getTime() - new Date(b.addedAt || 0).getTime();
      }
      return aTime - bTime;
    });
  };

  const getItemExpiryInfo = (id) => {
    const batches = getItemBatches(id).filter((batch) => (batch.remaining ?? batch.quantity ?? 0) > 0);
    if (!batches.length) return null;
    const totalRemaining = batches.reduce((sum, batch) => sum + (batch.remaining ?? batch.quantity ?? 0), 0);
    const nextWithDate = batches.find((batch) => batch.expiresAt);
    if (!nextWithDate) {
      return { batches, totalRemaining };
    }
    const expiryDate = new Date(nextWithDate.expiresAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / MS_PER_DAY);
    return { batches, totalRemaining, nextBatch: nextWithDate, expiryDate, diffDays };
  };

  function updateItemBatches(itemId, updater) {
    const key = toItemId(itemId);
    let snapshot = null;
    setItemBatches((prev) => {
      const current = prev[key] || [];
      const next = updater(current.map((batch) => ({ ...batch }))) || [];
      const nextMap = { ...prev };
      if (next.length) {
        nextMap[key] = next;
      } else {
        delete nextMap[key];
      }
      snapshot = { key, batches: next };
      return nextMap;
    });
    if (snapshot) {
      persistItemBatches(snapshot.key, snapshot.batches).catch((error) => {
        console.warn("Falha ao sincronizar lotes", error);
      });
    }
  }

  function appendItemBatch(itemId, quantity, expiresAt) {
    updateItemBatches(itemId, (current) => {
      const batch = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        quantity,
        remaining: quantity,
        addedAt: new Date().toISOString(),
        expiresAt: expiresAt || null,
      };
      const next = [...current, batch];
      return next.sort((a, b) => {
        const aTime = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
        const bTime = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
        if (aTime === bTime) {
          return new Date(a.addedAt || 0).getTime() - new Date(b.addedAt || 0).getTime();
        }
        return aTime - bTime;
      });
    });
  }

  function consumeItemBatches(itemId, quantity) {
    if (!quantity) return;
    updateItemBatches(itemId, (current) => {
      if (!current.length) return current;
      let remainingToConsume = quantity;
      const sorted = [...current].sort((a, b) => {
        const aTime = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
        const bTime = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
        if (aTime === bTime) {
          return new Date(a.addedAt || 0).getTime() - new Date(b.addedAt || 0).getTime();
        }
        return aTime - bTime;
      });
      const updated = [];
      for (const batch of sorted) {
        const available = batch.remaining ?? batch.quantity ?? 0;
        if (available <= 0) continue;
        if (remainingToConsume <= 0) {
          updated.push(batch);
          continue;
        }
        const consume = Math.min(available, remainingToConsume);
        const remaining = available - consume;
        remainingToConsume -= consume;
        if (remaining > 0) {
          updated.push({ ...batch, remaining });
        }
      }
      return updated;
    });
  }

  const getSuggestedExpiry = (id) => {
    const shelfLife = getItemShelfLife(id);
    if (!shelfLife) return "";
    const date = new Date();
    date.setDate(date.getDate() + shelfLife);
    return date.toISOString().slice(0, 10);
  };

  function openItemConfigModal(itemId) {
    const meta = getItemMeta(itemId);
    setItemConfig({ open: true, itemId });
    setItemConfigForm({
      displayName: meta.displayName || itemId.replace(/_/g, " "),
      unit: meta.unit || "un",
      minStock: String(meta.minStock ?? 0),
      shelfLifeDays: String(meta.shelfLifeDays ?? 0),
    });
  }

  function closeItemConfigModal() {
    setItemConfig({ open: false, itemId: null });
  }

  function handleItemConfigFieldChange(field, value) {
    setItemConfigForm((prev) => ({ ...prev, [field]: value }));
  }

  async function saveItemConfig() {
    if (!itemConfig.itemId) return;
    const normalized = {
      displayName: itemConfigForm.displayName.trim() || getItemDisplayName(itemConfig.itemId),
      unit: itemConfigForm.unit.trim() || "un",
      minStock: Math.max(0, parseInt(itemConfigForm.minStock, 10) || 0),
      shelfLifeDays: Math.max(0, parseInt(itemConfigForm.shelfLifeDays, 10) || 0),
    };

    const historySetting = await persistItemSetting(itemConfig.itemId, normalized);
    setItemSettings((prev) => ({ ...prev, [itemConfig.itemId]: historySetting }));
    setSnackbar({ open: true, message: `Configura��es atualizadas para ${getItemDisplayName(itemConfig.itemId)}`, type: "success" });
    closeItemConfigModal();
  }

  async function start() {
    try {
      await setupCamera();
      setLoadingText("Carregando modelo...");
      await loadModel();
      setLoadingText("Detecção ativa - Aponte a câmera para os objetos");
      loopRef.current = true;
      runLoop();
    } catch (err) {
      console.error(err);
      setLoadingText("Erro ao inicializar a câmera.");
    }
  }

  function stop() {
    loopRef.current = false;
    const stream = videoRef.current && videoRef.current.srcObject;
    if (stream) stream.getTracks().forEach((t) => t.stop());
  }

  async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    const video = videoRef.current;
    video.srcObject = stream;
    await video.play();
    const overlay = overlayRef.current;
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
    const cap = captureCanvasRef.current;
    cap.width = video.videoWidth;
    cap.height = video.videoHeight;
  }

  async function loadModel() {
    modelRef.current = await tmImage.load(
      TEACHABLE_MODEL_URL + "model.json",
      TEACHABLE_MODEL_URL + "metadata.json"
    );
  }

  async function runLoop() {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    const ctx = overlay.getContext("2d");

    async function frame() {
      if (!loopRef.current) return;
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      try {
        const preds = await modelRef.current.predict(video);
        const top = preds.reduce(
          (best, cur) => (cur.probability > (best.probability || 0) ? cur : best),
          {}
        );

        const label = top.className || "";
        const prob = top.probability || 0;

        if (label) {
          ctx.font = "bold 20px sans-serif";
          ctx.fillStyle = prob > TEACHABLE_PROB_THRESHOLD ? "#4caf50" : "#ff9800";
          ctx.fillText(`${label} ${(prob * 100).toFixed(1)}%`, 20, 40);
          
          // Adicionar borda de detecção
          ctx.strokeStyle = prob > TEACHABLE_PROB_THRESHOLD ? "#4caf50" : "#ff9800";
          ctx.lineWidth = 3;
          ctx.strokeRect(10, 10, overlay.width - 20, overlay.height - 20);
        }

        if (
          prob > TEACHABLE_PROB_THRESHOLD &&
          TARGET_LABELS.includes(label.toLowerCase()) &&
          !modalOpen
        ) {
          const snapshot = takeSnapshot();
          setPending({ label, score: prob, image: snapshot });
          setConfirmQty(""); // resetar campo de quantidade quando abrir
          setModalOpen(true);
        }
      } catch (e) {
        console.error(e);
      }

      setTimeout(() => {
        if (loopRef.current) requestAnimationFrame(frame);
      }, 500);
    }
    frame();
  }

  function takeSnapshot() {
    const video = videoRef.current;
    const cap = captureCanvasRef.current;
    const ctx = cap.getContext("2d");
    ctx.drawImage(video, 0, 0, cap.width, cap.height);
    return cap.toDataURL("image/png");
  }

  function confirmPending() {
    if (!pending) return;
    const itemId = toItemId(pending.label);

    let qty = parseInt(confirmQty, 10);
    if (isNaN(qty) || qty <= 0) qty = 1;

    const currentQty = stock[itemId] ?? 0;
    const displayName = getItemDisplayName(itemId);
    const unit = getItemUnit(itemId);

    if (currentQty && currentQty >= qty) {
      const updatedStock = { ...stock, [itemId]: currentQty - qty };
      setStock(updatedStock);
      persistStock(updatedStock);
      consumeItemBatches(itemId, qty);

      const detectionRecord = {
        id: `hist-${Date.now()}`,
        type: "detector",
        direction: "out",
        label: pending.label,
        itemId,
        score: pending.score,
        image: pending.image,
        ts: new Date().toISOString(),
        quantity: qty,
        unit,
      };

      setHistory((prev) => [detectionRecord, ...prev]);
      persistHistory(detectionRecord);
      persistDetection(detectionRecord).catch((error) => {
        console.warn("Falha ao registrar deteccao na API", error);
      });

      setSnackbar({ open: true, message: `? Baixa de ${qty} ${unit} registrada no estoque de ${displayName}`, type: "success" });
      setConfirmQty("");
    } else if (currentQty > 0 && currentQty < qty) {
      setSnackbar({ open: true, message: `? Quantidade solicitada (${qty}) maior que o estoque disponivel (${currentQty} ${unit}).`, type: "error" });
    } else {
      setSnackbar({ open: true, message: `? Sem estoque disponivel de ${displayName}`, type: "error" });
    }

    setPending(null);
    setModalOpen(false);
  }

  function cancelPending() {
    setPending(null);
    setModalOpen(false);
    setConfirmQty("");
  }

  function clearHistoryRecords() {
    setHistory([]);
    purgeDetections();
    purgeHistory();
    setSnackbar({ open: true, message: "Historico limpo", type: "info" });
  }

  function addStock() {
    const qty = parseInt(stockQty, 10);
    if (!qty || qty <= 0) return;
    const itemId = stockItem;
    const updatedStock = { ...stock, [itemId]: (stock[itemId] || 0) + qty };
    setStock(updatedStock);
    persistStock(updatedStock);

    const expiryInput = (stockExpiry || "").trim();
    let expiresAt = null;
    if (expiryInput) {
      const parsed = new Date(expiryInput);
      if (!Number.isNaN(parsed.getTime())) {
        expiresAt = parsed.toISOString();
      }
    } else {
      const suggested = getSuggestedExpiry(itemId);
      if (suggested) {
        const parsedSuggested = new Date(suggested);
        if (!Number.isNaN(parsedSuggested.getTime())) {
          expiresAt = parsedSuggested.toISOString();
        }
      }
    }

    appendItemBatch(itemId, qty, expiresAt);

    const historyRecord = {
      id: `hist-${Date.now()}`,
      type: "manual-in",
      direction: "in",
      itemId,
      label: getItemDisplayName(itemId),
      quantity: qty,
      unit: getItemUnit(itemId),
      expiresAt,
      ts: new Date().toISOString(),
    };
    setHistory((prev) => [historyRecord, ...prev]);
    persistHistory(historyRecord);

    const displayName = getItemDisplayName(itemId);
    const unit = getItemUnit(itemId);
    const expirySuffix = expiresAt ? ` com validade ate ${formatDate(expiresAt)}` : "";
    setSnackbar({ open: true, message: `?? Adicionado ${qty} ${unit} ao estoque de ${displayName}${expirySuffix}`, type: "success" });
    setStockQty(0);
    setStockExpiry(getSuggestedExpiry(itemId));
    setStockModalOpen(false);
  }

  const handleAddStockClick = (item) => {
    setStockItem(item);
    setStockQty(10); // Valor padrao
    setStockExpiry(getSuggestedExpiry(item));
    setStockModalOpen(true);
  };

  // Calcular estatisticas do estoque
  const lowStockItems = Object.entries(stock).filter(([id, qty]) => qty > 0 && qty <= getItemMinStock(id));
  const outOfStockItems = Object.entries(stock).filter(([, qty]) => qty === 0);
  const expiryEntries = Object.keys(stock)
    .map((id) => ({ id, info: getItemExpiryInfo(id) }))
    .filter((entry) => entry.info && entry.info.nextBatch?.expiresAt);
  const expiredItems = expiryEntries.filter((entry) => typeof entry.info.diffDays === "number" && entry.info.diffDays < 0);
  const expiringSoonItems = expiryEntries.filter((entry) => typeof entry.info.diffDays === "number" && entry.info.diffDays >= 0 && entry.info.diffDays <= EXPIRY_WARNING_DAYS);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={2}
        sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          mb: 4,
          width:'98vw'
        }}
      >
        <Toolbar>
          <CameraAltIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Sistema de Controle Hospitalar
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <Button 
              color="inherit" 
              startIcon={<InventoryIcon />}
              onClick={() => setActiveTab(1)}
              sx={{ 
                borderRadius: 2,
                px: 3,
                "&:hover": { backgroundColor: alpha("#fff", 0.1) }
              }}
            >
              Estoque
            </Button>
            <Button 
              color="inherit" 
              startIcon={<AnalyticsIcon />}
              onClick={() => setActiveTab(2)}
              sx={{ 
                borderRadius: 2,
                px: 3,
                "&:hover": { backgroundColor: alpha("#fff", 0.1) }
              }}
            >
              Dashboard
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mb: 8 }}>
        {/* Indicadores de status */}
        <Grid container spacing={3} sx={{ mb: 4, display:'flex',
              alignItems:'center',
              justifyContent:'center',
              width:'100%',}}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={2}
              sx={{ 
                p: 3, 
                textAlign: "center",
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                
              }}
            >
              <Typography variant="h4" color="primary" fontWeight="bold">
                {Object.values(stock).reduce((a, b) => a + b, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total em Estoque
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3} >
            <Paper 
              elevation={2}
              sx={{ 
                p: 3, 
                textAlign: "center",
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
              }}
            >
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {lowStockItems.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Itens com Baixo Estoque
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={2}
              sx={{ 
                p: 3, 
                textAlign: "center",
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
              }}
            >
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {outOfStockItems.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Itens Esgotados
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={2}
              sx={{ 
                p: 3, 
                textAlign: "center",
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
              }}
            >
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {history.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Movimentacoes Registradas
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Abas principais */}
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
              "& .MuiTab-root": { fontWeight: 600, py: 2 },
             
            }}
          >
            <Tab icon={<CameraAltIcon />} label="Detecção em Tempo Real" />
            <Tab icon={<InventoryIcon />} label="Gestão de Estoque" />
            <Tab icon={<AnalyticsIcon />} label="Dashboard Analítico" />
          </Tabs>

          <Divider />

          {/* Tab 1: Detecção em Tempo Real */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={4}>
              <Grid item xs={12} lg={8}>
                <Card elevation={3} sx={{ borderRadius: 3, overflow: "hidden", width: "100%"  }}>
                  <CardContent sx={{ p: 0, position: "relative" }}>
                    <Box sx={{ position: "relative" }}>
                      <video 
                        ref={videoRef} 
                        style={{ 
                          width: "100%", 
                          height: "400px",
                          objectFit: "cover",
                          display: "block"
                        }} 
                        playsInline 
                        muted 
                      />
                      <canvas 
                        ref={overlayRef} 
                        style={{ 
                          position: "absolute", 
                          top: 0, 
                          left: 0, 
                          width: "100%", 
                          height: "100%",
                          pointerEvents: "none",
                        }} 
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: 16,
                          left: 16,
                          bgcolor: alpha("#000", 0.7),
                          color: "white",
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          backdropFilter: "blur(10px)"
                        }}
                      >
                        <Typography variant="body2">
                          {loadingText}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Card elevation={3} sx={{ borderRadius: 3, height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <HistoryIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        Histórico de Detecções
                      </Typography>
                    </Box>
                    
                    {history.length === 0 ? (

                      <Box sx={{ textAlign: "center", py: 4 }}>

                        <CameraAltIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />

                        <Typography variant="body2" color="text.secondary">

                          Nenhuma movimentacao registrada ainda.

                        </Typography>

                        <Typography variant="caption" color="text.secondary">

                          Registre movimentos via camera ou ajuste manual.

                        </Typography>

                      </Box>

                    ) : (

                      <List sx={{ maxHeight: 320, overflow: "auto" }}>

                        {history.map((entry, index) => {

                          const itemId = entry.itemId ? toItemId(entry.itemId) : toItemId(entry.label || "");

                          const displayName = getItemDisplayName(itemId);

                          const unit = getItemUnit(itemId);

                          const isDetection = entry.type === "detector";

                          const direction = entry.direction || (isDetection ? "out" : "in");

                          const directionLabel = direction === "out" ? "Saida" : "Entrada";

                          const quantity = entry.quantity ?? 0;

                          const expiryLabel = entry.expiresAt ? `Validade ${formatDate(entry.expiresAt)}` : null;

                          return (

                            <ListItem key={index} divider>

                              <ListItemAvatar>

                                {entry.image ? (

                                  <Avatar

                                    variant="rounded"

                                    src={entry.image}

                                    alt={displayName}

                                    sx={{ width: 60, height: 45 }}

                                  />

                                ) : (

                                  <Avatar

                                    variant="rounded"

                                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main" }}

                                  >

                                    {displayName.charAt(0).toUpperCase()}

                                  </Avatar>

                                )}

                              </ListItemAvatar>

                              <ListItemText

                                primary={

                                  <Stack direction="row" spacing={1} alignItems="center">

                                    <Typography fontWeight="600" textTransform="capitalize">

                                      {displayName}

                                    </Typography>

                                    <Chip

                                      label={directionLabel}

                                      size="small"

                                      color={direction === "out" ? "error" : "success"}

                                    />

                                    <Chip

                                      label={isDetection ? "Deteccao" : "Manual"}

                                      size="small"

                                      variant="outlined"

                                      color={isDetection ? "primary" : "default"}

                                    />

                                  </Stack>

                                }

                                secondary={

                                  <Box>

                                    <Typography variant="body2" color="text.secondary">

                                      {new Date(entry.ts).toLocaleString()}

                                    </Typography>

                                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} alignItems="center">

                                      <Chip

                                        label={`${direction === "out" ? "-" : "+"}${quantity} ${unit}`}

                                        size="small"

                                        color="default"

                                        variant="outlined"

                                      />

                                      {isDetection && entry.score !== undefined && (

                                        <Chip

                                          label={`${(entry.score * 100).toFixed(1)}%`}

                                          size="small"

                                          color="primary"

                                          variant="outlined"

                                        />

                                      )}

                                      {expiryLabel && (

                                        <Chip

                                          label={expiryLabel}

                                          size="small"

                                          color="info"

                                          variant="outlined"

                                        />

                                      )}

                                    </Stack>

                                  </Box>

                                }

                              />

                            </ListItem>

                          );

                        })}

                      </List>

                    )}

                    <Stack direction="row" spacing={2} mt={3}>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        startIcon={<DeleteIcon />} 
                        onClick={clearHistoryRecords}
                        fullWidth
                      >
                        Limpar Histórico
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveAltIcon />}
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "history.json";
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        fullWidth
                      >
                        Exportar
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 2: Gestão de Estoque */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                  Gestão de Estoque
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setStockModalOpen(true)}
                  sx={{ borderRadius: 2 }}
                >
                  Adicionar Estoque
                </Button>
              </Box>

              {/* Alertas de estoque */}
              {(lowStockItems.length > 0 || outOfStockItems.length > 0 || expiringSoonItems.length > 0 || expiredItems.length > 0) && (
                <Box sx={{ mb: 3 }}>
                  {outOfStockItems.length > 0 && (
                    <Alert severity="error" sx={{ mb: 1, borderRadius: 2 }}>
                      <strong>{outOfStockItems.length} item(s) esgotado(s):</strong> {outOfStockItems.map(([name]) => getItemDisplayName(name)).join(", ")}
                    </Alert>
                  )}
                  {expiredItems.length > 0 && (
                    <Alert severity="error" sx={{ mb: 1, borderRadius: 2 }}>
                      <strong>{expiredItems.length} item(s) vencido(s):</strong> {expiredItems.map(({ id, info }) => `${getItemDisplayName(id)} (${describeExpiry(info)})`).join(", ")}
                    </Alert>
                  )}
                  {expiringSoonItems.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 1, borderRadius: 2 }}>
                      <strong>{expiringSoonItems.length} item(s) prestes a vencer:</strong> {expiringSoonItems.map(({ id, info }) => `${getItemDisplayName(id)} (${describeExpiry(info)})`).join(", ")}
                    </Alert>
                  )}
                  {lowStockItems.length > 0 && (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      <strong>{lowStockItems.length} item(s) com estoque baixo:</strong> {lowStockItems.map(([name]) => getItemDisplayName(name)).join(", ")}
                    </Alert>
                  )}
                </Box>
              )}

              {/* Grid de estoque */}
              <Grid container spacing={2}>
                {Object.entries(stock).map(([itemName, quantity]) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={itemName}>
                    <StockCard 
                      itemName={itemName} 
                      quantity={quantity} 
                      metadata={getItemMeta(itemName)}
                      expiryInfo={getItemExpiryInfo(itemName)}
                      onAddStock={handleAddStockClick}
                      onConfigure={openItemConfigModal}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </TabPanel>

          {/* Tab 3: Dashboard Analítico */}
          <TabPanel value={activeTab} index={2}>
            <Dashboard />
          </TabPanel>
        </Paper>
      </Container>

      {/* Canvas escondido */}
      <canvas ref={captureCanvasRef} style={{ display: "none" }} />

      {/* Modal de confirmação */}
      <Dialog 
        open={modalOpen} 
        onClose={cancelPending} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          bgcolor: "primary.main", 
          color: "white",
          fontWeight: 600 
        }}>
          <CheckCircleIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Objeto Detectado
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {pending && (
            <>
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Chip 
                  label={`${(pending.score * 100).toFixed(1)}% de confiança`} 
                  color="primary" 
                  sx={{ mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  Confirmar detecção de <strong style={{ textTransform: "capitalize" }}>{pending.label}</strong>?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Esta ação registrará uma baixa no estoque automaticamente.
                </Typography>
                {/* NOVO: campo para quantidade opcional */}
                <TextField
                  label="Quantidade (opcional)"
                  type="number"
                  value={confirmQty}
                  onChange={(e) => setConfirmQty(e.target.value)}
                  fullWidth
                  inputProps={{ min: 1 }}
                  helperText="Se deixar em branco, será descontado 1 unidade."
                  sx={{ mt: 1 }}
                />
              </Box>
              <img 
                src={pending.image} 
                alt="snapshot" 
                style={{ 
                  width: "100%", 
                  borderRadius: 12, 
                  border: `2px solid ${theme.palette.primary.main}` 
                }} 
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={cancelPending} 
            variant="outlined" 
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmPending} 
            variant="contained" 
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            Confirmar Baixa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de estoque */}
      <Dialog 
        open={stockModalOpen} 
        onClose={() => setStockModalOpen(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          <AddIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Adicionar ao Estoque
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            select
            label="Item"
            value={stockItem}
            onChange={(e) => {
              const value = e.target.value;
              setStockItem(value);
              setStockExpiry(getSuggestedExpiry(value));
            }}
            fullWidth
            margin="normal"
            variant="outlined"
          >
            {Object.keys(stock).map((item) => (
              <MenuItem key={item} value={item}>
                <Box sx={{ textTransform: "capitalize" }}>{getItemDisplayName(item)}</Box>
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Quantidade"
            type="number"
            value={stockQty}
            onChange={(e) => setStockQty(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            InputProps={{ inputProps: { min: 1 } }}
          />
          <TextField
            label="Validade (opcional)"
            type="date"
            value={stockExpiry}
            onChange={(e) => setStockExpiry(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            helperText={getSuggestedExpiry(stockItem) ? `Sugestao: ${getSuggestedExpiry(stockItem)}` : "Deixe em branco se nao houver controle"}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            Estoque atual: <strong>{stock[stockItem] || 0} {getItemUnit(stockItem)}</strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setStockModalOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={addStock} 
            variant="contained" 
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de configura��o de item */}
      <Dialog
        open={itemConfig.open}
        onClose={closeItemConfigModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          <SettingsIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Configurar Item
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            ID: <strong>{itemConfig.itemId || ""}</strong>
          </Typography>
          <TextField
            label="Nome de exibicao"
            value={itemConfigForm.displayName}
            onChange={(e) => handleItemConfigFieldChange("displayName", e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Unidade"
            value={itemConfigForm.unit}
            onChange={(e) => handleItemConfigFieldChange("unit", e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Estoque minimo"
            type="number"
            value={itemConfigForm.minStock}
            onChange={(e) => handleItemConfigFieldChange("minStock", e.target.value)}
            fullWidth
            margin="normal"
            InputProps={{ inputProps: { min: 0 } }}
          />
          <TextField
            label="Validade (dias)"
            type="number"
            value={itemConfigForm.shelfLifeDays}
            onChange={(e) => handleItemConfigFieldChange("shelfLifeDays", e.target.value)}
            fullWidth
            margin="normal"
            InputProps={{ inputProps: { min: 0 } }}
            helperText="Use 0 para itens sem controle de validade."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeItemConfigModal} sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button onClick={saveItemConfig} variant="contained" color="primary" sx={{ borderRadius: 2 }}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert 
          severity={snackbar.type} 
          sx={{ 
            borderRadius: 2,
            fontWeight: 500
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Botão flutuante para voltar ao topo */}
      <Fab
        color="primary"
        aria-label="voltar ao topo"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
        }}
      >
        <AddIcon sx={{ transform: "rotate(45deg)" }} />
      </Fab>
    </ThemeProvider>
=======
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppStateProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppShell />
        </ThemeProvider>
      </AppStateProvider>
    </HashRouter>
>>>>>>> Stashed changes
  );
}
