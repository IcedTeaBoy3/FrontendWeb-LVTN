import axiosInstance from '@/config/axiosInstance';
export const PaymentService = {
    updatePaymentStatus: async (paymentId, data) => {
        try {
            const response = await axiosInstance.put(`/payment/update-payment-status/${paymentId}`,data);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
}