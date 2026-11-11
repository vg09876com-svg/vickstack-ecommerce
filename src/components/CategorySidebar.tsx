
interface CategorySidebarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategorySidebarProps) {
  return (
    <aside className="category-sidebar">
      <h3>Shop by Category</h3>

      <ul>
        {categories.map((category) => (
          <li key={category}>
            <button
              type="button"
              className={
                selectedCategory === category
                  ? "sidebar-category active"
                  : "sidebar-category"
              }
              onClick={() => onSelectCategory(category)}
            >
              <span>{category}</span>
              <span className="category-arrow">›</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default CategorySidebar;
