import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddIngredientForm from '@/components/ingredients/AddIngredientForm';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function AddScreen() {
  const [showBulkSettings, setShowBulkSettings] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerWrapper}>
        <Text style={[styles.title, { fontSize: (styles.title.fontSize ?? 28) * 0.7, marginTop: 10 }]}>재료추가</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {/* 영수증 기능 */}}
            activeOpacity={0.7}
          >
            <Ionicons name="receipt-outline" size={20} color="#000" />
            <Text style={styles.actionButtonText}>영수증</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {/* 카메라 기능 */}}
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
      <AddIngredientForm showBulkSettings={showBulkSettings} />
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