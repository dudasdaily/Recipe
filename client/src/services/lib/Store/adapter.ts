import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class StoreService {
  static createPersistentStore<T extends object>(
    name: string,
    initializer: (set: (state: T | Partial<T>) => void) => T
  ) {
    return create(
      persist(initializer, {
        name,
        storage: createJSONStorage(() => AsyncStorage),
      })
    );
  }
} 