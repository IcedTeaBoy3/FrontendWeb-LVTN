import { Routes, Route, BrowserRouter } from "react-router-dom";
import AuthPage from "@/pages/AuthPage/AuthPage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";

// các trang admin
import Dashboard from "@/pages/Dashboard/Dashboard";
import PatientPage from "@/pages/PatientPage/PatientPage";
import SpecialtyPage from "../pages/SpecialtyPage/SpecialtyPage";

import AdminLayout from "@/layouts/AdminLayout/AdminLayout";
const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/">
                    <Route index element={<AuthPage />} />
                </Route>

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="accounts" element={<PatientPage />} />
                    <Route path="specialties" element={<SpecialtyPage />} />
                    <Route index path="dashboard" element={<Dashboard />} />
                </Route>
                {/* Route không khớp */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    )
}
export default AppRoutes;