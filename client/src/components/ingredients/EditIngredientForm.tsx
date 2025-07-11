import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Pressable, Animated } from 'react-native';
import type { Ingredient } from '@/types/api';
import { useUpdateIngredient, useDeleteIngredient } from '@/hooks/query/useIngredients';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/common/Button';
import { CategorySelector } from '@/components/ingredients/CategorySelector';
import { StorageTypeSelector } from '@/components/ingredients/StorageTypeSelector';
import { ExpiryDatePicker } from '@/components/ingredients/ExpiryDatePicker';

export function EditIngredientForm({ ingredient, onClose }: { ingredient: Ingredient; onClose: () => void }) {
  // 유통기한을 YYYY-MM-DD 형식으로 변환하는 함수
  const formatExpiryDate = (dateString: string | null | undefined) => {
    if (!dateString || dateString === 'null' || dateString === 'undefined') return '';
    try {
      // ISO 문자열에서 날짜 부분만 추출
      const datePart = dateString.split('T')[0];
      // 유효한 날짜 형식인지 확인
      const date = new Date(datePart);
      if (isNaN(date.getTime())) return '';
      return datePart;
    } catch {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    name: ingredient.name || '',
    category: ingredient.category || '기타',
    storage_type: ingredient.storage_type || 'REFRIGERATED',
    quantity: ingredient.quantity || 1,
    expiry_date: formatExpiryDate(ingredient.expiry_date),
    default_expiry_days: ingredient.default_expiry_days || 0,
  });
  
  // 수량 입력을 위한 별도 문자열 상태 (사용자 입력 중에는 자유롭게 입력 가능)
  const [quantityInput, setQuantityInput] = useState(String(ingredient.quantity || 1));
  const { mutate: updateMutate, isPending: isUpdating } = useUpdateIngredient();
  const { mutate: deleteMutate, isPending: isDeleting } = useDeleteIngredient();
  const queryClient = useQueryClient();
  
  // 버튼 프레스 애니메이션을 위한 ref들
  const saveButtonPressAnim = useRef(new Animated.Value(1)).current;
  const closeButtonPressAnim = useRef(new Animated.Value(1)).current;

  const handleSave = () => {
    // 수량 입력값을 숫자로 변환하고 검증
    const parsedQuantity = parseInt(quantityInput.replace(/[^0-9]/g, ''), 10);
    const finalQuantity = isNaN(parsedQuantity) || parsedQuantity < 1 ? 1 : parsedQuantity;
    
    // 데이터 정리 및 검증
    const cleanedData = {
      name: formData.name.trim(),
      category: formData.category,
      storage_type: formData.storage_type,
      quantity: finalQuantity,
      expiry_date: formData.expiry_date || '', // 빈 문자열 유지 또는 원본 값 유지
      default_expiry_days: formData.default_expiry_days || 0, // 0으로 기본값 설정
    };

    // 기본 유효성 검증
    if (!cleanedData.name) {
      alert('재료명을 입력해주세요.');
      return;
    }

    if (finalQuantity < 1) {
      alert('수량은 1 이상이어야 합니다.');
      return;
    }

    // 변경사항이 있는지 확인 (원본 데이터와 비교)
    const originalData = {
      name: ingredient.name || '',
      category: ingredient.category || '기타',
      storage_type: ingredient.storage_type || 'REFRIGERATED',
      quantity: ingredient.quantity || 1,
      expiry_date: formatExpiryDate(ingredient.expiry_date),
      default_expiry_days: ingredient.default_expiry_days || 0,
    };

    const hasChanges = JSON.stringify(cleanedData) !== JSON.stringify(originalData);
    
    if (!hasChanges) {
      console.log('[재료 수정] 변경사항이 없어 API 호출을 생략합니다.');
      onClose(); // 변경사항이 없으면 바로 닫기
      return;
    }

    console.log('[재료 수정 요청] ID:', ingredient.id, 'payload:', cleanedData);
    console.log('[재료 수정 비교] 원본:', originalData, '변경:', cleanedData);
    
    updateMutate({ id: ingredient.id, ingredient: cleanedData }, { 
      onSuccess: onClose,
      onError: (error: any) => {
        console.error('[재료 수정 실패]', error);
        const status = error?.status || error?.response?.status;
        const errorMessage = error?.response?.data?.message || error?.message || '재료 수정에 실패했습니다.';
        
        if (status === 404) {
          alert('해당 재료를 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.\n목록을 새로고침합니다.');
          // 캐시 무효화로 최신 데이터 가져오기
          queryClient.invalidateQueries({ queryKey: ['ingredients'] });
          onClose(); // 모달 닫기
        } else {
          alert(errorMessage);
        }
      }
    });
  };
  const handleDelete = () => {
    deleteMutate(ingredient.id, { onSuccess: onClose });
  };

  // 버튼 프레스 애니메이션 헬퍼 함수들
  const createPressAnimations = (animValue: Animated.Value) => ({
    pressIn: () => {
      Animated.spring(animValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    },
    pressOut: () => {
      Animated.spring(animValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    },
  });

  const saveAnimations = createPressAnimations(saveButtonPressAnim);
  const closeAnimations = createPressAnimations(closeButtonPressAnim);

  return (
    <View style={styles.modalContent}>
      <Text style={styles.title}>재료 수정</Text>
      <View style={styles.form}>
        <Text style={styles.label}>재료명</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
        />
        <Text style={styles.label}>카테고리</Text>
        <CategorySelector
          value={formData.category}
          onChange={category => setFormData(prev => ({ ...prev, category }))}
        />
        <Text style={styles.label}>보관방법</Text>
        <StorageTypeSelector
          value={formData.storage_type}
          onChange={type => setFormData(prev => ({ ...prev, storage_type: type }))}
        />
        <Text style={styles.label}>유통기한</Text>
        <ExpiryDatePicker
          value={formData.expiry_date}
          onChange={date => setFormData(prev => ({ ...prev, expiry_date: date }))}
        />
        <Text style={styles.label}>수량</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={quantityInput}
          onChangeText={text => {
            // 숫자만 허용하되, 사용자가 자유롭게 입력할 수 있도록 함
            const cleanedText = text.replace(/[^0-9]/g, '');
            setQuantityInput(cleanedText);
          }}
          placeholder="1"
          placeholderTextColor="#999"
          onBlur={() => {
            // 포커스를 잃을 때만 최소값 보장 (선택적)
            if (!quantityInput || quantityInput === '0') {
              setQuantityInput('1');
            }
          }}
        />
        <Animated.View
          style={[
            styles.flatButtonContainer,
            {
              transform: [{ scale: saveButtonPressAnim }],
            },
          ]}
        >
          <Pressable
            style={[
              styles.flatButton,
              styles.saveBtn,
              { backgroundColor: '#3498db' }, // 파란색으로 변경
              isUpdating && styles.flatButtonDisabled
            ]}
            onPress={handleSave}
            onPressIn={saveAnimations.pressIn}
            onPressOut={saveAnimations.pressOut}
            disabled={isUpdating}
          >
            <Text style={[styles.flatButtonText, { color: '#fff' }]}>
              {isUpdating ? '저장 중...' : '저장'}
            </Text>
          </Pressable>
        </Animated.View>
        
        <Animated.View
          style={[
            styles.flatButtonContainer,
            {
              transform: [{ scale: closeButtonPressAnim }],
            },
          ]}
        >
          <Pressable
            style={[
              styles.flatButton,
              styles.closeBtn,
              { backgroundColor: '#fff', borderWidth: 1, borderColor: '#666' } // 기존 배경색과 테두리 유지
            ]}
            onPress={onClose}
            onPressIn={closeAnimations.pressIn}
            onPressOut={closeAnimations.pressOut}
          >
            <Text style={[styles.flatButtonText, { color: '#666' }]}>
              닫기
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    minWidth: 320,
    maxWidth: 400,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
    marginLeft: 2,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  saveBtn: {
    marginTop: 12,
  },
  deleteBtn: {
    backgroundColor: '#ff3b30',
    marginBottom: 8,
  },
  closeBtn: {
    marginTop: 4,
  },
  flatButtonContainer: {
    // 애니메이션 컨테이너
  },
  flatButton: {
    paddingVertical: 15,
    paddingHorizontal: 64,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    elevation: 0, // 플랫 디자인은 그림자 없음
    shadowOpacity: 0,
  },
  flatButtonDisabled: {
    opacity: 0.6,
  },
  flatButtonText: {
    fontSize: 14,
    fontWeight: '400',
    textTransform: 'uppercase',
    fontFamily: 'System',
  },
}); 