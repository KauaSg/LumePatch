import React, { forwardRef } from "react";
import { Box, Typography } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";

const LABELS_PER_ROW = 3;
const LABEL_ROWS = 8;

const LabelSheet = forwardRef(function LabelSheet({ batches = [] }, ref) {
  const filled = [...batches];
  const total = LABELS_PER_ROW * LABEL_ROWS;
  while (filled.length < total) {
    filled.push(null);
  }

  return (
    <Box ref={ref} sx={{ p: 4, backgroundColor: "white", color: "black" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${LABELS_PER_ROW}, 1fr)`,
          gap: 2,
        }}
      >
        {filled.map((entry, index) => (
          <Box
            key={index}
            sx={{
              border: "1px solid #ccc",
              borderRadius: 2,
              p: 1.5,
              minHeight: 120,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            {entry ? (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {entry.item?.name}
                </Typography>
                <Typography variant="caption">Lote: {entry.batch?.code}</Typography>
                <Typography variant="caption">Validade: {entry.batch?.expiry ?? "Sem validade"}</Typography>
                <Box sx={{ mt: 1 }}>
                  <QRCodeSVG
                    value={`/#/lote/${entry.batch?.id ?? ""}`}
                    size={72}
                    level="M"
                  />
                </Box>
              </>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Etiqueta livre
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
});

export default LabelSheet;
