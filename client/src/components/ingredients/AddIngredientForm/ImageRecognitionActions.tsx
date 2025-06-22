import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

type Props = {
  onPressReceipt: () => void;
  onPressCamera: () => void;
  onImagePicked?: (uri: string) => void;
  showBulkSettings: boolean;
  onToggleBulkSettings: () => void;
};

export function ImageRecognitionActions({ 
  onPressReceipt, 
  onPressCamera, 
  onImagePicked,
  showBulkSettings,
  onToggleBulkSettings 
}: Props) {
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
      <TouchableOpacity
        style={styles.bulkSettingsButton}
        onPress={onToggleBulkSettings}
        activeOpacity={0.7}
      >
        <Text style={[styles.bulkSettingsIcon, showBulkSettings && styles.bulkSettingsIconRotated]}>
          ⚙️
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconButton}
        onPress={onPressReceipt}
        activeOpacity={0.7}
      >
        <Ionicons name="receipt-outline" size={24} color="#007AFF" />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.iconButton}
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
        activeOpacity={0.7}
      >
        <Ionicons name="camera-outline" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
    zIndex: 10,
  },
  bulkSettingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  bulkSettingsIcon: {
    fontSize: 20,
  },
  bulkSettingsIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
}); 