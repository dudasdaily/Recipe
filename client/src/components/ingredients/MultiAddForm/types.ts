import type { Category } from '@/components/ingredients/CategoryFilter';
import type { StorageType } from '@/components/ingredients/StorageTypeSelector/types';

export type MultiAddFormItem = {
  name: string;
  quantity: string;
  unit: string;
  category: Category;
  storageType: StorageType;
};

export type MultiAddFormData = {
  items: MultiAddFormItem[];
};

export type MultiAddFormProps = {
  onSubmit: (data: MultiAddFormData) => void;
}; 