import type { Ingredient } from '@/types/ingredient';

export type IngredientCardProps = {
  ingredient: Ingredient;
  onPress?: () => void;
  onDelete?: () => void;
}; 