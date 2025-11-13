import axiosInstance from '@/config/axiosInstance';
export const SliderService = {
    getAllSliders: async ({page, limit, status}) => {
        const response = await axiosInstance.get('/slider/get-all-sliders', {
            params: {
                status,
                page,
                limit
            }
        });
        return response.data;
    },
    createSlider: async (data) => {
        const response = await axiosInstance.post('/slider/create-slider', data);
        return response.data;
    },
    updateSlider: async (id, data) => {
        const response = await axiosInstance.put(`/slider/update-slider/${id}`, data);
        return response.data;
    },
    deleteSlider: async (id) => {
        const response = await axiosInstance.delete(`/slider/delete-slider/${id}`);
        return response.data;
    },
    deleteManySliders: async (ids) => {
        const response = await axiosInstance.post('/slider/delete-many-sliders', { ids });
        return response.data;
    }
};