import axiosInstance from '@/config/axiosInstance';
export const DashboardService = {
    getAdminOverview: async () => {
        try {
            const response = await axiosInstance.get('/dashboard/admin-overview');
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getAdminRevenue: async ({type, start, end, month, year}) => {
        try {
            const response = await axiosInstance.get('/dashboard/admin-revenue', {
                params: {type, start, end, month, year }
            });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
}