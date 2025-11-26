import axiosInstance from '@/config/axiosInstance';

export const ChatDoctorService = {
    getDoctorConversations: async (doctorId) => {
        try {
            const response = await axiosInstance.get(`/chat/get-doctor-conversations/${doctorId}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getMessages: async (conversationId) => {
        try {
            const response = await axiosInstance.get(`/chat/get-messages/${conversationId}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
};