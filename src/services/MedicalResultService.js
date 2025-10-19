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
};