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
        <Text style={styles.subtitle}>유통기한 임박재료{ingredients.length}개</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ingredients.map((ingredient) => (
          <View key={ingredient.id} style={styles.cardContainer}>
            <IngredientCard ingredient={ingredient} minimalView />
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
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingLeft: 30,
  },
  cardContainer: {
    width: 60,
    marginHorizontal: 2,
    height: 25,
  },
}); 