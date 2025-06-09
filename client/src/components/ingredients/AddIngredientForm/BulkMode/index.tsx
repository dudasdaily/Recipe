import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { DraggableFlatList } from 'react-native-draggable-flatlist';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { Button } from '@/components/common/Button';
import { BulkIngredientItem } from './BulkIngredientItem';
import Toast from 'react-native-toast-message';
import type { Ingredient } from '@/types/api';

type BulkFormData = Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>;

const initialItem: BulkFormData = {
  name: '',
  category: '',
  storage_type: 'ROOM_TEMP',
  default_expiry_days: 7,
};

export function BulkModeForm() {
  const [items, setItems] = useState<BulkFormData[]>([initialItem]);
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
    <View style={styles.container}>
      <DraggableFlatList
        data={items}
        renderItem={({ item, index, drag }) => (
          <BulkIngredientItem
            item={item}
            onUpdate={(data) => handleUpdateItem(index, data)}
            onRemove={() => handleRemoveItem(index)}
            onDrag={drag}
          />
        )}
        keyExtractor={(_, index) => index.toString()}
        onDragEnd={({ data }) => setItems(data)}
        contentContainerStyle={styles.list}
      />
      <View style={styles.footer}>
        <Button
          title="항목 추가"
          onPress={handleAddItem}
          variant="secondary"
          style={styles.addButton}
        />
        <Button
          title="재료 추가"
          onPress={handleSubmit}
          disabled={isPending}
          loading={isPending}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  },
  addButton: {
    marginBottom: 8,
  },
}); 