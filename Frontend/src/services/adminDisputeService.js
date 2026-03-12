import api from './api';

const adminDisputeService = {
    // Get all disputes
    getDisputes: (params) => api.get('/admin/disputes', { params }),

    // Get single dispute
    getDisputeById: (id) => api.get(`/admin/disputes/${id}`),

    // Resolve dispute
    resolveDispute: (id, data) => api.patch(`/admin/disputes/${id}/resolve`, data),
};

export default adminDisputeService;
