import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabBar } from '@/components/common/TabBar';

export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 16 }}>
        <Text>Home Screen</Text>
      </View>
      <TabBar />
    </SafeAreaView>
  );
} 