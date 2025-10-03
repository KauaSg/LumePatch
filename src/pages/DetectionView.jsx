import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as tmImage from "@teachablemachine/image";
import {
  Box,
  Typography,
  Stack,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Slider,
  Divider,
  CircularProgress,
  Button,
  Switch,
  FormControlLabel,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CameraOverlay from "../components/CameraOverlay";
import DetectionChip from "../components/DetectionChip";
import CorrectionPopover from "../components/CorrectionPopover";
import NewBatchModal from "../components/NewBatchModal";
import ExpiryFilterChips from "../components/ExpiryFilterChips";
import { useAppState, useAppDispatch, APP_ACTIONS } from "../state/AppStateContext";
import { useInventoryActions } from "../state/useInventoryActions";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { formatDate, diffInDays } from "../utils/date";
import { filterItemsByExpiry } from "../utils/analytics";
import { resolveItemId } from "../utils/detection";

const MODEL_URL = `${import.meta.env.BASE_URL}teachable/`;
const DETECTION_COOLDOWN_MS = 600;
const AUTO_COOLDOWN_MS = 2500;

const DEMO_SEQUENCE = [
  { label: "mascara", confidence: 0.92 },
  { label: "soro", confidence: 0.88 },
  { label: "seringa", confidence: 0.86 },
  { label: "luvas", confidence: 0.9 },
  { label: "alcool", confidence: 0.84 },
  { label: "mascara", confidence: 0.67 },
  { label: "soro", confidence: 0.74 },
  { label: "ataduras", confidence: 0.81 },
];

function sumBatchesQty(batches = []) {
  return batches.reduce((total, batch) => total + (batch.qty || 0), 0);
}

export default function DetectionView() {
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const modelRef = useRef(null);
  const loopRef = useRef(false);
  const animationRef = useRef(null);
  const cooldownRef = useRef(0);
  const simulationTimeoutRef = useRef(null);
  const simulationIndexRef = useRef(0);

  const correctionButtonRef = useRef(null);

  const [loadingMessage, setLoadingMessage] = useState("Inicializando câmera...");
  const [snackbar, setSnackbar] = useState(null);
  const [correctionAnchor, setCorrectionAnchor] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [overlayPrediction, setOverlayPrediction] = useState({ label: "", confidence: 0 });
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchModalItem, setBatchModalItem] = useState(null);

  const state = useAppState();
  const dispatch = useAppDispatch();
  const actions = useInventoryActions();
  const { items, itemBatches, detectionPending, detectionMode, itemMap, filters, ui, loading } = state;

  const itemMapRef = useRef(itemMap);
  const actionsRef = useRef(actions);
  const detectionPendingRef = useRef(detectionPending);
  const uiRef = useRef(ui);

  useEffect(() => {
    itemMapRef.current = itemMap;
  }, [itemMap]);

  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  useEffect(() => {
    detectionPendingRef.current = detectionPending;
  }, [detectionPending]);

  useEffect(() => {
    uiRef.current = ui;
  }, [ui]);

  const itemsWithStock = useMemo(() => {
    return (items || []).map((item) => {
      const batches = itemBatches[item.id] || [];
      const nextBatch = batches
        .slice()
        .sort((a, b) => {
          if (!a.expiry && !b.expiry) return a.createdAt - b.createdAt;
          if (!a.expiry) return 1;
          if (!b.expiry) return -1;
          return new Date(a.expiry).getTime() - new Date(b.expiry).getTime();
        })[0];
      return {
        item,
        batches,
        stock: sumBatchesQty(batches),
        nextBatch,
      };
    });
  }, [items, itemBatches]);

  const filteredItemIds = useMemo(() => {
    const filtered = filterItemsByExpiry(items, itemBatches, filters.expiry);
    return new Set(filtered.map((entry) => entry.id));
  }, [items, itemBatches, filters.expiry]);

  const itemsToDisplay = useMemo(
    () => itemsWithStock.filter((entry) => filteredItemIds.has(entry.item.id)),
    [itemsWithStock, filteredItemIds]
  );

  const takeSnapshot = useCallback(() => {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (!video || !canvas) return null;
    const { videoWidth, videoHeight } = video;
    if (!videoWidth || !videoHeight) return null;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    return canvas.toDataURL("image/png");
  }, []);

  const openBatchModal = useCallback((itemId) => {
    const currentItem = itemMapRef.current?.[itemId];
    if (!currentItem) return;
    setBatchModalItem(currentItem);
    setBatchModalOpen(true);
  }, []);

  const detectionFrame = useCallback(async () => {
    if (!loopRef.current) return;
    if (uiRef.current?.demoMode) return;
    const now = Date.now();
    if (now < cooldownRef.current) {
      animationRef.current = requestAnimationFrame(detectionFrame);
      return;
    }

    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video || !overlay || !modelRef.current) {
      animationRef.current = requestAnimationFrame(detectionFrame);
      return;
    }

    const actions = actionsRef.current;
    const detectionPending = detectionPendingRef.current;
    if (!actions) {
      animationRef.current = requestAnimationFrame(detectionFrame);
      return;
    }

    try {
      const predictions = await modelRef.current.predict(video);
      const sorted = predictions
        .slice()
        .sort((a, b) => (b.probability || 0) - (a.probability || 0));
      const top = sorted[0];

      if (top) {
        setOverlayPrediction({ label: top.className, confidence: top.probability });
        cooldownRef.current = Date.now() + DETECTION_COOLDOWN_MS;

        if (!detectionPending?.requiresConfirmation) {
          const result = await actions.handleDetection({
            label: top.className,
            confidence: top.probability,
            imageBase64: takeSnapshot(),
            topPredictions: sorted.slice(0, 5).map((pred) => ({
              label: pred.className,
              confidence: pred.probability,
            })),
          });

          if (result?.toast) {
            setSnackbar({ open: true, severity: result.toast.severity, message: result.toast.message });
          }

          if (result?.status === "auto-committed") {
            cooldownRef.current = Date.now() + AUTO_COOLDOWN_MS;
          } else if (result?.status === "needs-confirmation" || result?.status === "below-threshold") {
            setPopoverOpen(true);
            if (correctionButtonRef.current) {
              setCorrectionAnchor(correctionButtonRef.current);
            }
          } else if (result?.status === "mode-in" && result?.pending?.suggestedItemId) {
            openBatchModal(result.pending.suggestedItemId);
          }
        }
      }
    } catch (error) {
      console.error("Falha ao processar detecção", error);
    }

    animationRef.current = requestAnimationFrame(detectionFrame);
  }, [openBatchModal, takeSnapshot]);
  const stopLoop = useCallback(() => {
    loopRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const startLoop = useCallback(() => {
    loopRef.current = true;
    animationRef.current = requestAnimationFrame(detectionFrame);
  }, [detectionFrame]);

  useEffect(() => {
    let active = true;

    async function init() {
      if (ui.demoMode) {
        setLoadingMessage(null);
        return;
      }
      try {
        setLoadingMessage("Inicializando câmera...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (playError) {
            if (playError.name !== "AbortError") {
              throw playError;
            }
          }
        }
        setLoadingMessage("Carregando modelo...");
        modelRef.current = await tmImage.load(`${MODEL_URL}model.json`, `${MODEL_URL}metadata.json`);
        if (!active) return;
        setLoadingMessage(null);
        startLoop();
      } catch (error) {
        if (error?.name === "AbortError") {
          console.info("Inicialização da câmera interrompida (AbortError)", error);
        } else {
          console.warn("Erro ao inicializar a câmera ou modelo", error);
          setLoadingMessage("Erro ao inicializar a câmera ou modelo.");
        }
      }
    }

    init();

    return () => {
      active = false;
      stopLoop();
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startLoop, stopLoop, ui.demoMode]);

  useEffect(() => {
    if (detectionPending?.requiresConfirmation && detectionMode === "out") {
      setPopoverOpen(true);
      if (correctionButtonRef.current) {
        setCorrectionAnchor(correctionButtonRef.current);
      }
    }
    if (detectionPending?.requiresConfirmation && detectionMode === "in" && detectionPending.suggestedItemId) {
      openBatchModal(detectionPending.suggestedItemId);
    }
  }, [detectionPending?.requiresConfirmation, detectionPending?.suggestedItemId, detectionMode, openBatchModal]);

  useEffect(() => {
    if (!ui.demoMode) {
      simulationIndexRef.current = 0;
      if (simulationTimeoutRef.current) {
        clearTimeout(simulationTimeoutRef.current);
        simulationTimeoutRef.current = null;
      }
      return;
    }

    if (loading) return;

    simulationIndexRef.current = 0;
    let cancelled = false;

    const runNext = async () => {
      if (cancelled || !ui.demoMode) return;
      const step = DEMO_SEQUENCE[simulationIndexRef.current];
      if (!step) {
        simulationTimeoutRef.current = window.setTimeout(() => {
          dispatch({ type: APP_ACTIONS.SET_UI, payload: { ...ui, demoMode: false } });
        }, 800);
        return;
      }

      setOverlayPrediction({ label: step.label, confidence: step.confidence });

      await actions.handleDetection({
        label: step.label,
        confidence: step.confidence,
        imageBase64: null,
        topPredictions: [{ label: step.label, confidence: step.confidence }],
      });

      simulationIndexRef.current += 1;
      if (simulationIndexRef.current >= DEMO_SEQUENCE.length) {
        simulationTimeoutRef.current = window.setTimeout(() => {
          dispatch({ type: APP_ACTIONS.SET_UI, payload: { ...ui, demoMode: false } });
        }, 800);
        return;
      }

      simulationTimeoutRef.current = window.setTimeout(runNext, 1600);
    };

    simulationTimeoutRef.current = window.setTimeout(runNext, 800);

    return () => {
      cancelled = true;
      if (simulationTimeoutRef.current) {
        clearTimeout(simulationTimeoutRef.current);
        simulationTimeoutRef.current = null;
      }
    };
  }, [ui.demoMode, dispatch, ui, actions, loading]);

  const overlayItemId = useMemo(() => resolveItemId(overlayPrediction.label), [overlayPrediction.label]);
  const focusedItemId = detectionPending?.suggestedItemId || overlayItemId;

  useKeyboardShortcuts({
    c: () => {
      if (correctionButtonRef.current) {
        setCorrectionAnchor(correctionButtonRef.current);
        setPopoverOpen(true);
      }
    },
    '+': () => {
      if (focusedItemId) openBatchModal(focusedItemId);
    },
    '-': async () => {
      if (!focusedItemId) return;
      const result = await actions.consumeManualOut({
        itemId: focusedItemId,
        qty: 1,
        source: "ui",
        type: "manual",
        label: overlayPrediction.label,
      });
      if (result?.success) {
        const days = diffInDays(Date.now(), result.batchBefore?.expiry);
        setSnackbar({
          open: true,
          severity: "success",
          message:
            days !== null
              ? `Consumido via FEFO — vence em ${Math.max(0, days)} dias.`
              : "Saída manual registrada.",
        });
      } else {
        setSnackbar({ open: true, severity: "error", message: "Sem lotes disponíveis para baixa." });
      }
    },
  });

  const handleModeChange = (_event, nextMode) => {
    if (!nextMode) return;
    actions.setDetectionMode(nextMode);
  };

  const handleThresholdChange = (itemId) => async (_event, value) => {
    await actions.updateItemThreshold(itemId, value);
  };

  const handleDemoToggle = (event) => {
    dispatch({ type: APP_ACTIONS.SET_UI, payload: { ...ui, demoMode: event.target.checked } });
  };

  const handleCorrectionConfirm = async (item) => {
    setPopoverOpen(false);
    if (!item) return;
    const result = await actions.applyCorrection({
      pending: detectionPending,
      newItemId: item.id,
      newLabel: item.name,
    });
    if (result.success) {
      setSnackbar({ open: true, severity: "success", message: `Correção aplicada — atualizado para ${item.name}.` });
    } else {
      setSnackbar({ open: true, severity: "error", message: "Falha ao aplicar correção." });
    }
  };

  const handleConfirmPending = async (item) => {
    setPopoverOpen(false);
    if (!item) return;
    const result = await actions.confirmDetection({
      pending: detectionPending,
      itemId: item.id,
      metadata: { source: "ui", type: "manual" },
    });
    if (result.success) {
      const nextBatch = itemBatches[item.id]?.[0];
      const days = diffInDays(Date.now(), nextBatch?.expiry);
      setSnackbar({
        open: true,
        severity: "success",
        message:
          days !== null
            ? `Consumido via FEFO — vence em ${Math.max(0, days)} dias.`
            : "Saída registrada.",
      });
    } else {
      setSnackbar({ open: true, severity: "error", message: "Não foi possível registrar este lote." });
    }
  };

  const handleBatchSave = async ({ qty, expiry, code }) => {
    if (!batchModalItem) return;
    const result = await actions.registerBatchEntry({
      itemId: batchModalItem.id,
      qty,
      expiry,
      code,
      type: "manual",
      source: "ui",
    });
    if (result.success) {
      setSnackbar({ open: true, severity: "success", message: "Entrada registrada." });
    } else {
      setSnackbar({ open: true, severity: "error", message: "Falha ao registrar o lote." });
    }
    setBatchModalOpen(false);
    setBatchModalItem(null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={700}>
            Monitoramento por câmera
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Atalhos: +, −, c, e
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <ToggleButtonGroup
            value={detectionMode}
            exclusive
            size="small"
            color="primary"
            onChange={handleModeChange}
          >
            <ToggleButton value="out">Saída</ToggleButton>
            <ToggleButton value="in">Entrada</ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Reproduz uma sequência de detecções para demonstração.">
            <FormControlLabel
              control={<Switch checked={ui.demoMode} onChange={handleDemoToggle} color="success" />}
              label="Ativar modo simulado (demo)"
            />
          </Tooltip>
        </Stack>
      </Stack>

      <ExpiryFilterChips />

      <Paper className="camera-panel" sx={{ p: 0, position: "relative", borderRadius: 3, overflow: "hidden" }}>
        <Box className="camera-panel__viewport">
          <video
            ref={videoRef}
            className="camera-panel__stream"
            autoPlay
            muted
            playsInline
            style={{ display: loadingMessage ? "none" : "block" }}
          />
        </Box>
        <canvas ref={overlayRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        <canvas ref={captureCanvasRef} style={{ display: "none" }} />
        <CameraOverlay
          label={overlayPrediction.label}
          confidence={overlayPrediction.confidence}
          onCorrect={() => {
            if (correctionButtonRef.current) {
              setCorrectionAnchor(correctionButtonRef.current);
            }
            setPopoverOpen(true);
          }}
        />
        {loadingMessage && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: "common.white",
              gap: 2,
            }}
          >
            <CircularProgress color="inherit" />
            <Typography>{loadingMessage}</Typography>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            Última detecção
          </Typography>
          <Tooltip title="Confiança mínima p/ auto-registro">
            <IconButton size="small">
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        <Box sx={{ mt: 2 }}>
          <DetectionChip
            ref={correctionButtonRef}
            label={detectionPending?.label || overlayPrediction.label}
            confidencePercent={detectionPending?.confidencePercent ?? Math.round((overlayPrediction.confidence || 0) * 100)}
            onCorrect={(event) => {
              setCorrectionAnchor(event.currentTarget);
              setPopoverOpen(true);
            }}
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          Itens monitorados
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={2}>
          {itemsToDisplay.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Nenhum item corresponde ao filtro de validade selecionado.
            </Typography>
          )}
          {itemsToDisplay.map(({ item, stock, nextBatch }) => (
            <Box
              key={item.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 200px",
                gap: 2,
                alignItems: "center",
              }}
            >
              <Box>
                <Typography fontWeight={600}>{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Estoque: {stock} {item.unit}
                </Typography>
                {nextBatch && (
                  <Typography variant="caption" color="text.secondary">
                    Próximo lote vence em {formatDate(nextBatch.expiry)}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Confiança mínima p/ auto-registro
                </Typography>
                <Slider
                  value={item.minConfidence ?? 0.7}
                  step={0.05}
                  min={0.3}
                  max={1}
                  marks={[0.5, 0.7, 0.9].map((value) => ({ value, label: `${Math.round(value * 100)}%` }))}
                  onChangeCommitted={handleThresholdChange(item.id)}
                />
              </Box>
            </Box>
          ))}
        </Stack>
      </Paper>

      <CorrectionPopover
        anchorEl={correctionAnchor}
        open={popoverOpen && detectionMode === "out"}
        onClose={() => setPopoverOpen(false)}
        onConfirm={(item) => {
          if (detectionPending?.autoCommitted) {
            handleCorrectionConfirm(item);
          } else {
            handleConfirmPending(item);
          }
        }}
        items={itemsWithStock.map(({ item }) => item)}
        initialItemId={detectionPending?.suggestedItemId}
      />

      <NewBatchModal
        open={batchModalOpen}
        item={batchModalItem}
        existingBatches={batchModalItem ? itemBatches[batchModalItem.id] : []}
        onClose={() => {
          setBatchModalOpen(false);
          setBatchModalItem(null);
        }}
        onSave={handleBatchSave}
      />

      <Snackbar
        open={snackbar?.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar?.severity ?? "info"}>{snackbar?.message}</Alert>
      </Snackbar>
    </Box>
  );
}






