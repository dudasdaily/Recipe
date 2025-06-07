import { StoreService } from './adapter';
import { STORE_KEYS } from './consts';
import type { StorageType } from '@/types/ingredient';

type SettingsState = {
  defaultStorageType: StorageType;
  defaultExpiryDays: {
    [key in StorageType]: number;
  };
  setDefaultStorageType: (type: StorageType) => void;
  setDefaultExpiryDays: (type: StorageType, days: number) => void;
};

const DEFAULT_EXPIRY_DAYS = {
  ROOM_TEMP: 7,
  REFRIGERATED: 14,
  FROZEN: 90,
};

export const useSettingsStore = StoreService.createPersistentStore<SettingsState>(
  STORE_KEYS.SETTINGS,
  (set) => ({
    defaultStorageType: 'REFRIGERATED',
    defaultExpiryDays: DEFAULT_EXPIRY_DAYS,
    setDefaultStorageType: (type) => set({ defaultStorageType: type }),
    setDefaultExpiryDays: (type, days) => set((state) => ({
      defaultExpiryDays: {
        ...state.defaultExpiryDays,
        [type]: days,
      },
    })),
  })
); 