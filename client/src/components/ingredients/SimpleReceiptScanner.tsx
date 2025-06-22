import * as React from 'react';
import { useState, useRef } from 'react';
import { 
  View, 
  Modal, 
  Alert, 
  ActivityIndicator, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { analyzeReceiptImage } from '@/services/api/ocr';

type SimpleReceiptScannerProps = {
  visible: boolean;
  onClose: () => void;
  onIngredientsExtracted: (ingredients: string[]) => void;
};

export const SimpleReceiptScanner = ({ 
  visible, 
  onClose, 
  onIngredientsExtracted 
}: SimpleReceiptScannerProps) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // 영수증 OCR 분석 함수
  const analyzeReceipt = async (imageUri: string) => {
    try {
      setIsProcessing(true);
      
      console.log('영수증 분석 시작:', imageUri);
      
      // 기존 OCR API 호출 방식 사용
      const result = await analyzeReceiptImage(imageUri);
      
      console.log('영수증 분석 결과:', result);
      
      if (result.success && result.data?.items) {
        // 재료명만 추출
        const ingredients = result.data.items.map((item: any) => item.name);
        console.log('영수증에서 추출된 재료:', ingredients);
        
        if (ingredients.length > 0) {
          onIngredientsExtracted(ingredients);
          Toast.show({
            type: 'success',
            text1: '영수증 분석 완료',
            text2: `${ingredients.length}개의 재료가 인식되었습니다.`,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: '재료 인식 실패',
            text2: '재료를 찾을 수 없습니다.',
          });
        }
      } else {
        console.log('영수증 분석 실패:', result);
        Toast.show({
          type: 'error',
          text1: '영수증 분석 실패',
          text2: result.message || '영수증을 분석할 수 없습니다.',
        });
      }
    } catch (error: any) {
      console.error('영수증 분석 오류:', error);
      Toast.show({
        type: 'error',
        text1: '영수증 분석 오류',
        text2: error.message || '영수증 분석 중 오류가 발생했습니다.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 카메라 권한 요청
  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (!result.granted) {
      Alert.alert(
        '카메라 권한 필요',
        '영수증을 스캔하기 위해 카메라 권한이 필요합니다.',
        [{ text: '확인', onPress: onClose }]
      );
    }
  };

  // 영수증 촬영
  const handleTakePicture = async () => {
    if (!cameraRef.current || !isCameraReady || isProcessing) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo) {
        await analyzeReceipt(photo.uri);
        onClose();
      }
    } catch (error) {
      console.error('사진 촬영 실패:', error);
      Toast.show({
        type: 'error',
        text1: '촬영 실패',
        text2: '사진 촬영에 실패했습니다.',
      });
    }
  };

  // 갤러리에서 영수증 선택
  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await analyzeReceipt(result.assets[0].uri);
        onClose();
      }
    } catch (error) {
      console.error('갤러리 선택 실패:', error);
      Toast.show({
        type: 'error',
        text1: '갤러리 오류',
        text2: '이미지 선택에 실패했습니다.',
      });
    }
  };

  // 카메라 준비 완료
  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  // 권한이 없는 경우
  if (!permission) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>영수증 스캔</Text>
          </View>
          
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>카메라 권한이 필요합니다</Text>
            <TouchableOpacity 
              style={styles.permissionButton} 
              onPress={handleRequestPermission}
            >
              <Text style={styles.buttonText}>권한 허용</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
            disabled={isProcessing}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>영수증 스캔</Text>
        </View>

        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing="back"
            onCameraReady={handleCameraReady}
          />
          
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.processingText}>영수증을 분석중입니다...</Text>
            </View>
          )}
        </View>
        
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.controlButton, (!isCameraReady || isProcessing) && styles.disabledButton]}
            onPress={handlePickFromGallery}
            disabled={!isCameraReady || isProcessing}
          >
            <Ionicons name="image-outline" size={24} color="#fff" />
            <Text style={styles.controlButtonText}>갤러리</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.captureButton, (!isCameraReady || isProcessing) && styles.disabledButton]}
            onPress={handleTakePicture}
            disabled={!isCameraReady || isProcessing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          
          <View style={styles.controlButton} />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // closeButton 크기만큼 보정
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  controlButton: {
    alignItems: 'center',
    minWidth: 60,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ddd',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 