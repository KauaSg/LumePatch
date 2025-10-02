import React, { useMemo, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
  Alert,
  Divider,
  Tooltip,
} from "@mui/material";
import ExpiryFilterChips from "../components/ExpiryFilterChips";
import KpiSummary from "../components/KpiSummary";
import BatchLabelModal from "../components/BatchLabelModal";
import { useAppState } from "../state/AppStateContext";
import {
  calculateKpis,
  countExpiringItems,
  filterItemsByExpiry,
  sumItemStock,
  findNextBatch,
  describeExpiry,
  buildItemForecasts,
} from "../utils/analytics";
import { formatDate } from "../utils/date";

export default function DashboardView() {
  const state = useAppState();
  const { items, itemBatches, history, filters } = state;
  const [labelDialog, setLabelDialog] = useState({ open: false, batch: null, item: null });

  const metrics = useMemo(() => {
    const kpis = calculateKpis(history);
    const expiring = countExpiringItems(items, itemBatches);
    const forecasts = buildItemForecasts(history, itemBatches);
    return { ...kpis, expiring, forecasts };
  }, [history, items, itemBatches]);

  const itemsWithDetails = useMemo(() => {
    return (items || []).map((item) => {
      const batches = itemBatches[item.id] || [];
      return {
        item,
        batches,
        stock: sumItemStock(item.id, itemBatches),
        nextBatch: findNextBatch(item.id, itemBatches),
      };
    });
  }, [items, itemBatches]);

  const filteredItems = useMemo(
    () => filterItemsByExpiry(items, itemBatches, filters.expiry),
    [items, itemBatches, filters.expiry]
  );

  const filteredItemIds = new Set(filteredItems.map((entry) => entry.id));
  const itemsToDisplay = itemsWithDetails.filter((entry) => filteredItemIds.has(entry.item.id));

  const criticalItems = Object.entries(metrics.forecasts)
    .sort((a, b) => a[1].daysToZero - b[1].daysToZero);

  return (
    <Stack spacing={3}>
      {criticalItems.length > 0 && (
        <Alert severity="warning" sx={{ fontWeight: 500 }}>
          Tendência de ruptura detectada para {criticalItems.length} item(ns):
          {criticalItems.map(([itemId, info]) => {
            const item = state.itemMap[itemId];
            const name = item?.name ?? itemId;
            const days = Math.max(1, Math.floor(info.daysToZero));
            return (
              <span key={itemId}>
                {` ${name} (~${days} dias)`}
              </span>
            );
          })}
        </Alert>
      )}

      <KpiSummary
        autoRate={metrics.autoRate}
        accuracy={metrics.accuracy}
        expiringItems={metrics.expiring}
      />

      <Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          Filtro “Vence em”
        </Typography>
        <ExpiryFilterChips />
      </Box>

      <Grid container spacing={2}>
        {itemsToDisplay.map(({ item, batches, stock, nextBatch }) => {
          const forecast = metrics.forecasts[item.id];
          return (
            <Grid item xs={12} md={6} key={item.id}>
              <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Estoque atual: {stock} {item.unit}
                      </Typography>
                      {nextBatch && (
                        <Typography variant="body2" color="text.secondary">
                          Próximo lote: {describeExpiry(nextBatch)}
                        </Typography>
                      )}
                    </Box>
                    {forecast && (
                      <Chip
                        color="error"
                        label={`Tendência de ruptura em ~${Math.max(1, Math.floor(forecast.daysToZero))} dias`}
                      />
                    )}
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={1.5}>
                    {batches.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Nenhum lote registrado para este item.
                      </Typography>
                    )}
                    {batches.map((batch) => (
                      <Box
                        key={batch.id}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          gap: 1.5,
                          alignItems: "center",
                          p: 1,
                          borderRadius: 2,
                          backgroundColor: (theme) => theme.palette.grey[100],
                        }}
                      >
                        <Stack spacing={0.5}>
                          <Typography variant="body2" fontWeight={600}>
                            Lote {batch.code}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Quantidade: {batch.qty} {item.unit}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Validade: {batch.expiry ? formatDate(batch.expiry) : "Sem validade"}
                          </Typography>
                        </Stack>
                        <Tooltip title="Etiqueta/QR">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setLabelDialog({ open: true, batch, item })}
                          >
                            Etiqueta/QR
                          </Button>
                        </Tooltip>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <BatchLabelModal
        open={labelDialog.open}
        batch={labelDialog.batch}
        item={labelDialog.item}
        batchesForSheet={labelDialog.item ? itemBatches[labelDialog.item.id] || [] : []}
        onClose={() => setLabelDialog({ open: false, batch: null, item: null })}
      />
    </Stack>
  );
}
