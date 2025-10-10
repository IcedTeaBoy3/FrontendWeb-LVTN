import axiosInstance from '@/config/axiosInstance';

export const AccountService = {
    getAllAccounts: async ({page, limit}) => {
        try {
            const response = await axiosInstance.get('/account/get-all-accounts', { params: { page, limit } });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    getAccountById: async (id) => {
        try {
            const response = await axiosInstance.get(`/account/get-account-by-id/${id}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    updateAccount: async (id, accountData) => {
        try {
            const response = await axiosInstance.put(`/account/update-account/${id}`, accountData);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    deleteAccount: async (id) => {
        try {
            const response = await axiosInstance.delete(`/account/delete-account/${id}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    deleteManyAccounts: async (ids) => {
        try {
            const response = await axiosInstance.post('/account/delete-many-accounts', { ids });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    blockAccount: async (id) => {
        try {
            const response = await axiosInstance.put(`/account/block-account/${id}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
    unblockAccount: async (id) => {
        try {
            const response = await axiosInstance.put(`/account/unblock-account/${id}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    },
};