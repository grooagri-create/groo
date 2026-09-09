import api from './api';

const vendorSoilTestService = {
    getMyRequests: async () => {
        const response = await api.get('/vendors/soil-test/my-requests');
        return response.data;
    },
    updateStatus: async (id, status) => {
        const response = await api.put(`/vendors/soil-test/${id}/status`, { status });
        return response.data;
    },
    uploadReport: async (id, reportUrl) => {
        const response = await api.post(`/vendors/soil-test/${id}/report`, { reportUrl });
        return response.data;
    },
    rejectRequest: async (id, reason) => {
        const response = await api.post(`/vendors/soil-test/${id}/reject`, { reason });
        return response.data;
    }
};

export default vendorSoilTestService;
