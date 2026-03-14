function ProductCard({ product, onAddToCart }) {
  return (
    <article className="glass-card enter-fade rounded-2xl p-4 shadow-sm">
      <div className="mb-3 aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br from-brand-50 to-white">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-brand-700">No image</div>
        )}
      </div>

      <h3 className="font-display text-lg font-bold text-gray-900">{product.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{product.description || 'Freshly prepared.'}</p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-base font-extrabold text-brand-700">{product.price.toLocaleString()} VND</span>
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-black"
        >
          Add
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
