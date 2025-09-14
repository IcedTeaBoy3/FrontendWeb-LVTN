import axiosInstance from '@/config/axiosInstance';
export const SlotService = {
    getAllSlots: async () => {
        const response = await axiosInstance.get('/slot/get-all-slots');
        return response.data;
    },
    getAllSlotsByShift: async (shiftId) => {
        const response = await axiosInstance.get(`/slot/get-all-slots-by-shift/${shiftId}`);
        return response.data;
    },
}