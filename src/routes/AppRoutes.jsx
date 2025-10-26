import { Routes, Route, BrowserRouter } from "react-router-dom";
import AuthPage from "@/pages/AuthPage/AuthPage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";

// các trang admin
import Dashboard from "@/pages/Dashboard/Dashboard";
import PatientProfilePage from "@/pages/PatientProfilePage/PatientProfilePage";
import SpecialtyPage from "@/pages/SpecialtyPage/SpecialtyPage";
import PositionPage from "@/pages/PositionPage/PositionPage";
import DegreePage from "@/pages/DegreePage/DegreePage";
import WorkplacePage from "@/pages/WorkplacePage/WorkplacePage";
import DoctorPage from "@/pages/DoctorPage/DoctorPage";
import SchedulePage from "@/pages/SchedulePage/SchedulePage";
import ClinicPage from "@/pages/ClinicPage/ClinicPage";
import ServicePage from "@/pages/ServicePage/ServicePage";
import DoctorDetailPage from "@/pages/DoctorDetailPage/DoctorDetailPage";
import ScheduleDetailPage from "@/pages/ScheduleDetailPage/ScheduleDetailPage";
import DetailAppointmentPage from "@/pages/DetailAppointmentPage/DetailAppointmentPage";
import AccountPage from "@/pages/AccountPage/AccountPage";
import AppointmentPage from "@/pages/AppointmentPage/AppointmentPage";
import DoctorDashboard from "@/pages/DoctorDashboard/DoctorDashboard";
import PersonInfo from "@/pages/PersonInfo/PersonInfo";
import UnauthorizedPage from "@/pages/UnauthorizedPage/UnauthorizedPage";
import DoctorSchedulePage from "@/pages/DoctorSchedulePage/DoctorSchedulePage";
import DoctorPatientPage from "@/pages/DoctorPatientPage/DoctorPatientPage";
import DoctorAppointmentPage from "@/pages/DoctorAppointmentPage/DoctorAppointmentPage";
import DoctorAppointmentDate from "@/pages/DoctorAppointmentDate/DoctorAppointmentDate";
import DetailDoctorSchedulePage from "@/pages/DetailDoctorSchedulePage/DetailDoctorSchedulePage";
import DoctorReviewPage from "@/pages/DoctorReviewPage/DoctorReviewPage";
import DoctorInfo from "@/pages/DoctorInfo/DoctorInfo";
import DetailMedicalResultPage from "@/pages/DetailMedicalResultPage/DetailMedicalResultPage";

import AdminLayout from "@/layouts/AdminLayout/AdminLayout";
import DoctorLayout from "@/layouts/DoctorLayout/DoctorLayout";
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
                    <Route path="personinfo" element={<PersonInfo />} />
                    <Route path="services" element={<ServicePage />} />
                    <Route path="clinics" element={<ClinicPage />} />
                    <Route path="accounts" element={<AccountPage />} />
                    <Route path="specialties" element={<SpecialtyPage />} />
                    <Route path="positions" element={<PositionPage />} />
                    <Route path="degrees" element={<DegreePage />} />
                    <Route path="workplaces" element={<WorkplacePage />} />
                    <Route path="doctors" element={<DoctorPage />} />
                    <Route path="patients" element={<PatientProfilePage />} />
                    <Route path="schedules" element={<SchedulePage />} />
                    <Route path="doctors/:id" element={<DoctorDetailPage />} />
                    <Route path="schedules/:id" element={<ScheduleDetailPage />} />
                    <Route path="appointments" element={<AppointmentPage />} />
                    <Route path="appointments/:id" element={<DetailAppointmentPage />} />
                    <Route path="doctorreviews" element={<DoctorReviewPage />} />
                    <Route index path="dashboard" element={<Dashboard />} />
                </Route>

                {/* Route bác sĩ */}
                <Route
                    path="/doctor"
                    element={<ProtectedRoute allowedRoles={["doctor"]}><DoctorLayout /></ProtectedRoute>}
                >
                    <Route path="schedules" element={<DoctorSchedulePage />} />
                    <Route path="schedules/:id" element={<DetailDoctorSchedulePage />} />
                    <Route path="patients" element={<DoctorPatientPage />} />
                    <Route path="appointments" element={<DoctorAppointmentPage />} />
                    <Route path="appointments/date" element={<DoctorAppointmentDate />} />
                    <Route path="patients/:id" element={<DetailMedicalResultPage />} />
                    <Route path="personinfo" element={<PersonInfo />} />
                    <Route path="doctorinfo" element={<DoctorInfo />} />
                    <Route index path="dashboard" element={<DoctorDashboard />} />
                    
                </Route>

                {/* Route không khớp */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    )
}
export default AppRoutes;