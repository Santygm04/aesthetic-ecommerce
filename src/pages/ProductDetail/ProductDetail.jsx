// src/pages/ProductDetail/ProductDetail.jsx
import { Helmet } from "react-helmet-async"; 
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../utils/api";
import { normalizeProduct, getOff, capitalize } from "../../utils/product";
import useWishlist from "../../hooks/useWishlist";
import { useCart } from "../../components/Carrito/CartContext";

import Gallery from "../../components/Product/Gallery";
import RelatedCarousel from "../../components/Product/RelatedCarousel";
import FavoritesStrip from "../../components/Product/FavoritesStrip";
import BuyBox from "../../components/Product/BuyBox";  // ← CAMBIO
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
  const [qty, setQty] = useState(Number(raw?.unidadesPorCaja) || 1);
  const [wish, setWish] = useState(false);

  // selección de variantes
  const [selSize, setSelSize] = useState("");
  const [selColor, setSelColor] = useState("");

  // Reset de selección al cambiar de producto
 useEffect(() => {
  setSelSize("");
  setSelColor("");
  setQty(Number(raw?.unidadesPorCaja) || 1);
}, [id]);

useEffect(() => {
  if (!raw) return;
  setQty(Number(raw.unidadesPorCaja) || 1);
}, [raw?.unidadesPorCaja]);

  // ===== Carga inicial =====
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
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
    es.addEventListener("ping", () => {});
    return () => es.close();
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

  // Variantes con stock
  const variantsInStock = useMemo(
    () => variants.filter((v) => Number(v?.stock || 0) > 0),
    [variants]
  );

  // Preseleccionar automáticamente la primera variante con stock
  useEffect(() => {
    if (!variants.length) return;
    if (selSize || selColor) return; // ya hay selección del usuario
    const firstOk = variantsInStock[0] || variants[0];
    if (firstOk?.size) setSelSize(firstOk.size);
    if (firstOk?.color) setSelColor(firstOk.color);
  }, [variants, variantsInStock, selSize, selColor]);

  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size).filter(Boolean))),
    [variants]
  );

  const isSizeDisabled = (s) =>
    !variants.some((v) => v.size === s && Number(v.stock || 0) > 0);

  const colorsForSize = useMemo(() => {
    const base = selSize ? variants.filter((v) => v.size === selSize) : variants;
    return Array.from(new Set(base.map((v) => v.color).filter(Boolean)));
  }, [variants, selSize]);

  const isColorDisabled = (c) => {
    if (selSize) {
      const v = variants.find((x) => x.size === selSize && x.color === c);
      return !v || Number(v.stock || 0) <= 0;
    }
    const hasStock = variants.some(
      (x) => x.color === c && Number(x.stock || 0) > 0
    );
    return !hasStock;
  };

  // Variante elegida
  const firstInStock = useMemo(
    () => variantsInStock[0] || null,
    [variantsInStock]
  );

  const chosenVariant = useMemo(() => {
    if (!variants.length) return null;

    const full =
      selSize && selColor
        ? variants.find((v) => v.size === selSize && v.color === selColor)
        : null;
    if (full) return full;

    if (selSize) {
      const withStockForSize =
        variants.find(
          (v) => v.size === selSize && Number(v.stock || 0) > 0
        ) || null;
      if (withStockForSize) return withStockForSize;

      const anyForSize = variants.find((v) => v.size === selSize) || null;
      if (anyForSize) return anyForSize;
    }

    return firstInStock || variants[0] || null;
  }, [variants, selSize, selColor, firstInStock]);

  // Precio con promo si corresponde
  const basePriceForView = Number(chosenVariant?.price ?? p?.precio ?? 0);
  const promoActive = isPromoActive(raw?.promo);
  const priceToShow =
    promoActive && Number(raw?.promo?.precio) < basePriceForView
      ? Number(raw.promo.precio)
      : basePriceForView;

  const originalForOff =
    promoActive && Number(raw?.promo?.precio) < basePriceForView
      ? basePriceForView
      : p?.precioOriginal ?? null;

  const off = getOff(priceToShow, originalForOff);

  // Fallback: usar stock del producto si ninguna variante tiene stock
  const hasVariantStock = variantsInStock.length > 0;
  const stockToShow = hasVariantStock
    ? (chosenVariant ? Number(chosenVariant.stock || 0) : 0)
    : Number(p?.stock || 0);
  const agotado = stockToShow <= 0;

  // Limitar cantidad máxima al stock disponible
  const maxQty = Math.max(agotado ? 1 : stockToShow, 1);
  useEffect(() => {
    setQty((q) => {
      const n = Number(q) || 1;
      return Math.min(Math.max(1, n), maxQty);
    });
  }, [maxQty]);

  // ← CAMBIO #8: calcular distribución de tonos para pasar al carrito
  const cantTonos = Number(raw?.cantidadTonos) || 0;
  const tonosDisp = Array.isArray(raw?.tonosDisponibles) && raw.tonosDisponibles.length
    ? raw.tonosDisponibles
    : cantTonos ? Array.from({ length: cantTonos }, (_, i) => `Tono ${i + 1}`) : [];
  const porTono = cantTonos > 0 ? Math.floor(qty / cantTonos) : 0;
  const extra   = cantTonos > 0 ? qty % cantTonos : 0;
  const distribucionTonos = cantTonos > 0
    ? tonosDisp.map((t, i) => ({ tono: t, cantidad: porTono + (i < extra ? 1 : 0) }))
    : null;

  const handleAddToCart = () => {
    if (agotado || !p) return;
    const img = p.imagenes?.[0] || p.imagen;

    addToCart({
    ...(p.raw || {}),
    _id:             p.id,
    nombre:          p.nombre,
    imagen:          img,
    precio:          Number(raw?.precio          ?? p?.precio ?? 0),
    precioUnitario:  Number(raw?.precio          ?? p?.precio ?? 0),
    precioEspecial:  raw?.precioEspecial  != null ? Number(raw.precioEspecial)  : null,
    precioMayorista: raw?.precioMayorista != null ? Number(raw.precioMayorista) : null,
    minimoMayorista: raw?.minimoMayorista != null ? Number(raw.minimoMayorista) : null,
    stock:           Number(p?.stock || 0),
    variant: chosenVariant
    ? {
        vid:   chosenVariant.vid,
        size:  chosenVariant.size,
        color: chosenVariant.color,
        stock: Number(chosenVariant.stock || 0),
      }
    : undefined,
  cantidad: qty,
   // ← CAMBIO #8: distribución de tonos y unidades por caja
  unidadesPorCaja:    raw?.unidadesPorCaja ?? null,
  distribucionTonos:  distribucionTonos,
    });
  };

  const toggleWish = () => {
    wishlist.toggle({
      _id:    p.id,
      nombre: p.nombre,
      imagen: p.imagenes?.[0],
      precio: priceToShow,
      stock:  Number(p?.stock || raw?.stock || 1), // ← CAMBIO: pasar stock real
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

    {/* ── SEO DINÁMICO POR PRODUCTO ← CAMBIO SEO ── */}
      {p && (
        <Helmet>
          {/* Título */}
          <title>{p.nombre} | AESTHETIC</title>

          {/* Meta descripción */}
          <meta
            name="description"
            content={
              p.descripcion
                ? p.descripcion.slice(0, 155)
                : `Comprá ${p.nombre} en AESTHETIC. Envíos a todo el país.`
            }
          />

          {/* Canonical */}
          <link
            rel="canonical"
            href={`https://aestheticmakeup.com.ar/producto/${p.id}`}
          />

          {/* Open Graph — para WhatsApp, Facebook, Instagram */}
          <meta property="og:type"        content="product" />
          <meta property="og:title"       content={`${p.nombre} | AESTHETIC`} />
          <meta
            property="og:description"
            content={
              p.descripcion
                ? p.descripcion.slice(0, 155)
                : `Comprá ${p.nombre} en AESTHETIC`
            }
          />
          <meta
            property="og:image"
            content={p.imagenes?.[0] || p.imagen || "https://aestheticmakeup.com.ar/logo.png"}
          />
          <meta
            property="og:url"
            content={`https://aestheticmakeup.com.ar/producto/${p.id}`}
          />
          <meta property="og:site_name"   content="AESTHETIC" />
          <meta property="og:locale"      content="es_AR" />

          {/* Twitter Card */}
          <meta name="twitter:card"        content="summary_large_image" />
          <meta name="twitter:title"       content={`${p.nombre} | AESTHETIC`} />
          <meta
            name="twitter:description"
            content={
              p.descripcion
                ? p.descripcion.slice(0, 155)
                : `Comprá ${p.nombre} en AESTHETIC`
            }
          />
          <meta
            name="twitter:image"
            content={p.imagenes?.[0] || p.imagen || "https://aestheticmakeup.com.ar/logo.png"}
          />

          {/* Schema.org Product — para Google Shopping y rich results */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: p.nombre,
              description: p.descripcion || `Comprá ${p.nombre} en AESTHETIC`,
              image: p.imagenes?.[0] || p.imagen || "",
              url: `https://aestheticmakeup.com.ar/producto/${p.id}`,
              brand: {
                "@type": "Brand",
                name: "AESTHETIC",
              },
              offers: {
                "@type": "Offer",
                priceCurrency: "ARS",
                price: Number(raw?.precio ?? p.precio ?? 0),
                availability: agotado
                  ? "https://schema.org/OutOfStock"
                  : "https://schema.org/InStock",
                seller: {
                  "@type": "Organization",
                  name: "AESTHETIC",
                },
              },
            })}
          </script>
        </Helmet>
      )}

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

          {/* === BUY BOX con sistema 3 precios ← CAMBIO #7 === */}
          <BuyBox
           producto={{
              nombre:          p.nombre,
              categoria:       p.categoria,
              subcategoria:    p.subcategoria,
              marca:           raw?.marca ?? null,
              precio:          Number(raw?.precio ?? p?.precio ?? 0),
              precioEspecial:  raw?.precioEspecial  != null ? Number(raw.precioEspecial)  : null,
              precioMayorista: raw?.precioMayorista != null ? Number(raw.precioMayorista) : null,
              minimoMayorista: raw?.minimoMayorista != null ? Number(raw.minimoMayorista) : null,
              tienda:          raw?.tienda   ?? null,
              garantiaDias:    raw?.garantiaDias ?? null,
              unidadesPorCaja: raw?.unidadesPorCaja ?? null,
              cantidadTonos:   raw?.cantidadTonos   ?? null,
              modoTonos:       raw?.modoTonos || "automatico",
              tonosDisponibles: Array.isArray(raw?.tonosDisponibles) ? raw.tonosDisponibles : [],
            }}
            stockNum={stockToShow}
            agotado={agotado}
            qty={qty}
            setQty={setQty}
            onAddToCart={handleAddToCart}
            // ── Variantes: BuyBox las renderiza si las recibe ← CAMBIO
            variants={variants}
            sizes={sizes}
            selSize={selSize}
            setSelSize={setSelSize}
            colorsForSize={colorsForSize}
            selColor={selColor}
            setSelColor={setSelColor}
            isSizeDisabled={isSizeDisabled}
            isColorDisabled={isColorDisabled}
            chosenVariant={chosenVariant}
            maxQty={maxQty}
          />
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