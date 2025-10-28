import axiosInstance from '@/config/axiosInstance';
export const DashboardService = {
    getAdminOverview: async (filter) => {
        try {
            const response = await axiosInstance.get('/dashboard/admin-overview', {
                params: { filter }
            });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getAdminRevenue: async ({type, start, end, month, year}) => {
        try {
            const response = await axiosInstance.get('/dashboard/admin-revenue', {
                params: {type, start, end, month, year }
            });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getAdminAppointmentStatus: async () => {
        try {
            const response = await axiosInstance.get('/dashboard/admin-appointment-status');
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getAdminAccountVerification: async () => {
        try {
            const response = await axiosInstance.get('/dashboard/admin-account-verification');
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getAdminAppointmentPerDoctor: async () => {
        try {
            const response = await axiosInstance.get('/dashboard/admin-appointment-per-doctor');
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getAdminAppointment: async ({type, start, end, month, year}) => {
        try {
            const response = await axiosInstance.get('/dashboard/admin-appointment', {
                params: { type, start, end, month, year }
            });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getDoctorOverview: async (doctorId,filter) => {
        try {
            const response = await axiosInstance.get(`/dashboard/doctor-overview/${doctorId}`, {
                params: { filter }
            });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getDoctorRevenue: async (doctorId,{type, start, end, month, year}) => {
        try {
            const response = await axiosInstance.get(`/dashboard/doctor-revenue/${doctorId}`, {
                params: {type, start, end, month, year }
            });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getDoctorAppointment: async (doctorId,{type, start, end, month, year}) => {
        try {
            const response = await axiosInstance.get(`/dashboard/doctor-appointment/${doctorId}`, {
                params: { type, start, end, month, year }
            });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getDoctorStatisticPatient: async (doctorId) => {
        try {
            const response = await axiosInstance.get(`/dashboard/doctor-statistic-patient/${doctorId}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getAdminStatisticPatient: async () => {
        try {
            const response = await axiosInstance.get('/dashboard/admin-statistic-patient');
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getAppointmentPerServiceStats: async () => {
        try {
            const response = await axiosInstance.get('/dashboard/appointment-per-service-stats');
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getAdminAverageRating: async () => {
        try {
            const response = await axiosInstance.get('/dashboard/admin-average-rating');
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getAdminSpecialtyPerDoctor: async () => {
        try {
            const response = await axiosInstance.get('/dashboard/admin-specialty-per-doctor');
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
}