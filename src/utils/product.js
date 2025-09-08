// src/utils/product.js
import FALLBACK_ASSET from "../../assets/uñas.avif";

export const FALLBACK_IMG = FALLBACK_ASSET;

export function capitalize(s = "") {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function getOff(precio, precioOriginal) {
  
  if (
    precioOriginal != null &&
    Number(precioOriginal) > Number(precio)
  ) {
    return Math.round((1 - Number(precio) / Number(precioOriginal)) * 100);
  }
  return null;
}

export function getStock(p) {
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

export function normalizeProduct(raw) {
  const id = raw?._id || raw?.id;

  const precio =
    raw?.precio != null ? Number(raw.precio) :
    raw?.price  != null ? Number(raw.price)  : 0;

  const precioOriginal =
    raw?.precioOriginal  != null ? Number(raw.precioOriginal)  :
    raw?.originalPrice   != null ? Number(raw.originalPrice)   : null;

  // imágenes: usa `imagenes` si está, o cae a `imagen`, o al fallback
  const arr = [];
  if (Array.isArray(raw?.imagenes) && raw.imagenes.length) {
    raw.imagenes.forEach((x) => x && arr.push(x));
  }
  if (raw?.imagen) arr.unshift(raw.imagen);
  if (arr.length === 0) arr.push(FALLBACK_IMG);

  return {
    id,
    raw, // para conservar todo el objeto original
    nombre: raw?.nombre || raw?.name || raw?.titulo || "Producto",
    descripcion: raw?.descripcion || raw?.description || "",
    categoria: raw?.categoria || raw?.category || null,
    subcategoria: raw?.subcategoria || raw?.subCategory || null,
    marca: raw?.marca || raw?.brand || "",
    precio,
    precioOriginal,
    stock: getStock(raw),
    imagenes: arr,
    destacado: raw?.destacado ?? raw?.featured ?? false,
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
  };
}


