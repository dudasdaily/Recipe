import { memo, useMemo } from 'react';
import { Feather } from '@expo/vector-icons';
import type { IngredientListProps } from './types';
import { StorageTypeSelector } from '../StorageTypeSelector';
import { CategoryFilter } from '../CategoryFilter';
import { IngredientCard } from '../IngredientCard';
import {
  Container,
  FilterContainer,
  ListContainer,
  EmptyStateContainer,
  EmptyStateText,
} from './styles';

export const IngredientList = memo(({
  ingredients,
  onPressIngredient,
  onDeleteIngredient,
  onToggleNotification,
  selectedStorageType = 'ALL',
  onStorageTypeChange,
  selectedCategory = 'ALL',
  onCategoryChange,
}: IngredientListProps) => {
  const filteredIngredients = useMemo(() => {
    let filtered = ingredients;

    if (selectedStorageType !== 'ALL') {
      filtered = filtered.filter(
        (ingredient) => ingredient.storageType === selectedStorageType
      );
    }

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(
        (ingredient) => ingredient.category === selectedCategory
      );
    }

    return filtered;
  }, [ingredients, selectedStorageType, selectedCategory]);

  const sortedIngredients = useMemo(() => {
    return [...filteredIngredients].sort((a, b) => {
      const dateA = new Date(a.expiryDate);
      const dateB = new Date(b.expiryDate);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredIngredients]);

  return (
    <Container>
      <FilterContainer>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={onCategoryChange}
        />
        <StorageTypeSelector
          value={selectedStorageType}
          onChange={onStorageTypeChange}
        />
      </FilterContainer>
      <ListContainer>
        {sortedIngredients.length > 0 ? (
          sortedIngredients.map((ingredient) => (
            <IngredientCard
              key={ingredient.id}
              ingredient={ingredient}
              onPress={() => onPressIngredient?.(ingredient)}
              onDelete={() => onDeleteIngredient?.(ingredient.id)}
              onToggleNotification={() => onToggleNotification?.(ingredient.id)}
            />
          ))
        ) : (
          <EmptyStateContainer>
            <Feather name="inbox" size={48} color="#999999" />
            <EmptyStateText>
              {selectedCategory === 'ALL' && selectedStorageType === 'ALL'
                ? '등록된 식재료가 없습니다.'
                : '해당 조건의 식재료가 없습니다.'}
            </EmptyStateText>
          </EmptyStateContainer>
        )}
      </ListContainer>
    </Container>
  );
});

IngredientList.displayName = 'IngredientList'; 