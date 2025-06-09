import { useState, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useIngredientsQuery } from '@/hooks/query/useIngredients';
import { IngredientCard } from '@/components/ingredients/IngredientCard';
import { SearchBar } from '@/components/ingredients/SearchBar';
import { ExpiryAlert } from '@/components/ingredients/ExpiryAlert';

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

  const { data, isLoading } = useIngredientsQuery();
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
        {filteredIngredients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>등록된 식재료가 없습니다.</Text>
          </View>
        ) : (
          <FlashList
            data={filteredIngredients}
            renderItem={({ item }) => (
              <IngredientCard ingredient={item} />
            )}
            estimatedItemSize={100}
            contentContainerStyle={styles.listContent}
          />
        )}
      </ScrollView>
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