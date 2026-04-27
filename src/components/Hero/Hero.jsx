// src/components/Hero/Hero.jsx
import { useEffect, useState } from "react";
import "./Hero.css";

/**
 * HERO rediseñado: carrusel rectangular grande con slides informativos.
 * Los slides son tipo "banner" con imagen de fondo + overlay + contenido encima.
 *
 * TODO: cuando tengas las imágenes reales de cada slide, poné la ruta
 * en la propiedad `bgImg` de cada slide (ej: "/assets/como-comprar.jpg").
 * Mientras tanto, el slide muestra un fondo de color sólido como placeholder.
 */
export default function Hero() {
  const slides = [
    {
      id: "como-comprar",
      theme: "theme-violet",
      overline: "INFORMACIÓN",
      title: "¿Cómo Comprar?",
      // TODO: agregar imagen de fondo real
      bgImg: "",
      steps: [
        {
          num: "01",
          title: "Entrá a aestheticmakeup.com.ar",
          text: "Elegí tus productos favoritos y agregalos al carrito.",
        },
        {
          num: "02",
          title: "Revisá tu pedido",
          text: "Chequeá que esté todo correcto: modelos, marcas y cantidades.",
        },
        {
          num: "03",
          title: "Hacé tu pedido por WhatsApp",
          text: "Tocá el ícono abajo a la derecha o escribinos al 1122720888. Decinos tu número de pedido y coordinamos el pago y envío.",
        },
        {
          num: "04",
          title: "¡Listo!",
          text: "Ahora solo queda esperar tu paquete con muchas ansias.",
        },
      ],
    },
    {
      id: "importante",
      theme: "theme-violet",
      overline: "TENÉ EN CUENTA",
      title: "Importante",
      // TODO: agregar imagen de fondo real
      bgImg: "",
      bubbles: [
        {
          text: "El mínimo de compra online es de $180.000.",
          side: "left",
        },
        {
          text: "Los pagos se pueden realizar mediante transferencia / depósito / efectivo.",
          side: "right",
        },
        {
          text: "Una vez finalizado tu carrito, comunicate con nosotros para especificar variantes de productos, métodos de pago y de envío.",
          side: "left",
        },
        {
          text: "No trabajamos con correo Argentino ni tampoco con Andreani.",
          side: "right",
        },
      ],
    },
    {
      id: "guia-precios",
      theme: "theme-fucsia",
      overline: "PRECIOS",
      title: "Guía de Precios",
      // TODO: agregar imagen de fondo real (o dejar el fucsia sólido)
      bgImg: "",
      tagline: "¡Cuanto más llevás, menos pagás!",
      tiers: [
        {
          color: "minorista",
          label: "PRECIO MINORISTA",
          desc: "Sin mínimo de compra",
        },
        {
          color: "especial",
          label: "PRECIO ESPECIAL",
          desc: "Comprando 5 productos (iguales o diferentes)",
        },
        {
          color: "mayorista",
          label: "PRECIO MAYORISTA",
          desc: "Mínimo de compra $30.000",
        },
      ],
    },
  ];

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 8000);
    return () => clearInterval(t);
  }, [slides.length]);

  const goPrev = () => setIdx((i) => (i - 1 + slides.length) % slides.length);
  const goNext = () => setIdx((i) => (i + 1) % slides.length);

  return (
    <section className="hero-carousel" aria-label="Información destacada">
      <div className="hc-track" role="region" aria-roledescription="carrusel">
        {slides.map((s, i) => (
          <article
            key={s.id}
            className={`hc-slide ${s.theme}${idx === i ? " is-active" : ""}`}
            aria-hidden={idx !== i}
            style={s.bgImg ? { backgroundImage: `url(${s.bgImg})` } : undefined}
          >
            {/* Overlay + patrón decorativo */}
            <div className="hc-overlay" aria-hidden />
            <div className="hc-pattern" aria-hidden />

            <div className="hc-content">
              <span className="hc-overline">{s.overline}</span>
              <h2 className="hc-title">{s.title}</h2>
              <div className="hc-title-underline" aria-hidden />

              {/* SLIDE 1: ¿Cómo comprar? */}
              {s.steps && (
                <ol className="hc-steps">
                  {s.steps.map((step) => (
                    <li key={step.num} className="hc-step">
                      <span className="hc-step-num" aria-hidden>
                        {step.num}
                      </span>
                      <div className="hc-step-body">
                        <h3>{step.title}</h3>
                        <p>{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}

              {/* SLIDE 2: Importante (bocadillos) */}
              {s.bubbles && (
                <ul className="hc-bubbles">
                  {s.bubbles.map((b, j) => (
                    <li key={j} className={`hc-bubble hc-bubble-${b.side}`}>
                      {b.text}
                    </li>
                  ))}
                </ul>
              )}

              {/* SLIDE 3: Guía de precios */}
              {s.tiers && (
                <div className="hc-tiers-wrap">
                  <ul className="hc-tiers">
                    {s.tiers.map((t) => (
                      <li key={t.color} className="hc-tier">
                        <span className={`hc-tier-tag tag-${t.color}`} aria-hidden />
                        <div className="hc-tier-body">
                          <h3>{t.label}</h3>
                          <p>{t.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {s.tagline && <div className="hc-tagline">{s.tagline}</div>}
                </div>
              )}
            </div>
          </article>
        ))}

        {/* Controles */}
        <button
          type="button"
          className="hc-arrow hc-arrow-prev"
          onClick={goPrev}
          aria-label="Slide anterior"
        >
          <span aria-hidden>‹</span>
        </button>
        <button
          type="button"
          className="hc-arrow hc-arrow-next"
          onClick={goNext}
          aria-label="Slide siguiente"
        >
          <span aria-hidden>›</span>
        </button>
      </div>

      {/* Dots */}
      <div className="hc-dots" role="tablist" aria-label="Cambiar slide">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={idx === i}
            aria-label={s.title}
            className={`hc-dot${idx === i ? " active" : ""}`}
            onClick={() => setIdx(i)}
          />
        ))}
      </div>
    </section>
  );
}
