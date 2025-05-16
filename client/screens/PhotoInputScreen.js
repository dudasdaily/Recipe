import React, { useEffect, useState } from "react";
import { View, Text, Button, Image, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function PhotoInputScreen({ navigation, route }) {
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("카메라 권한이 필요합니다.");
        navigation.goBack();
      } else {
        launchCamera();
      }
    })();
  }, []);

  const launchCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);

      // 🔽 나중에 서버로 전송해서 음식 이름 받아오기
      // 예: route.params.setName("계란") 같은 식으로 사용
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {imageUri && (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <Button
            title="확인하고 돌아가기"
            onPress={() => navigation.goBack()}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 300,
    height: 400,
    marginBottom: 20,
  },
});
