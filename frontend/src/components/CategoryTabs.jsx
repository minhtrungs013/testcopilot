function CategoryTabs({ categories, activeId, onChange }) {
  return (
    <div className="sticky top-0 z-20 -mx-4 overflow-x-auto border-b border-brand-100 bg-white/80 px-4 py-3 backdrop-blur md:mx-0 md:rounded-xl md:border md:px-3">
      <div className="flex gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeId === category.id
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryTabs;
