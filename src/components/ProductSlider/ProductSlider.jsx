// src/components/ProductSlider/ProductSlider.jsx
import { useMemo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ProductCard from "../../components/ProductCard/ProductCard";
import "../../components/ProductSlider/ProductSlider.css";

export default function ProductSlider({
  productos = [],
  title = "Destacados",
  showTitle = true,
}) {
  const items = Array.isArray(productos) ? productos : (productos?.items || []);
  const hasItems = items && items.length > 0;

  // evita duplicados por id
  const cleanItems = useMemo(() => {
    const map = new Map();
    (items || []).forEach(p => {
      const id = p?._id ?? p?.id ?? Math.random();
      if (!map.has(id)) map.set(id, p);
    });
    return Array.from(map.values());
  }, [items]);

  const count = cleanItems.length;
  const isSingle = count === 1;

  const settings = {
    dots: true,
    infinite: count > 1,
    speed: 600,
    slidesToShow: Math.min(3, count),
    slidesToScroll: 1,
    arrows: count > 1,
    adaptiveHeight: false,
    responsive: [
      { breakpoint: 900, settings: { slidesToShow: Math.min(2, count) } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  if (!hasItems) {
    return showTitle ? (
      <section className="slider-destacados">
        <h2 className="slider-title">{title}</h2>
        <p style={{ textAlign: "center", color: "#d63384", fontWeight: 600 }}>
          No hay productos destacados aún.
        </p>
      </section>
    ) : null;
  }

  return (
    <section className={`slider-destacados ${isSingle ? "is-single" : ""}`}>
      {showTitle && <h2 className="slider-title">{title}</h2>}

      {isSingle ? (
        <div className="single-slide">
          <ProductCard producto={cleanItems[0]} />
        </div>
      ) : (
        <Slider {...settings}>
          {cleanItems.map((producto) => (
            <div key={producto._id || producto.id}>
              <ProductCard producto={producto} />
            </div>
          ))}
        </Slider>
      )}
    </section>
  );
}