import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, TouchableOpacity, Animated, Pressable } from 'react-native';
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


import { Animated as RNAnimated } from 'react-native';


type BulkFormData = Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>;

type BulkModeFormProps = {
  showBulkSettings?: boolean;
  extractedIngredients?: string[];
  onIngredientsUsed?: () => void;
  cameraIngredients?: string[];
  onCameraIngredientsUsed?: () => void;
};

const initialItem: BulkFormData = {
  name: '',
  category: '',
  storage_type: 'ROOM_TEMP',
  default_expiry_days: 7,
  quantity: 1,
  expiry_date: '',
};

export function BulkModeForm({ 
  showBulkSettings = false,
  extractedIngredients,
  onIngredientsUsed,
  cameraIngredients,
  onCameraIngredientsUsed
}: BulkModeFormProps) {
  const [items, setItems] = useState<(BulkFormData & { _key?: string })[]>([{ ...initialItem, _key: String(Date.now()) }]);
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkStorage, setBulkStorage] = useState('');
  const queryClient = useQueryClient();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const cardAnimRefs = useRef<{ [key: string]: RNAnimated.Value }>({});
  
  // 버튼 프레스 효과를 위한 애니메이션
  const buttonPressAnim = useRef(new Animated.Value(1)).current;

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

  // 영수증에서 추출된 재료들을 처리하는 useEffect
  useEffect(() => {
    console.log('BulkModeForm - extractedIngredients 변경:', extractedIngredients);
    if (extractedIngredients && extractedIngredients.length > 0) {
      const newItems = extractedIngredients.map((name) => ({
        ...initialItem,
        name,
        _key: String(Date.now() + Math.random()),
      }));
      
      console.log('BulkModeForm - 새 아이템들 생성:', newItems);
      
      // 기존 빈 아이템 제거하고 새 아이템들 추가
      setItems(prev => {
        const nonEmptyItems = prev.filter(item => item.name.trim());
        const result = [...nonEmptyItems, ...newItems];
        console.log('BulkModeForm - 최종 아이템들:', result);
        return result;
      });
      
      // 사용 완료 콜백 호출
      onIngredientsUsed?.();
      
      Toast.show({
        type: 'success',
        text1: '영수증 재료 추가',
        text2: `${extractedIngredients.length}개의 재료가 추가되었습니다.`,
      });
    }
  }, [extractedIngredients, onIngredientsUsed]);

  // 카메라에서 인식된 재료들을 처리하는 useEffect
  useEffect(() => {
    console.log('BulkModeForm - cameraIngredients 변경:', cameraIngredients);
    if (cameraIngredients && cameraIngredients.length > 0) {
      const newItems = cameraIngredients.map((name) => ({
        ...initialItem,
        name,
        _key: String(Date.now() + Math.random()),
      }));
      
      console.log('BulkModeForm - 카메라 새 아이템들 생성:', newItems);
      
      // 기존 빈 아이템 제거하고 새 아이템들 추가
      setItems(prev => {
        const nonEmptyItems = prev.filter(item => item.name.trim());
        const result = [...nonEmptyItems, ...newItems];
        console.log('BulkModeForm - 카메라 최종 아이템들:', result);
        return result;
      });
      
      // 사용 완료 콜백 호출
      onCameraIngredientsUsed?.();
      
      Toast.show({
        type: 'success',
        text1: '카메라 재료 추가',
        text2: `${cameraIngredients.length}개의 재료가 추가되었습니다.`,
      });
    }
  }, [cameraIngredients, onCameraIngredientsUsed]);

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

  // 버튼 프레스 애니메이션 함수들
  const handlePressIn = () => {
    Animated.spring(buttonPressAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonPressAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
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
            <Animated.View
              style={[
                {
                  transform: [{ scale: buttonPressAnim }],
                },
              ]}
            >
              <Pressable
                style={[
                  styles.flatButton,
                  isPending && styles.flatButtonDisabled
                ]}
                onPress={handleSubmit}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isPending}
              >
                <Text style={styles.flatButtonText}>
                  {isPending ? '추가 중...' : '추가'}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>


      </KeyboardAvoidingView>
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
    backgroundColor: '#bdbdbd',
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
  flatButton: {
    paddingVertical: 15,
    paddingHorizontal: 64,
    marginVertical: 30,
    marginHorizontal: 25,
    backgroundColor: '#3498db', // Picton Blue - 깔끔한 파란색
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    elevation: 0, // 플랫 디자인은 그림자 없음
    shadowOpacity: 0,
  },
  flatButtonDisabled: {
    backgroundColor: '#bdc3c7', // 비활성 상태 색상
  },
  flatButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '400',
    textTransform: 'uppercase',
    fontFamily: 'System', // Segoe UI는 React Native에서 System 폰트로 대체
  },
}); 