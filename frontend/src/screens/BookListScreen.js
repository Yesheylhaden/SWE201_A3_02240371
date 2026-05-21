import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Animated,
  Dimensions,
  Share,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import useBookStore from '../store/useBookStore';
import useAuthStore from '../store/useAuthStore';
import { useDebounce } from '../hooks/useDebounce';

const { width, height } = Dimensions.get('window');

const BookListScreen = ({ navigation }) => {
  const { books, loading, filters, loadBooks, loadCategories, categories, deleteBook, setFilters, clearFilters } = useBookStore();
  const { logout } = useAuthStore();
  const [searchText, setSearchText] = useState(filters.search);
  const debouncedSearch = useDebounce(searchText, 500);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showStats, setShowStats] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadBooks();
    loadCategories();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  const getSortedBooks = () => {
    let sorted = [...books];
    sorted.sort((a, b) => {
      let aVal = a[sortBy] || '';
      let bVal = b[sortBy] || '';
      if (sortBy === 'publication_year') {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    return sorted;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBooks();
    setRefreshing(false);
  };

  const handleDelete = (id, title) => {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteBook(id);
            if (result.success) {
              Alert.alert('Success', result.message);
              if (selectedBooks.includes(id)) {
                setSelectedBooks(selectedBooks.filter(bid => bid !== id));
              }
            } else {
              Alert.alert('Error', result.message);
            }
          },
        },
      ]
    );
  };

  const handleBulkDelete = () => {
    if (selectedBooks.length === 0) return;
    
    Alert.alert(
      'Bulk Delete',
      `Are you sure you want to delete ${selectedBooks.length} book(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            let successCount = 0;
            for (const id of selectedBooks) {
              const result = await deleteBook(id);
              if (result.success) successCount++;
            }
            Alert.alert('Success', `Deleted ${successCount} of ${selectedBooks.length} books`);
            setSelectedBooks([]);
            setIsSelectionMode(false);
          },
        },
      ]
    );
  };

  const handleShareBook = async (book) => {
    try {
      await Share.share({
        message: `📚 Check out "${book.title}" by ${book.author}\nStatus: ${book.status}\nISBN: ${book.isbn || 'N/A'}`,
        title: book.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share');
    }
  };

  const toggleBookSelection = (id) => {
    if (selectedBooks.includes(id)) {
      setSelectedBooks(selectedBooks.filter(bid => bid !== id));
    } else {
      setSelectedBooks([...selectedBooks, id]);
    }
  };

  const handleLongPress = (id) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedBooks([id]);
    } else {
      toggleBookSelection(id);
    }
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedBooks([]);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => logout() },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#4CAF50';
      case 'borrowed': return '#FF9800';
      case 'reserved': return '#2196F3';
      default: return '#9E9E9E';
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

  const getTotalBooks = () => books.length;
  const getAvailableBooks = () => books.filter(b => b.status === 'available').length;
  const getBorrowedBooks = () => books.filter(b => b.status === 'borrowed').length;
  const getReservedBooks = () => books.filter(b => b.status === 'reserved').length;

  const renderBook = ({ item }) => (
    <Animated.View style={{ 
      opacity: fadeAnim, 
      transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] })}],
      marginHorizontal: 20,
      marginBottom: 12,
    }}>
      <TouchableOpacity
        style={[
          styles.bookCard,
          isSelectionMode && selectedBooks.includes(item.id) && styles.selectedCard
        ]}
        onPress={() => {
          if (isSelectionMode) {
            toggleBookSelection(item.id);
          } else {
            navigation.navigate('BookDetail', { bookId: item.id });
          }
        }}
        onLongPress={() => handleLongPress(item.id)}
        activeOpacity={0.9}
        delayLongPress={300}
      >
        <View style={styles.bookCardContent}>
          {isSelectionMode && (
            <View style={styles.checkboxContainer}>
              <Ionicons 
                name={selectedBooks.includes(item.id) ? 'checkbox' : 'square-outline'} 
                size={24} 
                color={selectedBooks.includes(item.id) ? '#4CAF50' : '#999'} 
              />
            </View>
          )}
          <View style={[styles.bookIconContainer, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Ionicons name="book" size={30} color={getStatusColor(item.status)} />
          </View>
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.bookAuthor}>by {item.author}</Text>
            <View style={styles.bookMeta}>
              {item.category_name && (
                <View style={styles.categoryBadge}>
                  <Ionicons name="folder" size={10} color="#666" />
                  <Text style={styles.categoryText}>{item.category_name}</Text>
                </View>
              )}
              <View style={[styles.statusBadgeSmall, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Ionicons name={getStatusIcon(item.status)} size={10} color={getStatusColor(item.status)} />
                <Text style={[styles.statusTextSmall, { color: getStatusColor(item.status) }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => handleShareBook(item)}
              style={styles.shareButton}
            >
              <Ionicons name="share-outline" size={20} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('BookForm', { bookId: item.id })}
              style={styles.editButton}
            >
              <Ionicons name="create-outline" size={20} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item.id, item.title)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Selection Mode Header */}
      {isSelectionMode && (
        <View style={styles.selectionHeader}>
          <View style={styles.selectionHeaderContent}>
            <TouchableOpacity onPress={exitSelectionMode}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.selectionText}>{selectedBooks.length} selected</Text>
            {selectedBooks.length > 0 && (
              <TouchableOpacity onPress={handleBulkDelete}>
                <Ionicons name="trash-outline" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Header with Green Background */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📚 My Library</Text>
          <Text style={styles.headerSubtitle}>{getTotalBooks()} books in collection</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Toggle */}
      <TouchableOpacity style={styles.statsToggle} onPress={() => setShowStats(!showStats)}>
        <Text style={styles.statsToggleText}>
          {showStats ? '▼ Hide Statistics' : '▶ Show Statistics'}
        </Text>
      </TouchableOpacity>

      {/* Stats Cards */}
      {showStats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="book" size={22} color="#4CAF50" />
            <Text style={styles.statNumber}>{getTotalBooks()}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{getAvailableBooks()}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={22} color="#FF9800" />
            <Text style={[styles.statNumber, { color: '#FF9800' }]}>{getBorrowedBooks()}</Text>
            <Text style={styles.statLabel}>Borrowed</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="bookmark" size={22} color="#2196F3" />
            <Text style={[styles.statNumber, { color: '#2196F3' }]}>{getReservedBooks()}</Text>
            <Text style={styles.statLabel}>Reserved</Text>
          </View>
        </View>
      )}

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText !== '' && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.iconButton} onPress={() => setShowSortModal(true)}>
          <Ionicons name="funnel-outline" size={22} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton} onPress={() => setShowFilters(true)}>
          <Ionicons name="options-outline" size={22} color="#666" />
          {(filters.status !== '' || filters.category_id !== '') && <View style={styles.activeFilterDot} />}
        </TouchableOpacity>
      </View>

      {/* Sort Modal */}
      <Modal visible={showSortModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSortModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort Books</Text>
            {['title', 'author', 'publication_year'].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.sortOption}
                onPress={() => {
                  setSortBy(option);
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  setShowSortModal(false);
                }}
              >
                <Text style={styles.sortOptionText}>
                  {option === 'title' ? 'Title' : option === 'author' ? 'Author' : 'Year'}
                </Text>
                {sortBy === option && (
                  <Ionicons name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} size={18} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Filters Modal */}
      <Modal visible={showFilters} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilters(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Books</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.statusFilterContainer}>
                {['', 'available', 'borrowed', 'reserved'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusFilterChip,
                      filters.status === status && styles.statusFilterChipActive,
                    ]}
                    onPress={() => setFilters({ status })}
                  >
                    <Text style={[
                      styles.statusFilterChipText,
                      filters.status === status && styles.statusFilterChipTextActive,
                    ]}>
                      {status === '' ? 'All' : status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Category</Text>
              <Picker
                selectedValue={filters.category_id}
                style={styles.pickerModal}
                onValueChange={(value) => setFilters({ category_id: value })}
              >
                <Picker.Item label="All Categories" value="" />
                {categories.map((category) => (
                  <Picker.Item key={category.id} label={category.name} value={category.id} />
                ))}
              </Picker>
            </View>

            {(filters.status !== '' || filters.category_id !== '' || filters.search !== '') && (
              <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersButton}>
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.clearFiltersText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('BookForm')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Book List */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading your library...</Text>
        </View>
      ) : (
        <FlatList
          data={getSortedBooks()}
          renderItem={renderBook}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={80} color="#ddd" />
              <Text style={styles.emptyText}>No books found</Text>
              <Text style={styles.emptySubText}>Tap the + button to add your first book</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  selectionHeader: {
    backgroundColor: '#4CAF50',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  selectionHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#2E7D32', // Green header color
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff', // White text
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)', // Semi-transparent white
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  statsToggle: {
    alignSelf: 'center',
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  statsToggleText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#7f8c8d',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 15,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  iconButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    position: 'relative',
  },
  activeFilterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  statusFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  statusFilterChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  statusFilterChipText: {
    fontSize: 14,
    color: '#666',
  },
  statusFilterChipTextActive: {
    color: '#fff',
  },
  pickerModal: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    gap: 8,
  },
  clearFiltersText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 999,
  },
  list: {
    paddingBottom: 100,
  },
  bookCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: '#e8f5e9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  bookCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  checkboxContainer: {
    marginRight: 10,
  },
  bookIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 10,
    color: '#666',
  },
  statusBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusTextSmall: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareButton: {
    padding: 6,
  },
  editButton: {
    padding: 6,
  },
  deleteButton: {
    padding: 6,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 8,
  },
});

export default BookListScreen;