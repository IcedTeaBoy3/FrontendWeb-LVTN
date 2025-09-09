import axiosInstance from '@/config/axiosInstance';
export const DoctorService = {
    getAllDoctors: async () => {
        const response = await axiosInstance.get('/doctor/get-all-doctors');
        return response.data;
    },
    getDoctor: async (id) => {
        const response = await axiosInstance.get(`/doctor/get-doctor/${id}`);
        return response.data;
    },
    createDoctor: async (doctorData) => {
        const response = await axiosInstance.post('/doctor/create-doctor', doctorData);
        return response.data;
    },
    updateDoctor: async (id, doctorData) => {
        const response = await axiosInstance.put(`/doctor/update-doctor/${id}`, doctorData);
        return response.data;
    },
    deleteDoctor: async (id) => {
        const response = await axiosInstance.delete(`/doctor/delete-doctor/${id}`);
        return response.data;
    },
    deleteManyDoctors: async (ids) => {
        const response = await axiosInstance.post('/doctor/delete-many-doctors', { ids });
        return response.data;
    }
}
