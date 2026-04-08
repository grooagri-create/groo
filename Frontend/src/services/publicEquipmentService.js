import api from './api';

/**
 * Public Equipment Service for Farmers
 * Handles browsing machinery and checking availability for rentals.
 */
export const publicEquipmentService = {
  // Get all approved machinery (with city filter)
  getAllEquipment: async (params = {}) => {
    // Construct query params
    const queryParams = new URLSearchParams();
    if (params.cityId) queryParams.append('cityId', params.cityId);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.search) queryParams.append('search', params.search);
    if (params.isFeatured) queryParams.append('isFeatured', params.isFeatured);

    const response = await api.get(`/public/equipment?${queryParams.toString()}`);
    return response.data;
  },

  // Get single equipment details by ID
  getEquipmentById: async (id) => {
    const response = await api.get(`/public/equipment/${id}`);
    return response.data;
  },

  // Check equipment availability for specific date/time
  checkAvailability: async (equipmentId, date, timeSlot) => {
    const response = await api.get(`/public/equipment/${equipmentId}/availability`, {
      params: { date, timeSlot }
    });
    return response.data;
  },

  // Get categories specifically for machinery (e.g. Tractor, Harvester)
  getMachineryCategories: async (cityId) => {
    const params = { type: 'service' }; // Machinery are services in this project
    if (cityId) params.cityId = cityId;
    
    const response = await api.get('/public/categories', { params });
    if (response.data.success && Array.isArray(response.data.categories)) {
      return {
        success: true,
        // Show main categories + any sub-category with isAlwaysMain:true
        data: response.data.categories.filter(c => !c.parentCategory || c.isAlwaysMain)
      };
    }
    return { success: false, data: [] };
  }
};

export default publicEquipmentService;
