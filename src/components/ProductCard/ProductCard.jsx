// src/components/ProductCard/ProductCard.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaRegHeart } from "react-icons/fa";
import "../../components/ProductCard/ProductCard.css";
import { useCart, precioEfectivo } from "../../components/Carrito/CartContext";

const FALLBACK_IMG = "";

const WL_KEY  = "aesthetic:wishlist";
const readWL  = () => { try { return JSON.parse(localStorage.getItem(WL_KEY) || "[]"); } catch { return []; } };
const writeWL = (arr) => { try { localStorage.setItem(WL_KEY, JSON.stringify(arr)); } catch {} };

const isPromoActive = (promo) => {
  if (!promo?.active) return false;
  const now = new Date();
  return (!promo.desde || new Date(promo.desde) <= now)
      && (!promo.hasta || new Date(promo.hasta) >= now)
      && promo.precio != null;
};

const fmtARS = (n) =>
  `$${Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// Etiqueta de color para cada tier
const TIER_LABELS = {
  unitario:  { label: "Unitario",   color: "#fff",    bg: "#1a1a1a", border: "#1a1a1a" },
  especial:  { label: "Especial",   color: "#fff",    bg: "#f97316", border: "#f97316" },
  mayorista: { label: "Mayorista",  color: "#1a1a1a", bg: "#84e070", border: "#4caf50" },
};

export default function ProductCard({ producto }) {
  const { addToCart, tier } = useCart();
  const navigate = useNavigate();

  if (!producto) return null;

  const id      = producto._id || producto.id;
  const nombre  = producto.nombre || "";
  const imgSrc  = producto.imagenes?.[0] || producto.imagen || FALLBACK_IMG;

  // ── Precios base ─────────────────────────────────────────────────────────
  const precioUnitario   = Number(producto.precio          ?? 0);
  const precioEspecialP  = producto.precioEspecial  != null ? Number(producto.precioEspecial)  : null;
  const precioMayoristaP = producto.precioMayorista != null ? Number(producto.precioMayorista) : null;
  const promo            = producto.promo || null;
  const promoActive      = isPromoActive(promo);
  const precioPromo      = promoActive ? Number(promo.precio) : null;

  const nuevo = Array.isArray(producto.tags) && producto.tags.includes("nuevos-ingresos");

  // ── Variantes ─────────────────────────────────────────────────────────────
  const variants = useMemo(
    () => (Array.isArray(producto.variants) && producto.variants.length
      ? producto.variants
      : Array.isArray(producto.variantes) ? producto.variantes : []),
    [producto.variants, producto.variantes]
  );
  const hasVariantes = variants.length > 0;
  const sizes = useMemo(
    () => Array.from(new Set(variants.map(v => v.size || v.talle).filter(Boolean))),
    [variants]
  );
  const [selSize, setSelSize]   = useState("");
  const [selColor, setSelColor] = useState("");

  const colorsForSize = useMemo(() => {
    const list = variants
      .filter(v => selSize ? (v.size === selSize || v.talle === selSize) : true)
      .map(v => v.color).filter(Boolean);
    return Array.from(new Set(list));
  }, [variants, selSize]);

  useEffect(() => { if (!selSize && sizes.length) setSelSize(sizes[0]); }, [hasVariantes, sizes, selSize]);
  useEffect(() => {
    if (selSize && selColor) {
      const valid = variants.some(v => (v.size === selSize || v.talle === selSize) && v.color === selColor);
      if (!valid) setSelColor("");
    }
  }, [selSize, selColor, variants]);

  const chosenVariant = useMemo(() => {
    if (!hasVariantes) return null;
    const base = selSize ? variants.filter(v => v.size === selSize || v.talle === selSize) : variants;
    return (selColor ? base.find(v => v.color === selColor) : base[0]) || null;
  }, [variants, hasVariantes, selSize, selColor]);

  // ── Precio efectivo según tier del carrito ────────────────────────────────
  // El ítem "simulado" con los 3 precios para calcular qué precio mostraría
  const itemSimulado = {
    precioUnitario,
    precioEspecial:  precioEspecialP,
    precioMayorista: precioMayoristaP,
  };
  const precioActivoTier = precioEfectivo(itemSimulado, tier);

  // Si hay promo activa y es menor al precio del tier → la promo gana
  const precioFinal = (precioPromo != null && precioPromo < precioActivoTier)
    ? precioPromo
    : precioActivoTier;

  // Precio tachado: solo si hay descuento real respecto al unitario
  const precioTachado = precioFinal < precioUnitario ? precioUnitario : null;

  const off = precioTachado
    ? Math.round((1 - precioFinal / precioTachado) * 100)
    : null;

  // ── Stock ─────────────────────────────────────────────────────────────────
  const stockGlobal = Number(producto.stock ?? producto.Stock ?? 0);
  const agotado   = !stockGlobal;
  const needsSize  = hasVariantes && sizes.length > 0 && !selSize;
  const needsColor = hasVariantes && colorsForSize.length > 0 && !selColor;
  const canAdd     = stockGlobal > 0 && !needsSize && !needsColor;

  // ── Wishlist ──────────────────────────────────────────────────────────────
  const [wish, setWish] = useState(() => readWL().some(x => x._id === id));
  useEffect(() => { setWish(readWL().some(x => x._id === id)); }, [id]);

  const toggleWish = (e) => {
    e.preventDefault(); e.stopPropagation();
    const wl = readWL();
    if (wl.some(x => x._id === id)) {
      writeWL(wl.filter(x => x._id !== id)); setWish(false);
    } else {
      writeWL([{ _id: id, nombre, imagen: imgSrc, precio: precioFinal }, ...wl]); setWish(true);
    }
  };

  // ── Agregar al carrito ────────────────────────────────────────────────────
  const [added, setAdded] = useState(false);
 const onAdd = (e) => {
  e.preventDefault(); e.stopPropagation();
  if (!canAdd) return;
  const esTonos = Number(producto.cantidadTonos) > 0;          // ← acá
  const stepCard = esTonos ? Math.max(1, Number(producto.unidadesPorCaja) || 1) : 1;  // ← acá
  addToCart({
      ...producto,
      _id: id,
      // Guardamos los 3 precios para que CartContext pueda recalcular
      precio:          precioUnitario,
      precioUnitario,
      precioEspecial:  precioEspecialP,
      precioMayorista: precioMayoristaP,
      cantidad: stepCard, 
      stock: Number(producto.stock ?? 0),
      cantidadTonos:   producto.cantidadTonos  ?? null,   // ← agregás esto
      unidadesPorCaja: producto.unidadesPorCaja ?? null,   // ← y esto
      distribucionTonos: null, // desde la card no calculamos distribución
      ...(chosenVariant
        ? { variant: { vid: chosenVariant.vid, size: chosenVariant.size || chosenVariant.talle, color: chosenVariant.color, stock: Number(chosenVariant.stock ?? 0) } }
        : {}),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  const goDetail = () => navigate(`/producto/${id}`);
  const tierInfo = TIER_LABELS[tier] || TIER_LABELS.unitario;

  const btnLabel = agotado ? "Sin stock" : needsSize ? "Elegí talle" : needsColor ? "Elegí color" : "Agregar";

  return (
    <article className="pc-min" role="article">

      {/* WISHLIST */}
      <button className={`pc-wish ${wish ? "is-active" : ""}`} onClick={toggleWish}
        aria-label={wish ? "Quitar de favoritos" : "Agregar a favoritos"} type="button">
        {wish ? <FaHeart size={12} /> : <FaRegHeart size={12} />}
      </button>

      {/* IMAGEN */}
      <div className="pc-img" onClick={goDetail} role="button" tabIndex={0}
        onKeyDown={e => e.key === "Enter" && goDetail()} aria-label={nombre}>
        <div className="pc-badges">
          {nuevo   && <span className="pc-badge pc-badge--new">Nuevo</span>}
          {off !== null && <span className="pc-badge pc-badge--off">-{off}%</span>}
          {agotado && <span className="pc-badge pc-badge--out">Agotado</span>}
        </div>
        {imgSrc
          ? <img src={imgSrc} alt={nombre} onError={e => { if (FALLBACK_IMG) e.currentTarget.src = FALLBACK_IMG; }} />
          : <div className="pc-img-placeholder" aria-hidden />}
      </div>

      {/* TÍTULO + PRECIOS */}
      <header className="pc-head">
        <h3 className="pc-title" title={nombre} onClick={goDetail}>{nombre}</h3>

        {/* ── 3 PRECIOS ────────────────────────────────────────── */}
        <div className="pc-price-tiers">

          {/* Precio Unitario — siempre visible */}
          <div className={`pc-tier-row ${tier === "unitario" && !precioPromo ? "is-active-tier" : ""}`}>
            <span className="pc-tier-tag pc-tier-tag--unitario">U</span>
            <span className="pc-tier-price">{fmtARS(precioPromo && tier === "unitario" ? precioPromo : precioUnitario)}</span>
            <span className="pc-tier-label">Unitario</span>
          </div>

          {/* Precio Especial — si existe */}
          {precioEspecialP != null && (
            <div className={`pc-tier-row ${tier === "especial" ? "is-active-tier" : ""}`}>
              <span className="pc-tier-tag pc-tier-tag--especial">E</span>
              <span className="pc-tier-price">{fmtARS(precioEspecialP)}</span>
              <span className="pc-tier-label">x5 productos</span>
            </div>
          )}

          {/* Precio Mayorista — si existe */}
          {precioMayoristaP != null && (
            <div className={`pc-tier-row ${tier === "mayorista" ? "is-active-tier" : ""}`}>
              <span className="pc-tier-tag pc-tier-tag--mayorista">M</span>
              <span className="pc-tier-price">{fmtARS(precioMayoristaP)}</span>
              <span className="pc-tier-label">Mayorista</span>
            </div>
          )}

        </div>

        {/* Indicador del tier actual del carrito */}
        <div className="pc-tier-badge"
          style={{ background: tierInfo.bg, color: tierInfo.color, border: `1px solid ${tierInfo.border}` }}>
          Precio {tierInfo.label}
        </div>
      </header>

      {/* VARIANTES */}
      {hasVariantes && (
        <div className="pc-opts">
          {sizes.length > 0 && (
            <select className="pc-select" value={selSize} onChange={e => setSelSize(e.target.value)} aria-label="Talle">
              {sizes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {colorsForSize.length > 0 && (
            <select className="pc-select" value={selColor} onChange={e => setSelColor(e.target.value)} aria-label="Color">
              <option value="">Color</option>
              {colorsForSize.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>
      )}

      <button className={`pc-cta ${added ? "is-added" : ""}`} disabled={!canAdd} onClick={onAdd} type="button">
        <FaShoppingCart size={12} />
        <span>{btnLabel}</span>
      </button>

      <Link to={`/producto/${id}`} className="pc-link-overlay" aria-label={`Ver detalle de ${nombre}`} />
    </article>
  );
}