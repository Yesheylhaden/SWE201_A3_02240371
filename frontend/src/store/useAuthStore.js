import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';  // Fixed import path

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/api/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        set({ 
          user: response.data.user, 
          isAuthenticated: true, 
          loading: false 
        });
        return { success: true };
      } else {
        set({ loading: false });
        return { success: false, message: 'Login failed' };
      }
    } catch (error) {
      console.log('Login error:', error);
      set({ loading: false, error: error.message });
      return { success: false, message: error.message || 'Login failed' };
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/api/auth/register', { username, email, password });
      console.log('Register response:', response.data);
      
      if (response.data.success) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        set({ 
          user: response.data.user, 
          isAuthenticated: true, 
          loading: false 
        });
        return { success: true };
      } else {
        set({ loading: false });
        return { success: false, message: 'Registration failed' };
      }
    } catch (error) {
      console.log('Register error:', error);
      set({ loading: false, error: error.message });
      return { success: false, message: error.message || 'Registration failed' };
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    set({ user: null, isAuthenticated: false, error: null });
  },

  checkAuth: async () => {
    const token = await AsyncStorage.getItem('userToken');
    const userData = await AsyncStorage.getItem('userData');
    if (token && userData) {
      set({ user: JSON.parse(userData), isAuthenticated: true });
    }
  },
}));

export default useAuthStore;