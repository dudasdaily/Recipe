export type AddMode = 'SINGLE' | 'MULTI';

export type AddModeSegmentProps = {
  mode: AddMode;
  onModeChange: (mode: AddMode) => void;
  disabled?: boolean;
}; 