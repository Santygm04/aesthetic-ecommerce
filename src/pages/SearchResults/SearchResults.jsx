import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import ProductCard from "../../components/ProductCard/ProductCard";
import "../../pages/SearchResults/SearchResults.css";

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/productos/search", {
          params: { q, limit: 24 },
        });
        let arr = Array.isArray(data) ? data : (data.items || []);
        if (!arr.length) {
          const r2 = await api.get("/api/productos", { params: { q, limit: 24 } });
          arr = Array.isArray(r2.data) ? r2.data : (r2.data.items || []);
        }
        if (alive) setItems(arr);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [q]);

  return (
    <section className="sr">
      <h1 className="sr-title reveal fade-up">
        Resultados{q ? ` para “${q}”` : ""} ({items.length})
      </h1>

      {loading ? (
        <p className="sr-msg">Buscando…</p>
      ) : items.length === 0 ? (
        <p className="sr-msg">No encontramos productos. Probá con otro término.</p>
      ) : (
        <div className="sr-grid">
          {items.map((p, i) => (
            <div key={p._id || p.id} className="reveal fade-up" style={{ "--reveal-delay": `${i * 70}ms` }}>
              <ProductCard producto={p} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
