import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { Button } from '@/components/common/Button';
import { BulkIngredientItem } from './BulkIngredientItem';
import { CategorySelector } from '@/components/ingredients/CategorySelector';
import { StorageTypeSelector } from '@/components/ingredients/StorageTypeSelector';
import Toast from 'react-native-toast-message';
import type { Ingredient } from '@/types/api';
import { ExpiryDatePicker } from '@/components/ingredients/ExpiryDatePicker';
import { Swipeable } from 'react-native-gesture-handler';
import { analyzeIngredientImage } from '@/services/api/vision';
import { ReceiptFlow } from '@/components/ingredients/ReceiptFlow';
import { useReceiptStore } from '@/stores/receipt';
import { Animated as RNAnimated } from 'react-native';

type BulkFormData = Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>;

type BulkModeFormProps = {
  showBulkSettings?: boolean;
};

const initialItem: BulkFormData = {
  name: '',
  category: '',
  storage_type: 'ROOM_TEMP',
  default_expiry_days: 7,
  quantity: 1,
  expiry_date: '',
};

export function BulkModeForm({ showBulkSettings = false }: BulkModeFormProps) {
  const [items, setItems] = useState<(BulkFormData & { _key?: string })[]>([{ ...initialItem, _key: String(Date.now()) }]);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkStorage, setBulkStorage] = useState('');
  const [showReceiptFlow, setShowReceiptFlow] = useState(false);
  const queryClient = useQueryClient();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const cardAnimRefs = useRef<{ [key: string]: RNAnimated.Value }>({});

  // 영수증 스토어에서 편집된 아이템들 가져오기
  const { editableItems, resetState } = useReceiptStore();

  // showBulkSettings가 변경될 때 애니메이션 실행
  useEffect(() => {
    if (showBulkSettings) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 120,
        friction: 10,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: -100,
        useNativeDriver: true,
        tension: 120,
        friction: 12,
      }).start();
    }
  }, [showBulkSettings, slideAnim]);

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
      setItems([{ ...initialItem, _key: String(Date.now()) }]);
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
    const newKey = String(Date.now() + Math.random());
    setItems((prev) => [...prev, { ...initialItem, _key: newKey }]);
    cardAnimRefs.current[newKey] = new RNAnimated.Value(0);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => {
      const removed = prev[index]?._key;
      if (removed) delete cardAnimRefs.current[removed];
      return prev.filter((_, i) => i !== index);
    });
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

  // 새 카드 추가 시 애니메이션 실행
  useEffect(() => {
    if (items.length > 0) {
      const last = items[items.length - 1];
      if (last._key && cardAnimRefs.current[last._key]) {
        RNAnimated.timing(cardAnimRefs.current[last._key], {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [items.length]);

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.flexArea, { minHeight: 200 }]}>
          <Animated.View
            style={[
              styles.bulkSettingsContainer,
              {
                transform: [{ translateY: slideAnim }],
                opacity: slideAnim.interpolate({
                  inputRange: [-100, 0],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          >
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
          </Animated.View>
          
          <Animated.View
            style={{
              flex: 1,
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [-100, 0],
                  outputRange: [0, 30], // 일괄 설정의 높이만큼 밀림 (120에서 80으로 줄임)
                  extrapolate: 'clamp',
                })
              }]
            }}
          >
            <DraggableFlatList<BulkFormData & { _key?: string }>
              data={items}
              renderItem={({ item, drag, isActive, index }: any) => {
                const key = item._key || String(index);
                if (!cardAnimRefs.current[key]) cardAnimRefs.current[key] = new RNAnimated.Value(1);
                const anim = cardAnimRefs.current[key];
                return (
                  <RNAnimated.View
                    style={{
                      opacity: anim,
                      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
                      marginBottom: 12,
                    }}
                  >
                    <BulkIngredientItem
                      item={item}
                      index={typeof index === 'number' ? index : items.findIndex(i => i === item)}
                      onUpdate={(data) => {
                        const idx = items.findIndex((i) => i === item);
                        // _key 유지
                        setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...data, _key: it._key } : it));
                      }}
                      onRemove={() => {
                        const idx = items.findIndex((i) => i === item);
                        handleRemoveItem(idx);
                      }}
                      onDrag={drag}
                    />
                  </RNAnimated.View>
                );
              }}
              keyExtractor={(item, index) => item._key || index.toString()}
              onDragEnd={({ data }: { data: (BulkFormData & { _key?: string })[] }) => setItems(data)}
              contentContainerStyle={[styles.list, { flexGrow: 1, minHeight: 200, paddingBottom: 100 }]}
              style={{ minHeight: 200, maxHeight: '100%' }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>추가할 재료가 없습니다. "+" 버튼을 눌러주세요.</Text>
                </View>
              }
              ListFooterComponent={
                <View style={{ marginTop: 0 }}>
                  <View style={styles.addButtonContainer}>
                    <TouchableOpacity
                      style={styles.addItemButton}
                      onPress={handleAddItem}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.addItemButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              }
            />
          </Animated.View>
        </View>
        
        <View style={styles.footerArea}>
          <View style={styles.footer}>
            <Button
              title="추가"
              onPress={handleSubmit}
              disabled={isPending}
              loading={isPending}
              style={[styles.submitButtonFixed, { backgroundColor: '#f0f0f0', borderRadius: 10, borderWidth: 1, borderColor: '#fff' }] as any}
              textStyle={{ color: '#000' }}
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
    borderTopWidth: 0,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
  },
  addButtonContainer: {
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 16,
  },
  addItemButton: {
    width: 48,
    height: 48,
    backgroundColor: '#222',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItemButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
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
  bulkSettingsContainer: {
    overflow: 'hidden',
  },
}); 