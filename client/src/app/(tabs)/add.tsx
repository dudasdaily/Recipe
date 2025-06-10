import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import AddIngredientForm from '@/components/ingredients/AddIngredientForm';

export default function AddScreen() {
  const [mode, setMode] = useState<'SINGLE' | 'MULTI'>('SINGLE');
  const [bulkNames, setBulkNames] = useState<string[]>([]);

  const handleModeChange = (newMode: 'SINGLE' | 'MULTI', names?: string[]) => {
    setMode(newMode);
    setBulkNames(names ?? []);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
    marginTop: 40,
    marginBottom: 16,
  },
}); 