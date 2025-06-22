import { View, StyleSheet, Text, Alert } from 'react-native';
import { Button } from '@/components/common/Button';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

type Props = {
  onPressReceipt: () => void;
  onPressCamera: () => void;
  mode: 'SINGLE' | 'MULTI';
  onImagePicked?: (uri: string) => void;
};

export function ImageRecognitionActions({ onPressReceipt, onPressCamera, mode, onImagePicked }: Props) {
  // 권한 요청 함수
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
      return false;
    }
    return true;
  };
  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImagePicked?.(result.assets[0].uri);
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: '갤러리 접근 오류', text2: e.message });
    }
  };
  const takePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImagePicked?.(result.assets[0].uri);
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: '카메라 오류', text2: e.message });
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title="영수증 촬영"
        onPress={onPressReceipt}
        variant="secondary"
        style={styles.button}
        disabled={mode === 'SINGLE'}
      >
        <Ionicons name="receipt-outline" size={20} color="#007AFF" style={{ marginRight: 6 }} />
        <Text>영수증 촬영</Text>
      </Button>
      <Button
        title="재료 사진 촬영"
        onPress={() => {
          Alert.alert(
            '사진 선택',
            '카메라로 촬영하시겠습니까? 취소를 누르면 갤러리에서 선택합니다.',
            [
              { text: '카메라', onPress: takePhoto },
              { text: '갤러리', onPress: pickImage },
              { text: '취소', style: 'cancel' },
            ]
          );
        }}
        variant="secondary"
        style={styles.button}
      >
        <Ionicons name="camera-outline" size={20} color="#007AFF" style={{ marginRight: 6 }} />
        <Text>재료 사진 촬영</Text>
      </Button>
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