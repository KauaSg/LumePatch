import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Chip,
  Box,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip as RechartsTooltip,
} from "recharts";

const COLORS = ["#ef5350", "#ffa726", "#29b6f6"];

function riskBackground(score) {
  if (score >= 70) return "#fdecea";
  if (score >= 45) return "#fff4e5";
  return "#edf7ed";
}

function riskBorder(score) {
  if (score >= 70) return "#f44336";
  if (score >= 45) return "#ffa000";
  return "#2e7d32";
}

export default function InventoryHealthPanel({ metrics = [], isMobile }) {
  const hasData = metrics && metrics.length > 0;
  const topCritical = metrics.slice(0, 3);
  const heatmapItems = metrics.slice(0, 8);

  const radarData = useMemo(() => {
    if (topCritical.length === 0) return [];
    const axes = ["Pressao de Estoque", "Pressao de Validade", "Pressao de Fluxo"];

    return axes.map((axis) => {
      const row = { axis };
      topCritical.forEach((item) => {
        if (axis === "Pressao de Estoque") row[item.label] = Math.round(item.stockPressure);
        if (axis === "Pressao de Validade") row[item.label] = Math.round(item.expiryPressure);
        if (axis === "Pressao de Fluxo") row[item.label] = Math.round(item.flowPressure);
      });
      return row;
    });
  }, [topCritical]);

  if (!hasData) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Saude do estoque
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ainda não há dados suficientes para calcular o painel de risco.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          mb={2}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Saude do estoque
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Combinação de nível de estoque, validade e fluxo dos últimos 14 dias.
            </Typography>
          </Box>
          <Chip
            label="Janela: 14 dias"
            color="primary"
            variant="outlined"
            sx={{ alignSelf: { xs: "flex-start", md: "center" } }}
          />
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
                minHeight: 320,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                Pressões combinadas (top 3 riscos)
              </Typography>
              {radarData.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Precisamos de mais dados recentes para desenhar o gráfico.
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height={isMobile ? 260 : 300}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="axis" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <RechartsTooltip />
                    {topCritical.map((item, index) => (
                      <Radar
                        key={item.label}
                        name={item.label.replace(/_/g, " ")}
                        dataKey={item.label}
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.3}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                Maiores riscos agora
              </Typography>
              <Stack spacing={1.5}>
                {topCritical.map((item, index) => (
                  <Box
                    key={item.label}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: riskBackground(item.riskScore),
                      border: "1px solid",
                      borderColor: riskBorder(item.riskScore),
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      flexWrap="wrap"
                      gap={1}
                    >
                      <Box>
                        <Typography fontWeight={600} textTransform="capitalize">
                          {item.label.replace(/_/g, " ")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.healthLabel} — risco {item.riskScore}%
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={`${item.qty} un`}
                        color="primary"
                        variant="outlined"
                      />
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Validade
                        </Typography>
                        <Typography variant="body2">
                          {item.expiryInfo?.label || "Sem dados"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Fluxo 14d
                        </Typography>
                        <Typography variant="body2">
                          {item.recentFlow || 0} saída(s)
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>

        <Box mt={3}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Heatmap de risco por item
          </Typography>
          <Grid container spacing={2}>
            {heatmapItems.map((item) => (
              <Grid key={item.label} item xs={12} sm={6} md={3}>
                <Tooltip title={`Pressões — Estoque: ${Math.round(item.stockPressure)} | Validade: ${Math.round(item.expiryPressure)} | Fluxo: ${Math.round(item.flowPressure)}`}>
                  <Box
                    sx={{
                      borderRadius: 2,
                      p: 2,
                      height: "100%",
                      background: riskBackground(item.riskScore),
                      border: "1px solid",
                      borderColor: riskBorder(item.riskScore),
                    }}
                  >
                    <Typography fontWeight={600} textTransform="capitalize">
                      {item.label.replace(/_/g, " ")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      risco {item.riskScore}%
                    </Typography>
                    <Stack spacing={0.5} mt={1}>
                      <Typography variant="body2">
                        Estoque: {item.qty} un
                      </Typography>
                      <Typography variant="body2">
                        Validade: {item.expiryInfo?.label || "Sem dados"}
                      </Typography>
                    </Stack>
                  </Box>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}
