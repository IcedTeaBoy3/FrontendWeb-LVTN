
import axiosInstance from '@/config/axiosInstance';
export const DoctorReviewService = {
    getAllDoctorReviews: async ({ limit, page }) => {
        const response = await axiosInstance.get('/doctorreview/get-all-doctor-reviews', {
            params: {
                limit,
                page
            }
        });
        return response.data;
    },
    getDoctorReviews: async (doctorId, { limit, page }) => {
        const response = await axiosInstance.get(`/doctorreview/get-doctor-reviews/${doctorId}`, {
            params: {
                limit,
                page
            }
        });
        return response.data;
    },
    deleteDoctorReview: async (reviewId) => {
        const response = await axiosInstance.delete(`/doctorreview/delete-doctor-review/${reviewId}`);
        return response.data;
    },
    toggleDoctorView: async (reviewId) => {
        const response = await axiosInstance.put(`/doctorreview/toggle-doctor-view/${reviewId}`);
        return response.data;
    },
    deleteManyDoctorReviews: async (ids) => {
        const response = await axiosInstance.post('/doctorreview/delete-many-doctor-reviews', { ids });
        return response.data;
    }
};