import type { Control } from 'react-hook-form';
import type { StorageType } from '@/types/ingredient';

export type StorageType = 'ROOM_TEMP' | 'REFRIGERATED' | 'FROZEN';

export type StorageTypeSelectorProps = {
  value: StorageType;
  onChange: (type: StorageType) => void;
}; 