import { View } from 'react-native';
import { BulkModeForm } from './BulkMode';

type AddIngredientFormProps = {
  showBulkSettings?: boolean;
};

export default function AddIngredientForm({ showBulkSettings }: AddIngredientFormProps) {
  return (
    <View style={{ flex: 1 }}>
      <BulkModeForm showBulkSettings={showBulkSettings} />
    </View>
  );
} 