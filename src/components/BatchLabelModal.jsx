import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Tooltip,
  IconButton,
  Divider,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { QRCodeSVG } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import LabelSheet from "./BatchLabelsSheet";
import { formatDate } from "../utils/date";

export default function BatchLabelModal({ open, onClose, batch, item, batchesForSheet = [] }) {
  const [sheetReady, setSheetReady] = useState(false);
  const printRef = useRef(null);
  const sheetRef = useRef(null);
  const pendingSheetPrint = useRef(false);

  const handlePrintLabel = useReactToPrint({ content: () => printRef.current });
  const handlePrintSheet = useReactToPrint({ content: () => sheetRef.current });

  const expiryLabel = batch?.expiry ? formatDate(batch.expiry) : "Sem validade";

  const sheetData = useMemo(
    () =>
      batchesForSheet.map((entry) => ({
        item,
        batch: entry,
      })),
    [batchesForSheet, item]
  );

  useEffect(() => {
    if (pendingSheetPrint.current && sheetReady) {
      handlePrintSheet();
      pendingSheetPrint.current = false;
    }
  }, [sheetReady, handlePrintSheet]);

  const triggerSheetPrint = () => {
    if (!sheetReady) {
      pendingSheetPrint.current = true;
      setSheetReady(true);
      return;
    }
    handlePrintSheet();
  };

  useEffect(() => {
    if (!open) {
      setSheetReady(false);
      pendingSheetPrint.current = false;
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Etiqueta/QR</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} alignItems="center">
          <Typography variant="subtitle1" fontWeight={700}>
            {item?.name}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack spacing={0.5}>
              <Typography variant="body2">Lote: {batch?.code}</Typography>
              <Typography variant="body2">Validade: {expiryLabel}</Typography>
              <Typography variant="body2">Quantidade: {batch?.qty ?? 0}</Typography>
            </Stack>
            <Tooltip title="Gere uma etiqueta com QR para abrir este lote rapidamente.">
              <IconButton size="large">
                <QRCodeSVG value={`/#/lote/${batch?.id ?? ""}`} size={96} level="M" />
              </IconButton>
            </Tooltip>
          </Stack>
          <Divider flexItem />
          <div
            ref={printRef}
            style={{
              border: "1px solid #ccc",
              borderRadius: 12,
              padding: 16,
              textAlign: "center",
              width: 200,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {item?.name}
            </Typography>
            <Typography variant="caption">Lote: {batch?.code}</Typography>
            <Typography variant="caption">Validade: {expiryLabel}</Typography>
            <div style={{ marginTop: 8 }}>
              <QRCodeSVG value={`/#/lote/${batch?.id ?? ""}`} size={96} level="M" />
            </div>
          </div>
          {sheetReady && (
            <div style={{ display: "none" }}>
              <LabelSheet ref={sheetRef} batches={sheetData} />
            </div>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button startIcon={<PictureAsPdfIcon />} onClick={triggerSheetPrint}>
          Folha 3×8
        </Button>
        <Button startIcon={<PrintIcon />} onClick={handlePrintLabel}>
          Imprimir
        </Button>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
