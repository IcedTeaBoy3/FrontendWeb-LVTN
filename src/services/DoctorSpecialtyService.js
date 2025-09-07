import axiosInstance from '@/config/axiosInstance';
export const DoctorSpecialtyService = {
    getSpecialtiesByDoctor: async (doctorId) => {
        const response = await axiosInstance.get(`/doctorspecialty/get-specialties-by-doctor/${doctorId}`);
        return response.data;
    },
    getDoctorsBySpecialty: async (specialtyId) => {
        const response = await axiosInstance.get(`/doctorspecialty/get-doctors-by-specialty/${specialtyId}`);
        return response.data;
    },
    assignDoctorToSpecialty: async (data) => {
        const response = await axiosInstance.post('/doctorspecialty/create-doctorspecialty', data);
        return response.data;
    },
    removeDoctorFromSpecialty: async (id) => {
        const response = await axiosInstance.delete(`/doctorspecialty/delete-doctorspecialty/${id}`);
        return response.data;
    },
    updateDoctorSpecialty: async (id, data) => {
        const response = await axiosInstance.put(`/doctorspecialty/update-doctorspecialty/${id}`, data);
        return response.data;
    }
};