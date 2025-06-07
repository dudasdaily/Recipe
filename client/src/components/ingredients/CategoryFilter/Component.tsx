import React, { memo } from 'react';
import type { Category, CategoryFilterProps } from './types';
import {
  Container,
  ScrollView,
  CategoryButton,
  CategoryText,
} from './styles';

const CATEGORIES: Category[] = [
  '채소',
  '과일',
  '육류',
  '해산물',
  '유제품',
  '조미료',
  '기타',
];

export const CategoryFilter = memo(({
  selectedCategory,
  onChange,
}: CategoryFilterProps) => {
  return (
    <Container>
      <ScrollView>
        {CATEGORIES.map((category) => (
          <CategoryButton
            key={category}
            isSelected={selectedCategory === category}
            onPress={() => onChange(category)}
          >
            <CategoryText isSelected={selectedCategory === category}>
              {category}
            </CategoryText>
          </CategoryButton>
        ))}
      </ScrollView>
    </Container>
  );
});

CategoryFilter.displayName = 'CategoryFilter'; 