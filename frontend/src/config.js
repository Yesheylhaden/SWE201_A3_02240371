// Replace with your actual backend URL
// For iOS Simulator: http://localhost:5001
// For Android Emulator: http://10.0.2.2:5001
// For Physical Device: http://YOUR_COMPUTER_IP:5001

export const API_BASE_URL = 'http://10.2.24.150:5001'; // actual IP

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
  },
  BOOKS: {
    LIST: '/api/books',
    DETAIL: (id) => `/api/books/${id}`,
    CREATE: '/api/books',
    UPDATE: (id) => `/api/books/${id}`,
    DELETE: (id) => `/api/books/${id}`,
  },
  CATEGORIES: {
    LIST: '/api/categories',
    CREATE: '/api/categories',
    UPDATE: (id) => `/api/categories/${id}`,
    DELETE: (id) => `/api/categories/${id}`,
  },
};