import api from './api';

/**
 * Admin Product Service
 * Handles product management for marketplace
 */
const adminProductService = {
    // Get all products
    getAll: async () => {
        const response = await api.get('/admin/products');
        return response.data;
    },

    // Create new product
    create: async (data) => {
        const response = await api.post('/admin/products', data);
        return response.data;
    },

    // Update product
    update: async (id, data) => {
        const response = await api.put(`/admin/products/${id}`, data);
        return response.data;
    },

    // Delete product
    delete: async (id) => {
        const response = await api.delete(`/admin/products/${id}`);
        return response.data;
    },

    // Toggle featured status
    toggleFeatured: async (id) => {
        const response = await api.patch(`/admin/products/${id}/toggle-featured`);
        return response.data;
    }
};

export default adminProductService;
