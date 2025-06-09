import type { Ingredient, StorageType } from '@/types/ingredient';
import type { Category } from '../CategoryFilter';

export type IngredientListProps = {
  ingredients: Ingredient[];
  onPressIngredient?: (ingredient: Ingredient) => void;
  onDeleteIngredient?: (id: string) => void;
  onToggleNotification?: (id: string) => void;
  selectedStorageType?: StorageType | 'ALL';
  onStorageTypeChange?: (type: StorageType | 'ALL') => void;
  selectedCategory?: Category;
  onCategoryChange?: (category: Category) => void;
}; 