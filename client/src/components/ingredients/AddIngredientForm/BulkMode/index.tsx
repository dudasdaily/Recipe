import { useState } from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { Button } from '@/components/common/Button';
import { BulkIngredientItem } from './BulkIngredientItem';
import { CategorySelector } from '@/components/ingredients/CategorySelector';
import { StorageTypeSelector } from '@/components/ingredients/StorageTypeSelector';
import Toast from 'react-native-toast-message';
import type { Ingredient } from '@/types/api';

type BulkFormData = Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>;

const initialItem: BulkFormData = {
  name: '',
  category: '',
  storage_type: 'ROOM_TEMP',
  default_expiry_days: 7,
  quantity: 1,
  expiry_date: '',
};

export function BulkModeForm() {
  const [items, setItems] = useState<BulkFormData[]>([initialItem]);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkStorage, setBulkStorage] = useState('');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: BulkFormData[]) =>
      Promise.all(data.map((item) => apiClient.post('/ingredients', item))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      Toast.show({
        type: 'success',
        text1: '재료 추가 완료',
        text2: '재료가 성공적으로 추가되었습니다.',
      });
      setItems([initialItem]);
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: '재료 추가 실패',
        text2: error.message,
      });
    },
  });

  const handleAddItem = () => {
    setItems((prev) => [...prev, { ...initialItem }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, data: Partial<BulkFormData>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...data } : item))
    );
  };

  const handleBulkCategory = (category: string) => {
    setBulkCategory(category);
    setItems((prev) => prev.map((item) => ({ ...item, category })));
  };

  const handleBulkStorage = (storage: string) => {
    setBulkStorage(storage);
    setItems((prev) => prev.map((item) => ({ ...item, storage_type: storage as BulkFormData['storage_type'] })));
  };

  const handleSubmit = () => {
    const validItems = items.filter((item) => item.name && item.category);
    if (validItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: '입력 오류',
        text2: '최소 하나의 재료를 입력해주세요.',
      });
      return;
    }
    mutate(validItems);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.bulkSettingRow}>
        <Text style={styles.bulkLabel}>일괄 카테고리</Text>
        <CategorySelector value={bulkCategory} onChange={handleBulkCategory} />
      </View>
      <View style={styles.bulkSettingRow}>
        <Text style={styles.bulkLabel}>일괄 보관방법</Text>
        <StorageTypeSelector value={bulkStorage as any} onChange={handleBulkStorage} />
      </View>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>추가할 재료가 없습니다. "항목 추가" 버튼을 눌러주세요.</Text>
        </View>
      ) : (
        <DraggableFlatList<BulkFormData>
          data={items}
          renderItem={({ item, drag, isActive }: RenderItemParams<BulkFormData>) => (
            <BulkIngredientItem
              item={item}
              onUpdate={(data) => {
                const idx = items.findIndex((i) => i === item);
                handleUpdateItem(idx, data);
              }}
              onRemove={() => {
                const idx = items.findIndex((i) => i === item);
                handleRemoveItem(idx);
              }}
              onDrag={drag}
            />
          )}
          keyExtractor={(_item: BulkFormData, index: number) => index.toString()}
          onDragEnd={({ data }: { data: BulkFormData[] }) => setItems(data)}
          contentContainerStyle={styles.list}
        />
      )}
      <View style={styles.footer}>
        <Button
          title="항목 추가"
          onPress={handleAddItem}
          variant="secondary"
          style={styles.addButton}
        />
        <Button
          title="모두 추가"
          onPress={handleSubmit}
          disabled={isPending}
          loading={isPending}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bulkSettingRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  bulkLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    marginLeft: 2,
    fontWeight: '500',
  },
  list: {
    padding: 16,
    gap: 16,
  },
  footer: {
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  addButton: {
    marginBottom: 8,
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