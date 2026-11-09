import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MAX_QUANTITY } from "../../shared/checkout.js";

const useCart = create(
  persist(
    (set, get) => ({
      cartItems: [],
      isCartOpen: false,
      setCartOpen: (open) => set({ isCartOpen: open }),
      addItem: (item) =>
        set((state) => {
          const existingItem = state.cartItems.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              cartItems: state.cartItems.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: Math.min(i.quantity + 1, MAX_QUANTITY) }
                  : i,
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
              item.id === itemId
                ? { ...item, quantity: Math.min(newQuantity, MAX_QUANTITY) }
                : item,
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
