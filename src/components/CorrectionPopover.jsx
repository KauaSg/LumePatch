import React, { useMemo, useState, useEffect } from "react";
import {
  Popover,
  Box,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Button,
  Stack,
  Typography,
} from "@mui/material";

export default function CorrectionPopover({
  anchorEl,
  open,
  onClose,
  onConfirm,
  items,
  initialItemId,
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(initialItemId ?? null);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const base = Array.isArray(items) ? items : [];
    if (!normalizedSearch) return base.slice(0, 10);
    return base.filter((item) =>
      item.name.toLowerCase().includes(normalizedSearch) || item.id.toLowerCase().includes(normalizedSearch)
    );
  }, [items, search]);

  useEffect(() => {
    if (open) {
      setSelected(initialItemId ?? null);
    }
  }, [open, initialItemId]);

  const handleClose = () => {
    setSearch("");
    onClose?.();
  };

  const handleConfirm = () => {
    const item = (items || []).find((entry) => entry.id === selected);
    if (item) {
      onConfirm?.(item);
      setSearch("");
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    >
      <Box sx={{ p: 2, width: 280 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Corrigir para
        </Typography>
        <TextField
          autoFocus
          size="small"
          label="Buscar item"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fullWidth
        />
        <List dense sx={{ maxHeight: 240, overflowY: "auto", mt: 1 }}>
          {filtered.map((item) => (
            <ListItemButton
              key={item.id}
              selected={item.id === selected}
              onClick={() => setSelected(item.id)}
            >
              <ListItemText
                primary={item.name}
                secondary={`Estoque mínimo: ${item.min ?? 0} ${item.unit ?? "un"}`}
              />
            </ListItemButton>
          ))}
        </List>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={!selected}
          >
            Confirmar
          </Button>
        </Stack>
      </Box>
    </Popover>
  );
}
