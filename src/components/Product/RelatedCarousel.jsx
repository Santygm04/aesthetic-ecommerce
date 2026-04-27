// src/components/Product/RelatedCarousel.jsx
import { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import api from "../../utils/api";
import ProductCard from "../ProductCard/ProductCard";

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
  const start = el.scrollLeft;
  const distance = dir === "left" ? -el.clientWidth * 0.75 : el.clientWidth * 0.75;
  const duration = 400;
  const startTime = performance.now();

  const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    el.scrollLeft = start + distance * ease(progress);
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

  if (loading || items.length === 0) return null;

  return (
    <section className="rc">
      <div className="rc-head">
        <h3 className="rc-title">{title}</h3>
        {items.length > 1 && (
          <div className="rc-nav">
            <button onClick={() => scroll("left")} aria-label="Anterior"><FaChevronLeft /></button>
            <button onClick={() => scroll("right")} aria-label="Siguiente"><FaChevronRight /></button>
          </div>
        )}
      </div>

      {/* Contenedor horizontal con scroll */}
      <div className="rc-cards-row" ref={rowRef}
  style={{ scrollSnapType: "none", WebkitOverflowScrolling: "touch" }}
      >
        
        {items.map((p) => (
          <div key={p._id || p.id} className="rc-card-wrap">
            <ProductCard producto={p} />
          </div>
        ))}
      </div>
    </section>
  );
}