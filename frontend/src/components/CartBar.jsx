import { Link } from 'react-router-dom';

function CartBar({ totalItems, totalPrice, to }) {
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-30 rounded-xl bg-gray-900 px-4 py-3 text-white shadow-xl md:left-auto md:right-6 md:w-80">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-300">Cart</p>
          <p className="text-sm font-bold">{totalItems} items</p>
        </div>
        <p className="font-display text-lg font-extrabold">{totalPrice.toLocaleString()} VND</p>
      </div>
      <Link
        to={to}
        className="mt-3 block rounded-lg bg-white px-3 py-2 text-center text-sm font-bold text-gray-900"
      >
        View Cart
      </Link>
    </div>
  );
}

export default CartBar;
