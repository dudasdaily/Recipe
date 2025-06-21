import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerFCMToken, getNotificationSettings, saveNotificationSettings } from '../services/api/notifications';
import { getFCMToken } from '../config/firebase';
import { NotificationSettings, NotificationHistory } from '../types/api';

type NotificationState = {
  enabled: boolean;
  notificationTime: string;
  notificationDays: number[];
  fcmToken: string | null;
  isTokenRegistered: boolean;
  isLoading: boolean;
  error: string | null;
  notificationHistory: NotificationHistory[];
};

type NotificationActions = {
  enableNotifications: () => void;
  disableNotifications: () => void;
  setNotificationTime: (time: string) => void;
  setNotificationDays: (days: number[]) => void;
  setFCMToken: (token: string | null) => void;
  registerTokenWithServer: () => Promise<void>;
  loadSettingsFromServer: () => Promise<void>;
  saveSettingsToServer: () => Promise<void>;
  addNotificationToHistory: (notification: Omit<NotificationHistory, 'id'>) => void;
  clearNotificationHistory: () => void;
  cleanupDuplicateNotifications: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
};

const initialState: NotificationState = {
  enabled: false,
  notificationTime: '09:00',
  notificationDays: [1, 2, 3, 4, 5, 6, 0], // 0: Sunday, 1-6: Monday-Saturday
  fcmToken: null,
  isTokenRegistered: false,
  isLoading: false,
  error: null,
  notificationHistory: [],
};

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      enableNotifications: () => set({ enabled: true }),
      disableNotifications: () => set({ enabled: false }),
      setNotificationTime: (time) => set({ notificationTime: time }),
      setNotificationDays: (days) => set({ notificationDays: days }),
      setFCMToken: (token) => set({ fcmToken: token }),
      registerTokenWithServer: async () => {
        const { fcmToken } = get();
        if (!fcmToken) {
          set({ error: 'FCM 토큰이 없습니다.' });
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          await registerFCMToken({
            token: fcmToken,
            deviceInfo: {
              platform: 'react-native',
              version: '1.0.0',
              model: 'mobile',
            },
          });
          
          set({ isTokenRegistered: true });
        } catch (error: any) {
          set({ error: error.message || '토큰 등록에 실패했습니다.' });
        } finally {
          set({ isLoading: false });
        }
      },
      loadSettingsFromServer: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await getNotificationSettings();
          if (response.success && response.data) {
            const settings = response.data;
            set({
              enabled: settings.isEnabled,
              notificationTime: settings.notifyTime,
              notificationDays: settings.notifyDays.map(day => {
                const dayMap: { [key: string]: number } = {
                  'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3,
                  'THU': 4, 'FRI': 5, 'SAT': 6
                };
                return dayMap[day] ?? 0;
              }),
            });
          }
        } catch (error: any) {
          set({ error: error.message || '설정을 불러오는데 실패했습니다.' });
        } finally {
          set({ isLoading: false });
        }
      },
      saveSettingsToServer: async () => {
        const { enabled, notificationTime, notificationDays } = get();
        set({ isLoading: true, error: null });
        
        try {
          const dayMap: { [key: number]: string } = {
            0: 'SUN', 1: 'MON', 2: 'TUE', 3: 'WED',
            4: 'THU', 5: 'FRI', 6: 'SAT'
          };
          
          await saveNotificationSettings({
            notifyTime: notificationTime,
            notifyDays: notificationDays.map(day => dayMap[day] ?? 'MON'),
            isEnabled: enabled,
          });
        } catch (error: any) {
          set({ error: error.message || '설정 저장에 실패했습니다.' });
        } finally {
          set({ isLoading: false });
        }
      },
      addNotificationToHistory: (notification) => {
        const { notificationHistory } = get();
        
        console.log('🔍 addNotificationToHistory 호출됨:', {
          title: notification.title,
          body: notification.body,
          type: notification.type,
          sentAt: notification.sentAt,
          currentHistoryCount: notificationHistory.length
        });
        
        // 중복 체크: 최근 10개 내에 같은 title/body/type 조합이 있으면 저장하지 않음
        const duplicateIndex = notificationHistory.slice(0, 10).findIndex((item) =>
          item.title === notification.title &&
          item.body === notification.body &&
          item.type === notification.type
        );
        
        if (duplicateIndex !== -1) {
          const duplicateItem = notificationHistory[duplicateIndex];
          console.log('🚫 중복 알림 감지, 저장 건너뜀:', {
            title: notification.title,
            body: notification.body,
            type: notification.type,
            duplicateIndex,
            duplicateItemId: duplicateItem.id,
            duplicateItemSentAt: duplicateItem.sentAt
          });
          return;
        }
        
        console.log('✅ 새 알림 히스토리 저장:', {
          title: notification.title,
          body: notification.body,
          type: notification.type,
          newId: Date.now()
        });
        
        const newNotification: NotificationHistory = {
          ...notification,
          id: Date.now(), // 임시 ID 생성
        };
        set({
          notificationHistory: [newNotification, ...notificationHistory].slice(0, 100), // 최대 100개 유지
        });
        
        console.log('💾 알림 히스토리 저장 완료, 총 개수:', notificationHistory.length + 1);
      },
      clearNotificationHistory: () => {
        set({ notificationHistory: [] });
      },
      cleanupDuplicateNotifications: () => {
        const { notificationHistory } = get();
        
        console.log('🧹 중복 알림 정리 시작, 현재 개수:', notificationHistory.length);
        
        // EXPIRY_ALERT 타입을 우선하고, LOCAL_NOTIFICATION 중복 제거
        const uniqueHistory: NotificationHistory[] = [];
        const seenKeys = new Set<string>();
        
        notificationHistory.forEach((item) => {
          const key = `${item.title}|${item.body}|${item.type}`;
          
          // 이미 같은 키가 있으면 건너뛰기 (중복 제거)
          if (seenKeys.has(key)) {
            console.log('🚫 중복 알림 제거:', { title: item.title, type: item.type, id: item.id });
            return;
          }
          
          seenKeys.add(key);
          uniqueHistory.push(item);
        });
        
        console.log('✅ 중복 알림 정리 완료:', {
          before: notificationHistory.length,
          after: uniqueHistory.length,
          removed: notificationHistory.length - uniqueHistory.length
        });
        
        set({ notificationHistory: uniqueHistory });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        enabled: state.enabled,
        notificationTime: state.notificationTime,
        notificationDays: state.notificationDays,
        fcmToken: state.fcmToken,
        isTokenRegistered: state.isTokenRegistered,
        notificationHistory: state.notificationHistory,
      }),
    }
  )
); 