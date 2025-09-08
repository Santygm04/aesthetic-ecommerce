// src/pages/ProductDetail/ProductDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../utils/api";
import { normalizeProduct, getOff, capitalize } from "../../utils/product";
import useWishlist from "../../hooks/useWishlist";
import { useCart } from "../../components/Carrito/CartContext";

import Gallery from "../../components/Product/Gallery";
import RelatedCarousel from "../../components/Product/RelatedCarousel";
import FavoritesStrip from "../../components/Product/FavoritesStrip";
import "../../pages/ProductDetail/ProductDetail.css";

const isPromoActive = (promo) => {
  if (!promo || !promo.active) return false;
  const now = new Date();
  const fromOk = !promo.desde || new Date(promo.desde) <= now;
  const toOk = !promo.hasta || new Date(promo.hasta) >= now;
  return fromOk && toOk && (promo.precio ?? null) !== null;
};

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const wishlist = useWishlist();

  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [wish, setWish] = useState(false);

  // selección de variantes
  const [selSize, setSelSize] = useState("");
  const [selColor, setSelColor] = useState("");

  // ===== Carga inicial =====
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        // pedimos como admin para evitar filtros viejos en deploys
        const { data } = await api.get(`/api/productos/${id}`, {
          params: { admin: true, _t: Date.now() },
        });

        const notHidden = data.visible !== false;
        const stockOkOrOverride =
          data.visible === true || Number(data.stock ?? 0) > 0;
        if (notHidden && stockOkOrOverride) {
          if (alive) setRaw(data);
        } else {
          if (alive) setRaw(null);
        }
      } catch (e) {
        console.error("Error cargando producto:", e);
        if (alive) setRaw(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // ===== LIVE: escuchar SSE y refrescar si este producto cambia =====
  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const es = new EventSource(`${API}/api/products/stream`, {
      withCredentials: false,
    });

    const refetch = async () => {
      try {
        const { data } = await api.get(`/api/productos/${id}`, {
          params: { admin: true, _t: Date.now() },
        });
        setRaw(data);
      } catch (e) {
        console.warn("SSE refetch error:", e?.message || e);
      }
    };

    const onUpsert = (ev) => {
      try {
        const payload = JSON.parse(ev.data || "{}");
        if (payload?._id && String(payload._id) === String(id)) {
          refetch();
        }
      } catch {}
    };

    const onDelete = (ev) => {
      try {
        const payload = JSON.parse(ev.data || "{}");
        if (payload?._id && String(payload._id) === String(id)) {
          setRaw(null);
        }
      } catch {}
    };

    es.addEventListener("product:upsert", onUpsert);
    es.addEventListener("product:delete", onDelete);
    // keep-alive opcional
    es.addEventListener("ping", () => {});

    return () => {
      es.close();
    };
  }, [id]);

  const p = useMemo(() => (raw ? normalizeProduct(raw) : null), [raw]);

  useEffect(() => {
    if (p?.id) setWish(wishlist.has(p.id));
  }, [p?.id, wishlist]);

  // === Variantes (soporta raw.variants o raw.variantes) ===
  const variants = useMemo(() => {
    const v = raw?.variants ?? raw?.variantes;
    return Array.isArray(v) ? v : [];
  }, [raw]);

  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size).filter(Boolean))),
    [variants]
  );

  const colorsForSize = useMemo(() => {
    if (!selSize)
      return Array.from(new Set(variants.map((v) => v.color).filter(Boolean)));
    return Array.from(
      new Set(
        variants
          .filter((v) => v.size === selSize)
          .map((v) => v.color)
          .filter(Boolean)
      )
    );
  }, [variants, selSize]);

  // variante elegida (si hay size/color seleccionados)
  const chosenVariant = useMemo(() => {
    if (!variants.length) return null;
    const base = selSize ? variants.filter((v) => v.size === selSize) : variants;
    const byColor = selColor ? base.find((v) => v.color === selColor) : base[0];
    return byColor || null;
  }, [variants, selSize, selColor]);

  // Precio con promo si corresponde
  const basePriceForView = Number(chosenVariant?.price ?? p?.precio ?? 0);
  const promoActive = isPromoActive(raw?.promo);
  const priceToShow =
    promoActive && Number(raw?.promo?.precio) < basePriceForView
      ? Number(raw.promo.precio)
      : basePriceForView;

  // precio original a tachar
  const originalForOff =
    promoActive && Number(raw?.promo?.precio) < basePriceForView
      ? basePriceForView
      : p?.precioOriginal ?? null;

  const off = getOff(priceToShow, originalForOff);

  const stockToShow = chosenVariant
    ? Number(chosenVariant.stock || 0)
    : Number(p?.stock || 0);
  const agotado = stockToShow <= 0;

  const handleAddToCart = () => {
    if (agotado || !p) return;
    const img = p.imagenes?.[0] || p.imagen;

    addToCart({
      ...(p.raw || {}),
      _id: p.id,
      nombre: p.nombre,
      imagen: img,
      precio: priceToShow,
      variant: chosenVariant
        ? {
            vid: chosenVariant.vid,
            size: chosenVariant.size,
            color: chosenVariant.color,
          }
        : undefined,
      cantidad: qty,
    });
  };

  const toggleWish = () => {
    wishlist.toggle({
      _id: p.id,
      nombre: p.nombre,
      imagen: p.imagenes?.[0],
      precio: priceToShow,
    });
    setWish((v) => !v);
  };

  if (loading) {
    return (
      <section className="pd skeleton">
        <div className="pd-container">
          <div className="pd-media sk" />
          <div className="pd-buy sk" />
        </div>
      </section>
    );
  }

  if (!p) {
    return (
      <section className="pd">
        <div className="pd-empty">
          <p>No encontramos este producto.</p>
          <Link to="/">Volver al inicio</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="pd">
        <nav className="pd-breadcrumb">
          <Link to="/">Inicio</Link>
          <span>›</span>
          {p.categoria && (
            <>
              <Link to={`/category/${encodeURIComponent(p.categoria)}`}>
                {capitalize(p.categoria)}
              </Link>
              {p.subcategoria && <span>›</span>}
            </>
          )}
        </nav>

        <div className="pd-container">
          <Gallery
            imagenes={p.imagenes}
            off={off}
            agotado={agotado}
            wish={wish}
            onToggleWish={toggleWish}
          />

          {/* === BUY BOX + selectores de variantes === */}
          <div className="pd-buy">
            <h1 className="pd-title">{p.nombre}</h1>

            {/* Chips (categoría) */}
            <div className="pd-chips">
              {p.categoria && (
                <span className="chip outline">{p.categoria}</span>
              )}
              {p.subcategoria && (
                <span className="chip outline">{p.subcategoria}</span>
              )}
            </div>

            {/* Precio */}
            <div className="pd-price">
              <span className="now">
                ${Number(priceToShow).toLocaleString("es-AR")}
              </span>
              {originalForOff && originalForOff > priceToShow && (
                <span className="old">
                  ${Number(originalForOff).toLocaleString("es-AR")}
                </span>
              )}
              {off ? <span className="pd-off">-{off}%</span> : null}
            </div>

            {/* Selectores de variantes (solo si hay) */}
            {variants.length > 0 && (
              <div className="pd-variants">
                {/* Talles */}
                {sizes.length > 0 && (
                  <div className="pd-var-row">
                    <span className="pd-var-label">Talle</span>
                    <div className="swatches">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          className={`swatch ${selSize === s ? "active" : ""}`}
                          onClick={() => {
                            setSelSize(s);
                            const colorsAvail = variants
                              .filter((v) => v.size === s)
                              .map((v) => v.color);
                            if (selColor && !colorsAvail.includes(selColor))
                              setSelColor("");
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colores */}
                {colorsForSize.length > 0 && (
                  <div className="pd-var-row">
                    <span className="pd-var-label">Color</span>
                    <div className="swatches">
                      {colorsForSize.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`swatch ${selColor === c ? "active" : ""}`}
                          onClick={() => setSelColor(c)}
                          title={c}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stock + cantidad */}
            <div className="pd-stock-row">
              <span className={`stock ${agotado ? "danger" : "ok"}`}>
                {agotado ? "Sin stock" : `Stock: ${stockToShow}`}
                {chosenVariant
                  ? ` · ${chosenVariant.size} / ${chosenVariant.color}`
                  : ""}
              </span>

              <div className="qty">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  type="button"
                >
                  -
                </button>
                <input
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.max(1, Number(e.target.value) || 1))
                  }
                />
                <button onClick={() => setQty((q) => q + 1)} type="button">
                  +
                </button>
              </div>
            </div>

            {/* ÚNICO CTA */}
            <button
              className="pd-cta"
              onClick={handleAddToCart}
              disabled={agotado}
              aria-disabled={agotado}
              type="button"
            >
              {agotado ? "Sin stock" : "Agregar al carrito"}
            </button>

            {/* Beneficios (texto simple) */}
            <ul className="pd-benefits" style={{ marginTop: 12 }}>
              <li>
                <span>🚚</span>
                <span>Envío rápido</span>
                <small>a todo el país</small>
              </li>
              <li>
                <span>🛡️</span>
                <span>Compra protegida</span>
                <small>pagos seguros</small>
              </li>
            </ul>
          </div>
        </div>

        <section className="pd-long">
          <div className="pd-card">
            <h2>Descripción</h2>
            <p>{p.descripcion || "Sin descripción disponible."}</p>
          </div>
        </section>
      </section>

      <RelatedCarousel
        categoria={p.categoria}
        subcategoria={p.subcategoria}
        currentId={p.id}
        limit={12}
        title="También te puede interesar"
      />

      <FavoritesStrip wishlist={wishlist.list} />
    </>
  );
}
