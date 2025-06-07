export type Category = 
  | '채소'
  | '과일'
  | '육류'
  | '해산물'
  | '유제품'
  | '조미료'
  | '기타';

export type CategoryFilterProps = {
  selectedCategory?: Category;
  onChange: (category: Category) => void;
}; 