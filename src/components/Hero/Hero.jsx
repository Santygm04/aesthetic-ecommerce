// src/components/Hero/Hero.jsx
import "../../components/Hero/Hero.css";
import modelo from "../../../assets/modelo.jpg";

export default function Hero() {
  return (
    <section className="hero" aria-label="Portada">
      <div
        className="hero-content reveal fade-up"
        style={{ "--reveal-delay": "80ms" }}
      >
        <h1>
          <span className="hero-fade">Descubrí tu estilo</span><br />
          <span className="highlight-aesthetic">con <b>AESTHETIC</b></span>
        </h1>
        <p>Moda, belleza y elegancia en un solo lugar.</p>
        <a href="/category" className="hero-btn">Ver Productos</a>
      </div>

      <div
        className="hero-img-side reveal fade-right"
        style={{ "--reveal-delay": "180ms" }}
      >
        <img src={modelo} alt="Hero Chica Moda" loading="eager" />
      </div>

      <div className="hero-decor hero-decor1" />
      <div className="hero-decor hero-decor2" />
    </section>
  );
}
