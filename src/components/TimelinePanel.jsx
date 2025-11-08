import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  Tooltip,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import {
  History as HistoryIcon,
  SaveAlt as SaveAltIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Input as InputIcon,
  Output as OutputIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";

const DAY_MS = 24 * 60 * 60 * 1000;

function getRangeCutoff(rangeKey) {
  switch (rangeKey) {
    case "24h":
      return Date.now() - DAY_MS;
    case "7d":
      return Date.now() - DAY_MS * 7;
    case "30d":
      return Date.now() - DAY_MS * 30;
    default:
      return null;
  }
}

function formatGroupLabel(ts) {
  if (!ts) return "Sem data";
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return "Data inválida";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today - target) / DAY_MS);

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";

  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export default function TimelinePanel({
  saved = [],
  selectedRange,
  onRangeChange = () => {},
  selectedOperation,
  onOperationChange = () => {},
  onExportCsv = () => {},
  onExportJson = () => {},
  onClear = () => {},
  onOpenCorrection = () => {},
  highlightedTs,
  isMobile,
}) {
  const filtered = useMemo(() => {
    const cutoff = getRangeCutoff(selectedRange);

    return (saved || [])
      .map((entry, index) => ({ ...entry, index }))
      .filter((entry) => {
        if (!entry) return false;
        if (selectedOperation !== "all" && entry.operation !== selectedOperation) {
          return false;
        }
        if (!cutoff) return true;
        if (!entry.ts) return false;
        const timestamp = new Date(entry.ts).getTime();
        if (Number.isNaN(timestamp)) return false;
        return timestamp >= cutoff;
      })
      .sort((a, b) => new Date(b.ts || 0) - new Date(a.ts || 0));
  }, [saved, selectedRange, selectedOperation]);

  const grouped = useMemo(() => {
    const map = new Map();

    filtered.forEach((item) => {
      const key = item.ts ? new Date(item.ts).toISOString().slice(0, 10) : "sem-data";
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: formatGroupLabel(item.ts),
          items: [],
        });
      }
      map.get(key).items.push(item);
    });

    return Array.from(map.values());
  }, [filtered]);

  const totalFiltered = filtered.length;
  const totalSaved = saved.length;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2} gap={2} flexWrap="wrap">
          <HistoryIcon color="primary" />
          <Box>
            <Typography variant="h6">Histórico de Detecções</Typography>
            <Typography variant="body2" color="text.secondary">
              Mostrando {totalFiltered} de {totalSaved} registros
            </Typography>
          </Box>
          <Box sx={{ ml: "auto" }}>
            <Tooltip
              title={totalFiltered === 0 ? "Sem registros filtrados" : "Exportar linha do tempo (CSV)"}
            >
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveAltIcon />}
                  onClick={() => onExportCsv(filtered)}
                  disabled={totalFiltered === 0}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  Exportar timeline
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Box>

        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={1}
          alignItems={isMobile ? "stretch" : "center"}
          justifyContent="space-between"
          mb={2}
        >
          <ToggleButtonGroup
            value={selectedRange}
            exclusive
            onChange={(_, value) => value && onRangeChange(value)}
            size={isMobile ? "small" : "medium"}
          >
            <ToggleButton value="24h">24h</ToggleButton>
            <ToggleButton value="7d">7 dias</ToggleButton>
            <ToggleButton value="30d">30 dias</ToggleButton>
            <ToggleButton value="all">Tudo</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            value={selectedOperation}
            exclusive
            onChange={(_, value) => value && onOperationChange(value)}
            size={isMobile ? "small" : "medium"}
          >
            <ToggleButton value="all">
              <TimelineIcon sx={{ mr: isMobile ? 0 : 1 }} fontSize="small" />
              {!isMobile && "Todas"}
            </ToggleButton>
            <ToggleButton value="entrada">
              <InputIcon sx={{ mr: isMobile ? 0 : 1 }} fontSize="small" />
              {!isMobile && "Entradas"}
            </ToggleButton>
            <ToggleButton value="saida">
              <OutputIcon sx={{ mr: isMobile ? 0 : 1 }} fontSize="small" />
              {!isMobile && "Saídas"}
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {totalFiltered === 0 ? (
          <Box textAlign="center" py={4}>
            <TimelineIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Nenhum registro dentro do filtro selecionado.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2} sx={{ maxHeight: isMobile ? 260 : 320, overflowY: "auto", pr: 1 }}>
            {grouped.map((group) => (
              <Box key={group.key}>
                <Typography variant="subtitle2" color="text.secondary" mb={1} textTransform="capitalize">
                  {group.label}
                </Typography>
                <List dense disablePadding>
                  {group.items.map((item) => {
                    const isHighlighted = highlightedTs && item.ts === highlightedTs;
                    const timestampLabel = item.ts
                      ? new Date(item.ts).toLocaleString("pt-BR")
                      : "Sem data";
                    const operationLabel =
                      item.operation === "entrada" ? "Entrada" : item.operation === "saida" ? "Saída" : "-";
                    const scoreLabel =
                      item.score !== undefined && item.score !== null
                        ? `${(item.score * 100).toFixed(1)}%`
                        : null;
                    const consumedLotsLabel = Array.isArray(item.consumedLots)
                      ? item.consumedLots
                          .map((lot) => `${lot?.lotId || "Lote"} (${lot?.qty || 0} un)`)
                          .join(" | ")
                      : null;

                    return (
                      <React.Fragment key={`${item.index}-${item.ts || "no-ts"}`}>
                        <Paper
                          variant="outlined"
                          sx={{
                            mb: 1,
                            borderRadius: 2,
                            borderColor: isHighlighted ? "primary.main" : "divider",
                            backgroundColor: isHighlighted ? "rgba(21,101,192,0.08)" : "background.paper",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <ListItem
                            secondaryAction={
                              <Tooltip title="Corrigir detecção">
                                <IconButton edge="end" size="small" onClick={() => onOpenCorrection(item.index)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            }
                          >
                            <ListItemAvatar>
                              <Avatar
                                variant="rounded"
                                src={item.image}
                                alt={item.label}
                                sx={{ width: 48, height: 48 }}
                              />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                  <Typography fontWeight={600} textTransform="capitalize">
                                    {item.label || "-"}
                                  </Typography>
                                  <Chip
                                    label={operationLabel}
                                    color={item.operation === "entrada" ? "success" : "primary"}
                                    size="small"
                                  />
                                  {scoreLabel ? <Chip label={scoreLabel} size="small" variant="outlined" /> : null}
                                  <Chip label={`Qtd ${item.quantity || 0}`} size="small" variant="outlined" />
                                </Box>
                              }
                              secondary={
                                <Stack spacing={0.5}>
                                  <Typography variant="body2" color="text.secondary">
                                    {timestampLabel} - {item.user || "-"}
                                  </Typography>
                                  {item.lotId ? (
                                    <Chip label={`Lote ${item.lotId}`} size="small" variant="outlined" />
                                  ) : null}
                                  {item.expiryDate ? (
                                    <Typography variant="caption" color="text.secondary">
                                      Validade:{" "}
                                      {new Date(item.expiryDate).toLocaleDateString("pt-BR")}
                                    </Typography>
                                  ) : null}
                                  {consumedLotsLabel ? (
                                    <Typography variant="caption" color="text.secondary">
                                      Consumidos: {consumedLotsLabel}
                                    </Typography>
                                  ) : null}
                                </Stack>
                              }
                            />
                          </ListItem>
                        </Paper>
                        <Divider component="li" />
                      </React.Fragment>
                    );
                  })}
                </List>
              </Box>
            ))}
          </Stack>
        )}

        <Stack direction="row" spacing={1.5} mt={2}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            fullWidth
            onClick={onClear}
            size={isMobile ? "small" : "medium"}
          >
            Limpar histórico
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveAltIcon />}
            fullWidth
            onClick={onExportJson}
            size={isMobile ? "small" : "medium"}
          >
            Exportar JSON
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
