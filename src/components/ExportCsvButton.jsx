import React, { useState } from "react";
import { Button, Tooltip, CircularProgress } from "@mui/material";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { saveAs } from "file-saver";
import { useAppState } from "../state/AppStateContext";
import { buildHistoryCsv, buildCsvFileName } from "../utils/csv";

export default function ExportCsvButton() {
  const { history, itemMap, itemBatches } = useAppState();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const csv = buildHistoryCsv({ history, itemsMap: itemMap, itemBatches });
      const file = new Blob([csv], { type: "text/csv;charset=utf-8" });
      saveAs(file, buildCsvFileName());
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title="Exportar CSV completo">
      <span>
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={16} /> : <SaveAltIcon />}
          onClick={handleExport}
          disabled={loading}
          size="small"
        >
          Exportar CSV
        </Button>
      </span>
    </Tooltip>
  );
}
