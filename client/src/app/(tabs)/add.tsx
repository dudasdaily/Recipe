import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import AddIngredientForm from '@/components/ingredients/AddIngredientForm';

export default function AddScreen() {
  const [mode, setMode] = useState<'SINGLE' | 'MULTI'>('SINGLE');
  const [bulkNames, setBulkNames] = useState<string[]>([]);
  const insets = useSafeAreaInsets();

  const handleModeChange = (newMode: 'SINGLE' | 'MULTI', names?: string[]) => {
    setMode(newMode);
    setBulkNames(names ?? []);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SegmentedControl
        values={['단일 추가', '다중 추가']}
        selectedIndex={mode === 'SINGLE' ? 0 : 1}
        onChange={(index) => handleModeChange(index === 0 ? 'SINGLE' : 'MULTI')}
        style={styles.segmentedControl}
      />
      <AddIngredientForm
        mode={mode}
        bulkNames={bulkNames}
        onModeChange={handleModeChange}
      />
      <View style={{ height: insets.bottom }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  segmentedControl: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
}); 