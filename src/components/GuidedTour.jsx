import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppState, APP_ACTIONS } from "../state/AppStateContext";

const STEPS = [
  {
    title: "Detecção/Simulado",
    description: "Acompanhe as detecções automáticas ou ative o modo simulado para demonstrações.",
  },
  {
    title: "Correção 1 clique",
    description: "Use o botão Corrigir para ajustar rapidamente o item detectado e alimentar a fila de aprendizado.",
  },
  {
    title: "FEFO/Validade",
    description: "Consuma e cadastre lotes aplicando First-Expire, First-Out e monitorando a validade.",
  },
  {
    title: "Dashboard/Exportar",
    description: "Acompanhe KPIs, gere CSV completos e acione etiquetas com QR para auditoria.",
  },
];

export default function GuidedTour() {
  const { ui } = useAppState();
  const dispatch = useAppDispatch();
  const [activeStep, setActiveStep] = useState(0);

  const open = !ui.tourDismissed;

  const handleNext = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep((step) => step + 1);
      return;
    }
    dispatch({ type: APP_ACTIONS.SET_UI, payload: { ...ui, tourDismissed: true } });
  };

  const handleClose = () => {
    dispatch({ type: APP_ACTIONS.SET_UI, payload: { ...ui, tourDismissed: true } });
  };

  if (!open) return null;

  const current = STEPS[activeStep];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tour guiado</DialogTitle>
      <DialogContent dividers>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {STEPS.map((step) => (
            <Step key={step.title}>
              <StepLabel>{step.title}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
          {current.title}
        </Typography>
        <Typography variant="body1">{current.description}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Pular</Button>
        <Button onClick={handleNext} variant="contained">
          {activeStep === STEPS.length - 1 ? "Concluir" : "Avançar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
