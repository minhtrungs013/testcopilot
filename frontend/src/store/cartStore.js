import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const current = get().items;
        const matched = current.find((item) => item.id === product.id);

        if (matched) {
          set({
            items: current.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          });
          return;
        }

        set({
          items: [
            ...current,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
              note: '',
              selected_options: [],
            },
          ],
        });
      },
      increaseQuantity: (itemId) => {
        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
          ),
        });
      },
      setItemQuantity: (itemId, quantity) => {
        const safeQuantity = Number(quantity);
        if (!Number.isInteger(safeQuantity) || safeQuantity <= 0) {
          return;
        }

        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, quantity: safeQuantity } : item
          ),
        });
      },
      decreaseQuantity: (itemId) => {
        set({
          items: get()
            .items
            .map((item) =>
              item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
            )
            .filter((item) => item.quantity > 0),
        });
      },
      removeItem: (itemId) => {
        set({
          items: get().items.filter((item) => item.id !== itemId),
        });
      },
      setItemNote: (itemId, note) => {
        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, note: String(note || '').slice(0, 200) } : item
          ),
        });
      },
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'customer-cart-store',
      version: 1,
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);

export default useCartStore;
