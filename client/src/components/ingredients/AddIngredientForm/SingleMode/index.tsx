import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { useCreateIngredient } from '@/hooks/query/useIngredients';
import { Button } from '@/components/common/Button';
import { CategorySelector } from '@/components/ingredients/CategorySelector';
import { StorageTypeSelector } from '@/components/ingredients/StorageTypeSelector';
import { ExpiryDatePicker } from '@/components/ingredients/ExpiryDatePicker';
import Toast from 'react-native-toast-message';
import type { Ingredient } from '@/types/api';

type FormData = Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>;

const initialFormData: FormData = {
  name: '',
  category: '채소',
  storage_type: 'REFRIGERATED',
  default_expiry_days: 7,
  quantity: 1,
  expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

export function SingleModeForm({ onSwitchToBulkMode }: { onSwitchToBulkMode?: (names: string[]) => void }) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const { mutate, isPending } = useCreateIngredient();

  const handleSubmit = () => {
    if (!formData.name || !formData.category) {
      Toast.show({
        type: 'error',
        text1: '입력 오류',
        text2: '재료명과 카테고리를 입력해주세요.',
      });
      return;
    }
    
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

  return (
    <ScrollView style={styles.container}>
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
          />
        </View>
        
        <View>
          <Text style={styles.label}>보관 방법</Text>
          <StorageTypeSelector
            value={formData.storage_type}
            onChange={(type) => setFormData((prev) => ({ ...prev, storage_type: type }))}
          />
        </View>
        
        <View>
          <Text style={styles.label}>유통기한</Text>
          <ExpiryDatePicker
            value={formData.expiry_date}
            onChange={(date) => setFormData((prev) => ({ ...prev, expiry_date: date }))}
          />
        </View>
        
        <View style={styles.quantityRow}>
          <Text style={styles.label}>수량</Text>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              onPress={() => setFormData(prev => ({ ...prev, quantity: Math.max(1, (prev.quantity ?? 1) - 1) }))}
              style={styles.quantityBtn}
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