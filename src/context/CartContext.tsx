
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { Product } from "../types/Product";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  increaseQuantity: (productId: string | number) => void;
  decreaseQuantity: (productId: string | number) => void;
  removeFromCart: (productId: string | number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Add a product while respecting available stock.
  const addToCart = (product: Product) => {
    if (product.stock !== undefined && product.stock <= 0) {
      return;
    }

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) =>
          String(item.product.id) === String(product.id)
      );

      if (existingItem) {
        if (
          product.stock !== undefined &&
          existingItem.quantity >= product.stock
        ) {
          return currentItems;
        }

        return currentItems.map((item) =>
          String(item.product.id) === String(product.id)
            ? {
                ...item,
                product,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [...currentItems, { product, quantity: 1 }];
    });
  };

  // Increase quantity without exceeding available stock.
  const increaseQuantity = (productId: string | number) => {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (String(item.product.id) !== String(productId)) {
          return item;
        }

        if (
          item.product.stock !== undefined &&
          item.quantity >= item.product.stock
        ) {
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );
  };

  // Decrease quantity.
  const decreaseQuantity = (productId: string | number) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          String(item.product.id) === String(productId)
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove a product completely.
  const removeFromCart = (productId: string | number) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => String(item.product.id) !== String(productId)
      )
    );
  };

  // Clear the cart after a successful order.
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate total number of products.
  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Calculate total cart price.
  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}
