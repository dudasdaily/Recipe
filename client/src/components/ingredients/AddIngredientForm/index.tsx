import { useState } from 'react';
import { View } from 'react-native';
import { SingleModeForm } from './SingleMode';
import { BulkModeForm } from './BulkMode';

export default function AddIngredientForm() {
  const [mode, setMode] = useState<'SINGLE' | 'MULTI'>('SINGLE');
  const [bulkNames, setBulkNames] = useState<string[]>([]);

  const handleSwitchToBulkMode = (names: string[]) => {
    setBulkNames(names);
    setMode('MULTI');
  };

  return (
    <View style={{ flex: 1 }}>
      {mode === 'SINGLE' ? (
        <SingleModeForm onSwitchToBulkMode={handleSwitchToBulkMode} />
      ) : (
        <BulkModeForm initialNames={bulkNames} />
      )}
    </View>
  );
} 