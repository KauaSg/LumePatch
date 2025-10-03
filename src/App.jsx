import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Container,
  Box
} from "@mui/material";
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import DetectionView from "./pages/DetectionView";
import DashboardView from "./pages/DashboardView";
import AuditView from "./pages/AuditView";
import RetrainQueueView from "./pages/RetrainQueueView";
import BatchDetailView from "./pages/BatchDetailView";
import ExportCsvButton from "./components/ExportCsvButton";
import GuidedTour from "./components/GuidedTour";
import InstallPwaPrompt from "./components/InstallPwaPrompt";
import { AppStateProvider } from "./state/AppStateContext";

const theme = createTheme({
  palette: {
    primary: { main: "#1565c0" },
    secondary: { main: "#42a5f5" },
    success: { main: "#2e7d32" },
    warning: { main: "#f9a825" },
    error: { main: "#d32f2f" },
    background: { default: "#f5f7fb", paper: "#ffffff" },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
});

const NAV_ITEMS = [
  { label: "Detecção", path: "/deteccao" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Auditoria", path: "/auditoria" },
  { label: "Fila de Aprendizado", path: "/fila" },
];

function NavigationTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const current = React.useMemo(() => {
    if (location.pathname.startsWith("/lote/")) return "/deteccao";
    const match = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path));
    return match ? match.path : false;
  }, [location.pathname]);

  const handleChange = (_event, value) => {
    navigate(value);
  };

  return (
    <Tabs
      value={current}
      onChange={handleChange}
      textColor="inherit"
      indicatorColor="secondary"
      variant="scrollable"
      scrollButtons="auto"
    >
      {NAV_ITEMS.map((item) => (
        <Tab key={item.path} value={item.path} label={item.label} />
      ))}
    </Tabs>
  );
}

function BatchDetailRoute() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  if (!batchId) {
    return <Navigate to="/deteccao" replace />;
  }
  return <BatchDetailView batchId={batchId} onBack={() => navigate(-1)} />;
}

function AppShell() {
  return (
    <Box className="app-shell">
      <AppBar position="static" elevation={0} color="primary">
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>LumePatch</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <ExportCsvButton />
        </Toolbar>
        <NavigationTabs />
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 4 }} className="app-shell__content">
        <Routes>
          <Route path="/" element={<Navigate to="/deteccao" replace />} />
          <Route path="/deteccao" element={<DetectionView />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/auditoria" element={<AuditView />} />
          <Route path="/fila" element={<RetrainQueueView />} />
          <Route path="/lote/:batchId" element={<BatchDetailRoute />} />
          <Route path="*" element={<Navigate to="/deteccao" replace />} />
        </Routes>
      </Container>
      <Box sx={{ position: "fixed", bottom: 24, right: 24, width: 320 }}><InstallPwaPrompt /></Box>
      <GuidedTour />
    </Box>
  );
}

export default function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppStateProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppShell />
        </ThemeProvider>
      </AppStateProvider>
    </HashRouter>
  );
}

