import { useState, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useIngredients, useDeleteIngredient } from '@/hooks/query/useIngredients';
import { IngredientCard } from '@/components/ingredients/IngredientCard';
import { SearchBar } from '@/components/ingredients/SearchBar';
import { ExpiryAlert } from '@/components/ingredients/ExpiryAlert';
import { EditIngredientForm } from '@/components/ingredients/EditIngredientForm';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Ingredient } from '@/types/api';

const EXPIRY_THRESHOLD_DAYS = 7;
const STORAGE_TYPES = [
  { value: 'ROOM_TEMP', label: '실온' },
  { value: 'REFRIGERATED', label: '냉장' },
  { value: 'FROZEN', label: '냉동' },
];
const CATEGORIES = [
  '전체', '채소', '과일', '육류', '수산물', '유제품', '기타'
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  
  const insets = useSafeAreaInsets();

  const { data, isLoading, error, refetch } = useIngredients();
  const { mutate: deleteMutate } = useDeleteIngredient();
  const ingredients = data || [];

  // 디버깅용 로그
  useEffect(() => {
    console.log('🏠 홈 화면 - 식재료 데이터 상태:', {
      isLoading,
      hasData: !!data,
      dataLength: data?.length || 0,
      hasError: !!error,
      error: error?.message || null,
    });
  }, [data, isLoading, error]);

  const filteredIngredients = useMemo(() => {
    return ingredients.filter(ingredient => {
      const matchName = ingredient.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStorage = selectedStorage ? ingredient.storage_type === selectedStorage : true;
      const matchCategory = selectedCategory === '전체' ? true : ingredient.category === selectedCategory;
      return matchName && matchStorage && matchCategory;
    });
  }, [ingredients, searchQuery, selectedStorage, selectedCategory]);

  const expiringIngredients = useMemo(() => {
    const now = new Date();
    const threshold = new Date();
    threshold.setDate(now.getDate() + EXPIRY_THRESHOLD_DAYS);
    return ingredients.filter(ingredient => {
      const expiryDate = new Date(ingredient.expiry_date);
      return expiryDate <= threshold;
    }).sort((a, b) => 
      new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
    );
  }, [ingredients]);

  const handleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(_id => _id !== id) : [...prev, id]
    );
  };
  const handleLongPress = (id: number) => {
    setIsSelectionMode(true);
    setSelectedIds([id]);
    setIsDeleting(false);
  };
  const handleBulkDelete = async () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
    setIsDeleting(true);
    try {
      await Promise.all(selectedIds.map(id => new Promise<void>((resolve) => {
        deleteMutate(id, { onSuccess: resolve });
      })));
    } finally {
      setIsDeleting(false);
    }
  };
  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
    setIsDeleting(false);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
  };

  const handleCloseEdit = () => {
    setEditingIngredient(null);
  };

  // 재시도 함수
  const handleRetry = () => {
    console.log('🔄 홈 화면 - 데이터 재시도 요청');
    refetch();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>식재료 목록을 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="warning-outline" size={64} color="#ff6b6b" />
        <Text style={styles.errorTitle}>데이터를 불러올 수 없습니다</Text>
        <Text style={styles.errorMessage}>
          {error?.message || '알 수 없는 오류가 발생했습니다'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        stickyHeaderIndices={[0]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 50 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.stickyHeader}>
          <View style={styles.searchBarWrapper}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
          </View>
          <View style={styles.gap8} />
      <ExpiryAlert ingredients={expiringIngredients} />
          <View style={styles.gap8} />
          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {STORAGE_TYPES.map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[styles.filterButton, selectedStorage === type.value && styles.filterButtonSelected]}
                  onPress={() => setSelectedStorage(selectedStorage === type.value ? '' : type.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterButtonText, selectedStorage === type.value && styles.filterButtonTextSelected]}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.categoryButtonSelected,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                  activeOpacity={0.85}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === category && styles.categoryButtonTextSelected,
                  ]}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
        {/* 선택 모드 UI */}
        {isSelectionMode && (
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12, backgroundColor: '#f7f7fa' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>선택됨: {selectedIds.length}개</Text>
            <TouchableOpacity onPress={handleCancelSelection} style={{ marginLeft: 12 }} disabled={isDeleting}>
              <Ionicons name="close" size={22} color="#888" />
              <Text style={{ marginLeft: 4, fontSize: 15 }}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBulkDelete}
              disabled={selectedIds.length === 0 || isDeleting}
              style={{ marginLeft: 16, opacity: selectedIds.length === 0 || isDeleting ? 0.5 : 1, flexDirection: 'row', alignItems: 'center' }}
            >
              <Ionicons name="trash" size={20} color="#ff3b30" />
              <Text style={{ color: '#ff3b30', marginLeft: 4, fontSize: 15 }}>선택삭제</Text>
              {isDeleting && (
                <ActivityIndicator size="small" color="#ff3b30" style={{ marginLeft: 6 }} />
              )}
            </TouchableOpacity>
          </View>
        )}
        {filteredIngredients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>등록된 식재료가 없습니다.</Text>
          </View>
        ) : (
      <FlashList
        data={filteredIngredients}
        extraData={{ isSelectionMode, selectedIds }}
        renderItem={({ item }) => (
          <IngredientCard
            ingredient={item}
            selectionMode={isSelectionMode}
            selected={selectedIds.includes(item.id)}
            onSelect={() => handleSelect(item.id)}
            onLongPress={() => handleLongPress(item.id)}
            onEdit={handleEdit}
          />
        )}
        keyExtractor={item => String(item.id)}
        estimatedItemSize={100}
        contentContainerStyle={styles.listContent}
      />
        )}
      </ScrollView>
      
      {/* 수정 모달 */}
      <Modal
        visible={!!editingIngredient}
        transparent
        animationType="fade"
        onRequestClose={handleCloseEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {editingIngredient && (
              <EditIngredientForm
                ingredient={editingIngredient}
                onClose={handleCloseEdit}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  stickyHeader: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 4,
    zIndex: 10,
  },
  searchBarWrapper: {
    paddingHorizontal: 12,
  },
  gap8: {
    height: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  filterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F4F7',
    marginRight: 8,
    borderWidth: 0,
  },
  filterButtonSelected: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#222',
    fontSize: 13,
  },
  filterButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#F2F4F7',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  categoryButtonSelected: {
    backgroundColor: '#fff',
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryButtonText: {
    color: '#222',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryButtonTextSelected: {
    color: '#007AFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    maxHeight: '80%',
    width: '100%',
    maxWidth: 400,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginTop: 20,
  },
  errorMessage: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 