import React, { memo } from 'react';
import type { AddModeSegmentProps } from './types';
import { Container, SegmentContainer, SegmentButton, SegmentText } from './styles';

export const AddModeSegment = memo(({ 
  mode,
  onModeChange,
}: AddModeSegmentProps) => {
  return (
    <Container>
      <SegmentContainer>
        <SegmentButton
          isSelected={mode === 'SINGLE'}
          onPress={() => onModeChange('SINGLE')}
        >
          <SegmentText isSelected={mode === 'SINGLE'}>단일 추가</SegmentText>
        </SegmentButton>
        <SegmentButton
          isSelected={mode === 'MULTI'}
          onPress={() => onModeChange('MULTI')}
        >
          <SegmentText isSelected={mode === 'MULTI'}>다중 추가</SegmentText>
        </SegmentButton>
      </SegmentContainer>
    </Container>
  );
});

AddModeSegment.displayName = 'AddModeSegment'; 