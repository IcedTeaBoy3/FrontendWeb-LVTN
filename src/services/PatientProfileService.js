import axiosInstance from '@/config/axiosInstance';

export const PatientProfileService = {
    getAllPatientProfiles: async () => {
        try {
            const response = await axiosInstance.get('/patientprofile/get-all-patientprofiles');
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    updatePatientProfile: async (patientProfileId, data) => {
        try {
            const response = await axiosInstance.put(`/patientprofile/update-patientprofile/${patientProfileId}`, data);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    deletePatientProfile: async (patientProfileId) => {
        try {
            const response = await axiosInstance.delete(`/patientprofile/delete-patientprofile/${patientProfileId}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    deleteManyPatientProfiles: async (patientProfileIds) => {
        try {
            const response = await axiosInstance.post('/patientprofile/delete-many-patientprofiles', { ids: patientProfileIds });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
}