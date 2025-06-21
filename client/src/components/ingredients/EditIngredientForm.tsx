import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import type { Ingredient } from '@/types/api';
import { useUpdateIngredient, useDeleteIngredient } from '@/hooks/query/useIngredients';
import { Button } from '@/components/common/Button';
import { CategorySelector } from '@/components/ingredients/CategorySelector';
import { StorageTypeSelector } from '@/components/ingredients/StorageTypeSelector';
import { ExpiryDatePicker } from '@/components/ingredients/ExpiryDatePicker';

export function EditIngredientForm({ ingredient, onClose }: { ingredient: Ingredient; onClose: () => void }) {
  // 유통기한을 YYYY-MM-DD 형식으로 변환하는 함수
  const formatExpiryDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      // ISO 문자열에서 날짜 부분만 추출
      return dateString.split('T')[0];
    } catch {
      return dateString;
    }
  };

  const [formData, setFormData] = useState({
    name: ingredient.name,
    category: ingredient.category,
    storage_type: ingredient.storage_type,
    quantity: ingredient.quantity,
    expiry_date: formatExpiryDate(ingredient.expiry_date),
    default_expiry_days: ingredient.default_expiry_days,
  });
  const { mutate: updateMutate, isPending: isUpdating } = useUpdateIngredient();
  const { mutate: deleteMutate, isPending: isDeleting } = useDeleteIngredient();

  const handleSave = () => {
    updateMutate({ id: ingredient.id, ingredient: formData }, { onSuccess: onClose });
  };
  const handleDelete = () => {
    deleteMutate(ingredient.id, { onSuccess: onClose });
  };

  return (
    <View style={styles.modalContent}>
      <Text style={styles.title}>재료 수정</Text>
      <View style={styles.form}>
        <Text style={styles.label}>재료명</Text>
        <Button
          title="삭제"
          onPress={handleDelete}
          style={styles.deleteBtn}
          loading={isDeleting}
        />
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
          value={String(formData.quantity)}
          onChangeText={text => {
            const num = Math.max(1, parseInt(text.replace(/[^0-9]/g, ''), 10) || 1);
            setFormData(prev => ({ ...prev, quantity: num }));
          }}
        />
        <Button
          title="저장"
          onPress={handleSave}
          loading={isUpdating}
          style={styles.saveBtn}
        />
        <Button
          title="닫기"
          onPress={onClose}
          variant="secondary"
          style={styles.closeBtn}
        />
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
}); 