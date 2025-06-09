import { memo } from 'react';
import type { IngredientCardProps } from './types';
import { Container, Title, InfoText } from './styles';

export const IngredientCard = memo(({ ingredient, compact }: IngredientCardProps) => {
  const storageTypeLabel = {
    ROOM_TEMP: '실온',
    REFRIGERATED: '냉장',
    FROZEN: '냉동',
  }[ingredient.storage_type];

  return (
    <Container compact={compact}>
      <Title compact={compact}>{ingredient.name}</Title>
      <InfoText compact={compact}>수량: {ingredient.quantity}</InfoText>
      <InfoText compact={compact}>보관 방법: {storageTypeLabel}</InfoText>
      <InfoText compact={compact}>유통기한: {new Date(ingredient.expiry_date).toLocaleDateString()}</InfoText>
    </Container>
  );
});

IngredientCard.displayName = 'IngredientCard'; 