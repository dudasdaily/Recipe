import { View } from 'react-native';
import { BulkModeForm } from './BulkMode';

type AddIngredientFormProps = {
  showBulkSettings?: boolean;
  extractedIngredients?: string[];
  onIngredientsUsed?: () => void;
  cameraIngredients?: string[];
  onCameraIngredientsUsed?: () => void;
};

export default function AddIngredientForm({ 
  showBulkSettings,
  extractedIngredients,
  onIngredientsUsed,
  cameraIngredients,
  onCameraIngredientsUsed
}: AddIngredientFormProps) {
  return (
    <View style={{ flex: 1 }}>
      <BulkModeForm 
        showBulkSettings={showBulkSettings}
        extractedIngredients={extractedIngredients}
        onIngredientsUsed={onIngredientsUsed}
        cameraIngredients={cameraIngredients}
        onCameraIngredientsUsed={onCameraIngredientsUsed}
      />
    </View>
  );
} 