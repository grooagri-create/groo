import api from './api';

const adminSupportService = {
    // Get all support queries
    getQueries: async (params) => {
        const response = await api.get('/admin/support/all', { params });
        return response.data;
    },

    // Respond to a query
    respondToQuery: async (id, data) => {
        const response = await api.put(`/admin/support/respond/${id}`, data);
        return response.data;
    }
};

export default adminSupportService;
