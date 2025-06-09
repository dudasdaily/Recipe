import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { SingleModeForm } from '@/components/ingredients/AddIngredientForm/SingleMode';
import { BulkModeForm } from '@/components/ingredients/AddIngredientForm/BulkMode';

type Mode = 'SINGLE' | 'MULTI';

export default function AddScreen() {
  const [mode, setMode] = useState<Mode>('SINGLE');

  return (
    <View style={styles.container}>
      <SegmentedControl
        values={['단일 추가', '다중 추가']}
        selectedIndex={mode === 'SINGLE' ? 0 : 1}
        onChange={(index) => setMode(index === 0 ? 'SINGLE' : 'MULTI')}
        style={styles.segmentedControl}
      />
      
      {mode === 'SINGLE' ? (
        <SingleModeForm />
      ) : (
        <BulkModeForm />
      )}
    </View>
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