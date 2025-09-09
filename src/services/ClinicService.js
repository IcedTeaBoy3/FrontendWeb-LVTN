import axiosInstance from '@/config/axiosInstance';

export const ClinicService = {
    getClinic: async () => {
        const response = await axiosInstance.get(`/clinic/get-clinic`);
        return response.data;
    },
    updateClinic: async (clinicData) => {
        const response = await axiosInstance.put(`/clinic/update-clinic`, clinicData);
        return response.data;
    },
}
