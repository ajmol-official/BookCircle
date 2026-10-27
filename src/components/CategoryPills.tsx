import React from 'react';

interface CategoryPillsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap active:scale-95 ${
              isSelected
                ? 'bg-brand text-white shadow-sm ring-1 ring-brand'
                : 'bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-300/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};
