// src/components/Product/RelatedCarousel.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import api from "../../utils/api";
import { FALLBACK_IMG } from "../../utils/product";

export default function RelatedCarousel({
  categoria,
  subcategoria,
  currentId,
  limit = 12,
  title = "También te puede interesar",
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const rowRef = useRef(null);

  useEffect(() => {
    let alive = true;

    const fetchBy = async (params) => {
      const { data } = await api.get("/api/productos", { params });
      const arr = Array.isArray(data) ? data : data.items || [];
      return arr.filter((p) => (p._id || p.id) !== currentId);
    };

    (async () => {
      try {
        setLoading(true);
        let related = [];
        if (subcategoria) related = await fetchBy({ categoria, subcategoria });
        if (related.length === 0 && categoria) related = await fetchBy({ categoria });
        if (related.length === 0) {
          const { data } = await api.get("/api/productos");
          const arr = Array.isArray(data) ? data : data.items || [];
          related = arr.filter((p) => (p._id || p.id) !== currentId);
        }
        if (alive) setItems(related.slice(0, limit));
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [categoria, subcategoria, currentId, limit]);

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -el.clientWidth * 0.9 : el.clientWidth * 0.9, behavior: "smooth" });
  };

  const handleClick = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (loading || items.length === 0) return null;

  const isSingle = items.length === 1;

  return (
    <section className="rc">
      <div className="rc-head">
        <h3 className="rc-title">{title}</h3>
        {/* 👇 flechas solo si hay más de 1 item */}
        {!isSingle && (
          <div className="rc-nav">
            <button onClick={() => scroll("left")} aria-label="Anterior"><FaChevronLeft /></button>
            <button onClick={() => scroll("right")} aria-label="Siguiente"><FaChevronRight /></button>
          </div>
        )}
      </div>

      {/* 👇 clase rc-single cuando hay 1 solo item → card centrada y chica */}
      <div className={`rc-row ${isSingle ? "rc-single" : ""}`} ref={rowRef}>
        {items.map((p) => {
          const id = p._id || p.id;
          const nombre = p.nombre || p.name || "Producto";
          const precio = Number(p.precio ?? p.price ?? 0);
          const img = p.imagen || (Array.isArray(p.imagenes) && p.imagenes[0]) || FALLBACK_IMG;

          return (
            <Link key={id} to={`/producto/${id}`} className="rc-item" onClick={handleClick}>
              <div className="rc-thumb">
                <img src={img} alt={nombre} onError={(e) => (e.currentTarget.src = FALLBACK_IMG)} />
              </div>
              <div className="rc-name" title={nombre}>{nombre}</div>
              <div className="rc-price">${precio.toLocaleString("es-AR")}</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}