import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { addToCart, getCart, removeFromCart, updateCartQuantity } from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ user, children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) return setCart([]);
    setLoading(true);
    setError(false);
    try {
      const { data } = await getCart();
      setCart(data.cart || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Runs an API mutation and syncs cart state from the response
  const mutate = async (requestFn) => {
    const { data } = await requestFn();
    setCart(data.cart || []);
    return data;
  };

  const count = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        count,
        loading,
        error,
        refreshCart,
        add: (id) => mutate(() => addToCart(id)),
        update: (id, quantity) => mutate(() => updateCartQuantity(id, quantity)),
        remove: (id) => mutate(() => removeFromCart(id)),
        clear: () => setCart([]),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
