import axiosInstance from '@/config/axiosInstance';
export const PatientService = {
    getAllPatients: async () => {
        try {
            const response = await axiosInstance.get('/user/get-all-users');
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    deletePatient: async (userId) => {
        try {
            const response = await axiosInstance.delete(`/user/delete-user/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    updatePatient: async (userId, data) => {
        try {
            const response = await axiosInstance.put(`/user/update-user/${userId}`, data);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    deleteManyPatients: async (userIds) => {
        try {
            const response = await axiosInstance.post('/user/delete-many-users', { userIds });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
}