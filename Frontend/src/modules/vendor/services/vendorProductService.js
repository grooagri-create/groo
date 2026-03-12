import api from '../../services/api';

/**
 * Vendor Product Service
 * Handles vendor's own product inventory
 */
const vendorProductService = {
    // Get vendor's own products
    getMyStore: async () => {
        const response = await api.get('/vendors/store/my-products');
        return response.data;
    },

    // Add product to store
    add: async (data) => {
        const response = await api.post('/vendors/store/add-product', data);
        return response.data;
    },

    // Update product
    update: async (id, data) => {
        const response = await api.put(`/vendors/store/update-product/${id}`, data);
        return response.data;
    },

    // Delete product
    delete: async (id) => {
        const response = await api.delete(`/vendors/store/delete-product/${id}`);
        return response.data;
    }
};

export default vendorProductService;
