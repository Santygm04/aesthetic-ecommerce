// src/components/Product/FavoritesStrip.jsx
import { Link } from "react-router-dom";
import { FALLBACK_IMG } from "../../utils/product";

export default function FavoritesStrip({ wishlist }) {
  if (!wishlist || wishlist.length === 0) return null;

  return (
    <section className="rc" aria-label="Favoritos">
      <div className="rc-head">
        <h3 className="rc-title">Tus favoritos</h3>
      </div>
      <div className="rc-row">
        {wishlist.map((p) => (
          <Link key={p._id} to={`/producto/${p._id}`} className="rc-item">
            <div className="rc-thumb">
              <img
                src={p.imagen || FALLBACK_IMG}
                alt={p.nombre}
                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                loading="lazy"
              />
            </div>
            <div className="rc-name" title={p.nombre}>{p.nombre}</div>
            <div className="rc-price">${Number(p.precio ?? 0).toLocaleString("es-AR")}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
