import { StyleSheet, View, ScrollView } from 'react-native';
import { Ingredient } from '@/types/api';
import { IngredientCard } from './IngredientCard';

type ExpiryAlertProps = {
  ingredients: Ingredient[];
};

export function ExpiryAlert({ ingredients }: ExpiryAlertProps) {
  if (ingredients.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ingredients.map((ingredient) => (
          <View key={ingredient.id} style={styles.itemContainer}>
            <IngredientCard ingredient={ingredient} minimalView />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    marginTop: 2,
    minHeight: 32,
    paddingLeft: 25,
    paddingRight : 25,
  },
  scrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  itemContainer: {
    minWidth: 60,
    marginHorizontal: 4,
    height: 28,
    justifyContent: 'center',
  },
}); 