import api from './api';
import { API_ENDPOINTS } from '../config';  // ✅ was '../constants/config'

class CategoryService {
  async getCategories() {
    try {
      const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
      if (response.data.success) {
        return { success: true, data: response.data.data };
      }
      return { success: false, data: [] };
    } catch (error) {
      return { success: false, message: error.message, data: [] };
    }
  }

  async createCategory(name, description) {
    try {
      const response = await api.post(API_ENDPOINTS.CATEGORIES.CREATE, { name, description });
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message };
      }
      return { success: false, message: 'Failed to create category' };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to create category' };
    }
  }
}

export default new CategoryService();