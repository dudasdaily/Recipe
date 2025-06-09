import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { CategorySelector } from '@/components/ingredients/CategorySelector';
import { StorageTypeSelector } from '@/components/ingredients/StorageTypeSelector';
import { Ionicons } from '@expo/vector-icons';
import type { Ingredient } from '@/types/api';
import { ExpiryDatePicker } from '@/components/ingredients/ExpiryDatePicker';

type BulkFormData = Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>;

type Props = {
  item: BulkFormData;
  onUpdate: (data: Partial<BulkFormData>) => void;
  onRemove: () => void;
  onDrag: () => void;
};

export function BulkIngredientItem({ item, onUpdate, onRemove, onDrag }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onLongPress={onDrag} style={styles.dragHandle}>
        <Ionicons name="reorder-three" size={22} color="#bbb" />
      </TouchableOpacity>
      <View style={styles.fields}>
        <TextInput
          style={styles.input}
          placeholder="재료명"
          value={item.name}
          onChangeText={(text) => onUpdate({ name: text })}
        />
        <CategorySelector
          value={item.category}
          onChange={(category) => onUpdate({ category })}
          style={{ marginBottom: 4 }}
        />
        <StorageTypeSelector
          value={item.storage_type}
          onChange={(type) => onUpdate({ storage_type: type })}
        />
        <ExpiryDatePicker
          value={item.expiry_date}
          onChange={(date) => onUpdate({ expiry_date: date })}
          placeholder="유통기한 선택"
          style={{ marginBottom: 2 }}
        />
      </View>
      <TouchableOpacity onPress={onRemove} style={styles.removeBtn} hitSlop={8}>
        <Ionicons name="close-circle" size={22} color="#ff3b30" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fafbfc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  dragHandle: {
    paddingRight: 8,
    paddingTop: 8,
  },
  fields: {
    flex: 1,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  removeBtn: {
    marginLeft: 8,
    marginTop: 2,
  },
}); 