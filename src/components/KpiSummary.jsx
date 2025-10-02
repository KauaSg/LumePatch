import React from "react";
import { Card, CardContent, Typography, Stack } from "@mui/material";

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `${Math.round(value * 100)}%`;
}

export default function KpiSummary({ autoRate, accuracy, expiringItems }) {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, backgroundColor: (theme) => theme.palette.grey[100] }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: "uppercase", mb: 1 }}>
          Registros automáticos (%) • Acurácia estimada • Validade &lt;30d
        </Typography>
        <Stack direction="row" spacing={4}>
          <Stack>
            <Typography variant="caption" color="text.secondary">Registros automáticos (%)</Typography>
            <Typography variant="h5" color="success.main" sx={{ fontWeight: 700 }}>
              {formatPercent(autoRate)}
            </Typography>
          </Stack>
          <Stack>
            <Typography variant="caption" color="text.secondary">Acurácia estimada</Typography>
            <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>
              {formatPercent(accuracy)}
            </Typography>
          </Stack>
          <Stack>
            <Typography variant="caption" color="text.secondary">Validade &lt;30d</Typography>
            <Typography variant="h5" color="warning.main" sx={{ fontWeight: 700 }}>
              {expiringItems ?? 0}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
