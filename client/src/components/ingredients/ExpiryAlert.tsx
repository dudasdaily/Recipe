import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Ingredient } from '@/types/api';
import { IngredientCard } from './IngredientCard';

type ExpiryAlertProps = {
  ingredients: Ingredient[];
};

export function ExpiryAlert({ ingredients }: ExpiryAlertProps) {
  if (ingredients.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>유통기한 임박</Text>
        <Text style={styles.subtitle}>{ingredients.length}개의 재료</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ingredients.map((ingredient) => (
          <View key={ingredient.id} style={styles.cardContainer}>
            <IngredientCard ingredient={ingredient} compact hideImage />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E53935',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  cardContainer: {
    width: 160,
    marginHorizontal: 4,
  },
}); 