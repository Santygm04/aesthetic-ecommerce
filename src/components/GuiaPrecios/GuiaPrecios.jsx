// src/components/GuiaPrecios/GuiaPrecios.jsx
import "../../components/GuiaPrecios/GuiaPrecios.css";

/**
 * Sección "Guía de Precios" estilo cartel fucsia con los 3 niveles:
 * minorista, especial, mayorista + tagline amarillo.
 *
 * TODO (opcional): si querés, se puede reemplazar todo por una sola imagen
 * (el cartel fucsia ya diseñado). En ese caso, borrá el contenido interno y
 * usá <img src="/assets/guia-precios.jpg" className="gp-image" />.
 */
export default function GuiaPrecios() {
  const tiers = [
    { color: "minorista", label: "PRECIO MINORISTA", desc: "Sin mínimo de compra" },
    { color: "especial",  label: "PRECIO ESPECIAL",  desc: "Comprando 5 productos (iguales o diferentes)" },
    { color: "mayorista", label: "PRECIO MAYORISTA", desc: "Mínimo de compra $30.000" },
  ];

  return (
    <section className="guia-precios" aria-labelledby="guia-precios-title">
      <div className="gp-card">
        <header className="gp-head">
          <span className="gp-diamond" aria-hidden />
          <h2 id="guia-precios-title">Guía de Precios</h2>
          <span className="gp-diamond" aria-hidden />
        </header>

        <div className="gp-divider" aria-hidden />

        <div className="gp-body">
          <ul className="gp-tiers">
            {tiers.map((t) => (
              <li key={t.color} className="gp-tier">
                <span className={`gp-tag tag-${t.color}`} aria-hidden />
                <div className="gp-tier-body">
                  <h3>{t.label}</h3>
                  <p>{t.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Ícono decorativo del carrito (lado derecho en desktop) */}
          <div className="gp-cart" aria-hidden>
            {/* TODO: reemplazar por imagen real si querés. Por ahora SVG minimalista */}
            <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 15 H28 L36 68 H96 L108 30 H40"
                stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
                fill="none"
              />
              <circle cx="46" cy="86" r="8" stroke="#fff" strokeWidth="5" fill="none"/>
              <circle cx="86" cy="86" r="8" stroke="#fff" strokeWidth="5" fill="none"/>
            </svg>
          </div>
        </div>

        <div className="gp-tagline-wrap">
          <div className="gp-tagline">
            <span className="gp-dot" aria-hidden />
            <strong>¡Cuanto más llevás, menos pagás!</strong>
            <span className="gp-dot" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
