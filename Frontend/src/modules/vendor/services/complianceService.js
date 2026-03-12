import api from '../../../services/api';

const complianceService = {
    /**
     * Get compliance status
     */
    getStatus: async () => {
        try {
            const response = await api.get('/vendors/compliance/status');
            return response.data;
        } catch (error) {
            console.error('Error fetching compliance status:', error);
            throw error;
        }
    },

    /**
     * Update compliance document
     */
    updateDocument: async (data) => {
        try {
            const response = await api.post('/vendors/compliance/update', data);
            return response.data;
        } catch (error) {
            console.error('Error updating compliance doc:', error);
            throw error;
        }
    }
};

export default complianceService;
