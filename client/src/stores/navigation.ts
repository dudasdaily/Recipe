import { create } from 'zustand';

type NavigationStore = {
  isTabBarEnabled: boolean;
  disableTabBar: () => void;
  enableTabBar: () => void;
};

export const useNavigationStore = create<NavigationStore>((set) => ({
  isTabBarEnabled: true,
  disableTabBar: () => set({ isTabBarEnabled: false }),
  enableTabBar: () => set({ isTabBarEnabled: true }),
})); 