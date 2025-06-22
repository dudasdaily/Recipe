import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LocalNotificationState = {
  enabled: boolean;
  time: string; // "HH:mm" 형식
  daysThreshold: number; // 유통기한 임박 기준 (n일 전)
};

export type LocalNotificationActions = {
  setEnabled: (enabled: boolean) => void;
  setTime: (time: string) => void;
  setDaysThreshold: (days: number) => void;
  resetToDefault: () => void;
};

const initialState: LocalNotificationState = {
  enabled: true,
  time: '09:00',
  daysThreshold: 3, // 3일 전부터 알림
};

export const useLocalNotificationStore = create<LocalNotificationState & LocalNotificationActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setEnabled: (enabled) => {
        set({ enabled });
        console.log(`📱 로컬 알림 ${enabled ? '활성화' : '비활성화'}`);
      },
      
      setTime: (time) => {
        set({ time });
        console.log(`⏰ 알림 시간 변경: ${time}`);
      },
      
      setDaysThreshold: (daysThreshold) => {
        set({ daysThreshold });
        console.log(`📅 유통기한 임박 기준 변경: ${daysThreshold}일`);
      },
      
      resetToDefault: () => {
        set(initialState);
        console.log('🔄 알림 설정 초기화');
      },
    }),
    {
      name: 'local-notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        enabled: state.enabled,
        time: state.time,
        daysThreshold: state.daysThreshold,
      }),
    }
  )
); 