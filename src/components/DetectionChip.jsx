import React, { forwardRef } from "react";
import { Chip, Stack, Button } from "@mui/material";

const DetectionChip = forwardRef(function DetectionChip({ label, confidencePercent, onCorrect }, ref) {
  if (!label) return null;
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip
        label={`${label} (${confidencePercent ?? 0}%)`}
        color="primary"
        sx={{ fontWeight: 600 }}
      />
      <Button variant="outlined" size="small" onClick={onCorrect} ref={ref}>
        Corrigir
      </Button>
    </Stack>
  );
});

export default DetectionChip;
