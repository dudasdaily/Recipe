import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NotificationState = {
  enabled: boolean;
  notificationTime: string;
  notificationDays: number[];
};

type NotificationActions = {
  enableNotifications: () => void;
  disableNotifications: () => void;
  setNotificationTime: (time: string) => void;
  setNotificationDays: (days: number[]) => void;
};

const initialState: NotificationState = {
  enabled: false,
  notificationTime: '09:00',
  notificationDays: [1, 2, 3, 4, 5, 6, 0], // 0: Sunday, 1-6: Monday-Saturday
};

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  persist(
    (set) => ({
      ...initialState,
      enableNotifications: () => set({ enabled: true }),
      disableNotifications: () => set({ enabled: false }),
      setNotificationTime: (time) => set({ notificationTime: time }),
      setNotificationDays: (days) => set({ notificationDays: days }),
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 