import { Routes, Route, BrowserRouter } from "react-router-dom";
import AuthPage from "@/pages/AuthPage/AuthPage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";

// các trang admin
import Dashboard from "@/pages/Dashboard/Dashboard";
import PatientPage from "@/pages/PatientPage/PatientPage";
import SpecialtyPage from "@/pages/SpecialtyPage/SpecialtyPage";
import PositionPage from "@/pages/PositionPage/PositionPage";
import DegreePage from "@/pages/DegreePage/DegreePage";
import WorkplacePage from "@/pages/WorkplacePage/WorkplacePage";
import DoctorPage from "@/pages/DoctorPage/DoctorPage";
import SchedulePage from "@/pages/SchedulePage/SchedulePage";
import DoctorDetailPage from "@/pages/DoctorDetailPage/DoctorDetailPage";

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
                    <Route path="positions" element={<PositionPage />} />
                    <Route path="degrees" element={<DegreePage />} />
                    <Route path="workplaces" element={<WorkplacePage />} />
                    <Route path="doctors" element={<DoctorPage />} />
                    <Route path="schedules" element={<SchedulePage />} />
                    <Route path="doctors/:id" element={<DoctorDetailPage />} />
                    <Route index path="dashboard" element={<Dashboard />} />
                </Route>
                {/* Route không khớp */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    )
}
export default AppRoutes;