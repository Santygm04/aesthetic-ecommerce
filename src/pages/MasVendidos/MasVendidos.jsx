// src/pages/MasVendidos/MasVendidos.jsx
import { useEffect, useState, useMemo } from "react";
import ProductCard from "../../components/ProductCard/ProductCard";
import "../../pages/CategoryPage/CategoryPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const LIMIT = 20;

function normalizeProduct(raw) {
  const basePrice = Number(raw?.precio ?? raw?.price ?? 0);
  let precio = basePrice;
  let precioOriginal = raw?.precioOriginal ? Number(raw.precioOriginal) : null;
  let isPromo = false;

  if (raw?.promo?.active && raw.promo.precio > 0 && raw.promo.precio < basePrice) {
    precioOriginal = basePrice;
    precio = Number(raw.promo.precio);
    isPromo = true;
  } else if (precioOriginal && basePrice < precioOriginal) {
    isPromo = true;
  }

  const imagen =
    raw?.imagen ||
    (Array.isArray(raw?.imagenes) ? raw.imagenes.find(Boolean) : undefined);

  const stock =
    raw?.stock != null ? Math.max(0, Number(raw.stock)) : 0;

  return {
    ...raw,
    _id:           raw?._id || raw?.id,
    nombre:        raw?.nombre || raw?.name || "Producto",
    imagen,
    precio,
    precioOriginal,
    promo:         isPromo || !!raw?.promo,
    stock,
    destacado:     raw?.destacado ?? false,
    totalVendido:  raw?.totalVendido ?? 0,
  };
}

export default function MasVendidos() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [total,   setTotal]   = useState(0);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/payments/mas-vendidos?page=${page}&limit=${LIMIT}`)
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        if (!data.ok) throw new Error(data.message || "Error");
        setItems((data.items || []).map(normalizeProduct));
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e.message);
        setItems([]);
      })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [page]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(pages, p + 1));

  return (
    <section className="category-page">

      {/* Banner */}
      <div className="banner-nuevos-ingresos" style={{
        background: "linear-gradient(90deg, #ff9a3c 0%, #ff2ea6 100%)",
      }}>
        <span className="fuego">🔥</span>
        <span className="texto-banner">
          Los productos más comprados por nuestra comunidad
        </span>
        <span className="fuego">🔥</span>
      </div>

      <h2 className="category-title">Más Vendidos</h2>

      {total > 0 && (
        <p style={{ textAlign: "center", color: "#7d4d85", marginBottom: "1rem", fontSize: ".95rem" }}>
          {total} producto{total !== 1 ? "s" : ""} rankeado{total !== 1 ? "s" : ""} por ventas
        </p>
      )}

      {/* Toolbar paginación */}
      {pages > 1 && (
        <div className="cat-toolbar" style={{ justifyContent: "flex-end" }}>
          <div className="pagination">
            <button className="pg-btn" disabled={page === 1} onClick={handlePrev}>‹ Anterior</button>
            <span className="pg-info">Página {page} de {pages}</span>
            <button className="pg-btn" disabled={page === pages} onClick={handleNext}>Siguiente ›</button>
          </div>
        </div>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="loader-wrap"><div className="spinner" /></div>
      ) : error ? (
        <div className="no-products-wrap">
          <p className="no-products">❌ {error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="no-products-wrap">
          <p className="no-products">Todavía no hay ventas registradas.</p>
        </div>
      ) : (
        <div className="productos-grid">
          {items.map((p, i) => (
            <div key={p._id} style={{ position: "relative" }}>
              {/* Badge de ranking */}
              {i < 3 && (
                <div style={{
                  position: "absolute",
                  top: 8, left: 8,
                  zIndex: 10,
                  background: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : "#cd7f32",
                  color: i === 0 ? "#7a5900" : i === 1 ? "#444" : "#fff",
                  borderRadius: "999px",
                  padding: "3px 10px",
                  fontSize: ".72rem",
                  fontWeight: 900,
                  boxShadow: "0 2px 8px rgba(0,0,0,.18)",
                  letterSpacing: ".3px",
                }}>
                  {i === 0 ? "🥇 #1" : i === 1 ? "🥈 #2" : "🥉 #3"}
                </div>
              )}
              <ProductCard producto={p} />
              {/* Contador de ventas */}
              <div style={{
                textAlign: "center",
                fontSize: ".78rem",
                fontWeight: 700,
                color: "#ff2ea6",
                marginTop: 4,
                opacity: .8,
              }}>
                🛒 {p.totalVendido} vendido{p.totalVendido !== 1 ? "s" : ""}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación abajo */}
      {pages > 1 && !loading && (
        <div className="cat-toolbar" style={{ justifyContent: "center", marginTop: "1.5rem" }}>
          <div className="pagination">
            <button className="pg-btn" disabled={page === 1} onClick={handlePrev}>‹ Anterior</button>
            <span className="pg-info">Página {page} de {pages}</span>
            <button className="pg-btn" disabled={page === pages} onClick={handleNext}>Siguiente ›</button>
          </div>
        </div>
      )}

    </section>
  );
}