// src/pages/Promos/Promos.jsx
import "../../pages/Promos/Promos.css";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "../../components/ProductCard/ProductCard";
import api from "../../utils/api";
import useProductStream from "../../hooks/useProductStream";

/* ========= helpers ========= */
function toNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function firstImage(p) {
  if (p?.imagen) return p.imagen;
  if (Array.isArray(p?.imagenes) && p.imagenes.length) {
    const f = p.imagenes.find(Boolean);
    if (f) return f;
  }
  return undefined;
}

/** Normaliza y determina si el producto está en PROMO
 * Soporta:
 *  - raw.promo = { active, precio, pct }
 *  - precioPromo | promoPrice | pricePromo
 *  - promoPct | descuentoPct | descuentoPorc
 *  - precioOriginal/originalPrice
 */
function normalizeProduct(raw) {
  const basePrice =
    raw?.precio != null ? toNum(raw.precio) :
    raw?.price  != null ? toNum(raw.price)  : 0;

  // precio promo directo
  let promoPrice =
    toNum(raw?.precioPromo) ??
    toNum(raw?.promoPrice) ??
    toNum(raw?.pricePromo);

  // promo como objeto { active, precio, pct }
  if ((!promoPrice || !(promoPrice > 0)) && raw?.promo && typeof raw.promo === "object") {
    if (raw.promo.active && toNum(raw.promo.precio) > 0)
      promoPrice = toNum(raw.promo.precio);
    if ((!promoPrice || !(promoPrice > 0)) && toNum(raw.promo.pct) > 0) {
      const pct = toNum(raw.promo.pct);
      if (pct > 0 && pct < 100) promoPrice = +(basePrice * (1 - pct / 100)).toFixed(2);
    }
  }

  // porcentaje suelto
  if ((!promoPrice || !(promoPrice > 0))) {
    const pct =
      toNum(raw?.promoPct) ??
      toNum(raw?.descuentoPct) ??
      toNum(raw?.descuentoPorc);
    if (pct > 0 && pct < 100) promoPrice = +(basePrice * (1 - pct / 100)).toFixed(2);
  }

  // compat: campos ya calculados
  let precioOriginal =
    raw?.precioOriginal != null ? toNum(raw.precioOriginal) :
    raw?.originalPrice != null ? toNum(raw.originalPrice) : null;

  let precio = basePrice || 0;
  let isPromo = false;

  if (promoPrice != null && promoPrice > 0 && basePrice && promoPrice < basePrice) {
    precioOriginal = basePrice;
    precio = promoPrice;
    isPromo = true;
  } else if (precioOriginal && basePrice < precioOriginal) {
    // si ya viene original > base, lo consideramos promo
    precio = basePrice;
    isPromo = true;
  } else if (raw?.promo && typeof raw.promo === "object" && raw.promo.active === true) {
    // fallback por si el back devuelve solo .promo.active
    isPromo = true;
  }

  return {
    ...raw,
    _id: raw?._id || raw?.id,
    nombre: raw?.nombre || raw?.name || raw?.titulo || "Producto",
    imagen: firstImage(raw),
    precio,
    precioOriginal,
    promo: isPromo,
    categoria: raw?.categoria || raw?.category || raw?.cat || null,
    subcategoria: raw?.subcategoria || raw?.subCategory || raw?.subcat || null,
    stock: raw?.stock ?? 0,
    activo: raw?.activo ?? true,
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
  };
}

export default function Promos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carga inicial desde tu endpoint de promos (respetamos tu implementación)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);

        const { data } = await api.get("/api/productos/promos", {
          params: { limit: 60, _: Date.now() }, // cache-buster suave
        });

        // Array o { items: [] }
        const list = Array.isArray(data) ? data : (data?.items || []);
        const normalized = list.map(normalizeProduct);
        const onlyPromos = normalized.filter((p) => p.promo && p.activo !== false);

        if (alive) setItems(onlyPromos);
      } catch (err) {
        if (alive) setItems([]);
        if (import.meta.env.DEV) {
          console.error("Promos error:", err?.response?.data || err.message);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  // SSE en vivo: cuando un producto entra/sale de promo o cambia precio
  useProductStream({
    onUpsert: (raw) => {
      const p = normalizeProduct(raw);

      // si quedó inactivo → quitar
      if (p.activo === false) {
        setItems((prev) => prev.filter((x) => x._id !== p._id));
        return;
      }

      // si AHORA está en promo → agregar/actualizar
      if (p.promo) {
        setItems((prev) => {
          const idx = prev.findIndex((x) => x._id === p._id);
          if (idx === -1) return [p, ...prev];
          const next = prev.slice();
          next[idx] = { ...next[idx], ...p };
          return next;
        });
      } else {
        // si dejó de estar en promo → quitar
        setItems((prev) => prev.filter((x) => x._id !== p._id));
      }
    },
    onDelete: (id) => {
      setItems((prev) => prev.filter((x) => x._id !== id));
    },
  });

  // Si querés ordenar, podés agregar un select y usar este memo
  const list = useMemo(() => items, [items]);

  return (
    <section className="promos-section">
      <h2 className="promos-title">Promociones especiales</h2>
      <p className="promos-sub">Aprovechá nuestros combos y precios exclusivos</p>

      {loading ? (
        <p className="promos-msg">Cargando…</p>
      ) : list.length === 0 ? (
        <p className="promos-msg">No hay promociones activas en este momento.</p>
      ) : (
        <div className="promos-grid">
          {list.map((p) => (
            <ProductCard key={p._id} producto={p} />
          ))}
        </div>
      )}
    </section>
  );
}
