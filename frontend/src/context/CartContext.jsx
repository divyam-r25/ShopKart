import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { addToCart, getCart, removeFromCart, updateCartQuantity } from "../services/api";
const CartContext = createContext(null);
export function CartProvider({ user, children }) {
  const [cart, setCart] = useState([]); const [loading, setLoading] = useState(false);
  const refreshCart = useCallback(async () => { if (!user) return setCart([]); setLoading(true); try { const { data } = await getCart(); setCart(data.cart || []); } finally { setLoading(false); } }, [user]);
  useEffect(() => { refreshCart().catch(() => setCart([])); }, [refreshCart]);
  const mutate = async (request) => { const { data } = await request(); setCart(data.cart || []); return data; };
  const count = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  return <CartContext.Provider value={{ cart, count, loading, refreshCart, add: (id) => mutate(() => addToCart(id)), update: (id, q) => mutate(() => updateCartQuantity(id, q)), remove: (id) => mutate(() => removeFromCart(id)), clear: () => setCart([]) }}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
