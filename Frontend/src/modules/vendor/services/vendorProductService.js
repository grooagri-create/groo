import api from '../../../services/api';

/**
 * Vendor Product Service
 * Handles vendor's own product inventory
 */
const vendorProductService = {
    // Get vendor's own products
    getMyProducts: async () => {
        const response = await api.get('/vendors/store/my-products');
        return response.data;
    },

    // Add product to store
    add: async (data) => {
        const response = await api.post('/vendors/store/add-product', data);
        return response.data;
    },

    // Alias for add (used in MyStore component)
    addProduct: async (data) => {
        const response = await api.post('/vendors/store/add-product', data);
        return response.data;
    },

    // Update product
    update: async (id, data) => {
        const response = await api.put(`/vendors/store/update-product/${id}`, data);
        return response.data;
    },

    // Alias for update (used in MyStore component)
    updateProduct: async (id, data) => {
        const response = await api.put(`/vendors/store/update-product/${id}`, data);
        return response.data;
    },

    // Delete product
    delete: async (id) => {
        const response = await api.delete(`/vendors/store/delete-product/${id}`);
        return response.data;
    },

    // Alias for delete (used in MyStore component)
    deleteProduct: async (id) => {
        const response = await api.delete(`/vendors/store/delete-product/${id}`);
        return response.data;
    },

    // Get Shop Registration Status
    getShopStatus: async () => {
        const response = await api.get('/vendors/shop/status');
        return response.data;
    },

    // Get vendor's shop orders (used in Orders.jsx)
    getMyOrders: async () => {
        const response = await api.get('/vendors/store/orders');
        return response.data;
    },

    // Update order delivery status (used in Orders.jsx)
    updateOrderStatus: async (orderId, data) => {
        const response = await api.patch(`/vendors/store/orders/${orderId}/status`, data);
        return response.data;
    }
};

export default vendorProductService;
