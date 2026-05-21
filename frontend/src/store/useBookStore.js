import { create } from 'zustand';
// ✅ removed unused AsyncStorage import
import bookService from '../services/bookService';
import categoryService from '../services/categoryService';

const useBookStore = create((set, get) => ({
  books: [],
  categories: [],
  loading: false,
  error: null,
  filters: { search: '', status: '', category_id: '' },

  loadBooks: async () => {
    set({ loading: true, error: null });
    const { filters } = get();
    const result = await bookService.getBooks(filters);
    if (result.success) {
      set({ books: result.data, loading: false });
    } else {
      set({ error: result.message, loading: false });
    }
  },

  loadCategories: async () => {
    const result = await categoryService.getCategories();
    if (result.success) {
      set({ categories: result.data });
    }
  },

  addBook: async (bookData) => {
    set({ loading: true, error: null });
    const result = await bookService.createBook(bookData);
    if (result.success) {
      await get().loadBooks();
      set({ loading: false });
      return { success: true, message: result.message };
    } else {
      set({ error: result.message, loading: false });
      return { success: false, message: result.message };
    }
  },

  updateBook: async (id, bookData) => {
    set({ loading: true, error: null });
    const result = await bookService.updateBook(id, bookData);
    if (result.success) {
      await get().loadBooks();
      set({ loading: false });
      return { success: true, message: result.message };
    } else {
      set({ error: result.message, loading: false });
      return { success: false, message: result.message };
    }
  },

  deleteBook: async (id) => {
    set({ loading: true, error: null });
    const result = await bookService.deleteBook(id);
    if (result.success) {
      await get().loadBooks();
      set({ loading: false });
      return { success: true, message: result.message };
    } else {
      set({ error: result.message, loading: false });
      return { success: false, message: result.message };
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().loadBooks();
  },

  clearFilters: () => {
    set({ filters: { search: '', status: '', category_id: '' } });
    get().loadBooks();
  },
}));

export default useBookStore;