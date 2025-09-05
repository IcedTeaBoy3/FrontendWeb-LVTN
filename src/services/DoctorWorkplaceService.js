import axiosInstance from '@/config/axiosInstance';
export const DoctorWorkplaceService = {
    getWorkplacesByDoctor: async (doctorId) => {
        const response = await axiosInstance.get(`/doctorworkplace/get-workplaces-by-doctor/${doctorId}`);
        return response.data;
    },
    createDoctorWorkplace: async (doctorWorkplaceData) => {
        const response = await axiosInstance.post('/doctorworkplace/create-doctorworkplace', doctorWorkplaceData);
        return response.data;
    },
    deleteDoctorWorkplace: async (id) => {
        const response = await axiosInstance.delete(`/doctorworkplace/delete-doctorworkplace/${id}`);
        return response.data;
    },
    updateDoctorWorkplace: async (id, doctorWorkplaceData) => {
        const response = await axiosInstance.put(`/doctorworkplace/update-doctorworkplace/${id}`, doctorWorkplaceData);
        return response.data;
    }
}