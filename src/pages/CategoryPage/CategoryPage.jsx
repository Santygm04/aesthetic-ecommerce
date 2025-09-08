// src/pages/CategoryPage/CategoryPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import ProductCard from "../../components/ProductCard/ProductCard";
import "../../pages/CategoryPage/CategoryPage.css";

// SSE – stream de productos en vivo
import useProductStream from "../../hooks/useProductStream";

// para marcar “visto” al entrar
import { markSeen } from "../../../src/utils/seen";

// Imágenes
import ingresosImg from "../../../assets/ingresos.png";
import skincareImg from "../../../assets/skincare.png";
import bodycareImg from "../../../assets/bodycare.avif";
import maquillajeImg from "../../../assets/maquillaje.avif";
import unasImg from "../../../assets/uñas.avif";
import pestanasImg from "../../../assets/pestañas.avif";
import peluqueriaImg from "../../../assets/peluqueria.avif";
import bijouterieImg from "../../../assets/bijouteria.avif";
import lenceriaImg from "../../../assets/lenceria.avif";
import carterasImg from "../../../assets/carteras.avif";

// Nombres para UI
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

  // Lencería (subcategorías)
  conjuntos: "Conjuntos",
  "tops-y-corpiños": "Tops y corpiños",
  vedetinas: "Vedetinas",
  colales: "Colales",
  boxer: "Boxer",
  slip: "Slip",
  niña: "Niña",
  medias: "Medias",

  "nuevos-ingresos": "Nuevos ingresos",
};

// Imagen para cada categoría/subcategoría
const categoryImages = {
  skincare: skincareImg,
  bodycare: bodycareImg,
  maquillaje: maquillajeImg,
  uñas: unasImg,
  pestañas: pestanasImg,
  peluquería: peluqueriaImg,
  bijouteria: bijouterieImg,
  marroquineria: carterasImg,

  // Lencería y sus subcategorías
  lenceria: lenceriaImg,
  conjuntos: lenceriaImg,
  "tops-y-corpiños": lenceriaImg,
  vedetinas: lenceriaImg,
  colales: lenceriaImg,
  boxer: lenceriaImg,
  slip: lenceriaImg,
  niña: lenceriaImg,
  medias: lenceriaImg,

  "nuevos-ingresos": ingresosImg,
  default: ingresosImg,
};

const beautify = (text) =>
  text ? text.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()) : "";

/* ============ helpers de normalización ============ */
function getStock(p) {
  let v =
    p?.stock ??
    p?.cantidad ??
    p?.quantity ??
    p?.inventario ??
    p?.stockDisponible ??
    p?.stock_total ??
    null;

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

/** Normaliza y aplica PROMO si corresponde.
 * Admite:
 * - raw.promo = { active, precio, pct }
 * - precioPromo | promoPrice | pricePromo
 * - promoPct | descuentoPct | descuentoPorc
 * - o bien precioOriginal/originalPrice ya seteado
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

  // promo como objeto
  if ((!promoPrice || !(promoPrice > 0)) && raw?.promo && typeof raw.promo === "object") {
    if (raw.promo.active && toNum(raw.promo.precio) > 0)
      promoPrice = toNum(raw.promo.precio);
    // porcentaje en objeto
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
    // si ya viene original > base, lo consideramos promo igual
    precio = basePrice;
    isPromo = true;
  }

  return {
    ...raw,
    _id: raw?._id || raw?.id,               // ProductCard espera _id
    nombre: raw?.nombre || raw?.name || raw?.titulo || "Producto",
    imagen: firstImage(raw),                 // usar imagen o primera de imagenes
    precio,
    precioOriginal,
    promo: isPromo || !!raw?.promo,         // bandera útil para badge
    categoria: raw?.categoria || raw?.category || raw?.cat || null,
    subcategoria: raw?.subcategoria || raw?.subCategory || raw?.subcat || null,
    stock: getStock(raw),
    destacado: raw?.destacado ?? raw?.featured ?? false,
    activo: raw?.activo ?? raw?.active ?? true,
  };
}

function localSort(items, sort) {
  if (!Array.isArray(items) || items.length === 0) return items;

  if (sort === "precio-asc") {
    return [...items].sort((a, b) => Number(a.precio) - Number(b.precio));
  }
  if (sort === "precio-desc") {
    return [...items].sort((a, b) => Number(b.precio) - Number(a.precio));
  }
  if (sort === "nombre-asc") {
    return [...items].sort((a, b) =>
      String(a.nombre || "").localeCompare(String(b.nombre || ""))
    );
  }
  // fecha-desc (fallback por createdAt/updatedAt/fecha)
  return [...items].sort((a, b) => {
    const da = new Date(a.createdAt || a.updatedAt || a.fecha || 0).getTime() || 0;
    const db = new Date(b.createdAt || b.updatedAt || b.fecha || 0).getTime() || 0;
    return db - da;
  });
}

/* ================= Página ================= */
export default function CategoryPage() {
  const params = useParams();

  // Normalizo y decodifico params (maneja ñ/acentos)
  const cat = decodeURIComponent(params.categoria || "").toLowerCase();
  const subcat = decodeURIComponent(params.subcategoria || "").toLowerCase();

  // Estado
  const [productosRaw, setProductosRaw] = useState([]);
  const [loading, setLoading] = useState(true);

  // Paginación + orden
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 12;
  const [sort, setSort] = useState("fecha-desc"); // "fecha-desc" | "precio-asc" | "precio-desc" | "nombre-asc"

  // Al cambiar cat/subcat, vuelvo a la primera página
  useEffect(() => {
    setPage(1);
  }, [cat, subcat]);

  // Carga inicial desde API (respeta paginación/orden del back)
  useEffect(() => {
    let alive = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        const params = { page, limit, sort };
        if (cat && subcat) {
          params.categoria = cat;
          params.subcategoria = subcat;
        } else if (cat) {
          params.categoria = cat;
        }

        const { data } = await api.get("/api/productos", { params });

        // Soporta array simple o paginado { items, pages, total }
        const items = Array.isArray(data) ? data : data.items || [];
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

  // marcar como "visto" esta sección (para ocultar el puntito de novedades)
  useEffect(() => {
    if (!loading) {
      if (cat === "nuevos-ingresos" || subcat === "nuevos-ingresos") {
        markSeen("nuevos");
      } else if (cat) {
        markSeen(`cat:${cat}`);
      }
    }
  }, [loading, cat, subcat]);

  // Filtro que usa el stream para saber si el producto pertenece a la vista actual
  const matchesFilter = useMemo(() => {
    return (raw) => {
      const c = String(raw?.categoria || "").toLowerCase();
      const s = String(raw?.subcategoria || "").toLowerCase();
      const inCat = !cat || c === cat;
      const inSub = !subcat || s === subcat;
      return inCat && inSub;
    };
  }, [cat, subcat]);

  // Suscripción SSE: upserts / deletes en tiempo real
  useProductStream({
    onUpsert: (p) => {
      setProductosRaw((prev) => {
        const id = p._id || p.id;
        const idx = prev.findIndex((x) => (x._id || x.id) === id);

        // si el admin lo desactiva → sacarlo
        if (p?.activo === false) {
          return idx === -1 ? prev : prev.filter((x) => (x._id || x.id) !== id);
        }

        // si ya estaba listado pero ahora NO matchea filtros → remover
        if (!matchesFilter(p)) {
          return idx === -1 ? prev : prev.filter((x) => (x._id || x.id) !== id);
        }

        // si no existe: agregar SOLO en página 1 para no romper paginación
        if (idx === -1) {
          if (page !== 1) return prev;
          return [p, ...prev];
        }

        // actualizar en lugar
        const next = prev.slice();
        next[idx] = { ...next[idx], ...p };
        return next;
      });
    },
    onDelete: (id) => {
      setProductosRaw((prev) => prev.filter((x) => (x._id || x.id) !== id));
    },
  });

  // Normalizo para que ProductCard siempre tenga los campos que espera (incluye promo)
  const productosNorm = useMemo(
    () => productosRaw.map(normalizeProduct),
    [productosRaw]
  );

  // Orden local como respaldo si el back ignora `sort`
  const productos = useMemo(
    () => localSort(productosNorm, sort),
    [productosNorm, sort]
  );

  // Título
  let titulo = "";
  if (subcat && categoryNames[subcat]) titulo = categoryNames[subcat];
  else if (cat && categoryNames[cat]) titulo = categoryNames[cat];
  else if (subcat) titulo = beautify(subcat);
  else if (cat) titulo = beautify(cat);

  // Imagen
  const heroImg =
    (subcat && categoryImages[subcat]) ||
    (cat && categoryImages[cat]) ||
    categoryImages.default;

  const esNuevosIngresos =
    cat === "nuevos-ingresos" || subcat === "nuevos-ingresos";

  // Paginación
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

      {titulo && <h2 className="category-title">{titulo}</h2>}

      {/* Toolbar: orden + paginación */}
      <div className="cat-toolbar">
        <div className="toolbar-left">
          <label className="label">Ordenar por</label>
          <select
            className="select"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="fecha-desc">Más recientes</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
            <option value="nombre-asc">Nombre (A→Z)</option>
          </select>
        </div>

        {pages > 1 && (
          <div className="pagination">
            <button className="pg-btn" disabled={page === 1} onClick={handlePrev}>
              ‹ Anterior
            </button>
            <span className="pg-info">
              Página {page} de {pages}
            </span>
            <button className="pg-btn" disabled={page === pages} onClick={handleNext}>
              Siguiente ›
            </button>
          </div>
        )}
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="loader-wrap">
          <div className="spinner" />
        </div>
      ) : productos.length === 0 ? (
        <p className="no-products">No hay productos en esta categoría.</p>
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
