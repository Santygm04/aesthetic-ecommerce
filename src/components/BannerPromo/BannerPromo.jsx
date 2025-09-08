// src/components/BannerPromo/BannerPromo.jsx
import "../../components/BannerPromo/BannerPromo.css";

export default function BannerPromo() {
  return (
    <section
      className="banner-promo reveal zoom-in"
      style={{ "--reveal-delay": "120ms" }}
      aria-label="Promociones del mes"
    >
      <div className="banner-content">
        <h2>🔥 ¡Promociones exclusivas este mes!</h2>
        <p>
          Descubrí combos, 2x1 y descuentos solo en <b>AESTHETIC</b>. Apurate,
          cupos limitados.
        </p>
        <a href="/promos" className="banner-btn" aria-label="Ver promociones">
          Ver Promos
        </a>
      </div>
    </section>
  );
}
