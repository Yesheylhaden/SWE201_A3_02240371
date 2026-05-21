import api from './api';
import { API_ENDPOINTS } from '../config';  // ✅ was '../constants/config'

class BookService {
  async getBooks(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const url = params ? `${API_ENDPOINTS.BOOKS.LIST}?${params}` : API_ENDPOINTS.BOOKS.LIST;
      const response = await api.get(url);
      if (response.data.success) {
        return { success: true, data: response.data.data, total: response.data.total };
      }
      return { success: false, data: [] };
    } catch (error) {
      return { success: false, message: error.message, data: [] };
    }
  }

  async getBook(id) {
    try {
      const response = await api.get(API_ENDPOINTS.BOOKS.DETAIL(id));
      if (response.data.success) {
        return { success: true, data: response.data.data };
      }
      return { success: false };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async createBook(bookData) {
    try {
      const response = await api.post(API_ENDPOINTS.BOOKS.CREATE, bookData);
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message };
      }
      return { success: false, message: 'Failed to create book' };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to create book' };
    }
  }

  async updateBook(id, bookData) {
    try {
      const response = await api.put(API_ENDPOINTS.BOOKS.UPDATE(id), bookData);
      if (response.data.success) {
        return { success: true, data: response.data.data, message: response.data.message };
      }
      return { success: false, message: 'Failed to update book' };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to update book' };
    }
  }

  async deleteBook(id) {
    try {
      const response = await api.delete(API_ENDPOINTS.BOOKS.DELETE(id));
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
      return { success: false, message: 'Failed to delete book' };
    } catch (error) {
      return { success: false, message: error.message || 'Failed to delete book' };
    }
  }
}

export default new BookService();