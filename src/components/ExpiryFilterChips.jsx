import React from "react";
import { Stack, Chip } from "@mui/material";
import { useAppDispatch, useAppState, APP_ACTIONS } from "../state/AppStateContext";

const OPTIONS = [
  { id: "all", label: "Tudo" },
  { id: "lt7", label: "<7d" },
  { id: "lt30", label: "<30d" },
  { id: "expired", label: "Vencidos" },
];

export default function ExpiryFilterChips() {
  const { filters } = useAppState();
  const dispatch = useAppDispatch();

  const handleSelect = (option) => {
    dispatch({
      type: APP_ACTIONS.SET_FILTERS,
      payload: {
        ...filters,
        expiry: option.id,
      },
    });
  };

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
      {OPTIONS.map((option) => (
        <Chip
          key={option.id}
          label={`Vence em ${option.label}`}
          clickable
          color={filters.expiry === option.id ? "primary" : "default"}
          onClick={() => handleSelect(option)}
        />
      ))}
    </Stack>
  );
}
