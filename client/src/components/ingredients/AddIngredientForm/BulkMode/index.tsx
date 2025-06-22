import { useState } from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { Button } from '@/components/common/Button';
import { BulkIngredientItem } from './BulkIngredientItem';
import { CategorySelector } from '@/components/ingredients/CategorySelector';
import { StorageTypeSelector } from '@/components/ingredients/StorageTypeSelector';
import Toast from 'react-native-toast-message';
import type { Ingredient } from '@/types/api';
import { ImageRecognitionActions } from '../ImageRecognitionActions';
import { analyzeIngredientImage } from '@/services/api/vision';
import { ReceiptFlow } from '@/components/ingredients/ReceiptFlow';
import { useReceiptStore } from '@/stores/receipt';

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
  const [showReceiptFlow, setShowReceiptFlow] = useState(false);
  const [showBulkSettings, setShowBulkSettings] = useState(false);
  const queryClient = useQueryClient();

  // 영수증 스토어에서 편집된 아이템들 가져오기
  const { editableItems, resetState } = useReceiptStore();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: BulkFormData[]) =>
      Promise.all(data.map((item) => apiClient.post('/ingredients', {
        ...item,
        expiry_date: item.expiry_date || '',
      }))),
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

  const handleImagePicked = async (uri: string) => {
    try {
      const result = await analyzeIngredientImage(uri);
      if (!result.success || !result.data.ingredients || result.data.ingredients.length === 0) {
        Toast.show({ type: 'error', text1: '식재료 인식 실패', text2: result.message || '식재료를 찾을 수 없습니다.' });
        return;
      }
      const names = result.data.ingredients.map((item: any) => item.name);
      if (names.length > 0) {
        setItems(names.map((name: string) => ({ ...initialItem, name })));
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: '이미지 분석 오류', text2: e.message });
    }
  };

  // 영수증 스캔 시작
  const handleReceiptScan = () => {
    setShowReceiptFlow(true);
  };

  // 영수증 스캔 완료 처리
  const handleReceiptComplete = () => {
    // 영수증에서 인식된 재료들을 현재 아이템 목록에 추가
    if (editableItems.length > 0) {
      const newItems = editableItems.map(item => ({
        name: item.name,
        category: bulkCategory || '기타',
        storage_type: (bulkStorage as BulkFormData['storage_type']) || 'REFRIGERATED',
        default_expiry_days: 7,
        quantity: item.quantity,
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }));
      
      setItems(prev => [...prev.filter(item => item.name), ...newItems]);
      
      Toast.show({
        type: 'success',
        text1: '영수증 처리 완료',
        text2: `${newItems.length}개의 재료가 추가되었습니다.`,
      });
    }
    
    setShowReceiptFlow(false);
  };

  // 영수증 스캔 취소
  const handleReceiptCancel = () => {
    setShowReceiptFlow(false);
    resetState();
  };

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ImageRecognitionActions
          onPressReceipt={handleReceiptScan}
          onPressCamera={() => Toast.show({ type: 'info', text1: '카메라 촬영 기능 준비 중' })}
          onImagePicked={handleImagePicked}
          showBulkSettings={showBulkSettings}
          onToggleBulkSettings={() => setShowBulkSettings(!showBulkSettings)}
        />
        <View style={[styles.flexArea, { minHeight: 200 }]}>
          {showBulkSettings && (
            <>
              <View style={styles.bulkSettingRow}>
                <Text style={styles.bulkLabel}>일괄 카테고리</Text>
                <CategorySelector value={bulkCategory} onChange={handleBulkCategory} />
              </View>
              <View style={styles.bulkSettingRow}>
                <Text style={styles.bulkLabel}>일괄 보관방법</Text>
                <StorageTypeSelector value={bulkStorage as any} onChange={handleBulkStorage} />
              </View>
            </>
          )}
          
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
            contentContainerStyle={[styles.list, { flexGrow: 1, minHeight: 200, paddingBottom: 100 }]}
            style={{ minHeight: 200, maxHeight: '100%' }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>추가할 재료가 없습니다. "+" 버튼을 눌러주세요.</Text>
              </View>
            }
            ListFooterComponent={
              <View style={styles.addButtonContainer}>
                <TouchableOpacity
                  style={styles.addItemButton}
                  onPress={handleAddItem}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addItemButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
        
        <View style={styles.footerArea}>
          <View style={styles.footer}>
            <Button
              title="모두 추가"
              onPress={handleSubmit}
              disabled={isPending}
              loading={isPending}
              style={styles.submitButtonFixed}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* 영수증 스캔 플로우 */}
      <ReceiptFlow
        visible={showReceiptFlow}
        onClose={handleReceiptCancel}
        onComplete={handleReceiptComplete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flexArea: {
    flex: 1,
    paddingTop: 72,
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
  footerArea: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
  },
  addButtonContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  addItemButton: {
    width: 48,
    height: 48,
    backgroundColor: '#007AFF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addItemButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 24,
  },
  submitButtonFixed: {
    height: 40,
    paddingHorizontal: 24,
    borderRadius: 20,
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