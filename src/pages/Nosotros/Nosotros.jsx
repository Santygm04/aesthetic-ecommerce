// src/pages/Nosotros/Nosotros.jsx
import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../../pages/Nosotros/Nosotros.css";

export default function Nosotros() {
  useEffect(() => {
    const els = document.querySelectorAll(".fade-in");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section className="nosotros" id="nosotros">
      <div className="nosotros-bg-decor" />
      <div className="nosotros-container">

        {/* ── HERO TEXT ───────────────────────────────────────── */}
        <h2 className="fade-in">Sobre <span className="brand-highlight">AESTHETIC</span></h2>

        <p className="nosotros-intro fade-in">
          En <strong>Aesthetic</strong> creemos que la belleza no es solo cómo te ves, sino cómo te sentís.
          Somos un espacio pensado para la mujer actual: práctica, emprendedora, auténtica. Ofrecemos productos
          seleccionados que acompañan tu día a día, desde el cuidado personal hasta esos detalles que te hacen
          sentir segura, linda y empoderada.
        </p>

        {/* Precios */}
        <div className="nosotros-precios fade-in">
          <p className="nosotros-precios-lead">Trabajamos con un sistema de precios flexible y accesible:</p>
          <ul className="nosotros-precios-list">
            <li><span className="tag-min" /> Precio por unidad</li>
            <li><span className="tag-esp" /> Precio especial llevando 5 artículos</li>
            <li><span className="tag-may" /> Precio mayorista con compra mínima de $30.000</li>
          </ul>
          <p className="nosotros-precios-footer">
            Esto permite que tanto quienes compran para uso personal como quienes emprenden puedan acceder a
            oportunidades reales.
          </p>
        </div>

        {/* ── SECCIONES ───────────────────────────────────────── */}
        <div className="nosotros-cards fade-in">

          <div className="nc-card">
            <div className="nc-icon">💫</div>
            <h3>Misión</h3>
            <p>
              Brindar productos de belleza, cuidado personal y accesorios con precios accesibles y escalables,
              acompañando tanto a la mujer que busca verse y sentirse mejor como a aquellas que desean emprender
              y generar sus propios ingresos.
            </p>
          </div>

          <div className="nc-card">
            <div className="nc-icon">🌿</div>
            <h3>Visión</h3>
            <p>
              Convertirnos en una marca referente en el rubro, reconocida por ofrecer no solo productos, sino
              oportunidades. Queremos ser el punto de inicio para muchas mujeres que buscan independencia
              económica, crecimiento personal y confianza en sí mismas.
            </p>
          </div>

          <div className="nc-card">
            <div className="nc-icon">🎯</div>
            <h3>Propósito</h3>
            <p>
              Impulsar a cada mujer a descubrir su mejor versión, combinando belleza, autoestima y oportunidades
              de crecimiento. Aesthetic no es solo un lugar donde comprás productos: es un espacio donde podés
              empezar algo propio.
            </p>
          </div>

        </div>

        {/* ── METAS ───────────────────────────────────────────── */}
        <div className="nosotros-metas fade-in">
          <h3 className="nosotros-metas-title">🚀 Nuestras Metas</h3>
          <ul className="nosotros-metas-list">
            <li>Expandir nuestra comunidad de clientas y emprendedoras</li>
            <li>Ofrecer productos cada vez más variados y en tendencia</li>
            <li>Mantener precios competitivos que generen oportunidades reales de reventa</li>
            <li>Crear una experiencia de compra cercana, confiable y simple</li>
            <li>Acompañar a nuestras clientas en su crecimiento personal y económico</li>
          </ul>
        </div>

        {/* ── POR QUÉ ELEGIRNOS ───────────────────────────────── */}
        <div className="nosotros-porque fade-in">
          <h3>💖 ¿Por qué elegir Aesthetic?</h3>
          <p className="nc-porque-lead">Porque entendemos lo que necesitás.</p>
          <div className="nc-porque-grid">
            <div className="nc-porque-item">
              <span className="nc-check">✔</span>
              <div>
                <strong>Si comprás para vos:</strong> encontrás variedad, calidad y buenos precios.
              </div>
            </div>
            <div className="nc-porque-item">
              <span className="nc-check">✔</span>
              <div>
                <strong>Si querés emprender:</strong> tenés una oportunidad concreta desde una inversión accesible.
              </div>
            </div>
            <div className="nc-porque-item">
              <span className="nc-check">✔</span>
              <div>
                <strong>Si buscás sentirte bien:</strong> estás en el lugar correcto.
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA ─────────────────────────────────────────────── */}
        <div className="nosotros-cta fade-in">
          <NavLink to="/catalog" className="nosotros-boton">Ver productos</NavLink>
        </div>

        <p className="nosotros-final fade-in">
          Gracias por elegirnos.{" "}
          <span className="brand-highlight">¡Bienvenid@ a AESTHETIC</span>, donde el estilo se encuentra con
          la actitud!
        </p>

      </div>
    </section>
  );
}