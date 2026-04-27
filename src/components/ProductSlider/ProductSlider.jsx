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
  subtitle = "",
  showTitle = true,
  viewAllHref = "",
}) {
  const items = Array.isArray(productos) ? productos : (productos?.items || []);
  const hasItems = items && items.length > 0;

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
    infinite: count > 4,
    speed: 500,
    slidesToShow: Math.min(4, count),
    slidesToScroll: 1,
    arrows: count > 1,
    adaptiveHeight: false,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: Math.min(3, count) } },
      { breakpoint: 900,  settings: { slidesToShow: Math.min(2, count) } },
      { breakpoint: 600,  settings: { slidesToShow: 2 } },
      { breakpoint: 420,  settings: { slidesToShow: 1 } },
    ],
  };

  if (!hasItems) {
    return showTitle ? (
      <section className="ps-section">
        <header className="ps-head">
          <h2 className="ps-title">{title}</h2>
        </header>
        <p className="ps-empty">No hay productos aún.</p>
      </section>
    ) : null;
  }

  return (
    <section className={`ps-section ${isSingle ? "is-single" : ""}`}>
      {showTitle && (
        <header className="ps-head">
          <div className="ps-head-text">
            <h2 className="ps-title">{title}</h2>
            {subtitle && <p className="ps-subtitle">{subtitle}</p>}
          </div>
          {viewAllHref && (
            <a href={viewAllHref} className="ps-view-all">Ver todo →</a>
          )}
        </header>
      )}

      {isSingle ? (
        <div className="ps-single">
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
