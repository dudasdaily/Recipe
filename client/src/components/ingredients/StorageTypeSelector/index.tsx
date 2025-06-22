import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Ingredient } from '@/types/api';

type StorageType = Ingredient['storage_type'];

type StorageTypeSelectorProps = {
  value: StorageType;
  onChange: (type: StorageType) => void;
};

const STORAGE_TYPES: { value: StorageType; label: string; color: string }[] = [
  { value: 'ROOM_TEMP', label: '실온', color: '#ff9d5b' },
  { value: 'REFRIGERATED', label: '냉장', color: '#4CAF50' },
  { value: 'FROZEN', label: '냉동', color: '#2196F3' },
];

export function StorageTypeSelector({ value, onChange }: StorageTypeSelectorProps) {
  const getSelectedColor = (typeValue: StorageType) => {
    const type = STORAGE_TYPES.find(t => t.value === typeValue);
    return type ? type.color : '#ff9d5b';
  };

  return (
    <View style={styles.container}>
      {STORAGE_TYPES.map((type) => (
        <TouchableOpacity
          key={type.value}
          style={[
            styles.button,
            value === type.value && {
              backgroundColor: type.color,
              borderColor: type.color,
            },
          ]}
          onPress={() => onChange(type.value)}
        >
          <Text
            style={[
              styles.text,
              value === type.value && styles.selectedText,
            ]}
          >
            {type.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    height: 30,
    minWidth: 44,
    borderRadius: 25,
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  text: {
    fontSize: 14,
    color: '#666',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
  },
}); 