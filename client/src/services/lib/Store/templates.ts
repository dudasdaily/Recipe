import { StoreService } from './adapter';
import { STORE_KEYS } from './consts';
import type { IngredientTemplate } from '@/types/ingredient';

type TemplatesState = {
  items: IngredientTemplate[];
  addTemplate: (template: Omit<IngredientTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTemplate: (id: string, updates: Partial<IngredientTemplate>) => void;
  deleteTemplate: (id: string) => void;
};

export const useTemplatesStore = StoreService.createPersistentStore<TemplatesState>(
  STORE_KEYS.TEMPLATES,
  (set) => ({
    items: [],
    addTemplate: (template) => set((state) => ({
      items: [
        ...state.items,
        {
          ...template,
          id: Math.random().toString(36).substring(7),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),
    updateTemplate: (id, updates) => set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      ),
    })),
    deleteTemplate: (id) => set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  })
); 