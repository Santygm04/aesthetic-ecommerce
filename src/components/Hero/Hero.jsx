// src/components/Hero/Hero.jsx
import { useEffect, useState } from "react";
import "../../components/Hero/Hero.css";
import primavera from "/assets/primavera.jpg"
import primavera1 from "/assets/primavera-1.png"
import primavera2 from "/assets/primavera-2.png"

const RAW_WA = import.meta.env.VITE_SELLER_PHONE || "+5493854112412";
const SELLER_WA = String(RAW_WA).replace(/\D/g, "");
const CONTACT_MAIL = import.meta.env.VITE_CONTACT_EMAIL || "Paulagonzaleslazaro@gmail.com";
const IG_URL = import.meta.env.VITE_IG_URL || "https://instagram.com/";
const FB_URL = import.meta.env.VITE_FB_URL || "https://facebook.com/";

/* Componente interno para la “pantalla” del teléfono */
function PhoneScreen({ screen, children }) {
  const imgVar = screen?.img ? `url('${screen.img}')` : "none";
  return (
    <div
      className={`phone-screen ${screen?.className || ""} ${screen?.video ? "has-video" : ""}`}
      style={{ ["--phone-img"]: imgVar }}
    >
      {screen?.video && (
        <video
          className="screen-video"
          src={screen.video}
          poster={screen.poster}
          autoPlay
          muted
          loop
          playsInline
        />
      )}
      {children}
    </div>
  );
}

export default function Hero() {
  // Slides con chips/burbujas claras por flujo
  const slides = [
    {
      id: "pagos",
      theme: "theme-pagos",
      title: "Pagos mayoristas",
      subtitle: "Transferencia — sin recargo",
      bullets: [
        "Compras mayoristas",
        "Factura corresponda",
        "Coordinación por WhatsApp al cerrar el pedido",
      ],
      bubbles: ["✅ Pedido confirmado", "🧾 Datos de pago enviados", "🔍 Validación de comprobante"],
      cta: { href: "/pagos", label: "Ver pagos" },
      // === PERSONALIZÁ ACA: imagen estática ===
      screen: { img:  {primavera} }// cambia la ruta
    },
    {
      id: "envios",
      theme: "theme-envios",
      title: "Envíos a todo el país, dependiendo de cada empresa",
      subtitle: "Despacho dependiendo la empresa",
      bullets: [
        "Seguimiento por wsp",
        "Costo según destino y transportista",
        "Interior: $10.000 / $16.000 (referencia)",
      ],
      bubbles: ["💳 Pago acreditado", "📦 Preparación coordinada ", "🚚 Despachos coordinados por wsp"],
      cta: { href: "/envios", label: "Ver envíos" },
      // === PERSONALIZÁ ACA: video/animación (también acepta GIF) ===
      screen: {
        video: {primavera1}, // o /assets/hero/envios.gif
        poster: {primavera2},
      },
    },
    {
      id: "contacto",
      theme: "theme-contacto",
      title: "¿Necesitás ayuda?",
      subtitle: "Respondemos rápido",
      bullets: [`WhatsApp: +${SELLER_WA}`, `Email: ${CONTACT_MAIL}`, "Instagram & Facebook disponibles"],
      bubbles: ["💬 WhatsApp directo", "✉ Email de soporte", "⚡ Respuesta rápida"],
      cta: { href: "/contacto", label: "Ver contactos" },
      // === PERSONALIZÁ ACA: animación CSS (de ejemplo) + imagen de fondo opcional ===
      screen: {
        img: "/assets/hero/contacto.jpg",
        className: "screen-anim-pulse", // quitalo si no querés animación CSS
      },
    },
  ];

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5200);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="hero" aria-label="Portada">
      {/* Texto principal */}
      <div className="hero-content reveal fade-up" style={{ "--reveal-delay": "80ms" }}>
        <h1>
          <span className="hero-fade">Descubrí tu estilo</span><br />
          <span className="highlight-aesthetic">con <b>AESTHETIC</b></span>
        </h1>
        <p>Moda, belleza y elegancia en un solo lugar.</p>
        <a href="/category" className="hero-btn glow">Ver Productos</a>
      </div>

      {/* Banner deslizante */}
      <div
        className="hero-slider reveal fade-right"
        style={{ "--reveal-delay": "160ms" }}
        role="region"
        aria-label="Información destacada"
      >
        {slides.map((s, i) => (
          <article
            key={s.id}
            className={`hs-card ${s.theme}${idx === i ? " is-active" : ""}`}
            aria-hidden={idx !== i}
          >
            <div className="hs-card-border" aria-hidden />
            <div className="hs-grid">
              {/* Copy */}
              <div className="hs-copy">
                <h3 className="hs-title">{s.title}</h3>
                <div className="hs-sub">{s.subtitle}</div>
                <ul className="hs-list">
                  {s.bullets.map((b, j) => (<li key={j}>{b}</li>))}
                </ul>
                <a className="hs-cta glow" href={s.cta.href}>{s.cta.label}</a>
              </div>

              {/* Visual tipo “imagen/animación” */}
              <div className={`hs-visual ${s.id}`} aria-hidden>
                <div className="mock">
                  <div className="blob blob1" />
                  <div className="blob blob2" />

                  {/* Teléfono */}
                  <div className="phone">
                    <div className="notch" />

                    {/* Pantalla con contenido por slide */}
                    <PhoneScreen screen={s.screen}>
                      <div className="wa-circle" />

                      {/* Burbujas centradas DENTRO del teléfono */}
                      {(s.bubbles || []).slice(0, 3).map((txt, j) => (
                        <div key={j} className={`bubble b${j + 1}`}>{txt}</div>
                      ))}

                      {/* Botón WA real */}
                      <a
                        className="wa-badge"
                        href={`https://wa.me/${SELLER_WA}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Abrir WhatsApp"
                      >
                        WhatsApp
                      </a>
                    </PhoneScreen>
                  </div>

                  {/* Redes solo en “Contacto” */}
                  {s.id === "contacto" && (
                    <div className="socials">
                      <a className="soc ig" href={IG_URL} target="_blank" rel="noreferrer" title="Instagram">IG</a>
                      <a className="soc fb" href={FB_URL} target="_blank" rel="noreferrer" title="Facebook">FB</a>
                      <a className="soc mail" href={`mailto:${CONTACT_MAIL}`} title="Email">✉</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}

        {/* Dots */}
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
