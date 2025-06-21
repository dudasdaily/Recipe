import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerFCMToken, getNotificationSettings, saveNotificationSettings } from '../services/api/notifications';
import { getFCMToken } from '../config/firebase';
import { NotificationSettings, NotificationHistory, NotificationSettingsServerResponse } from '../types/api';

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
          console.warn('FCM 토큰이 없어 서버 등록을 건너뜁니다.');
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
          console.log('✅ FCM 토큰 서버 등록 성공');
        } catch (error: any) {
          const errorMessage = error.message || '토큰 등록에 실패했습니다.';
          console.error('❌ FCM 토큰 서버 등록 실패:', errorMessage);
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },
      loadSettingsFromServer: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await getNotificationSettings();
          if (response.success && response.data) {
            const settings = response.data as unknown as NotificationSettingsServerResponse;
            
            // 안전한 방법으로 notify_days 처리
            const notifyDays = Array.isArray(settings.notify_days) ? settings.notify_days : [];
            
            set({
              enabled: settings.is_enabled || false,
              notificationTime: settings.notify_time ? settings.notify_time.substring(0, 5) : '09:00', // HH:mm:ss -> HH:mm
              notificationDays: notifyDays.map((day: string) => {
                const dayMap: { [key: string]: number } = {
                  'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3,
                  'THU': 4, 'FRI': 5, 'SAT': 6
                };
                return dayMap[day] ?? 0;
              }),
            });
            console.log('✅ 서버에서 알림 설정 로드 성공:', {
              enabled: settings.is_enabled,
              notificationTime: settings.notify_time,
              notificationDays: notifyDays,
            });
          }
        } catch (error: any) {
          const errorMessage = error.message || '설정을 불러오는데 실패했습니다.';
          console.error('❌ 서버 알림 설정 로드 실패:', errorMessage);
          set({ error: errorMessage });
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
          console.log('✅ 서버에 알림 설정 저장 성공');
        } catch (error: any) {
          const errorMessage = error.message || '설정 저장에 실패했습니다.';
          console.error('❌ 서버 알림 설정 저장 실패:', errorMessage);
          set({ error: errorMessage });
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
        
        // 중복 체크 최적화: 최근 5개만 검사하고 시간차도 고려
        const recentHistory = notificationHistory.slice(0, 5);
        const duplicateIndex = recentHistory.findIndex((item) => {
          const isSameContent = item.title === notification.title &&
                              item.body === notification.body &&
                              item.type === notification.type;
          
          // 같은 내용이고 5분 이내에 발생한 알림은 중복으로 처리
          if (isSameContent) {
            const timeDiff = new Date().getTime() - new Date(item.sentAt).getTime();
            const fiveMinutes = 5 * 60 * 1000;
            return timeDiff < fiveMinutes;
          }
          
          return false;
        });
        
        if (duplicateIndex !== -1) {
          const duplicateItem = recentHistory[duplicateIndex];
          console.log('🚫 중복 알림 감지, 저장 건너뜀:', {
            title: notification.title,
            duplicateItemSentAt: duplicateItem.sentAt,
            timeDiff: (new Date().getTime() - new Date(duplicateItem.sentAt).getTime()) / 1000 / 60 + '분'
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
          notificationHistory: [newNotification, ...notificationHistory].slice(0, 50), // 최대 50개 유지
        });
        
        console.log('�� 알림 히스토리 저장 완료, 총 개수:', notificationHistory.length + 1);
      },
      clearNotificationHistory: () => {
        console.log('🗑️ 알림 히스토리 전체 삭제');
        set({ notificationHistory: [] });
      },
      cleanupDuplicateNotifications: () => {
        const { notificationHistory } = get();
        
        console.log('🧹 중복 알림 정리 시작, 현재 개수:', notificationHistory.length);
        
        // 중복 제거 최적화: Map을 사용하여 성능 개선
        const uniqueHistory: NotificationHistory[] = [];
        const seenKeys = new Map<string, boolean>();
        
        notificationHistory.forEach((item) => {
          const key = `${item.title}|${item.body}|${item.type}`;
          
          // 이미 같은 키가 있으면 건너뛰기 (중복 제거)
          if (seenKeys.has(key)) {
            console.log('🚫 중복 알림 제거:', { 
              title: item.title.substring(0, 20) + '...', 
              type: item.type, 
              id: item.id 
            });
            return;
          }
          
          seenKeys.set(key, true);
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