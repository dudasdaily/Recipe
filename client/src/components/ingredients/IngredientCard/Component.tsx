import React, { memo, useMemo } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import type { IngredientCardProps } from './types';
import {
  Container,
  Header,
  Title,
  ExpiryBadge,
  ExpiryText,
  InfoRow,
  InfoText,
  StorageType,
  StorageText,
  NotificationButton,
} from './styles';
import { colors } from '@/styles/theme';

const STORAGE_TYPE_LABELS = {
  ROOM_TEMP: '실온',
  REFRIGERATED: '냉장',
  FROZEN: '냉동',
} as const;

export const IngredientCard = memo(({ 
  ingredient,
  onPress,
  onDelete,
}: IngredientCardProps) => {
  const daysUntilExpiry = useMemo(() => {
    const today = new Date();
    const expiryDate = new Date(ingredient.expiryDate);
    return differenceInDays(expiryDate, today);
  }, [ingredient.expiryDate]);

  const isExpiryNear = daysUntilExpiry <= 3;

  return (
    <Container onPress={onPress}>
      <Header>
        <Title>{ingredient.name}</Title>
        <ExpiryBadge isNear={isExpiryNear}>
          <ExpiryText>D{daysUntilExpiry >= 0 ? '-' + daysUntilExpiry : '+' + Math.abs(daysUntilExpiry)}</ExpiryText>
        </ExpiryBadge>
      </Header>
      
      <InfoRow>
        <InfoText>
          {ingredient.quantity}{ingredient.unit} / {STORAGE_TYPE_LABELS[ingredient.storageType]}
        </InfoText>
        <NotificationButton onPress={() => {}}>
          <Ionicons 
            name={ingredient.notificationEnabled ? "notifications" : "notifications-outline"}
            size={24}
            color={ingredient.notificationEnabled ? colors.primary.main : colors.text.secondary}
          />
        </NotificationButton>
      </InfoRow>
    </Container>
  );
});

IngredientCard.displayName = 'IngredientCard'; 