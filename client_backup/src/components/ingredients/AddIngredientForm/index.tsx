import { View } from 'react-native';
import { SingleModeForm } from './SingleMode';
import { BulkModeForm } from './BulkMode';

export default function AddIngredientForm({
  mode,
  bulkNames = [],
  onModeChange,
}: {
  mode: 'SINGLE' | 'MULTI';
  bulkNames?: string[];
  onModeChange: (mode: 'SINGLE' | 'MULTI', bulkNames?: string[]) => void;
}) {
  const handleSwitchToBulkMode = (names: string[]) => {
    onModeChange('MULTI', names);
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