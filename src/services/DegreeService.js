import axiosInstance from '@/config/axiosInstance';

export const DegreeService = {
    getAllDegrees: async ({ status, page, limit }) => {
        const response = await axiosInstance.get('/degree/get-all-degrees', {
            params: {
                status,
                page,
                limit
            }
        });
        return response.data;
    },
    createDegree: async (data) => {
        const response = await axiosInstance.post('/degree/create-degree', data);
        return response.data;
    },
    updateDegree: async (id, data) => {
        const response = await axiosInstance.put(`/degree/update-degree/${id}`, data);
        return response.data;
    },
    deleteDegree: async (id) => {
        try {
            const response = await axiosInstance.delete(`/degree/delete-degree/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting degree:", error);
            throw error;
        }
    },
    deleteManyDegrees: async (degreeIds) => {
        const response = await axiosInstance.post('/degree/delete-many-degrees', { degreeIds });
        return response.data;
    }
}