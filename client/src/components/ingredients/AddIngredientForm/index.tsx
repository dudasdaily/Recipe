import { View } from 'react-native';
import { BulkModeForm } from './BulkMode';

type AddIngredientFormProps = {
  showBulkSettings?: boolean;
  onImageFromParent?: string | null;
  onImageProcessed?: () => void;
};

export default function AddIngredientForm({ 
  showBulkSettings, 
  onImageFromParent,
  onImageProcessed 
}: AddIngredientFormProps) {
  return (
    <View style={{ flex: 1 }}>
      <BulkModeForm 
        showBulkSettings={showBulkSettings}
        onImageFromParent={onImageFromParent}
        onImageProcessed={onImageProcessed}
      />
    </View>
  );
} 