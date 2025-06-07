import type { RecognizedItem } from '@/components/camera/ImageRecognition/types';

export type AddMode = 'SINGLE' | 'MULTI';

export type StorageType = 'ROOM_TEMP' | 'REFRIGERATED' | 'FROZEN';

export type Category = 'VEGETABLE' | 'MEAT' | 'SEAFOOD' | 'DAIRY' | 'OTHER';

export type Ingredient = {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  storageType: StorageType;
  category: Category;
  expiryDate: string;
  notificationEnabled: boolean;
};

export type IngredientStore = {
  ingredients: Ingredient[];
  selectedStorageType: StorageType | 'ALL';
  selectedCategory: Category | 'ALL';
  mode: AddMode;
  recognizedItems: RecognizedItem[];
  isTransitionModalVisible: boolean;
  
  // Actions
  setSelectedStorageType: (type: StorageType | 'ALL') => void;
  setSelectedCategory: (category: Category | 'ALL') => void;
  addIngredient: (ingredient: Ingredient) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  setMode: (mode: AddMode) => void;
  setRecognizedItems: (items: RecognizedItem[]) => void;
  clearRecognizedItems: () => void;
  showTransitionModal: () => void;
  hideTransitionModal: () => void;
};

export type IngredientTemplate = {
  id: string;
  name: string;
  items: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>[];
  createdAt: string;
  updatedAt: string;
}; 