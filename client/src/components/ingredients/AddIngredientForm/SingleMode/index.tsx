import { useState } from 'react';
import { View, TextInput, StyleSheet, ScrollView, Text } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { StorageTypeSelector } from '@/components/ingredients/StorageTypeSelector';
import { CategorySelector } from '@/components/ingredients/CategorySelector';
import { Button } from '@/components/common/Button';
import Toast from 'react-native-toast-message';
import type { Ingredient } from '@/types/api';
import { ImageRecognitionActions } from '../ImageRecognitionActions';

type FormData = Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>;

const initialFormData: FormData = {
  name: '',
  category: '',
  storage_type: 'ROOM_TEMP',
  default_expiry_days: 7,
};

export function SingleModeForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => apiClient.post('/ingredients', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      Toast.show({
        type: 'success',
        text1: '재료 추가 완료',
        text2: '재료가 성공적으로 추가되었습니다.',
      });
      setFormData(initialFormData);
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: '재료 추가 실패',
        text2: error.message,
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.category) {
      Toast.show({
        type: 'error',
        text1: '입력 오류',
        text2: '재료명과 카테고리를 입력해주세요.',
      });
      return;
    }
    mutate(formData);
  };

  return (
    <ScrollView style={styles.container}>
      <ImageRecognitionActions
        mode="SINGLE"
        onPressReceipt={() => Toast.show({ type: 'info', text1: '다중 모드에서만 사용 가능합니다.' })}
        onPressCamera={() => Toast.show({ type: 'info', text1: '카메라 촬영 기능 준비 중' })}
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
        <TextInput
          style={styles.input}
          placeholder="기본 유통기한 (일)"
          value={String(formData.default_expiry_days)}
          onChangeText={(text) => {
            const days = parseInt(text) || 0;
            setFormData((prev) => ({ ...prev, default_expiry_days: days }));
          }}
          keyboardType="numeric"
        />
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
}); 