import axiosInstance from '@/config/axiosInstance';
export const SpecialtyService = {
    getAllSpecialties: async () => {
        try {
            const response = await axiosInstance.get('/specialty/get-all-specialties');
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    createSpecialty: async (data) => {
        try{
            const response = await axiosInstance.post('/specialty/create-specialty', data);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    updateSpecialty: async (id, data) => {
        try {
            const response = await axiosInstance.put(`/specialty/update-specialty/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    deleteSpecialty: async (id) => {
        try {
            const response = await axiosInstance.delete(`/specialty/delete-specialty/${id}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    deleteManySpecialties: async (specialtyIds) => {
        try {
            const response = await axiosInstance.post('/specialty/delete-many-specialties', {specialtyIds});
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
}