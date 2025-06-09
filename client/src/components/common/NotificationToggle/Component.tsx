import React, { memo } from 'react';
import type { NotificationToggleProps } from './types';
import { Container, Toggle, Knob } from './styles';

export const NotificationToggle = memo(({
  value,
  onChange
}: NotificationToggleProps) => {
  return (
    <Container>
      <Toggle
        isEnabled={value}
        onPress={() => onChange(!value)}
        activeOpacity={0.8}
      >
        <Knob isEnabled={value} />
      </Toggle>
    </Container>
  );
});

NotificationToggle.displayName = 'NotificationToggle'; 