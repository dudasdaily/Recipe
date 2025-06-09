import { create } from 'zustand';

type NavigationState = {
  isTabBarEnabled: boolean;
};

type NavigationActions = {
  disableTabBar: () => void;
  enableTabBar: () => void;
};

export const useNavigationStore = create<NavigationState & NavigationActions>((set) => ({
  isTabBarEnabled: true,
  disableTabBar: () => set({ isTabBarEnabled: false }),
  enableTabBar: () => set({ isTabBarEnabled: true }),
})); 