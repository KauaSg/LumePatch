import React from "react";
import { Box, Typography, LinearProgress, Button, Stack, Chip } from "@mui/material";

function confidenceColor(confidence = 0) {
  if (confidence >= 0.85) return "success";
  if (confidence >= 0.6) return "warning";
  return "error";
}

const KEYBOARD_HINT = "Atalhos: +, −, c, e";

export default function CameraOverlay({ label, confidence, onCorrect }) {
  const percent = Math.round(Math.max(0, Math.min(1, confidence || 0)) * 100);
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 2,
        color: "common.white",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Chip
          label={KEYBOARD_HINT}
          color="default"
          variant="filled"
          sx={{
            backgroundColor: (theme) => theme.palette.grey[900],
            color: (theme) => theme.palette.common.white,
            fontWeight: 500,
            pointerEvents: "auto",
          }}
        />
        <Chip
          label={`Confiança: ${percent}%`}
          color={confidenceColor(confidence)}
          variant="filled"
          sx={{ pointerEvents: "auto" }}
        />
      </Stack>

      <Box
        sx={{
          pointerEvents: "auto",
          bgcolor: (theme) => `${theme.palette.common.black}BB`,
          borderRadius: 2,
          p: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {label || "Aguardando detecção..."}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={percent}
          color={confidenceColor(confidence)}
          sx={{ mt: 1, borderRadius: 1, height: 8 }}
        />
        <Button
          onClick={onCorrect}
          variant="contained"
          color="primary"
          size="small"
          sx={{ mt: 2, pointerEvents: "auto" }}
        >
          Corrigir (c)
        </Button>
      </Box>
    </Box>
  );
}
