// src/components/ProductCard/ProductCard.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaRegHeart, FaEye } from "react-icons/fa";
import "../../components/ProductCard/ProductCard.css";
import { useCart } from "../../components/Carrito/CartContext";

const FALLBACK_IMG = "https://via.placeholder.com/700x700.png?text=AESTHETIC";

const WL_KEY = "aesthetic:wishlist";
const readWL = () => {
  try { return JSON.parse(localStorage.getItem(WL_KEY) || "[]"); } catch { return []; }
};
const writeWL = (arr) => {
  try { localStorage.setItem(WL_KEY, JSON.stringify(arr)); } catch {}
};

const isPromoActive = (promo) => {
  if (!promo || !promo.active) return false;
  const now = new Date();
  const fromOk = !promo.desde || new Date(promo.desde) <= now;
  const toOk   = !promo.hasta || new Date(promo.hasta) >= now;
  return fromOk && toOk && (promo.precio ?? null) !== null;
};

export default function ProductCard({ producto }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (!producto) return null;

  const id             = producto._id || producto.id;
  const nombre         = producto.nombre || "";
  const imgSrc         = (producto.imagenes?.[0] || producto.imagen || FALLBACK_IMG);
  const precioBase     = Number(producto.precio ?? producto.price ?? 0);
  const promo          = producto.promo || null;

  const precioOriginalProp = useMemo(() => {
    const raw = producto.precioOriginal ?? producto.preciooriginal ?? producto.originalPrice ?? null;
    return raw != null ? Number(raw) : null;
  }, [producto]);

  const categoria    = producto.categoria;
  const subcategoria = producto.subcategoria;
  const destacado    = Boolean(producto.destacado);
  const nuevo        = Array.isArray(producto.tags) && producto.tags.includes("nuevos-ingresos");

  const variants = useMemo(
    () => (Array.isArray(producto.variants) && producto.variants.length
      ? producto.variants
      : (Array.isArray(producto.variantes) ? producto.variantes : [])),
    [producto.variants, producto.variantes]
  );
  const hasVariantes = variants.length > 0;

  const sizes = useMemo(
    () => Array.from(new Set(variants.map(v => v.size || v.talle).filter(Boolean))),
    [variants]
  );
  const [selSize, setSelSize] = useState("");
  const colorsForSize = useMemo(() => {
    const list = variants
      .filter(v => (selSize ? (v.size === selSize || v.talle === selSize) : true))
      .map(v => v.color)
      .filter(Boolean);
    return Array.from(new Set(list));
  }, [variants, selSize]);
  const [selColor, setSelColor] = useState("");

  useEffect(() => {
    if (!hasVariantes) return;
    if (!selSize && sizes.length) setSelSize(sizes[0]);
  }, [hasVariantes, sizes, selSize]);

  useEffect(() => {
    if (!hasVariantes) return;
    if (selSize && selColor) {
      const valid = variants.some(v => (v.size === selSize || v.talle === selSize) && v.color === selColor);
      if (!valid) setSelColor("");
    }
  }, [selSize, selColor, variants, hasVariantes]);

  const chosenVariant = useMemo(() => {
    if (!hasVariantes) return null;
    const base = selSize ? variants.filter(v => (v.size === selSize || v.talle === selSize)) : variants;
    if (!base.length) return null;
    const byColor = selColor ? base.find(v => v.color === selColor) : base[0];
    return byColor || null;
  }, [variants, hasVariantes, selSize, selColor]);

  const basePriceForView = Number(chosenVariant?.price ?? chosenVariant?.precio ?? precioBase);
  const promoActive = isPromoActive(promo);
  let priceToShow = basePriceForView;
  let precioOriginalToShow = precioOriginalProp;

  if (promoActive && Number(promo.precio) < basePriceForView) {
    precioOriginalToShow = basePriceForView;
    priceToShow = Number(promo.precio);
  } else if (precioOriginalProp && precioOriginalProp <= basePriceForView) {
    precioOriginalToShow = null;
  }

  const stockGlobal = Number(producto.stock ?? producto.Stock ?? 0);
  const hasGlobalStock = stockGlobal > 0;
  const needsSize  = hasVariantes && sizes.length > 0 && !selSize;
  const needsColor = hasVariantes && colorsForSize.length > 0 && !selColor;
  const agotado = !hasGlobalStock;
  const canAdd  = hasGlobalStock && !needsSize && !needsColor;

  const off = useMemo(() => {
    const orig = precioOriginalToShow;
    return (orig && orig > priceToShow)
      ? Math.round((1 - priceToShow / orig) * 100)
      : null;
  }, [precioOriginalToShow, priceToShow]);

  const [wish, setWish] = useState(() => readWL().some((x) => x._id === id));
  useEffect(() => {
    setWish(readWL().some((x) => x._id === id));
  }, [id]);

  const toggleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const wl = readWL();
    if (wl.some((x) => x._id === id)) {
      writeWL(wl.filter((x) => x._id !== id));
      setWish(false);
    } else {
      writeWL([{ _id: id, nombre, imagen: imgSrc, precio: priceToShow }, ...wl]);
      setWish(true);
    }
  };

  const [added, setAdded] = useState(false);

  const onAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canAdd) return;
    const payload = {
      ...producto,
      _id: id,
      precio: priceToShow,
      cantidad: 1,
      stock: Number(producto.stock ?? 0),
      ...(chosenVariant
        ? { variant: { vid: chosenVariant.vid, size: chosenVariant.size || chosenVariant.talle, color: chosenVariant.color, stock: Number(chosenVariant.stock ?? 0) } }
        : {}),
    };
    addToCart(payload);
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  const goDetail = () => navigate(`/producto/${id}`);

  const btnLabel = agotado
    ? "Sin stock"
    : needsSize ? "Elegí talle"
    : needsColor ? "Elegí color"
    : "Agregar al carrito";

  return (
    <div className="product-card pro" role="article">
      <span className="card-border" aria-hidden="true" />

      {/* BADGES — 2) agotado reemplaza a destacado si no hay stock */}
      {nuevo && <span className="badge-nuevos">Nuevo 🚀</span>}
      {off !== null && <span className="badge-off">-{off}%</span>}
      {/* 👇 si está agotado mostramos Agotado en lugar de Destacado */}
      {agotado
        ? <span className="badge-agotado">Agotado</span>
        : destacado && <span className="badge-star">Destacado</span>
      }

      <div
        className="img-link"
        onClick={goDetail}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" ? goDetail() : null)}
        aria-label={nombre}
      >
        <div className="img-container fancy">
          <img
            src={imgSrc}
            alt={nombre}
            onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
          />
          <div className="img-actions">
            <button type="button" className="btn-outline" onClick={goDetail}>
              <FaEye size={14} style={{ marginRight: 6 }} />
              Ver
            </button>
          </div>
          <button
            className={`wish-btn ${wish ? "active" : ""}`}
            onClick={toggleWish}
            aria-label={wish ? "Quitar de favoritos" : "Agregar a favoritos"}
            title={wish ? "Quitar de favoritos" : "Agregar a favoritos"}
            type="button"
          >
            {wish ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
          </button>
        </div>

        <h3 className="titulo" title={nombre}>{nombre}</h3>
      </div>

      {/* 1) chips en 2 columnas */}
      {(categoria || subcategoria) && (
        <div className="chips">
          {categoria && <span className="chip">{categoria}</span>}
          {subcategoria && <span className="chip">{subcategoria}</span>}
        </div>
      )}

      <div className="price-wrap">
        {precioOriginalToShow ? (
          <>
            <span className="price-original">${Number(precioOriginalToShow).toLocaleString("es-AR")}</span>
            <span className="price">${Number(priceToShow).toLocaleString("es-AR")}</span>
          </>
        ) : (
          <span className="price">${Number(priceToShow).toLocaleString("es-AR")}</span>
        )}
      </div>

      {hasVariantes && (
        <div className="pc-opts">
          {sizes.length > 0 && (
            <select className="pc-select" value={selSize} onChange={(e) => setSelSize(e.target.value)} aria-label="Talle">
              {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {colorsForSize.length > 0 && (
            <select className="pc-select" value={selColor} onChange={(e) => setSelColor(e.target.value)} aria-label="Color">
              <option value="">Color</option>
              {colorsForSize.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>
      )}

      <button
        className={`btn-cart big ${added ? "added" : ""}`}
        disabled={!canAdd}
        aria-disabled={!canAdd}
        onClick={onAdd}
        type="button"
        title={btnLabel}
      >
        <FaShoppingCart size={16} style={{ marginRight: 8 }} />
        {btnLabel}
        <span className="btn-sparkle" aria-hidden="true" />
      </button>

      <div style={{ marginTop: 6 }}>
        <Link to={`/producto/${id}`} aria-label={`Ir al detalle de ${nombre}`} style={{ textDecoration: "none", color: "inherit" }} />
      </div>
    </div>
  );
}