import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import BatchLabelModal from "../components/BatchLabelModal";
import { useAppState } from "../state/AppStateContext";
import { useInventoryActions } from "../state/useInventoryActions";
import { formatDate } from "../utils/date";

export default function BatchDetailView({ batchId, onBack }) {
  const { itemBatches, itemMap, history } = useAppState();
  const actions = useInventoryActions();

  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const [consumeQty, setConsumeQty] = useState(1);
  const [entryQty, setEntryQty] = useState(1);
  const [expiryOverride, setExpiryOverride] = useState("");
  const [feedback, setFeedback] = useState(null);

  const batchInfo = useMemo(() => {
    for (const [itemId, batches] of Object.entries(itemBatches)) {
      const found = (batches || []).find((batch) => batch.id === batchId);
      if (found) {
        return { itemId, item: itemMap[itemId], batch: found };
      }
    }
    return { itemId: null, item: null, batch: null };
  }, [batchId, itemBatches, itemMap]);

  const batchHistory = useMemo(
    () =>
      history
        .filter((record) => record.batchId === batchId)
        .slice(0, 8),
    [history, batchId]
  );

  if (!batchInfo.batch) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6">Lote não encontrado.</Typography>
        <Button sx={{ mt: 2 }} onClick={onBack}>
          Voltar
        </Button>
      </Paper>
    );
  }

  const { item, batch, itemId } = batchInfo;

  const handleConsume = async () => {
    const qty = Math.max(1, Number(consumeQty) || 1);
    const result = await actions.consumeSpecificBatch(itemId, batchId, qty, {
      source: "qr",
      user: "QR",
      type: "manual",
    });
    if (result.success) {
      setFeedback({ type: "success", message: "Baixa registrada a partir do QR." });
    } else {
      setFeedback({ type: "error", message: "Sem estoque suficiente neste lote." });
    }
  };

  const handleEntry = async () => {
    const qty = Math.max(1, Number(entryQty) || 1);
    await actions.registerBatchEntry({
      itemId,
      qty,
      code: batch.code,
      expiry: expiryOverride || batch.expiry,
      source: "qr",
      type: "manual",
    });
    setFeedback({ type: "success", message: "Entrada registrada neste lote." });
  };

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={1}>
          <Typography variant="overline">Lote</Typography>
          <Typography variant="h5" fontWeight={700}>
            {item?.name} — {batch.code}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Validade: {batch.expiry ? formatDate(batch.expiry) : "Sem validade"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quantidade disponível: {batch.qty} {item?.unit}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => setLabelModalOpen(true)}>
            Etiqueta/QR
          </Button>
          <Button variant="text" onClick={onBack}>
            Voltar
          </Button>
        </Stack>
      </Paper>

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Consumir deste lote
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
          <TextField
            label="Quantidade"
            type="number"
            value={consumeQty}
            onChange={(event) => setConsumeQty(event.target.value)}
            size="small"
            inputProps={{ min: 1 }}
          />
          <Button variant="contained" onClick={handleConsume}>
            Consumir via QR
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Registrar entrada neste lote
        </Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Quantidade"
            type="number"
            value={entryQty}
            onChange={(event) => setEntryQty(event.target.value)}
            size="small"
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Validade"
            type="date"
            size="small"
            value={expiryOverride}
            onChange={(event) => setExpiryOverride(event.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText="Deixe em branco para manter a validade atual"
          />
          <Button variant="outlined" onClick={handleEntry}>
            Registrar entrada
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Histórico do lote
        </Typography>
        <Divider sx={{ my: 2 }} />
        <List dense>
          {batchHistory.map((record) => (
            <ListItem key={record.id} disablePadding>
              <ListItemText
                primary={`${record.type} • ${record.direction === "in" ? "Entrada" : "Saída"} de ${record.qty}`}
                secondary={`${new Date(record.ts).toLocaleString("pt-BR")} — ${record.source ?? ""}`}
              />
            </ListItem>
          ))}
          {batchHistory.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Nenhum histórico para este lote.
            </Typography>
          )}
        </List>
      </Paper>

      <BatchLabelModal
        open={labelModalOpen}
        onClose={() => setLabelModalOpen(false)}
        batch={batch}
        item={item}
        batchesForSheet={itemBatches[itemId] || []}
      />
    </Stack>
  );
}
