import type { Ingredient } from '@/types/api';

export type IngredientCardProps = {
  ingredient: Ingredient;
  compact?: boolean;
  selected?: boolean;
  onSelect?: (id: number) => void;
  onEdit?: (ingredient: Ingredient) => void;
  onDelete?: (id: number) => void;
  onScrollToggle?: (enabled: boolean) => void;
  selectionMode?: boolean;
  onLongPress?: () => void;
  onPress?: () => void;
  onDragSelect?: (id: number) => void;
  hideImage?: boolean;
  minimalView?: boolean;
}; 