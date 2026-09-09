import api from './api';

const adminDisputeService = {
    // Get all disputes
    getDisputes: async (params) => {
        const response = await api.get('/admin/disputes', { params });
        return response.data;
    },

    // Get single dispute
    getDisputeById: async (id) => {
        const response = await api.get(`/admin/disputes/${id}`);
        return response.data;
    },

    // Resolve dispute
    resolveDispute: async (id, data) => {
        const response = await api.patch(`/admin/disputes/${id}/resolve`, data);
        return response.data;
    },
};

export default adminDisputeService;
