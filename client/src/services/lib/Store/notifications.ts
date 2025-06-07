import { StoreService } from './adapter';
import { STORE_KEYS } from './consts';

type NotificationTime = {
  hour: number;
  minute: number;
};

type NotificationDays = {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
};

type NotificationsState = {
  enabled: boolean;
  time: NotificationTime;
  days: NotificationDays;
  defaultIngredientNotification: boolean;
  fcmToken: string | null;
  setEnabled: (enabled: boolean) => void;
  setTime: (time: NotificationTime) => void;
  setDays: (days: Partial<NotificationDays>) => void;
  setDefaultIngredientNotification: (enabled: boolean) => void;
  setFcmToken: (token: string | null) => void;
};

const DEFAULT_NOTIFICATION_TIME: NotificationTime = {
  hour: 9,
  minute: 0,
};

const DEFAULT_NOTIFICATION_DAYS: NotificationDays = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
  sunday: true,
};

export const useNotificationsStore = StoreService.createPersistentStore<NotificationsState>(
  STORE_KEYS.NOTIFICATIONS,
  (set) => ({
    enabled: true,
    time: DEFAULT_NOTIFICATION_TIME,
    days: DEFAULT_NOTIFICATION_DAYS,
    defaultIngredientNotification: true,
    fcmToken: null,
    setEnabled: (enabled) => set({ enabled }),
    setTime: (time) => set({ time }),
    setDays: (days) => set((state) => ({
      days: { ...state.days, ...days },
    })),
    setDefaultIngredientNotification: (enabled) => set({ defaultIngredientNotification: enabled }),
    setFcmToken: (token) => set({ fcmToken: token }),
  })
); 