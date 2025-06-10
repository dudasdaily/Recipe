import { View, StyleSheet } from 'react-native';
import AddIngredientForm from '@/components/ingredients/AddIngredientForm';

export default function AddScreen() {
  return (
    <View style={styles.container}>
      {/* SegmentedControl 등 모드 전환 UI는 AddIngredientForm 내부에서 처리됨 */}
      <AddIngredientForm />
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