// src/components/Hero/Hero.jsx
import { useEffect, useState } from "react";
import "../../components/Hero/Hero.css";

export default function Hero() {
  // Slides del banner (pagos / envíos)
  const slides = [
    {
      id: "pagos",
      title: "Pagos mayoristas",
      subtitle: "Solo transferencia — sin recargo",
      bullets: [
        "Compra mínima $120.000",
        "Factura A o B según corresponda",
        "Coordinación por WhatsApp al cerrar el pedido",
      ],
      cta: { href: "/pagos", label: "Ver pagos" },
    },
    {
      id: "envios",
      title: "Envíos a todo el país",
      subtitle: "Despacho en 24 h hábiles",
      bullets: [
        "Seguimiento por email",
        "Costo según destino y transportista",
        "Interior: $10.000 / $16.000 (referencia)",
      ],
      cta: { href: "/envios", label: "Ver envíos" },
    },
  ];

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="hero" aria-label="Portada">
      <div
        className="hero-content reveal fade-up"
        style={{ "--reveal-delay": "80ms" }}
      >
        <h1>
          <span className="hero-fade">Descubrí tu estilo</span>
          <br />
          <span className="highlight-aesthetic">
            con <b>AESTHETIC</b>
          </span>
        </h1>
        <p>Moda, belleza y elegancia en un solo lugar.</p>
        <a href="/category" className="hero-btn">
          Ver Productos
        </a>
      </div>

      {/* === Banner deslizante (reemplaza la imagen) === */}
      <div
        className="hero-slider reveal fade-right"
        style={{ "--reveal-delay": "180ms" }}
        role="region"
        aria-label="Información de pagos y envíos"
      >
        {slides.map((s, i) => (
          <article
            key={s.id}
            className={`hs-card${idx === i ? " is-active" : ""}`}
            aria-hidden={idx !== i}
          >
            <h3 className="hs-title">{s.title}</h3>
            <div className="hs-sub">{s.subtitle}</div>
            <ul className="hs-list">
              {s.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
            <a className="hs-cta" href={s.cta.href}>
              {s.cta.label}
            </a>
          </article>
        ))}

        <div className="hs-dots" aria-label="Cambiar banner">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`dot${idx === i ? " active" : ""}`}
              aria-label={s.title}
              aria-pressed={idx === i}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      </div>

      <div className="hero-decor hero-decor1" />
      <div className="hero-decor hero-decor2" />
    </section>
  );
}
