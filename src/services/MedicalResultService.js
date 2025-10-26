import axiosInstance from '@/config/axiosInstance';

export const MedicalResultService = {
    createMedicalResult: async (medicalResultData) => {
        try {
            const response = await axiosInstance.post('/medicalresult/create-medicalresult', medicalResultData);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getMedicalResult: async (medicalResultId) => {
        try {
            const response = await axiosInstance.get(`/medicalresult/get-medicalresult/${medicalResultId}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
};