import type { RecognizedItem } from '@/types/vision';

export type IngredientScannerProps = {
  onScanComplete: (items: RecognizedItem[]) => void;
  onCancel: () => void;
  mode: 'SINGLE' | 'MULTI';
}; 