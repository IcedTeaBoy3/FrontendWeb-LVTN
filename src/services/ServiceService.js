import axiosInstance from '@/config/axiosInstance';
export const ServiceService = {
    getAllServices: async ({status, page, limit}) => {
        const response = await axiosInstance.get('/service/get-all-services', {
            params: {
                status,
                page,
                limit
            }
        });
        return response.data;
    },
    getService: async (serviceId) => {
        const response = await axiosInstance.get(`/service/get-service/${serviceId}`);
        return response.data;
    },
    getServicesBySpecialty: async (specialtyId) => {
        const response = await axiosInstance.get(`/service/get-services-by-specialty/${specialtyId}`);
        return response.data;
    },
    createService: async (serviceData) => {
        const response = await axiosInstance.post('/service/create-service', serviceData);
        return response.data;
    },
    updateService: async (serviceId, serviceData) => {
        const response = await axiosInstance.put(`/service/update-service/${serviceId}`, serviceData);
        return response.data;
    },
    deleteService: async (serviceId) => {
        const response = await axiosInstance.delete(`/service/delete-service/${serviceId}`);
        return response.data;
    },
    deleteManyServices: async (serviceIds) => {
        const response = await axiosInstance.post('/service/delete-many-services', { ids: serviceIds });
        return response.data;
    }
}