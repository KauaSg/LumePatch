import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Chip,
} from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useAppState } from "../state/AppStateContext";

function base64ToUint8Array(base64) {
  const cleaned = base64.replace(/^data:[^;]+;base64,/, "");
  const binary = atob(cleaned);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i);
  }
  return array;
}

export default function RetrainQueueView() {
  const { retrainQueue, itemMap } = useAppState();
  const [filterItemId, setFilterItemId] = useState("all");

  const filtered = useMemo(() => {
    if (filterItemId === "all") return retrainQueue;
    return retrainQueue.filter((entry) => entry.itemId === filterItemId);
  }, [retrainQueue, filterItemId]);

  const handleExport = async () => {
    const zip = new JSZip();
    const manifest = [];

    await Promise.all(
      filtered.map(async (entry, index) => {
        const item = itemMap[entry.itemId];
        if (entry.imageBase64) {
          const folder = zip.folder(entry.itemId ?? "unknown");
          const filename = `${entry.itemId ?? "item"}-${index}.png`;
          folder.file(filename, base64ToUint8Array(entry.imageBase64));
          manifest.push({ ...entry, filename, itemName: item?.name });
        } else {
          manifest.push({ ...entry, itemName: item?.name });
        }
      })
    );

    zip.file(
      "manifest.json",
      JSON.stringify(
        manifest.map((entry) => ({
          id: entry.id,
          itemId: entry.itemId,
          itemName: entry.itemName,
          oldLabel: entry.oldLabel,
          newLabel: entry.newLabel,
          confidence: entry.confidence,
          ts: entry.ts,
          filename: entry.filename ?? null,
        })),
        null,
        2
      )
    );

    const blob = await zip.generateAsync({ type: "blob" });
    const now = new Date().toISOString().replace(/[:]/g, "-");
    saveAs(blob, `retrain_queue_${now}.zip`);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h6" fontWeight={700}>
          Fila de Aprendizado
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Corrija e exporte resultados para re-treino offline.
        </Typography>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
          <TextField
            select
            label="Item"
            size="small"
            value={filterItemId}
            onChange={(event) => setFilterItemId(event.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">Todos os itens</MenuItem>
            {Object.values(itemMap).map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            startIcon={<CloudDownloadIcon />}
            onClick={handleExport}
            disabled={filtered.length === 0}
          >
            Exportar ZIP
          </Button>
          <Chip label={`${filtered.length} itens`} color="primary" variant="outlined" />
        </Stack>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Antiga</TableCell>
              <TableCell>Nova</TableCell>
              <TableCell>Confiança</TableCell>
              <TableCell>Quando</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((entry) => (
              <TableRow key={entry.id} hover>
                <TableCell>{itemMap[entry.itemId]?.name ?? entry.itemId}</TableCell>
                <TableCell>{entry.oldLabel ?? "—"}</TableCell>
                <TableCell>{entry.newLabel ?? "—"}</TableCell>
                <TableCell>{entry.confidence ? `${Math.round(entry.confidence * 100)}%` : "—"}</TableCell>
                <TableCell>{new Date(entry.ts).toLocaleString("pt-BR")}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nenhum item na fila de aprendizado.
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
