import axiosInstance from '@/config/axiosInstance';

export const ShiftService = {
    getAllShifts: async () => {
        const response = await axiosInstance.get('/shift/get-all-shifts');
        return response.data;
    },
    getShift: async (id) => {
        const response = await axiosInstance.get(`/shift/get-shift/${id}`);
        return response.data;
    },
    createShift: async (data) => {
        const response = await axiosInstance.post('/shift/create-shift', data);
        return response.data;
    },
    updateShift: async (id, data) => {
        const response = await axiosInstance.put(`/shift/update-shift/${id}`, data);
        return response.data;
    },
    deleteShift: async (id) => {
        const response = await axiosInstance.delete(`/shift/delete-shift/${id}`);
        return response.data;
    },
    deleteManyShifts: async (ids) => {
        const response = await axiosInstance.post('/shift/delete-many-shifts', { ids });
        return response.data;
    }
}