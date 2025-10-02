import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Tooltip,
} from "@mui/material";
import { generateBatchCode, suggestExpiryFromShelfLife } from "../utils/batch";
import { formatDate } from "../utils/date";

function nextSequence(existingBatches = []) {
  if (!existingBatches.length) return 1;
  const max = existingBatches.reduce((acc, batch) => {
    const match = batch.code?.match(/L-\d{8}-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return Number.isNaN(num) ? acc : Math.max(acc, num);
    }
    return acc;
  }, 0);
  return max + 1;
}

export default function NewBatchModal({ open, onClose, onSave, item, existingBatches }) {
  const sequence = useMemo(() => nextSequence(existingBatches), [existingBatches]);
  const [qty, setQty] = useState(1);
  const [code, setCode] = useState(generateBatchCode(sequence));
  const [expiry, setExpiry] = useState(() => suggestExpiryFromShelfLife(item?.shelfLifeDays));

  useEffect(() => {
    if (open) {
      setQty(1);
      setCode(generateBatchCode(sequence));
      setExpiry(suggestExpiryFromShelfLife(item?.shelfLifeDays));
    }
  }, [open, item?.shelfLifeDays, sequence]);

  const handleSubmit = () => {
    if (!item) return;
    const payload = {
      qty: Math.max(1, Number(qty) || 1),
      code: code.trim(),
      expiry: expiry || undefined,
    };
    onSave?.(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Novo lote — {item?.name}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Quantidade"
            type="number"
            value={qty}
            onChange={(event) => setQty(event.target.value)}
            inputProps={{ min: 1 }}
            helperText={`Registrar em ${item?.unit || "un"}`}
          />
          <Tooltip title="Sugerido a partir da shelf life do item" placement="top-start">
            <TextField
              label="Validade"
              type="date"
              value={expiry ?? ""}
              onChange={(event) => setExpiry(event.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText={expiry ? `Sugestão: ${formatDate(expiry)}` : "Opcional"}
            />
          </Tooltip>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              label="Código"
              fullWidth
              value={code}
              onChange={(event) => setCode(event.target.value)}
              helperText="Ler QR/Barcode? Escaneie e cole aqui."
            />
            <Button
              variant="outlined"
              onClick={() => setCode(generateBatchCode(sequence))}
            >
              Sugerir
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Dica: mantenha o padrão L-YYYYMMDD-SEQ para facilitar a rastreabilidade.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Registrar lote
        </Button>
      </DialogActions>
    </Dialog>
  );
}
