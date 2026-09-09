import api from '../../../services/api';

const vendorServiceService = {
    /**
     * Get all services for a vendor
     */
    getVendorServices: async (params = {}) => {
        try {
            const response = await api.get('/vendors/services', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching vendor services:', error);
            throw error;
        }
    }
};

export default vendorServiceService;
