import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

export default function IngredientAddScreen({ navigation }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [expiry, setExpiry] = useState("");

  const isComplete = name && amount && expiry;

  const handleSubmit = () => {
    console.log("재료 저장:", { name, amount, expiry });
    // TODO: 백엔드에 저장 요청
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>음식 종류</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="예: 계란"
      />

      <Text style={styles.label}>수량</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="예: 2"
      />

      <Text style={styles.label}>유통기한</Text>
      <TextInput
        style={styles.input}
        value={expiry}
        onChangeText={setExpiry}
        placeholder="YYYY-MM-DD"
      />

      {/* 📸 사진 촬영 버튼 */}
      <View style={{ marginVertical: 10 }}>
        <Button
          title="📸 사진으로 입력하기"
          onPress={() => navigation.navigate("사진 촬영")}
        />
      </View>

      <Button title="저장" onPress={handleSubmit} disabled={!isComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontWeight: "bold",
    marginTop: 12,
  },
  input: {
    borderBottomWidth: 1,
    padding: 8,
    marginBottom: 12,
  },
});
