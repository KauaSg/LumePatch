import { useCallback } from "react";
import { useAppDispatch, useAppState, APP_ACTIONS } from "./AppStateContext";
import { resolveItemId, confidenceToPercent } from "../utils/detection";
import { pickFefoBatch, sortBatchesByExpiry } from "../utils/fefo";
import { diffInDays } from "../utils/date";
import { generateId, timestamp } from "../utils/ids";
import {
  appendHistory,
  updateHistoryRecord,
  saveItemBatches,
  saveItem,
  appendRetrainQueue,
} from "../services/persistence";

const DEFAULT_QTY = 1;

function ensureArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function updateBatchQty(batch, delta) {
  return { ...batch, qty: Math.max(0, (batch.qty || 0) + delta) };
}

function upsertBatchByCode(batches, code, updates) {
  const index = batches.findIndex((batch) => batch.code === code);
  if (index >= 0) {
    const next = [...batches];
    next[index] = { ...next[index], ...updates };
    return next;
  }
  return [...batches, updates];
}

export function useInventoryActions() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const setDetectionMode = useCallback(
    (mode) => {
      dispatch({ type: APP_ACTIONS.SET_DETECTION_MODE, payload: mode });
    },
    [dispatch]
  );

  const updateItemThreshold = useCallback(
    async (itemId, minConfidence) => {
      const current = state.itemMap[itemId];
      if (!current) return null;
      const next = { ...current, minConfidence };
      await saveItem(next);
      dispatch({ type: APP_ACTIONS.UPSERT_ITEM, payload: next });
      return next;
    },
    [dispatch, state.itemMap]
  );

  const applyBatchesSnapshot = useCallback(
    async (itemId, batches) => {
      await saveItemBatches(itemId, batches);
      dispatch({
        type: APP_ACTIONS.UPSERT_BATCHES,
        payload: { itemId, batches },
      });
    },
    [dispatch]
  );

  const registerHistory = useCallback(
    async (record) => {
      await appendHistory(record);
      dispatch({ type: APP_ACTIONS.PREPEND_HISTORY, payload: record });
      return record;
    },
    [dispatch]
  );

  const consumeFromBatches = useCallback(
    async (itemId, qty, metadata = {}) => {
      const batches = ensureArray(state.itemBatches[itemId]);
      const available = sortBatchesByExpiry(batches).filter((batch) => (batch.qty || 0) > 0);
      const target = pickFefoBatch(available);
      if (!target) {
        return { success: false, reason: "no_batch" };
      }
      if ((target.qty || 0) < qty) {
        return { success: false, reason: "insufficient", batch: target };
      }
      const updatedTarget = { ...target, qty: target.qty - qty };
      const nextBatches = batches
        .map((batch) => (batch.id === target.id ? updatedTarget : batch))
        .filter((batch) => (batch.qty || 0) > 0);
      await applyBatchesSnapshot(itemId, nextBatches);

      const historyRecord = {
        id: generateId("hist"),
        itemId,
        batchId: target.id,
        type: metadata.type ?? "auto",
        direction: metadata.direction ?? "out",
        qty,
        confidence: metadata.confidence,
        fefo: true,
        oldLabel: metadata.oldLabel,
        newLabel: metadata.newLabel,
        imageBase64: metadata.imageBase64,
        user: metadata.user,
        source: metadata.source ?? "camera",
        ts: metadata.ts ?? timestamp(),
        reverted: metadata.reverted ?? false,
      };
      await registerHistory(historyRecord);

      return {
        success: true,
        batchBefore: target,
        batchAfter: updatedTarget,
        historyRecord,
      };
    },
    [state.itemBatches, applyBatchesSnapshot, registerHistory]
  );

  const consumeSpecificBatch = useCallback(
    async (itemId, batchId, qty, metadata = {}) => {
      const batches = ensureArray(state.itemBatches[itemId]);
      const target = batches.find((batch) => batch.id === batchId);
      if (!target) {
        return { success: false, reason: "not_found" };
      }
      if ((target.qty || 0) < qty) {
        return { success: false, reason: "insufficient", batch: target };
      }
      const updatedTarget = { ...target, qty: target.qty - qty };
      const nextBatches = batches
        .map((batch) => (batch.id === batchId ? updatedTarget : batch))
        .filter((batch) => (batch.qty || 0) > 0);
      await applyBatchesSnapshot(itemId, nextBatches);

      const historyRecord = {
        id: generateId("hist"),
        itemId,
        batchId,
        type: metadata.type ?? "manual",
        direction: metadata.direction ?? "out",
        qty,
        confidence: metadata.confidence,
        fefo: metadata.fefo ?? false,
        oldLabel: metadata.oldLabel,
        newLabel: metadata.newLabel,
        imageBase64: metadata.imageBase64,
        user: metadata.user,
        source: metadata.source ?? "ui",
        ts: metadata.ts ?? timestamp(),
      };
      await registerHistory(historyRecord);

      return {
        success: true,
        batchBefore: target,
        batchAfter: updatedTarget,
        historyRecord,
      };
    },
    [state.itemBatches, applyBatchesSnapshot, registerHistory]
  );

  const restoreBatch = useCallback(
    async (itemId, batchSnapshot, qty, metadata = {}) => {
      if (!batchSnapshot || !itemId || !qty) return { success: false, reason: "invalid" };
      const batches = ensureArray(state.itemBatches[itemId]);
      const existingIndex = batches.findIndex((batch) => batch.id === batchSnapshot.id);
      const nextBatches = existingIndex >= 0
        ? batches.map((batch, index) => (index === existingIndex ? updateBatchQty(batch, qty) : batch))
        : [...batches, { ...batchSnapshot, qty }];
      await applyBatchesSnapshot(itemId, nextBatches);

      const historyRecord = {
        id: generateId("hist"),
        itemId,
        batchId: batchSnapshot.id,
        type: metadata.type ?? "correction",
        direction: metadata.direction ?? "in",
        qty,
        confidence: metadata.confidence,
        fefo: true,
        oldLabel: metadata.oldLabel,
        newLabel: metadata.newLabel,
        imageBase64: metadata.imageBase64,
        user: metadata.user,
        source: metadata.source ?? "ui",
        ts: metadata.ts ?? timestamp(),
      };
      await registerHistory(historyRecord);
      return { success: true, historyRecord };
    },
    [state.itemBatches, applyBatchesSnapshot, registerHistory]
  );

  const registerBatchEntry = useCallback(
    async ({ itemId, qty, expiry, code, source = "ui", user, imageBase64, type = "manual", ts: tsOverride, createdAt }) => {
      const batches = ensureArray(state.itemBatches[itemId]);
      const normalizedCode = code || `L-${new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 12)}`;
      const existingByCode = batches.find((batch) => batch.code === normalizedCode);
      const batchId = existingByCode?.id ?? generateId("batch");
      const baseBatch = existingByCode ?? {
        id: batchId,
        itemId,
        code: normalizedCode,
        qty: 0,
        createdAt: createdAt ?? timestamp(),
        expiry,
      };
      const nextBatch = {
        ...baseBatch,
        qty: (baseBatch.qty || 0) + qty,
        expiry: expiry ?? baseBatch.expiry,
        createdAt: baseBatch.createdAt ?? createdAt ?? timestamp(),
      };
      const nextBatches = upsertBatchByCode(
        batches.filter((batch) => batch.id !== batchId),
        normalizedCode,
        nextBatch
      );
      await applyBatchesSnapshot(itemId, nextBatches);

      const historyRecord = {
        id: generateId("hist"),
        itemId,
        batchId,
        type,
        direction: "in",
        qty,
        confidence: undefined,
        fefo: false,
        oldLabel: undefined,
        newLabel: undefined,
        imageBase64,
        user,
        source,
        ts: tsOverride ?? timestamp(),
      };
      await registerHistory(historyRecord);

      return {
        success: true,
        batch: nextBatch,
        historyRecord,
      };
    },
    [state.itemBatches, applyBatchesSnapshot, registerHistory]
  );

  const consumeManualOut = useCallback(
    async ({ itemId, qty = 1, source = "ui", type = "manual", label }) => {
      return consumeFromBatches(itemId, qty, {
        source,
        type,
        ts: timestamp(),
        oldLabel: label,
      });
    },
    [consumeFromBatches]
  );

  const pushRetrainEntry = useCallback(
    async ({ imageBase64, itemId, oldLabel, newLabel, confidence }) => {
      const entry = {
        id: generateId("retrain"),
        itemId,
        oldLabel,
        newLabel,
        confidence,
        imageBase64,
        ts: timestamp(),
      };
      await appendRetrainQueue(entry);
      dispatch({ type: APP_ACTIONS.PREPEND_RETRAIN_ENTRY, payload: entry });
      return entry;
    },
    [dispatch]
  );

  const handleDetection = useCallback(
    async ({ label, confidence, imageBase64, topPredictions }) => {
      const detectionId = generateId("det");
      const normalizedItemId = resolveItemId(label);
      const item = normalizedItemId ? state.itemMap[normalizedItemId] : null;
      const minConfidence = item?.minConfidence ?? 0.7;
      const qty = DEFAULT_QTY;
      const mode = state.detectionMode;
      const pending = {
        id: detectionId,
        label,
        suggestedItemId: normalizedItemId,
        confidence,
        confidencePercent: confidenceToPercent(confidence),
        imageBase64,
        ts: timestamp(),
        qty,
        mode,
        requiresConfirmation: false,
        autoCommitted: false,
        historyRecordId: null,
        consumedBatch: null,
        topPredictions,
      };

      const suggestions = (topPredictions && topPredictions.length
        ? topPredictions.map((pred) => resolveItemId(pred.label)).filter(Boolean)
        : state.items.map((entry) => entry.id)
      ).filter(Boolean);
      pending.suggestions = [...new Set(suggestions)].slice(0, 5);

      if (!normalizedItemId || mode === "in") {
        pending.requiresConfirmation = true;
        dispatch({ type: APP_ACTIONS.SET_PENDING_DETECTION, payload: pending });
        return { pending, status: mode === "in" ? "mode-in" : "needs-confirmation" };
      }

      if (confidence < minConfidence) {
        pending.requiresConfirmation = true;
        dispatch({ type: APP_ACTIONS.SET_PENDING_DETECTION, payload: pending });
        return { pending, status: "below-threshold" };
      }

      const consumeResult = await consumeFromBatches(normalizedItemId, qty, {
        confidence,
        oldLabel: label,
        source: "camera",
        ts: pending.ts,
      });

      if (!consumeResult.success) {
        pending.requiresConfirmation = true;
        pending.failureReason = consumeResult.reason;
        dispatch({ type: APP_ACTIONS.SET_PENDING_DETECTION, payload: pending });
        return { pending, status: "fefo-error", reason: consumeResult.reason };
      }

      pending.autoCommitted = true;
      pending.historyRecordId = consumeResult.historyRecord.id;
      pending.consumedBatch = {
        itemId: normalizedItemId,
        batch: consumeResult.batchBefore,
        qty,
      };
      dispatch({ type: APP_ACTIONS.SET_PENDING_DETECTION, payload: pending });

      const days = diffInDays(Date.now(), consumeResult.batchBefore.expiry);
      return {
        pending,
        status: "auto-committed",
        toast: {
          severity: "success",
          message:
            days !== null
              ? `Consumido via FEFO — vence em ${Math.max(0, days)} dias.`
              : "Consumido via FEFO — lote sem validade definida.",
        },
      };
    },
    [state.itemMap, state.items, state.detectionMode, consumeFromBatches, dispatch]
  );

  const confirmDetection = useCallback(
    async ({ pending, itemId, mode, metadata = {} }) => {
      if (!pending) return { success: false };
      const targetItemId = itemId || pending.suggestedItemId;
      if (!targetItemId) {
        return { success: false, reason: "missing-item" };
      }
      const qty = metadata.qty ?? pending.qty ?? DEFAULT_QTY;
      const resolvedMode = mode ?? pending.mode ?? state.detectionMode;
      if (resolvedMode === "out") {
        const result = await consumeFromBatches(targetItemId, qty, {
          confidence: pending.confidence,
          oldLabel: pending.label,
          source: metadata.source ?? "ui",
          ts: timestamp(),
          type: metadata.type ?? "manual",
        });
        if (result.success) {
          dispatch({ type: APP_ACTIONS.SET_PENDING_DETECTION, payload: null });
          return { success: true, historyRecord: result.historyRecord };
        }
        return { success: false, reason: result.reason };
      }

      return { success: false, reason: "mode-not-supported" };
    },
    [consumeFromBatches, dispatch, state.detectionMode]
  );

  const applyCorrection = useCallback(
    async ({ pending, newItemId, newLabel }) => {
      if (!pending) return { success: false };
      const tsNow = timestamp();
      const qty = pending.qty ?? DEFAULT_QTY;
      if (pending.autoCommitted && pending.consumedBatch) {
        await restoreBatch(pending.consumedBatch.itemId, pending.consumedBatch.batch, qty, {
          confidence: pending.confidence,
          oldLabel: pending.label,
          newLabel,
          ts: tsNow,
          source: "ui",
        });
        await updateHistoryRecord(pending.historyRecordId, { reverted: true, newLabel });
      }

      const consumeResult = await consumeFromBatches(newItemId, qty, {
        confidence: pending.confidence,
        oldLabel: pending.label,
        newLabel,
        source: "ui",
        ts: tsNow,
        type: "correction",
      });

      if (!consumeResult.success) {
        return { success: false, reason: consumeResult.reason };
      }

      await pushRetrainEntry({
        imageBase64: pending.imageBase64,
        itemId: newItemId,
        oldLabel: pending.label,
        newLabel,
        confidence: pending.confidence,
      });

      dispatch({ type: APP_ACTIONS.SET_PENDING_DETECTION, payload: null });

      return {
        success: true,
        historyRecord: consumeResult.historyRecord,
      };
    },
    [consumeFromBatches, restoreBatch, pushRetrainEntry, dispatch]
  );

  return {
    setDetectionMode,
    updateItemThreshold,
    handleDetection,
    confirmDetection,
    applyCorrection,
    registerBatchEntry,
    consumeManualOut,
    consumeSpecificBatch,
  };
}

