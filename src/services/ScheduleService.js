import axiosInstance from '@/config/axiosInstance';

export const ScheduleService = {
    getAllSchedules: async ({ page, limit, month, year }) => {
        const response = await axiosInstance.get('/schedule/get-all-schedules', {
            params: { page, limit, month, year }
        });
        return response.data;
    },
    getDoctorSchedules: async ({ month, year }) => {
        const response = await axiosInstance.get(`/schedule/get-doctor-schedule`, {
            params: { month, year }
        });
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
    },
    getSchedulesByDoctor: async (doctorId, month, year) => {
        const response = await axiosInstance.get(`/schedule/get-all-doctor-schedules/${doctorId}`, {
            params: { month, year }
        });
        return response.data;
    }
}