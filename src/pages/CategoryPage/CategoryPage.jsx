// src/pages/CategoryPage/CategoryPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import ProductCard from "../../components/ProductCard/ProductCard";
import "../../pages/CategoryPage/CategoryPage.css";

import useProductStream from "../../hooks/useProductStream";
import { markSeen } from "../../../src/utils/seen";

// Imágenes
import skincareImg from "../../../assets/Skincaree.PNG";
import bodycareImg from "../../../assets/Bodycare.png"
import unasImg from "../../../assets/Unas.PNG";
import pestañasImg from "../../../assets/Pestanas.PNG";
import peluqueriaImg from "../../../assets/Peluquería.PNG";
import marroquineriaImg from "../../../assets/Marroquineria.PNG";
import maquillajeImg from "../../../assets/Maquillajes.PNG";
import bijouteriaImg from "../../../assets/Bijouterie.PNG";
import lenceriaImg from "../../../assets/Lenceria.PNG";
import accesoriosImg from "../../../assets/Accesorios.PNG"; 
import ingresosImg from "../../../assets/ingresos.png"
import conjuntosImg from "../../../assets/Conjuntos.PNG"
import topsImg from "../../../assets/TOPS.PNG"
import vedetinasImg from "../../../assets/Vedetinas.PNG"
import colalesImg from "../../../assets/Colales.PNG"
import slipImg from "../../../assets/Slips.PNG"
import boxerImg from "../../../assets/Boxers.PNG"
import mediasImg from "../../../assets/Medias.PNG"
import niñaImg from "../../../assets/Niña.PNG"

const categoryNames = {
  skincare: "Skincare",
  bodycare: "Bodycare",
  maquillaje: "Maquillaje",
  uñas: "Uñas",
  pestañas: "Pestañas",
  peluquería: "Peluquería",
  bijouteria: "Bijouteria",
  lenceria: "Lencería",
  marroquineria: "Marroquineria",
  conjuntos: "Conjuntos",
  "tops-y-corpiños": "tops y corpiños",
  vedetinas: "Vedetinas",
  colales: "Colales",
  boxer: "Boxer",
  slip: "Slip",
  niña: "Niña",
  medias: "Medias",
  "nuevos-ingresos": "Nuevos ingresos",
  "mas-vendidos": "Más Vendidos",
  accesorios: "Accesorios",
};

const categoryImages = {
  skincare: skincareImg,
  bodycare: bodycareImg,
  maquillaje: maquillajeImg,
  uñas: unasImg,
  pestañas: pestañasImg,
  peluquería: peluqueriaImg,
  bijouteria: bijouteriaImg,
  marroquineria: marroquineriaImg,
  lenceria: lenceriaImg,
  conjuntos: conjuntosImg,
  "tops-y-corpiños": topsImg,
  vedetinas: vedetinasImg,
  colales: colalesImg,
  boxer: boxerImg,
  slip: slipImg,
  niña: niñaImg,
  medias: mediasImg,
  accesorios: accesoriosImg,
  "nuevos-ingresos": ingresosImg,
  default: ingresosImg,
};

// Subcategorías conocidas por categoría padre
const subcatsByCat = {
  lenceria: ["conjuntos", "tops-y-corpiños", "vedetinas", "colales", "boxer", "slip", "niña", "medias"],
  maquillaje: ["labiales", "sombras", "brochas", "sets"],
  skincare: ["serums", "limpiadores", "exfoliantes", "cremas"],
  bodycare: ["jabones", "cremas-corporales", "aceites"],
  uñas: ["soft-gel", "semi-permanente", "normal"],
  pestañas: ["insumos", "kits", "extensiones"],
  peluquería: ["peines", "cepillos", "tratamientos"],
  bijouteria: ["aros", "collares", "pulseras", "anillos"],
  marroquineria: ["mochilas", "riñoneras", "bolsos"],
  accesorios: ["pelo"],
};

const beautify = (text) =>
  text ? text.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()) : "";

/* ============ helpers ============ */
function getStock(p) {
  let v =
    p?.stock ?? p?.cantidad ?? p?.quantity ?? p?.inventario ??
    p?.stockDisponible ?? p?.stock_total ?? null;
  if (v === true) return 1;
  if (v === false || v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? Math.max(0, v) : 0;
  if (typeof v === "string") {
    const m = v.match(/-?\d+/);
    if (!m) return 0;
    const n = parseInt(m[0], 10);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }
  return 0;
}

function firstImage(p) {
  if (p?.imagen) return p.imagen;
  if (Array.isArray(p?.imagenes) && p.imagenes.length) {
    const found = p.imagenes.find(Boolean);
    if (found) return found;
  }
  return undefined;
}

function toNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function normalizeProduct(raw) {
  const basePrice =
    raw?.precio != null ? toNum(raw.precio) :
    raw?.price  != null ? toNum(raw.price)  : 0;

  let promoPrice =
    toNum(raw?.precioPromo) ?? toNum(raw?.promoPrice) ?? toNum(raw?.pricePromo);

  if ((!promoPrice || !(promoPrice > 0)) && raw?.promo && typeof raw.promo === "object") {
    if (raw.promo.active && toNum(raw.promo.precio) > 0)
      promoPrice = toNum(raw.promo.precio);
    if ((!promoPrice || !(promoPrice > 0)) && toNum(raw.promo.pct) > 0) {
      const pct = toNum(raw.promo.pct);
      if (pct > 0 && pct < 100) promoPrice = +(basePrice * (1 - pct / 100)).toFixed(2);
    }
  }

  if (!promoPrice || !(promoPrice > 0)) {
    const pct = toNum(raw?.promoPct) ?? toNum(raw?.descuentoPct) ?? toNum(raw?.descuentoPorc);
    if (pct > 0 && pct < 100) promoPrice = +(basePrice * (1 - pct / 100)).toFixed(2);
  }

  let precioOriginal =
    raw?.precioOriginal != null ? toNum(raw.precioOriginal) :
    raw?.originalPrice  != null ? toNum(raw.originalPrice)  : null;

  let precio = basePrice || 0;
  let isPromo = false;

  if (promoPrice != null && promoPrice > 0 && basePrice && promoPrice < basePrice) {
    precioOriginal = basePrice;
    precio = promoPrice;
    isPromo = true;
  } else if (precioOriginal && basePrice < precioOriginal) {
    precio = basePrice;
    isPromo = true;
  }

  return {
    ...raw,
    _id: raw?._id || raw?.id,
    nombre: raw?.nombre || raw?.name || raw?.titulo || "Producto",
    imagen: firstImage(raw),
    precio,
    precioOriginal,
    promo: isPromo || !!raw?.promo,
    categoria: raw?.categoria || raw?.category || raw?.cat || null,
    subcategoria: raw?.subcategoria || raw?.subCategory || raw?.subcat || null,
    stock: getStock(raw),
    destacado: raw?.destacado ?? raw?.featured ?? false,
    activo: raw?.activo ?? raw?.active ?? true,
  };
}

function localSort(items, sort) {
  if (!Array.isArray(items) || items.length === 0) return items;
  if (sort === "precio-asc") return [...items].sort((a, b) => Number(a.precio) - Number(b.precio));
  if (sort === "precio-desc") return [...items].sort((a, b) => Number(b.precio) - Number(a.precio));
  if (sort === "nombre-asc") return [...items].sort((a, b) => String(a.nombre || "").localeCompare(String(b.nombre || "")));
  return [...items].sort((a, b) => {
    const da = new Date(a.createdAt || a.updatedAt || a.fecha || 0).getTime() || 0;
    const db = new Date(b.createdAt || b.updatedAt || b.fecha || 0).getTime() || 0;
    return db - da;
  });
}

/* ================= Página ================= */
export default function CategoryPage() {
  const params = useParams();
  const cat    = decodeURIComponent(params.categoria    || "").toLowerCase();
  const subcat = decodeURIComponent(params.subcategoria || "").toLowerCase();

  const isMasVendidos = cat === "mas-vendidos";
  const [sort, setSort]   = useState(isMasVendidos ? "ventas-desc" : "fecha-desc");

  // Estado principal
  const [productosRaw, setProductosRaw] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]   = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 12;

  // ── Filtros nuevos ──
  const [filtroPrecioMin, setFiltroPrecioMin] = useState("");
  const [filtroPrecioMax, setFiltroPrecioMax] = useState("");
  const [filtroSoloStock, setFiltroSoloStock] = useState(false);
  const [filtroSoloPromo, setFiltroSoloPromo] = useState(false);
  const [filtroSubcat,    setFiltroSubcat]    = useState("");
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  // Subcategorías disponibles para esta categoría
  const subcatsDisponibles = useMemo(() => subcatsByCat[cat] || [], [cat]);

  // Resetear página y filtros al cambiar cat/subcat
  useEffect(() => {
    setPage(1);
    setFiltroPrecioMin("");
    setFiltroPrecioMax("");
    setFiltroSoloStock(false);
    setFiltroSoloPromo(false);
    setFiltroSubcat("");
  }, [cat, subcat]);

  // Fetch
  useEffect(() => {
    let alive = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const p = { page, limit, sort };
        if (cat === "nuevos-ingresos")  p.tag = "nuevos-ingresos";
        else if (cat === "mas-vendidos") p.tag = "mas-vendidos";
        else if (cat && subcat) { p.categoria = cat; p.subcategoria = subcat; }
        else if (cat) p.categoria = cat;

        const { data } = await api.get("/api/productos", { params: p });
        const items     = Array.isArray(data) ? data : data.items || [];
        const nextPages = Array.isArray(data) ? 1 : data.pages || 1;

        if (!alive) return;
        setProductosRaw(items);
        setPages(nextPages);
      } catch (e) {
        if (!alive) return;
        console.error("Fetch productos error:", e);
        setProductosRaw([]);
        setPages(1);
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchData();
    return () => { alive = false; };
  }, [cat, subcat, page, sort]);

  useEffect(() => {
    if (!loading) {
      if (cat === "nuevos-ingresos" || subcat === "nuevos-ingresos") markSeen("nuevos");
      else if (cat) markSeen(`cat:${cat}`);
    }
  }, [loading, cat, subcat]);

  const matchesFilter = useMemo(() => (raw) => {
    const c = String(raw?.categoria    || "").toLowerCase();
    const s = String(raw?.subcategoria || "").toLowerCase();
    return (!cat || c === cat) && (!subcat || s === subcat);
  }, [cat, subcat]);

  // SSE
  useProductStream({
    onUpsert: (p) => {
      setProductosRaw((prev) => {
        const id  = p._id || p.id;
        const idx = prev.findIndex((x) => (x._id || x.id) === id);
        if (p?.activo === false) return idx === -1 ? prev : prev.filter((x) => (x._id || x.id) !== id);
        if (!matchesFilter(p))   return idx === -1 ? prev : prev.filter((x) => (x._id || x.id) !== id);
        if (idx === -1) { if (page !== 1) return prev; return [p, ...prev]; }
        const next = prev.slice(); next[idx] = { ...next[idx], ...p }; return next;
      });
    },
    onDelete: (id) => {
      setProductosRaw((prev) => prev.filter((x) => (x._id || x.id) !== id));
    },
  });

  // Normalizar
  const productosNorm = useMemo(() => productosRaw.map(normalizeProduct), [productosRaw]);

  // Ordenar
  const productosSorted = useMemo(() => localSort(productosNorm, sort), [productosNorm, sort]);

  // ── Aplicar filtros locales ──
  const productos = useMemo(() => {
    let list = productosSorted;

    // Subcategoría (solo si no viene ya en la URL)
    if (!subcat && filtroSubcat) {
      list = list.filter((p) =>
        String(p.subcategoria || "").toLowerCase() === filtroSubcat
      );
    }

    // Solo con stock
    if (filtroSoloStock) {
      list = list.filter((p) => p.stock > 0);
    }

    // Solo en promo
    if (filtroSoloPromo) {
      list = list.filter((p) => p.promo);
    }

    // Rango de precio
    const min = parseFloat(filtroPrecioMin);
    const max = parseFloat(filtroPrecioMax);
    if (!isNaN(min)) list = list.filter((p) => p.precio >= min);
    if (!isNaN(max)) list = list.filter((p) => p.precio <= max);

    return list;
  }, [productosSorted, filtroSubcat, filtroSoloStock, filtroSoloPromo, filtroPrecioMin, filtroPrecioMax, subcat]);

  // Conteo de filtros activos
  const filtrosActivos =
    (filtroSoloStock ? 1 : 0) +
    (filtroSoloPromo ? 1 : 0) +
    (filtroPrecioMin !== "" ? 1 : 0) +
    (filtroPrecioMax !== "" ? 1 : 0) +
    (filtroSubcat !== "" ? 1 : 0);

  const limpiarFiltros = () => {
    setFiltroPrecioMin("");
    setFiltroPrecioMax("");
    setFiltroSoloStock(false);
    setFiltroSoloPromo(false);
    setFiltroSubcat("");
  };

  // Título e imagen
  let titulo = "";
  if (subcat && categoryNames[subcat]) titulo = categoryNames[subcat];
  else if (cat && categoryNames[cat])  titulo = categoryNames[cat];
  else if (subcat) titulo = beautify(subcat);
  else if (cat)    titulo = beautify(cat);

  const heroImg =
    (subcat && categoryImages[subcat]) ||
    (cat    && categoryImages[cat])    ||
    categoryImages.default;

  const esNuevosIngresos = cat === "nuevos-ingresos" || subcat === "nuevos-ingresos";

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(pages, p + 1));

  return (
    <section className="category-page">
      {esNuevosIngresos && (
        <div className="banner-nuevos-ingresos">
          <span className="fuego">🔥</span>
          <span className="texto-banner">
            ¡Nuevos ingresos! Descubrí las últimas tendencias que acaban de llegar
          </span>
          <span className="fuego">🔥</span>
        </div>
      )}

      {heroImg && <img className="category-hero-img" src={heroImg} alt={titulo} />}
      {titulo   && <h2 className="category-title">{titulo}</h2>}

      {/* ── Toolbar ── */}
      <div className="cat-toolbar">
        <div className="toolbar-left">
          <label className="label">Ordenar por</label>
          <select
            className="select"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          >
            <option value="fecha-desc">Más recientes</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
            <option value="nombre-asc">Nombre (A→Z)</option>
          </select>
        </div>

        <div className="toolbar-right">
          {/* Botón filtros */}
          <button
            className={`btn-filtros ${filtrosAbiertos ? "activo" : ""}`}
            onClick={() => setFiltrosAbiertos((v) => !v)}
          >
            <span className="icon-filtro">⚙</span>
            Filtros
            {filtrosActivos > 0 && (
              <span className="badge-filtros">{filtrosActivos}</span>
            )}
          </button>

          {pages > 1 && (
            <div className="pagination">
              <button className="pg-btn" disabled={page === 1} onClick={handlePrev}>‹ Anterior</button>
              <span className="pg-info">Página {page} de {pages}</span>
              <button className="pg-btn" disabled={page === pages} onClick={handleNext}>Siguiente ›</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Panel de filtros ── */}
      {filtrosAbiertos && (
        <div className="filtros-panel">
          {/* Subcategoría */}
          {!subcat && subcatsDisponibles.length > 0 && (
            <div className="filtro-grupo">
              <label className="filtro-label">Subcategoría</label>
              <select
                className="select"
                value={filtroSubcat}
                onChange={(e) => setFiltroSubcat(e.target.value)}
              >
                <option value="">Todas</option>
                {subcatsDisponibles.map((s) => (
                  <option key={s} value={s}>
                    {categoryNames[s] || beautify(s)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Rango de precio */}
          <div className="filtro-grupo">
            <label className="filtro-label">Precio</label>
            <div className="filtro-precio-row">
              <input
                type="number"
                className="input-precio"
                placeholder="Mín $"
                min={0}
                value={filtroPrecioMin}
                onChange={(e) => setFiltroPrecioMin(e.target.value)}
              />
              <span className="precio-sep">—</span>
              <input
                type="number"
                className="input-precio"
                placeholder="Máx $"
                min={0}
                value={filtroPrecioMax}
                onChange={(e) => setFiltroPrecioMax(e.target.value)}
              />
            </div>
          </div>

          {/* Solo con stock */}
          <div className="filtro-grupo filtro-check">
            <label className="filtro-label-check">
              <input
                type="checkbox"
                checked={filtroSoloStock}
                onChange={(e) => setFiltroSoloStock(e.target.checked)}
              />
              Solo disponibles (con stock)
            </label>
          </div>

          {/* Solo en promo */}
          <div className="filtro-grupo filtro-check">
            <label className="filtro-label-check">
              <input
                type="checkbox"
                checked={filtroSoloPromo}
                onChange={(e) => setFiltroSoloPromo(e.target.checked)}
              />
              Solo en promoción 🏷️
            </label>
          </div>

          {/* Limpiar */}
          {filtrosActivos > 0 && (
            <button className="btn-limpiar" onClick={limpiarFiltros}>
              ✕ Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* ── Resultados ── */}
      {loading ? (
        <div className="loader-wrap"><div className="spinner" /></div>
      ) : productos.length === 0 ? (
        <div className="no-products-wrap">
          <p className="no-products">No hay productos con los filtros seleccionados.</p>
          {filtrosActivos > 0 && (
            <button className="btn-limpiar" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="productos-grid">
          {productos.map((p) => (
            <ProductCard key={p._id} producto={p} />
          ))}
        </div>
      )}
    </section>
  );
}