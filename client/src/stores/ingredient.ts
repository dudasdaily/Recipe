import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Ingredient, IngredientStore } from '../types/ingredient';
import type { AddMode } from '@/types/ingredient';
import type { RecognizedItem } from '@/components/camera/ImageRecognition/types';

export const useIngredientStore = create<IngredientStore>()(
  persist(
    (set) => ({
      ingredients: [],
      selectedStorageType: 'ALL',
      selectedCategory: 'ALL',
      mode: 'SINGLE',
      recognizedItems: [],
      isTransitionModalVisible: false,
      
      setSelectedStorageType: (type) => set({ selectedStorageType: type }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      
      addIngredient: (ingredient) => 
        set((state) => ({
          ingredients: [
            ...state.ingredients,
            {
              ...ingredient,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          ]
        })),
      
      updateIngredient: (id, data) => 
        set((state) => ({
          ingredients: state.ingredients.map((item) =>
            item.id === id
              ? { ...item, ...data, updatedAt: new Date().toISOString() }
              : item
          )
        })),
      
      deleteIngredient: (id) => 
        set((state) => ({
          ingredients: state.ingredients.filter((item) => item.id !== id)
        })),
      
      setMode: (mode) => set({ mode }),
      setRecognizedItems: (items) => set({ recognizedItems: items }),
      clearRecognizedItems: () => set({ recognizedItems: [] }),
      showTransitionModal: () => set({ isTransitionModalVisible: true }),
      hideTransitionModal: () => set({ isTransitionModalVisible: false }),
    }),
    {
      name: 'ingredient-storage',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
); 