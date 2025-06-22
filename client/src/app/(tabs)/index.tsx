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
import DropDownPicker from 'react-native-dropdown-picker';

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
  
  const insets = useSafeAreaInsets();

  const { data, isLoading, error, refetch } = useIngredients();
  const { mutate: deleteMutate } = useDeleteIngredient();
  const ingredients = data || [];

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
          {/* 타이틀 */}
          <Text style={styles.title}>MY ICE-BOX</Text>
          {/* 검색창 */}
          <View style={styles.searchBarWrapper}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={{ height: 8 }} />
          <ExpiryAlert ingredients={expiringIngredients} />
          {/* 보관방법/카테고리 드롭다운 한 줄 */}
          <View style={styles.rowContainer}>
            <View style={styles.selectBox}>
              <DropDownPicker
                open={storageOpen}
                value={selectedStorage}
                items={STORAGE_TYPES}
                setOpen={setStorageOpen}
                setValue={setSelectedStorage}
                setItems={() => {}}
                placeholder="보관방법"
                style={{ height: 35, minHeight: 35 }}
                zIndex={2000}
                listMode="SCROLLVIEW"
              />
            </View>
            <View style={styles.selectBox}>
              <DropDownPicker
                open={categoryOpen}
                value={selectedCategory}
                items={CATEGORIES}
                setOpen={setCategoryOpen}
                setValue={setSelectedCategory}
                setItems={() => {}}
                placeholder="카테고리"
                style={{ height: 35, minHeight: 35 }}
                zIndex={1000}
                listMode="SCROLLVIEW"
              />
            </View>
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
    paddingBottom: 16,
  },
  stickyHeader: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 4,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginVertical: 16,
  },
  searchBarWrapper: {
    paddingHorizontal: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
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
}); 