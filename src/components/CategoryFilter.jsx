import { CATEGORIES } from '../data/dummyData';
import './CategoryFilter.css';

function CategoryFilter({ activeCategory, onCategoryChange }) {
  const allCategories = ['Semua', ...CATEGORIES];

  return (
    <div className="category-filter" role="tablist" aria-label="Filter kategori menfess">
      {allCategories.map((cat) => {
        const isActive = activeCategory === cat;
        const categoryClass =
          cat === 'Semua' ? '' : `category-${cat.toLowerCase()}`;

        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            className={`category-filter__pill clay-pill ${categoryClass} ${
              isActive ? 'clay-pill--active' : ''
            }`}
            onClick={() => onCategoryChange(cat)}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryFilter;
