import axiosInstance from '@/config/axiosInstance';

export const ClinicService = {
    getClinic: async (clinicId) => {
        const response = await axiosInstance.get(`/clinic/get-clinic/${clinicId}`);
        return response.data;
    },
    updateClinic: async (clinicId, clinicData) => {
        const response = await axiosInstance.put(`/clinic/update-clinic/${clinicId}`, clinicData);
        return response.data;
    }
}
