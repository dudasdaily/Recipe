import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddIngredientForm from '@/components/ingredients/AddIngredientForm';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { SimpleReceiptScanner } from '@/components/ingredients/SimpleReceiptScanner';
import { analyzeIngredientImage } from '@/services/api/vision';

export default function AddScreen() {
  const [showBulkSettings, setShowBulkSettings] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [receiptIngredients, setReceiptIngredients] = useState<string[]>([]);
  const [cameraIngredients, setCameraIngredients] = useState<string[]>([]);




  // 영수증 버튼 핸들러
  const handleReceiptPress = () => {
    setShowReceiptScanner(true);
  };

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

  // 갤러리에서 이미지 선택
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
        await processImage(result.assets[0].uri);
      }
    } catch (e: any) {
      Toast.show({ 
        type: 'error', 
        text1: '갤러리 접근 오류', 
        text2: e.message 
      });
    }
  };
  
  // 카메라로 촬영
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
        await processImage(result.assets[0].uri);
      }
    } catch (e: any) {
      Toast.show({ 
        type: 'error', 
        text1: '카메라 오류', 
        text2: e.message 
      });
    }
  };

  // 이미지 분석 처리
  const processImage = async (imageUri: string) => {
    try {
      Toast.show({
        type: 'info',
        text1: '이미지 분석 중',
        text2: '식재료를 인식하고 있습니다...',
      });

      const result = await analyzeIngredientImage(imageUri);
      
      if (result.success && result.data.ingredients && result.data.ingredients.length > 0) {
        const ingredientNames = result.data.ingredients.map((item: any) => item.name);
        setCameraIngredients(ingredientNames);
        
        Toast.show({
          type: 'success',
          text1: '이미지 분석 완료',
          text2: `${ingredientNames.length}개의 식재료가 인식되었습니다.`,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: '식재료 인식 실패',
          text2: result.message || '식재료를 찾을 수 없습니다.',
        });
      }
    } catch (error: any) {
      console.error('이미지 분석 오류:', error);
      Toast.show({
        type: 'error',
        text1: '이미지 분석 오류',
        text2: error.message || '이미지 분석 중 오류가 발생했습니다.',
      });
    }
  };

  // 카메라 버튼 핸들러
  const handleCameraPress = () => {
    Alert.alert(
      '사진 선택',
      '카메라로 촬영하시거나 갤러리에서 선택하세요.',
      [
        { text: '카메라', onPress: takePhoto },
        { text: '갤러리', onPress: pickImage },
        { text: '취소', style: 'cancel' },
      ]
    );
  };

  // 영수증에서 재료가 추출되었을 때 처리
  const handleReceiptIngredientsExtracted = (ingredients: string[]) => {
    console.log('AddScreen - 영수증 재료 추출됨:', ingredients);
    setReceiptIngredients(ingredients);
    setShowReceiptScanner(false);
    Toast.show({
      type: 'success',
      text1: '영수증 처리 완료',
      text2: `${ingredients.length}개의 재료가 인식되었습니다.`,
    });
  };

  // 영수증 스캐너 취소 처리
  const handleReceiptScannerClose = () => {
    setShowReceiptScanner(false);
  };

  // 영수증 재료 사용 완료 처리
  const handleReceiptIngredientsUsed = () => {
    setReceiptIngredients([]);
  };

  // 카메라 재료 사용 완료 처리
  const handleCameraIngredientsUsed = () => {
    setCameraIngredients([]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerWrapper}>
        <Text style={[styles.title, { fontSize: (styles.title.fontSize ?? 28) * 0.7, marginTop: 10 }]}>재료추가</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleReceiptPress}
            activeOpacity={0.7}
          >
            <Ionicons name="receipt-outline" size={20} color="#000" />
            <Text style={styles.actionButtonText}>영수증</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCameraPress}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-outline" size={20} color="#000" />
            <Text style={styles.actionButtonText}>카메라</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.bulkModeButton,
              showBulkSettings && styles.bulkModeButtonSelected
            ]}
            onPress={() => setShowBulkSettings(!showBulkSettings)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.actionButtonText,
              showBulkSettings && styles.bulkModeButtonTextSelected
            ]}>일괄모드</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <AddIngredientForm 
        showBulkSettings={showBulkSettings}
        extractedIngredients={receiptIngredients}
        onIngredientsUsed={handleReceiptIngredientsUsed}
        cameraIngredients={cameraIngredients}
        onCameraIngredientsUsed={handleCameraIngredientsUsed}
      />

      {/* 영수증 스캔 */}
      <SimpleReceiptScanner
        visible={showReceiptScanner}
        onClose={handleReceiptScannerClose}
        onIngredientsExtracted={handleReceiptIngredientsExtracted}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerWrapper: {
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: 2,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginVertical: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    height: 39,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  bulkModeButton: {
    borderRadius: 25,
  },
  bulkModeButtonSelected: {
    borderColor: '#000',
    borderWidth: 2,
  },
  bulkModeButtonTextSelected: {
    color: '#000',
    fontWeight: '700',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
}); 