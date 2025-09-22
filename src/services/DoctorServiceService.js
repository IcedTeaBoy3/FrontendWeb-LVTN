import axiosInstance from '@/config/axiosInstance';
export const DoctorServiceService = {
    getDoctorsByService: async (serviceId) => {
        const response = await axiosInstance.get(`/doctorservice/get-doctors-by-service/${serviceId}`);
        return response.data;
    },
    getServicesByDoctor: async (doctorId) => {
        const response = await axiosInstance.get(`/doctorservice/get-services-by-doctor/${doctorId}`);
        return response.data;
    },
    assignDoctorToService: async (data) => {
        const response = await axiosInstance.post('/doctorservice/create-doctorservice', data);
        return response.data;
    },
    removeDoctorFromService: async (id) => {
        const response = await axiosInstance.delete(`/doctorservice/delete-doctorservice/${id}`);
        return response.data;
    },
    updateDoctorService: async (id, data) => {
        const response = await axiosInstance.put(`/doctorservice/update-doctorservice/${id}`, data);
        return response.data;
    }
};