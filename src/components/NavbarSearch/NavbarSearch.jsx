import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import api from "../../utils/api";
import "../../components/NavbarSearch/NavbarSearch.css";

/* Íconos */
import skincare from "../../../assets/iconos/skincare.png";
import bodycare from "../../../assets/iconos/bodycare.png";
import maquillaje from "../../../assets/iconos/maquillaje.png";
import unas from "../../../assets/iconos/uñas.png";
import pestanas from "../../../assets/iconos/pestañas.png";
import peluqueria from "../../../assets/iconos/peluqueria.png";
import bijouteria from "../../../assets/iconos/bijouteria.png";
import lenceria from "../../../assets/iconos/lenceria.png";
import carteras from "../../../assets/iconos/carteras.png";
import nuevosIngresos from "../../../assets/iconos/nuevosI.png";

const QUICK_CATS = [
  { name: "Skincare",        slug: "skincare",       icon: skincare },
  { name: "Bodycare",        slug: "bodycare",       icon: bodycare },
  { name: "Maquillaje",      slug: "maquillaje",     icon: maquillaje },
  { name: "Uñas",            slug: "uñas",           icon: unas },
  { name: "Pestañas",        slug: "pestañas",       icon: pestanas },
  { name: "Peluquería",      slug: "peluquería",     icon: peluqueria },
  { name: "Bijouterie",      slug: "bijouterie",     icon: bijouteria },
  { name: "Marroquinería",   slug: "marroquineria",  icon: carteras },
  { name: "Lencería",        slug: "lenceria",       icon: lenceria },
  { name: "Nuevos ingresos", slug: "nuevos-ingresos",icon: nuevosIngresos },
];

const SUBCATS = {
  lenceria: [
    { name: "Ver todo",        slug: "" },
    { name: "Conjuntos",       slug: "conjuntos" },
    { name: "Tops y corpiños", slug: "tops-y-corpiños" },
    { name: "Vedetinas",       slug: "vedetinas" },
    { name: "Colales",         slug: "colales" },
    { name: "Boxer",           slug: "boxer" },
    { name: "Slip",            slug: "slip" },
    { name: "Niña",            slug: "niña" },
    { name: "Medias",          slug: "medias" },
  ],
};

export default function NavbarSearch({ inputRef }) {
  const [q, setQ] = useState("");
  const [sug, setSug] = useState([]);
  const [focused, setFocused] = useState(false);
  const [openCat, setOpenCat] = useState(null);
  const nav = useNavigate();
  const boxRef = useRef(null);

  // sugerencias cuando hay texto
  useEffect(() => {
    if (!q.trim()) { setSug([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get("/api/productos/suggest", {
          params: { q, limit: 8 }, signal: ctrl.signal
        });
        setSug(Array.isArray(data) ? data : []);
      } catch {}
    }, 180);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  // cerrar al click fuera
  useEffect(() => {
    const onClickOutside = (e) => {
      if (!boxRef.current?.contains(e.target)) {
        setFocused(false);
        setSug([]);
        setOpenCat(null);
      }
    };
    window.addEventListener("click", onClickOutside);
    return () => window.removeEventListener("click", onClickOutside);
  }, []);

  const goSearch = (term) => {
    const t = (term ?? q).trim();
    if (!t) return;
    setSug([]); setFocused(false); setOpenCat(null);
    nav(`/buscar?q=${encodeURIComponent(t)}`);
  };

  const goCategory = (slug) => {
    setSug([]); setFocused(false); setOpenCat(null);
    nav(`/category/${encodeURIComponent(slug)}`);
  };

  const goSub = (cat, sub) => {
    setSug([]); setFocused(false); setOpenCat(null);
    if (sub) nav(`/category/${encodeURIComponent(cat)}/${encodeURIComponent(sub)}`);
    else nav(`/category/${encodeURIComponent(cat)}`);
  };

  const onCatClick = (slug) => {
    if (SUBCATS[slug]) setOpenCat((curr) => (curr === slug ? null : slug));
    else goCategory(slug);
  };

  const showQuickCats = focused && q.trim() === "" && sug.length === 0;

  return (
    <div className="search-wrap" ref={boxRef}>
      <input
        ref={inputRef}
        className="search-input"
        value={q}
        onChange={(e)=> { setQ(e.target.value); setOpenCat(null); }}
        onFocus={() => setFocused(true)}
        onKeyDown={(e)=> e.key === "Enter" && goSearch()}
        placeholder="Buscar productos…"
        aria-label="Buscar productos"
      />

      {/* 🔍 Botón de lupita */}
      <button
        type="button"
        className="search-btn"
        aria-label="Buscar"
        onClick={() => goSearch()}
      >
        <FaSearch size={14} />
      </button>

      {/* Autocomplete por texto */}
      {focused && q.trim() !== "" && !!sug.length && (
        <ul className="suggest">
          {sug.map((s, i)=>(
            <li key={i}>
              <button type="button" onClick={()=> goSearch(s)}>{s}</button>
            </li>
          ))}
        </ul>
      )}

      {/* Panel de categorías rápidas */}
      {showQuickCats && (
        <div className="search-quick">
          <div className="sq-head">Explorar categorías</div>

          <div className="sq-grid">
            {QUICK_CATS.map(c => (
              <button
                key={c.slug}
                type="button"
                className={`sq-item ${openCat === c.slug ? "is-active" : ""}`}
                onClick={() => onCatClick(c.slug)}
                title={c.name}
              >
                <img src={c.icon} alt="" />
                <span className="sq-name">{c.name}</span>
              </button>
            ))}
          </div>

          {!!openCat && SUBCATS[openCat] && (
            <div className="sq-subcats">
              <div className="sq-subhead">
                {QUICK_CATS.find(x=>x.slug===openCat)?.name}
              </div>
              <div className="sq-subgrid">
                {SUBCATS[openCat].map(sc => (
                  <button
                    key={sc.slug || "all"}
                    type="button"
                    className={`sq-subitem ${!sc.slug ? "all" : ""}`}
                    onClick={() => goSub(openCat, sc.slug)}
                  >
                    {sc.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            className="sq-all"
            onClick={() => { setFocused(false); setOpenCat(null); nav("/category"); }}
          >
            Ver todas las categorías
          </button>
        </div>
      )}
    </div>
  );
}
