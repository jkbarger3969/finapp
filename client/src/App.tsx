import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeModeProvider } from "./context/ThemeModeContext";
import MainLayout from "./components/Layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import Reporting from "./pages/Reporting";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import { DepartmentProvider } from "./context/DepartmentContext";
import { AuthProvider } from "./context/AuthContext";
import { LayoutProvider } from "./context/LayoutContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PageTransition from "./components/PageTransition";

import { SnackbarProvider } from 'notistack';

function App() {
  return (
    <ThemeModeProvider>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <DepartmentProvider>
                      <LayoutProvider>
                        <MainLayout>
                          <Routes>
                            <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
                            <Route path="/transactions" element={<PageTransition><Transactions /></PageTransition>} />
                            <Route path="/transactions/:departmentId/:fiscalYear" element={<PageTransition><Transactions /></PageTransition>} />
                            <Route path="/budget" element={<PageTransition><Budget /></PageTransition>} />
                            <Route path="/reporting" element={<PageTransition><Reporting /></PageTransition>} />
                            <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
                          </Routes>
                        </MainLayout>
                      </LayoutProvider>
                    </DepartmentProvider>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeModeProvider>
  );
}

export default App;
