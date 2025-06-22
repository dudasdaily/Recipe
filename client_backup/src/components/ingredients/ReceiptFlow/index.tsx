import * as React from 'react';
import { useState } from 'react';
import { View, Modal, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useReceiptStore } from '@/stores/receipt';
import { useNavigationStore } from '@/stores/navigation';
import { ReceiptScanner } from '../ReceiptScanner';
import { ReceiptResult } from '../ReceiptResult';

type ReceiptFlowProps = {
  visible: boolean;
  onClose: () => void;
  onComplete?: () => void;
};

export const ReceiptFlow = ({ 
  visible, 
  onClose, 
  onComplete 
}: ReceiptFlowProps) => {
  const { 
    currentStep, 
    processedReceipt,
    isTransitionModalVisible,
    transitionMessage,
    hideTransitionModal,
    resetState 
  } = useReceiptStore();
  
  const { enableTabBar } = useNavigationStore();

  // 스캔 완료 처리
  const handleScanComplete = () => {
    // 영수증 처리 완료 시 결과 화면으로 이동
    console.log('영수증 스캔 완료:', processedReceipt);
  };

  // 저장 완료 처리
  const handleSaveComplete = () => {
    resetState();
    enableTabBar();
    onComplete?.();
    onClose();
  };

  // 취소 처리
  const handleCancel = () => {
    resetState();
    enableTabBar();
    onClose();
  };

  // 모드 전환 모달 확인
  const handleTransitionConfirm = () => {
    hideTransitionModal();
    // 다중 모드로 전환 로직은 이미 store에서 처리됨
  };

  // 모드 전환 모달 취소
  const handleTransitionCancel = () => {
    hideTransitionModal();
    // 단일 모드 유지
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        {/* 단계별 화면 렌더링 */}
        {currentStep === 'SCAN' && (
          <ReceiptScanner
            onScanComplete={handleScanComplete}
            onError={(error) => {
              console.error('스캔 에러:', error);
            }}
          />
        )}
        
        {(currentStep === 'REVIEW' || currentStep === 'EDIT' || currentStep === 'SAVE') && (
          <ReceiptResult
            onSaveComplete={handleSaveComplete}
            onCancel={handleCancel}
          />
        )}

        {/* 모드 전환 모달 */}
        {isTransitionModalVisible && (
          <Modal
            visible={true}
            transparent={true}
            animationType="fade"
            onRequestClose={handleTransitionCancel}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>다중 모드 전환</Text>
                <Text style={styles.modalMessage}>{transitionMessage}</Text>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]} 
                    onPress={handleTransitionCancel}
                  >
                    <Text style={styles.buttonText}>취소</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.confirmButton]} 
                    onPress={handleTransitionConfirm}
                  >
                    <Text style={styles.buttonText}>전환</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 