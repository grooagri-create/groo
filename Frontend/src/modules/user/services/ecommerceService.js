import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ecommerceService = {
  // Get all approved products — Backend: GET /user/ecommerce/marketplace
  getMarketplaceProducts: async () => {
    const token = localStorage.getItem('userAccessToken');
    const response = await axios.get(`${API_BASE_URL}/user/ecommerce/marketplace`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get product details with price break-up — Backend: GET /user/ecommerce/products/:id
  getProductDetails: async (id) => {
    const token = localStorage.getItem('userAccessToken');
    const response = await axios.get(`${API_BASE_URL}/user/ecommerce/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Place initial order — Backend: POST /user/ecommerce/orders
  placeOrder: async (orderData) => {
    const token = localStorage.getItem('userAccessToken');
    const response = await axios.post(`${API_BASE_URL}/user/ecommerce/orders`, orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get all user orders — Backend: GET /user/ecommerce/my-orders
  getMyOrders: async () => {
    const token = localStorage.getItem('userAccessToken');
    const response = await axios.get(`${API_BASE_URL}/user/ecommerce/my-orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get order by id — Backend: GET /user/ecommerce/orders/:id  (not separately defined, use my-orders)
  getOrderById: async (id) => {
    const token = localStorage.getItem('userAccessToken');
    const response = await axios.get(`${API_BASE_URL}/user/ecommerce/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Pay platform fee to confirm order — Backend: POST /user/ecommerce/orders/:id/pay-platform-fee
  payPlatformFee: async (orderId) => {
    const token = localStorage.getItem('userAccessToken');
    const response = await axios.post(`${API_BASE_URL}/user/ecommerce/orders/${orderId}/pay-platform-fee`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default ecommerceService;
