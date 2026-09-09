import api from './api';

const disputeService = {
    // Raise a new dispute
    raiseDispute: (data) => api.post('/disputes', data),

    // Get user's disputes
    getUserDisputes: () => api.get('/disputes'),

    // Get dispute details
    getDisputeById: (id) => api.get(`/disputes/${id}`),
};

export default disputeService;
