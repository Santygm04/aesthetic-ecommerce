// src/components/Hero/Hero.jsx
import { useEffect, useState, useCallback } from "react";
import "./Hero.css";
import n1Img from "../../../assets/n1.png";
import n2Img from "../../../assets/n2.png";
import n3Img from "../../../assets/n3.png";
import n4Img from "../../../assets/n4.png";

const slides = [
  { id: "slide-1", img: n1Img, alt: "Aesthetic - Slide 1" },
  { id: "slide-2", img: n2Img, alt: "Aesthetic - Slide 2" },
  { id: "slide-3", img: n3Img, alt: "Aesthetic - Slide 3" },
  { id: "slide-4", img: n4Img, alt: "Aesthetic - Slide 4" },
];

export default function Hero() {
  const [idx, setIdx]       = useState(0);
  const [paused, setPaused] = useState(false);

  const goPrev = useCallback(() => setIdx((i) => (i - 1 + slides.length) % slides.length), []);
  const goNext = useCallback(() => setIdx((i) => (i + 1) % slides.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(goNext, 6000);
    return () => clearInterval(t);
  }, [paused, goNext]);

  return (
    <section
      className="hero-carousel"
      aria-label="Carrusel de imágenes"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hc-track" role="region" aria-roledescription="carrusel">

        {/* Slides */}
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`hc-slide${idx === i ? " is-active" : ""}`}
            aria-hidden={idx !== i}
          >
            <img
              src={s.img}
              alt={s.alt}
              className="hc-img"
              draggable={false}
            />
          </div>
        ))}

        {/* Flechas */}
        <button type="button" className="hc-arrow hc-arrow-prev" onClick={goPrev} aria-label="Anterior">
          <span aria-hidden>‹</span>
        </button>
        <button type="button" className="hc-arrow hc-arrow-next" onClick={goNext} aria-label="Siguiente">
          <span aria-hidden>›</span>
        </button>
      </div>

      {/* Dots */}
      <div className="hc-dots" role="tablist" aria-label="Navegación de slides">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={idx === i}
            aria-label={`Slide ${i + 1}`}
            className={`hc-dot${idx === i ? " active" : ""}`}
            onClick={() => setIdx(i)}
          />
        ))}
      </div>
    </section>
  );
}