import * as React from 'react';
import { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  StyleSheet 
} from 'react-native';
import { useReceiptStore } from '@/stores/receipt';
import { useCreateIngredientsFromReceipt } from '@/hooks/query/useIngredients';
import type { ReceiptItem } from '@/types/api';

type ReceiptResultProps = {
  onSaveComplete?: () => void;
  onCancel?: () => void;
};

export const ReceiptResult = ({ 
  onSaveComplete, 
  onCancel 
}: ReceiptResultProps) => {
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  
  const {
    processedReceipt,
    editableItems,
    selectedItemIds,
    currentStep,
    updateEditableItem,
    removeEditableItem,
    addEditableItem,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    setCurrentStep,
    resetState
  } = useReceiptStore();
  
  const createIngredientsMutation = useCreateIngredientsFromReceipt();

  // 재료로 저장
  const handleSaveAsIngredients = async () => {
    if (editableItems.length === 0) {
      Alert.alert('알림', '저장할 재료가 없습니다.');
      return;
    }

    try {
      setCurrentStep('SAVE');
      
      // ReceiptItem을 Ingredient 형태로 변환
      const ingredients = editableItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        storage_type: 'REFRIGERATED' as const, // 기본값
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후
        category: '기타',
        default_expiry_days: 7,
      }));

      await createIngredientsMutation.mutateAsync(ingredients);
      
      Alert.alert(
        '저장 완료', 
        `${ingredients.length}개의 재료가 성공적으로 저장되었습니다.`,
        [
          {
            text: '확인',
            onPress: () => {
              resetState();
              onSaveComplete?.();
            }
          }
        ]
      );
    } catch (error) {
      console.error('재료 저장 실패:', error);
      Alert.alert('오류', '재료 저장 중 오류가 발생했습니다.');
      setCurrentStep('EDIT');
    }
  };

  // 재료 항목 편집
  const handleEditItem = (item: ReceiptItem, field: keyof ReceiptItem, value: string | number) => {
    updateEditableItem(item.id, { [field]: value });
  };

  // 새 재료 추가
  const handleAddItem = () => {
    const newItem = {
      receiptId: processedReceipt?.id || 0,
      name: '새 재료',
      quantity: 1,
      unit: '개',
      price: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addEditableItem(newItem);
  };

  // 선택된 항목 삭제
  const handleDeleteSelected = () => {
    if (selectedItemIds.length === 0) {
      Alert.alert('알림', '삭제할 항목을 선택해주세요.');
      return;
    }

    Alert.alert(
      '삭제 확인',
      `선택된 ${selectedItemIds.length}개 항목을 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            selectedItemIds.forEach(id => removeEditableItem(id));
            clearSelection();
          }
        }
      ]
    );
  };

  // 취소
  const handleCancel = () => {
    Alert.alert(
      '취소 확인',
      '편집중인 내용이 모두 사라집니다. 계속하시겠습니까?',
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '예',
          onPress: () => {
            resetState();
            onCancel?.();
          }
        }
      ]
    );
  };

  if (!processedReceipt) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>영수증 정보가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 영수증 정보 헤더 */}
      <View style={styles.header}>
        <Text style={styles.storeNameText}>{processedReceipt.storeName}</Text>
        <Text style={styles.dateText}>
          {new Date(processedReceipt.purchaseDate).toLocaleDateString()}
        </Text>
        <Text style={styles.totalText}>
          총 {editableItems.length}개 재료 (₩{processedReceipt.totalAmount?.toLocaleString()})
        </Text>
      </View>

      {/* 재료 목록 */}
      <ScrollView style={styles.itemsList}>
        {editableItems.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => toggleItemSelection(item.id)}
            >
              <Text style={[
                styles.selectButtonText,
                selectedItemIds.includes(item.id) && styles.selectedText
              ]}>
                {selectedItemIds.includes(item.id) ? '✓' : '○'}
              </Text>
            </TouchableOpacity>

            <View style={styles.itemContent}>
              <TextInput
                style={styles.itemName}
                value={item.name}
                onChangeText={(text) => handleEditItem(item, 'name', text)}
                placeholder="재료명"
              />
              
              <View style={styles.itemDetails}>
                <TextInput
                  style={styles.quantityInput}
                  value={item.quantity.toString()}
                  onChangeText={(text) => handleEditItem(item, 'quantity', parseInt(text) || 0)}
                  keyboardType="numeric"
                  placeholder="수량"
                />
                <Text style={styles.unitText}>{item.unit || '개'}</Text>
                <Text style={styles.priceText}>₩{item.price.toLocaleString()}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removeEditableItem(item.id)}
            >
              <Text style={styles.deleteButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* 하단 버튼들 */}
      <View style={styles.bottomActions}>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <Text style={styles.buttonText}>+ 재료 추가</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.deleteButton, selectedItemIds.length === 0 && styles.disabledButton]} 
            onPress={handleDeleteSelected}
            disabled={selectedItemIds.length === 0}
          >
            <Text style={styles.buttonText}>선택 삭제</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.selectAllButton} 
            onPress={selectedItemIds.length === editableItems.length ? clearSelection : selectAllItems}
          >
            <Text style={styles.buttonText}>
              {selectedItemIds.length === editableItems.length ? '선택 해제' : '전체 선택'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.buttonText}>취소</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveButton, createIngredientsMutation.isPending && styles.disabledButton]}
            onPress={handleSaveAsIngredients}
            disabled={createIngredientsMutation.isPending}
          >
            <Text style={styles.buttonText}>
              {createIngredientsMutation.isPending ? '저장 중...' : '재료로 저장'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  storeNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  totalText: {
    fontSize: 16,
    color: '#333',
  },
  itemsList: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectButtonText: {
    fontSize: 18,
    color: '#666',
  },
  selectedText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 60,
    textAlign: 'center',
    marginRight: 8,
  },
  unitText: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  priceText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  deleteButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff4444',
    borderRadius: 15,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomActions: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  selectAllButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  mainButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  cancelButton: {
    backgroundColor: '#666',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.4,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.5,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
}); 