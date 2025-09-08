// src/components/Product/Gallery.jsx
import { useState } from "react";
import { FaStar, FaRegHeart, FaHeart } from "react-icons/fa";
import { FALLBACK_IMG } from "../../utils/product";

export default function Gallery({ imagenes, off, agotado, wish, onToggleWish }) {
  const [active, setActive] = useState(0);

  return (
    <div className="gal" aria-label="Galería de imágenes">
      <div className="gal-thumbs" role="tablist" aria-label="Miniaturas">
        {imagenes.map((src, i) => (
          <button
            key={i}
            className={`gal-thumb ${i === active ? "is-active" : ""}`}
            onClick={() => setActive(i)}
            aria-label={`Ver imagen ${i + 1}`}
            type="button"
            role="tab"
            aria-selected={i === active}
          >
            <img
              src={src || FALLBACK_IMG}
              alt={`Miniatura ${i + 1}`}
              onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <div className="gal-main">
        {agotado && <span className="pd-badge soldout">Agotado</span>}
        {off != null && <span className="gal-off">-{off}%</span>}

        <button
          className={`pd-wish ${wish ? "active" : ""}`}
          aria-label={wish ? "Quitar de favoritos" : "Agregar a favoritos"}
          onClick={onToggleWish}
          type="button"
        >
          {wish ? <FaHeart /> : <FaRegHeart />}
        </button>

        <div className="gal-main-img">
          <img
            src={imagenes[active] || FALLBACK_IMG}
            alt={`Producto imagen ${active + 1}`}
            onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
          />
        </div>

        <div className="pd-stars gal-stars" aria-label="Calificación">
          {[...Array(5)].map((_, i) => (<FaStar key={i} />))}
          <span className="score">5.0</span>
        </div>
      </div>
    </div>
  );
}
