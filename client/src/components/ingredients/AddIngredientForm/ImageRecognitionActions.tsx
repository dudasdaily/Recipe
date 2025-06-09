import { View, StyleSheet, Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onPressReceipt: () => void;
  onPressCamera: () => void;
  mode: 'SINGLE' | 'MULTI';
};

export function ImageRecognitionActions({ onPressReceipt, onPressCamera, mode }: Props) {
  return (
    <View style={styles.container}>
      <Button
        title="영수증 촬영"
        onPress={onPressReceipt}
        icon={<Ionicons name="receipt-outline" size={20} color="#007AFF" style={{ marginRight: 6 }} />}
        variant="secondary"
        style={styles.button}
        disabled={mode === 'SINGLE'}
      />
      <Button
        title="재료 사진 촬영"
        onPress={onPressCamera}
        icon={<Ionicons name="camera-outline" size={20} color="#007AFF" style={{ marginRight: 6 }} />}
        variant="secondary"
        style={styles.button}
      />
      {mode === 'SINGLE' && (
        <Text style={styles.hint}>* 영수증 촬영은 다중 추가 모드에서만 가능합니다.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    marginTop: 4,
    paddingHorizontal: 8,
  },
  button: {
    flex: 1,
    minWidth: 120,
  },
  hint: {
    position: 'absolute',
    left: 0,
    top: 44,
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    marginLeft: 2,
  },
}); 