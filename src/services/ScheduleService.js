import axiosInstance from '@/config/axiosInstance';

export const ScheduleService = {
    getAllSchedules: async () => {
        const response = await axiosInstance.get('/schedule/get-all-schedules');
        return response.data;
    },
    getSchedulesByDoctor: async (doctorId) => {
        const response = await axiosInstance.get(`/schedule/get-schedules-by-doctor/${doctorId}`);
        return response.data;
    },
    getSchedule: async (id) => {
        const response = await axiosInstance.get(`/schedule/get-schedule/${id}`);
        return response.data;
    },
    createSchedule: async (data) => {
        const response = await axiosInstance.post('/schedule/create-schedule', data);
        return response.data;
    },
    updateSchedule: async (id, data) => {
        const response = await axiosInstance.put(`/schedule/update-schedule/${id}`, data);
        return response.data;
    },
    deleteSchedule: async (id) => {
        const response = await axiosInstance.delete(`/schedule/delete-schedule/${id}`);
        return response.data;
    },
    deleteManySchedules: async (ids) => {
        const response = await axiosInstance.post('/schedule/delete-many-schedules', { ids });
        return response.data;
    }
}