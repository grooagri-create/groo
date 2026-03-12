import api from './api';

const soilTestService = {
    request: async (data) => {
        const response = await api.post('/user/soil-test/request', data);
        return response.data;
    },
    getMyRequests: async () => {
        const response = await api.get('/user/soil-test/my-requests');
        return response.data;
    }
};

export default soilTestService;
