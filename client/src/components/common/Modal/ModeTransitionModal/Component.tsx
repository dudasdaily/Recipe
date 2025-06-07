import React, { memo } from 'react';
import { Modal } from 'react-native';
import type { ModeTransitionModalProps } from './types';
import {
  ModalContainer,
  ModalContent,
  ModalScrollContent,
  ModalTitle,
  ModalMessage,
  ButtonContainer,
  Button,
  ButtonText,
} from './styles';

export const ModeTransitionModal = memo(({
  isVisible,
  onConfirm,
  onCancel,
  title = "다중 모드로 전환",
  message = "영수증에서 여러 재료가 인식되었습니다.\n다중 모드로 전환하시겠습니까?",
  recognizedItems = [],
}: ModeTransitionModalProps) => {
  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <ModalContainer>
        <ModalContent>
          <ModalTitle>{title}</ModalTitle>
          <ModalScrollContent>
            <ModalMessage>{message}</ModalMessage>
            {recognizedItems.length > 0 && (
              <>
                <ModalMessage>인식된 재료:</ModalMessage>
                {recognizedItems.map((item, index) => (
                  <ModalMessage key={index}>
                    • {item.name} (신뢰도: {item.confidence}%)
                  </ModalMessage>
                ))}
              </>
            )}
          </ModalScrollContent>
          <ButtonContainer>
            <Button variant="secondary" onPress={onCancel}>
              <ButtonText variant="secondary">취소</ButtonText>
            </Button>
            <Button variant="primary" onPress={onConfirm}>
              <ButtonText variant="primary">전환</ButtonText>
            </Button>
          </ButtonContainer>
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
});

ModeTransitionModal.displayName = 'ModeTransitionModal'; 