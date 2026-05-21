import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

const { width, height } = Dimensions.get('window');

const BookDetailScreen = ({ navigation, route }) => {
  const { bookId } = route.params;
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    fetchBookDetail();
  }, []);

  const fetchBookDetail = async () => {
    try {
      const response = await api.get(`/api/books/${bookId}`);
      if (response.data.success) {
        setBook(response.data.data);
        // Start animations
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return ['#4CAF50', '#45a049'];
      case 'borrowed': return ['#FF9800', '#fb8c00'];
      case 'reserved': return ['#2196F3', '#1976D2'];
      default: return ['#9E9E9E', '#757575'];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return 'checkmark-circle';
      case 'borrowed': return 'time';
      case 'reserved': return 'bookmark';
      default: return 'help-circle';
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this book: ${book.title} by ${book.author}`,
        title: book.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share');
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

  if (!book) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="book-outline" size={80} color="#ccc" />
        <Text style={styles.errorText}>Book not found</Text>
        <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={getStatusColor(book.status)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Details</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Ionicons name="share-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('BookForm', { bookId: book.id })}
              style={styles.editButton}
            >
              <Ionicons name="create-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Book Icon and Status */}
        <Animated.View style={[styles.bookHero, { opacity: fadeAnim }]}>
          <View style={styles.bookIconContainer}>
            <Ionicons name="book" size={60} color="#fff" />
          </View>
          <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
            <Ionicons name={getStatusIcon(book.status)} size={16} color="#fff" />
            <Text style={styles.statusText}>{book.status}</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Book Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Title and Author */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>by {book.author}</Text>
        </View>

        {/* Quick Info Cards */}
        <View style={styles.quickInfoContainer}>
          {book.publication_year && (
            <View style={styles.quickInfoCard}>
              <Ionicons name="calendar" size={24} color="#4CAF50" />
              <Text style={styles.quickInfoLabel}>Year</Text>
              <Text style={styles.quickInfoValue}>{book.publication_year}</Text>
            </View>
          )}
          {book.isbn && (
            <View style={styles.quickInfoCard}>
              <Ionicons name="barcode" size={24} color="#4CAF50" />
              <Text style={styles.quickInfoLabel}>ISBN</Text>
              <Text style={styles.quickInfoValue}>{book.isbn.slice(-8)}</Text>
            </View>
          )}
          {book.category_name && (
            <View style={styles.quickInfoCard}>
              <Ionicons name="folder" size={24} color="#4CAF50" />
              <Text style={styles.quickInfoLabel}>Category</Text>
              <Text style={styles.quickInfoValue}>{book.category_name}</Text>
            </View>
          )}
        </View>

        {/* Detailed Information */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="information-circle" size={20} color="#4CAF50" /> Detailed Information
          </Text>
          
          {book.publisher && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="business" size={20} color="#7f8c8d" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Publisher</Text>
                <Text style={styles.detailValue}>{book.publisher}</Text>
              </View>
            </View>
          )}

          {book.isbn && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="barcode-outline" size={20} color="#7f8c8d" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>ISBN Number</Text>
                <Text style={styles.detailValue}>{book.isbn}</Text>
              </View>
            </View>
          )}

          {book.publication_year && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="calendar-outline" size={20} color="#7f8c8d" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Publication Year</Text>
                <Text style={styles.detailValue}>{book.publication_year}</Text>
              </View>
            </View>
          )}

          {book.category_name && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="pricetag-outline" size={20} color="#7f8c8d" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{book.category_name}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Description Section */}
        {book.description && (
          <View style={styles.descriptionCard}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="document-text" size={20} color="#4CAF50" /> Description
            </Text>
            <Text style={styles.description}>{book.description}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editActionButton]}
            onPress={() => navigation.navigate('BookForm', { bookId: book.id })}
          >
            <Ionicons name="create" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Edit Book</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteActionButton]}
            onPress={() => {
              Alert.alert(
                'Delete Book',
                `Are you sure you want to delete "${book.title}"?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await api.delete(`/api/books/${book.id}`);
                        Alert.alert('Success', 'Book deleted successfully', [
                          { text: 'OK', onPress: () => navigation.goBack() }
                        ]);
                      } catch (error) {
                        Alert.alert('Error', 'Failed to delete book');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Delete Book</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
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
    fontSize: 14,
  },
  errorText: {
    marginTop: 10,
    color: '#7f8c8d',
    fontSize: 18,
  },
  goBackButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  goBackText: {
    color: '#fff',
    fontSize: 16,
  },
  headerGradient: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  shareButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    marginRight: 8,
  },
  editButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  bookHero: {
    alignItems: 'center',
  },
  bookIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  titleSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    lineHeight: 32,
  },
  author: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  quickInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  quickInfoCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickInfoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 8,
    marginBottom: 4,
  },
  quickInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  detailsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  detailIcon: {
    width: 30,
    marginRight: 10,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  descriptionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  description: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 40,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  editActionButton: {
    backgroundColor: '#4CAF50',
  },
  deleteActionButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookDetailScreen;