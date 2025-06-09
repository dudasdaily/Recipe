import { useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Slot, useRouter, usePathname } from 'expo-router';
import { View } from 'react-native';
import { TabBar } from '@/components/common/TabBar';
import { useNavigationStore } from '@/stores/navigation';

const ROUTES = [
  { name: '/', label: '홈', icon: 'home' },
  { name: '/add', label: '추가', icon: 'plus-square' },
  { name: '/settings', label: '설정', icon: 'settings' },
] as const;

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const isTabBarEnabled = useNavigationStore((state) => state.isTabBarEnabled);

  const handleRouteChange = useCallback((routeName: string) => {
    router.push(routeName);
  }, [router]);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
        <TabBar
          routes={ROUTES}
          currentRoute={pathname}
          onChangeRoute={handleRouteChange}
          isEnabled={isTabBarEnabled}
        />
      </View>
    </SafeAreaProvider>
  );
} 