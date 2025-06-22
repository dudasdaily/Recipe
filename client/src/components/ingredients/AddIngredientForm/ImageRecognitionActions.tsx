import { View, StyleSheet, Alert, TouchableOpacity, Text, Animated, PanResponder, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useRef, useState } from 'react';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  const pan = useRef(new Animated.ValueXY({ 
    x: screenWidth - 180, // 우측 하단 기본 위치 (3개 버튼 + gap 고려)
    y: screenHeight - 235 // 하단에서 200px 위
  })).current;
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        setIsDragging(false);
        pan.flattenOffset();
        
        // 화면 경계 체크 및 조정
        const currentX = (pan.x as any)._value;
        const currentY = (pan.y as any)._value;
        
        let newX = currentX;
        let newY = currentY;
        
        // 좌우 경계 체크 (버튼 그룹 전체 너비 고려)
        const buttonGroupWidth = 180; // 3개 버튼 + gap
        if (currentX < 0) newX = 0;
        if (currentX > screenWidth - buttonGroupWidth) newX = screenWidth - buttonGroupWidth;
        
        // 상하 경계 체크
        if (currentY < 50) newY = 50; // 상단 여백
        if (currentY > screenHeight - 150) newY = screenHeight - 150; // 하단 여백
        
        // 경계를 벗어났다면 애니메이션으로 조정
        if (newX !== currentX || newY !== currentY) {
          Animated.spring(pan, {
            toValue: { x: newX, y: newY },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // 권한 요청 함수들
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
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
          opacity: isDragging ? 0.8 : 1,
          elevation: isDragging ? 8 : 3,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={[styles.button, isDragging && styles.buttonDragging]}
        onPress={onToggleBulkSettings}
        activeOpacity={0.7}
      >
        <Text style={[styles.bulkSettingsIcon, showBulkSettings && styles.bulkSettingsIconRotated]}>
          ⚙️
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isDragging && styles.buttonDragging]}
        onPress={onPressReceipt}
        activeOpacity={0.7}
      >
        <Ionicons name="receipt-outline" size={24} color="#007AFF" />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, isDragging && styles.buttonDragging]}
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 12,
    zIndex: 10,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  buttonDragging: {
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.1 }],
  },
  bulkSettingsIcon: {
    fontSize: 20,
  },
  bulkSettingsIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
}); 