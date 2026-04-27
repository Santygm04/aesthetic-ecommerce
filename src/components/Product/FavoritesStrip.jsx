// src/components/Product/FavoritesStrip.jsx
import { useEffect, useState } from "react";
import api from "../../utils/api";  // ← CAMBIO: fetch stock real
import ProductCard from "../ProductCard/ProductCard";

export default function FavoritesStrip({ wishlist }) {
  const [productos, setProductos] = useState([]);

  // ← CAMBIO: al montar, busca los datos frescos de cada favorito desde la API
  useEffect(() => {
    if (!wishlist || wishlist.length === 0) { setProductos([]); return; }

    let alive = true;
    (async () => {
      const results = await Promise.allSettled(
        wishlist.map(p =>
          api.get(`/api/productos/${p._id}`, { params: { _t: Date.now() } })
            .then(r => r.data)
            .catch(() => p) // fallback al objeto del wishlist si falla
        )
      );
      if (!alive) return;
      setProductos(
        results
          .filter(r => r.status === "fulfilled" && r.value)
          .map(r => r.value)
      );
    })();

    return () => { alive = false; };
  }, [wishlist]);

  if (!wishlist || wishlist.length === 0) return null;

  return (
    <section className="rc" aria-label="Favoritos">
      <div className="rc-head">
        <h3 className="rc-title">Tus favoritos</h3>
      </div>

      <div className="rc-cards-row">
        {productos.map((p) => (
          <div key={p._id} className="rc-card-wrap">
            <ProductCard producto={p} />
          </div>
        ))}
      </div>
    </section>
  );
}