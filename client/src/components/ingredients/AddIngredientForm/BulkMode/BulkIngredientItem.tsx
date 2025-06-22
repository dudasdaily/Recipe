import { View, TextInput, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { CategorySelector } from '@/components/ingredients/CategorySelector';
import { StorageTypeSelector } from '@/components/ingredients/StorageTypeSelector';
import { Ionicons } from '@expo/vector-icons';
import type { Ingredient } from '@/types/api';
import { ExpiryDatePicker } from '@/components/ingredients/ExpiryDatePicker';
import { Swipeable } from 'react-native-gesture-handler';
import { Animated } from 'react-native';

type BulkFormData = Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>;

type Props = {
  item: BulkFormData;
  onUpdate: (data: Partial<BulkFormData>) => void;
  onRemove: () => void;
  onDrag: () => void;
  index?: number;
};

export function BulkIngredientItem({ item, onUpdate, onRemove, onDrag, index }: Props) {
  const renderRightActions = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [-60, 0],
      outputRange: [1, 0.7],
      extrapolate: 'clamp',
    });
    return (
      <Animated.View style={{
        transform: [{ scale }],
        backgroundColor: '#ff3b30',
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: '95%',
        borderRadius: 12,
        alignSelf: 'center',
        marginVertical: 0,
        marginBottom: 7,
      }}>
        <TouchableOpacity onPress={onRemove} activeOpacity={0.8} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="close" size={32} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={true}
      friction={1.7}
      rightThreshold={30}
    >
      <View style={styles.container}>
        <TouchableOpacity onLongPress={onDrag} style={styles.dragHandle}>
          <Ionicons name="reorder-three" size={22} color="#bbb" />
        </TouchableOpacity>
        <View style={[styles.fields, { overflow: 'visible' }]}>
          <Text style={[styles.labelTitle, { marginBottom: 8, color: '#666', fontSize: 18 }]}>item {(typeof index === 'number' && !isNaN(index)) ? index + 1 : '-'}</Text>
          <Text style={styles.labelTitle}>재료명</Text>
          <TextInput
            style={[styles.input, { marginBottom: 8 }]}
            placeholder="재료명"
            value={item.name}
            onChangeText={(text) => onUpdate({ name: text })}
          />
          <Text style={styles.labelTitle}>카테고리</Text>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, flex: 1 }}>
            <Text style={[styles.labelTitle, { marginRight: 8 }]}>유통기한</Text>
            <ExpiryDatePicker
              value={item.expiry_date}
              onChange={(date) => onUpdate({ expiry_date: date })}
              placeholder="유통기한 선택"
              style={{ marginBottom: 2, minWidth: 120, flex: 1 }}
            />
          </View>
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
      </View>
    </Swipeable>
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
    borderWidth: 1,
    borderColor: '#bbb',
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  quantityBtnText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
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
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 4,
    marginLeft: 2,
  },
  labelTitle: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 4,
    marginLeft: 2,
  },
}); 