// src/pages/Categories/Categories.jsx
import { Link } from "react-router-dom";
import "../../pages/Categories/Categories.css";
import lenceriaIcon from "../../../assets/iconos/lenceria.png";
import section from "../../../assets/iconos/section.png";
import novedades from "../../../assets/iconos/novedades.png";

// NEW: badges
import useCatalogStats from "../../hooks/useCatalogStats";
import { hasUpdates, markSeen } from "../../utils/seen";

const categorias = [
  // 👉 Secciones primero
  {
    titulo: "Secciones",
    icono: section,
    rutas: [
      { nombre: "Skincare", ruta: "/category/skincare" },
      { nombre: "Maquillaje", ruta: "/category/maquillaje" },
      { nombre: "Uñas", ruta: "/category/uñas" },
      { nombre: "Pestañas", ruta: "/category/pestañas" },
      { nombre: "Bijouteria", ruta: "/category/bijouteria" },
      { nombre: "Bodycare", ruta: "/category/bodycare" },
      { nombre: "Marroquineria", ruta: "/category/marroquineria" },
      { nombre: "Peluqueria", ruta: "/category/peluquería" }
    ]
  },
  // 👉 Lencería después
  {
    titulo: "Lencería / Ropa interior",
    icono: lenceriaIcon,
    rutas: [
      { nombre: "Ver todo", ruta: "/category/lenceria" },
      { nombre: "Conjuntos", ruta: "/category/lenceria/conjuntos" },
      { nombre: "Tops y corpiños", ruta: "/category/lenceria/tops-y-corpiños" },
      { nombre: "Vedetinas", ruta: "/category/lenceria/vedetinas" },
      { nombre: "Colales", ruta: "/category/lenceria/colales" },
      { nombre: "Boxer", ruta: "/category/lenceria/boxer" },
      { nombre: "Slip", ruta: "/category/lenceria/slip" },
      { nombre: "Niña", ruta: "/category/lenceria/niña" },
      { nombre: "Medias", ruta: "/category/lenceria/medias" }
    ]
  },
  // 👉 Nuevos ingresos al final
  {
    titulo: "Nuevos ingresos",
    icono: novedades,
    rutas: [{ nombre: "Nuevos ingresos", ruta: "/category/nuevos-ingresos" }]
  }
];

const slugFromRuta = (ruta) => {
  try {
    const parts = ruta.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "category");
    if (idx >= 0 && parts[idx + 1]) {
      return decodeURIComponent(parts[idx + 1]).toLowerCase();
    }
  } catch {}
  return "";
};

export default function Categories() {
  const { stats } = useCatalogStats();
  const catStats = stats?.catStats || {};
  const promos = stats?.promosByCat || {};
  const nuevos = stats?.nuevos || { count: 0, latest: null };

  return (
    <section className="category-section">
      <h2 className="category-title">Categorías</h2>
      <p className="category-subtitle">
        Explorá nuestras secciones: lencería, skincare, bijouterie, y más.
      </p>

      <div className="categories-grid">
        {categorias.map((cat) => (
          <div className="category-card" key={cat.titulo}>
            <img className="category-card-img" src={cat.icono} alt={cat.titulo} />
            <h3>
              {cat.titulo}
              {cat.titulo.toLowerCase().includes("nuevos ingresos") && (
                <>
                  {nuevos?.count > 0 && <span className="badge-pill hot">{nuevos.count}</span>}
                  {hasUpdates("nuevos", nuevos?.latest) && <span className="badge-dot" />}
                </>
              )}
            </h3>

            <ul>
              {cat.rutas.map((sub) => {
                const slug = slugFromRuta(sub.ruta);
                const isNuevos = slug === "nuevos-ingresos";
                const key = isNuevos ? "nuevos" : `cat:${slug}`;
                const latest = isNuevos ? nuevos?.latest : catStats?.[slug]?.latestCreated;
                const promoCount = isNuevos ? 0 : (promos?.[slug]?.count || 0);

                return (
                  <li key={sub.nombre}>
                    <Link to={sub.ruta} onClick={() => markSeen(key)}>
                      {sub.nombre}
                      {!isNuevos && promoCount > 0 && (
                        <span className="badge-pill deal">{promoCount}</span>
                      )}
                      {hasUpdates(key, latest) && <span className="badge-dot" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
