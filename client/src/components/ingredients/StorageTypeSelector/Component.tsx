import React, { memo } from 'react';
import { Controller } from 'react-hook-form';
import type { StorageTypeSelectorProps } from './types';
import {
  Container,
  Button,
  ButtonText,
} from './styles';

const STORAGE_TYPES = [
  { value: 'ROOM_TEMP', label: '실온' },
  { value: 'REFRIGERATED', label: '냉장' },
  { value: 'FROZEN', label: '냉동' },
] as const;

export const StorageTypeSelector = memo(({
  control,
  name,
}: StorageTypeSelectorProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <Container>
          {STORAGE_TYPES.map((type) => (
            <Button
              key={type.value}
              isSelected={value === type.value}
              onPress={() => onChange(type.value)}
            >
              <ButtonText isSelected={value === type.value}>
                {type.label}
              </ButtonText>
            </Button>
          ))}
        </Container>
      )}
    />
  );
});

StorageTypeSelector.displayName = 'StorageTypeSelector'; 