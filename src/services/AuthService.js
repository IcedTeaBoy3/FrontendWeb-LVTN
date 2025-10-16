import axiosInstance from '@/config/axiosInstance';
export const AuthService = {
    login: async (data) => {
        try{
            const response = await axiosInstance.post('/auth/login', data);
            return response.data;
        }catch (error){
            throw error.response.data;
        }
    },
    register: async (data) => {
        try{
            const response = await axiosInstance.post('/auth/register', data);
            return response.data;
        }catch (error){
            throw error.response.data;
        }
    },
    refreshToken: async () => {
        try{
            const response = await axiosInstance.post('/auth/refresh-token');
            return response.data;
        }catch (error){
            throw error.response.data;
        }
    },
    logout: async () => {
        try{
            const response = await axiosInstance.post('/auth/logout');
            return response.data;
        }catch (error){
            throw error.response.data;
        }
    },
    changePassword: async ({ currentPassword, newPassword }) => {
        try {
            const response = await axiosInstance.put('/auth/change-password', { currentPassword, newPassword });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
}