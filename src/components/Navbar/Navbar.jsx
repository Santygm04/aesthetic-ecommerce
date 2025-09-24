import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../components/Navbar/Navbar.css";
import { useCart } from "../Carrito/CartContext";
import { FaShoppingCart, FaHome, FaThLarge, FaTags, FaSearch, FaEllipsisH } from "react-icons/fa";
import NavbarSearch from "../../components/NavbarSearch/NavbarSearch";
import OrdersNavLink from "./OrdersNavLink.jsx";

// ICONOS
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

export default function Navbar() {
  const { cart } = useCart();
  const cartCount = cart.reduce((s, p) => s + (p.cantidad || 1), 0);

  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isLenOpen, setIsLenOpen] = useState(false);
  const ddRef = useRef(null);

  // sheets móviles
  const [catSheetOpen, setCatSheetOpen] = useState(false);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  // abrir drawer sólo con buscador
  const [searchOnlyOpen, setSearchOnlyOpen] = useState(false);
  const navToggleRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const drawerRef = useRef(null); // referencia al drawer para detectar click fuera

  const nav = useNavigate();

  const toggleCats = () => setIsCatOpen((v) => !v);
  const toggleLen = () => setIsLenOpen((v) => !v);
  const closeAll = () => {
    setIsCatOpen(false);
    setIsLenOpen(false);
  };

  // helper: cerrar por completo el drawer de búsqueda
  const closeSearchDrawer = () => {
    setSearchOnlyOpen(false);
    if (navToggleRef.current) navToggleRef.current.checked = false;
    closeAll();
  };

  useEffect(() => {
    const handleDocClick = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) closeAll();
    };

    const handleKey = (e) => {
      if (e.key === "Escape") {
        closeAll();
        setCatSheetOpen(false);
        setMoreSheetOpen(false);
        setSearchOnlyOpen(false);
        if (navToggleRef.current) navToggleRef.current.checked = false;
      }
    };

    // cerrar el drawer si se hace tap/click FUERA del drawer
    const closeSearchIfOutside = (e) => {
      const isOpen = !!navToggleRef.current?.checked;
      if (!isOpen) return;
      if (drawerRef.current?.contains(e.target)) return; // dentro del drawer, no cierro
      closeSearchDrawer();
    };

    document.addEventListener("click", handleDocClick);
    document.addEventListener("keydown", handleKey);
    document.addEventListener("pointerdown", closeSearchIfOutside);

    return () => {
      document.removeEventListener("click", handleDocClick);
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("pointerdown", closeSearchIfOutside);
    };
  }, []);

  // abrir drawer y enfocar input del buscador (móvil) SOLO desde el botón "Buscar"
  const openSearchDrawer = () => {
    setSearchOnlyOpen(true);
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch {}
    if (navToggleRef.current) navToggleRef.current.checked = true;
    setTimeout(() => mobileSearchRef.current?.focus?.(), 160);
  };

  // items para el sheet rápido de categorías
  const CAT_ITEMS = [
    { name: "Skincare", slug: "skincare", icon: skincare },
    { name: "Bodycare", slug: "bodycare", icon: bodycare },
    { name: "Maquillaje", slug: "maquillaje", icon: maquillaje },
    { name: "Uñas", slug: "uñas", icon: unas },
    { name: "Pestañas", slug: "pestañas", icon: pestanas },
    { name: "Peluquería", slug: "peluquería", icon: peluqueria },
    { name: "Bijouterie", slug: "bijouteria", icon: bijouteria },
    { name: "Marroquinería", slug: "marroquineria", icon: carteras },
    { name: "Lencería", slug: "lenceria", icon: lenceria },
    { name: "Nuevos ingresos", slug: "nuevos-ingresos", icon: nuevosIngresos },
  ];

  const goCat = (slug) => {
    setCatSheetOpen(false);
    nav(`/category/${encodeURIComponent(slug)}`);
  };

  return (
    <nav className="navbar">
      {/* logo que navega al inicio */}
      <NavLink to="/" className="navbar-logo brand-script">AESTHETIC</NavLink>

      {/* Toggle + Hamburguesa + Overlay */}
      <input
        id="nav-toggle"
        ref={navToggleRef}
        className="nav-toggle"
        type="checkbox"
        aria-hidden="true"
        onChange={(e)=>{ if(!e.target.checked) setSearchOnlyOpen(false); }}
      />

      {/* HAMBURGUESA INACTIVA (abrís sólo con el botón Buscar) */}
      <label
        htmlFor="nav-toggle"
        className="hamb"
        aria-label="Menú"
        aria-controls="main-menu"
        onMouseDown={(e)=> e.preventDefault()}
        onClick={(e)=> { e.preventDefault(); e.stopPropagation(); }}
        onKeyDown={(e)=> { if(e.key === "Enter" || e.key === " "){ e.preventDefault(); } }}
        title="Usá el botón Buscar para abrir la búsqueda"
      />

      {/* overlay: cierra al tocar fuera */}
      <label
        htmlFor="nav-toggle"
        className="nav-overlay"
        aria-hidden="true"
        onClick={closeSearchDrawer}
      />

      <ul
        ref={drawerRef}
        className={`navbar-links${searchOnlyOpen ? " search-only" : ""}`}
        id="main-menu"
      >
        {/* Cerrar dentro del drawer (solo móvil/tablet) */}
        <li className="nav-close-li">
          <button
            type="button"
            className="nav-close-btn"
            title="Cerrar"
            onClick={closeSearchDrawer}
          >
            ✕
          </button>
        </li>

        {/* buscador dentro del drawer / en desktop queda igual */}
        <li className="nav-search">
          <NavbarSearch inputRef={mobileSearchRef} />
        </li>

        {/* resto del menú (se ocultan automáticamente en móvil si search-only) */}
        <li>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Inicio
          </NavLink>
        </li>
        <li>
          <NavLink to="/nosotros" className={({ isActive }) => (isActive ? "active" : "")}>
            Nosotros
          </NavLink>
        </li>
        <li>
          <NavLink to="/promos" className={({ isActive }) => (isActive ? "active" : "")}>
            Promos
          </NavLink>
        </li>

        {/* === Mis pedidos (desktop & drawer) === */}
        <li>
          <OrdersNavLink />
        </li>

        {/* Dropdown de categorías (header / desktop) */}
        <li className={`dropdown ${isCatOpen ? "open" : ""}`} ref={ddRef}>
          <button
            type="button"
            className="dropdown-title"
            onClick={(e) => { e.stopPropagation(); toggleCats(); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCats(); }
            }}
            aria-haspopup="true"
            aria-expanded={isCatOpen}
          >
            Categorías <span className={`caret ${isCatOpen ? "rot" : ""}`}>▾</span>
          </button>

          <ul className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
            <li>
              <NavLink onClick={closeAll} to="/category/skincare">
                Skincare <img src={skincare} className="img-icon" alt="" />
              </NavLink>
            </li>
            <li>
              <NavLink onClick={closeAll} to="/category/bodycare">
                Bodycare <img src={bodycare} className="img-icon" alt="" />
              </NavLink>
            </li>
            <li>
              <NavLink onClick={closeAll} to="/category/maquillaje">
                Maquillaje <img src={maquillaje} className="img-icon" alt="" />
              </NavLink>
            </li>
            <li>
              <NavLink onClick={closeAll} to="/category/uñas">
                Uñas <img src={unas} className="img-icon" alt="" />
              </NavLink>
            </li>
            <li>
              <NavLink onClick={closeAll} to="/category/pestañas">
                Pestañas <img src={pestanas} className="img-icon" alt="" />
              </NavLink>
            </li>
            <li>
              <NavLink onClick={closeAll} to="/category/peluquería">
                Peluquería <img src={peluqueria} className="img-icon" alt="" />
              </NavLink>
            </li>
            <li>
              <NavLink onClick={closeAll} to="/category/bijouteria">
                Bijouteria <img src={bijouteria} className="img-icon" alt="" />
              </NavLink>
            </li>
            <li>
              <NavLink onClick={closeAll} to="/category/marroquineria">
                Marroquineria <img src={carteras} className="img-icon" alt="" />
              </NavLink>
            </li>

            <li className="menu-divider" />

            <li className={`menu-section ${isLenOpen ? "open" : ""}`}>
              <button
                type="button"
                className="section-head"
                onClick={(e) => { e.stopPropagation(); toggleLen(); }}
              >
                <img src={lenceria} className="img-icon" alt="" />
                <span>Lencería / Ropa interior</span>
                <span className={`chev ${isLenOpen ? "rot" : ""}`}>▾</span>
              </button>

              <div className="submenu-grid">
                <NavLink onClick={closeAll} to="/category/lenceria">Ver todo</NavLink>
                <NavLink onClick={closeAll} to="/category/lenceria/conjuntos">Conjuntos</NavLink>
                <NavLink onClick={closeAll} to="/category/lenceria/tops-y-corpiños">Tops y corpiños</NavLink>
                <NavLink onClick={closeAll} to="/category/lenceria/vedetinas">Vedetinas</NavLink>
                <NavLink onClick={closeAll} to="/category/lenceria/colales">Colales</NavLink>
                <NavLink onClick={closeAll} to="/category/lenceria/boxer">Boxer</NavLink>
                <NavLink onClick={closeAll} to="/category/lenceria/slip">Slip</NavLink>
                <NavLink onClick={closeAll} to="/category/lenceria/niña">Niña</NavLink>
                <NavLink onClick={closeAll} to="/category/lenceria/medias">Medias</NavLink>
              </div>
            </li>

            <li className="menu-divider" />

            <li>
              <NavLink onClick={closeAll} to="/category/nuevos-ingresos">
                Nuevos ingresos <img src={nuevosIngresos} className="img-icon" alt="" />
              </NavLink>
            </li>
          </ul>
        </li>

        <li>
          <NavLink to="/contacto" className={({ isActive }) => (isActive ? "active" : "")}>
            Contacto
          </NavLink>
        </li>

        <li>
          <NavLink to="/carrito" className={({ isActive }) => (isActive ? "active cart-link" : "cart-link")}>
            <span className="cart-icon-wrapper">
              <FaShoppingCart size={22} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </span>
          </NavLink>
        </li>
      </ul>

      {/* ===== Tab bar inferior móvil ===== */}
      <div className="mobile-tabbar">
        <NavLink to="/" className={({isActive}) => "tab-btn" + (isActive ? " is-active" : "")}>
          <FaHome />
          <span>Inicio</span>
        </NavLink>

        <button
          type="button"
          className="tab-btn"
          onClick={(e)=>{ e.stopPropagation(); openSearchDrawer(); }}
        >
          <FaSearch />
          <span>Buscar</span>
        </button>

        {/* === Carrito AL MEDIO === */}
        <NavLink to="/carrito" className={({isActive}) => "tab-btn cart" + (isActive ? " is-active" : "")}>
          <span className="cart-icon-wrapper">
            <FaShoppingCart />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </span>
          <span>Carrito</span>
        </NavLink>
        {/* ===================== */}

        {/* Categorías */}
        <button type="button" className="tab-btn" onClick={() => setCatSheetOpen(true)}>
          <FaThLarge />
          <span>Categorías</span>
        </button>

        {/* Promos */}
        <NavLink to="/promos" className={({isActive}) => "tab-btn" + (isActive ? " is-active" : "")}>
          <FaTags />
          <span>Promos</span>
        </NavLink>

        {/* Más */}
        <button type="button" className="tab-btn" onClick={() => setMoreSheetOpen(true)}>
          <FaEllipsisH />
          <span>Más</span>
        </button>
      </div>

      {/* ==== Bottom Sheet de categorías (móvil) ==== */}
      <div
        className={`cat-sheet-overlay ${catSheetOpen ? "open" : ""}`}
        onClick={() => setCatSheetOpen(false)}
      />
      <div className={`cat-sheet ${catSheetOpen ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Elegí una categoría">
        <div className="cat-sheet-handle" />
        <div className="cat-sheet-title">Categorías</div>
        <div className="cat-sheet-grid">
          {CAT_ITEMS.map(c => (
            <button key={c.slug} type="button" className="cat-sheet-item" onClick={() => goCat(c.slug)}>
              <img src={c.icon} alt="" />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
        <button type="button" className="cat-sheet-all" onClick={() => { setCatSheetOpen(false); nav("/category"); }}>
          Ver todas las categorías
        </button>
      </div>

      {/* ==== Bottom Sheet “Más” (Nosotros / Contacto / Mis pedidos) ==== */}
      <div
        className={`more-sheet-overlay ${moreSheetOpen ? "open" : ""}`}
        onClick={() => setMoreSheetOpen(false)}
      />
      <div className={`more-sheet ${moreSheetOpen ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Más opciones">
        <div className="cat-sheet-handle" />
        <div className="cat-sheet-title">Más</div>
        <div className="more-sheet-grid">
          <button type="button" className="more-sheet-item" onClick={() => { setMoreSheetOpen(false); nav("/nosotros"); }}>
            <span>Nosotros</span>
          </button>
          <button type="button" className="more-sheet-item" onClick={() => { setMoreSheetOpen(false); nav("/contacto"); }}>
            <span>Contacto</span>
          </button>
          <button type="button" className="more-sheet-item" onClick={() => { setMoreSheetOpen(false); nav("/pedidos"); }}>
            <span>Mis pedidos</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
