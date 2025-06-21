import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useNavigationStore } from '@/stores/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

type TabBarIconProps = {
  name: keyof typeof Feather.glyphMap;
  color: string;
};

export default function TabLayout() {
  const isTabBarEnabled = useNavigationStore((state) => state.isTabBarEnabled);
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 50 + insets.bottom, // 하단 SafeArea 추가
          paddingBottom: insets.bottom, // 홈 인디케이터 영역 확보
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
          display: isTabBarEnabled ? 'flex' : 'none',
          backgroundColor: '#ffffff', // 배경색 명시
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '추가',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="plus-circle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: '알림',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="bell" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="settings" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabBarIcon({ name, color }: TabBarIconProps) {
  return (
    <Feather name={name} size={24} color={color} />
  );
} 