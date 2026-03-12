import api from './api';

const adminSoilTestService = {
    getAll: async () => {
        const response = await api.get('/admin/soil-tests');
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/admin/soil-tests/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/admin/soil-tests/${id}`);
        return response.data;
    }
};

export default adminSoilTestService;
