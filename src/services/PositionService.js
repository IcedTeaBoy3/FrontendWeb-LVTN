import axiosInstance from '@/config/axiosInstance';
export const PositionService = {
    getAllPositions: async ({status, page, limit}) => {
        try {
            const response = await axiosInstance.get('/position/get-all-positions', {
                params: {
                    status,
                    page,
                    limit
                }
            });
            return response.data;
        } catch (error){
            console.error("Error fetching positions:", error);
            throw error;
        }
    },
    createPosition: async (data) => {
        try {
            const response = await axiosInstance.post('/position/create-position', data);
            return response.data;
        } catch (error) {
            console.error("Error creating position:", error);
            throw error;
        }
    },
    updatePosition: async (id, data) => {
        try {
            const response = await axiosInstance.put(`/position/update-position/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("Error updating position:", error);
            throw error;
        }
    },
    deletePosition: async (id) => {
        try {
            const response = await axiosInstance.delete(`/position/delete-position/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting position:", error);
            throw error;
        }
    },
    deleteManyPositions: async (positionIds) => {
        try {
            const response = await axiosInstance.post('/position/delete-many-positions', { positionIds });
            return response.data;
        } catch (error) {
            console.error("Error deleting positions:", error);
            throw error;
        }
    }
}