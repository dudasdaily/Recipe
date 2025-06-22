import { View, TextInput, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
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
      <View style={[styles.fields, { overflow: 'visible' }]}>
        <TextInput
          style={styles.input}
          placeholder="재료명"
          value={item.name}
          onChangeText={(text) => onUpdate({ name: text })}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
          <CategorySelector
            value={item.category}
            onChange={(category) => onUpdate({ category })}
            style={{ marginBottom: 0 }}
          />
        </ScrollView>
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
        <View style={styles.quantityRow}>
          <Text style={styles.label}>수량</Text>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              onPress={() => onUpdate({ quantity: Math.max(1, (item.quantity ?? 1) - 1) })}
              style={styles.quantityBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.quantityBtnText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              keyboardType="number-pad"
              value={String(item.quantity ?? 1)}
              onChangeText={text => {
                const num = Math.max(1, parseInt(text.replace(/[^0-9]/g, ''), 10) || 1);
                onUpdate({ quantity: num });
              }}
              maxLength={3}
            />
            <TouchableOpacity
              onPress={() => onUpdate({ quantity: (item.quantity ?? 1) + 1 })}
              style={styles.quantityBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.quantityBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 0,
    marginLeft: 2,
    fontWeight: '500',
  },
}); 