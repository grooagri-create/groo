import api from '../../../services/api';

/**
 * Product Service
 * Manages physical goods like Seeds, Fertilizers, etc.
 */
const productService = {
    /**
     * Get products by category or featured status
     * @param {object} params { categoryId, isFeatured, query }
     */
    getProducts: async (params = {}) => {
        const response = await api.get('/products', { params });
        return response.data;
    },

    /**
     * Get product detail
     * @param {string} id 
     */
    getProductDetails: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    }
};

export default productService;
