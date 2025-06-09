import { useState } from 'react';
import { View, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { StorageTypeSelector } from '@/components/ingredients/StorageTypeSelector';
import { Button } from '@/components/common/Button';
import Toast from 'react-native-toast-message';
import type { Ingredient } from '@/types/api';

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
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="재료명"
          value={formData.name}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="카테고리"
          value={formData.category}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, category: text }))}
        />
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
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    marginTop: 8,
  },
}); 