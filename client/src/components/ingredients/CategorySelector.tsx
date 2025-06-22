import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';

const DEFAULT_CATEGORIES = [
  '채소', '과일', '육류', '수산물', '유제품', '기타'
];

const CATEGORY_COLORS: { [key: string]: string } = {
  '채소': '#4CAF50',
  '과일': '#FFC107',
  '육류': '#F44336',
  '수산물': '#2196F3',
  '유제품': '#FFFFFF',
  '기타': '#9E9E9E',
};

type CategorySelectorProps = {
  value: string;
  onChange: (category: string) => void;
  categories?: string[];
  style?: any;
};

export function CategorySelector({ value, onChange, categories = DEFAULT_CATEGORIES, style }: CategorySelectorProps) {
  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category] || '#9E9E9E';
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.row, { minWidth: '100%' }, style]}>
      {categories.map((category, idx) => {
        const isSelected = value === category;
        const categoryColor = getCategoryColor(category);
        
        return (
          <TouchableOpacity
            key={category}
            style={[
              styles.button,
              isSelected && {
                backgroundColor: categoryColor,
                borderColor: categoryColor,
              },
              idx === categories.length - 1 && { marginRight: 0 },
            ]}
            onPress={() => onChange(category)}
            activeOpacity={0.85}
          >
            <Text style={[
              styles.text, 
              isSelected && {
                color: category === '유제품' ? '#000' : '#fff',
                fontWeight: '700',
              }
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        );
      })}
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
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  text: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
}); 