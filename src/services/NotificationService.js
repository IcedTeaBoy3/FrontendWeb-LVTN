import axiosInstance from '@/config/axiosInstance';

export const NotificationService = {
    getAllNotifications: async () => {
        const response = await axiosInstance.get('/notification/get-all-notifications');
        return response.data;
    },
    markAllAsRead: async () => {
        const response = await axiosInstance.put('/notification/mark-all-as-read');
        return response.data;
    },
    clearAllNotifications: async () => {
        const response = await axiosInstance.delete('/notification/clear-all-notifications');
        return response.data;
    }
}