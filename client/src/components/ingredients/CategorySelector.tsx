import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';

const DEFAULT_CATEGORIES = [
  '채소', '과일', '육류', '수산물', '유제품', '기타'
];

type CategorySelectorProps = {
  value: string;
  onChange: (category: string) => void;
  categories?: string[];
  style?: any;
};

export function CategorySelector({ value, onChange, categories = DEFAULT_CATEGORIES, style }: CategorySelectorProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.row, style]}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[styles.button, value === category && styles.buttonSelected]}
          onPress={() => onChange(category)}
          activeOpacity={0.85}
        >
          <Text style={[styles.text, value === category && styles.textSelected]}>{category}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#F2F4F7',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonSelected: {
    backgroundColor: '#fff',
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    color: '#222',
    fontSize: 14,
    fontWeight: '500',
  },
  textSelected: {
    color: '#007AFF',
    fontWeight: '700',
  },
}); 