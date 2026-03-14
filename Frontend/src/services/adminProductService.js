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
    },

    // ── Vendor Equipment Approval (plan2.txt Step 4) ──
    // Get all vendor-submitted equipment
    getVendorEquipment: async (approvalStatus = '') => {
        const params = approvalStatus ? { approvalStatus } : {};
        const response = await api.get('/admin/vendor-equipment', { params });
        return response.data;
    },

    // Approve vendor equipment → goes live on farmer app
    approveEquipment: async (id) => {
        const response = await api.post(`/admin/vendor-equipment/${id}/approve`);
        return response.data;
    },

    // Reject vendor equipment with reason
    rejectEquipment: async (id, reason = '') => {
        const response = await api.post(`/admin/vendor-equipment/${id}/reject`, { reason });
        return response.data;
    }
};

export default adminProductService;
