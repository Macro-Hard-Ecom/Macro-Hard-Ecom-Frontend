import { createContext, useContext, useState } from "react";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => useContext(CartContext)!;

export const CartProvider = ({ children }: any) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const exist = prev.find(p => p.productId === item.productId);

      if (exist) {
        return prev.map(p =>
          p.productId === item.productId
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }

      return [...prev, item];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(p => p.productId !== productId));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};