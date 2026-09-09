import api from './api';

const vendorProductService = {
    // Inventory Management
    getMyProducts: async () => {
        const response = await api.get('/vendors/store/my-products');
        return response.data;
    },

    addProduct: async (data) => {
        const response = await api.post('/vendors/store/add-product', data);
        return response.data;
    },

    updateProduct: async (id, data) => {
        const response = await api.put(`/vendors/store/update-product/${id}`, data);
        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await api.delete(`/vendors/store/delete-product/${id}`);
        return response.data;
    },

    // Shop Order Management
    getMyOrders: async () => {
        const response = await api.get('/vendors/store/orders');
        return response.data;
    },

    updateOrderStatus: async (id, data) => {
        // data: { status, trackingNumber, courierName }
        const response = await api.patch(`/vendors/store/orders/${id}/status`, data);
        return response.data;
    }
};

export default vendorProductService;
