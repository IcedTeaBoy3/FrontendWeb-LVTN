import axiosInstance from '@/config/axiosInstance';

export const WorkplaceService = {
    getAllWorkplaces: async ({status, page, limit}) => {
        const response = await axiosInstance.get('/workplace/get-all-workplaces', {
            params: {
                status,
                page,
                limit
            }
        });
        return response.data;
    },
    createWorkplace: async (data) => {
        const response = await axiosInstance.post('/workplace/create-workplace', data);
        return response.data;
    },
    updateWorkplace: async (id, data) => {
        const response = await axiosInstance.put(`/workplace/update-workplace/${id}`, data);
        return response.data;
    },
    deleteWorkplace: async (id) => {
        try {
            const response = await axiosInstance.delete(`/workplace/delete-workplace/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting workplace:", error);
            throw error;
        }
    },
    deleteManyWorkplaces: async (workplaceIds) => {
        const response = await axiosInstance.post('/workplace/delete-many-workplaces', { workplaceIds });
        return response.data;
    }
}