import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ViewStyle } from 'react-native';

export const useSafeAreaStyle = () => {
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    paddingTop: insets.top,
  };

  const contentStyle: ViewStyle = {
    paddingBottom: insets.bottom + 50, // 탭바 높이 고려
  };

  const tabBarStyle: ViewStyle = {
    height: 50 + insets.bottom,
    paddingBottom: insets.bottom,
  };

  return {
    insets,
    containerStyle,
    contentStyle,
    tabBarStyle,
  };
}; 