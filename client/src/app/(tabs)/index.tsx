import { useState, useMemo, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useIngredientsQuery, useDeleteIngredientMutation } from '@/hooks/query/useIngredients';
import { IngredientCard } from '@/components/ingredients/IngredientCard';
import { SearchBar } from '@/components/ingredients/SearchBar';
import { ExpiryAlert } from '@/components/ingredients/ExpiryAlert';
import { EditIngredientForm } from '@/components/ingredients/EditIngredientForm';
import { Ionicons } from '@expo/vector-icons';

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
  const [editIngredient, setEditIngredient] = useState<Ingredient | null>(null);
  
  const { data, isLoading } = useIngredientsQuery();
  const { mutate: deleteMutate } = useDeleteIngredientMutation();
  const ingredients = data || [];

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

  // 체크박스 토글
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(_id => _id !== id) : [...prev, id]);
  };
  // 전체 선택/해제
  const handleSelectAll = () => {
    setIsSelectionMode(true);
    setSelectedIds(filteredIngredients.map(i => i.id));
  };
  const allSelected = filteredIngredients.length > 0 && filteredIngredients.every(i => selectedIds.includes(i.id));
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      handleSelectAll();
    }
  };
  // 일괄 삭제
  const handleBulkDelete = async () => {
    await Promise.all(selectedIds.map(id => new Promise<void>((resolve) => {
      deleteMutate(id, { onSuccess: resolve });
    })));
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  const handleLongPress = (id: number) => {
    setIsSelectionMode(true);
    setSelectedIds([id]);
  };
  const handlePress = (id: number) => {
    if (isSelectionMode) {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(_id => _id !== id) : [...prev, id]
      );
    } else {
      // 기존 상세/수정 등 동작 (onEdit 등)
    }
  };
  const handleDragSelect = (id: number) => {
    if (isSelectionMode && !selectedIds.includes(id)) {
      setSelectedIds(prev => [...prev, id]);
    }
  };
  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        stickyHeaderIndices={[0]}
        contentContainerStyle={styles.scrollContent}
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
            <TouchableOpacity onPress={handleCancelSelection} style={{ marginLeft: 12 }}>
              <Ionicons name="close" size={22} color="#888" />
              <Text style={{ marginLeft: 4, fontSize: 15 }}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBulkDelete}
              disabled={selectedIds.length === 0}
              style={{ marginLeft: 16, opacity: selectedIds.length === 0 ? 0.5 : 1 }}
            >
              <Ionicons name="trash" size={20} color="#ff3b30" />
              <Text style={{ color: '#ff3b30', marginLeft: 4, fontSize: 15 }}>선택삭제</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* ... 기존 전체선택/선택삭제 UI는 선택 모드가 아닐 때만 노출 ... */}
        {!isSelectionMode && (
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 }}>
            <TouchableOpacity onPress={toggleSelectAll} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name={allSelected ? 'checkbox' : 'square-outline'} size={22} color={allSelected ? '#007AFF' : '#bbb'} />
              <Text style={{ marginLeft: 6, fontSize: 15 }}>전체선택</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBulkDelete}
              disabled={selectedIds.length === 0}
              style={{ marginLeft: 16, opacity: selectedIds.length === 0 ? 0.5 : 1 }}
            >
              <Ionicons name="trash" size={20} color="#ff3b30" />
              <Text style={{ color: '#ff3b30', marginLeft: 4, fontSize: 15 }}>선택삭제</Text>
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
        renderItem={({ item }) => (
          <IngredientCard
            ingredient={item}
            selected={selectedIds.includes(item.id)}
            selectionMode={isSelectionMode}
            onPress={() => {
              if (isSelectionMode) {
                setSelectedIds(prev =>
                  prev.includes(item.id)
                    ? prev.filter(_id => _id !== item.id)
                    : [...prev, item.id]
                );
              } else {
                setEditIngredient(item);
              }
            }}
            onLongPress={() => handleLongPress(item.id)}
            onEdit={!isSelectionMode ? setEditIngredient : undefined}
          />
        )}
        estimatedItemSize={100}
        contentContainerStyle={styles.listContent}
      />
        )}
      </ScrollView>
      {/* 수정 모달 */}
      <Modal visible={!!editIngredient} animationType="slide" transparent onRequestClose={() => setEditIngredient(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' }}>
          {editIngredient && (
            <EditIngredientForm ingredient={editIngredient} onClose={() => setEditIngredient(null)} />
          )}
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
    paddingTop: 24,
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
}); 