import api from '../../../services/api';

const maintenanceService = {
    /**
     * Get all maintenance schedules
     */
    getSchedules: async () => {
        try {
            const response = await api.get('/vendors/maintenance');
            return response.data;
        } catch (error) {
            console.error('Error fetching maintenance:', error);
            throw error;
        }
    },

    /**
     * Schedule new maintenance
     */
    addSchedule: async (data) => {
        try {
            const response = await api.post('/vendors/maintenance', data);
            return response.data;
        } catch (error) {
            console.error('Error adding maintenance:', error);
            throw error;
        }
    },

    /**
     * Cancel maintenance
     */
    deleteSchedule: async (id) => {
        try {
            const response = await api.delete(`/vendors/maintenance/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting maintenance:', error);
            throw error;
        }
    }
};

export default maintenanceService;
