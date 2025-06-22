import * as React from 'react';
import { useState, useRef } from 'react';
import { View, Alert, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useReceiptStore } from '@/stores/receipt';
import { useNavigationStore } from '@/stores/navigation';
import { useAnalyzeReceipt } from '@/hooks/query/useIngredients';

type ReceiptScannerProps = {
  onScanComplete?: () => void;
  onError?: (error: string) => void;
};

export const ReceiptScanner = ({ 
  onScanComplete, 
  onError 
}: ReceiptScannerProps) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  
  const { 
    isProcessing, 
    setProcessing, 
    setReceiptResult,
    showTransitionModal 
  } = useReceiptStore();
  
  const { disableTabBar, enableTabBar } = useNavigationStore();
  const analyzeReceiptMutation = useAnalyzeReceipt();

  // 카메라 권한 요청
  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (!result.granted) {
      Alert.alert(
        '카메라 권한 필요',
        '영수증을 스캔하기 위해 카메라 권한이 필요합니다.',
        [{ text: '확인' }]
      );
    }
  };

  // 영수증 촬영
  const handleTakePicture = async () => {
    if (!cameraRef.current || !isCameraReady) return;

    try {
      setProcessing(true);
      disableTabBar();

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo) {
        await processReceiptImage(photo.uri);
      }
    } catch (error) {
      console.error('사진 촬영 실패:', error);
      handleError('사진 촬영에 실패했습니다.');
    }
  };

  // 갤러리에서 이미지 선택
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProcessing(true);
        disableTabBar();
        await processReceiptImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('갤러리 이미지 선택 실패:', error);
      handleError('이미지 선택에 실패했습니다.');
    }
  };

  // 영수증 이미지 처리
  const processReceiptImage = async (imageUri: string) => {
    try {
      const result = await analyzeReceiptMutation.mutateAsync(imageUri);
      
      if (result.success) {
        setReceiptResult(result);
        onScanComplete?.();
        
        // 다중 모드 전환 안내
        if (result.data.summary.ingredientItems > 1) {
          showTransitionModal(
            `${result.data.summary.ingredientItems}개의 식재료가 감지되었습니다.\n다중 모드로 전환하여 편집하시겠습니까?`
          );
        }
      } else {
        handleError(result.message);
      }
    } catch (error) {
      console.error('영수증 처리 실패:', error);
      handleError('영수증 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
      enableTabBar();
    }
  };

  // 에러 처리
  const handleError = (message: string) => {
    setProcessing(false);
    enableTabBar();
    onError?.(message);
    Alert.alert('오류', message);
  };

  // 카메라 준비 완료
  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  // 권한이 없는 경우
  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>카메라 권한이 필요합니다</Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={handleRequestPermission}
          >
            <Text style={styles.buttonText}>권한 허용</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          onPress={handlePickImage}
          disabled={!isCameraReady || isProcessing}
        >
          <Text style={styles.buttonText}>갤러리</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.captureButton, (!isCameraReady || isProcessing) && styles.disabledButton]}
          onPress={handleTakePicture}
          disabled={!isCameraReady || isProcessing}
        >
          <Text style={styles.buttonText}>촬영</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
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
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
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
    marginTop: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  controlButton: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  captureButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 50,
    minWidth: 100,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 