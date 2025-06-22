import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationHistory } from '../types/api';

type NotificationState = {
  enabled: boolean;
  notificationTime: string;
  notificationDays: number[];
  notificationHistory: NotificationHistory[];
};

type NotificationActions = {
  enableNotifications: () => void;
  disableNotifications: () => void;
  setNotificationTime: (time: string) => void;
  setNotificationDays: (days: number[]) => void;
  addNotificationToHistory: (notification: Omit<NotificationHistory, 'id'>) => void;
  clearNotificationHistory: () => void;
  cleanupDuplicateNotifications: () => void;
};

const initialState: NotificationState = {
  enabled: true,
  notificationTime: '09:00',
  notificationDays: [1, 2, 3, 4, 5, 6, 0], // 0: Sunday, 1-6: Monday-Saturday
  notificationHistory: [],
};

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // 기본 설정 관리
      enableNotifications: () => {
        set({ enabled: true });
        console.log('✅ 알림이 활성화되었습니다.');
      },
      
      disableNotifications: () => {
        set({ enabled: false });
        console.log('🚫 알림이 비활성화되었습니다.');
      },
      
      setNotificationTime: (time) => {
        set({ notificationTime: time });
        console.log('⏰ 알림 시간이 변경되었습니다:', time);
      },
      
      setNotificationDays: (days) => {
        set({ notificationDays: days });
        console.log('📅 알림 요일이 변경되었습니다:', days);
      },
      
      // 알림 히스토리 관리
      addNotificationToHistory: (notification) => {
        const { notificationHistory } = get();
        
        console.log('🔍 addNotificationToHistory 호출됨:', {
          title: notification.title,
          body: notification.body,
          type: notification.type,
          sentAt: notification.sentAt,
          currentHistoryCount: notificationHistory.length
        });
        
        // 중복 체크: 최근 5개만 검사하고 시간차도 고려
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
          id: Date.now(), // 타임스탬프 기반 ID 생성
        };
        
        set({
          notificationHistory: [newNotification, ...notificationHistory].slice(0, 50), // 최대 50개 유지
        });
        
        console.log('📝 알림 히스토리 저장 완료, 총 개수:', notificationHistory.length + 1);
      },
      
      clearNotificationHistory: () => {
        set({ notificationHistory: [] });
        console.log('🗑️ 알림 히스토리가 모두 삭제되었습니다.');
      },
      
      // 중복 알림 정리
      cleanupDuplicateNotifications: () => {
        const { notificationHistory } = get();
        console.log('🔄 중복 알림 감지, 자동 정리 시작');
        
        if (notificationHistory.length <= 1) {
          return;
        }
        
        console.log('🧹 중복 알림 정리 시작, 현재 개수:', notificationHistory.length);
        
        const uniqueNotifications: NotificationHistory[] = [];
        const seen = new Set<string>();
        
        for (const notification of notificationHistory) {
          const key = `${notification.title}-${notification.type}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueNotifications.push(notification);
          } else {
            console.log('🚫 중복 알림 제거:', {
              id: notification.id,
              title: notification.title.substring(0, 20) + '...',
              type: notification.type
            });
          }
        }
        
        set({ notificationHistory: uniqueNotifications });
        
        console.log('✅ 중복 알림 정리 완료:', {
          before: notificationHistory.length,
          after: uniqueNotifications.length,
          removed: notificationHistory.length - uniqueNotifications.length
        });
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        enabled: state.enabled,
        notificationTime: state.notificationTime,
        notificationDays: state.notificationDays,
        notificationHistory: state.notificationHistory,
      }),
    }
  )
); 