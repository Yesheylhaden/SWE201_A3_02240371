import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useBookStore from '../store/useBookStore';
import api from '../services/api';

const BookFormScreen = ({ navigation, route }) => {
  const { bookId } = route.params || {};
  const { addBook, updateBook, categories, loadCategories } = useBookStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publication_year: '',
    publisher: '',
    description: '',
    status: 'available',
    category_id: '',
  });

  useEffect(() => {
    loadCategories();
    if (bookId) {
      fetchBook();
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [bookId]);

  const fetchBook = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/books/${bookId}`);
      if (response.data.success) {
        const book = response.data.data;
        setFormData({
          title: book.title,
          author: book.author,
          isbn: book.isbn || '',
          publication_year: book.publication_year ? book.publication_year.toString() : '',
          publisher: book.publisher || '',
          description: book.description || '',
          status: book.status,
          category_id: book.category_id ? book.category_id.toString() : '',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.author.trim()) newErrors.author = 'Author is required';
    if (formData.publication_year) {
      const year = parseInt(formData.publication_year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1000 || year > currentYear) {
        newErrors.publication_year = `Year must be between 1000 and ${currentYear}`;
      }
    }
    if (formData.isbn && formData.isbn.length < 10) {
      newErrors.isbn = 'ISBN must be at least 10 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check the form for errors');
      return;
    }

    const data = {
      ...formData,
      publication_year: formData.publication_year ? parseInt(formData.publication_year) : null,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
    };

    let result;
    if (bookId) {
      result = await updateBook(bookId, data);
    } else {
      result = await addBook(data);
    }

    if (result.success) {
      Alert.alert('Success', result.message, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading book details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {bookId ? 'Edit Book' : 'Add New Book'}
            </Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="book" size={50} color="#fff" />
          </View>
        </LinearGradient>

        {/* Form Content */}
        <Animated.View style={[styles.form, { opacity: fadeAnim }]}>
          {/* Title Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="book-outline" size={16} color="#4CAF50" /> Book Title <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, errors.title && styles.inputError]}>
              <Ionicons name="book" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => updateField('title', text)}
                placeholder="Enter book title"
                placeholderTextColor="#999"
              />
            </View>
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          {/* Author Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="person-outline" size={16} color="#4CAF50" /> Author <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, errors.author && styles.inputError]}>
              <Ionicons name="person" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.author}
                onChangeText={(text) => updateField('author', text)}
                placeholder="Enter author name"
                placeholderTextColor="#999"
              />
            </View>
            {errors.author && <Text style={styles.errorText}>{errors.author}</Text>}
          </View>

          {/* ISBN Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="barcode-outline" size={16} color="#4CAF50" /> ISBN
            </Text>
            <View style={[styles.inputContainer, errors.isbn && styles.inputError]}>
              <Ionicons name="barcode" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.isbn}
                onChangeText={(text) => updateField('isbn', text)}
                placeholder="Enter ISBN (10 or 13 digits)"
                placeholderTextColor="#999"
              />
            </View>
            {errors.isbn && <Text style={styles.errorText}>{errors.isbn}</Text>}
          </View>

          {/* Publication Year and Publisher Row */}
          <View style={styles.row}>
            <View style={[styles.rowItem, { marginRight: 10 }]}>
              <Text style={styles.label}>
                <Ionicons name="calendar-outline" size={16} color="#4CAF50" /> Year
              </Text>
              <View style={[styles.inputContainer, errors.publication_year && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  value={formData.publication_year}
                  onChangeText={(text) => updateField('publication_year', text)}
                  placeholder="YYYY"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
              {errors.publication_year && <Text style={styles.errorText}>{errors.publication_year}</Text>}
            </View>

            <View style={styles.rowItem}>
              <Text style={styles.label}>
                <Ionicons name="business-outline" size={16} color="#4CAF50" /> Publisher
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={formData.publisher}
                  onChangeText={(text) => updateField('publisher', text)}
                  placeholder="Publisher name"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          {/* Category Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="folder-outline" size={16} color="#4CAF50" /> Category
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.category_id}
                style={styles.picker}
                onValueChange={(value) => updateField('category_id', value)}
                dropdownIconColor="#4CAF50"
              >
                <Picker.Item label="📚 Select Category" value="" />
                {categories.map((category) => (
                  <Picker.Item key={category.id} label={category.name} value={category.id.toString()} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Status Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="radio-button-on-outline" size={16} color="#4CAF50" /> Status
            </Text>
            <View style={styles.statusContainer}>
              {['available', 'borrowed', 'reserved'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    formData.status === status && styles.statusOptionActive,
                    status === 'available' && formData.status === status && { backgroundColor: '#4CAF50' },
                    status === 'borrowed' && formData.status === status && { backgroundColor: '#FF9800' },
                    status === 'reserved' && formData.status === status && { backgroundColor: '#2196F3' },
                  ]}
                  onPress={() => updateField('status', status)}
                >
                  <Ionicons
                    name={formData.status === status ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={formData.status === status ? '#fff' : '#666'}
                  />
                  <Text style={[
                    styles.statusText,
                    formData.status === status && styles.statusTextActive
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="document-text-outline" size={16} color="#4CAF50" /> Description
            </Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => updateField('description', text)}
                placeholder="Enter book description..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.9}>
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              <Ionicons name={bookId ? 'create' : 'add-circle'} size={24} color="#fff" />
              <Text style={styles.submitButtonText}>
                {bookId ? 'Update Book' : 'Create Book'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
  },
  headerGradient: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 50,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerIcon: {
    alignItems: 'center',
    marginTop: 10,
  },
  form: {
    marginTop: -20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  inputError: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 5,
    marginLeft: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  rowItem: {
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  statusOptionActive: {
    borderWidth: 0,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusTextActive: {
    color: '#fff',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BookFormScreen;