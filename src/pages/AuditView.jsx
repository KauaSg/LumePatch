import React, { useMemo } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Chip,
  TextField,
  Tooltip,
} from "@mui/material";
import { useAppDispatch, useAppState, APP_ACTIONS } from "../state/AppStateContext";
import { formatDate } from "../utils/date";

const TYPES = [
  { id: "all", label: "Todos" },
  { id: "auto", label: "Auto" },
  { id: "correction", label: "Correção" },
  { id: "manual", label: "Manual" },
];

export default function AuditView() {
  const { history, itemMap, itemBatches, filters } = useAppState();
  const dispatch = useAppDispatch();

  const filteredHistory = useMemo(() => {
    const { auditType, auditSearch, auditDateRange } = filters;
    const search = auditSearch?.trim().toLowerCase() || "";
    const start = auditDateRange?.start ? new Date(auditDateRange.start).getTime() : null;
    const end = auditDateRange?.end ? new Date(auditDateRange.end).getTime() + 86_400_000 : null;

    return (history || []).filter((record) => {
      if (auditType !== "all" && record.type !== auditType) return false;
      if (start && record.ts < start) return false;
      if (end && record.ts > end) return false;
      if (!search) return true;
      const item = itemMap[record.itemId];
      const batches = itemBatches[record.itemId] || [];
      const batch = batches.find((entry) => entry.id === record.batchId);
      const haystack = [
        record.itemId,
        item?.name,
        batch?.code,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }, [filters, history, itemMap, itemBatches]);

  const setFilters = (updates) => {
    dispatch({
      type: APP_ACTIONS.SET_FILTERS,
      payload: {
        ...filters,
        ...updates,
      },
    });
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" fontWeight={700}>
          Painel de Auditoria
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quem • O quê • Como (auto/correção/manual) • Lote • Validade • Quando • Confiança
        </Typography>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {TYPES.map((type) => (
              <Chip
                key={type.id}
                label={type.label}
                clickable
                color={filters.auditType === type.id ? "primary" : "default"}
                onClick={() => setFilters({ auditType: type.id })}
              />
            ))}
          </Stack>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TextField
              label="Buscar item/lote"
              value={filters.auditSearch ?? ""}
              onChange={(event) => setFilters({ auditSearch: event.target.value })}
              size="small"
            />
            <Tooltip title="Início do intervalo">
              <TextField
                label="De"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.auditDateRange?.start ?? ""}
                onChange={(event) =>
                  setFilters({
                    auditDateRange: {
                      start: event.target.value || null,
                      end: filters.auditDateRange?.end ?? null,
                    },
                  })
                }
                size="small"
              />
            </Tooltip>
            <Tooltip title="Fim do intervalo">
              <TextField
                label="Até"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.auditDateRange?.end ?? ""}
                onChange={(event) =>
                  setFilters({
                    auditDateRange: {
                      start: filters.auditDateRange?.start ?? null,
                      end: event.target.value || null,
                    },
                  })
                }
                size="small"
              />
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, maxHeight: 480 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Quem</TableCell>
              <TableCell>O quê</TableCell>
              <TableCell>Como</TableCell>
              <TableCell>Lote</TableCell>
              <TableCell>Validade</TableCell>
              <TableCell>Quando</TableCell>
              <TableCell>Confiança</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHistory.map((record) => {
              const item = itemMap[record.itemId];
              const batches = itemBatches[record.itemId] || [];
              const batch = batches.find((entry) => entry.id === record.batchId);
              return (
                <TableRow key={record.id} hover>
                  <TableCell>{record.user ?? "—"}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {item?.name ?? record.itemId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {record.direction === "in" ? "Entrada" : "Saída"} de {record.qty}
                    </Typography>
                  </TableCell>
                  <TableCell>{record.type}</TableCell>
                  <TableCell>{batch?.code ?? "—"}</TableCell>
                  <TableCell>{batch?.expiry ? formatDate(batch.expiry) : "Sem validade"}</TableCell>
                  <TableCell>{new Date(record.ts).toLocaleString("pt-BR")}</TableCell>
                  <TableCell>{record.confidence ? `${Math.round(record.confidence * 100)}%` : "—"}</TableCell>
                </TableRow>
              );
            })}
            {filteredHistory.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nenhum registro encontrado com os filtros atuais.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
