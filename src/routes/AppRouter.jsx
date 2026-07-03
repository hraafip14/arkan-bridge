import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../features/auth/LoginPage";
import AppShell from "../components/layout/AppShell";

import DashboardPage from "../features/dashboard/DashboardPage";
import DataKelasPage from "../features/classes/DataKelasPage";
import DataGuruPage from "../features/teachers/DataGuruPage";
import DataSiswaPage from "../features/students/DataSiswaPage";
import AturTargetPage from "../features/targets/AturTargetPage";
import SettingsPage from "../features/settings/SettingsPage";

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <AppShell />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/target" replace />} />
                    {/* <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="kelas" element={<DataKelasPage />} />
                    <Route path="guru" element={<DataGuruPage />} />
                    <Route path="siswa" element={<DataSiswaPage />} /> */}
                    <Route path="target" element={<AturTargetPage />} />

                    <Route
                        path="settings"
                        element={
                            <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                                <SettingsPage />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                <Route
                    path="*"
                    element={<Navigate to="/target" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;