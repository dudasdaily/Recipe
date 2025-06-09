import type { Category } from '@/components/ingredients/CategoryFilter/types';
import type { StorageType } from '@/components/ingredients/StorageTypeSelector/types';

export type SingleAddFormData = {
  name: string;
  quantity: string;
  unit: string;
  category: Category;
  storageType: StorageType;
  expiryDate: string;
  notificationEnabled: boolean;
};

export type SingleAddFormProps = {
  onSubmit: (data: SingleAddFormData) => void;
}; 