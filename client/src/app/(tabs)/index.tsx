import { useState, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView, TouchableOpacity, Modal, Animated } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useIngredients, useDeleteIngredient } from '@/hooks/query/useIngredients';
import { IngredientCard } from '@/components/ingredients/IngredientCard';
import { SearchBar } from '@/components/ingredients/SearchBar';
import { EditIngredientForm } from '@/components/ingredients/EditIngredientForm';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Ingredient } from '@/types/api';
import { ExpiryAlert } from '@/components/ingredients/ExpiryAlert';

const EXPIRY_THRESHOLD_DAYS = 7;
const STORAGE_TYPES = [
  { label: '전체', value: '' },
  { label: '실온', value: 'ROOM_TEMP' },
  { label: '냉장', value: 'REFRIGERATED' },
  { label: '냉동', value: 'FROZEN' },
];
const CATEGORIES = [
  { label: '전체', value: '전체' },
  { label: '채소', value: '채소' },
  { label: '과일', value: '과일' },
  { label: '육류', value: '육류' },
  { label: '수산물', value: '수산물' },
  { label: '유제품', value: '유제품' },
  { label: '기타', value: '기타' },
];

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [storageOpen, setStorageOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  
  const insets = useSafeAreaInsets();
  
  // 애니메이션 값들
  const storageAnim = useRef(new Animated.Value(0)).current;
  const categoryAnim = useRef(new Animated.Value(0)).current;
  const storageRotateAnim = useRef(new Animated.Value(0)).current;
  const categoryRotateAnim = useRef(new Animated.Value(0)).current;

  const { data, isLoading, error, refetch } = useIngredients();
  const { mutate: deleteMutate } = useDeleteIngredient();
  const ingredients = data || [];

  // 드롭다운 애니메이션 함수들
  const toggleStorageDropdown = () => {
    if (categoryOpen) {
      setCategoryOpen(false);
      Animated.timing(categoryAnim, {
        toValue: 0,
        useNativeDriver: false,
        duration: 250,
      }).start();
      Animated.timing(categoryRotateAnim, {
        toValue: 0,
        useNativeDriver: false,
        duration: 250,
      }).start();
    }
    
    setStorageOpen(!storageOpen);
    Animated.timing(storageAnim, {
      toValue: !storageOpen ? 1 : 0,
      useNativeDriver: false,
      duration: 250,
    }).start();
    Animated.timing(storageRotateAnim, {
      toValue: !storageOpen ? 1 : 0,
      useNativeDriver: false,
      duration: 250,
    }).start();
  };

  const toggleCategoryDropdown = () => {
    if (storageOpen) {
      setStorageOpen(false);
      Animated.timing(storageAnim, {
        toValue: 0,
        useNativeDriver: false,
        duration: 250,
      }).start();
      Animated.timing(storageRotateAnim, {
        toValue: 0,
        useNativeDriver: false,
        duration: 250,
      }).start();
    }
    
    setCategoryOpen(!categoryOpen);
    Animated.timing(categoryAnim, {
      toValue: !categoryOpen ? 1 : 0,
      useNativeDriver: false,
      duration: 250,
    }).start();
    Animated.timing(categoryRotateAnim, {
      toValue: !categoryOpen ? 1 : 0,
      useNativeDriver: false,
      duration: 250,
    }).start();
  };

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
    }).sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
  }, [ingredients, searchQuery, selectedStorage, selectedCategory]);

  const expiringIngredients = useMemo(() => {
    const now = new Date();
    const threshold = new Date();
    threshold.setDate(now.getDate() + EXPIRY_THRESHOLD_DAYS);
    return ingredients.filter(ingredient => {
      if (!ingredient.expiry_date) return false;
      const expiryDate = new Date(ingredient.expiry_date);
      // 유통기한이 threshold(오늘+7일) 이내이거나 이미 지난 재료 모두 포함
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

  const handleSelectAll = () => {
    const allIds = filteredIngredients.map(ingredient => ingredient.id);
    const isAllSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));
    
    if (isAllSelected) {
      // 전체 해제
      setSelectedIds([]);
    } else {
      // 전체 선택
      setSelectedIds(allIds);
    }
  };

  const isAllSelected = filteredIngredients.length > 0 && 
    filteredIngredients.every(ingredient => selectedIds.includes(ingredient.id));

  const handleEdit = (ingredient: Ingredient) => {
    // 현재 ingredients 리스트에서 해당 재료가 여전히 존재하는지 확인
    const existingIngredient = ingredients.find(item => item.id === ingredient.id);
    
    if (!existingIngredient) {
      alert('해당 재료를 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.\n목록을 새로고침합니다.');
      refetch(); // 데이터 새로고침
      return;
    }
    
    // 최신 데이터로 수정 폼 열기
    setEditingIngredient(existingIngredient);
  };

  const handleCloseEdit = () => {
    setEditingIngredient(null);
  };

  const handleRetry = () => {
    console.log('🔄 홈 화면 - 데이터 재시도 요청');
    refetch();
  };

  // 스와이프 삭제 핸들러
  const handleDeleteIngredient = (id: number) => {
    deleteMutate(id);
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
        scrollEnabled={isScrollEnabled}
      >
        <View style={styles.stickyHeader}>
          {/* 타이틀 */}
          <Text style={[styles.title, { fontSize: (styles.title.fontSize ?? 28) * 0.7 }]}>MY ICE-BOX</Text>
          {/* 검색창 */}
          <View style={styles.searchBarWrapper}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={{ height: 8 }} />
          {/* 유통기한 임박 재료 개수 */}
          <Text style={{ marginLeft: 25, fontSize: 14, color: '#666', fontWeight: 'bold', marginBottom: 2 }}>
            임박 {expiringIngredients.length}개
          </Text>
          {/* 유통기한 임박 재료 한 줄 표시 */}
          <ExpiryAlert ingredients={expiringIngredients} />
          {/* 보관방법/카테고리 드롭다운 한 줄 */}
          <View style={styles.rowContainer}>
            <View style={styles.selectBox}>
              <TouchableOpacity onPress={toggleStorageDropdown} style={styles.dropdownButton}>
                <Animated.View style={styles.dropdownContainer}>
                  <Animated.Text style={styles.dropdownText}>
                    {STORAGE_TYPES.find(item => item.value === selectedStorage)?.label || '보관방법'}
                  </Animated.Text>
                  <Animated.View
                    style={{
                      transform: [{
                        rotate: storageRotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '180deg'],
                        }),
                      }],
                    }}
                  >
                    <Ionicons name="chevron-down" size={16} color="#888" />
                  </Animated.View>
                </Animated.View>
              </TouchableOpacity>
              
              {/* 보관방법 드롭다운 목록 */}
              <Animated.View
                style={[
                  styles.dropdownList,
                  {
                    maxHeight: storageAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 200],
                    }),
                    opacity: storageAnim,
                  },
                ]}
              >
                {STORAGE_TYPES.map((item, index) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.dropdownItem,
                      selectedStorage === item.value && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedStorage(item.value);
                      toggleStorageDropdown();
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      selectedStorage === item.value && styles.dropdownItemTextSelected,
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </View>
            
            <View style={styles.selectBox}>
              <TouchableOpacity onPress={toggleCategoryDropdown} style={styles.dropdownButton}>
                <Animated.View style={styles.dropdownContainer}>
                  <Animated.Text style={styles.dropdownText}>
                    {CATEGORIES.find(item => item.value === selectedCategory)?.label || '카테고리'}
                  </Animated.Text>
                  <Animated.View
                    style={{
                      transform: [{
                        rotate: categoryRotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '180deg'],
                        }),
                      }],
                    }}
                  >
                    <Ionicons name="chevron-down" size={16} color="#888" />
                  </Animated.View>
                </Animated.View>
              </TouchableOpacity>
              
              {/* 카테고리 드롭다운 목록 */}
              <Animated.View
                style={[
                  styles.dropdownList,
                  {
                    maxHeight: categoryAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 300],
                    }),
                    opacity: categoryAnim,
                  },
                ]}
              >
                {CATEGORIES.map((item, index) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.dropdownItem,
                      selectedCategory === item.value && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedCategory(item.value);
                      toggleCategoryDropdown();
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      selectedCategory === item.value && styles.dropdownItemTextSelected,
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </View>
          </View>
          <Text style={{ marginLeft: 25, fontSize: 14, color: '#666', fontWeight: 'bold', marginBottom: 2 }}>등록 {filteredIngredients.length}개</Text>
        </View>
        {/* 선택 모드 UI */}
        {isSelectionMode && (
          <View style={styles.selectionToolbar}>
            {/* 왼쪽: 선택 정보 */}
            <View style={styles.selectionInfo}>
              <Text style={styles.selectionCount}>
                {selectedIds.length}개 선택됨
              </Text>
              <Text style={styles.totalCount}>
                / {filteredIngredients.length}개
              </Text>
            </View>
            
            {/* 오른쪽: 버튼들 */}
            <View style={styles.selectionActions}>
              {/* 전체 선택/해제 버튼 */}
              <TouchableOpacity 
                onPress={handleSelectAll}
                style={[styles.actionButton, styles.selectAllButton]}
                disabled={isDeleting || filteredIngredients.length === 0}
              >
                                 <Ionicons 
                   name={isAllSelected ? "checkbox" : "square-outline"} 
                   size={20} 
                   color="#000" 
                 />
                <Text style={styles.selectAllText}>
                  {isAllSelected ? "전체해제" : "전체선택"}
                </Text>
              </TouchableOpacity>
              
              {/* 삭제 버튼 */}
              <TouchableOpacity
                onPress={handleBulkDelete}
                disabled={selectedIds.length === 0 || isDeleting}
                style={[
                  styles.actionButton, 
                  styles.deleteButton,
                  (selectedIds.length === 0 || isDeleting) && styles.disabledButton
                ]}
              >
                <Ionicons name="trash" size={18} color="#ff3b30" />
                <Text style={[
                  styles.deleteText,
                  (selectedIds.length === 0 || isDeleting) && styles.disabledText
                ]}>
                  삭제
                </Text>
                {isDeleting && (
                  <ActivityIndicator size="small" color="#ff3b30" style={{ marginLeft: 4 }} />
                )}
              </TouchableOpacity>
              
              {/* 취소 버튼 */}
              <TouchableOpacity 
                onPress={handleCancelSelection} 
                style={[styles.actionButton, styles.cancelButton]}
                disabled={isDeleting}
              >
                <Ionicons name="close" size={18} color="#666" />
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {/* 식재료 목록 (유통기한 임박순) */}
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
                onDelete={(id) => {
                  // 삭제 요청을 다음 렌더링 사이클로 지연
                  requestAnimationFrame(() => {
                    deleteMutate(id);
                  });
                }}
                onScrollToggle={setIsScrollEnabled}
              />
            )}
            keyExtractor={item => String(item.id)}
            estimatedItemSize={100}
            contentContainerStyle={styles.listContent}
            scrollEnabled={isScrollEnabled}
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
              <ScrollView style={{flexGrow: 0}} contentContainerStyle={{flexGrow: 1}}>
                <EditIngredientForm
                  ingredient={editingIngredient}
                  onClose={handleCloseEdit}
                />
              </ScrollView>
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
    paddingBottom: 8,
  },
  stickyHeader: {
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: 2,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginVertical: 8,
  },
  searchBarWrapper: {
    paddingHorizontal: 6,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
    marginBottom: 2,
    paddingHorizontal: 6,
    marginRight: 25,
    zIndex: 100,
    gap: 8,
  },
  selectBox: {
    width: '25%',
    marginHorizontal: 0,
    minHeight: 44,
    height: 20,
  },
  listContent: {
    paddingHorizontal: 6,
    paddingTop: 2,
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    paddingTop: 20,
  },
  modalContainer: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    maxHeight: '100%',
    width: '100%',
    maxWidth: 320,
    marginTop: 24,
    overflow: 'hidden',
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
  // 선택 모드 툴바 스타일
  selectionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  selectionCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  totalCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 2,
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  selectAllButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#000',
  },
  selectAllText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  deleteText: {
    fontSize: 14,
    color: '#ff3b30',
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
  dropdownButton: {
    height: 35,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  dropdownText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dropdownArrow: {
    marginLeft: 8,
  },
  dropdownList: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#f8f9fa',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
}); 