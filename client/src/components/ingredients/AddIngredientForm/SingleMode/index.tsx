import { useState } from 'react';
import { View, TextInput, StyleSheet, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateIngredientMutation } from '@/hooks/query/useIngredients';
import { StorageTypeSelector } from '@/components/ingredients/StorageTypeSelector';
import { CategorySelector } from '@/components/ingredients/CategorySelector';
import { Button } from '@/components/common/Button';
import Toast from 'react-native-toast-message';
import type { Ingredient } from '@/types/api';
import { ImageRecognitionActions } from '../ImageRecognitionActions';
import { ExpiryDatePicker } from '@/components/ingredients/ExpiryDatePicker';
import { analyzeIngredientImage } from '@/services/api/vision';

type FormData = Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>;

const initialFormData: FormData = {
  name: '',
  category: '',
  storage_type: 'ROOM_TEMP',
  default_expiry_days: 7,
  quantity: 1,
  expiry_date: '',
};

export function SingleModeForm({ onSwitchToBulkMode }: { onSwitchToBulkMode?: (names: string[]) => void }) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const queryClient = useQueryClient();
  const { mutate, isPending } = useCreateIngredientMutation();

  const handleSubmit = () => {
    if (!formData.name || !formData.category) {
      Toast.show({
        type: 'error',
        text1: '입력 오류',
        text2: '재료명과 카테고리를 입력해주세요.',
      });
      return;
    }
    // expiry_date가 undefined, null, '' 모두 허용
    const payload = {
      ...formData,
      expiry_date: formData.expiry_date || '',
    };
    mutate(payload, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: '재료 추가 완료',
          text2: '재료가 성공적으로 추가되었습니다.',
        });
        setFormData(initialFormData);
      },
      onError: (error: any) => {
        Toast.show({
          type: 'error',
          text1: '재료 추가 실패',
          text2: error?.message || '오류가 발생했습니다.',
        });
      },
    });
  };

  // 이미지 인식 결과 처리
  const handleImagePicked = async (uri: string) => {
    try {
      const result = await analyzeIngredientImage(uri);
      if (!result.success || !result.data.ingredients || result.data.ingredients.length === 0) {
        Toast.show({ type: 'error', text1: '식재료 인식 실패', text2: result.message || '식재료를 찾을 수 없습니다.' });
        return;
      }
      const names = result.data.ingredients.map((item: any) => item.name);
      if (names.length === 1) {
        setFormData((prev) => ({ ...prev, name: names[0] }));
      } else if (names.length > 1) {
        Alert.alert(
          '여러 재료가 인식되었습니다',
          `다중 모드로 전환하여 모두 추가하거나, 첫 번째 재료만 추가할 수 있습니다.\n\n[${names.join(', ')}]`,
          [
            { text: '첫 번째만 추가', onPress: () => setFormData((prev) => ({ ...prev, name: names[0] })) },
            { text: '다중 모드로 전환', onPress: () => onSwitchToBulkMode?.(names) },
            { text: '취소', style: 'cancel' },
          ]
        );
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: '이미지 분석 오류', text2: e.message });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ImageRecognitionActions
        mode="SINGLE"
        onPressReceipt={() => Toast.show({ type: 'info', text1: '다중 모드에서만 사용 가능합니다.' })}
        onPressCamera={() => Toast.show({ type: 'info', text1: '카메라 촬영 기능 준비 중' })}
        onImagePicked={handleImagePicked}
      />
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="재료명"
          value={formData.name}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
        />
        <View>
          <Text style={styles.label}>카테고리</Text>
          <CategorySelector
            value={formData.category}
            onChange={(category) => setFormData((prev) => ({ ...prev, category }))}
            style={{ marginBottom: 4 }}
          />
        </View>
        <StorageTypeSelector
          value={formData.storage_type}
          onChange={(type) => setFormData((prev) => ({ ...prev, storage_type: type }))}
        />
        <ExpiryDatePicker
          value={formData.expiry_date}
          onChange={(date) => setFormData((prev) => ({ ...prev, expiry_date: date }))}
          placeholder="유통기한 선택"
        />
        <View style={styles.quantityRow}>
          <Text style={styles.label}>수량</Text>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              onPress={() => setFormData(prev => ({ ...prev, quantity: Math.max(1, (prev.quantity ?? 1) - 1) }))}
              style={styles.quantityBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.quantityBtnText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              keyboardType="number-pad"
              value={String(formData.quantity ?? 1)}
              onChangeText={text => {
                const num = Math.max(1, parseInt(text.replace(/[^0-9]/g, ''), 10) || 1);
                setFormData(prev => ({ ...prev, quantity: num }));
              }}
              maxLength={3}
            />
            <TouchableOpacity
              onPress={() => setFormData(prev => ({ ...prev, quantity: (prev.quantity ?? 1) + 1 }))}
              style={styles.quantityBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.quantityBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Button
          title="재료 추가"
          onPress={handleSubmit}
          disabled={isPending}
          loading={isPending}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
    gap: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 2,
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
    marginLeft: 2,
    fontWeight: '500',
  },
  button: {
    marginTop: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  quantityBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f6fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  quantityBtnText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
    lineHeight: 24,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    width: 48,
    height: 36,
    textAlign: 'center',
    marginHorizontal: 8,
    backgroundColor: '#fff',
  },
}); 