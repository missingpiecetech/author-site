import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCart = create(
  persist(
    (set, get) => ({
      cartItems: [],
      addItem: (item) =>
        set((state) => {
          const existingItem = state.cartItems.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              cartItems: state.cartItems.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            };
          } else {
            return {
              cartItems: [...state.cartItems, { ...item, quantity: 1 }],
            };
          }
        }),
      removeItem: (itemId) =>
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== itemId),
        })),
      totalItems: () =>
        get().cartItems.reduce((total, item) => total + item.quantity, 0),
      updateQuantity: (itemId, newQuantity) => {
        if (newQuantity < 1) {
          get().removeItem(itemId);
        } else {
          set((state) => ({
            cartItems: state.cartItems.map((item) =>
              item.id === itemId ? { ...item, quantity: newQuantity } : item,
            ),
          }));
        }
      },
    }),
    {
      name: "author-site-cart",
      partialize: (state) => ({ cartItems: state.cartItems }),
    },
  ),
);

export default useCart;
