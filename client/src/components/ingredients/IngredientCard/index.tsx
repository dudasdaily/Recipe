import { memo } from 'react';
import type { IngredientCardProps } from './types';
import { Container, Title, InfoText } from './styles';

export const IngredientCard = memo(({ ingredient }: IngredientCardProps) => {
  const storageTypeLabel = {
    ROOM_TEMP: '실온',
    REFRIGERATED: '냉장',
    FROZEN: '냉동',
  }[ingredient.storage_type];

  return (
    <Container>
      <Title>{ingredient.name}</Title>
      <InfoText>수량: {ingredient.quantity}</InfoText>
      <InfoText>보관 방법: {storageTypeLabel}</InfoText>
      <InfoText>유통기한: {new Date(ingredient.expiry_date).toLocaleDateString()}</InfoText>
    </Container>
  );
});

IngredientCard.displayName = 'IngredientCard'; 