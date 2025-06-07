import { memo } from 'react';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { TabBarProps } from './types';
import { Container, TabButton, TabLabel } from './styles';

export const TabBar = memo(({
  routes,
  currentRoute,
  onChangeRoute,
  isEnabled = true,
}: TabBarProps) => {
  const handlePress = (routeName: string) => {
    if (!isEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    
    Haptics.selectionAsync();
    onChangeRoute(routeName);
  };

  return (
    <Container>
      {routes.map((route) => {
        const isActive = currentRoute === route.name;
        
        return (
          <TabButton
            key={route.name}
            isActive={isActive}
            disabled={!isEnabled}
            onPress={() => handlePress(route.name)}
          >
            <Feather
              name={route.icon}
              size={24}
              color={isActive ? '#4A90E2' : '#999999'}
            />
            <TabLabel isActive={isActive}>
              {route.label}
            </TabLabel>
          </TabButton>
        );
      })}
    </Container>
  );
});

TabBar.displayName = 'TabBar'; 