import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useNavigationStore } from '@/stores/navigation';

type TabBarIconProps = {
  name: keyof typeof Feather.glyphMap;
  color: string;
};

export default function TabLayout() {
  const isTabBarEnabled = useNavigationStore((state) => state.isTabBarEnabled);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 50,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
          display: isTabBarEnabled ? 'flex' : 'none',
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