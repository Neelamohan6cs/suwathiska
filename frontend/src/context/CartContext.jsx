import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import * as cartApi from "../api/cartApi";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const GUEST_KEY = "dairyfeed_guest_cart";

const readGuestCart = () => {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeGuestCart = (items) => {
  localStorage.setItem(GUEST_KEY, JSON.stringify(items));
};

export function CartProvider({ children }) {
  const { isAuthenticated, role } = useAuth();
  const isCustomer = isAuthenticated && role === "customer";

  const [guestItems, setGuestItems] = useState(readGuestCart);
  const [backendCart, setBackendCart] = useState({ items: [], subtotal: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);
  const mergedRef = useRef(false);

  useEffect(() => {
    writeGuestCart(guestItems);
  }, [guestItems]);

  const refreshBackendCart = useCallback(async () => {
    if (!isCustomer) return;
    setLoading(true);
    try {
      const res = await cartApi.getCart();
      setBackendCart(res.data);
    } finally {
      setLoading(false);
    }
  }, [isCustomer]);

  useEffect(() => {
    const merge = async () => {
      if (!isCustomer || mergedRef.current) return;
      mergedRef.current = true;
      setLoading(true);
      try {
        const guest = readGuestCart();
        for (const item of guest) {
          await cartApi.addToCart(item.productId, item.quantity);
        }
        if (guest.length) {
          setGuestItems([]);
          writeGuestCart([]);
        }
        const res = await cartApi.getCart();
        setBackendCart(res.data);
      } finally {
        setLoading(false);
      }
    };

    if (isCustomer) {
      merge();
    } else {
      mergedRef.current = false;
      setBackendCart({ items: [], subtotal: 0, totalItems: 0 });
    }
  }, [isCustomer]);

  const addItem = useCallback(
    async (product, quantity = 1) => {
      if (isCustomer) {
        const res = await cartApi.addToCart(product._id, quantity);
        setBackendCart(res.data);
        return { ok: true };
      }

      setGuestItems((prev) => {
        const existing = prev.find((i) => i.productId === product._id);
        const price = product.discountPrice > 0 ? product.discountPrice : product.price;
        if (existing) {
          const nextQty = existing.quantity + quantity;
          if (nextQty > product.stock) return prev;
          return prev.map((i) =>
            i.productId === product._id ? { ...i, quantity: nextQty, price } : i
          );
        }
        if (quantity > product.stock) return prev;
        return [
          ...prev,
          {
            productId: product._id,
            quantity,
            price,
            product: {
              _id: product._id,
              name: product.name,
              images: product.images,
              price: product.price,
              discountPrice: product.discountPrice,
              stock: product.stock,
              isAvailable: product.isAvailable,
              weight: product.weight,
            },
          },
        ];
      });
      return { ok: true };
    },
    [isCustomer]
  );

  const updateItem = useCallback(
    async (productId, quantity) => {
      if (isCustomer) {
        const res = await cartApi.updateCartItem(productId, quantity);
        setBackendCart(res.data);
        return;
      }
      setGuestItems((prev) => {
        if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
        return prev.map((i) => (i.productId === productId ? { ...i, quantity } : i));
      });
    },
    [isCustomer]
  );

  const removeItem = useCallback(
    async (productId) => {
      if (isCustomer) {
        const res = await cartApi.removeFromCart(productId);
        setBackendCart(res.data);
        return;
      }
      setGuestItems((prev) => prev.filter((i) => i.productId !== productId));
    },
    [isCustomer]
  );

  const clear = useCallback(async () => {
    if (isCustomer) {
      const res = await cartApi.clearCart();
      setBackendCart(res.data);
      return;
    }
    setGuestItems([]);
  }, [isCustomer]);

  const items = isCustomer
    ? backendCart.items.map((i) => ({
        productId: i.product?._id,
        product: i.product,
        quantity: i.quantity,
        price: i.price,
        lineTotal: i.lineTotal,
      }))
    : guestItems.map((i) => ({
        productId: i.productId,
        product: i.product,
        quantity: i.quantity,
        price: i.price,
        lineTotal: i.price * i.quantity,
      }));

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);

  const value = {
    items,
    totalItems,
    subtotal,
    loading,
    isBackendCart: isCustomer,
    addItem,
    updateItem,
    removeItem,
    clear,
    refreshBackendCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
