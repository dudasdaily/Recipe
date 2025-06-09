import { StoreService } from './adapter';
import { STORE_KEYS } from './consts';
import type { Ingredient, StorageType } from '@/types/ingredient';

type IngredientFilter = {
  searchText?: string;
  storageType?: StorageType;
  expiryDateStart?: string;
  expiryDateEnd?: string;
};

type IngredientsState = {
  items: Ingredient[];
  filter: IngredientFilter;
  setFilter: (filter: IngredientFilter) => void;
  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  addIngredients: (ingredients: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
};

export const useIngredientsStore = StoreService.createPersistentStore<IngredientsState>(
  STORE_KEYS.INGREDIENTS,
  (set) => ({
    items: [],
    filter: {},
    setFilter: (filter) => set({ filter }),
    addIngredient: (ingredient) => set((state) => ({
      items: [
        ...state.items,
        {
          ...ingredient,
          id: Math.random().toString(36).substring(7),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),
    updateIngredient: (id, updates) => set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      ),
    })),
    deleteIngredient: (id) => set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
    addIngredients: (ingredients) => set((state) => ({
      items: [
        ...state.items,
        ...ingredients.map((ingredient) => ({
          ...ingredient,
          id: Math.random().toString(36).substring(7),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      ],
    })),
  })
); 