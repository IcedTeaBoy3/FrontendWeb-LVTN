import axiosInstance from '@/config/axiosInstance';

export const NotificationService = {
    getNotificationsForAdmin: async () => {
        const response = await axiosInstance.get('/notification/get-notifications-admin');
        return response.data;
    },
}