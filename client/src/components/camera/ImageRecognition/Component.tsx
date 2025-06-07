import React, { memo, useCallback, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import type { ImageRecognitionProps } from './types';
import {
  Container,
  CameraContainer,
  CaptureButton,
  LoadingOverlay,
  LoadingText,
} from './styles';
import { colors } from '@/styles/theme';

export const ImageRecognition = memo(({
  isProcessing,
  onCapture,
  mode,
}: ImageRecognitionProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<Camera>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync();
      const resizedPhoto = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      onCapture(resizedPhoto.uri);
    } catch (error) {
      console.error('Failed to take picture:', error);
    }
  }, [onCapture]);

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return <LoadingText>카메라 접근 권한이 필요합니다.</LoadingText>;
  }

  return (
    <Container>
      <CameraContainer>
        <Camera
          ref={cameraRef}
          type={CameraType.back}
          style={{ flex: 1 }}
        />
        {!isProcessing && (
          <CaptureButton onPress={handleCapture}>
            <View style={{ width: 40, height: 40, backgroundColor: colors.primary.main, borderRadius: 20 }} />
          </CaptureButton>
        )}
        {isProcessing && (
          <LoadingOverlay>
            <ActivityIndicator size="large" color={colors.white} />
            <LoadingText>이미지 분석 중...</LoadingText>
          </LoadingOverlay>
        )}
      </CameraContainer>
    </Container>
  );
});

ImageRecognition.displayName = 'ImageRecognition'; 