// src/components/Carrito/CartContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";

const CartContext = createContext();
const LS_KEY = "aesthetic:cart";
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

export function useCart() {
  return useContext(CartContext);
}

function makeKey(id, variant) {
  return `${id}::${variant?.vid || "default"}`;
}

// === STOCK helper: detecta el stock disponible del producto/variante ===
function deriveMaxStock(obj) {
  if (!obj) return null;
  // prioridad: stock de variante > stock de producto
  const vStock = obj?.variant && obj.variant.stock != null ? Number(obj.variant.stock) : null;
  const pStock =
    obj?.stock != null
      ? Number(obj.stock)
      : (obj?.Stock != null ? Number(obj.Stock) : null);

  const fromPayload =
    obj?.maxStock != null ? Number(obj.maxStock) : null;

  // el primero definido y > 0
  const candidates = [vStock, pStock, fromPayload].filter(
    (n) => typeof n === "number" && !Number.isNaN(n) && n > 0
  );
  return candidates.length ? candidates[0] : null; // null = sin límite conocido
}

function normalizeItems(arr) {
  return arr.map((it) => {
    const id = it._id || it.id;
    const maxStock = deriveMaxStock(it);
    const cant = it.cantidad && it.cantidad > 0 ? Number(it.cantidad) : 1;
    return {
      ...it,
      _id: id,
      key: it.key || makeKey(id, it.variant || null),
      maxStock: maxStock != null ? maxStock : it.maxStock ?? null,
      cantidad: maxStock != null ? Math.min(cant, maxStock) : cant,
    };
  });
}

function readPersisted() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { items: [], savedAt: 0 };

    const data = JSON.parse(raw);
    // Compatibilidad con versión anterior (guardaba un array solo)
    if (Array.isArray(data)) return { items: data, savedAt: Date.now() };

    const items = Array.isArray(data.items) ? data.items : [];
    const savedAt = Number(data.savedAt || 0);
    return { items, savedAt };
  } catch {
    return { items: [], savedAt: 0 };
  }
}

function isExpired(savedAt) {
  return !savedAt || Date.now() - savedAt > TTL_MS;
}

function persist(items, savedAt = Date.now()) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ items, savedAt }));
  } catch {}
}

function clearPersisted() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {}
}

export function CartProvider({ children }) {
  // Carga inicial con TTL
  const init = readPersisted();
  const expired = isExpired(init.savedAt);
  const [cart, setCart] = useState(
    expired ? [] : normalizeItems(init.items)
  );
  const [savedAt, setSavedAt] = useState(expired ? 0 : (init.savedAt || Date.now()));
  const expiryTimer = useRef(null);

  // Programar expiración exacta (aunque la pestaña esté abierta)
  useEffect(() => {
    if (expiryTimer.current) clearTimeout(expiryTimer.current);
    if (!savedAt) return;
    const msLeft = Math.max(0, savedAt + TTL_MS - Date.now());
    expiryTimer.current = setTimeout(() => {
      setCart([]);
      setSavedAt(0);
      clearPersisted();
    }, msLeft);
    return () => expiryTimer.current && clearTimeout(expiryTimer.current);
  }, [savedAt]);

  // Persistir en localStorage (y renovar TTL sólo si hay ítems)
  useEffect(() => {
    if (cart.length === 0) {
      clearPersisted();
      setSavedAt(0);
      return;
    }
    const now = Date.now();
    persist(cart, now);
    setSavedAt(now);
  }, [cart]);

  // Sincronizar entre pestañas
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== LS_KEY) return;
      try {
        const data = e.newValue ? JSON.parse(e.newValue) : null;
        if (!data) {
          setCart([]);
          setSavedAt(0);
          return;
        }
        const items = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
        const sa = Number(data.savedAt || Date.now());
        if (isExpired(sa)) {
          setCart([]);
          setSavedAt(0);
          clearPersisted();
        } else {
          setCart(normalizeItems(items));
          setSavedAt(sa);
        }
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Agrega productos al carrito (unifica por productoId + variante) con límite por stock
  const addToCart = (producto) => {
    const id = producto._id || producto.id;
    const variant = producto.variant || null; // {vid,size,color,stock?}
    const key = makeKey(id, variant);
    const maxStock = deriveMaxStock(producto);

    setCart((prev) => {
      const existe = prev.find((p) => p.key === key);
      if (existe) {
        const cur = Number(existe.cantidad || 1);
        const toAdd = Number(producto.cantidad && producto.cantidad > 0 ? producto.cantidad : 1);
        const cap = (maxStock != null ? maxStock : (existe.maxStock != null ? existe.maxStock : null));
        const next = cap != null ? Math.min(cur + toAdd, cap) : (cur + toAdd);
        return prev.map((p) =>
          p.key === key
            ? {
                ...p,
                cantidad: next,
                // guardamos/actualizamos el stock máximo conocido
                maxStock: cap != null ? cap : null,
                // si mandaron una variante más específica, la mantenemos
                variant: variant || p.variant,
              }
            : p
        );
      }
      const qty = Number(producto.cantidad && producto.cantidad > 0 ? producto.cantidad : 1);
      const finalQty = maxStock != null ? Math.min(qty, maxStock) : qty;
      return [
        ...prev,
        {
          ...producto,
          _id: id,
          key,
          cantidad: finalQty,
          maxStock: maxStock != null ? maxStock : null,
        },
      ];
    });
  };

  // Remueve un item por key (producto + variante)
  const removeFromCart = (key) => {
    setCart((prev) => prev.filter((p) => p.key !== key));
  };

  // Cambia la cantidad de un item por key (respetando stock)
  const updateQuantity = (key, cantidad) => {
    setCart((prev) =>
      prev.map((p) => {
        if (p.key !== key) return p;
        const cap = p.maxStock != null ? Number(p.maxStock) : deriveMaxStock(p);
        let next = Math.max(1, Number(cantidad) || 1);
        if (cap != null && cap > 0) next = Math.min(next, cap);
        return { ...p, cantidad: next, maxStock: cap != null ? cap : p.maxStock ?? null };
      })
    );
  };

  // Vacía el carrito
  const clearCart = () => setCart([]);

  // Total de ítems (sumando cantidades)
  const cartCount = cart.reduce((total, item) => total + (item.cantidad || 1), 0);

  // Ítems distintos
  const cartUniqueCount = cart.length;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartUniqueCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
