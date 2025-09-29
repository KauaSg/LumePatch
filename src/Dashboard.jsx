import React, { useEffect, useState, useMemo, useCallback } from "react";
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Paper,
  Chip,
  Alert,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  MenuItem,
  TextField
} from "@mui/material";
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell,
  CartesianGrid
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Inventory,
  Warning,
  CalendarToday,
  FilterList,
  Refresh
} from "@mui/icons-material";
import { DEFAULT_DETECTIONS, DEFAULT_STOCK, DEFAULT_ITEM_SETTINGS_MAP } from "./constants/persistence";
import {
  loadStock as loadPersistedStock,
  loadDetections as loadPersistedDetections,
  loadItemSettings as loadPersistedItemSettings,
  loadItemBatches as loadPersistedItemBatches,
} from "./services/persistence";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const EXPIRY_WARNING_DAYS = 7;

// Paleta de cores consistente
const COLORS = ["#1565c0", "#42a5f5", "#81d4fa", "#29b6f6", "#4fc3f7", 
                "#ffb300", "#ffa000", "#ff8f00", "#ef5350", "#f44336", 
                "#66bb6a", "#4caf50", "#2e7d32"];

export default function Dashboard() {
  const [stock, setStock] = useState(DEFAULT_STOCK);
  const [detections, setDetections] = useState(DEFAULT_DETECTIONS);
  const [itemSettings, setItemSettings] = useState(() => ({ ...DEFAULT_ITEM_SETTINGS_MAP }));
  const [itemBatches, setItemBatches] = useState({});
  const [timeRange, setTimeRange] = useState("7"); // 7, 30, 90, 365
  const [refreshKey, setRefreshKey] = useState(0);

  // Carregar dados persistidos (API + fallback localStorage)
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [stockData, detectionData, itemSettingsData, itemBatchesData] = await Promise.all([
          loadPersistedStock(),
          loadPersistedDetections(),
          loadPersistedItemSettings(),
          loadPersistedItemBatches(),
        ]);
        if (!cancelled) {
          setStock(stockData);
          setDetections(detectionData);
          setItemSettings((current) => ({ ...DEFAULT_ITEM_SETTINGS_MAP, ...current, ...itemSettingsData }));
          setItemBatches(itemBatchesData || {});
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [refreshKey]);

    const toItemId = useCallback((value = "") => value.toLowerCase().replace(/\s+/g, "_"), []);
  const getItemMeta = useCallback(
    (id) => {
      const key = toItemId(id);
      return itemSettings[key] || DEFAULT_ITEM_SETTINGS_MAP[key] || { id: key, displayName: key.replace(/_/g, " ") };
    },
    [itemSettings, toItemId]
  );
  const getItemDisplayName = useCallback(
    (id) => getItemMeta(id).displayName || toItemId(id).replace(/_/g, " "),
    [getItemMeta, toItemId]
  );
  const getItemUnit = useCallback((id) => getItemMeta(id).unit || "un", [getItemMeta]);
  const getItemMinStock = useCallback(
    (id) => {
      const meta = getItemMeta(id);
      return typeof meta.minStock === "number" ? meta.minStock : 10;
    },
    [getItemMeta]
  );
  const getItemBatches = useCallback(
    (id) => {
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
    },
    [itemBatches, toItemId]
  );

  const formatDate = useCallback((iso) => {
    if (!iso) return "Sem validade";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "Sem validade";
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  }, []);

  const getItemExpiryInfo = useCallback(
    (id) => {
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
    },
    [getItemBatches]
  );

  const describeExpiry = useCallback(
    (info) => {
      if (!info || !info.nextBatch?.expiresAt) return "Sem validade";
      const label = formatDate(info.nextBatch.expiresAt);
      const diffDays = info.diffDays;
      if (typeof diffDays !== "number") return label;
      if (diffDays < 0) return `${label} (vencido)`;
      if (diffDays === 0) return `${label} (vence hoje)`;
      if (diffDays === 1) return `${label} (vence em 1 dia)`;
      return `${label} (vence em ${diffDays} dias)`;
    },
    [formatDate]
  );

  // Processar dados para os gráficos
  const { 
    consumptionData, 
    stockData, 
    trendData, 
    alerts, 
    statistics,
    recentDetections 
  } = useMemo(() => {
    const now = new Date();
    const timeRangeMs = parseInt(timeRange) * 24 * 60 * 60 * 1000;
    const startDate = new Date(now.getTime() - timeRangeMs);

    // Filtrar detecções pelo período selecionado
    const filteredDetections = detections.filter(detection => 
      new Date(detection.ts) >= startDate
    );

    // Calcular consumo por item
    const consumptionByItem = filteredDetections.reduce((acc, detection) => {
      const itemId = detection.itemId ? toItemId(detection.itemId) : toItemId(detection.label || "");
      const quantity = Number(detection.quantity) || 1;
      acc[itemId] = (acc[itemId] || 0) + quantity;
      return acc;
    }, {});

    const consumptionData = Object.entries(consumptionByItem)
      .map(([id, value]) => ({
        id,
        name: getItemDisplayName(id),
        consumo: value,
        estoque: stock[id] || 0,
        unit: getItemUnit(id),
      }))
      .sort((a, b) => b.consumo - a.consumo);

    // Dados para grafico de pizza (distribuicao do consumo)
    const totalStockValue = Object.values(stock).reduce((a, b) => a + b, 0);
    const stockData = Object.entries(stock)
      .filter(([, value]) => value > 0)
      .map(([id, value]) => ({
        id,
        name: getItemDisplayName(id),
        value,
        unit: getItemUnit(id),
        percent: totalStockValue ? value / totalStockValue : 0
      }))
      .sort((a, b) => b.value - a.value);


    // Dados para tendência temporal (consumo por dia)
    const dailyConsumption = filteredDetections.reduce((acc, detection) => {
      const date = new Date(detection.ts).toLocaleDateString();
      const quantity = Number(detection.quantity) || 1;
      acc[date] = (acc[date] || 0) + quantity;
      return acc;
    }, {});

    const trendData = Object.entries(dailyConsumption)
      .map(([date, count]) => ({ date, consumo: count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Alertas de estoque e validade
    const stockAlerts = Object.entries(stock)
      .map(([id, quantity]) => {
        const displayName = getItemDisplayName(id);
        const unit = getItemUnit(id);
        const minStock = getItemMinStock(id);
        if (quantity === 0) {
          return {
            item: id,
            quantity,
            severity: "error",
            message: `${displayName} esta esgotado`,
          };
        }
        if (quantity <= minStock) {
          return {
            item: id,
            quantity,
            severity: "warning",
            message: `${displayName} esta com estoque baixo (${quantity} ${unit})`,
          };
        }
        return null;
      })
      .filter(Boolean);

    const expiryEntries = Object.keys(stock)
      .map((id) => ({ id, info: getItemExpiryInfo(id) }))
      .filter((entry) => entry.info && entry.info.nextBatch?.expiresAt);

    const expiryAlerts = expiryEntries
      .map(({ id, info }) => {
        const displayName = getItemDisplayName(id);
        const description = describeExpiry(info);
        if (typeof info.diffDays === "number" && info.diffDays < 0) {
          return {
            item: id,
            severity: "error",
            message: `${displayName} esta vencido (${description})`,
          };
        }
        if (typeof info.diffDays === "number" && info.diffDays <= EXPIRY_WARNING_DAYS) {
          return {
            item: id,
            severity: "warning",
            message: `${displayName} vence em breve (${description})`,
          };
        }
        return null;
      })
      .filter(Boolean);

    const alerts = [...stockAlerts, ...expiryAlerts];

    // Estatisticas gerais
    // Estatísticas gerais
    const totalConsumption = filteredDetections.reduce(
      (total, detection) => total + (Number(detection.quantity) || 1),
      0
    );
    const avgDailyConsumption = trendData.length > 0 
      ? totalConsumption / trendData.length 
      : 0;

    const mostConsumed = consumptionData.length > 0 ? consumptionData[0] : null;
    const criticalItems = alerts.filter((alert) => alert.severity === "error").length;

    const statistics = {
      totalStock: totalStockValue,
      totalConsumption,
      avgDailyConsumption: Math.round(avgDailyConsumption * 100) / 100,
      mostConsumed: mostConsumed ? `${mostConsumed.name} (${mostConsumed.consumo})` : "N/A",
      criticalItems,
      periodDetections: filteredDetections.length,
      uniqueItems: Object.keys(consumptionByItem).length
    };

    // Detecções recentes (últimas 5)
    const recentDetections = detections
      .slice(0, 5)
      .map((detection) => {
        const itemId = detection.itemId ? toItemId(detection.itemId) : toItemId(detection.label || "");
        return {
          ...detection,
          itemId,
          displayName: getItemDisplayName(itemId),
          unit: getItemUnit(itemId),
          quantity: Number(detection.quantity) || 1,
          date: new Date(detection.ts).toLocaleString(),
        };
      });

    return {
      consumptionData,
      stockData,
      trendData,
      alerts,
      statistics,
      recentDetections
    };
  }, [stock, detections, timeRange, getItemDisplayName, getItemUnit, getItemMinStock, toItemId, getItemExpiryInfo, describeExpiry]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 2, background: 'rgba(255, 255, 255, 0.95)' }}>
          <Typography variant="subtitle2" fontWeight="bold">{label}</Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" color={entry.color}>
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho e Filtros */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Dashboard Analítico
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip 
            icon={<CalendarToday />} 
            label={`Últimos ${timeRange} dias`}
            variant="outlined"
          />
          <TextField
            select
            size="small"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="7">7 dias</MenuItem>
            <MenuItem value="30">30 dias</MenuItem>
            <MenuItem value="90">90 dias</MenuItem>
            <MenuItem value="365">1 ano</MenuItem>
          </TextField>
          <IconButton onClick={() => setRefreshKey(prev => prev + 1)} color="primary">
            <Refresh />
          </IconButton>
        </Stack>
      </Box>

      {/* Alertas Críticos */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="warning" sx={{ mb: 1 }}>
            <strong>{alerts.length} alerta(s) de estoque</strong>
          </Alert>
          <Grid container spacing={1}>
            {alerts.map((alert, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Alert severity={alert.severity} variant="outlined">
                  {alert.message}
                </Alert>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Inventory sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {statistics.totalStock}
              </Typography>
              <Typography variant="body2">Total em Estoque</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {statistics.totalConsumption}
              </Typography>
              <Typography variant="body2">Consumo no Período</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ffa000 0%, #ffb300 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <TrendingUp sx={{ fontSize: 40, mb: 1 }} />

              <Typography variant="h4" fontWeight="bold">
                {statistics.avgDailyConsumption}
              </Typography>
              <Typography variant="body2">Média Diária</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Warning sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {statistics.criticalItems}
              </Typography>
              <Typography variant="body2">Itens Críticos</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos Principais */}
      <Grid container spacing={4}>
        {/* Consumo por Item */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterList sx={{ mr: 1 }} />
              Consumo por Item (Últimos {timeRange} dias)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="consumo" name="Consumo" fill="#1565c0">
                  {consumptionData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <Bar dataKey="estoque" name="Estoque Atual" fill="#42a5f5">
                  {consumptionData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[(index + 5) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Distribuição do Estoque */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Distribuição do Estoque
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {stockData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Tendência Temporal */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tendência de Consumo Diário
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="consumo" 
                  stroke="#1565c0" 
                  fill="rgba(21, 101, 192, 0.2)" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="consumo" 
                  stroke="#1565c0" 
                  strokeWidth={2}
                  dot={{ fill: '#1565c0', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Detecções Recentes e Estatísticas Detalhadas */}
      <Grid container spacing={4} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Detecções Recentes
            </Typography>
            <List>
              {recentDetections.length > 0 ? (
                recentDetections.map((detection, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      <Chip 
                        label={`${(detection.score * 100).toFixed(1)}%`} 
                        size="small" 
                        color="primary"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography fontWeight="bold" textTransform="capitalize">
                          {detection.displayName || detection.label}
                        </Typography>
                      }
                      secondary={`${detection.date} - ${detection.quantity} ${detection.unit || "un"}`}
                    />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                  Nenhuma deteccao recente
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Estatísticas Detalhadas
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Itens únicos consumidos
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {statistics.uniqueItems} itens
                </Typography>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Item mais consumido
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {statistics.mostConsumed}
                </Typography>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Detecções no período
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {statistics.periodDetections} registros
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
