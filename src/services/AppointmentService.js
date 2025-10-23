import axiosInstance from '@/config/axiosInstance';

export const AppointmentService = {
    getAllAppointments: async ({page, limit}) => {
        try {
            const response = await axiosInstance.get('/appointment/get-all-appointments', { params: { page, limit } });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    deleteAppointment: async (appointmentId) => {
        try {
            const response = await axiosInstance.delete(`/appointment/delete-appointment/${appointmentId}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    confirmAppointment: async (appointmentId) => {
        try {
            const response = await axiosInstance.put(`/appointment/confirm-appointment/${appointmentId}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    deleteManyAppointments: async (appointmentIds) => {
        try {
            const response = await axiosInstance.post('/appointment/delete-many-appointments', { appointmentIds });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getDetailAppointment: async (appointmentId) => {
        try {
            const response = await axiosInstance.get(`/appointment/get-detail-appointment/${appointmentId}`);
            return response.data;
        } catch (error) {
            throw error.response.data;

        }
    },
    getDoctorAppointments: async ({accountId ,date ,page = 1, limit = 100}) => {
        try {
            const response = await axiosInstance.get(`/appointment/get-doctor-appointments/${accountId}`, { params: { page, limit, date } });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getDoctorPatients: async (doctorId) => {
        try {
            const response = await axiosInstance.get(`/appointment/doctor/${doctorId}/patients`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getDoctorPatientHistory: async (doctorId, patientProfileId) => {
        try {
            const response = await axiosInstance.get(`/appointment/doctor/${doctorId}/patient-history/${patientProfileId}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
};
