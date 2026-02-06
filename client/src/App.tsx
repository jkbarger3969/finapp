import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { theme } from "./theme";
import MainLayout from "./components/Layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import { DepartmentProvider } from "./context/DepartmentContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PageTransition from "./components/PageTransition";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <DepartmentProvider>
                    <MainLayout>
                      <Routes>
                        <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
                        <Route path="/transactions" element={<PageTransition><Transactions /></PageTransition>} />
                        <Route path="/transactions/:departmentId/:fiscalYear" element={<PageTransition><Transactions /></PageTransition>} />
                        <Route path="/budget" element={<PageTransition><Budget /></PageTransition>} />
                        <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
                      </Routes>
                    </MainLayout>
                  </DepartmentProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
