import React, { useEffect, useState, useRef } from "react";
import { View, Text, Button, Image, StyleSheet } from "react-native";
import * as ExpoCamera from "expo-camera"; // 👈 이렇게
const Camera = ExpoCamera.Camera; // 👈 이렇게

export default function CameraScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photoData = await cameraRef.current.takePictureAsync();
      setPhoto(photoData.uri);
      console.log("📸 찍은 사진 경로:", photoData.uri);
    }
  };

  if (hasPermission === null) return <Text>카메라 권한 요청 중...</Text>;
  if (hasPermission === false)
    return <Text>카메라 접근이 거부되었습니다.</Text>;

  return (
    <View style={{ flex: 1 }}>
      {!photo ? (
        <Camera style={{ flex: 1 }} ref={cameraRef}>
          <View style={styles.cameraBtnContainer}>
            <Button title="사진 찍기" onPress={takePicture} />
          </View>
        </Camera>
      ) : (
        <View style={styles.preview}>
          <Image source={{ uri: photo }} style={{ width: 300, height: 400 }} />
          <Button title="다시 찍기" onPress={() => setPhoto(null)} />
          <Button title="뒤로가기" onPress={() => navigation.goBack()} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cameraBtnContainer: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
  },
  preview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
