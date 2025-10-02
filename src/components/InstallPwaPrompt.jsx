import React, { useEffect, useState } from "react";
import { Alert, Button, Collapse, Stack } from "@mui/material";

export default function InstallPwaPrompt() {
  const [event, setEvent] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(e) {
      e.preventDefault();
      setEvent(e);
      setOpen(true);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  if (!event) return null;

  const handleInstall = async () => {
    event.prompt();
    const result = await event.userChoice;
    if (result.outcome !== "accepted") {
      setOpen(false);
    }
  };

  return (
    <Collapse in={open}>
      <Alert
        severity="info"
        action={
          <Stack direction="row" spacing={1}>
            <Button color="inherit" size="small" onClick={() => setOpen(false)}>
              Agora não
            </Button>
            <Button color="inherit" size="small" onClick={handleInstall}>
              Instalar no laboratório
            </Button>
          </Stack>
        }
        sx={{ borderRadius: 3 }}
      >
        Instale este app para acesso rápido no laboratório.
      </Alert>
    </Collapse>
  );
}
