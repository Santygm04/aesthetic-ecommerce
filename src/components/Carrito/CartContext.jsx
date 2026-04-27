// src/components/Carrito/CartContext.jsx
import { createContext, useContext, useEffect, useRef, useState, useMemo } from "react";

const CartContext = createContext();
const LS_KEY = "aesthetic:cart";
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

export function useCart() {
  return useContext(CartContext);
}

// ─── CONSTANTES DEL SISTEMA DE PRECIOS ────────────────────────────────────
export const PRECIO_ESPECIAL_MIN_ITEMS = 5;    // 5+ productos distintos (sum de cantidades)
export const PRECIO_MAYORISTA_MIN_ARS  = 30000; // subtotal >= $30.000 (usando precio unitario)

/**
 * Dado el carrito, devuelve el tier de precio que aplica:
 *  "mayorista" | "especial" | "unitario"
 *
 * Regla:
 *  1. Si subtotal (a precio unitario) >= $30.000 → mayorista
 *  2. Si total de unidades >= 5               → especial
 *  3. Sino                                    → unitario
 */
export function calcTier(items) {
  if (!items || items.length === 0) return "unitario";

  const totalUnits = items.reduce((s, it) => s + Number(it.cantidad || 1), 0);

  const subtotalBase = items.reduce(
    (s, it) => s + Number(it.precioUnitario ?? it.precio ?? 0) * Number(it.cantidad || 1),
    0
  );

  // ¿Algún producto tiene precio mayorista definido?
  const hayMayorista = items.some(
    (it) => it.precioMayorista != null && Number(it.precioMayorista) > 0
  );

  // ¿Algún producto tiene precio especial definido?
  const hayEspecial = items.some(
    (it) => it.precioEspecial != null && Number(it.precioEspecial) > 0
  );

  if (hayMayorista && subtotalBase >= PRECIO_MAYORISTA_MIN_ARS) return "mayorista";
  if (hayEspecial  && totalUnits  >= PRECIO_ESPECIAL_MIN_ITEMS) return "especial";
  return "unitario";
}
 
/**
 * Para un ítem, devuelve el precio efectivo según el tier actual.
 * Prioridad: si el producto no tiene precioEspecial/Mayorista, cae al unitario.
 */
export function precioEfectivo(item, tier) {
  const unitario   = Number(item.precioUnitario  ?? item.precio ?? 0);
  const especial   = item.precioEspecial  != null ? Number(item.precioEspecial)  : null;
  const mayorista  = item.precioMayorista != null ? Number(item.precioMayorista) : null;

  if (tier === "mayorista" && mayorista != null && mayorista > 0) return mayorista;
  if (tier === "especial"  && especial  != null && especial  > 0) return especial;
  return unitario;
}

// ─── Helpers de persistencia ───────────────────────────────────────────────
function makeKey(id, variant) {
  return `${id}::${variant?.vid || "default"}`;
}

function deriveMaxStock(obj) {
  if (!obj) return null;
  const vStock = obj?.variant?.stock != null ? Number(obj.variant.stock) : null;
  const pStock = obj?.stock != null ? Number(obj.stock) : (obj?.Stock != null ? Number(obj.Stock) : null);
  const fromPayload = obj?.maxStock != null ? Number(obj.maxStock) : null;
  const candidates = [vStock, pStock, fromPayload].filter(
    (n) => typeof n === "number" && !Number.isNaN(n) && n > 0
  );
  return candidates.length ? candidates[0] : null;
}

function normalizeItems(arr) {
  return arr.map((it) => {
    const id       = it._id || it.id;
    const maxStock = deriveMaxStock(it);
    const cant     = it.cantidad && it.cantidad > 0 ? Number(it.cantidad) : 1;
    return {
      ...it,
      _id:      id,
      key:      it.key || makeKey(id, it.variant || null),
      maxStock: maxStock != null ? maxStock : it.maxStock ?? null,
      cantidad: maxStock != null ? Math.min(cant, maxStock) : cant,
      // Guardamos siempre el precio base (unitario) para calcular tier
      precioUnitario: it.precioUnitario ?? it.precio ?? 0,
    };
  });
}

function readPersisted() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { items: [], savedAt: 0 };
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return { items: data, savedAt: Date.now() };
    return {
      items:   Array.isArray(data.items) ? data.items : [],
      savedAt: Number(data.savedAt || 0),
    };
  } catch { return { items: [], savedAt: 0 }; }
}

function isExpired(savedAt) {
  return !savedAt || Date.now() - savedAt > TTL_MS;
}

function persist(items, savedAt = Date.now()) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ items, savedAt })); } catch {}
}

function clearPersisted() {
  try { localStorage.removeItem(LS_KEY); } catch {}
}

// ─── Provider ──────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  const init    = readPersisted();
  const expired = isExpired(init.savedAt);

  const [cart, setCart]       = useState(expired ? [] : normalizeItems(init.items));
  const [savedAt, setSavedAt] = useState(expired ? 0 : (init.savedAt || Date.now()));
  const expiryTimer           = useRef(null);

  // Expiración exacta (aunque la pestaña esté abierta)
  useEffect(() => {
    if (expiryTimer.current) clearTimeout(expiryTimer.current);
    if (!savedAt) return;
    const msLeft = Math.max(0, savedAt + TTL_MS - Date.now());
    expiryTimer.current = setTimeout(() => {
      setCart([]); setSavedAt(0); clearPersisted();
    }, msLeft);
    return () => expiryTimer.current && clearTimeout(expiryTimer.current);
  }, [savedAt]);

  // Persistir
  useEffect(() => {
    if (cart.length === 0) { clearPersisted(); setSavedAt(0); return; }
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
        if (!data) { setCart([]); setSavedAt(0); return; }
        const items = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
        const sa    = Number(data.savedAt || Date.now());
        if (isExpired(sa)) { setCart([]); setSavedAt(0); clearPersisted(); }
        else { setCart(normalizeItems(items)); setSavedAt(sa); }
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ── TIER calculado en tiempo real ───────────────────────────────────────
  const tier = useMemo(() => calcTier(cart), [cart]);

  // Subtotal usando el precio efectivo del tier actual
  const subtotal = useMemo(
    () => cart.reduce(
      (s, it) => s + precioEfectivo(it, tier) * Number(it.cantidad || 1),
      0
    ),
    [cart, tier]
  );

  // ── addToCart ───────────────────────────────────────────────────────────
  const addToCart = (producto) => {
    const id       = producto._id || producto.id;
    const variant  = producto.variant || null;
    const key      = makeKey(id, variant);
    const maxStock = deriveMaxStock(producto);

    setCart((prev) => {
      const existe = prev.find((p) => p.key === key);
      if (existe) {
        const cur   = Number(existe.cantidad || 1);
        const toAdd = Number(producto.cantidad && producto.cantidad > 0 ? producto.cantidad : 1);
        const cap   = maxStock ?? existe.maxStock ?? null;
        const next  = cap != null ? Math.min(cur + toAdd, cap) : cur + toAdd;
        return prev.map((p) =>
          p.key === key ? { ...p, cantidad: next, maxStock: cap ?? null, variant: variant || p.variant } : p
        );
      }
      const qty      = Number(producto.cantidad && producto.cantidad > 0 ? producto.cantidad : 1);
      const finalQty = maxStock != null ? Math.min(qty, maxStock) : qty;
      return [
        ...prev,
        {
          ...producto,
          _id:      id,
          key,
          cantidad: finalQty,
          maxStock: maxStock ?? null,
          // Guardamos los 3 precios para poder recalcular cuando cambie el tier
          precioUnitario:   Number(producto.precio          ?? producto.precioUnitario  ?? 0),
          precioEspecial:   producto.precioEspecial  != null ? Number(producto.precioEspecial)  : null,
          precioMayorista:  producto.precioMayorista != null ? Number(producto.precioMayorista) : null,
          // ← CAMBIO #8
          unidadesPorCaja:   producto.unidadesPorCaja  ?? null,
          distribucionTonos: producto.distribucionTonos ?? null,
        },
      ];
    });
  };

  const removeFromCart = (key) => setCart((prev) => prev.filter((p) => p.key !== key));

  const updateQuantity = (key, cantidad) => {
    setCart((prev) =>
      prev.map((p) => {
        if (p.key !== key) return p;
        const cap  = p.maxStock != null ? Number(p.maxStock) : deriveMaxStock(p);
        let next   = Math.max(1, Number(cantidad) || 1);
        if (cap != null && cap > 0) next = Math.min(next, cap);
        return { ...p, cantidad: next, maxStock: cap ?? p.maxStock ?? null };
      })
    );
  };

  const clearCart = () => setCart([]);

  const cartCount       = cart.reduce((t, it) => t + (it.cantidad || 1), 0);
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
        // ── Nuevo: tier y subtotal expuestos ──
        tier,       // "unitario" | "especial" | "mayorista"
        subtotal,   // número ya calculado con el tier
        precioEfectivo, // helper para usar en otros componentes
        PRECIO_ESPECIAL_MIN_ITEMS,
        PRECIO_MAYORISTA_MIN_ARS,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}