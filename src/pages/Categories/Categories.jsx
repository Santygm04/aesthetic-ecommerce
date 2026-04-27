// src/pages/Categories/Categories.jsx
import { Link } from "react-router-dom";
import "./Categories.css";

// NEW: badges
import useCatalogStats from "../../hooks/useCatalogStats";
import { hasUpdates, markSeen } from "../../utils/seen";

/**
 * Categorías como grilla de tiles con imagen de fondo.
 * Destacadas arriba (4 tiles grandes), resto en grilla regular.
 * TODO: reemplazá el `img` de cada item por la ruta real de la imagen.
 */
const DESTACADAS = [
  { key: "nuevos",         nombre: "NUEVOS INGRESOS",   ruta: "/category/nuevos-ingresos", img: "" },
  { key: "todos",          nombre: "TODOS LOS PRODUCTOS", ruta: "/category/",               img: "" },
  { key: "ofertas",        nombre: "OFERTAS / PROMOCIONES", ruta: "/promos",               img: "" },
  { key: "mas-vendidos",   nombre: "MÁS VENDIDOS",      ruta: "/category/mas-vendidos",    img: "" },
];

const CATEGORIAS = [
  { slug: "skincare",       nombre: "SKINCARE",       img: "" },
  { slug: "uñas",           nombre: "UÑAS",           img: "" },
  { slug: "pestañas",       nombre: "PESTAÑAS",       img: "" },
  { slug: "peluquería",     nombre: "PELUQUERÍA",     img: "" },
  { slug: "maquillaje",     nombre: "MAQUILLAJE",     img: "" },
  { slug: "bodycare",       nombre: "BODYCARE",       img: "" },
  { slug: "bijouteria",     nombre: "BIJOUTERÍA",     img: "" },
  { slug: "marroquineria",  nombre: "MARROQUINERÍA",  img: "" },
  { slug: "accesorios",     nombre: "ACCESORIOS",     img: "" },
  { slug: "lenceria",       nombre: "LENCERÍA",       img: "" },
];

const slugFromRuta = (ruta = "") => {
  const parts = ruta.split("/").filter(Boolean);
  const idx = parts.findIndex((p) => p === "category");
  if (idx >= 0 && parts[idx + 1]) return decodeURIComponent(parts[idx + 1]).toLowerCase();
  return "";
};

export default function Categories() {
  const { stats } = useCatalogStats();
  const catStats = stats?.catStats || {};
  const promos = stats?.promosByCat || {};
  const nuevos = stats?.nuevos || { count: 0, latest: null };

  return (
    <section className="cats-page">
      <header className="cats-page__head">
        <h1 className="cats-page__title">Categorías</h1>
        <p className="cats-page__subtitle">
          Explorá nuestras secciones. Hacé click en cualquier tile para ver los productos.
        </p>
      </header>

      {/* ===== Destacadas (4 tiles grandes) ===== */}
      <div className="cats-page__grid cats-page__grid--hero">
        {DESTACADAS.map((c) => {
          const isNuevos = c.key === "nuevos";
          const latest = isNuevos ? nuevos?.latest : null;
          const showDot = isNuevos && hasUpdates("nuevos", latest);
          const count = isNuevos ? (nuevos?.count || 0) : 0;

          return (
            <Link
              key={c.key}
              to={c.ruta}
              className={`cats-tile cats-tile--hero ${c.img ? "" : "no-img"}`}
              onClick={() => isNuevos && markSeen("nuevos")}
              style={c.img ? { backgroundImage: `url(${c.img})` } : undefined}
            >
              <span className="cats-tile__overlay" />
              <span className="cats-tile__label">
                {c.nombre}
                {count > 0 && <span className="cats-tile__count">{count}</span>}
              </span>
              {showDot && <span className="cats-tile__dot" aria-hidden="true" />}
            </Link>
          );
        })}
      </div>

      {/* ===== Resto de categorías ===== */}
      <div className="cats-page__grid cats-page__grid--regular">
        {CATEGORIAS.map((c) => {
          const ruta = `/category/${c.slug}`;
          const key = `cat:${c.slug}`;
          const latest = catStats?.[c.slug]?.latestCreated;
          const promoCount = promos?.[c.slug]?.count || 0;

          return (
            <Link
              key={c.slug}
              to={ruta}
              className={`cats-tile ${c.img ? "" : "no-img"}`}
              onClick={() => markSeen(key)}
              style={c.img ? { backgroundImage: `url(${c.img})` } : undefined}
            >
              <span className="cats-tile__overlay" />
              <span className="cats-tile__label">{c.nombre}</span>
              {promoCount > 0 && <span className="cats-tile__pill">{promoCount}</span>}
              {hasUpdates(key, latest) && <span className="cats-tile__dot" aria-hidden="true" />}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
