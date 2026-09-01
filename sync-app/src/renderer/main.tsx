import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

import App from "./App";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#7c4dff" },
    background: { default: "#0b0f14", paper: "#121821" },
  },
  shape: { borderRadius: 10 },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
